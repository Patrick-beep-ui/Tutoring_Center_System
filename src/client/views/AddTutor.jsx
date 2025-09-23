import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray  } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import axios from "axios";

function AddTutor() {
    const { register, handleSubmit, control, formState: { errors } } = useForm({ mode: "onChange" });
    const { fields, append, remove } = useFieldArray({
        control,
        name: "schedule"
    });
    const [className, setClass] = useState([]);
    const [major, setMajor] = useState([]);
    const navigate = useNavigate()

    const processData = async (formData) => {
        try {
            const request = await fetch("/api/tutors", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData)
            });

            const {tutors} = await request.json();
            console.log(tutors)
            navigate('/tutors');

            toast.promise(promise(), {
                loading: 'Adding tutor...',
                success: (response) => {
                  return `${response.name} Tutor has been added`;
                },
                error: (error) => `Error: ${error}`,
              });
        }
        catch(e) {
            console.error(e);
        }
    }


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [classesResponse, majorsResponse] = await Promise.all([
                    axios.get("/api/courses"),
                    axios.get("/api/majors")
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
    

    function handleCheckboxChange(event) {
        const isChecked = event.target.checked;
        const label = event.target.nextElementSibling;
    
        if (isChecked) {
            label.classList.add('highlighted');
            
        } else {
            label.classList.remove('highlighted');
        }
    }

    function handleElementChange(event) {
        const isChecked = event.target.checked;
        const input = event.target;
    
        if (isChecked) {
            input.classList.add('highlighted');
            
        } else {
            input.classList.remove('highlighted');
        }
    }

    return(
        <div className="add-tutor-page">
        <h1>Add Tutor</h1>
         <Toaster />
         <section>
        <Link to={'/'}>Go Home</Link>
        </section>
         <section className="mt-1 add">
        <form onSubmit={handleSubmit(processData)} className="form-container">
            <section>
                <label>Tutor ID:</label>
                <input type="text" {...register("id", {required: true})}/>
                {errors.code && <span>This field is required</span>}
            </section>
            <section>
                <label>Tutor First Name:</label>
                <input type="text" {...register("first_name", {required: true})}/>
                {errors.code && <span>This field is required</span>}
            </section>
            <section>
                <label>Tutor Last Name:</label>
                <input type="text" {...register("last_name", {required: true})}/>
                {errors.code && <span>This field is required</span>}
            </section>
            <section>
                <label>Tutor Email:</label>
                <input type="email" {...register("email", {required: true})}/>
                {errors.code && <span>This field is required</span>}
            </section>
            <section>
                <label>Phone Number:</label>
                <input type="text" {...register("phone_number", {required: true})} />
                {errors.code && <span>This field is required</span>}
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
            {className.map(classObj => (
                <div key={classObj.course_id}>
                    <input type="checkbox" id={classObj.course_id} value={classObj.course_id} {...register("class-option", {required: true})} onChange={handleCheckboxChange}/>
                    <label htmlFor={classObj.course_id}>{classObj.course_name}</label>
                </div>
            ))}
        </section>

            <section>
                <button type="submit">Submit</button>
            </section>

        </form>
        </section>

        </div>
    )
}

export default AddTutor;