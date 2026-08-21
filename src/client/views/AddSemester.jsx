import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useCallback } from "react";
import { toast } from "sonner";
import auth from "../authService";

function AddSemester() {
    const { register, handleSubmit, formState: {errors}} = useForm({mode: "onChange"});
    const navigate = useNavigate();

    const processData = useCallback(async (formData) => {
        try {
            await auth.post("/api/terms", formData);
            toast.success("Semester added successfully!", { duration: 3000 });

            setTimeout(() => {
                navigate("/semesters");
              }, 1000);
        }
        catch (e) {
            if (e.response && e.response.status === 409) {
              toast.error(e.response.data.msg || "This semester already exists", { duration: 3000 });
            } else {
              toast.error(`An error occurred: ${e.message}`, { duration: 3000 });
              console.error(e);
            }
          }
    }, [navigate]);

    return(<div className="add-semester-page">
        <h1>Add Semester</h1>

        <section className="mt-4 add">
        <form onSubmit={handleSubmit(processData)} className="form-container">
            <section>
                <label>Term: </label>
                <select {...register("semester_type", {required: true})}>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Fall">Fall</option>
                </select>
                {errors.semester_type && <span>This field is required</span>}
            </section>
            <section>
                <label>Semester Code:</label>
                <input type="text" {...register("semester_code", {required: true})} />
                {errors.semester_code && <span>This field is required</span>}
            </section>
            <section>
                <label>Semester Year:</label>
                <input type="text" {...register("semester_year", {required: true})} />
                {errors.semester_year && <span>This field is required</span>}
            </section>
            <section>
                <label>Amount of weeks:</label>
                <input type="number" {...register("weeks", {required: true})} />
                {errors.weeks && <span>This field is required</span>}
            </section>
            <section>
                <label>Start Date:</label>
                <input type="date" {...register("start_date")} />
                {errors.start_date && <span>This field is required</span>}
            </section>

            <button type="submit">Submit</button>

        </form>
        </section>

        <div>
            <Link to={"/semesters"}>See Semesters</Link>
        </div>
        </div>
    )
}

export default AddSemester;
