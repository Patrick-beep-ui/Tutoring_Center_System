import { useForm } from "react-hook-form";

const EditSessionForm = ({ session, session_id }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onChange" });
   

    const processData = async (formData) => {
        try {
            const request = await fetch(`/api/edit-session/${session_id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData)
            });

            const { session } = await request.json();
            console.log(session);

        } catch (e) {
            console.error(e);
        }
    }

    if (session.length === 0) {
        return <div>Loading...</div>; // Display a loading message or spinner
    }

    return (
        <form onSubmit={handleSubmit(processData)} className="form-container edit-session-form">
            <section>
                <label>Course: </label>
                <p>{session[0].course_name}</p>
            </section>
            <section>
                <label>Scheduled By: </label>
                <p>{session[0].scheduled_by}</p>
            </section>
            <div className="datetime-data">
                <section>
                    <label>Date: </label>
                    <input type="date" {...register("session_date")} defaultValue={session[0].session_date} />
                </section>
                <section>
                    <label>Start Time: </label>
                    <input type="time" {...register("session_time")} defaultValue={session[0].session_time} />
                </section>
            </div>
            <section>
                <label>Duration: </label>
                <input type="number" {...register("session_hours")} defaultValue={session[0].session_durarion} />
            </section>
            <section className="session-feedback-container">
                <label>Feedback: </label>
                <textarea cols="30" rows="10" {...register("feedback")}></textarea>
            </section>
            <section className="edit-session-btn-container">
                <button type="submit">Complete</button>
            </section>
        </form>
    );
}

export default EditSessionForm;
