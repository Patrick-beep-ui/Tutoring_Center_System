import { useState, useEffect } from "react";
import { useForm } from "react-hook-form"
import { Link, useNavigate, useParams } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import axios from "axios";
import Header from "../components/Header";
import EditSessionForm from "../components/EditSessionForm";

function EditSession() {
    const {session_id, tutor_id} = useParams();
    const [session, setSession] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getSession = async () => {
            try {
                const response = await axios.get(`/api/sessions/session/${session_id}`);
                const { data } = response;
                console.log(data.session);
                setSession(data.session);
            }
            catch(e) {
                console.error(e);
            }
        }

        getSession();
    }, [session_id])

return(
   <>
    <Header/>
    <section className="edit-section-container">
        <div className="edit-card">
            <h1 className="edit-card-title">Edit Session</h1>
            <div className="edit-card-content">
                <EditSessionForm session={session} session_id={session_id} tutor_id={tutor_id} navigate={navigate}/>
            </div>
        </div>
    </section>
   </>
)

}

export default EditSession;