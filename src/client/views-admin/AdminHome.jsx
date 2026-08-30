import { useState, useEffect, useContext } from "react";
import Header from "../components/Header";

import StatBox from "../components/StatBox.jsx";
import ActivityCard from "../components/ActivityCard";
import TopTutorsList from "../components/TopTutorsList.jsx";
import api from "../axiosService";
import { alertCategoryLabel } from "../services/alertLabels";
import { SemesterContext } from "../context/currentSemester";



const AdminHome = () => {
    const { selectedSemesterId } = useContext(SemesterContext);
    const [topTutors, setTopTutors] = useState([]);
    const [rankWindow, setRankWindow] = useState(null);
    const [semesterCode, setSemesterCode] = useState("");
    const [activities, setActivities] = useState([]);
    const [activitiesWindow, setActivitiesWindow] = useState("recent");

    useEffect(() => {
        const getTopTutors = async () => {
            try {
                const response = await api.get(`/report/top-tutors${selectedSemesterId ? `?semester_id=${selectedSemesterId}` : ''}`);
                const { data } = response;
                setTopTutors(data.tutors || []);
                setRankWindow(data.window || null);
                setSemesterCode(data.semester_code || "");
            }
            catch(e) {
                console.error(e);
                setTopTutors([]);
                setRankWindow(null);
            }
        };

        getTopTutors();
    }, [selectedSemesterId]);

    useEffect(() => {
        const getActivities = async () => {
            try {
                const url = `/alerts${selectedSemesterId ? `?semester_id=${selectedSemesterId}` : ''}`;
                const { data } = await api.get(url);
                setActivities(data.alerts || []);
                setActivitiesWindow(data.window || "recent");
            }
            catch(e) {
                console.error(e);
                setActivities([]);
            }
        };

        getActivities();
    }, [selectedSemesterId]);

    const formatActivityTime = (createdAt) => {
        if (!createdAt) return "";
        return new Date(createdAt).toLocaleString("en-US", {
            month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
        });
    };

    const tagForSeverity = (severity) => {
        switch (severity) {
            case "high": return "Alert";
            case "critical": return "Alert";
            case "medium": return "Reminder";
            default: return "System";
        }
    };

    return (

        <>
            <Header />

            <div className="mr-[30px] ml-[var(--sidebar-content-offset)] flex flex-col gap-5 pt-[100px] max-[991.98px]:ml-0">
                <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 xl:grid-cols-4">
                    <StatBox title="New Students" value="28" subtitle="+12% from last month" color="green" />
                    <StatBox title="Active Tutors" value="6" subtitle="+2 from last week" color="green" />
                    <StatBox title="Sessions Today" value="8" subtitle="2 scheduled" />
                    <StatBox title="Completion Rate" value="92%" subtitle="-3% from last week" color="red" />
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[2fr_1fr]">
                    <div className="m-[19px] rounded-[10px] bg-white p-5 shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
                        <h3 className="mb-5 text-left text-2xl font-semibold">Recent Activities</h3>
                        <div className="max-h-[480px] overflow-y-auto pr-1">
                            {activitiesWindow === "fallback" && activities.length > 0 && (
                                <p className="mb-2.5 text-sm text-amber-700">No recent activity in the past week — showing latest.</p>
                            )}
                            {activities.length > 0 ? (
                                activities.map((a, i) => (
                                    <ActivityCard
                                        key={a.alert_id ?? i}
                                        time={formatActivityTime(a.created_at)}
                                        title={alertCategoryLabel(a.category)}
                                        description={a.message}
                                        tag={tagForSeverity(a.severity_level)}
                                    />
                                ))
                            ) : (
                                <p className="py-4 text-center italic text-gray-500">No recent activity yet.</p>
                            )}
                        </div>
                    </div>

                    <TopTutorsList tutors={topTutors} rankWindow={rankWindow} semesterCode={semesterCode} />
                </div>
            </div>
        </>


    );
}


export default AdminHome;

