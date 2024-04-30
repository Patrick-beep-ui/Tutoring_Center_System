import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function AddClass() {
    const { register, handleSubmit, formState: {errors}} = useForm({mode: "onChange"});
    const navigate = useNavigate();

    const processData = async (formData) => {
        try {
            const request = await fetch("/api/majors", {
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
        <h1>Add Class</h1>

        <section>
        <Link to={'/'}>Go Home</Link>
        </section>

        <section className="mt-4 add">
        <form onSubmit={handleSubmit(processData)} className="form-container">
            <section>
                <label>Major Name</label>
                <input type="text" {...register("major_name", {
                    required: true
                })} />
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

export default AddClass;