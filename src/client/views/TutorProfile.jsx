import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {v4 as uuid} from "uuid";
import { Link } from "react-router-dom";
import { Toaster, toast } from 'sonner';

function TutorProfile() {
    const [tutor, setTutor] = useState([]);
    const [courses, setCourse] = useState([]);
    const {tutor_id} = useParams();

    console.log("Tutor Id from website", tutor_id);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [TutorResponse, coursesResponse] = await Promise.all([
                    axios.get(`/api/tutors/${tutor_id}`),
                    axios.get(`/api/courses/${tutor_id}`)
                ]);
    
                const tutorData = TutorResponse.data.tutor_info;
                const coursesData = coursesResponse.data.tutor_classes;
    
                console.log("Tutor:", tutorData);
                console.log("Courses:", coursesData);
    
                setTutor(tutorData);
                setCourse(coursesData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
    
        fetchData();
    }, []);


    return(
        <>
        <h1>Tutor Profile</h1>

        <section>
            {tutor.map(t =>
            <div className="tutor_info" key={t.tutor_id}>
             <h3>{t.tutor_name}</h3>
            <p>{t.tutor_email}</p>
            <p>{t.tutor_id}</p>
            <p>{t.tutor_major}</p>
            <p>{t.contact}</p>
            </div>)}
        </section>

        <section className="courses_container">
        {courses.map(c => 
        <Link to={`/sessions/${tutor_id}/${c.course_id}`} key={c.course_id}>
            <div className="class-box" id={c.course_id}>
            <h3>{c.course_name}</h3>
            <p>{c.course_code}</p>
        </div>
        </Link>)}
        </section>

        <Link to={'/'}>Go Home</Link>
        </>
    )

}

export default TutorProfile;