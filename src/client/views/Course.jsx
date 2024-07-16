import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {v4 as uuid} from "uuid";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import '.././App.css';

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
        <Header/>

        <section className="courses-container section">
            <section className="courses">
                {course.map(c => 
                    <div className="course-container">
                        <div className="course-description">
                            <p>{c.course_code}</p>
                            <p>{c.course_name}</p>
                        </div>
                        <div className="course-tutors">
                            <p>{c.tutors_counter} Tutors</p>
                            <a href="">See Tutors</a>
                        </div>
                    </div>
                    )}
            </section>
        
        {/*
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
                    */}


    <Link to={"/classes/add"} className="add-class" style={{ color: 'var(--white)'}}>Add Course</Link>
    </section>
        </>
    )

}

export default ClassName