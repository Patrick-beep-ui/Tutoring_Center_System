import {v4 as uuid} from "uuid";
import { Link } from "react-router-dom";


const SessionTable = ({ session, isEditable, tutorId }) => {

    return(
        <div className="table-container">
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
                        {isEditable ? (
                        <>
                        <td><Link to={`/session/edit/${s.session_id}/${tutorId}`}><i className='bx bx-pencil edit'></i></Link></td>
                        <td name='major_id' value={s.session_id} onClick={(event) => deleteStudent(event)}><i className='bx bx-trash delete'></i></td>
                        </>
                        ) : (
                        <>
                        <td></td>
                        <td></td>
                        </>
                        )}
                        
                    </tr>    
                        )}
                </tbody>
            </table>
        </div>
    )

}

export default SessionTable;
