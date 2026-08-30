import { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { v4 as uuid } from "uuid";
import { Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import Header from "../components/Header";
import texts from "../texts/sessions.json";
import { exportToCSV } from "../services/exportCSV";
import api from "../axiosService";
import { SemesterContext } from "../context/currentSemester";

function Home() {
    const [sessions, setSessions] = useState([]);
    const [currentWeek, setCurrentWeek] = useState(1);  // Start at week 1
    const navigate = useNavigate();
    const { selectedSemesterId } = useContext(SemesterContext);

    useEffect(() => {
        const getSessions = async () => {
            try {
                const response = await api.get(`/sessions${selectedSemesterId ? `?semester_id=${selectedSemesterId}` : ''}`);
                const { data } = response;
                setSessions(data.sessions);
            } catch (e) {
                console.error(e);
            }
        };
        getSessions();
    }, [selectedSemesterId]);         

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
            <section className="section [&>h1]:font-medium">
                <div>
                    <button onClick={goToPreviousWeek} disabled={currentWeek === 1} className="mx-2.5 bg-[var(--blue)] p-1.5 text-white disabled:bg-[var(--gray)]" >&#9665;</button>
                    <span>Week {currentWeek}</span>
                    <button onClick={goToNextWeek} disabled={currentWeek === 17} className="mx-2.5 bg-[var(--blue)] p-1.5 text-white disabled:bg-[var(--gray)]" >&#9655;</button>
                </div>

                <div className="mt-2.5 max-h-[730px] overflow-y-auto rounded-[10px] border border-[#ddd] shadow-[0_2px_5px_rgba(0,0,0,0.1)] [&::-webkit-scrollbar]:w-0">
                    <table className="w-full border-collapse border-spacing-0">
                        <thead className="sticky top-0 bg-white">
                            <tr>
                                <th className="rounded-tl-[10px] bg-[var(--blue)] p-[15px] text-[var(--white)]" scope="col">{texts.table.TutorColumHeader}</th>
                                <th className="bg-[var(--blue)] p-[15px] text-[var(--white)]" scope="col">{texts.table.StudentColumHeader}</th>
                                <th className="bg-[var(--blue)] p-[15px] text-[var(--white)]" scope="col">{texts.table.CoursesColumHeader}</th>
                                <th className="rounded-tr-[10px] bg-[var(--blue)] p-[15px] text-[var(--white)]" scope="col">{texts.table.HoursColumHeader}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSessions.map(s => (
                                <tr key={uuid()} className="cursor-pointer [&:last-child_td]:border-b-0" onClick={() => redirect(s.session_id)} id={s.session_id}>
                                    <td className="border-b border-[#ddd] p-2.5 font-medium text-[#777676]"><Link to={`/profile/tutor/${s.tutor_id}`} onClick={handleLinkClick}>{s.tutor_name}</Link></td>
                                    <td className="border-b border-[#ddd] p-2.5 font-medium text-[#777676]">{s.student_name}</td>
                                    <td className="border-b border-[#ddd] p-2.5 font-medium text-[#777676]">{s.course_name}</td>
                                    <td className="border-b border-[#ddd] p-2.5 font-medium text-[#777676]">{s.total_hours}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button onClick={handleExportCSV} className="mt-5 cursor-pointer rounded-[15px] border-0 bg-[var(--blue)] p-2.5 text-base text-[var(--white)] hover:text-[var(--yellow)]">
                    Export this Session Week to CSV
                </button>

                <section className="hidden w-full justify-around">
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
                
                {/* 
                <button  className="export-csv sessions-csv">
                    <Link to={'/auth/test'}>See resources</Link>
                </button>
                */}
            </section>
        </>
    );
}

export default Home;
