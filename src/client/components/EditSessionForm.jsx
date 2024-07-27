import { useState, useEffect } from "react";
import { useForm } from "react-hook-form"
import { Link, useNavigate, useParams, useOutletContext } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import axios from "axios";

const EditSessionForm = ({session, session_id}) => {
    const {register, handleSubmit, formState: { errors }} = useForm({model: "onChange"});
    const navigate = useNavigate();

    const processData = async (formData) => {
        try {
            const request = await fetch(`/api/edit-session/${session_id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData)
            });

            const {session} = await request.json();
            console.log(session);
              
        }
        catch(e) {
            console.error(e);
        }
    }


    return(
        <form onSubmit={handleSubmit(processData)} 
        className="form-container edit-session-form">
            <section>
                <label>Course: </label>
                <input type="text" {...register("course")} value={session.course_name} disabled />    
            </section>
            <section>
                <label>Scheduled By: </label>
                <input type="text" {...register("created_by")} value={session.scheduled_by} disabled/>    
            </section>
            <section>
                <label>Date: </label>
                <input type="date" {...register("session_date")} value={session.session_date} />
            </section>
            <section>
                <label>Start Time: </label>
                <input type="time" {...register("session_time")} value={session.session_time} />    
            </section>
            <section>
                <label>Duration: </label>
                <input type="number" {...register("session_hours")} value={session.session_durarion} />    
            </section>
            <section>
                <label>Feedback: </label>
                <textarea cols="30" rows="10" {...register("feedback")} ></textarea>
            </section>
            <section>
                <button type="submit">Complete</button>
            </section>
        </form>
    )

} 

export default EditSessionForm