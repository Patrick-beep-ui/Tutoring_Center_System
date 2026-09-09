import {v4 as uuid} from "uuid";
import { Link } from "react-router-dom";


const SessionTable = ({ session, isEditable, tutorId, source, role }) => {

    return(
        <div className="mb-2.5 mt-2.5 max-h-[730px] overflow-y-auto rounded-[10px] border border-[#ddd] shadow-[0_2px_5px_rgba(0,0,0,0.1)] [&::-webkit-scrollbar]:w-0">
            <table className="mb-0 w-full border-collapse border border-gray-300 [&_thead]:sticky [&_thead]:top-0 [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_td]:px-4 [&_td]:py-2 [&_tr]:border-b [&_tr]:border-gray-200">
                <thead className="bg-gray-900 text-white">
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
                    <tr key={uuid()} className="even:bg-gray-100">
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
