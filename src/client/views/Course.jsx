import { useState, useEffect, useCallback, memo, useMemo, useContext } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import auth from "../authService";
import CourseGrid from "../components/courses/CourseGrid";
import { courseNavigationRef } from "../components/courses/courseNavigationRef";
import Header from "../components/Header";
import UserNavigators from "../components/UsersNavigators";
import { SemesterContext } from "../context/currentSemester";

function ClassName() {
    const { user: contextUser } = useOutletContext();
    const isAdmin = contextUser?.role === 'admin' || contextUser?.role === 'dev';
    const { selectedSemesterId } = useContext(SemesterContext);

    // Data states
    const [majors, setMajors] = useState([]);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);

    const [filteredCourses, setFilteredCourses] = useState([]);

    // Filter states
    const [programFilter, setProgramFilter] = useState(courseNavigationRef.current.programFilter);
    const [courseFilter, setCourseFilter] = useState(courseNavigationRef.current.courseFilter);
    const [idFilter, setIdFilter] = useState(courseNavigationRef.current.idFilter);
    const [offeredOnly, setOfferedOnly] = useState(true);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(courseNavigationRef.current.currentPage);
    const [itemsPerPage, setItemsPerPage] = useState(2);

    // Persist filter state to the shared ref so navigating to "See Tutors"
    // and back preserves the user's filters and pagination.
    useEffect(() => {
        courseNavigationRef.current = {
            programFilter,
            courseFilter,
            idFilter,
            currentPage,
        };
    }, [programFilter, courseFilter, idFilter, currentPage]);

    // Fetch majors and students on mount
    useEffect(() => {
        const fetchMajors = async () => {
            try {
                const res = await auth.get("/api/majors");
                setMajors(res.data.majors);
            } catch (e) {
                console.error(e);
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
        fetchStudents();
    }, []);

    // Fetch catalog scoped to the selected semester
    useEffect(() => {
        if (!selectedSemesterId) return;
        const fetchCourses = async () => {
            try {
                const res = await auth.get(`/api/courses/catalog?semester_id=${selectedSemesterId}`);
                setCourses(res.data.courses);
            } catch (e) {
                console.error(e);
                toast.error(e.response?.data?.msg || "Error fetching courses");
            }
        };
        fetchCourses();
    }, [selectedSemesterId]);

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

        // Course filter: match against name or code (search box)
        if (courseFilter !== "all" && courseFilter !== "") {
            const q = courseFilter.toLowerCase();
            filtered = filtered.filter(c =>
                c.course_name.toLowerCase().includes(q) ||
                c.course_code.toLowerCase().includes(q)
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

    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

    const isOffered = useCallback((c) => c.offered === 1 || c.offered === true, []);

    const toggleRoster = useCallback(async (c) => {
        try {
            if (isOffered(c)) {
                await auth.delete(`/api/courses/${c.course_id}/roster/${selectedSemesterId}`);
                toast.success(`${c.course_code} removed from the semester`);
            } else {
                await auth.post(`/api/courses/${c.course_id}/roster/${selectedSemesterId}`);
                toast.success(`${c.course_code} added to the semester`);
            }
            const res = await auth.get(`/api/courses/catalog?semester_id=${selectedSemesterId}`);
            setCourses(res.data.courses);
        } catch (e) {
            toast.error(e.response?.data?.msg || "Error updating semester roster");
        }
    }, [isOffered, selectedSemesterId]);

    return (
        <>
            <Header />
            <main className="section overflow-y-auto bg-background text-foreground lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden">
                <div className="w-full max-w-none min-w-0 overflow-clip rounded-lg border border-border bg-card shadow-sm lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
                    <header className="flex shrink-0 flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <h1 className="text-left text-xl font-semibold text-foreground">
                            Courses Directory
                        </h1>
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="border-primary/20 bg-card text-primary! shadow-sm hover:border-secondary hover:bg-secondary hover:text-secondary-foreground!"
                        >
                            <Link to="/classes/add">Add Course</Link>
                        </Button>
                    </header>

                    <div className="shrink-0 border-b border-border bg-muted/30 [&>section]:gap-y-3 [&>section]:border-0 [&>section]:bg-transparent [&>section]:px-5 [&>section]:py-3 [&_input]:h-9 [&_label]:text-foreground [&_select]:h-9">
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
                            compact
                            IdLabel="Code"
                            IdPlaceholder="Type Course Code"
                        />
                    </div>

                    {isAdmin && (
                        <div className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-3">
                            <Switch
                                id="offeredOnlySwitch"
                                checked={offeredOnly}
                                onCheckedChange={setOfferedOnly}
                            />
                            <label
                                className="cursor-pointer text-sm font-medium"
                                htmlFor="offeredOnlySwitch"
                            >
                                Offerings in selected semester only
                            </label>
                        </div>
                    )}

                    <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20 p-4 lg:p-5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
                        <CourseGrid
                            courses={currentCourses}
                            isAdmin={isAdmin}
                            isOffered={isOffered}
                            onToggleRoster={toggleRoster}
                        />
                    </div>

                    <nav
                        aria-label="Course pagination"
                        className="sticky bottom-0 z-10 flex w-full flex-none justify-center border-t border-border bg-card/95 px-4 py-3 backdrop-blur-sm"
                    >
                        <div className="flex w-full justify-center">
                            <div className="grid grid-cols-[88px_auto_88px] items-center justify-center gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="inline-flex h-8 w-[88px] items-center justify-center gap-1 px-2 leading-none has-[>svg]:px-2"
                                    onClick={prevPage}
                                    disabled={currentPage === 0}
                                >
                                    <ChevronLeft className="size-4 shrink-0" />
                                    Previous
                                </Button>
                                <span
                                    className="inline-flex h-8 items-center justify-center justify-self-center whitespace-nowrap px-1 text-center text-sm leading-none text-muted-foreground"
                                    aria-live="polite"
                                >
                                    Page {currentPage + 1} of {Math.max(totalPages, 1)}
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="inline-flex h-8 w-[88px] items-center justify-center gap-1 px-2 leading-none has-[>svg]:px-2"
                                    onClick={nextPage}
                                    disabled={currentPage >= totalPages - 1}
                                >
                                    Next
                                    <ChevronRight className="size-4 shrink-0" />
                                </Button>
                            </div>
                        </div>
                    </nav>
                </div>
            </main>
        </>
    );
}

export default memo(ClassName);
