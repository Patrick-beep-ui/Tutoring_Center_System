export const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function parseTime(value) {
  if (value == null || value === "") return 0;
  const [h = 0, m = 0] = String(value).split(":").map(Number);
  return h * 60 + (m || 0);
}

export function toTime(minutes) {
  const h = String(Math.floor(minutes / 60) % 24).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
}

export function formatTime12h(value) {
  const minutes = parseTime(value);
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function blockKey(row) {
  return `${row.start_time}-${row.end_time}`;
}

export function intervalsOverlap(aStart, aEnd, bStart, bEnd) {
  return parseTime(aStart) < parseTime(bEnd) && parseTime(bStart) < parseTime(aEnd);
}

export function groupByBlock(schedules) {
  const grouped = {};
  for (const s of schedules || []) {
    const key = blockKey(s);
    if (!grouped[key]) {
      grouped[key] = { days: [], start_time: s.start_time, end_time: s.end_time };
    }
    if (!grouped[key].days.includes(s.day)) {
      grouped[key].days.push(s.day);
    }
  }
  return Object.values(grouped).map((block) => ({
    ...block,
    days: block.days.slice().sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b)),
  }));
}

export function buildTimeRows(schedules, { maxRows = 12 } = {}) {
  const intervals = new Map();
  for (const s of schedules || []) {
    const key = blockKey(s);
    if (!intervals.has(key)) {
      intervals.set(key, { start: s.start_time, end: s.end_time, startMinutes: parseTime(s.start_time) });
    }
  }
  const rows = [...intervals.values()].sort(
    (a, b) => a.startMinutes - b.startMinutes || parseTime(a.end) - parseTime(b.end)
  );
  if (rows.length <= maxRows) return rows;

  const min = rows[0].startMinutes;
  const last = rows[rows.length - 1];
  const max = last.startMinutes + (parseTime(last.end) - parseTime(last.start));
  const slots = [];
  for (let t = min; t < max; t += 60) {
    slots.push({ start: toTime(t), end: toTime(t + 60), startMinutes: t });
  }
  return slots;
}

export function isTutorAvailable(schedules, id, day, row) {
  return (schedules || []).some(
    (s) => String(s.id) === String(id) && s.day === day && intervalsOverlap(s.start_time, s.end_time, row.start, row.end)
  );
}

export function filterSchedules(schedules, tutorsById, { search = "", majors = [], course = "", blockStart = "", blockEnd = "" } = {}) {
  const majorSet = new Set(majors);
  const query = String(search || "").trim().toLowerCase();
  return (schedules || []).filter((s) => {
    if (majorSet.size && (!s.tutor_major || !majorSet.has(s.tutor_major))) return false;
    const tutor = tutorsById.has(Number(s.id)) ? tutorsById.get(Number(s.id)) : null;
    const courseNames = String(tutor?.tutor_courses_names || "").toLowerCase();
    if (course) {
      const wanted = String(course).trim().toLowerCase();
      if (!courseNames.split(/,\s*/).includes(wanted)) return false;
    }
    if (query) {
      const name = String(s.tutor_name || "").toLowerCase();
      if (!name.includes(query) && !courseNames.includes(query)) return false;
    }
    if (blockStart && blockEnd && !intervalsOverlap(s.start_time, s.end_time, blockStart, blockEnd)) return false;
    return true;
  });
}

export function tutorWeeklyHours(schedules, id) {
  const seen = new Set();
  let hours = 0;
  for (const s of schedules || []) {
    if (String(s.id) !== String(id)) continue;
    const key = `${s.day}|${blockKey(s)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    hours += (parseTime(s.end_time) - parseTime(s.start_time)) / 60;
  }
  return hours;
}

export function popularBlocks(schedules, { limit = 5 } = {}) {
  const counts = new Map();
  for (const s of schedules || []) {
    const key = blockKey(s);
    const rec = counts.get(key) || { start_time: s.start_time, end_time: s.end_time, tutors: new Set() };
    rec.tutors.add(String(s.id));
    counts.set(key, rec);
  }
  return [...counts.values()]
    .map((r) => ({ start_time: r.start_time, end_time: r.end_time, tutorCount: r.tutors.size }))
    .sort(
      (a, b) => b.tutorCount - a.tutorCount || parseTime(a.start_time) - parseTime(b.start_time)
    )
    .slice(0, limit);
}

const PALETTE = [
  "#192d64", "#eeaf32", "#2f7a3d", "#1e6e7a", "#35719a",
  "#4a4a9e", "#6b4bb0", "#a83e7e", "#96442e", "#5e5e5e",
];

export function tutorColor(seed) {
  let h = 0;
  for (const ch of String(seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

const srgbToLinear = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

export function tutorTextColor(seed) {
  const hex = tutorColor(seed);
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lum = 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
  const onWhite = 1.05 / (lum + 0.05);
  const onDark = (lum + 0.05) / 0.05;
  return onWhite >= onDark ? "#ffffff" : "#333333";
}