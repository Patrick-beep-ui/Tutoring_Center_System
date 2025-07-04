import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { v4 as uuid } from "uuid";
import Header from "../components/Header";
import UserNavigators from "../components/UsersNavigators";
import '.././App.css';
import { exportToCSV } from "../services/exportCSV";

function ClassName() {
    const [course, setCourse] = useState([]);
    const scrollRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(2);

    useEffect(() => {
        const getClasses = async () => {
            try {
                const response = await axios.get("/api/courses");
                const { data } = response;
                console.log(data.courses);
                setCourse(data.courses);
            } catch (e) {
                console.error(e);
            }
        };
        getClasses();

        const handleResize = () => {
            if (window.innerWidth <= 600) {
                setItemsPerPage(3);
            } else if (window.innerWidth <= 1200) {
                setItemsPerPage(4);
            } else {
                setItemsPerPage(8);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const nextPage = () => {
        if (currentPage < Math.ceil(course.length / itemsPerPage) - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const currentCourses = course.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    // Function to export data to CSV 
    const handleExportCSV = useCallback(() => {
        const headers = ['course_code', 'course_name', 'credits', 'Major', 'tutors_counter'];
        const rows = course.map(c => [
            c.course_code,
            c.course_name,
            c.credits,
            c.Major.major_name,
            c.tutors_counter
        ]);
        exportToCSV(rows, headers, 'courses.csv');   
    }, [course]);

    return (
        <>
        <Header/>

        <section className="courses-container section">
        <button className="arrow left" onClick={prevPage} disabled={currentPage === 0}>←</button>
            <section className="courses" ref={scrollRef}>
                {currentCourses.map(c => 
                    <div className="course-container">
                        <div className="course-description">
                            <p>{c.course_code}</p>
                            <p>{c.course_name}</p>
                            <p>{c.credits} Credits</p>
                            <p>{c.Major.major_name}</p>
                        </div>
                        <div className="course-tutors">
                            <p>{c.tutors_counter} Tutors</p>
                            <a href="">See Tutors</a>
                        </div>
                    </div>
                    )}
                </section>
            </section>
    
    <Link to={"/classes/add"} className="add-class" style={{ color: 'var(--white)'}}>Add Course</Link>
    <button className="arrow right" onClick={nextPage} disabled={currentPage >= Math.ceil(course.length / itemsPerPage) - 1}>→</button>
    
        </>
    );
}

export default ClassName;
