import {v4 as uuid} from "uuid";
import { Link } from "react-router-dom";


const SessionTable = ({ session, isEditable, tutorId, source, role }) => {

    return(
        <div className="table-container" style={{marginBottom: '10px'}}>
            <table className="table table-striped" style={{marginBottom: '0px'}}>
                <thead className="table-dark">
                    <tr>
                        <th scope="col">Session ID</th>
                        <th scope="col">Tutor</th>
                        <th scope="col">Student</th>
                        <th scope="col">Course</th>
                        <th scope="col">Total Hours</th>
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
                        <td><Link 
                        to={`/session/edit/${s.session_id}/${tutorId}`}
                        state={{ source: source, role: role }}
                        >
                            <i className='bx bx-pencil edit'></i>
                        </Link></td>
                        {/** 
                        <td name='major_id' value={s.session_id} onClick={(event) => deleteStudent(event)}><i className='bx bx-trash delete'></i></td>
                        */}
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
