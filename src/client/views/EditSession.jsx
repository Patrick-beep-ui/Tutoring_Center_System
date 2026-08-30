import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation, useOutletContext } from "react-router-dom";
import Header from "../components/Header";
import EditSessionForm from "../components/EditSessionForm";    
import auth from "../authService";

function EditSession() {
    const {session_id, tutor_id} = useParams();
    const { user: contextUser } = useOutletContext();
    const [session, setSession] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const source = location.state?.source || "completed";
    const role = location.state?.role || "tutor";

    useEffect(() => {
        const getSession = async () => {
            try {
                const response = await auth.get(`/api/sessions/session/${session_id}`);
                const { data } = response;
                setSession({
                  ...data.session[0],  
                  ...data.studentInfo  
                });
                
                console.log(data.session);
            }
            catch(e) {
                console.error(e);
            }
        }

        getSession();
    }, [session_id])

    const navigateTo = useCallback(() => {
        if (source === 'scheduled') {
          navigate(`/scheduled-sessions/tutor/${tutor_id}`);
        } else if (source === 'activity') {
          navigate('/activity');
        } else {
          navigate(`/sessions/${role}/${tutor_id}/${session?.course_id}`);
        }
      }, [navigate, source, tutor_id, session]);
      

return(
   <>
    <Header/>
    <section className="flex items-start justify-center pt-20">
        <div className="relative max-w-[900px] items-center rounded-2xl border border-[var(--gray)] bg-[var(--white)] px-[9%] py-0.5 shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
            <button
              type="button"
              className="absolute left-2.5 top-2.5 z-10 rounded-[20px] border border-[#949494] px-2.5 py-1 text-xs font-bold text-black"
              onClick={navigateTo}
              >
                <i className="bx bx-left-arrow-alt text-[22px]"></i>
              </button>
            <h1 className="inline-block border-b-2 border-[var(--yellow)] text-[1.4rem] font-black text-[var(--blue)]">{source == 'scheduled' ? 'Complete Session' : 'Edit Session'}</h1>
            <div>
                <EditSessionForm 
                session={session} 
                session_id={session_id} 
                tutor_id={tutor_id} 
                navigate={navigate}
                source={source}
                userRole={contextUser?.role} />
            </div>
        </div>
    </section>
   </>
)

}

export default EditSession;
