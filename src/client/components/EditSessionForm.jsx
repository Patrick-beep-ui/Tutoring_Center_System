import { useForm } from "react-hook-form";
import { toast } from 'sonner';
import { useState, useCallback } from "react";
import LoadingSpinner from "./ui-snippets/LoadingSpinner";
import ConfirmAlert from "./ui-snippets/ConfirmAlert";
import axios from "axios";

const EditSessionForm = ({ session, session_id, tutor_id, navigate, source }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onChange" });
    const [isloading, setIsloading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [cancelMessage, setCancelMessage] = useState('');

    const processData = async (formData) => {
        setIsloading(true);
        try {
            const request = await fetch(`/api/sessions/session/${session_id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...formData, source })
            });

            if (!request.ok) throw new Error('Failed to add session');

            const { session } = await request.json();
            console.log(session);

            toast.success('Session updated successfully!', {
                duration: 3000
              });  
              setTimeout(() => {
                navigate(`/profile/tutor/${tutor_id}`);
              }, 1000);

        } catch (e) {
            console.error(e);
        } finally {
            setIsloading(false);
        }
    }

    const cancelSession = useCallback(async () => {
        setIsloading(true);
        try {
            const url = `/api/sessions/session/${session_id}`
            await axios.patch(url, { message: cancelMessage });

            toast.success('Session canceled successfully!', {
                duration: 3000
              });  
              setTimeout(() => {
                navigate(`/scheduled-sessions/tutor/${tutor_id}`);
              }, 1000);
        }
        catch(e) {
            console.error(e);
        }
        finally {
            setIsloading(false);
        }
    }, [session_id, tutor_id, navigate, cancelMessage]);

    const handleCancelClick = useCallback(() => setShowAlert(true), []);
    const handleConfirmCancel = useCallback(async () => {
        await cancelSession();
        setShowAlert(false);
    }, [cancelSession]);

    const handleCancelAlert = useCallback(() => setShowAlert(false), []);


    if (session.length === 0) {
        return <div>Loading...</div>; // Display a loading message or spinner
    }

    return (
        <>
        <form onSubmit={handleSubmit(processData)} className="form-container edit-session-form">
            <section>
                <label>Course: </label>
                <p>{session.course_name}</p>
            </section>
            <section style={{display: 'flex', gap: '110px'}}>
                <div>
                    <label>Scheduled By: </label>
                    <p>{session.scheduled_by}</p>
                </div>
                <div>
                    <label>Student: </label>
                    <p>{session.student_name ? session.student_name : session.student_ku_id}</p>
                </div>

            </section>
            <div className="datetime-data">
                <section>
                    <label>Date: </label>
                    <input type="date" {...register("session_date")} defaultValue={session.session_date} />
                </section>
                <section>
                    <label>Start Time: </label>
                    <input type="time" {...register("session_time")} defaultValue={session.session_time} />
                </section>
            </div>
            <section>
                <label>Duration: </label>
                <input type="number" {...register("session_hours")} defaultValue={session.session_durarion} />
            </section>
            <section className="session-topics-container">
                <label>Topics: </label>
                <textarea cols="30" rows="10" {...register("topics")} defaultValue={session.session_topics}></textarea>
            </section>
            <section className="session-feedback-container">
                <label>Feedback: </label>
                <textarea cols="30" rows="10" {...register("feedback")}>{session.session_feedback}</textarea>
            </section>
            <section className="edit-session-btn-container">
                <button type="submit">
                    {isloading ? <LoadingSpinner /> : 'Complete'}
                </button>
                {source == 'scheduled' ? (
                    <button 
                    type="button"
                    style={{marginLeft: '20px', backgroundColor: '#DC143C'}}
                    onClick={handleCancelClick}
                    >Cancel Session</button>
                ) : (null)}
                
            </section>
        </form>
        <ConfirmAlert 
              visible={showAlert}
              message="Are you sure you want to cancel the session?"
              onConfirm={handleConfirmCancel}
              onCancel={handleCancelAlert}
              alert={isloading ? <LoadingSpinner/> : 'Leave a message for the student when canceling the session.'}
              service={<textarea 
                cols="30" 
                rows="5" 
                placeholder="Message for the student (optional)"
                style={{padding: '10px',}}
                value={cancelMessage}
                onChange={(e) => setCancelMessage(e.target.value)}
                ></textarea>}
      />
      </>
    );
}

export default EditSessionForm;