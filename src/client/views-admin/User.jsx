import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";

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
                const response = await axios.get("/api/majors");
                const { data } = response;
                setMajors(data.majors);
            } catch (e) {
                console.error("Error fetching majors:", e);
            }
        };

        const getUserCourses = async () => {
            try {
                const response = await axios.get(`/api/courses/user/${user.user_id}`);
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
            <TutorsListComponent majors={majors} userCourses={courses} />
            <StudentsListComponent majors={majors} userCourses={courses} />
        </section>
        </>
    )
}

export default Users;