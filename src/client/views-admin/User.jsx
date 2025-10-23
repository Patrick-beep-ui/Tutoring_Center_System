import { useEffect, useState, memo } from "react";
import { useOutletContext } from "react-router-dom";
import auth from "../authService";

import Header from "../components/Header";
import TutorsListComponent from "../components/TutorsListComponent";
import StudentsListComponent from "../components/StudentsListComponent";

function Users() { 
    const [majors, setMajors] = useState([]);
    const [courses, setCourses] = useState([]);
    const { user } = useOutletContext();

    useEffect(() => {
        const getMajors = async () => {
            try {
                const response = await auth.get("/api/majors");
                const { data } = response;
                setMajors(data.majors);
            } catch (e) {
                console.error("Error fetching majors:", e);
            }
        };

        const getUserCourses = async () => {
            try {
                const response = await auth.get(`/api/courses/user/${user.user_id}`);
                const { data } = response;
                setCourses(data.courses);
                console.log("User Courses: ",data.courses);
            } catch (e) {
                console.error("Error fetching user courses:", e);
            }
        }

        getMajors();
        getUserCourses();
    }, []);
    
    return(
        <>
        <Header />
        <section className="section users-section">
            {user.user_role === "student" ? (
                <StudentsListComponent majors={majors} userCourses={courses} />
            ) : (
                <>
                    <TutorsListComponent majors={majors} userCourses={courses} />
                    <StudentsListComponent majors={majors} userCourses={courses} />
                </>
            )}
        </section>

        </>
    )
}

export default Users;