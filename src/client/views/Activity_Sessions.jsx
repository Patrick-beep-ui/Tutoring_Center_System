import { useState, useEffect, useMemo, memo, useCallback } from "react";
import SessionCard from "../components/SessionCard.jsx";
import SessionFilters from "../components/SessionFilters.jsx";
import api from "../axiosService.js";

import "../App.css";

const DEFAULT_FILTERS = {
    search: "",
    status: [],
    tutor: "",
    course: "",
    dateFrom: "",
    dateTo: "",
    sortBy: "date-desc",
};

const Activity_Sessions = () => {
    const [sessions, setSessions] = useState([]);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await api.get("/sessions");
                setSessions(response.data.sessions);
            } catch (error) {
                console.error("Error fetching sessions:", error);
            }
        };

        fetchSessions();
    }, []);

    const tutors = useMemo(() => {
        const names = [...new Set(sessions.map(s => s.tutor_name).filter(Boolean))];
        return names.sort();
    }, [sessions]);

    const courses = useMemo(() => {
        const names = [...new Set(sessions.map(s => s.course_name).filter(Boolean))];
        return names.sort();
    }, [sessions]);

    const filteredSessions = useMemo(() => {
        let result = [...sessions];

        if (filters.search) {
            const q = filters.search.toLowerCase();
            result = result.filter(s =>
                (s.tutor_name && s.tutor_name.toLowerCase().includes(q)) ||
                (s.student_name && s.student_name.toLowerCase().includes(q)) ||
                (s.course_name && s.course_name.toLowerCase().includes(q)) ||
                (s.session_topics && s.session_topics.toLowerCase().includes(q))
            );
        }

        if (filters.status.length > 0) {
            result = result.filter(s => filters.status.includes(s.session_status));
        }

        if (filters.tutor) {
            result = result.filter(s => s.tutor_name === filters.tutor);
        }

        if (filters.course) {
            result = result.filter(s => s.course_name === filters.course);
        }

        if (filters.dateFrom) {
            result = result.filter(s => s.session_date >= filters.dateFrom);
        }

        if (filters.dateTo) {
            result = result.filter(s => s.session_date <= filters.dateTo);
        }

        switch (filters.sortBy) {
            case "date-desc":
                result.sort((a, b) => (b.session_date || "").localeCompare(a.session_date || ""));
                break;
            case "date-asc":
                result.sort((a, b) => (a.session_date || "").localeCompare(b.session_date || ""));
                break;
            case "rating-desc":
                result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case "rating-asc":
                result.sort((a, b) => (a.rating || 0) - (b.rating || 0));
                break;
            case "tutor-asc":
                result.sort((a, b) => (a.tutor_name || "").localeCompare(b.tutor_name || ""));
                break;
            case "tutor-desc":
                result.sort((a, b) => (b.tutor_name || "").localeCompare(a.tutor_name || ""));
                break;
            default:
                break;
        }

        return result;
    }, [sessions, filters]);

    const removeSessionFromState = useCallback(
        (sessionId) => {
          setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
        },
        [setSessions]
    );

    const handleFilterChange = useCallback((newFilters) => {
        setFilters(newFilters);
    }, []);

    return (
        <>
            <SessionFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                tutors={tutors}
                courses={courses}
                resultCount={filteredSessions.length}
                totalCount={sessions.length}
            />
            <div className="sessions-grid">
                {filteredSessions.length > 0 ? (
                    filteredSessions.map((session) => (
                        <SessionCard key={session.session_id} session={session} onDelete={removeSessionFromState}/>
                    ))
                ) : (
                    sessions.length > 0 && (
                        <div className="no-results">
                            <i className="bx bx-search-alt" style={{ fontSize: '48px', color: '#ccc' }}></i>
                            <p>No sessions match your filters.</p>
                            <button className="btn" onClick={() => setFilters(DEFAULT_FILTERS)}>Clear Filters</button>
                        </div>
                    )
                )}
            </div>
        </>
    );
};

export default memo(Activity_Sessions);
