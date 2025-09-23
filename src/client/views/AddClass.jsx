import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast } from 'sonner';
import { useState, memo, useEffect } from "react";
import LoadingSpinner from "../components/ui-snippets/LoadingSpinner";

function AddClass() {
    const { register, handleSubmit, formState: {errors}} = useForm({mode: "onChange"});
    const navigate = useNavigate();
    const [majors, setMajors] = useState([]);
    const [isLoading, setIsloading] = useState(false);

    const processData = async (formData) => {
        setIsloading(true);
        try {
            const request = await fetch("/api/courses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData)
            });

            if (request.status === 409) {
              const { msg } = await request.json();
              toast.error(msg, { duration: 3000 });
              return; 
            }

            if (!request.ok) throw new Error('Failed to add course');

            toast.success('Course added successfully!', {
              duration: 3000
            });  
            setTimeout(() => {
              navigate(`/classes`);
            }, 1000);

            const {classes} = await request.json();
            console.log(classes);
        }
        catch(e) {
            console.error(e);
            toast.error('An error occurred', { duration: 3000 });
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