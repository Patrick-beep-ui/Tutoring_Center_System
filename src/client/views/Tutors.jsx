import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {v4 as uuid} from "uuid";
import { Link } from "react-router-dom";
import { Toaster, toast } from 'sonner';

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
        {
            <h1>Tutors</h1>}

        <section className="mt-4">
            <table className="table table-striped">
                <thead className="table-dark">
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">Major</th>
                        <th className = "tutor_schedule" scope="col">Schedule</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {tutors.map(student =>
                    <tr key={uuid()}> 
                        <td>{student.tutor_id}</td>
                        <td><Link to={`/profile/${student.id}`}>{student.tutor_name}</Link></td>
                        <td>{student.tutor_major}</td>
                        <td>{student.tutor_schedule}</td>
                        <td><i className='bx bx-pencil edit'></i></td>
                        <td name='major_id' value={student.id} onClick={(event) => deleteStudent(event)}><i className='bx bx-trash delete'></i></td>
                    </tr>  
                        )}
                </tbody>
            </table>


    <Link to={'/tutors/add'}>Add Tutor</Link>
    </section>


        </>
    )
}

export default Tutors;