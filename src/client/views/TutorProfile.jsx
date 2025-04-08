import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Profile from "../components/Picture";
import texts from "../texts/tutorProfile.json"
import Popup from 'reactjs-popup';

function TutorProfile() {
    const [user, setUser] = useState([]);
    //const [user, setUser] = useState([]);
    const [courses, setCourse] = useState([]);
    const [session, setSession] = useState(0);
    const [error, setError] = useState("");
    const [profilePicUrl, setProfilePicUrl] = useState('');

    const { tutor_id } = useParams();
    const {role} = useParams();

    const fetchTutorData = useCallback(async () => {
        try {
            const [TutorResponse, coursesResponse, sessionResponse] = await Promise.all([
                axios.get(`/api/tutors/${tutor_id}`),
                axios.get(`/api/courses/${tutor_id}`),
                axios.get(`/api/sessions/session_status/${tutor_id}`)
            ]);

            const tutorData = TutorResponse.data.tutor_info;
            const coursesData = coursesResponse.data.tutor_classes;
            const sessionData = sessionResponse.data.scheduled_sessions

            console.log("Tutor:", tutorData);
            console.log("Courses:", coursesData);
            console.log("Session:", sessionData);

            setUser(tutorData);
            setCourse(coursesData);
            setSession(sessionData);
            setProfilePicUrl(`/public/profile/tutor${tutor_id}.jpg`);
            setError("");
        } catch (error) {

            if (error.response) {
                setError(error.response.data);
            }

            console.error("Error fetching data:", error);
        }
    }, [tutor_id]);

    const fecthStudentData = useCallback(async () => {
        try {
            const response = await axios.get(`/api/users/${tutor_id}`);
            const {user} = response.data;
            console.log(user);
            setUser([user]);

            const coursesResponse = await axios.get(`/api/users/${tutor_id}/${user.ku_id}`);
            const {data} = coursesResponse;
            console.log(data.userCourses);
            setCourse(data.userCourses);
        }
        catch(e) {
            console.error(e);
        }
    }, [])

    useEffect(() => {

        if(role === 'tutor') {
            fetchTutorData();
        }
        if(role === 'student') {
            fecthStudentData();
        }
    }, [role]);

    const handleImageUpload = () => {
        setProfilePicUrl(`/public/profile/tutor${tutor_id}.jpg?${new Date().getTime()}`);
    };

    if (error) {
        return (
            <>
                <Header />
                <section className="profile-container section">
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                </section>
            </>
        );
    }   

    return (
        <>
            <Header />
            <section className="profile-container section">
            <Profile tutorId={tutor_id} onImageUpload={handleImageUpload} />
                <section className="profile-info">
                    <div className="user-picture-container">
                        <label for="image-upload">
                        <img src={profilePicUrl} alt={texts.profilePictureAlt} className="profile-picture" />
                        <i class='bx bx-camera camera-label'></i>
                        </label>
                    </div>
                    <div className="user-info-container">
                    {user.map(t =>
                        <div className="tutor-info" key={t.user_id}>
                            <div className="tutor-info-data">
                            <p>
                                {role === 'tutor'
                                    ? t.tutor_name
                                    : `${t.first_name ?? ''} ${t.last_name ?? ''}`}
                            </p>


                            <p>{t.tutor_email || t.email}</p>
                            </div>
                            <div className="tutor-info-description">
                                <p> <strong>{texts.profileInfo.idLabel}</strong> {t.tutor_id || t.ku_id}</p>
                                <p><strong>{texts.profileInfo.majorLabel} </strong>{t.tutor_major || t.Major.major_name}</p>
                                { role == 'tutor' ? (
                                    <p><strong>{texts.profileInfo.contactLabel} </strong>{t.contact}</p>
                                ) : (
                                    <p><strong>Rol: </strong>Student</p>
                                )
                                }
                            </div>
                        
                            {user.map(t => 
                    <div className="tutor-sched" key={t.tutor_id}>
                        <p id=""> <strong>{ role == 'tutor' ? (texts.profileInfo.scheduleLabel) : null} </strong></p>
                        <div className="schedules">
                            {t.tutor_schedule?.split('\n').map((line, index) => (
                            <p key={index}>{line}</p>
                            ))}
                        </div>

                        <div className="tutor-calendar">
                            { role == 'tutor' ? 
                                <Link to={`/calendar/${tutor_id}`}><button className="btn btn-primary">{texts.profileInfo.viewCalendarButton}</button></Link>
                            : null}
                            {session >= 1 ? (
                                
                            <div class="info">
                                <div class="info__icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" height="24" fill="none"><path fill="#393a37" d="m12 1.5c-5.79844 0-10.5 4.70156-10.5 10.5 0 5.7984 4.70156 10.5 10.5 10.5 5.7984 0 10.5-4.7016 10.5-10.5 0-5.79844-4.7016-10.5-10.5-10.5zm.75 15.5625c0 .1031-.0844.1875-.1875.1875h-1.125c-.1031 0-.1875-.0844-.1875-.1875v-6.375c0-.1031.0844-.1875.1875-.1875h1.125c.1031 0 .1875.0844.1875.1875zm-.75-8.0625c-.2944-.00601-.5747-.12718-.7808-.3375-.206-.21032-.3215-.49305-.3215-.7875s.1155-.57718.3215-.7875c.2061-.21032.4864-.33149.7808-.3375.2944.00601.5747.12718.7808.3375.206.21032.3215.49305.3215.7875s-.1155.57718-.3215.7875c-.2061.21032-.4864.33149-.7808.3375z"></path></svg>
                                </div>
                                <div class="info__title"> 
                                    {texts.scheduledSessions.youHaveLabel} <a href={`/scheduled-sessions/${tutor_id}`}>{session} {texts.scheduledSessions.scheduledSessionsLabel}</a> 
                                </div> 
                        
                            </div> 
                    
                            ) : (
                                null
                            )}
                        </div> 
                    </div> // end of tutor-sched
                    )}
                        </div>
                    )}
                    </div>


                </section>

                <section className="tutor-courses-container">

                    {courses.map(c =>
                    <div className="tutor-course ">

                        <Link to={`/sessions/${role}/${tutor_id}/${c.course_id}`} key={c.course_id}>
                            <div className="class-box course-container" id={c.course_id}>
                                <div className="tutor-course-description">
                                    <h3>{c.course_name}</h3>
                                    <p>{c.course_code}</p>
                                </div>
                                <div className="tutor-course-data course-tutors">
                                    <p>{c.sessions || c.qtyOfSessions}</p>
                                    <p>{texts.tutorCourses.sessionsLabel}</p>
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
