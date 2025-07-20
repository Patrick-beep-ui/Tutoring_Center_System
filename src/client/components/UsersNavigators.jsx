import { useState, useEffect } from "react";

const UserNavigators = ({ 
    programFilter = "all",
    courseFilter = "all",
    idFilter = "",
    semesterFilter = "current",
    setProgramFilter = () => {},
    setCourseFilter = () => {},
    setIdFilter = () => {},
    setSemesterFilter = () => {},
    majors = [],
    courses = [],
    students = [], 
}) => {
    const [searchTerm, setSearchTerm] = useState(idFilter);

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
            </div>
            <div className="users-navigation-item">
                <label className="navigation-item-label">ID</label>
                <input
                    type="text"
                    className="navigation-item-input"
                    placeholder="Type student ID / Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="users-navigation-item">
                <label className="navigation-item-label">Semester</label>
                <select
                    className="navigation-item-select"
                    value={semesterFilter}
                    onChange={(e) => setSemesterFilter(e.target.value)}
                    disabled={true}
                >
                    <option value="current">Current Semester</option>
                </select>
            </div>
        </section>
    );
};

export default UserNavigators;