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
                        <ActivityCard time="10:24 AM" title="New Tutor Registered" description="A software engineer student has joined." tag="System" />
                        <ActivityCard time="11:00 AM" title="Academic Honors Assembly" description="Congratulate awarded tutors." tag="Reminder" />
                        <ActivityCard time="1:00 PM" title="Weekly Performance Update" description="Review the results and take action." tag="Alert" />
                    </div>

                    <TopTutorsList tutors={topTutors} rankWindow={rankWindow} semesterCode={semesterCode} />
                </div>
            </div>
        </>


    );
}


export default AdminHome;

