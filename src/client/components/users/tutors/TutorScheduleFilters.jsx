import { useCallback, memo } from "react";

const SELECT_CLS =
    "min-w-[140px] cursor-pointer rounded-md border border-[#ddd] bg-white px-2.5 py-2 text-[13px] outline-none focus:border-[#0a84ff] max-md:min-w-full";

const TutorScheduleFilters = ({
    filters,
    onFilterChange,
    majors,
    courses,
    timeOptions,
    popularBlocks,
    resultCount,
    totalCount,
}) => {

    const handleSearchChange = useCallback((e) => {
        onFilterChange({ ...filters, search: e.target.value });
    }, [filters, onFilterChange]);

    const toggleMajor = useCallback((majorName) => {
        const current = filters.majors;
        const next = current.includes(majorName)
            ? current.filter((m) => m !== majorName)
            : [...current, majorName];
        onFilterChange({ ...filters, majors: next });
    }, [filters, onFilterChange]);

    const handleCourseChange = useCallback((e) => {
        onFilterChange({ ...filters, course: e.target.value });
    }, [filters, onFilterChange]);

    const handleBlockStartChange = useCallback((e) => {
        onFilterChange({ ...filters, blockStart: e.target.value, blockEnd: filters.blockEnd || e.target.value });
    }, [filters, onFilterChange]);

    const handleBlockEndChange = useCallback((e) => {
        onFilterChange({ ...filters, blockEnd: e.target.value });
    }, [filters, onFilterChange]);

    const applyPopularBlock = useCallback((block) => {
        onFilterChange({ ...filters, blockStart: block.start_time, blockEnd: block.end_time });
    }, [filters, onFilterChange]);

    const clearFilters = useCallback(() => {
        onFilterChange({ search: "", majors: [], course: "", blockStart: "", blockEnd: "" });
    }, [onFilterChange]);

    const hasActiveFilters =
        filters.search || filters.majors.length > 0 || filters.course || filters.blockStart || filters.blockEnd;

    const activeBlock = filters.blockStart && filters.blockEnd
        ? popularBlocks.find((b) => filters.blockStart === b.value_start && filters.blockEnd === b.value_end)
        : null;

    return (
        <div className="mx-5 mt-2.5 rounded-[10px] bg-white px-5 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] max-md:mx-2.5 max-md:p-3">
            <div className="flex flex-wrap items-end gap-3 max-md:flex-col max-md:items-stretch">
                <div className="relative min-w-[220px] flex-1 max-md:min-w-full">
                    <i className="bx bx-search absolute left-2.5 top-1/2 -translate-y-1/2 text-lg text-[#888]"></i>
                    <input
                        className="w-full rounded-md border border-[#ddd] py-2 pl-[34px] pr-3 text-[13px] outline-none transition-colors focus:border-[#0a84ff]"
                        type="text"
                        placeholder="Search tutor name or course..."
                        value={filters.search}
                        onChange={handleSearchChange}
                    />
                </div>

                <div className="mt-3 flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#666]">Major</label>
                    <select className={SELECT_CLS} value={filters.majors[0] || ""} onChange={(e) => onFilterChange({ ...filters, majors: e.target.value ? [e.target.value] : [] })}>
                        <option value="">All Majors</option>
                        {majors.map(({ major_name }) => (
                            <option key={major_name} value={major_name}>{major_name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#666]">Course</label>
                    <select className={SELECT_CLS} value={filters.course} onChange={handleCourseChange}>
                        <option value="">All Courses</option>
                        {courses.map((c) => (
                            <option key={c.course_name} value={c.course_name}>{c.course_name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#666]">From</label>
                    <select className={SELECT_CLS} value={filters.blockStart} onChange={handleBlockStartChange}>
                        <option value="">Any time</option>
                        {timeOptions.map((t) => (
                            <option key={`start-${t.value}`} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#666]">To</label>
                    <select className={SELECT_CLS} value={filters.blockEnd} onChange={handleBlockEndChange}>
                        <option value="">Any time</option>
                        {timeOptions.map((t) => (
                            <option key={`end-${t.value}`} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>

                {hasActiveFilters && (
                    <button type="button" className="flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md border border-[#ddd] bg-[#f0f0f0] px-3.5 py-2 text-[13px] transition-colors hover:bg-[#e0e0e0]" onClick={clearFilters}>
                        <i className="bx bx-x"></i> Clear
                    </button>
                )}
            </div>

            <div className="mt-5 flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#666]">Popular blocks:</span>
                    <br/>
                    {popularBlocks.map((b) => (
                        <button
                            key={`${b.value_start}-${b.value_end}`}
                            type="button"
                            className={`cursor-pointer rounded-[20px] border-2 px-3.5 py-1.5 text-xs font-semibold transition-all ${
                                activeBlock && activeBlock.value_start === b.value_start && activeBlock.value_end === b.value_end
                                    ? "border-[#16a34a] bg-[#16a34a] text-white"
                                    : "border-[#ddd] bg-white text-[#555] hover:bg-[#f0f0f0]"
                            }`}
                            onClick={() => applyPopularBlock(b)}
                        >
                            {b.label} · {b.tutorCount}
                        </button>
                    ))}
                </div>

                <span className="text-[13px] text-[#888] mt-3">
                    Showing {resultCount} of {totalCount} tutors with schedules
                </span>
            </div>
        </div>
    );
};

export default memo(TutorScheduleFilters);