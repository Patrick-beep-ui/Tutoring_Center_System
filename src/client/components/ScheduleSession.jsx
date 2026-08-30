import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form"
import { useOutletContext } from "react-router-dom";
import { toast } from 'sonner';
import auth from "../authService";

const ScheduleSession = (props) => {
    const {register, handleSubmit, formState: { errors }, setValue } = useForm({model: "onChange"});
    const [course, setCourse] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const { user } = useOutletContext();
    const {tutor_id, selectedDate, onSubmit} = props;
    const [isLoading, setIsLoading] = useState(false);

    console.log(user.user_id)

    useEffect(() => {
        const getCourses = async () => {
            try {
                const response = await auth.get(`/api/courses/${tutor_id}`)
                const {data} = response
                setCourse(data.tutor_classes)

                setSelectedCourse(data.tutor_classes[0].course_id);
                setValue("course", data.tutor_classes[0].course_id);
            }
            catch(e) {
                console.error(e)
            }
        }

        getCourses();
    }, [])

    //Comentario para hacer pull request

    const processData = useCallback(async (formData) => {
        setIsLoading(true);
        try {

            const response = await auth.post(`/api/calendar-session/${tutor_id}`, formData);
            const { sessions } = response.data;
    
            if (onSubmit) {
                onSubmit();
            }

            console.log('Scheduled session:', sessions);
            toast.success('Session scheduled successfully!', {
                duration: 3000
              });
    
        } catch (e) {
            console.error(e);
        }
        finally {
            setIsLoading(false);
        }
    }, [tutor_id, onSubmit]); 
    

    return(
        <form onSubmit={handleSubmit(processData)} className="flex w-full flex-col [&_section]:mb-4 [&_section]:flex [&_section]:shrink-0 [&_section]:flex-col [&_label]:mb-1.5 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-[var(--black)] [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-[var(--gray)] [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-2.5 [&_input]:text-[0.95rem] [&_input:focus]:border-[var(--blue)] [&_input:focus]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-[var(--gray)] [&_select]:bg-white [&_select]:px-3.5 [&_select]:py-2.5 [&_select]:text-[0.95rem] [&_select:focus]:border-[var(--blue)] [&_select:focus]:outline-none [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-[var(--gray)] [&_textarea]:bg-white [&_textarea]:px-3.5 [&_textarea]:py-2.5 [&_textarea]:text-[0.95rem] [&_textarea:focus]:border-[var(--blue)] [&_textarea:focus]:outline-none">
        <h1 className="mb-4 shrink-0 text-center text-xl font-semibold text-[var(--blue)]">Schedule Session</h1>
            <input type="text" {...register("student_id")} value={user.ku_id} hidden />
            <input type="hidden" {...register("created_by")} value={user.user_id} />

            <section>
                <label>Course: </label>
                <select {...register("course")} value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
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
                <label>Topics to be discussed:</label>
                <textarea cols="30" rows="5" {...register("session_topics")}></textarea>
            </section>

            <section>
                <button type="submit" className="min-w-[100px] cursor-pointer rounded-lg border-0 bg-[var(--blue)] px-5 py-2.5 text-sm font-semibold text-[var(--white)] transition-all hover:-translate-y-px hover:bg-[var(--yellow)] hover:text-[var(--black)]">{isLoading ? "Sending..." : "Submit"}</button>
            </section>

        </form>
    )

}

export default ScheduleSession;
