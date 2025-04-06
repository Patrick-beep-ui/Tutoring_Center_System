import {v4 as uuid} from "uuid";
import { Link } from "react-router-dom";

const UserNavigationTable = ({ users, role }) => {
    return(
     <div className="users-navigation-table-container">
                    <table className="table align-middle mb-0 users-navigation-table">
                        <thead className="">
                            <tr>
                                <th scope="col" id="">Name</th>
                                <th scope="col">Major</th>
                                <th>Courses</th>
                                <th scope="col">ID</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
        
                            {users.map(student =>
                            <tr key={uuid()}> 
                                <td>
                                    <div className="d-flex align-items-center users-navigation-info">
                                    <Link to={`/profile/${role}/${student.id}`}>
                                        <img src={`/profile/tutor${student.id}.jpg`} alt={``} 
                                        style={{width: '45px', height: '45px'}}
                                        className="rounded-circle"/>
                                    </Link>
                                        <div className="ms-3 tutor-name-cell">
                                            <p className="mb-1 users-navigation-data" >{student.tutor_name}</p>
                                            <p className="mb-0 users-navigation-email">{student.tutor_email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                <p className="mb-1 users-navigation-data">{student.tutor_major}</p>
                                </td>
                                <td className="users-navigation-data">{student.tutor_courses}</td>
                                <td className="users-navigation-data">{student.tutor_id}</td>
                                <td>
                                    <i class='bx bxs-pencil'></i>
                                    <i class='bx bxs-user-detail'></i>
                                    <i class='bx bx-dots-horizontal-rounded'></i>
                                </td>
                            </tr>  
                            )}
                        </tbody>
                    </table>
        </div>
    )
}

export default UserNavigationTable;