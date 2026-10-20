import { describe, it, expect } from 'vitest';
import {
  parseTime,
  toTime,
  formatTime12h,
  blockKey,
  intervalsOverlap,
  groupByBlock,
  buildTimeRows,
  isTutorAvailable,
  filterSchedules,
  tutorWeeklyHours,
  popularBlocks,
  tutorColor,
} from '@/lib/schedule';

const rows = [
  { schedule_id: 1, day: 'Monday', start_time: '09:00:00', end_time: '11:00:00', tutor_name: 'Jane Doe', tutor_id: 'KU001', id: 7, tutor_major: 'Mathematics' },
  { schedule_id: 2, day: 'Tuesday', start_time: '09:00:00', end_time: '11:00:00', tutor_name: 'Jane Doe', tutor_id: 'KU001', id: 7, tutor_major: 'Mathematics' },
  { schedule_id: 3, day: 'Monday', start_time: '14:00:00', end_time: '16:00:00', tutor_name: 'John Smith', tutor_id: 'KU002', id: 8, tutor_major: 'Physics' },
];

describe('time helpers', () => {
  it('parses HH:MM:SS and HH:MM into minutes', () => {
    expect(parseTime('09:30:00')).toBe(570);
    expect(parseTime('09:30')).toBe(570);
    expect(parseTime('')).toBe(0);
    expect(parseTime(null)).toBe(0);
  });

  it('formats minutes to a zero-padded clock', () => {
    expect(toTime(570)).toBe('09:30');
    expect(toTime(1439)).toBe('23:59');
  });

  it('formats a 24h time as 12h with AM/PM', () => {
    expect(formatTime12h('09:00:00')).toBe('9:00 AM');
    expect(formatTime12h('12:15:00')).toBe('12:15 PM');
    expect(formatTime12h('23:45:00')).toBe('11:45 PM');
    expect(formatTime12h('00:00:00')).toBe('12:00 AM');
  });

  it('builds a stable block key', () => {
    expect(blockKey({ start_time: '09:00', end_time: '11:00' })).toBe('09:00-11:00');
  });

  it('detects interval overlap but not adjacent ranges', () => {
    expect(intervalsOverlap('09:00', '11:00', '10:00', '12:00')).toBe(true);
    expect(intervalsOverlap('09:00', '11:00', '11:00', '12:00')).toBe(false);
    expect(intervalsOverlap('09:00', '11:00', '07:00', '09:00')).toBe(false);
  });
});

describe('groupByBlock', () => {
  it('groups repeated intervals across days and sorts days Mon-Sun', () => {
    const blocks = groupByBlock(rows);
    expect(blocks).toHaveLength(2);
    const morning = blocks.find((b) => b.start_time === '09:00:00');
    expect(morning.days).toEqual(['Monday', 'Tuesday']);
  });
});

describe('buildTimeRows', () => {
  it('returns sorted distinct intervals', () => {
    const timeRows = buildTimeRows(rows);
    expect(timeRows).toHaveLength(2);
    expect(timeRows[0].start).toBe('09:00:00');
    expect(timeRows[1].start).toBe('14:00:00');
  });

  it('collapses many fine-grained intervals into hourly slots', () => {
    const many = [];
    for (let h = 8; h < 16; h++) {
      for (const m of [0, 15, 30, 45]) {
        many.push({ day: 'Monday', start_time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`, end_time: `${String(h).padStart(2, '0')}:${String(m + 15).padStart(2, '0')}:00`, id: 1, schedule_id: h * 60 + m });
      }
    }
    const timeRows = buildTimeRows(many, { maxRows: 12 });
    expect(many).toHaveLength(32);
    expect(timeRows.length).toBeLessThan(many.length);
    expect(timeRows[0].start).toBe('08:00');
    expect(timeRows[1].start).toBe('09:00');
    expect(timeRows.length).toBeLessThanOrEqual(12);
  });
});

describe('isTutorAvailable', () => {
  it('matches a tutor on a day within the row interval', () => {
    expect(isTutorAvailable(rows, 7, 'Monday', { start: '09:00', end: '10:00' })).toBe(true);
    expect(isTutorAvailable(rows, 7, 'Wednesday', { start: '09:00', end: '10:00' })).toBe(false);
    expect(isTutorAvailable(rows, 8, 'Monday', { start: '09:00', end: '10:00' })).toBe(false);
  });
});

describe('filterSchedules', () => {
  const byId = new Map([[7, { id: 7, tutor_courses_names: 'Algebra, Geometry' }], [8, { id: 8, tutor_courses_names: 'Physics' }]]);

  it('keeps everything with empty filters', () => {
    expect(filterSchedules(rows, byId)).toHaveLength(3);
  });

  it('filters by major name', () => {
    expect(filterSchedules(rows, byId, { majors: ['Physics'] })).toHaveLength(1);
    expect(filterSchedules(rows, byId, { majors: ['Physics'] })[0].id).toBe(8);
  });

  it('filters by course name via the tutor', () => {
    const out = filterSchedules(rows, byId, { course: 'algebra' });
    expect(out).toHaveLength(2);
    expect(out.every((s) => s.id === 7)).toBe(true);
  });

  it('filters by search across tutor name and courses', () => {
    expect(filterSchedules(rows, byId, { search: 'john' })).toHaveLength(1);
    expect(filterSchedules(rows, byId, { search: 'geometry' })).toHaveLength(2);
  });

  it('filters by the selected availability window', () => {
    expect(filterSchedules(rows, byId, { blockStart: '15:00', blockEnd: '17:00' })).toHaveLength(1);
    expect(filterSchedules(rows, byId, { blockStart: '11:00', blockEnd: '13:00' })).toHaveLength(0);
  });

  it('keeps tutors without a major when major filter is empty', () => {
    const noMajor = [{ ...rows[0], tutor_major: null }];
    expect(filterSchedules(noMajor, byId, { majors: [] })).toHaveLength(1);
    expect(filterSchedules(noMajor, byId, { majors: ['Physics'] })).toHaveLength(0);
  });
});

describe('tutorWeeklyHours', () => {
  it('sums unique day/interval hours per tutor', () => {
    expect(tutorWeeklyHours(rows, 7)).toBe(4);
    expect(tutorWeeklyHours(rows, 8)).toBe(2);
  });
});

describe('popularBlocks', () => {
  it('ranks intervals by distinct tutor count', () => {
    const blocks = popularBlocks(rows, { limit: 5 });
    expect(blocks[0]).toMatchObject({ start_time: '09:00:00', end_time: '11:00:00', tutorCount: 1 });
    expect(blocks).toHaveLength(2);
  });
});

describe('tutorColor', () => {
  it('is deterministic per seed', () => {
    expect(tutorColor('7')).toBe(tutorColor('7'));
  });
});