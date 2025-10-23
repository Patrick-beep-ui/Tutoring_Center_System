import { useForm } from "react-hook-form";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCallback } from "react";
import { toast } from "sonner";
import auth from "../authService";

function AddClass() {
    const { register, handleSubmit, formState: {errors}} = useForm({mode: "onChange"});
    const navigate = useNavigate();

    const processData = useCallback(async (formData) => {
        try {
            const response = await auth.post("/api/majors", formData);
            toast.success("Major added successfully!", { duration: 3000 });

            setTimeout(() => {
                navigate("/classes");
              }, 1000);

            console.log("Added major:", response.data);
        }
        catch (e) {
            if (e.response && e.response.status === 409) {
              // Duplicate entry error
              toast.error(e.response.data.msg || "This major already exists", { duration: 3000 });
            } else {
              toast.error(`An error occurred while adding the major: ${e.message}`, { duration: 3000 });
              console.error(e);
            }
          }
    }, [navigate]);

    return( <div className="add-class-page">
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
        </div>
    )
}

export default AddClass;