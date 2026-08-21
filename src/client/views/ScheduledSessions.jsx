import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import SessionTable from "../components/SessionTable";
import Header from "../components/Header";
import auth from "../authService";
import { SemesterContext } from "../context/currentSemester";


function ScheduledSessions() {
    const [session, setSession] = useState([]);
    const {tutor_id, role} = useParams();
    const { selectedSemesterId } = useContext(SemesterContext);

    useEffect(() => {
        const getSessions = async () => {
            try {
                const response = await auth.get(`/api/sessions/session_status/${tutor_id}/${true}${selectedSemesterId ? `?semester_id=${selectedSemesterId}` : ''}`)
                const {data} = response;
                setSession(data.scheduled_sessions)
            }
            catch(e) {
                console.error(e)
            }
        }
        getSessions();
    }, [selectedSemesterId])

    return(
        <>
        <Header/>
        <section className="sessions-container section">
            <Link to={`/profile/${role}/${tutor_id}`}>Go Back</Link>
            <SessionTable session={session} isEditable={true} tutorId={tutor_id} source={'scheduled'} role={role}/>
        </section>

        </>
    )


}

export default ScheduledSessions;