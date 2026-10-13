import { useState, useCallback } from "react";
import Header from "../../../components/shared/Header";
import Mini_Nav from "../../../components/admin/activity/Mini_Nav.jsx";
import Activity_Alerts from "./Activity_Alerts.jsx";
import Activity_Tutors from "./Activity_Tutors.jsx";
import Activity_Sessions from "./Activity_Sessions.jsx";
import Activity_Feedback from "./Activity_Feedback.jsx";
import DateRangeSelector from "../../../components/shared/filters/DateRangeSelector.jsx";

const Activity = () => {
    const [selectedSection, setSelectedSection] = useState('sessions');
    const [dateRange, setDateRange] = useState({ from: "", to: "" });

    return (
        <>
            <Header />
            <section className="ml-[var(--sidebar-content-offset)] h-screen w-[calc(100%-var(--sidebar-content-offset))] overflow-y-auto p-5 max-[991.98px]:ml-0 max-[991.98px]:w-full">
                <div className="mt-20 flex flex-wrap items-end justify-between gap-4 max-md:mt-8">
                    <Mini_Nav
                        setSelectedSection={setSelectedSection}
                        selectedSection={selectedSection}
                    />
                    <DateRangeSelector
                        from={dateRange.from}
                        to={dateRange.to}
                        onFromChange={(from) => setDateRange((current) => ({ ...current, from }))}
                        onToChange={(to) => setDateRange((current) => ({ ...current, to }))}
                    />
                </div>


                    <div className={selectedSection === 'sessions' ? 'block' : 'hidden'}>
                        <Activity_Sessions dateRange={dateRange} />
                    </div>
                    <div className={selectedSection === 'feedback' ? 'block' : 'hidden'}>
                        <Activity_Feedback dateRange={dateRange} />
                    </div>
                    <div className={selectedSection === 'tutors' ? 'block' : 'hidden'}>
                        <Activity_Tutors dateRange={dateRange} />
                    </div>
                    <div className={selectedSection === 'alerts' ? 'block' : 'hidden'}>
                        <Activity_Alerts dateRange={dateRange} />
                    </div>
            </section>
        </>
    );
};

export default Activity;
