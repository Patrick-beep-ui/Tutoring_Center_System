import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {v4 as uuid} from "uuid";
import { Link, useOutletContext} from "react-router-dom";
import SessionTable from "../components/SessionTable";
import Header from "../components/Header";
import { useLayout } from "../context/Layout.jsx";

// You can use this to conditionally render different layouts
//const isElectron = typeof window !== "undefined" && window.platform && window.platform.isElectron;

function Session() {
    //const { layout } = useOutletContext();
    const [session, setSession] = useState([]);
    const {tutor_id} = useParams();
    const {course_id} = useParams();
    const {role} = useParams();

    //const [layout, setLayout] = useState("undefined");
    const { layout } = useLayout();
    

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

    /*
    useEffect(() => {
        // Log to verify if the platform is detected
        console.log('Is this Electron?', isElectron);
    
        // Set different layouts based on platform
        if (isElectron) {
          setLayout("electron");
        } else {
          setLayout("web");
        }
      }, []);
      */

    return(
        <>
        <Header/>
        <section className={`sessions-container section ${layout}`}>
            <Link to={`/profile/${role}/${tutor_id}`} >Go Back</Link>
            <SessionTable session={session} isEditable={true} tutorId={tutor_id} />

            {layout === "electron" ? (
                    <div>Desktop version layout</div>
                ) : (
                    <div>Web version layout</div>
                )}
    
            <Link to={`/sessions/add/${tutor_id}/${course_id}`}>Add Session</Link>

        </section>
        </>
    )

}

export default Session