import { useCallback, memo } from "react";

const STATUS_OPTIONS = [
    { value: "completed", label: "Completed" },
    { value: "scheduled", label: "Scheduled" },
    { value: "pending", label: "Pending" },
    { value: "canceled", label: "Canceled" },
];

const STATUS_STYLES = {
    completed: "border-[#00c522] text-[#00c522]",
    scheduled: "border-[#009dff] text-[#009dff]",
    pending: "border-orange-500 text-orange-500",
    canceled: "border-[#dc143c] text-[#dc143c]",
};

const STATUS_ACTIVE_STYLES = {
    completed: "bg-[#00c522] text-white",
    scheduled: "bg-[#009dff] text-white",
    pending: "bg-orange-500 text-white",
    canceled: "bg-[#dc143c] text-white",
};

const SessionFilters = ({ filters, onFilterChange, tutors, courses, resultCount, totalCount }) => {

    const handleSearchChange = useCallback((e) => {
        onFilterChange({ ...filters, search: e.target.value });
    }, [filters, onFilterChange]);

    const toggleStatus = useCallback((status) => {
        const current = filters.status;
        const next = current.includes(status)
            ? current.filter(s => s !== status)
            : [...current, status];
        onFilterChange({ ...filters, status: next });
    }, [filters, onFilterChange]);

    const handleTutorChange = useCallback((e) => {
        onFilterChange({ ...filters, tutor: e.target.value });
    }, [filters, onFilterChange]);

    const handleCourseChange = useCallback((e) => {
        onFilterChange({ ...filters, course: e.target.value });
    }, [filters, onFilterChange]);

    const handleDateFromChange = useCallback((e) => {
        onFilterChange({ ...filters, dateFrom: e.target.value });
    }, [filters, onFilterChange]);

    const handleDateToChange = useCallback((e) => {
        onFilterChange({ ...filters, dateTo: e.target.value });
    }, [filters, onFilterChange]);

    const handleSortChange = useCallback((e) => {
        onFilterChange({ ...filters, sortBy: e.target.value });
    }, [filters, onFilterChange]);

    const clearFilters = useCallback(() => {
        onFilterChange({
            search: "",
            status: [],
            tutor: "",
            course: "",
            dateFrom: "",
            dateTo: "",
            sortBy: "date-desc",
        });
    }, [onFilterChange]);

    const hasActiveFilters = filters.search || filters.status.length > 0 || filters.tutor || filters.course || filters.dateFrom || filters.dateTo;

    return (
        <div className="mx-5 mt-2.5 rounded-[10px] bg-white px-5 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] max-md:mx-2.5 max-md:p-3">
            <div className="flex flex-wrap items-end gap-3 max-md:flex-col max-md:items-stretch">
                <div className="relative min-w-[220px] flex-1 max-md:min-w-full">
                    <i className="bx bx-search absolute left-2.5 top-1/2 -translate-y-1/2 text-lg text-[#888]"></i>
                    <input
                        className="w-full rounded-md border border-[#ddd] py-2 pl-[34px] pr-3 text-[13px] outline-none transition-colors focus:border-[#0a84ff]"
                        type="text"
                        placeholder="Search tutor, student, course, topics..."
                        value={filters.search}
                        onChange={handleSearchChange}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#666]">Tutor</label>
                    <select className="min-w-[140px] cursor-pointer rounded-md border border-[#ddd] bg-white px-2.5 py-2 text-[13px] outline-none focus:border-[#0a84ff] max-md:min-w-full" value={filters.tutor} onChange={handleTutorChange}>
                        <option value="">All Tutors</option>
                        {tutors.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#666]">Course</label>
                    <select className="min-w-[140px] cursor-pointer rounded-md border border-[#ddd] bg-white px-2.5 py-2 text-[13px] outline-none focus:border-[#0a84ff] max-md:min-w-full" value={filters.course} onChange={handleCourseChange}>
                        <option value="">All Courses</option>
                        {courses.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#666]">From</label>
                    <input className="min-w-[140px] cursor-pointer rounded-md border border-[#ddd] bg-white px-2.5 py-2 text-[13px] outline-none focus:border-[#0a84ff] max-md:min-w-full" type="date" value={filters.dateFrom} onChange={handleDateFromChange} />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#666]">To</label>
                    <input className="min-w-[140px] cursor-pointer rounded-md border border-[#ddd] bg-white px-2.5 py-2 text-[13px] outline-none focus:border-[#0a84ff] max-md:min-w-full" type="date" value={filters.dateTo} onChange={handleDateToChange} />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#666]">Sort</label>
                    <select className="min-w-[140px] cursor-pointer rounded-md border border-[#ddd] bg-white px-2.5 py-2 text-[13px] outline-none focus:border-[#0a84ff] max-md:min-w-full" value={filters.sortBy} onChange={handleSortChange}>
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="rating-desc">Highest Rating</option>
                        <option value="rating-asc">Lowest Rating</option>
                        <option value="tutor-asc">Tutor A-Z</option>
                        <option value="tutor-desc">Tutor Z-A</option>
                    </select>
                </div>

                {hasActiveFilters && (
                    <button type="button" className="flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md border border-[#ddd] bg-[#f0f0f0] px-3.5 py-2 text-[13px] transition-colors hover:bg-[#e0e0e0]" onClick={clearFilters}>
                        <i className="bx bx-x"></i> Clear
                    </button>
                )}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            className={`cursor-pointer rounded-[20px] border-2 bg-white px-3.5 py-1.5 text-xs font-semibold transition-all ${STATUS_STYLES[opt.value]} ${filters.status.includes(opt.value) ? STATUS_ACTIVE_STYLES[opt.value] : ''}`}
                            onClick={() => toggleStatus(opt.value)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                <span className="whitespace-nowrap text-[13px] text-[#888]">
                    Showing {resultCount} of {totalCount} sessions
                </span>
            </div>
        </div>
    );
};

export default memo(SessionFilters);
