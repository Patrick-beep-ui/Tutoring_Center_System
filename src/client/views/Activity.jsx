import { useState, useCallback } from "react";
import Header from "../components/Header";

import "../App.css";
import Mini_Nav from "../components/Mini_Nav.jsx";
import Activity_Alerts from "./Activity_Alerts.jsx";
import Activity_Tutors from "./Activity_Tutors.jsx";
import Activity_Sessions from "./Activity_Sessions.jsx";

const Activity = () => {
    const [selectedSection, setSelectedSection] = useState('sessions');
    console.log("Activity rendered"); 

    const renderSection = useCallback(() => {
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
    }, [selectedSection]);

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
