import { useForm } from "react-hook-form";
import { toast } from 'sonner';
import { useState, useCallback, useEffect } from "react";
import LoadingSpinner from "./ui-snippets/LoadingSpinner";
import ConfirmAlert from "./ui-snippets/ConfirmAlert";
import auth from "../authService";

const EditSessionForm = ({ session, session_id, tutor_id, navigate, source, userRole }) => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm({ mode: "onChange" });
    const [isloading, setIsloading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [cancelMessage, setCancelMessage] = useState('');
    const [allTutors, setAllTutors] = useState([]);
    const [allCourses, setAllCourses] = useState([]);

    const isAdmin = userRole === 'admin' || userRole === 'dev';

    useEffect(() => {
        if (!isAdmin) return;
        const fetchData = async () => {
            try {
                const [tutorsRes, coursesRes] = await Promise.all([
                    auth.get("/api/tutors"),
                    auth.get("/api/courses")
                ]);
                setAllTutors(tutorsRes.data.tutors || []);
                setAllCourses(coursesRes.data.courses || []);
            } catch (e) {
                console.error("Error fetching tutors/courses:", e);
            }
        };
        fetchData();
    }, [isAdmin]);

    const processData = async (formData) => {
        setIsloading(true);
        try {            
            const response = await auth.put(`/api/sessions/session/${session_id}`, formData);
            const {session: updatedSession} = response.data;

            toast.success('Session updated successfully!', {
                duration: 3000
              });  
              setTimeout(() => {
                navigate(`/profile/tutor/${tutor_id}`);
              }, 1000);

              console.log('Updated session:', updatedSession);

        } catch (e) {
            console.error(e);
            toast.error(`Error: ${e.response?.data?.error || e.message}`);
        } finally {
            setIsloading(false);
        }
    }

    const cancelSession = useCallback(async () => {
        setIsloading(true);
        try {
            const url = `/api/sessions/session/${session_id}`
            await auth.patch(url, { message: cancelMessage });

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
        return <div>Loading...</div>;
    }

    return (
        <>
        <form onSubmit={handleSubmit(processData)} className="form-container edit-session-form">
            {isAdmin ? (
                <>
                    <section>
                        <label>Course: </label>
                        <select {...register("course_id")} defaultValue={session.course_id || ''}>
                            {allCourses.map(c => (
                                <option key={c.course_id} value={c.course_id}>{c.course_name} ({c.course_code})</option>
                            ))}
                        </select>
                    </section>
                    <section>
                        <label>Tutor: </label>
                        <select {...register("tutor_id")} defaultValue={tutor_id || ''}>
                            {allTutors.map(t => (
                                <option key={t.id} value={t.id}>{t.tutor_name} ({t.tutor_email})</option>
                            ))}
                        </select>
                    </section>
                    <section>
                        <label>Student ID: </label>
                        <input type="text" {...register("student_id")} defaultValue={session.student_ku_id || session.student_id || ''} />
                    </section>
                </>
            ) : (
                <>
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
                </>
            )}
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
                    {isloading ? <LoadingSpinner /> : 'Save'}
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
