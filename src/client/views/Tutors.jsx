import { useState, useEffect } from "react";
import auth from "../authService";
import {v4 as uuid} from "uuid";
import { Link } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import Header from "../components/Header";

function Tutors() {
    const [tutors, setTutor] = useState([]);

    useEffect(() => {
        const getTutors = async () => {
            try {
                const response = await auth.get("/api/tutors");
                const {data} = response;
                console.log(data.tutors)
                setTutor(data.tutors)
            }
            catch(e) {

            }
        }

        getTutors();
    }, [])

    return(
        <>
        <Header/>
        <section className="section">
            <div className="mt-1 max-h-[700px] overflow-y-auto rounded-[10px] border border-[#ddd] shadow-[0_2px_5px_rgba(0,0,0,0.1)] [&::-webkit-scrollbar]:w-0">
            <table className="w-full border-collapse border border-gray-300 align-middle [&_thead]:sticky [&_thead]:top-0 [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_td]:px-4 [&_td]:py-2 [&_tr]:border-b [&_tr]:border-gray-200">
                <thead className="bg-gray-900 text-white">
                    <tr>
                        <th scope="col">Name</th>
                        <th scope="col">ID</th>
                        <th scope="col">Major</th>
                        <th className = "tutor_schedule" scope="col">Schedule</th>
                    </tr>
                </thead>
                <tbody>

                    {tutors.map(student =>
                    <tr key={uuid()} className="even:bg-gray-100">
                        <td>
                            <div className="flex items-center">
                            <Link to={`/profile/tutor/${student.id}`}>
                                <img src={`/profile/tutor${student.id}.jpg`} alt={``} 
                                style={{width: '45px', height: '45px'}}
                                className="rounded-full"/>
                            </Link>
                                <div className="ms-4 p-2.5">
                                    <p className="font-bold mb-1" id="tutor-name">{student.tutor_name}</p>
                                    <p className="text-muted-foreground mb-0">{student.tutor_email}</p>
                                </div>
                            </div>
                        </td>
                        <td>{student.tutor_id}</td>
                        <td>
                        <p className="font-normal mb-1">{student.tutor_major}</p>
                        </td>
                        <td>
                            <div className="ms-4 tutor-schedule-cell">
                                <p>None</p>
                            </div>
                        </td>
                    </tr>  
                    )}
                </tbody>
            </table>
            </div>

            {/*  
                <td><i className='bx bx-pencil edit'></i></td>
                        <td name='major_id' value={student.id} onClick={(event) => deleteStudent(event)}><i className='bx bx-trash delete'></i></td>
            */}


    {<Link className="mt-5 inline-block" to={'/tutors/add'}>Add Tutor</Link>}
    </section>


        </>
    )
}

export default Tutors;
