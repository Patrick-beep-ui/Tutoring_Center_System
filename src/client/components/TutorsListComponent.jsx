import UserNavigators from "./UsersNavigators";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import UserNavigationTable from "./UsersNavigationTable";
import {exportToCSV} from "../services/exportCSV";

const TutorsListComponent = () => {
    const [tutors, setTutor] = useState([]);

    useEffect(() => {
        const getTutors = async () => {
            try {
                const response = await axios.get("/api/tutors");
                const {data} = response;
                console.log(data.tutors)
                setTutor(data.tutors)
            }
            catch(e) {

            }
        }

        getTutors();
    }, [])

    const handleExportCSV = useCallback(() => {
        const headers = ['Tutor Name', 'Tutor Email', 'Tutor Major', 'Tutor Courses', 'Tutor ID'];
        const rows = tutors.map(t => [
            t.tutor_name,
            t.tutor_email,
            t.tutor_major,
            t.tutor_courses.replace(/, /g, '-'), 
            t.tutor_id
        ]);
        exportToCSV(rows, headers, 'tutors.csv'); 
    }, [tutors]);

    return (
        <div className="users-list tutors-list">
            <details open>
                <summary className="summary-wrapper">
                    <span className="summary-title">Tutors Directory</span>
                </summary>
                <UserNavigators/>
                <UserNavigationTable users={tutors} role={"tutor"}/>
                <div className="export-csv-container">
                    <button className="export-csv" onClick={handleExportCSV}>
                        Export as CSV
                    </button>
                </div>
            </details>

        </div>
    );
}

export default TutorsListComponent;