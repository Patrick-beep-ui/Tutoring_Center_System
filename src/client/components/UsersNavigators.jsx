import { useState, useEffect, memo, useContext } from "react";
import { SemesterContext } from "../context/currentSemester";

const UserNavigators = ({ 
    programFilter = "all",
    courseFilter = "all",
    idFilter = "",
    setProgramFilter = () => {},
    setCourseFilter = () => {},
    setIdFilter = () => {},
    majors = [],
    courses = [],
    students = [], 
    isInputSearch = false,
    IdLabel = "ID",
    IdPlaceholder = "Type student ID / Name"
}) => {
    const [searchTerm, setSearchTerm] = useState(idFilter);
    const { semesters, selectedSemesterId, setSelectedSemesterId } = useContext(SemesterContext);


    useEffect(() => {
        const timeout = setTimeout(() => {
            setIdFilter(searchTerm.trim());
        }, 300); // debounce (300ms)

        return () => clearTimeout(timeout);
    }, [searchTerm]);

    return (
        <section className="users-navigation">
            <div className="users-navigation-item">
                <label className="navigation-item-label">Program</label>
                <select
                    className="navigation-item-select"
                    value={programFilter}
                    onChange={(e) => setProgramFilter(e.target.value)}
                >
                    <option value="all">All Majors</option>
                    {majors.map(major => (
                        <option key={major.id} value={major.major_name}>{major.major_name}</option>
                    ))}
                </select>
            </div>
            <div className="users-navigation-item">
                <label className="navigation-item-label">Course</label>
                {isInputSearch ? (
                    <input
                        className="navigation-item-input"
                        type="text"
                        value={courseFilter === "all" ? "" : courseFilter}
                        placeholder="Search Course"
                        onChange={(e) => setCourseFilter(e.target.value)}
                    />
                ) : (
                    <select
                        className="navigation-item-select"
                        value={courseFilter}
                        onChange={(e) => setCourseFilter(e.target.value)}
                    >
                        <option value="all">All Courses</option>
                        <option value="user-courses">My Courses</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.course_code}>{course.course_name}</option>
                        ))}
                    </select>
                )}
            </div>

            <div className="users-navigation-item">
                <label className="navigation-item-label">{IdLabel}</label>
                <input
                    type="text"
                    className="navigation-item-input"
                    placeholder={IdPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="users-navigation-item">
                <label className="navigation-item-label">Semester</label>
                <select
                    className="navigation-item-select"
                    value={selectedSemesterId ?? ""}
                    onChange={(e) => setSelectedSemesterId(Number(e.target.value))}
                    disabled={!semesters.length}
                >
                    {semesters.map(s => (
                        <option key={s.semester_id} value={s.semester_id}>
                            {s.semester_code}{s.is_current ? " (current)" : ""}
                        </option>
                    ))}
                </select>
            </div>
        </section>
    );
};

export default memo(UserNavigators);