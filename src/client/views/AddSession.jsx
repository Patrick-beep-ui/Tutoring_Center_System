import { useState } from "react";
import { useForm } from "react-hook-form"
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from 'sonner';
import Header from "../components/Header";
import LoadingSpinner from "../components/ui-snippets/LoadingSpinner";

import { Card, CardHeader, CardContent } from 'semantic-ui-react'; 

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
            const request = await fetch(`/api/sessions/${tutor_id}/${course_id}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData)
            });

            if (!request.ok) throw new Error('Failed to add session');

            const data = await request.json();
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
        }
        finally {
            setIsloading(false);
        }
    }

    return(
        <>
        {/*<Toaster position="top-right" richColors />*/}
         <Header />
        <section className="add-session-container section">
            <div className="add-session-form-container">
                <form onSubmit={handleSubmit(processData)} className="form-container add-session-form">
                <h1>Add Tutoring Session</h1>
                <div className="session-data-container">
                    <section>
                        <label>Student ID:</label>
                        <input type="text" {...register("student_id", {required: true})}/>
                        {errors.code && <span>This field is required</span>}
                    </section>

                    <input type="hidden" {...register("semester_id")} value={1} />

                    <div className="datetime-data"> 
                        <section id="date-form-group">
                            <label>Date:</label>
                            <input type="date" {...register("session_date", {required: true})}/>
                            {errors.code && <span>This field is required</span>}
                        </section>
                        <section id="time-form-group">
                            <label>Start Time: </label>
                            <input type="time" {...register("session_time", {required: true})} />
                            {errors.code && <span>This field is required</span>}
                        </section>
                    </div>
                    <section>
                        <label>Session Duration in Hours:</label>
                        <input type="number" {...register("session_hours", {required: true})}/>
                        {errors.code && <span>This field is required</span>}
                    </section>
                    <section>
                        <label>Session Topics</label>
                        <textarea cols="30" rows="2" {...register("session_topics", {required: true})}></textarea>
                        {errors.code && <span>This field is required</span>}
                    </section>
                </div>

                    <div className="session-outcomes-container">
                        <section>
                            <label>Outcomes:</label>
                            <textarea cols="30" rows="3" {...register("feedback", {required: true})}></textarea>
                            {errors.code && <span>This field is required</span>}
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