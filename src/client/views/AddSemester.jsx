import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function AddSemester() {
    const { register, handleSubmit, formState: {errors}} = useForm({mode: "onChange"});
    const navigate = useNavigate();

    const processData = async (formData) => {
        try {
            const request = await fetch("/api/terms", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData)
            });
            const {classes} = await request.json();
            console.log(classes);
        }
        catch(e) {
            console.error(e);
        }
    }

    return(
        <>
        <h1>Add Semester</h1>

        <section className="mt-4 add">
        <form onSubmit={handleSubmit(processData)} className="form-container">
            <section>
                <label>Term: </label>
                <select>
                    <option value="Spring" {...register("semester_type")}>Spring</option>
                    <option value="Summer" {...register("semester_type")}>Summer</option><option value="Fall" {...register("semester_type")}>Fall</option>
                </select>
                {errors.code && <span>This field is required</span>}
            </section>
            <section>
                <label>Semester Code:</label>
                <input type="text" {...register("semester_code", {required: true})} />
                {errors.code && <span>This field is required</span>}
            </section>
            <section>
                <label>Semester Year:</label>
                <input type="text" {...register("semester_year", {required: true})} />
                {errors.code && <span>This field is required</span>}
            </section>
            <section>
                <label>Amount of weeks:</label>
                <input type="number" {...register("weeks", {required: true})} />
                {errors.code && <span>This field is required</span>}
            </section>

            <button type="submit">Submit</button>

        </form>
        </section>

        <div>
            <Link to={"/classes"}>See Classes</Link>
        </div>
        </>
    )
}

export default AddSemester;