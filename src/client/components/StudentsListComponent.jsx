import UserNavigators from "./UsersNavigators";
import { useState, useEffect, useCallback } from "react";
import StudentsNavigationTable from "./StudentsNavigationTable";
import { exportToCSV } from "../services/exportCSV";
import axios from "axios";

const StudentsListComponent = ({majors, userCourses}) => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);

    // Filter states
    const [programFilter, setProgramFilter] = useState("all");
    const [courseFilter, setCourseFilter] = useState("all");
    const [idFilter, setIdFilter] = useState("");

    useEffect(() => {
        const getStudents = async () => {
            try {
                const response = await axios.get("/api/students");
                const {data} = response;
                console.log("students: ",data.students)
                setStudents(data.students)
            }
            catch(e) {
                console.error(e);
            }
        }

        getStudents();
    }, []);

    const getFilteredStudents = useCallback(() => {
        let filtered = [...students];

        // Program filter
        if (programFilter !== "all") {
            filtered = filtered.filter(s => s.student_major === programFilter);
        }

        // Course filter
        if (courseFilter === "user-courses") {
            const userCourseCodes = userCourses.map(course => course.course_code);
            filtered = filtered.filter(student => {
                const studentCourses = student.user_courses?.split(",").map(c => c.trim());
                return studentCourses?.some(code => userCourseCodes.includes(code));
            });
        } else if (courseFilter !== "all") {
            filtered = filtered.filter(student => {
                const studentCourses = student.user_courses?.split(",").map(c => c.trim());
                return studentCourses?.includes(courseFilter);
            });
        }

        // ID filter
        if (idFilter !== "") {
            filtered = filtered.filter(s => 
                s.student_id.includes(idFilter) ||
                s.student_name.toLowerCase().includes(idFilter.toLowerCase())
            );
        }

        setFilteredStudents(filtered);  

    }, [students, programFilter, courseFilter, idFilter, userCourses]);

    useEffect(() => {
        console.log("Filters changed. Applying...");
        getFilteredStudents();
    }, [getFilteredStudents]);

    const handleExportCSV = useCallback(() => {
        const headers = ['Student Name', 'Student Email', 'Student Major', 'Student Courses', 'Student ID'];
        const rows = filteredStudents.map(t => [
            t.student_name,
            t.student_email,
            t.student_major,
            t.user_courses.replace(/, /g, '-'), 
            t.student_id
        ]);
        exportToCSV(rows, headers, 'students.csv'); 
    }, [filteredStudents]);

    return (
        <div className="users-list students-list">
            <details>
                <summary className="summary-wrapper">
                    <span className="summary-title">Students Directory</span>
                </summary>
                <UserNavigators
                majors={majors}
                courses={userCourses}
                students={students}
                programFilter={programFilter}
                setProgramFilter={setProgramFilter}
                courseFilter={courseFilter}
                setCourseFilter={setCourseFilter}
                idFilter={idFilter}
                setIdFilter={setIdFilter}
                />
                <StudentsNavigationTable users={filteredStudents} role={"student"}/>
                <div className="export-csv-container">
                    <button className="export-csv" onClick={handleExportCSV}>
                        Export as CSV
                    </button>
                </div>
            </details>
        </div>
    );
}

export default StudentsListComponent;