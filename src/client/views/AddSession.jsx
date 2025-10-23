import { useState } from "react";
import { useForm } from "react-hook-form"
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from 'sonner';
import Header from "../components/Header";
import LoadingSpinner from "../components/ui-snippets/LoadingSpinner"; 
import auth from "../authService";

function AddSession() {
    const {register, handleSubmit, formState: { errors }} = useForm({model: "onChange"});
    const navigate = useNavigate();
    const { tutor_id, course_id } = useParams();
    const [isloading, setIsloading] = useState(false);
    const location = useLocation();
    const source = location.state?.source || "tutor";

    const processData = async (formData) => {
        setIsloading(true);
        try {
            const response = await auth.post(`/api/sessions/${tutor_id}/${course_id}`, formData);

            const {data} = response;
            console.log(data);

            toast.success('Session added successfully!', {
                duration: 3000
              });  
              setTimeout(() => {
                navigate(`/sessions/tutor/${tutor_id}/${course_id}`);
              }, 1000);
              
        }
        catch(e) {
            console.error(e);
            toast.error(`An error occurred while adding the session: ${e.message}`, { duration: 3000 });
        }
        finally {
            setIsloading(false);
        }
    }

    return(
        <>
         <Header />
        <section className="add-session-container section">
            <div className="add-session-form-container">
                <form onSubmit={handleSubmit(processData)} className="form-container add-session-form">
                <h1>Add Tutoring Session</h1>
                <div className="session-data-container">
                    <section>
                        <label>Student ID:</label>
                        <input type="text" {...register("student_id", {required: true})}/>
                        {errors.student_id && <span>{errors.student_id.message}</span>}
                    </section>

                    <input type="hidden" {...register("semester_id")} value={1} />

                    <div className="datetime-data"> 
                        <section id="date-form-group">
                            <label>Date:</label>
                            <input type="date" {...register("session_date", {required: true})}/>
                            {errors.session_date && <span>{errors.session_date.message}</span>}
                        </section>
                        <section id="time-form-group">
                            <label>Start Time: </label>
                            <input type="time" {...register("session_time", {required: true})} />
                            {errors.session_time && <span>{errors.session_time.message}</span>}
                        </section>
                    </div>
                    <section>
                        <label>Session Duration in Hours:</label>
                        <input type="number" {...register("session_hours", {required: true})}/>
                        {errors.session_hours && <span>{errors.session_hours.message}</span>}
                    </section>
                    <section>
                        <label>Session Topics</label>
                        <textarea cols="30" rows="2" {...register("session_topics", {required: true})}></textarea>
                        {errors.session_topics && <span>{errors.session_topics.message}</span>}
                    </section>
                </div>

                    <div className="session-outcomes-container">
                        <section>
                            <label>Outcomes:</label>
                            <textarea cols="30" rows="3" {...register("feedback", {required: true})}></textarea>
                            {errors.feedback && <span>{errors.feedback.message}</span>}
                        </section>
                    </div>

                    <div className="add-session-btns">
                        <Link to={`/sessions/${source}/${tutor_id}/${course_id}`}>
                            <button className="btn btn-danger cancel-btn">Cancel</button>
                        </Link>
                        <button type="submit">
                            {isloading ? <LoadingSpinner /> : 'Save Session'}
                        </button> 
                    </div>
                   

                </form>
            </div>
        </section>

        </>
    )
}

export default AddSession;