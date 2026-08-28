import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

function CourseCard({ course, isAdmin, offered, onToggleRoster }) {
    return (
        <Card role="listitem" className="h-full gap-4 py-5">
            <CardHeader className="gap-3 px-5">
                <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-primary">{course.course_code}</p>
                    <Badge variant="outline">{course.credits} Credits</Badge>
                </div>
                <CardTitle className="text-base leading-snug">{course.course_name}</CardTitle>
                <CardDescription>{course.major_name}</CardDescription>
            </CardHeader>

            <CardContent className="mt-auto px-5">
                <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{course.tutors_counter} Tutors</span>
                    <Button asChild variant="link" size="sm" className="h-auto p-0">
                        <a href="">See Tutors</a>
                    </Button>
                </div>
            </CardContent>

            {isAdmin && (
                <CardFooter className="px-5">
                    <Button
                        type="button"
                        variant="outline"
                        className={
                            offered
                                ? "w-full border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
                                : "w-full border-success text-success hover:bg-success/10 hover:text-success"
                        }
                        onClick={() => onToggleRoster(course)}
                    >
                        {offered ? "Remove from Semester" : "Add to Semester"}
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}

export default CourseCard;
