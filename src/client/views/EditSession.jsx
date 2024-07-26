import { useState, useEffect } from "react";
import { useForm } from "react-hook-form"
import { Link, useNavigate, useParams } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import axios from "axios";
import Header from "../components/Header";
import EditSessionForm from "../components/EditSessionForm";

function EditSession() {
    const {session_id} = useParams();
    const [session, setSession] = useState([]);

    useEffect(() => {
        const getSession = async () => {
            try {
                const response = await axios.get(`/api/edit-session/${session_id}`);
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

        <section className="edit-section-container section">
            <EditSessionForm session={session} session_id={session_id}/>
        </section>
       </>

       
    )

}

export default EditSession;