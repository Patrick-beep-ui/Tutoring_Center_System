import CourseCard from "./CourseCard";

function CourseGrid({ courses, isAdmin, isOffered, onToggleRoster }) {
    return (
        <section aria-label="Courses">
            <div
                role="list"
                className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
                {courses.map((course) => (
                    <CourseCard
                        key={course.course_id}
                        course={course}
                        isAdmin={isAdmin}
                        offered={isOffered(course)}
                        onToggleRoster={onToggleRoster}
                    />
                ))}
            </div>
        </section>
    );
}

export default CourseGrid;
