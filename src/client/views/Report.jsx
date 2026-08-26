import React, { useState, useEffect, useContext } from "react";
import Header from "../components/Header";
import Graph from "../components/Chart";
import ReportCard from "../components/ReportCard";
import PieChart from "../components/PieChart";
import auth from "../authService";
import { SemesterContext } from "../context/currentSemester";

function Report() {
    const [report, setReport] = useState([
    ]);
    const [sessions, setSessions] = useState([]);
    const { selectedSemesterId } = useContext(SemesterContext);

    useEffect(() => {
        const getReport = async () => {
            try {
                const response = await auth.get(`/api/report${selectedSemesterId ? `?semester_id=${selectedSemesterId}` : ''}`)
                const {data} = response;
                setReport(data.report);
            }
            catch(e) {
                console.error(e);
            }
        }
        getReport();
    }, [selectedSemesterId]);

    useEffect(() => {
        const getSessions = async () => {
             try {
                 const response = await auth.get(`/api/report/major-sessions${selectedSemesterId ? `?semester_id=${selectedSemesterId}` : ''}`);
                 const { data } = response;
                 setSessions(data.sessions);
             }
             catch(e) {
                 console.error(e);
             }
         }

         getSessions();
     }, [selectedSemesterId]);

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
