import { useMemo, memo } from "react";
import { Link } from "react-router-dom";
import { DAY_ORDER, formatTime12h, tutorColor } from "@/lib/schedule";

const TutorScheduleGrid = ({ schedules, timeRows }) => {

    const { dayTutors, tutorsInGrid } = useMemo(() => {
        const days = {};
        const tutorByIds = new Map();
        (schedules || []).forEach((s) => {
            if (!days[s.day]) days[s.day] = new Set();
            days[s.day].add(String(s.id));
            if (!tutorByIds.has(String(s.id))) tutorByIds.set(String(s.id), s);
        });
        return { dayTutors: days, tutorsInGrid: [...tutorByIds.values()] };
    }, [schedules]);

    const tutorsFor = (row, day) => (schedules || []).filter(
        (s) => s.day === day && row.start && isOverlapping(s, row)
    );

    const isOverlapping = (s, row) => {
        const aStart = toMin(s.start_time);
        const aEnd = toMin(s.end_time);
        const bStart = toMin(row.start);
        const bEnd = toMin(row.end);
        return aStart < bEnd && bStart < aEnd;
    };

    const toMin = (v) => {
        const [h = 0, m = 0] = String(v || "").split(":").map(Number);
        return h * 60 + (m || 0);
    };

    if ((schedules || []).length === 0 || timeRows.length === 0) {
        return (
            <div className="mx-5 mt-2.5 rounded-[10px] border border-dashed border-[#ccc] bg-white px-5 py-12 text-center">
                <p className="mb-1 text-[15px] font-semibold text-[#444]">No matching schedules</p>
                <p className="m-0 text-[13px] text-[#888]">
                    Try widening the filters above to see more tutors.
                </p>
            </div>
        );
    }

    return (
        <div className="mx-5 mt-2.5">
            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#666]">Legend</span>
                {tutorsInGrid.slice(0, 40).map((s) => (
                    <Link
                        key={s.id}
                        to={`/profile/tutor/${s.id}`}
                        className="flex items-center gap-1.5 text-[12px] text-[#555] hover:text-[#0a84ff]"
                        title={tooltipOf(s)}
                    >
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tutorColor(s.id) }}></span>
                        {s.tutor_name}
                    </Link>
                ))}
            </div>

            <div className="overflow-x-auto rounded-[10px] border border-[#ddd] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <table className="w-full border-collapse text-[13px]">
                    <thead className="bg-gray-900 text-white">
                        <tr>
                            <th className="sticky left-0 z-10 min-w-[120px] border-r border-gray-700 bg-gray-900 px-3 py-2.5 text-left text-[12px] font-semibold uppercase tracking-wide">
                                Time
                            </th>
                            {DAY_ORDER.map((day) => (
                                <th key={day} className="min-w-[150px] border-r border-gray-700 px-3 py-2.5 text-left text-[12px] font-semibold uppercase tracking-wide last:border-r-0">
                                    <div>{day.slice(0, 3)}</div>
                                    <div className="text-[11px] font-normal text-gray-400">
                                        {(dayTutors[day]?.size || 0)} tutor{(dayTutors[day]?.size || 0) === 1 ? "" : "s"}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeRows.map((row, ri) => (
                            <tr key={`${row.start}-${row.end}`} className={ri % 2 ? "bg-gray-100/60" : "bg-white"}>
                                <td className="sticky left-0 z-10 border-r border-[#e5e7eb] bg-[#fafafa] px-3 py-2 text-[12px] font-medium whitespace-nowrap text-[#555]">
                                    {formatTime12h(row.start)} – {formatTime12h(row.end)}
                                </td>
                                {DAY_ORDER.map((day) => {
                                    const tutors = tutorsFor(row, day);
                                    return (
                                        <td key={`${row.start}-${day}`} className="border-r border-[#eee] px-2 py-2 align-top last:border-r-0">
                                            {tutors.length > 0 && (
                                                <div className="flex flex-col gap-1">
                                                    {tutors.slice(0, 6).map((s) => (
                                                        <Link
                                                            key={s.schedule_id ?? `${s.id}-${day}-${row.start}`}
                                                            to={`/profile/tutor/${s.id}`}
                                                            className="flex items-center gap-1.5 rounded-[6px] border px-2 py-1 text-[12px] leading-tight text-white transition-opacity hover:opacity-85"
                                                            style={{ backgroundColor: tutorColor(s.id) }}
                                                            title={tooltipOf(s)}
                                                        >
                                                            <i className="bx bx-time-five text-[12px]"></i>
                                                            <span className="truncate">{s.tutor_name}</span>
                                                        </Link>
                                                    ))}
                                                    {tutors.length > 6 && (
                                                        <span className="px-1 text-[11px] text-[#888]">+{tutors.length - 6} more</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

function tooltipOf(s) {
    const parts = [];
    if (s.tutor_major) parts.push(s.tutor_major);
    if (s.tutor_courses_names) parts.push(s.tutor_courses_names);
    return `${s.tutor_name}${parts.length ? " — " + parts.join(" · ") : ""}`;
}

export default memo(TutorScheduleGrid);