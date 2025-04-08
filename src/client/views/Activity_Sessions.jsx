import { useState, useEffect } from "react";
import SessionCard from "../components/SessionCard.jsx";

import "../App.css";

const Activity_Sessions = () => {
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3000/api/sessions")
            .then((response) => response.json())
            .then((data) => setSessions(data.sessions))
            .catch((error) => console.error("Error fetching sessions:", error));
    }, []);

    return (
        <>
                <div className="sessions-grid">
                    {sessions.map((session) => (
                        <SessionCard key={session.session_id} session={session} />
                    ))}
                </div>
        </>
    );
};

export default Activity_Sessions;
