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
        <section className="section flex items-start justify-center pt-20">
            <div className="max-w-[600px] items-center rounded-2xl border border-[var(--gray)] bg-[var(--white)] px-[9%] py-0.5 shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
                <form onSubmit={handleSubmit(processData)} className="w-full max-w-[500px] px-5 pb-2.5 pt-5 text-left [&_label]:mb-1 [&_label]:font-semibold [&_label]:text-[var(--black)] [&_section]:mb-3 [&_section]:flex [&_section]:flex-col [&_span]:mt-0.5 [&_span]:text-sm [&_span]:text-red-600 [&_input]:rounded-lg [&_input]:border [&_input]:border-[var(--gray)] [&_input]:bg-white [&_input]:px-2.5 [&_input]:py-1.5 [&_input]:text-[0.95rem] [&_input:focus]:border-[var(--blue)] [&_input:focus]:outline-none [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-[var(--gray)] [&_textarea]:bg-white [&_textarea]:px-2.5 [&_textarea]:py-1.5 [&_textarea]:text-[0.95rem] [&_textarea:focus]:border-[var(--blue)] [&_textarea:focus]:outline-none">
                <h1 className="inline-block border-b-2 border-[var(--yellow)] text-[1.4rem] font-semibold text-[var(--blue)]">Add Tutoring Session</h1>
                <div>
                    <section>
                        <label>Student ID:</label>
                        <input type="text" {...register("student_id", {required: true})}/>
                        {errors.student_id && <span>{errors.student_id.message}</span>}
                    </section>

                    <div className="flex gap-5 max-md:flex-col max-md:gap-3 [&_section]:flex-1">
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

                    <div className="flex items-center justify-center border-b border-[#dbd8d8ef]">
                        <section className="w-full text-left">
                            <label>Outcomes:</label>
                            <textarea cols="30" rows="3" {...register("feedback", {required: true})}></textarea>
                            {errors.feedback && <span>{errors.feedback.message}</span>}
                        </section>
                    </div>

                    <div className="mt-4 flex justify-end gap-3">
                        <Link
                            to={`/sessions/${source}/${tutor_id}/${course_id}`}
                            className="inline-flex items-center rounded-lg bg-[#f5f5f5] px-[18px] py-2 text-sm font-semibold text-[var(--dark-gray)] transition-colors hover:bg-[var(--gray)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2"
                        >
                            Cancel
                        </Link>
                        <button type="submit" className="cursor-pointer rounded-lg border-0 bg-[var(--blue)] px-[18px] py-2 text-sm font-semibold text-[var(--white)] transition-colors hover:bg-[var(--yellow)] hover:text-[var(--black)]">
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
