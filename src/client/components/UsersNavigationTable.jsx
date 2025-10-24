import { useCallback } from "react";
import {v4 as uuid} from "uuid";
import { Link } from "react-router-dom";

const UserNavigationTable = ({ users, role, coursesRole='tutor' }) => {

    const separateCourses = useCallback((coursesString) => {
        if (!coursesString) return "";

        const coursesArray = coursesString.split(',').map(course => course.trim());
        
        return coursesArray.map((c, index) => (
            <span key={index} className="course-badge">{c}</span>
        ))

    }, []);

    return(
     <div className="users-navigation-table-container">
                    <table className="table align-middle mb-0 users-navigation-table">
                        <thead className="">
                            <tr>
                                <th scope="col" id="">Name</th>
                                <th scope="col">Major</th>
                                <th>Courses</th>
                                <th scope="col">ID</th>
                            </tr>
                        </thead>
                        <tbody>
        
                            {users.map(student =>
                            <tr key={uuid()}> 
                                <td>
                                    <div className="d-flex align-items-center users-navigation-info">
                                    <Link to={`/profile/${role}/${student.id}`}>
                                        <img src={`/profile/${role}${student.id}.webp`} alt={``} 
                                        style={{width: '45px', height: '45px'}}
                                        className="rounded-circle"
                                        onError={(e) => { e.target.onerror = null; e.target.src=`/profile/profile.webp` }}
                                        />
                                    </Link>
                                        <div className="ms-3 tutor-name-cell">
                                            <p className="mb-1 users-navigation-data">{student[`${role}_name`]}</p>
                                            <p className="mb-0 users-navigation-email">{student[`${role}_email`]}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                <p className="mb-1 users-navigation-data">{student[`${role}_major`]}</p>
                                </td>
                                {/*<td className="users-navigation-data users-navigation-courses">{student[`${coursesRole}_courses_names`]}</td>*/}
                                <td className="users-navigation-data users-navigation-courses"
                                style={{display: 'flex', flexWrap: 'wrap', gap: '5px', paddingTop: '10px', paddingBottom: '10px'}}
                                >
                                    {separateCourses(student[`${coursesRole}_courses_names`])}
                                </td>
                                <td className="users-navigation-data">{student[`${role}_id`]}</td>
                            </tr>  
                            )}
                        </tbody>
                    </table>
        </div>
    )
}

export default UserNavigationTable;