import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {v4 as uuid} from "uuid";
import { Link } from "react-router-dom";

function Major() {
    const [course, setCourse] = useState([]);

    useEffect(() => {
        const getClasses = async () => {
            try {
                const response = await axios.get("/api/majors")
                const {data} = response;
                console.log(data.majors)
                setCourse(data.majors)
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
                        <th scope="col">Major Name</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {course.map(course =>
                    <tr key={uuid()}>
                        <td>{course.major_id}</td>
                        <td>{course.major_name}</td>
                        <td><i className='bx bx-pencil edit'></i></td>
                        <td name='major_id' value={course.course_id} onClick={(event) => deleteStudent(event)}><i className='bx bx-trash delete'></i></td>
                    </tr>    
                        )}
                </tbody>
            </table>


    
    </section>

        <Link to={"/majors/add"}>Add Major</Link>
        </>
    )

}

export default Major