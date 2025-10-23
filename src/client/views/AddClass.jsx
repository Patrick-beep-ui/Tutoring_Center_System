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
  <div className="add-class-page">
    <h1 className="bg-blue">Add Class</h1>

    <section className="mt-4 add">
      <form onSubmit={handleSubmit(processData)} className="form-container">
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

        <button type="submit"> {isLoading ? <LoadingSpinner /> : 'Save Course'}</button>
      </form>
    </section>

    <div>
      <Link to={"/classes"}>Go Back</Link>
    </div>
  </div>
);
}
export default memo(AddClass);