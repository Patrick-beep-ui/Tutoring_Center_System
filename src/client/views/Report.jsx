import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {v4 as uuid} from "uuid";
import Header from "../components/Header";

function Report() {
    const [report, setReport] = useState([
    ]);

    useEffect(() => {
        const getReport = async () => {
            try {
                const response = await axios.get("/api/report")
                const {data} = response;
                console.log(data.report);
                setReport(data.report);
            }
            catch(e) {
                console.error(e);
            }
        }
        getReport();
    }, []);

    return(
        <>
        <Header/>

        <section className="report-container section">
            <section className="counters">
                <div className="tutors-counter counter-container">
                    <div className="report-description">
                        <p>Active Tutors</p>
                        <p>The total number of tutors enrolled in the system</p>
                    </div>
                    <div className="report-data">
                        <p>{report.tutors}</p>
                        <a href="">See al tutors</a>
                    </div>
                </div>
                <div className="students-counter counter-container">
                    <div className="report-description">
                        <p>Total Students</p>
                        <p>The total number of students enrolled in the tutoring center</p>
                    </div>
                    <div className="report-data">
                        <p>{report.students}</p>
                        <a href="">See all students</a>
                    </div>
                </div>
                <div className="sessions-counter counter-container">
                    <div className="report-description">
                        <p>Completed Sessions</p>
                        <p>The total number of sessions delivered</p>
                    </div>
                    <div className="report-data">
                        <p>{report.sessions}</p>
                        <a href="">See all sessions</a>
                    </div>
                </div>
                <div className="tutor-courses-counter counter-container">
                    <div className="report-description">
                        <p>Tutor Courses</p>
                        <p>The number of courses that has one or more tutors</p>
                    </div>
                    <div className="report-data">
                        <p>{report.tutor_courses}</p>
                        <a href="">See all Tutor Courses</a>
                    </div>
                </div>
            </section>
        </section>
        </>
    )
}

export default Report;
