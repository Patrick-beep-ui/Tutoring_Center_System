import UserNavigators from "./UsersNavigators";
import { useState, useEffect, useCallback } from "react";
import StudentsNavigationTable from "./StudentsNavigationTable";
import { exportToCSV } from "../services/exportCSV";
import axios from "axios";

const StudentsListComponent = () => {
    const [students, setStudents] = useState([]);

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

    const handleExportCSV = useCallback(() => {
        const headers = ['Student Name', 'Student Email', 'Student Major', 'Student Courses', 'Student ID'];
        const rows = students.map(t => [
            t.student_name,
            t.student_email,
            t.student_major,
            t.user_courses.replace(/, /g, '-'), 
            t.student_id
        ]);
        exportToCSV(rows, headers, 'students.csv'); 
    }, [students]);

    return (
        <div className="users-list students-list">
            <details>
                <summary className="summary-wrapper">
                    <span className="summary-title">Students Directory</span>
                </summary>
                <UserNavigators/>
                <StudentsNavigationTable users={students} role={"student"}/>
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