import { useState, useEffect, useContext } from "react";
import AlertBox from "../components/AlertBox.jsx";
import Header from "../components/Header.jsx";
import api from "../axiosService";
import { alertCategoryLabel } from "../services/alertLabels";
import { SemesterContext } from "../context/currentSemester";

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
    const [window, setWindow] = useState("recent");

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const url = `/alerts${selectedSemesterId ? `?semester_id=${selectedSemesterId}` : ''}`;
                const { data } = await api.get(url);
                setAlerts(data.alerts || []);
                setWindow(data.window || "recent");
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
            <section className="ml-[var(--sidebar-content-offset)] h-screen w-[calc(100%-var(--sidebar-content-offset))] overflow-y-auto p-5 max-[991.98px]:ml-0 max-[991.98px]:w-full">
                <h1 className="my-[30px] mb-[25px] text-left text-[22px] text-[#333]">System Alerts</h1>
                {window === "fallback" && alerts.length > 0 && (
                    <p className="mb-2.5 text-sm text-amber-700">No recent activity in the past week — showing latest.</p>
                )}
                {alerts.length > 0 ? (
                    alerts.map(a => (
                        <AlertBox
                            key={a.alert_id}
                            title={alertCategoryLabel(a.category)}
                            message={a.message}
                            type={severityToType(a.severity_level)}
                            details={activityToDetails(a)}
                        />
                    ))
                ) : (
                    <p className="text-muted-foreground">No alerts yet.</p>
                )}
            </section>
        </>
    );
};

export default Activity_Alerts;
