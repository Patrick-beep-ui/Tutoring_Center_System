import { useState, useEffect, useContext } from "react";
import Header from "../components/Header";
import "../App.css";

import StatBox from "../components/StatBox.jsx";
import ActivityCard from "../components/ActivityCard";
import TopTutorsList from "../components/TopTutorsList.jsx";
import api from "../axiosService";
import { SemesterContext } from "../context/currentSemester";



const AdminHome = () => {
    const { selectedSemesterId } = useContext(SemesterContext);
    const [topTutors, setTopTutors] = useState([]);
    const [rankWindow, setRankWindow] = useState(null);
    const [semesterCode, setSemesterCode] = useState("");
    const [activities, setActivities] = useState([]);

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

            <div className="dashboard">
                <div className="stats-grid">
                    <StatBox title="New Students" value="28" subtitle="+12% from last month" color="green" />
                    <StatBox title="Active Tutors" value="6" subtitle="+2 from last week" color="green" />
                    <StatBox title="Sessions Today" value="8" subtitle="2 scheduled" />
                    <StatBox title="Completion Rate" value="92%" subtitle="-3% from last week" color="red" />
                </div>

                <div className="content-grid">
                    <div className="activities">
                        <h3 className= "h3-title">Recent Activities</h3>
                        <div className="activities-list">
                            {activities.length > 0 ? (
                                activities.map((a, i) => (
                                    <ActivityCard
                                        key={a.alert_id ?? i}
                                        time={formatActivityTime(a.created_at)}
                                        title={a.category || "Alert"}
                                        description={a.message}
                                        tag={tagForSeverity(a.severity_level)}
                                    />
                                ))
                            ) : (
                                <p className="activities-empty">No recent activity yet.</p>
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

