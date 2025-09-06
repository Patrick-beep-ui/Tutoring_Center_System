import { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { v4 as uuid } from "uuid";
import { Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import Header from "../components/Header";
import "../App.css";
import texts from "../texts/sessions.json";
import { exportToCSV } from "../services/exportCSV";
import api from "../axiosService";

function Home() {
    const [sessions, setSessions] = useState([]);
    const [currentWeek, setCurrentWeek] = useState(1);  // Start at week 1
    const navigate = useNavigate();

    useEffect(() => {
        const getSessions = async () => {
            try {
                const response = await api.get(`/sessions`);
                const { data } = response;
                setSessions(data.sessions);
            } catch (e) {
                console.error(e);
            }
        };
        getSessions();
    }, []);         

    const redirect = useCallback((sessionId) => {
        navigate(`/session/details/${sessionId}`);
    }, [navigate]);

    // Prevent Tutor Link click from propagating to the row click event
    const handleLinkClick = useCallback((event) => {
        event.stopPropagation();
    }, []);

    // Filter sessions by current week
    const filteredSessions = useMemo(() => {
        return sessions.filter((session) => session.week_number === currentWeek);
    }, [sessions, currentWeek]);

    const goToNextWeek = useCallback(() => {
        setCurrentWeek((prevWeek) => (prevWeek < 17 ? prevWeek + 1 : prevWeek));
    }, []);

    const goToPreviousWeek = useCallback(() => {
        setCurrentWeek((prevWeek) => (prevWeek > 1 ? prevWeek - 1 : prevWeek));
    }, []);

    // Function to export session data to CSV
    const handleExportCSV = useCallback(() => {
        const headers = [
            "Tutor Name", "Student Name", "Student ID", "Course Name", "Total Hours", "Session Time", "Session Date", "Topics Discussed", "Outcomes"
        ];
        const rows = filteredSessions.map(session => [
            session.tutor_name,
            session.student_name,
            session.student_id,
            session.course_name,
            session.total_hours,
            session.session_duration,
            session.session_date,
            session.session_topics,
            session.session_feedback
        ]);
        exportToCSV(rows, headers, `sessions_week${currentWeek}.csv`);
    }, [filteredSessions, currentWeek]);
    

    return (
        <>
            <Header />
            <section className="sessions-container section">
                <div className="week-navigation">
                    <button onClick={goToPreviousWeek} disabled={currentWeek === 1} className="weeks-btn" >&#9665;</button>
                    <span>Week {currentWeek}</span>
                    <button onClick={goToNextWeek} disabled={currentWeek === 17} className="weeks-btn" >&#9655;</button>
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
                                    <td><Link to={`/profile/tutor/${s.tutor_id}`} onClick={handleLinkClick}>{s.tutor_name}</Link></td>
                                    <td>{s.student_name}</td>
                                    <td>{s.course_name}</td>
                                    <td>{s.total_hours}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button onClick={handleExportCSV} className="export-csv sessions-csv">
                    Export this Session Week to CSV
                </button>

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

                <button  className="export-csv sessions-csv">
                    <Link to={'/auth/test'}>See resources</Link>
                </button>
            </section>
        </>
    );
}

export default Home;
