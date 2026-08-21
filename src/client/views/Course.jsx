import { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
import auth from "../authService";
import { Link, useOutletContext } from "react-router-dom";
import Header from "../components/Header";
import { v4 as uuid } from "uuid";
import UserNavigators from "../components/UsersNavigators";
import { toast } from "sonner";
import '.././App.css';

function ClassName() {
    const { user: contextUser } = useOutletContext();
    const isAdmin = contextUser?.role === 'admin' || contextUser?.role === 'dev';

    // Data states
    const [majors, setMajors] = useState([]);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);

    const [filteredCourses, setFilteredCourses] = useState([]);

    // Filter states
    const [programFilter, setProgramFilter] = useState("all");
    const [courseFilter, setCourseFilter] = useState("all");
    const [idFilter, setIdFilter] = useState("");
    const [offeredOnly, setOfferedOnly] = useState(true);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(2);
    const scrollRef = useRef(null);

    // Fetch majors, courses, students on mount
    useEffect(() => {
        const fetchMajors = async () => {
            try {
                const res = await auth.get("/api/majors");
                setMajors(res.data.majors);
            } catch (e) {
                console.error(e);
            }
        };
        const fetchCourses = async () => {
            try {
                // Catalog with current-semester offering flag and scoped tutor counts
                const res = await auth.get("/api/courses/catalog");
                setCourses(res.data.courses);
            } catch (e) {
                console.error(e);
                toast.error(e.response?.data?.msg || "Error fetching courses");
            }
        };
        const fetchStudents = async () => {
            try {
                const res = await auth.get("/api/students");
                setStudents(res.data.students);
            } catch (e) {
                console.error(e);
            }
        };

        fetchMajors();
        fetchCourses();
        fetchStudents();
    }, []);

    // Filter courses whenever filters or courses/majors change
    useEffect(() => {
        let filtered = [...courses];

        if (offeredOnly) {
            filtered = filtered.filter(c => c.offered === 1 || c.offered === true);
        }

        // Program filter: map major_name to major_id
        if (programFilter !== "all") {
            const major = majors.find(m => m.major_name === programFilter);
            filtered = filtered.filter(c => major && c.major_id === major.major_id);
        }

        // Course filter
        if (courseFilter !== "all" && courseFilter !== "") {
            filtered = filtered.filter(c =>
                c.course_name.toLowerCase().includes(courseFilter.toLowerCase())
            );
        }

        // ID filter
        if (idFilter !== "") {
            filtered = filtered.filter(c =>
                c.course_code.toLowerCase().includes(idFilter.toLowerCase())
            );
        }


        setFilteredCourses(filtered);
        setCurrentPage(0); // Reset pagination on filter change
    }, [programFilter, courseFilter, idFilter, offeredOnly, courses, majors]);

    // Handle responsive items per page
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 600) setItemsPerPage(3);
            else if (window.innerWidth <= 1200) setItemsPerPage(4);
            else setItemsPerPage(8);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Pagination controls
    const nextPage = useCallback(() => {
        if (currentPage < Math.ceil(filteredCourses.length / itemsPerPage) - 1)
            setCurrentPage(currentPage + 1);
    }, [currentPage, filteredCourses.length, itemsPerPage]);

    const prevPage = useCallback(() => {
        if (currentPage > 0) setCurrentPage(currentPage - 1);
    }, [currentPage]);

    const currentCourses = useMemo(() => {
        return filteredCourses.slice(
            currentPage * itemsPerPage,
            (currentPage + 1) * itemsPerPage
        );
    }, [filteredCourses, currentPage, itemsPerPage]);

    const isOffered = useCallback((c) => c.offered === 1 || c.offered === true, []);

    const toggleRoster = useCallback(async (c) => {
        try {
            if (isOffered(c)) {
                await auth.delete(`/api/courses/${c.course_id}/roster/current`);
                toast.success(`${c.course_code} removed from the current semester`);
            } else {
                await auth.post(`/api/courses/${c.course_id}/roster/current`);
                toast.success(`${c.course_code} added to the current semester`);
            }
            const res = await auth.get("/api/courses/catalog");
            setCourses(res.data.courses);
        } catch (e) {
            toast.error(e.response?.data?.msg || "Error updating semester roster");
        }
    }, [isOffered]);

    return (
        <>
            <Header />
            <section className="courses-container section">
                <UserNavigators
                    programFilter={programFilter}
                    courseFilter={courseFilter}
                    idFilter={idFilter}
                    setProgramFilter={setProgramFilter}
                    setCourseFilter={setCourseFilter}
                    setIdFilter={setIdFilter}
                    majors={majors}
                    courses={courses}
                    students={students}
                    isInputSearch={true}
                    IdLabel="Code"
                    IdPlaceholder="Type Course Code"
                />

                {isAdmin &&
                    <div className="form-check form-switch" style={{ margin: '10px 20px' }}>
                        <input className="form-check-input" type="checkbox" id="offeredOnlySwitch"
                            checked={offeredOnly} onChange={(e) => setOfferedOnly(e.target.checked)} />
                        <label className="form-check-label" htmlFor="offeredOnlySwitch">
                            Current semester offerings only
                        </label>
                    </div>}

                <button className="arrow left" onClick={prevPage} disabled={currentPage === 0}>←</button>

                <section className="courses" ref={scrollRef}>
                    {currentCourses.map(c => (
                        <div className="course-container" key={uuid()}>
                            <div className="course-description">
                                <p>{c.course_code}</p>
                                <p>{c.course_name}</p>
                                <p>{c.credits} Credits</p>
                                <p>{c.major_name}</p>
                            </div>
                            <div className="course-tutors">
                                <p>{c.tutors_counter} Tutors</p>
                                <a href="">See Tutors</a>
                                {isAdmin && (
                                    isOffered(c) ? (
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => toggleRoster(c)}>
                                            Remove from Semester
                                        </button>
                                    ) : (
                                        <button className="btn btn-sm btn-outline-success" onClick={() => toggleRoster(c)}>
                                            Add to Semester
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </section>
            </section>

            <Link to={"/classes/add"} className="add-class" style={{ color: 'var(--white)' }}>Add Course</Link>
            <button className="arrow right" onClick={nextPage} disabled={currentPage >= Math.ceil(filteredCourses.length / itemsPerPage) - 1}>→</button>
        </>
    );
}

export default memo(ClassName);
