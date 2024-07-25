import { useState, useEffect } from "react";
import { useForm } from "react-hook-form"
import { Link, useNavigate, useParams, useOutletContext } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import axios from "axios";

const ScheduleSession = (props) => {
    const {register, handleSubmit, formState: { errors }} = useForm({model: "onChange"});
    const [course, setCourse] = useState([]);
    const { user } = useOutletContext();
    const {tutor_id, selectedDate, onSubmit} = props;

    useEffect(() => {
        const getCourses = async () => {
            try {
                const response = await axios.get(`/api/courses/${tutor_id}`)
                const {data} = response
                setCourse(data.tutor_classes)
            }
            catch(e) {
                console.error(e)
            }
        }

        getCourses();
    }, [])

    const processData = async (formData) => {
        try {
            const request = await fetch(`/api/calendar-sessions/${tutor_id}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData)
            });

            const {sessions} = await request.json();
            console.log(sessions);

              if(onSubmit) {
                onSubmit();
              }
              
        }
        catch(e) {
            console.error(e);
        }
    }

    return(
        <form onSubmit={handleSubmit(processData)} className="form-container schedule-session-form">
        <h1>Schedule Session</h1>
            <input type="text" {...register("student_id")} value={user.ku_id} hidden />
            <input type="hidden" {...register("semester_id")} value={1} />

            <input type="hidden" {...register("created_by")} value={user.user_id} />

            <section>
                <label>Course: </label>
                <select {...register("course")}>
                    {course.map((c, index) => (
                        <option value={c.course_id} key={index}>
                            {c.course_name}
                        </option>
                    ))}
                </select>
            </section>
                <input type="date" {...register("session_date")}  value={selectedDate} hidden/>
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
                <button type="submit">Submit</button>
            </section>

        </form>
    )

}

export default ScheduleSession;