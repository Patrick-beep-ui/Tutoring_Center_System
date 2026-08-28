import { useState, useEffect, useContext } from "react";
import AlertBox from "../components/AlertBox.jsx";
import Header from "../components/Header.jsx";
import api from "../axiosService";
import { SemesterContext } from "../context/currentSemester";
import "../App.css";

const severityToType = (severity) => {
    switch (severity) {
        case "high":
        case "critical":
            return "urgent";
        case "medium":
            return "warning";
        default:
            return "information";
    }
};

const activityToDetails = (a) => {
    const details = [];
    if (a.severity_level) details.push({ label: "Severity", value: a.severity_level });
    if (a.user_name) details.push({ label: "User", value: a.user_name });
    if (a.source) details.push({ label: "Source", value: a.source });
    if (a.created_at) {
        details.push({ label: "Date", value: new Date(a.created_at).toLocaleString("en-US") });
    }
    return details;
};

const Activity_Alerts = () => {
    const { selectedSemesterId } = useContext(SemesterContext);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const url = `/alerts${selectedSemesterId ? `?semester_id=${selectedSemesterId}` : ''}`;
                const { data } = await api.get(url);
                setAlerts(data.alerts || []);
            } catch (e) {
                console.error(e);
                setAlerts([]);
            }
        };
        fetchAlerts();
    }, [selectedSemesterId]);

    return (
        <>
            <Header />
            <section className="activity-container">
                <h1 className="page-title">System Alerts</h1>
                {alerts.length > 0 ? (
                    alerts.map(a => (
                        <AlertBox
                            key={a.alert_id}
                            title={a.category || "Alert"}
                            message={a.message}
                            type={severityToType(a.severity_level)}
                            details={activityToDetails(a)}
                        />
                    ))
                ) : (
                    <p className="text-muted">No alerts yet.</p>
                )}
            </section>
        </>
    );
};

export default Activity_Alerts;
