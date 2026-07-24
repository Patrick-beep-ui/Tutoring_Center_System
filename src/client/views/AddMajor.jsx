import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useCallback } from "react";
import { toast } from "sonner";
import auth from "../authService";

function AddMajor() {
    const { register, handleSubmit, formState: {errors}} = useForm({mode: "onChange"});
    const navigate = useNavigate();

    const processData = useCallback(async (formData) => {
        try {
            await auth.post("/api/majors", formData);
            toast.success("Major added successfully!", { duration: 3000 });

            setTimeout(() => {
                navigate("/majors");
              }, 1000);
        }
        catch (e) {
            if (e.response && e.response.status === 409) {
              toast.error(e.response.data.msg || "This major already exists", { duration: 3000 });
            } else {
              toast.error(`An error occurred while adding the major: ${e.message}`, { duration: 3000 });
              console.error(e);
            }
          }
    }, [navigate]);

    return( <div className="add-class-page">
        <h1>Add Major</h1>

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
                {errors.major_name && <span>This field is required</span>}
            </section>

            <button type="submit">Submit</button>

        </form>
        </section>

        <div>
            <Link to={"/majors"}>See Majors</Link>
        </div>
        </div>
    )
}

export default AddMajor;
