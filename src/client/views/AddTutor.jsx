import { useState, useEffect } from "react";
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import axios from "axios";

function AddTutor() {
    const {register, handleSubmit, formState: { errors }} = useForm({model: "onChange"});
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
                    axios.get("/api/classes"),
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

    return(
        <>
         <Toaster />
         <section>
        <Link to={'/'}>Go Home</Link>
        </section>
         <section className="mt-4 add">
        <form onSubmit={handleSubmit(processData)} className="form-container">
        <h1>Add Tutor</h1>
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
            <section>
                <label>Schedule:</label>
                <textarea cols="30" rows="10" {...register("schedule", {required: true})}></textarea>
                {errors.code && <span>This field is required</span>}
            </section>
            <section>
                <label>Major:</label>
                <select {...register("major")}>
                    {major.map((major, index) => (
                        <option value={major.major_id} key={index}>
                            {major.major_name}
                        </option>
                    ))}
                </select>
            </section>
            <section className="classes">
            {className.map(classObj => (
                <div key={classObj.course_id}>
                    <input type="checkbox" id={classObj.course_id} value={classObj.course_id} {...register("class-option", {required: true})} onChange={handleCheckboxChange}/>
                    <label htmlFor={classObj.course_id}>{classObj.course_name}</label>
                </div>
            ))}
        </section>

            <input type="hidden" {...register("is_admin")} value={'no'}/>

            <section>
                <button type="submit">Submit</button>
            </section>

        </form>
        </section>

        </>
    )
}

export default AddTutor;