import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray  } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'sonner';
import auth from "../authService";

function AddTutor() {
    const { register, handleSubmit, control, formState: { errors } } = useForm({ mode: "onChange" });
    const { fields, append, remove } = useFieldArray({
        control,
        name: "schedule"
    });
    const [className, setClass] = useState([]);
    const [major, setMajor] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const navigate = useNavigate()

    const processData = useCallback(async (formData) => {

        if(selectedCourses.length < 1) {
            toast.error("Select at least one course");
            return;
        }

        try {
            toast.loading("Adding tutor...");

            const data = { ...formData, class_option: selectedCourses };

            const response = await auth.post("/api/tutors", 
                data
            );
            const { tutors } = response.data;

            console.log(tutors)

            toast.dismiss();
            toast.success(`Tutor added successfully`);

            navigate('/tutors');
        }
        catch(e) {
            toast.dismiss();
            console.error(e);
            toast.error(`Error: ${e.response?.data?.message || e.message}`);
        }
    },[selectedCourses, navigate]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [classesResponse, majorsResponse] = await Promise.all([
                    auth.get("/api/courses"),
                    auth.get("/api/majors")
                ]);
    
                const classesData = classesResponse.data.courses;
                const majorsData = majorsResponse.data.majors;
    
                console.log("Classes:", classesData);
                console.log("Majors:", majorsData);
    
                setClass(classesData);
                setMajor(majorsData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
    
        fetchData();
    }, []);
    

    const handleCheckboxChange = useCallback((event) => {
        const isChecked = event.target.checked;
        const label = event.target.nextElementSibling;
        const courseId = event.target.value;
    
        if (isChecked) {
            label.classList.add('highlighted');
            setSelectedCourses((prev) => [...prev, courseId]);
            
        } else {
            label.classList.remove('highlighted');
        }
    }, [])

    console.log("Form errors:", errors);
    console.log("Selected Courses:", selectedCourses);

    return(
        <div className="add-tutor-page">
        <h1>Add Tutor</h1>
         <section>
        <Link to={'/'}>Go Home</Link>
        </section>
         <section className="mt-1 add">
        <form onSubmit={handleSubmit(processData)} className="form-container">
            <section>
                <label>Tutor ID:</label>
                <input type="text" {...register("id", {required: true})}/>
                {errors.id && <span>{errors.id.message}</span>}
            </section>
            <section>
                <label>Tutor First Name:</label>
                <input type="text" {...register("first_name", {required: true})}/>
                {errors.first_name && <span>{errors.first_name.message}</span>}
            </section>
            <section>
                <label>Tutor Last Name:</label>
                <input type="text" {...register("last_name", {required: true})}/>
                {errors.last_name && <span>{errors.last_name.message}</span>}
            </section>
            <section>
                <label>Tutor Email:</label>
                <input type="email" {...register("email", {required: true})}/>
                {errors.email && <span>{errors.email.message}</span>}
            </section>
            <section>
                <label>Phone Number:</label>
                <input type="text" {...register("phone_number", {required: true})} />
                {errors.phone_number && <span>{errors.phone_number.message}</span>}
            </section>

            {/* Schedule Fields */}
            <section>
            <label>Schedule:</label>
            {fields.map((field, index) => (
                <div key={field.id} className="mb-2 p-2 border rounded">
                    <div className="days-grid">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => {
                        const checkboxId = `schedule-${index}-${day}`;
                        return (
                        <div key={day} className="day-checkbox">
                            <input
                            type="checkbox"
                            id={checkboxId}
                            value={day}
                            {...register(`schedule.${index}.days`)}
                            className="hidden-checkbox"
                            />
                            <label htmlFor={checkboxId}>{day}</label>
                        </div>
                        );
                    })}
                </div>


      <div>
        <label>Start Time:</label>
        <input
          type="time"
          {...register(`schedule.${index}.start_time`, { required: true })}
        />
      </div>

      <div>
        <label>End Time:</label>
        <input
          type="time"
          {...register(`schedule.${index}.end_time`, { required: true })}
        />
      </div>

      <button type="button" onClick={() => remove(index)}>Remove</button>
    </div>
  ))}
  <button type="button" onClick={() => append({ days: [], start_time: "", end_time: "" })}>
    Add Schedule Block
  </button>
</section>


            <section>
                <label>Tutor Major:</label>
                <select {...register("major")}>
                    {major.map((major, index) => (
                        <option value={major.major_id} key={index}>
                            {major.major_name}
                        </option>
                    ))}
                </select>
            </section>
            <label>Tutor Courses:</label>
            <section className="classes">
            {className.map((classObj) => (
                <div key={classObj.course_id}>
                    <input type="checkbox" id={classObj.course_id} value={classObj.course_id} onChange={handleCheckboxChange}/>
                    <label htmlFor={classObj.course_id}>{classObj.course_name}</label>
                </div>
            ))}
        </section>
        {selectedCourses < 1 && (
            <span className="error">
                Select at least one course
            </span>
        )}

            <section>
                <button type="submit">Submit</button>
            </section>

        </form>
        </section>

        </div>
    )
}

export default AddTutor;