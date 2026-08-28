import { useCallback, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import auth from "../authService";

import Header from "../components/Header";
import TutorsListComponent from "../components/TutorsListComponent";
import StudentsListComponent from "../components/StudentsListComponent";
import UserTypeSelector from "../components/UserTypeSelector";
import { Button } from "../components/ui/button";

function Users() { 
    const [majors, setMajors] = useState([]);
    const [courses, setCourses] = useState([]);
    const [userType, setUserType] = useState("student");
    const { user } = useOutletContext();
    const viewerRole = user?.user_role ?? user?.role;
    const canViewTutors = viewerRole !== "student";
    const exportHandlers = useRef({});

    const registerExportHandler = useCallback((type, handler) => {
        exportHandlers.current[type] = handler;
    }, []);

    const handleExport = useCallback(() => {
        exportHandlers.current[userType]?.();
    }, [userType]);

    useEffect(() => {
        const getMajors = async () => {
            try {
                const response = await auth.get("/api/majors");
                const { data } = response;
                setMajors(data.majors);
            } catch (e) {
                console.error("Error fetching majors:", e);
            }
        };

        const getUserCourses = async () => {
            try {
                const response = await auth.get(`/api/courses/user/${user.user_id}`);
                const { data } = response;
                setCourses(data.courses);
                console.log("User Courses: ",data.courses);
            } catch (e) {
                console.error("Error fetching user courses:", e);
            }
        }

        getMajors();
        getUserCourses();
    }, []);
    
    return(
        <>
        <Header />
        <section className="section overflow-y-auto bg-muted/30 lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden">
            <div className="w-full max-w-none min-w-0 overflow-hidden rounded-md border border-border bg-card lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
                <div className="flex shrink-0 flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-left">
                        <h1 className="m-0 text-left text-2xl font-bold leading-tight text-[var(--primary)] sm:text-3xl">
                            Users
                        </h1>
                        <p className="mt-1.5 mb-0 text-sm text-muted-foreground">
                            Manage students and tutors
                        </p>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                        <UserTypeSelector
                            value={userType}
                            onValueChange={setUserType}
                            canViewTutors={canViewTutors}
                        />
                        <Button
                            type="button"
                            size="sm"
                            className="h-9 w-full sm:w-auto"
                            onClick={handleExport}
                        >
                            Export as CSV
                        </Button>
                    </div>
                </div>

                <StudentsListComponent
                    active={userType === "student"}
                    majors={majors}
                    userCourses={courses}
                    onExportReady={registerExportHandler}
                />
                {canViewTutors ? (
                    <TutorsListComponent
                        active={userType === "tutor"}
                        majors={majors}
                        userCourses={courses}
                        onExportReady={registerExportHandler}
                    />
                ) : null}
            </div>
        </section>

        </>
    )
}

export default Users;
