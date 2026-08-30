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

    return( <div className="min-h-screen bg-[var(--blue)] p-8 font-poppins text-center">
        <h1 className="mt-4 text-center text-3xl font-bold text-[var(--white)]">Add Major</h1>

        <section>
        <Link to={'/'} className="mt-4 inline-block rounded-lg border-2 border-[var(--yellow)] px-4 py-2.5 font-medium text-[var(--yellow)] no-underline transition duration-300 hover:bg-[var(--yellow)] hover:text-[var(--black)]">Go Home</Link>
        </section>

        <section className="mt-8 flex justify-center">
        <form onSubmit={handleSubmit(processData)} className="w-full max-w-[380px] rounded-2xl bg-[var(--white)] p-8 text-left text-[var(--black)] shadow-[0_4px_20px_rgba(0,0,0,0.15)] [&_label]:mb-1.5 [&_label]:block [&_label]:font-medium [&_input]:mb-4 [&_input]:w-full [&_input]:rounded-lg [&_input]:border-0 [&_input]:bg-[#f0f0f0] [&_input]:p-[0.8rem] [&_input]:text-[0.95rem] [&_input:focus]:outline-2 [&_input:focus]:outline-[var(--yellow)] [&_span]:mt-1.5 [&_span]:block [&_span]:text-sm [&_span]:text-red-500">
            <section>
                <label>Major Name</label>
                <input type="text" {...register("major_name", {
                    required: true
                })} />
                {errors.major_name && <span>This field is required</span>}
            </section>

            <button type="submit" className="w-full cursor-pointer rounded-lg bg-[var(--yellow)] p-[0.9rem] font-semibold text-[var(--black)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#d99a28]">Submit</button>

        </form>
        </section>

        <div>
            <Link to={"/majors"} className="mt-4 inline-block rounded-lg border-2 border-[var(--yellow)] px-4 py-2.5 font-medium text-[var(--yellow)] no-underline transition duration-300 hover:bg-[var(--yellow)] hover:text-[var(--black)]">See Majors</Link>
        </div>
        </div>
    )
}

export default AddMajor;
