import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import auth from "../authService";

import Header from "../components/Header";
import TutorsListComponent from "../components/TutorsListComponent";
import StudentsListComponent from "../components/StudentsListComponent";
import UserTypeSelector from "../components/UserTypeSelector";

function Users() { 
    const [majors, setMajors] = useState([]);
    const [courses, setCourses] = useState([]);
    const [userType, setUserType] = useState("student");
    const { user } = useOutletContext();
    const viewerRole = user?.user_role ?? user?.role;
    const canViewTutors = viewerRole !== "student";

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
        <section className="section overflow-y-auto">
            <div className="mx-auto flex w-full max-w-[1500px] min-w-0 flex-col gap-5">
                <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="text-left">
                        <h1 className="m-0 text-left text-2xl font-bold text-primary sm:text-3xl">
                            Users
                        </h1>
                        <p className="mt-1 mb-0 text-sm text-muted-foreground sm:text-base">
                            Manage students and tutors
                        </p>
                    </div>
                    <UserTypeSelector
                        value={userType}
                        onValueChange={setUserType}
                        canViewTutors={canViewTutors}
                    />
                </div>

                <StudentsListComponent
                    active={userType === "student"}
                    majors={majors}
                    userCourses={courses}
                />
                {canViewTutors ? (
                    <TutorsListComponent
                        active={userType === "tutor"}
                        majors={majors}
                        userCourses={courses}
                    />
                ) : null}
            </div>
        </section>

        </>
    )
}

export default Users;
