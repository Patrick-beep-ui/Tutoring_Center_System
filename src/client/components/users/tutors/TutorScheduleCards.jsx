import { useMemo, memo } from "react";
import { Link } from "react-router-dom";
import { DAY_ORDER, formatTime12h, tutorColor, tutorWeeklyHours } from "@/lib/schedule";

const TutorScheduleCards = ({ schedules }) => {
    const tutors = useMemo(() => {
        const byTutor = new Map();

        (schedules || []).forEach((schedule) => {
            const id = String(schedule.id);
            if (!byTutor.has(id)) {
                byTutor.set(id, { ...schedule, schedules: [] });
            }
            byTutor.get(id).schedules.push(schedule);
        });

        return [...byTutor.values()]
            .map((tutor) => ({
                ...tutor,
                weeklyHours: tutorWeeklyHours(tutor.schedules, tutor.id),
                schedules: tutor.schedules.slice().sort((a, b) =>
                    DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
                    || String(a.start_time).localeCompare(String(b.start_time))
                )
            }))
            .sort((a, b) => String(a.tutor_name || "").localeCompare(String(b.tutor_name || "")));
    }, [schedules]);

    if (tutors.length === 0) {
        return (
            <div className="mx-5 mt-2.5 rounded-[10px] border border-dashed border-[#ccc] bg-white px-5 py-12 text-center">
                <p className="mb-1 text-[15px] font-semibold text-[#444]">No matching schedules</p>
                <p className="m-0 text-[13px] text-[#888]">Try widening the filters above to see more tutors.</p>
            </div>
        );
    }

    return (
        <div className="mx-5 mt-2.5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {tutors.map((tutor) => (
                <article key={tutor.id} className="overflow-hidden rounded-[10px] border border-[#ddd] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                    <div className="flex items-start justify-between gap-3 border-b border-[#eee] px-4 py-3.5">
                        <Link to={`/profile/tutor/${tutor.id}`} className="flex min-w-0 items-center gap-2.5 hover:text-[#0a84ff]">
                            <span className="h-9 w-1 shrink-0 rounded-full" style={{ backgroundColor: tutorColor(tutor.id) }}></span>
                            <div className="min-w-0">
                                <h2 className="m-0 truncate text-[15px] font-bold text-[#222]">{tutor.tutor_name}</h2>
                                <p className="m-0 truncate text-[12px] text-[#777]">{tutor.tutor_major || "Major not listed"}</p>
                            </div>
                        </Link>
                        <span className="shrink-0 rounded-full bg-[#eff6ff] px-2 py-1 text-[11px] font-semibold text-[#0a84ff]">
                            {tutor.weeklyHours.toFixed(1)} hrs
                        </span>
                    </div>

                    <div className="px-4 py-3.5">
                        {tutor.tutor_courses_names && (
                            <p className="mb-3 line-clamp-2 text-[12px] leading-relaxed text-[#666]" title={tutor.tutor_courses_names}>
                                <span className="font-semibold text-[#444]">Courses: </span>{tutor.tutor_courses_names}
                            </p>
                        )}
                        <div className="space-y-2">
                            {tutor.schedules.map((schedule) => (
                                <div key={schedule.schedule_id ?? `${schedule.day}-${schedule.start_time}-${schedule.end_time}`} className="flex items-center justify-between gap-3 rounded-md bg-[#f8fafc] px-3 py-2 text-[12px]">
                                    <span className="font-semibold text-[#444]">{schedule.day.slice(0, 3)}</span>
                                    <span className="whitespace-nowrap text-[#666]">
                                        {formatTime12h(schedule.start_time)} - {formatTime12h(schedule.end_time)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
};

export default memo(TutorScheduleCards);
