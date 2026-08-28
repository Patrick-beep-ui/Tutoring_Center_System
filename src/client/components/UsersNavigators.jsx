import { useState, useEffect, memo, useContext } from "react";
import { useOutletContext } from "react-router-dom";
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
    compact = false,
    IdLabel = "ID",
    IdPlaceholder = "Type student ID / Name"
}) => {
    const [searchTerm, setSearchTerm] = useState(idFilter);
    const { semesters, selectedSemesterId, setSelectedSemesterId } = useContext(SemesterContext);
    const { user } = useOutletContext();
    const viewerRole = user?.role ?? user?.user_role;
    const canChangeSemester = viewerRole === "admin" || viewerRole === "dev";
    const currentTerm = semesters.find(s => s.is_current);

    const navigationClassName = compact
        ? "grid w-full grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 text-left sm:grid-cols-2 xl:grid-cols-4"
        : "users-navigation";
    const itemClassName = compact
        ? "flex min-w-0 flex-col gap-1.5"
        : "users-navigation-item";
    const labelClassName = compact
        ? "text-sm font-medium text-foreground"
        : "navigation-item-label";
    const selectClassName = compact
        ? "h-11 w-full cursor-pointer rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-[color,box-shadow] focus:border-ring focus:ring-[3px] focus:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        : "navigation-item-select";
    const inputClassName = compact
        ? "h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus:border-ring focus:ring-[3px] focus:ring-ring/20"
        : "navigation-item-input";


    useEffect(() => {
        const timeout = setTimeout(() => {
            setIdFilter(searchTerm.trim());
        }, 300); // debounce (300ms)

        return () => clearTimeout(timeout);
    }, [searchTerm]);

    return (
        <section className={navigationClassName}>
            <div className={itemClassName}>
                <label className={labelClassName}>Program</label>
                <select
                    className={selectClassName}
                    value={programFilter}
                    onChange={(e) => setProgramFilter(e.target.value)}
                >
                    <option value="all">All Majors</option>
                    {majors.map(major => (
                        <option key={major.id} value={major.major_name}>{major.major_name}</option>
                    ))}
                </select>
            </div>
            <div className={itemClassName}>
                <label className={labelClassName}>Course</label>
                {isInputSearch ? (
                    <input
                        className={inputClassName}
                        type="text"
                        value={courseFilter === "all" ? "" : courseFilter}
                        placeholder="Search Course"
                        onChange={(e) => setCourseFilter(e.target.value)}
                    />
                ) : (
                    <select
                        className={selectClassName}
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

            <div className={itemClassName}>
                <label className={labelClassName}>{IdLabel}</label>
                <input
                    type="text"
                    className={inputClassName}
                    placeholder={IdPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className={itemClassName}>
                <label className={labelClassName}>Semester</label>
                {canChangeSemester ? (
                    <select
                        className={selectClassName}
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
                ) : (
                    <select
                        className={selectClassName}
                        value={currentTerm?.semester_id ?? ""}
                        disabled
                        title="Only admins can view other semesters"
                    >
                        {currentTerm && (
                            <option value={currentTerm.semester_id}>{currentTerm.semester_code}</option>
                        )}
                    </select>
                )}
            </div>
        </section>
    );
};

export default memo(UserNavigators);
