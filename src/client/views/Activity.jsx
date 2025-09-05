import { useState, useCallback } from "react";
import Header from "../components/Header";

import "../App.css";
import Mini_Nav from "../components/Mini_Nav.jsx";
import Activity_Alerts from "./Activity_Alerts.jsx";
import Activity_Tutors from "./Activity_Tutors.jsx";
import Activity_Sessions from "./Activity_Sessions.jsx";
import Activity_Feedback from "./Activity_Feedback.jsx";

const Activity = () => {
    const [selectedSection, setSelectedSection] = useState('sessions');

    return (
        <>
            <Header />
                <section className="activity-container">
                <Mini_Nav 
                    setSelectedSection={setSelectedSection} 
                    selectedSection={selectedSection} 
                />


                    <div style={{ display: selectedSection === 'sessions' ? 'block' : 'none' }}>
                        <Activity_Sessions />
                    </div>
                    <div style={{ display: selectedSection === 'feedback' ? 'block' : 'none' }}>
                        <Activity_Feedback />
                    </div>
                    <div style={{ display: selectedSection === 'tutors' ? 'block' : 'none' }}>
                        <Activity_Tutors />
                    </div>
                    <div style={{ display: selectedSection === 'alerts' ? 'block' : 'none' }}>
                        <Activity_Alerts />
                    </div>
                </section>
        </>
    );
};

export default Activity;
