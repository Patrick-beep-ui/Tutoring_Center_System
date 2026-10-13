import { useState, useEffect, useContext } from "react";
import AlertBox from "../../../components/shared/alerts/AlertBox.jsx";
import api from "../../../axiosService";
import { alertCategoryLabel } from "../../../services/alertLabels";
import { SemesterContext } from "../../../context/currentSemester";

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

const Activity_Alerts = ({ dateRange }) => {
    const { selectedSemesterId } = useContext(SemesterContext);
    const [alerts, setAlerts] = useState([]);
    const [window, setWindow] = useState("recent");

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const params = new URLSearchParams();
                if (selectedSemesterId) params.set('semester_id', selectedSemesterId);
                if (dateRange.from) params.set('date_from', dateRange.from);
                if (dateRange.to) params.set('date_to', dateRange.to);
                const url = `/alerts${params.size ? `?${params}` : ''}`;
                const { data } = await api.get(url);
                setAlerts(data.alerts || []);
                setWindow(data.window || "recent");
            } catch (e) {
                console.error(e);
                setAlerts([]);
            }
        };
        fetchAlerts();
    }, [selectedSemesterId, dateRange]);

    return (
        <>
            <section>
                <h1 className="mb-5 mt-6 text-left text-[22px] text-[#333]">System Alerts</h1>
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
                    <p className="text-muted-foreground">
                        {dateRange.from || dateRange.to ? "No alerts match the selected date range." : "No alerts yet."}
                    </p>
                )}
            </section>
        </>
    );
};

export default Activity_Alerts;
