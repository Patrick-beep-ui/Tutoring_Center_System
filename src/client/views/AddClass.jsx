import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast } from 'sonner';
import { useState, memo, useEffect } from "react";
import LoadingSpinner from "../components/ui-snippets/LoadingSpinner";
import auth from "../authService";

function AddClass() {
    const { register, handleSubmit, formState: {errors}} = useForm({mode: "onChange"});
    const navigate = useNavigate();
    const [majors, setMajors] = useState([]);
    const [isLoading, setIsloading] = useState(false);

    const processData = async (formData) => {
        setIsloading(true);
        try {

            const response = await auth.post("/api/courses", formData);
            toast.success("Course added successfully!", { duration: 3000 });

            setTimeout(() => {
              navigate("/classes");
            }, 1000);

            const { classes } = response.data;
            console.log(classes);
        }
        catch (e) {
          // Axios automatically puts response info in e.response
          if (e.response && e.response.status === 409) {
            toast.error(e.response.data.msg, { duration: 3000 });
          } else {
            toast.error("An error occurred", { duration: 3000 });
            console.error(e);
          }
        } finally {
          setIsloading(false);
        }
    }

    useEffect(() => {
      const getMajors = async () => {
        const response = await fetch('/api/majors');
        const data = await response.json();
        setMajors(data.majors);
      }

      getMajors();
    }, []);

    return (
  <div className="min-h-screen bg-[var(--blue)] p-8 font-poppins text-center">
    <h1 className="mt-4 text-center text-3xl font-bold text-[var(--white)]">Add Class</h1>

    <section className="mt-8 flex justify-center">
      <form onSubmit={handleSubmit(processData)} className="w-full max-w-[380px] rounded-2xl bg-[var(--white)] p-8 text-left text-[var(--black)] shadow-[0_4px_20px_rgba(0,0,0,0.15)] [&_label]:mb-1.5 [&_label]:block [&_label]:font-medium [&_input]:mb-4 [&_input]:w-full [&_input]:rounded-lg [&_input]:border-0 [&_input]:bg-[#f0f0f0] [&_input]:p-[0.8rem] [&_input]:text-[0.95rem] [&_input]:text-[var(--black)] [&_input:focus]:outline-2 [&_input:focus]:outline-[var(--yellow)] [&_select]:mb-4 [&_select]:w-full [&_select]:rounded-lg [&_select]:border-0 [&_select]:bg-[#f0f0f0] [&_select]:p-[0.8rem] [&_select]:text-[0.95rem] [&_span]:mt-1.5 [&_span]:block [&_span]:text-sm [&_span]:text-red-500">
        <section>
          <label>Course Name</label>
          <input type="text" {...register("class_name", { required: true })} />
          {errors.class_name && <span>This field is required</span>}
        </section>

        <section>
          <label>Course Code:</label>
          <input type="text" {...register("course_code", { required: true })} />
          {errors.course_code && <span>This field is required</span>}
        </section>

        <section>
          <label>Course Credits:</label>
          <input type="number" {...register("course_credits", { required: true })}  max={5}/>
          {errors.course_credits && <span>This field is required</span>}
        </section>

        <section>
          <label>Major:</label>
          <select {...register("major_id", { required: true })}>
            <option value="">Select Major</option>
            {majors.map((major) => (
              <option key={major.major_id} value={major.major_id}>
                {major.major_name}
              </option>
            ))}
          </select>
          {errors.major_id && <span>This field is required</span>}
        </section>

        <button type="submit" className="w-full cursor-pointer rounded-lg bg-[var(--yellow)] p-[0.9rem] font-semibold text-[var(--black)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#d99a28]"> {isLoading ? <LoadingSpinner /> : 'Save Course'}</button>
      </form>
    </section>

    <div>
      <Link to={"/classes"} className="mt-4 inline-block rounded-lg border-2 border-[var(--yellow)] px-4 py-2.5 font-medium text-[var(--yellow)] no-underline transition duration-300 hover:bg-[var(--yellow)] hover:text-[var(--black)]">Go Back</Link>
    </div>
  </div>
);
}
export default memo(AddClass);
