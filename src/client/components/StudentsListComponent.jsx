import UserNavigators from "./UsersNavigators";
import { useState, useEffect, useCallback, memo, useContext } from "react";
import UsersDataTable from "@/components/UsersDataTable";
import { exportToCSV } from "../services/exportCSV";
import auth from "../authService";
import { SemesterContext } from "../context/currentSemester";

const StudentsListComponent = ({active = true, majors, userCourses, onExportReady}) => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const { selectedSemesterId } = useContext(SemesterContext);

    // Filter states
    const [programFilter, setProgramFilter] = useState("all");
    const [courseFilter, setCourseFilter] = useState("all");
    const [idFilter, setIdFilter] = useState("");

    useEffect(() => {
        const getStudents = async () => {
            try {
                const response = await auth.get(`/api/students${selectedSemesterId ? `?semester_id=${selectedSemesterId}` : ''}`);
                const {data} = response;
                setStudents(data.students)
            }
            catch(e) {
                console.error(e);
            }
        }

        getStudents();
    }, [selectedSemesterId]);

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

    useEffect(() => {
        onExportReady?.("student", handleExportCSV);
    }, [handleExportCSV, onExportReady]);

    if (!active) return null;

    return (
        <div className="min-w-0 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
            <UserNavigators
                compact
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
            <UsersDataTable
                userType="student"
                data={filteredStudents}
            />
        </div>
    );
}

export default memo(StudentsListComponent);
