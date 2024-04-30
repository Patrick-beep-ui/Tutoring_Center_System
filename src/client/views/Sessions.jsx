import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {v4 as uuid} from "uuid";
import { Link } from "react-router-dom";

function Session() {
    const [session, setSession] = useState([]);
    const {tutor_id} = useParams();
    const {course_id} = useParams();

    useEffect(() => {
        const getSessions = async () => {
            try {
                const response = await axios.get(`/api/sessions/${tutor_id}/${course_id}`)
                const {data} = response;
                console.log(data.sessions)
                setSession(data.sessions)
            }
            catch(e) {
                console.error(e)
            }
        }
        getSessions();
    }, [])

    return(
        <>
        <h1>Classes</h1>

        <section className="mt-4">
            <table className="table table-striped">
                <thead className="table-dark">
                    <tr>
                        <th scope="col">Session ID</th>
                        <th scope="col">Tutor</th>
                        <th scope="col">Student</th>
                        <th scope="col">Course</th>
                        <th scope="col">Total Hours</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {session.map(s =>
                    <tr key={uuid()}>
                        <td>{s.session_id}</td>
                        <td>{s.tutor_name}</td>
                        <td>{s.student}</td>
                        <td>{s.course_name}</td>
                        <td>{s.total_hours}</td>
                        <td><i className='bx bx-pencil edit'></i></td>
                        <td name='major_id' value={s.session_id} onClick={(event) => deleteStudent(event)}><i className='bx bx-trash delete'></i></td>
                    </tr>    
                        )}
                </tbody>
            </table>


    
    </section>

        <Link to={`/sessions/add/${tutor_id}/${course_id}`}>Add Session</Link>
        </>
    )

}

export default Session