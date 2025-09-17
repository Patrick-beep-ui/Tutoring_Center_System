import { useState, useEffect, memo, useCallback } from "react";
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

    const removeSessionFromState = useCallback(
        (sessionId) => {
          setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
        },
        [setSessions]
      );

    return (
        <>
                <div className="sessions-grid">
                    {sessions.map((session) => (
                        <SessionCard key={session.session_id} session={session} onDelete={removeSessionFromState}/>
                    ))}
                </div>
        </>
    );
};

export default memo(Activity_Sessions);
