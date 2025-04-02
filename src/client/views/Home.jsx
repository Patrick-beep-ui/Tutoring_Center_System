import { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuid } from "uuid";
import { Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import Graph from "../components/Graph";
import Header from "../components/Header";
import "../App.css"
import texts from "../texts/sessions.json";

function Home() {
    const [sessions, setSessions] = useState([]);
    const [currentWeek, setCurrentWeek] = useState(1);  // Start at week 1
    const navigate = useNavigate();

    useEffect(() => {
        const getSessions = async () => {
            try {
                const response = await axios.get(`/api/sessions`);
                const { data } = response;
                setSessions(data.sessions);
            } catch (e) {
                console.error(e);
            }
        };
        getSessions();
    }, []);         

    const redirect = (sessionId) => {
        navigate(`/session/details/${sessionId}`);
    };

    const handleLinkClick = (event) => {
        event.stopPropagation(); // Prevent event from triggering the row's onClick
    };

    // Filter sessions by current week
    const filteredSessions = sessions.filter(session => session.week_number === currentWeek);

    const goToNextWeek = () => {
        if (currentWeek < 17) {  // Assuming max of 13 weeks
            setCurrentWeek(prevWeek => prevWeek + 1);
        }
    };

    const goToPreviousWeek = () => {
        if (currentWeek > 1) {
            setCurrentWeek(prevWeek => prevWeek - 1);
        }
    };

    return (
        <>
            <Header />

            <section className="sessions-container section">
                <div className="week-navigation">
                    <button onClick={goToPreviousWeek} disabled={currentWeek === 1} className="weeks-btn" >&#9665;</button>
                    <span>Week {currentWeek}</span>
                    <button onClick={goToNextWeek} disabled={currentWeek === 17} className="weeks-btn" >&#9655;</button> {/* Assuming max of 17 weeks */}
                </div>

                <div className="table-container">
                    <table className="table table-striped">
                        <thead className="bg-light">
                            <tr>
                                <th scope="col">{texts.table.TutorColumHeader}</th>
                                <th scope="col">{texts.table.StudentColumHeader}</th>
                                <th scope="col">{texts.table.CoursesColumHeader}</th>
                                <th scope="col">{texts.table.HoursColumHeader}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSessions.map(s => (
                                <tr key={uuid()} className="session-info-row" onClick={() => redirect(s.session_id)} id={s.session_id} style={{ cursor: 'pointer' }}>
                                    <td><Link to={`/profile/${s.tutor_id}`} onClick={handleLinkClick}>{s.tutor_name}</Link></td>
                                    <td>{s.student}</td>
                                    <td>{s.course_name}</td>
                                    <td>{s.total_hours}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <section className="home-links">
                    <div>
                        <Link to={'/tutors'}>See All Tutors</Link>
                    </div>
                    <div>
                        <Link to={'/classes'}>See All Classes</Link>
                    </div>
                    <div>
                        <Link to={'/majors'}>See All Majors</Link>
                    </div>
                </section>
            </section>
        </>
    );
}

export default Home;
