import Header from "../components/Header";
import "../App.css";

import StatBox from "../components/StatBox.jsx";
import ActivityCard from "../components/ActivityCard";
import TopTutorsList from "../components/TopTutorsList.jsx";



const AdminHome = () =>{

    const tutors = [
        "1. Patrick Solis",
        "2. Lucia Acosta",
        "3. Fabricio Bermudez",
        "4. Luis Saravia",
        "5. Elisa Granizo",
        "6. Lisbeth Rodriguez",
        "7. Jesahel Gomez",
        "8. Cynthia Nicolas",
    ];
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

                    <TopTutorsList tutors={tutors} />
                </div>
            </div>
        </>


    );
}


export default AdminHome;