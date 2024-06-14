import { useState, useEffect } from "react";
import axios from "axios";
import {v4 as uuid} from "uuid";
import { Link, useOutletContext  } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import "../App.css"

function Home() {
    const [session, setSession] = useState([]);
    const { user } = useOutletContext();

    useEffect(() => {
        const getSessions = async () => {
            try {
                const response = await axios.get(`/api/sessions`)
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
      <div>
        <Link to={`/profile/${user.user_id}`}>Hello, {user ? user.first_name+ ' ' +user.last_name : "User"}</Link>
      </div>
        
        <h1>Sessions</h1>

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
                       <td> <Link to={`/profile/${s.tutor_id}`}>{s.tutor_name}</Link></td>
                        <td>{s.student}</td>
                        <td>{s.course_name}</td>
                        <td>{s.total_hours}</td>
                        <td><i className='bx bx-pencil edit'></i></td>
                        <td name='major_id' value={s.session_id} onClick={(event) => deleteStudent(event)}><i className='bx bx-trash delete'></i></td>
                    </tr>    
                        )}
                </tbody>
            </table>


        <section>
        <Link to={'/tutors'}>See All Tutors</Link>
        </section>
        <section>
        <Link to={'/classes'}>See All Classes</Link>
        </section>
        <section>
        <Link to={'/majors'}>See All Majors</Link>
        </section>
    </section>

        </>
    )
}

export default Home;