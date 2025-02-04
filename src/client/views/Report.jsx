import React, { useState, useEffect } from "react";
import { useNavigate, Link, useOutletContext, Outlet } from "react-router-dom";
import axios from "axios";
import {v4 as uuid} from "uuid";
import Header from "../components/Header";
import Graph from "../components/Chart";
import texts from "../texts/report.json";
import ReportCard from "../components/ReportCard";

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
                {Object.entries(report).map(([key, value]) => (
            <ReportCard key={key} value={key} count={value} />
          ))}
            </section>
            <section className="graphs">
                <div className="sessions-graph">
                    <Graph/>
                </div>
                <div>
                </div>
            </section>
        </section>
        </>
    )
}

export default Report;
