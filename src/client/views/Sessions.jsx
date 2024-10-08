import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {v4 as uuid} from "uuid";
import { Link } from "react-router-dom";
import SessionTable from "../components/SessionTable";
import Header from "../components/Header";

function Session() {
    const [session, setSession] = useState([]);
    const {tutor_id} = useParams();
    const {course_id} = useParams();

    useEffect(() => {
        const getSessions = async () => {
            try {
                const response = await axios.get(`/api/sessions/${tutor_id}/${course_id}`)
                const {data} = response;
                console.log(data.sessions)
                setSession(data.sessions)
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
            <Link to={`/profile/${tutor_id}`} >Go Back</Link>
            <SessionTable session={session} />
    
            <Link to={`/sessions/add/${tutor_id}/${course_id}`}>Add Session</Link>
        </section>
        </>
    )

}

export default Session