import { useState, useEffect } from "react";
import { useForm } from "react-hook-form"
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import axios from "axios";
import Header from "../components/Header";
import EditSessionForm from "../components/EditSessionForm";    

function EditSession() {
    const {session_id, tutor_id} = useParams();
    const [session, setSession] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const source = location.state?.source || "completed";

    useEffect(() => {
        const getSession = async () => {
            try {
                const response = await axios.get(`/api/sessions/session/${session_id}`);
                const { data } = response;
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
        <div className="edit-card" style={{position: 'relative'}}>
            <button
            style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 10,
                border: '1px solid #949494',
                padding: '5px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#fff',
                backgroundColor: '#949494',
              }}>Go Back</button>
            <h1 className="edit-card-title">{source == 'scheduled' ? 'Complete Session' : 'Edit Session'}</h1>
            <div className="edit-card-content">
                <EditSessionForm 
                session={session} 
                session_id={session_id} 
                tutor_id={tutor_id} 
                navigate={navigate}
                source={source} />
            </div>
        </div>
    </section>
   </>
)

}

export default EditSession;