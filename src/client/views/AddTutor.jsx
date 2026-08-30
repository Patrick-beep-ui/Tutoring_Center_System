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
                    auth.get("/api/courses/semester/current"),
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
        <div className="min-h-screen bg-[var(--blue)] p-8 font-poppins text-center">
        <h1 className="mb-4 text-center text-3xl font-bold text-[var(--white)]">Add Tutor</h1>
         <section>
        <Link to={'/'} className="inline-block rounded-lg border-2 border-[var(--yellow)] px-4 py-2.5 font-medium text-[var(--yellow)] no-underline transition duration-300 hover:bg-[var(--yellow)] hover:text-[var(--black)]">Go Home</Link>
        </section>
         <section className="mt-8 flex justify-center">
        <form onSubmit={handleSubmit(processData)} className="rounded-2xl bg-[var(--white)] p-8 text-left text-[var(--black)] shadow-[0_4px_20px_rgba(0,0,0,0.15)] [&>section]:mb-5 [&_label]:mb-1.5 [&_label]:block [&_label]:font-medium [&_input]:w-full [&_input]:rounded-lg [&_input]:border-0 [&_input]:bg-[#f0f0f0] [&_input]:p-[0.8rem] [&_input]:text-[0.95rem] [&_input:focus]:outline-2 [&_input:focus]:outline-[var(--yellow)] [&_select]:w-full [&_select]:rounded-lg [&_select]:border-0 [&_select]:bg-[#f0f0f0] [&_select]:p-[0.8rem] [&_select]:text-[0.95rem] [&_select:focus]:outline-2 [&_select:focus]:outline-[var(--yellow)]">
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
                <div key={field.id} className="mb-2 rounded-md border border-border p-2">
                    <div className="mb-4 grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-2">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => {
                        const checkboxId = `schedule-${index}-${day}`;
                        return (
                        <div key={day} className="flex flex-col items-center">
                            <input
                            type="checkbox"
                            id={checkboxId}
                            value={day}
                            {...register(`schedule.${index}.days`)}
                            className="peer hidden!"
                            />
                            <label className="cursor-pointer rounded-md border-2 border-[var(--yellow)] bg-[var(--white)] p-2 text-center text-sm text-[var(--black)] transition duration-300 peer-checked:bg-[var(--yellow)] peer-checked:font-semibold" htmlFor={checkboxId}>{day}</label>
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

      <button type="button" className="mt-2 cursor-pointer rounded-md border-0 bg-[var(--blue)] px-4 py-2 font-medium text-[var(--white)] transition duration-300 hover:-translate-y-px hover:bg-[#0f1c3a]" onClick={() => remove(index)}>Remove</button>
    </div>
  ))}
  <button type="button" className="mt-2 cursor-pointer rounded-md border-0 bg-[var(--blue)] px-4 py-2 font-medium text-[var(--white)] transition duration-300 hover:-translate-y-px hover:bg-[#0f1c3a]" onClick={() => append({ days: [], start_time: "", end_time: "" })}>
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
            <section className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2.5">
            {className.map((classObj) => (
                <div key={classObj.course_id}>
                    <input className="peer hidden!" type="checkbox" id={classObj.course_id} value={classObj.course_id} onChange={handleCheckboxChange}/>
                    <label className="cursor-pointer rounded-lg border-2 border-[var(--yellow)] bg-[var(--white)] p-2.5 text-center text-sm text-[var(--black)] transition duration-300 peer-checked:bg-[var(--yellow)] peer-checked:font-semibold" htmlFor={classObj.course_id}>{classObj.course_name}</label>
                </div>
            ))}
        </section>
        {selectedCourses < 1 && (
            <span className="mt-1.5 block text-sm text-red-500">
                Select at least one course
            </span>
        )}

            <section>
                <button type="submit" className="w-full cursor-pointer rounded-lg border-0 bg-[var(--yellow)] p-[0.9rem] font-semibold text-[var(--black)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#d99a28]">Submit</button>
            </section>

        </form>
        </section>

        </div>
    )
}

export default AddTutor;
