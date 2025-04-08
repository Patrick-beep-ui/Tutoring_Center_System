import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {v4 as uuid} from "uuid";
import { Link } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import Header from "../components/Header";

function Tutors() {
    const [tutors, setTutor] = useState([]);

    useEffect(() => {
        const getTutors = async () => {
            try {
                const response = await axios.get("/api/tutors");
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
        <section className="section tutors-container">
            <div className="tutors-table-container">
            <table className="table table-striped table align-middle mb-0">
                <thead className="table-dark">
                    <tr>
                        <th scope="col">Name</th>
                        <th scope="col">ID</th>
                        <th scope="col">Major</th>
                        <th className = "tutor_schedule" scope="col">Schedule</th>
                    </tr>
                </thead>
                <tbody>

                    {tutors.map(student =>
                    <tr key={uuid()}> 
                        <td>
                            <div className="d-flex align-items-center">
                            <Link to={`/profile/${student.id}`}>
                                <img src={`/profile/tutor${student.id}.jpg`} alt={``} 
                                style={{width: '45px', height: '45px'}}
                                class="rounded-circle"/>
                            </Link>
                                <div className="ms-3 tutor-name-cell">
                                    <p className="fw-bold mb-1" id="tutor-name">{student.tutor_name}</p>
                                    <p className="text-muted mb-0">{student.tutor_email}</p>
                                </div>
                            </div>
                        </td>
                        <td>{student.tutor_id}</td>
                        <td>
                        <p className="fw-normal mb-1">{student.tutor_major}</p>
                        </td>
                        <td>
                            <div className="ms-3 tutor-schedule-cell">
                                None
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


    {<Link className="link add-tutors-link" to={'/tutors/add'}>Add Tutor</Link>}
    </section>


        </>
    )
}

export default Tutors;