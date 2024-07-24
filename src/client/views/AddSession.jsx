import { useState, useEffect } from "react";
import { useForm } from "react-hook-form"
import { Link, useNavigate, useParams } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import axios from "axios";

function AddSession() {
    const {register, handleSubmit, formState: { errors }} = useForm({model: "onChange"});
    const navigate = useNavigate();
    const {tutor_id} = useParams();
    const {course_id} = useParams();

    const processData = async (formData) => {
        try {
            const request = await fetch(`/api/sessions/${tutor_id}/${course_id}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData)
            });

            const {sessions} = await request.json();
            console.log(sessions);
            //navigate('/')

            toast.promise(promise(), {
                loading: 'Adding tutor...',
                success: (response) => {
                  return `${response.name} Tutor has been added`;
                },
                error: (error) => `Error: ${error}`,
              });
              navigate('/tutors');
        }
        catch(e) {
            console.error(e);
        }
    }

    return(
        <>
         <Toaster />
         <section className="mt-4 add">
        <form onSubmit={handleSubmit(processData)} className="form-container">
        <h1>Add Tutor</h1>
            <section>
                <label>Student ID:</label>
                <input type="text" {...register("student_id", {required: true})}/>
                {errors.code && <span>This field is required</span>}
            </section>

            <input type="hidden" {...register("semester_id")} value={1} />

            <section>
                <label>Date:</label>
                <input type="date" {...register("session_date", {required: true})}/>
                {errors.code && <span>This field is required</span>}
            </section>
            <section>
                <label>Start Time: </label>
                <input type="time" {...register("session_time", {required: true})} />
                {errors.code && <span>This field is required</span>}
            </section>
            <section>
                <label>Session Hours:</label>
                <input type="number" {...register("session_hours", {required: true})}/>
                {errors.code && <span>This field is required</span>}
            </section>
            <section>
                <label>Outcomes:</label>
                <textarea cols="30" rows="10" {...register("feedback", {required: true})}></textarea>
                {errors.code && <span>This field is required</span>}
            </section>

            <section>
                <button type="submit">Submit</button>
            </section>

        </form>
        </section>

        </>
    )
}

export default AddSession;