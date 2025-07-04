import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { v4 as uuid } from "uuid";
//import UserNavigators from "../components/UsersNavigators";
import '.././App.css';

function ClassName() {
    const [course, setCourse] = useState([]);
    const [majors, setMajors] = useState([]);
    const [courses, setCourses] = useState([]);  // New state for courses
    const [students, setStudents] = useState([]);  // New state for students (for idFilter)
    const [programFilter, setProgramFilter] = useState("all");
    const [courseFilter, setCourseFilter] = useState("all");
    const [idFilter, setIdFilter] = useState("all");
    const [semesterFilter, setSemesterFilter] = useState("current");
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(2);
    const scrollRef = useRef(null);

    // Fetch the available majors for the program filter dropdown
    useEffect(() => {
        const getMajors = async () => {
            try {
                const response = await axios.get("/api/majors");
                const { data } = response;
                setMajors(data.majors);
            } catch (e) {
                console.error("Error fetching majors:", e);
            }
        };
        getMajors();

        // Fetch the available courses for the course filter dropdown
        const getCourses = async () => {
            try {
                const response = await axios.get("/api/courses");
                const { data } = response;
                setCourses(data.courses);
            } catch (e) {
                console.error("Error fetching courses:", e);
            }
        };
        getCourses();

        // Fetch the available students for the id filter dropdown
        const getStudents = async () => {
            try {
                const response = await axios.get("/api/students");
                const { data } = response;
                setStudents(data.students);
            } catch (e) {
                console.error("Error fetching students:", e);
            }
        };
        getStudents();
    }, []);

    // Fetch filtered courses
    useEffect(() => {
        const getCoursesByFilter = async () => {
            try {
                const response = await axios.get("/api/courses", {
                    params: {
                        major: programFilter === "all" ? undefined : programFilter,
                        course_name: courseFilter === "all" ? undefined : courseFilter,
                        student_id: idFilter === "all" ? undefined : idFilter,
                        semester: semesterFilter === "current" ? undefined : semesterFilter
                    }
                });
                const { data } = response;
                setCourse(data.courses);
            } catch (e) {
                console.error("Error fetching filtered courses:", e);
            }
        };
        getCoursesByFilter();

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

    }, [programFilter, courseFilter, idFilter, semesterFilter]);

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

    return (
        <>
            <Header />
            <section className="courses-container section">
                <UserNavigators
                    programFilter={programFilter}
                    courseFilter={courseFilter}
                    idFilter={idFilter}
                    semesterFilter={semesterFilter}
                    setProgramFilter={setProgramFilter}
                    setCourseFilter={setCourseFilter}
                    setIdFilter={setIdFilter}
                    setSemesterFilter={setSemesterFilter}
                    majors={majors}
                    courses={courses}
                    students={students}
                />
                <button className="arrow left" onClick={prevPage} disabled={currentPage === 0}>←</button>
                <section className="courses" ref={scrollRef}>
                    {currentCourses.map(c =>
                        <div className="course-container" key={uuid()}>
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
            <Link to={"/classes/add"} className="add-class" style={{ color: 'var(--white)' }}>Add Course</Link>
            <button className="arrow right" onClick={nextPage} disabled={currentPage >= Math.ceil(course.length / itemsPerPage) - 1}>→</button>
        </>
    );
}

const UserNavigators = ({ programFilter, courseFilter, idFilter, semesterFilter, setProgramFilter, setCourseFilter, setIdFilter, setSemesterFilter, majors, courses, students }) => {
    return (
        <section className="users-navigation">
            <div className="users-navigation-item">
                <label className="navigation-item-label">Program</label>
                <select
                    className="navigation-item-select"
                    value={programFilter}
                    onChange={(e) => setProgramFilter(e.target.value)}
                >
                    <option value="all">All Majors</option>
                    {majors.map(major => (
                        <option key={major.id} value={major.id}>{major.major_name}</option>
                    ))}
                </select>
            </div>
            <div className="users-navigation-item">
                <label className="navigation-item-label">Course</label>
                <select
                    className="navigation-item-select"
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                >
                    <option value="all">All Courses</option>
                    {courses.map(course => (
                        <option key={course.id} value={course.course_name}>{course.course_name}</option>
                    ))}
                </select>
            </div>
            <div className="users-navigation-item">
                <label className="navigation-item-label">ID</label>
                <select
                    className="navigation-item-select"
                    value={idFilter}
                    onChange={(e) => setIdFilter(e.target.value)}
                >
                    <option value="all">Search ID</option>
                    {students.map(student => (
                        <option key={student.id} value={student.id}>{student.student_id}</option>
                    ))}
                </select>
            </div>
            <div className="users-navigation-item">
                <label className="navigation-item-label">Semester</label>
                <select
                    className="navigation-item-select"
                    value={semesterFilter}
                    onChange={(e) => setSemesterFilter(e.target.value)}
                >
                    <option value="current">Current Semester</option>
                    <option value="spring">Spring</option>
                    <option value="fall">Fall</option>
                </select>
            </div>
        </section>
    );
};

export default ClassName;

