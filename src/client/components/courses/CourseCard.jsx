import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Users } from "lucide-react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

function CourseCard({ course, isAdmin, offered, onToggleRoster }) {
    return (
        <Card
            role="listitem"
            className="h-full w-full min-w-0 gap-0 overflow-hidden rounded-md border-border bg-card py-0 shadow-none transition-colors hover:border-primary/30"
        >
            <CardHeader className="gap-1 border-b border-border bg-muted/70 px-3 py-2.5">
                <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 break-words text-[17px] font-bold leading-none tracking-tight text-[var(--primary)]">
                        {course.course_code}
                    </p>
                    <span className="shrink-0 text-[11px] font-normal text-muted-foreground">
                        {course.credits} Credits
                    </span>
                </div>
                <CardTitle className="text-left text-sm font-semibold leading-tight text-foreground">
                    {course.course_name}
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 px-3 py-2.5">
                <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-1.5">
                    <dt className="text-[11px] text-muted-foreground">Program</dt>
                    <dd className="min-w-0 break-words text-right text-[11px] font-medium text-foreground">
                        {course.major_name}
                    </dd>
                    <dt className="text-[11px] text-muted-foreground">Tutors Available</dt>
                    <dd className="flex items-center justify-end gap-1 text-[11px] font-medium text-foreground">
                        <Users className="size-3.5 text-primary" aria-hidden="true" />
                        <span>{course.tutors_counter}</span>
                    </dd>
                </dl>
            </CardContent>

            <CardFooter className="justify-between gap-2 border-t border-border px-3 py-2">
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="-ml-1.5 h-6 px-1.5 text-xs font-medium text-primary hover:text-primary"
                >
                    <Link
                        to={`/classes/${course.course_id}/tutors`}
                        state={{ courseCode: course.course_code, courseName: course.course_name }}
                    >
                        See Tutors
                        <ChevronRight className="size-3.5" aria-hidden="true" />
                    </Link>
                </Button>

                {isAdmin && (
                    <Button
                        type="button"
                        variant="ghost"
                        className={
                            offered
                                ? "h-6 rounded-full border border-destructive/15 bg-destructive/5 px-2.5 text-[10px] font-medium text-destructive shadow-none hover:border-destructive/25 hover:bg-destructive/10 hover:text-destructive"
                                : "h-6 rounded-full border border-success/15 bg-success/5 px-2.5 text-[10px] font-medium text-success shadow-none hover:border-success/25 hover:bg-success/10 hover:text-success"
                        }
                        onClick={() => onToggleRoster(course)}
                    >
                        {offered ? "Remove from Semester" : "Add to Semester"}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

export default CourseCard;
