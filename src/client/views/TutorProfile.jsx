import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Profile from "../components/Picture";

function TutorProfile() {
    const [tutor, setTutor] = useState([]);
    const [courses, setCourse] = useState([]);
    const [profilePicUrl, setProfilePicUrl] = useState('');
    const { tutor_id } = useParams();

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
                setProfilePicUrl(`/public/profile/tutor${tutor_id}.jpg`);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [tutor_id]);

    const handleImageUpload = () => {
        setProfilePicUrl(`/public/profile/tutor${tutor_id}.jpg?${new Date().getTime()}`);
    };

    return (
        <>
            <Header />
            <section className="profile-container section">
            <Profile tutorId={tutor_id} onImageUpload={handleImageUpload} />
                <section className="profile-info">
                    <div className="user-picture-container">
                        <label for="image-upload">
                        <img src={profilePicUrl} alt="Tutor Profile Picture" className="profile-picture" />
                        <i class='bx bx-camera camera-label'></i>
                        </label>
                    </div>
                    <div className="user-info-container">
                    {tutor.map(t =>
                        <div className="tutor-info" key={t.tutor_id}>
                            <div className="tutor-info-data">
                                <p>{t.tutor_name}</p>
                                <p>{t.tutor_email}</p>
                            </div>
                            <div className="tutor-info-description">
                                <p>ID: {t.tutor_id}</p>
                                <p>Major: {t.tutor_major}</p>
                                <p>Contact Number: {t.contact}</p>
                            </div>
                        </div>
                    )}
                    </div>
                    {tutor.map(t => 
                    <div className="tutor-schedule" key={t.tutor_id}>
                        <p id="schedule-heading">Tutor Schedule: </p>
                        <div className="schedules">
                            {t.tutor_schedule.split('\n').map((line, index) => (
                            <p key={index}>{line}</p>
                            ))}
                        </div>
                    </div>
)}

                </section>

                <section className="tutor-courses-container">
                    {courses.map(c =>
                    <div className="tutor-course ">

                        <Link to={`/sessions/${tutor_id}/${c.course_id}`} key={c.course_id}>
                            <div className="class-box course-container" id={c.course_id}>
                                <div className="tutor-course-description">
                                    <h3>{c.course_name}</h3>
                                    <p>{c.course_code}</p>
                                </div>
                                <div className="tutor-course-data course-tutors">
                                    <p>{c.sessions}</p>
                                    <p>Sessions</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                    )}
                </section>
            </section>
        </>
    );
}

export default TutorProfile;
