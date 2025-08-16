import { useState, useEffect, memo } from "react";
import SessionCard from "../components/SessionCard.jsx";
import api from "../axiosService.js";

import "../App.css";

const Activity_Sessions = () => {
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await api.get("/sessions");
                setSessions(response.data.sessions);
            } catch (error) {
                console.error("Error fetching sessions:", error);
            }
        };

        fetchSessions();
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

export default memo(Activity_Sessions);
