import { useState, useCallback } from "react";
import Header from "../components/Header";
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
                <section className="ml-[var(--sidebar-content-offset)] h-screen w-[calc(100%-var(--sidebar-content-offset))] overflow-y-auto p-5 max-[991.98px]:ml-0 max-[991.98px]:w-full">
                <Mini_Nav 
                    setSelectedSection={setSelectedSection} 
                    selectedSection={selectedSection} 
                />


                    <div className={selectedSection === 'sessions' ? 'block' : 'hidden'}>
                        <Activity_Sessions />
                    </div>
                    <div className={selectedSection === 'feedback' ? 'block' : 'hidden'}>
                        <Activity_Feedback />
                    </div>
                    <div className={selectedSection === 'tutors' ? 'block' : 'hidden'}>
                        <Activity_Tutors />
                    </div>
                    <div className={selectedSection === 'alerts' ? 'block' : 'hidden'}>
                        <Activity_Alerts />
                    </div>
                </section>
        </>
    );
};

export default Activity;
