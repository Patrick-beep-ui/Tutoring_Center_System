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

        <section className="section flex flex-col justify-around overflow-auto">
            <section className="grid grid-cols-[repeat(auto-fit,minmax(230px,auto))] gap-8 pt-5">
                {Object.entries(report).map(([key, value]) => (
            <ReportCard key={key} value={key} count={value} />
          ))}
            </section>
            <section className="grid w-full grid-cols-1 gap-2 md:grid-cols-2">
                <div className="mt-3 w-[98%] rounded-[5px] border border-[var(--gray)] shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                    <Graph/>
                </div>
                <div className="mt-3 w-[98%] rounded-[5px] border border-[var(--gray)] shadow-[0_2px_4px_rgba(0,0,0,0.1)] [&_canvas]:h-1/2! [&_canvas]:w-[500px]! [&_canvas]:p-5">
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
