import { useState, useEffect } from "react";
import Header from "../components/Header";
import SessionCard from "../components/SessionCard.jsx";
import { NavLink, Link } from "react-router-dom";

import "../App.css";
import Mini_Nav from "../components/Mini_Nav.jsx";
import Activity_Alerts from "./Activity_Alerts.jsx";
import Activity_Tutors from "./Activity_Tutors.jsx";
import Activity_Sessions from "./Activity_Sessions.jsx";

const Activity = () => {

    const [selectedSection, setSelectedSection] = useState('sessions');



    const renderSection = () => {
        switch (selectedSection) {
            case 'sessions':
                return <Activity_Sessions/>;
            case 'tutors':
                return <Activity_Tutors/>;
            case 'students':
                 return <Activity_Tutors/>;
            case 'alerts':
                return <Activity_Alerts/>;
            default:
                return <div>Select a section</div>;
        }
    };



    return (
        <>
            <Header />
            <section className="activity-container">
                <Mini_Nav setSelectedSection={setSelectedSection}/>
                {renderSection()}

            </section>
        </>
    );
};

export default Activity;
