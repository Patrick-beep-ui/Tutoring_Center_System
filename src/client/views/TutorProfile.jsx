import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Profile from "../components/Picture";
import texts from "../texts/tutorProfile.json"

function TutorProfile() {
    const [tutor, setTutor] = useState([]);
    const [courses, setCourse] = useState([]);
    const [session, setSession] = useState(0);
    const [profilePicUrl, setProfilePicUrl] = useState('');
    const { tutor_id } = useParams();

    console.log("Tutor Id from website", tutor_id);

    useEffect(() => {
        const fetchData = async () => {
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

                setTutor(tutorData);
                setCourse(coursesData);
                setSession(sessionData);
                setProfilePicUrl(`/public/profile/tutor${tutor_id}.jpg`);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [tutor_id]);

    const renderSessions = (session) => {

        const section = document.querySelector('.tutor-calendar');
        if (session >= 1) {
            const p = document.createElement('p');
            const a = document.createElement('a');
            a.textContent = `${session} scheduled sessions`;
            a.href = '#'; 
    
            p.classList.add('scheduled-sessions-counter');
            p.textContent = 'You have ';
            p.appendChild(a);
    
            section.appendChild(p);
        }
    };

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
                        <img src={profilePicUrl} alt={texts.profilePictureAlt} className="profile-picture" />
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
                                <p> <strong>{texts.profileInfo.idLabel}</strong> {t.tutor_id}</p>
                                <p><strong>{texts.profileInfo.majorLabel} </strong>{t.tutor_major}</p>
                                <p><strong>{texts.profileInfo.contactLabel} </strong>{t.contact}</p>
                            </div>
                            {tutor.map(t => 
                    <div className="tutor-sched" key={t.tutor_id}>
                        <p id=""> <strong>{texts.profileInfo.scheduleLabel} </strong></p>
                        <div className="schedules">
                            {t.tutor_schedule.split('\n').map((line, index) => (
                            <p key={index}>{line}</p>
                            ))}
                        </div>
                        <div className="tutor-calendar">
                        <Link to={`/calendar/${tutor_id}`}><button className="btn btn-primary">{texts.profileInfo.viewCalendarButton}</button></Link>
                    {session >= 1 ? (
                        
                    <div class="info">
                        <div class="info__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" height="24" fill="none"><path fill="#393a37" d="m12 1.5c-5.79844 0-10.5 4.70156-10.5 10.5 0 5.7984 4.70156 10.5 10.5 10.5 5.7984 0 10.5-4.7016 10.5-10.5 0-5.79844-4.7016-10.5-10.5-10.5zm.75 15.5625c0 .1031-.0844.1875-.1875.1875h-1.125c-.1031 0-.1875-.0844-.1875-.1875v-6.375c0-.1031.0844-.1875.1875-.1875h1.125c.1031 0 .1875.0844.1875.1875zm-.75-8.0625c-.2944-.00601-.5747-.12718-.7808-.3375-.206-.21032-.3215-.49305-.3215-.7875s.1155-.57718.3215-.7875c.2061-.21032.4864-.33149.7808-.3375.2944.00601.5747.12718.7808.3375.206.21032.3215.49305.3215.7875s-.1155.57718-.3215.7875c-.2061.21032-.4864.33149-.7808.3375z"></path></svg>
                        </div>
                        <div class="info__title"> {texts.scheduledSessions.youHaveLabel} <a href={`/scheduled-sessions/${tutor_id}`}>{session} {texts.scheduledSessions.scheduledSessionsLabel}</a> </div>
                        
                    </div>
                    
                    ) : (
                        null
                    )}
                        </div>
                    </div>
                    )}
                        </div>
                    )}
                    </div>
                    {/*tutor.map(t => 
                    <div className="tutor-schedule" key={t.tutor_id}>
                        <p id="schedule-heading">Tutor Schedule: </p>
                        <div className="schedules">
                            {t.tutor_schedule.split('\n').map((line, index) => (
                            <p key={index}>{line}</p>
                            ))}
                        </div>
                    </div>
                            )*/}

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
