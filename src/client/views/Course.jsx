import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {v4 as uuid} from "uuid";
import { Link } from "react-router-dom";

function ClassName() {
    const [course, setCourse] = useState([]);

    useEffect(() => {
        const getClasses = async () => {
            try {
                const response = await axios.get("/api/classes")
                const {data} = response;
                console.log(data.courses)
                setCourse(data.courses)
            }
            catch(e) {
                console.error(e)
            }
        }
        getClasses();
    }, [])

    return(
        <>
        <h1>Classes</h1>

        <section className="mt-4">
            <table className="table table-striped">
                <thead className="table-dark">
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Class Name</th>
                        <th scope="col">Class Code</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {course.map(course =>
                    <tr key={uuid()}>
                        <td>{course.course_id}</td>
                        <td>{course.course_name}</td>
                        <td>{course.course_code}</td>
                        <td><i className='bx bx-pencil edit'></i></td>
                        <td name='major_id' value={course.course_id} onClick={(event) => deleteStudent(event)}><i className='bx bx-trash delete'></i></td>
                    </tr>    
                        )}
                </tbody>
            </table>


    
    </section>

        <Link to={"/classes/add"}>Add Class</Link>
        </>
    )

}

export default ClassName