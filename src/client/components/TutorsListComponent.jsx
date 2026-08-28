import UserNavigators from "./UsersNavigators";
import { useState, useEffect, useCallback, memo, useContext } from "react";
import auth from "../authService";
import UsersDataTable from "@/components/UsersDataTable";
import {exportToCSV} from "../services/exportCSV";
import { SemesterContext } from "../context/currentSemester";


const TutorsListComponent = ({active = true, majors, userCourses, onExportReady}) => {
    const [tutors, setTutors] = useState([]);
    const [filteredTutors, setFilteredTutors] = useState([]); 
    const { selectedSemesterId } = useContext(SemesterContext);

    // Filter states
    const [programFilter, setProgramFilter] = useState("all");
    const [courseFilter, setCourseFilter] = useState("all");
    const [idFilter, setIdFilter] = useState("");

    useEffect(() => {
        const getTutors = async () => {
            try {
                const response = await auth.get(`/api/tutors${selectedSemesterId ? `?semester_id=${selectedSemesterId}` : ''}`);
                const {data} = response;
                setTutors(data.tutors)
            }
            catch(e) {

            }
        }
        getTutors();
    }, [selectedSemesterId])

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

    useEffect(() => {
        onExportReady?.("tutor", handleExportCSV);
    }, [handleExportCSV, onExportReady]);

    if (!active) return null;

    return (
        <div className="min-w-0 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
            <UserNavigators
                compact
                programFilter={programFilter}
                setProgramFilter={setProgramFilter}
                courseFilter={courseFilter}
                setCourseFilter={setCourseFilter}
                idFilter={idFilter}
                setIdFilter={setIdFilter}
                majors={majors}
                courses={userCourses}
                students={tutors}
            />
            <UsersDataTable
                userType="tutor"
                data={filteredTutors}
            />
        </div>
    );
}

export default memo(TutorsListComponent);
