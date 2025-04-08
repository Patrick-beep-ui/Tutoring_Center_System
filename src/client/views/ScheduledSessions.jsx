import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {v4 as uuid} from "uuid";
import { Link } from "react-router-dom";
import SessionTable from "../components/SessionTable";
import Header from "../components/Header";


function ScheduledSessions() {
    const [session, setSession] = useState([]);
    const {tutor_id, role} = useParams();

    useEffect(() => {
        const getSessions = async () => {
            try {
                const response = await axios.get(`/api/sessions/session_status/${tutor_id}/${true}`)
                const {data} = response;
                console.log(data.scheduled_sessions)
                setSession(data.scheduled_sessions)
            }
            catch(e) {
                console.error(e)
            }
        }
        getSessions();
    }, [])

    return(
        <>
        <Header/>
        <section className="sessions-container section">
            <Link to={`/profile/${role}/${tutor_id}`} >Go Back</Link>
            <SessionTable session={session} isEditable={true} />
        </section>

        </>
    )


}

export default ScheduledSessions;