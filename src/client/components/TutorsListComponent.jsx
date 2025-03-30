import UserNavigators from "./UsersNavigators";
import { useState, useEffect } from "react";
import axios from "axios";
import UserNavigationTable from "./UsersNavigationTable";

const TutorsListComponent = () => {
    const [tutors, setTutor] = useState([]);

    useEffect(() => {
        const getTutors = async () => {
            try {
                const response = await axios.get("/api/tutors");
                const {data} = response;
                console.log(data.tutors)
                setTutor(data.tutors)
            }
            catch(e) {

            }
        }

        getTutors();
    }, [])

    return (
        <div className="users-list tutors-list">
            <details>
                <summary>
                    <span className="summary-title">Tutors Directory</span>
                </summary>
                <UserNavigators/>
                <UserNavigationTable users={tutors} role={"tutor"}/>
            </details>
        </div>
    );
}

export default TutorsListComponent;