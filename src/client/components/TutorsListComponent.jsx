import UserNavigators from "./UsersNavigators";
import { useState, useEffect, useCallback, memo, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import auth from "../authService";
import UsersDataTable from "@/components/UsersDataTable";
import {exportToCSV} from "../services/exportCSV";
import { SemesterContext } from "../context/currentSemester";


const TutorsListComponent = ({active = true, majors, userCourses, onExportReady, initialCourse, hideFilters = false}) => {
    const [tutors, setTutors] = useState([]);
    const [filteredTutors, setFilteredTutors] = useState([]); 
    const [allCourses, setAllCourses] = useState([]);
    const { selectedSemesterId } = useContext(SemesterContext);
    const { user } = useOutletContext();
    const viewerRole = user?.user_role ?? user?.role;
    const isAdminDev = viewerRole === "admin" || viewerRole === "dev";

    // Filter states
    const [programFilter, setProgramFilter] = useState("all");
    const [courseFilter, setCourseFilter] = useState(initialCourse || "all");
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

    // Fetch the full course catalog for the admin/dev course autocomplete.
    // Only fetched when filters are visible (not the hidden see-tutors view).
    useEffect(() => {
        if (hideFilters || !isAdminDev || !selectedSemesterId) {
            setAllCourses([]);
            return;
        }
        const getAllCourses = async () => {
            try {
                const response = await auth.get(`/api/courses/catalog?semester_id=${selectedSemesterId}`);
                const { data } = response;
                setAllCourses(data.courses || []);
            } catch (e) {
                setAllCourses([]);
            }
        };
        getAllCourses();
    }, [hideFilters, isAdminDev, selectedSemesterId]);

    useEffect(() => {
        if (initialCourse) setCourseFilter(initialCourse);
    }, [initialCourse]);

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
            {!hideFilters && (
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
                    allCourses={allCourses}
                    autocomplete
                />
            )}
            <UsersDataTable
                userType="tutor"
                data={filteredTutors}
            />
        </div>
    );
}

export default memo(TutorsListComponent);
