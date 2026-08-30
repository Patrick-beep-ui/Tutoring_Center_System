import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { Link, useOutletContext} from "react-router-dom";
import SessionTable from "../components/SessionTable";
import Header from "../components/Header";
import { useLayout } from "../context/Layout.jsx";
import auth from "../authService.js";
import { SemesterContext } from "../context/currentSemester";

// You can use this to conditionally render different layouts
//const isElectron = typeof window !== "undefined" && window.platform && window.platform.isElectron;

function Session() {
    //const { layout } = useOutletContext();
    const [session, setSession] = useState([]);
    const {tutor_id} = useParams();
    const {course_id} = useParams();
    const {role} = useParams();
    const { selectedSemesterId } = useContext(SemesterContext);

    //const [layout, setLayout] = useState("undefined");
    const { layout } = useLayout();
    const layoutBackground = layout === "electron" ? "bg-green-100" : layout === "web" ? "bg-blue-100" : "";
    

    useEffect(() => {
        const getSessions = async () => {
            try {
                const response = await auth.get(`/api/sessions/${tutor_id}/${course_id}${selectedSemesterId ? `?semester_id=${selectedSemesterId}` : ''}`)
                const {data} = response;
                setSession(data.sessions)
            }
            catch(e) {
                console.error(e)
            }
        }
        getSessions();
    }, [selectedSemesterId])

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
        <section className={`section ${layoutBackground}`}>
            <Link to={`/profile/${role}/${tutor_id}`} >Go Back</Link>
            <SessionTable session={session} isEditable={true} tutorId={tutor_id} source={'edit'} />

            {layout === "electron" ? (
                    <div>Desktop version layout</div>
                ) : (
                    <div>Web version layout</div>
                )}
    
            <Link 
            to={`/sessions/add/${tutor_id}/${course_id}`}
            state = {{ source: role }}
            >Add Session</Link>

        </section>
        </>
    )

}

export default Session
