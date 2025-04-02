import { useState, useEffect } from "react";
import Header from "../components/Header";
import SessionCard from "../components/SessionCard.jsx";
import { NavLink, Link } from "react-router-dom";

import "../App.css";
import Mini_Nav from "../components/Mini_Nav.jsx";

const Activity = () => {
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3000/api/sessions")
            .then((response) => response.json())
            .then((data) => setSessions(data.sessions))
            .catch((error) => console.error("Error fetching sessions:", error));
    }, []);

    return (
        <>
            <Header />
            <section className="activity-container">
                <Mini_Nav/>
                <div className="sessions-grid">
                    {sessions.map((session) => (
                        <SessionCard key={session.session_id} session={session} />
                    ))}
                </div>
            </section>
        </>
    );
};

export default Activity;
