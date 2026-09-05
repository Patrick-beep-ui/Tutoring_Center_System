import { useCallback, memo } from "react";

const STATUS_OPTIONS = [
    { value: "completed", label: "Completed" },
    { value: "scheduled", label: "Scheduled" },
    { value: "pending", label: "Pending" },
    { value: "canceled", label: "Canceled" },
];

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
        <div className="session-filters">
            <div className="filters-row">
                <div className="filter-search">
                    <i className="bx bx-search"></i>
                    <input
                        type="text"
                        placeholder="Search tutor, student, course, topics..."
                        value={filters.search}
                        onChange={handleSearchChange}
                    />
                </div>

                <div className="filter-group">
                    <label>Tutor</label>
                    <select value={filters.tutor} onChange={handleTutorChange}>
                        <option value="">All Tutors</option>
                        {tutors.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Course</label>
                    <select value={filters.course} onChange={handleCourseChange}>
                        <option value="">All Courses</option>
                        {courses.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>From</label>
                    <input type="date" value={filters.dateFrom} onChange={handleDateFromChange} />
                </div>

                <div className="filter-group">
                    <label>To</label>
                    <input type="date" value={filters.dateTo} onChange={handleDateToChange} />
                </div>

                <div className="filter-group">
                    <label>Sort</label>
                    <select value={filters.sortBy} onChange={handleSortChange}>
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="rating-desc">Highest Rating</option>
                        <option value="rating-asc">Lowest Rating</option>
                        <option value="tutor-asc">Tutor A-Z</option>
                        <option value="tutor-desc">Tutor Z-A</option>
                    </select>
                </div>

                {hasActiveFilters && (
                    <button className="btn clear-filters-btn" onClick={clearFilters}>
                        <i className="bx bx-x"></i> Clear
                    </button>
                )}
            </div>

            <div className="filters-status-row">
                <div className="status-pills">
                    {STATUS_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            className={`status-pill ${opt.value} ${filters.status.includes(opt.value) ? 'active' : ''}`}
                            onClick={() => toggleStatus(opt.value)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                <span className="filter-result-count">
                    Showing {resultCount} of {totalCount} sessions
                </span>
            </div>
        </div>
    );
};

export default memo(SessionFilters);
