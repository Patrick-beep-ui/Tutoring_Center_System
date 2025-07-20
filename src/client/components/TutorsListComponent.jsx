import UserNavigators from "./UsersNavigators";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import UserNavigationTable from "./UsersNavigationTable";
import {exportToCSV} from "../services/exportCSV";

const TutorsListComponent = ({majors, userCourses}) => {
    const [tutors, setTutors] = useState([]);
    const [filteredTutors, setFilteredTutors] = useState([]); // New state for filtered tutors (Provisional)

    // Filter states
    const [programFilter, setProgramFilter] = useState("all");
    const [courseFilter, setCourseFilter] = useState("all");
    const [idFilter, setIdFilter] = useState("");
    //const [semesterFilter, setSemesterFilter] = useState("current");

    useEffect(() => {
        const getTutors = async () => {
            try {
                const response = await axios.get("/api/tutors");
                const {data} = response;
                console.log(data.tutors)
                setTutors(data.tutors)
            }
            catch(e) {

            }
        }
        getTutors();
    }, [])

    const getFilteredTutors = useCallback(() => {
        let filtered = [...tutors];
    
        // Program filter
        if (programFilter !== "all") {
          filtered = filtered.filter(t => t.tutor_major === programFilter);
        }
    
        // Course filter
        if (courseFilter === "user-courses") {
          const userCourseCodes = userCourses.map(course => course.course_code);
          filtered = filtered.filter(tutor => {
            const tutorCourses = tutor.tutor_courses?.split(",").map(c => c.trim());
            return tutorCourses?.some(code => userCourseCodes.includes(code));
          });
        } else if (courseFilter !== "all") {
          filtered = filtered.filter(tutor => {
            const tutorCourses = tutor.tutor_courses?.split(",").map(c => c.trim());
            return tutorCourses?.includes(courseFilter);
          });
        } 
    
        // ID filter
        if (idFilter !== "") {
          filtered = filtered.filter(t =>
            t.tutor_id.toLowerCase().includes(idFilter.toLowerCase()) ||
            t.tutor_name.toLowerCase().includes(idFilter.toLowerCase())
          );
          
        }
    
        setFilteredTutors(filtered);
      }, [tutors, programFilter, courseFilter, idFilter, userCourses]);

      useEffect(() => {
        console.log("Filters changed. Applying...");
        getFilteredTutors();
    }, [getFilteredTutors]);

    const handleExportCSV = useCallback(() => {
        const headers = ['Tutor Name', 'Tutor Email', 'Tutor Major', 'Tutor Courses', 'Tutor ID'];
        const rows = filteredTutors.map(t => [
            t.tutor_name,
            t.tutor_email,
            t.tutor_major,
            t.tutor_courses.replace(/, /g, '-'), 
            t.tutor_id
        ]);
        exportToCSV(rows, headers, 'tutors.csv'); 
    }, [filteredTutors]);

    return (
        <div className="users-list tutors-list">
            <details open>
                <summary className="summary-wrapper">
                    <span className="summary-title">Tutors Directory</span>
                </summary>
                <UserNavigators 
                        programFilter={programFilter}
                        setProgramFilter={setProgramFilter}
                        courseFilter={courseFilter}
                        setCourseFilter={setCourseFilter}
                        idFilter={idFilter}
                        setIdFilter={setIdFilter}
                        //semesterFilter={semesterFilter}
                        //setSemesterFilter={setSemesterFilter}
                        majors={majors}
                        courses={userCourses}
                        students={tutors}
                />
                <UserNavigationTable users={filteredTutors} role={"tutor"}/>
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