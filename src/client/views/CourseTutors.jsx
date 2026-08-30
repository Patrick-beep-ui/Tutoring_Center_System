import { useParams, useLocation, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "../components/Header";
import TutorsListComponent from "../components/TutorsListComponent";

function CourseTutors() {
    const { course_id } = useParams();
    const location = useLocation();
    const courseCode = location.state?.courseCode;
    const courseName = location.state?.courseName;

    return (
        <>
            <Header />
            <section className="section overflow-y-auto bg-muted/30 lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden">
                <div className="w-full max-w-none min-w-0 overflow-hidden rounded-md border border-border bg-card lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
                    <header className="flex shrink-0 flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-left">
                            <h1 className="m-0 text-left text-xl font-semibold text-foreground">
                                {courseName ? `${courseName} — Tutors` : `Tutors for Course #${course_id}`}
                            </h1>
                            {courseCode && (
                                <p className="mt-1 mb-0 text-sm text-muted-foreground">
                                    {courseCode}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="border-primary/20 bg-card text-primary! shadow-sm hover:border-secondary hover:bg-secondary hover:text-secondary-foreground!"
                            >
                                <Link to="/classes" className="inline-flex items-center gap-1.5">
                                    <ArrowLeft className="size-4" aria-hidden="true" />
                                    Back to Courses
                                </Link>
                            </Button>
                        </div>
                    </header>

                    <TutorsListComponent active initialCourse={courseCode} hideFilters />
                </div>
            </section>
        </>
    );
}

export default CourseTutors;
