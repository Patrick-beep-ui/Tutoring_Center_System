import React, { useState, useEffect } from "react";
import { useNavigate, Link, useOutletContext, Outlet } from "react-router-dom";
import axios from "axios";
import {v4 as uuid} from "uuid";
import Header from "../components/Header";
import Graph from "../components/Chart";
import ReportCard from "../components/ReportCard";
import PieChart from "../components/PieChart";

function Report() {
    const [report, setReport] = useState([
    ]);
    const [sessions, setSessions] = useState([]);

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

    useEffect(() => {
        const getSessions = async () => {
             try {
                 const response = await axios.get('/api/major-sessions');
                 const { data } = response;
                 setSessions(data.sessions);
                 console.log(data.sessions)
             }
             catch(e) {
                 console.error(e);
             }
         }
 
         getSessions();
     }, []);

    return(
        <>
        <Header/>

        <section className="report-container section">
            <section className="counters">
                {Object.entries(report).map(([key, value]) => (
            <ReportCard key={key} value={key} count={value} />
          ))}
            </section>
            <section className="graphs">
                <div className="sessions-graph">
                    <Graph/>
                </div>
                <div className="sessions-graph pie-chart"> 
                    <PieChart data={sessions}/>
                </div>
                <div>
                </div>
            </section>
        </section>
        </>
    )
}

export default Report;
