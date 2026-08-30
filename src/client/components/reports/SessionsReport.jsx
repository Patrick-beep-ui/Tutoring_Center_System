import React, { useState, useEffect, useRef, useMemo, memo, useContext } from "react";
import api from "../../axiosService";
import { SemesterContext } from "../../context/currentSemester";
import { ReportSummaryCard, ReportSummaryGrid, ReportTabs } from "./ReportUI";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

// Datos de ejemplo para weeklySampleData
const weeklySampleData = [
  { name: "Week 1", sessions: 45, completed: 42, cancelled: 3 },
  { name: "Week 2", sessions: 52, completed: 48, cancelled: 4 },
  { name: "Week 3", sessions: 48, completed: 45, cancelled: 3 },
  { name: "Week 4", sessions: 70, completed: 65, cancelled: 5 },
  { name: "Week 5", sessions: 65, completed: 60, cancelled: 5 },
  { name: "Week 6", sessions: 85, completed: 80, cancelled: 5 },
  { name: "Week 7", sessions: 78, completed: 72, cancelled: 6 },
  { name: "Week 8", sessions: 90, completed: 85, cancelled: 5 },
];

function SessionsReportComponent() {
  const [chartType, setChartType] = useState("bar");

  const [hourlyData, setHourlyData] = useState([]);
  const [completionData, setCompletionData] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  const [sessionAmount, setSessionAmount] = useState(0);
  const [averageDuration, setAverageDuration] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  const weeklyRef = useRef(null);
  const hourlyRef = useRef(null);
  const completionRef = useRef(null);
  const feedbackRef = useRef(null);

  const { selectedSemesterId } = useContext(SemesterContext);

  useEffect(() => {
    const getReportData = async () => {
      try {
        const { data } = await api.get(`/report/sessions${selectedSemesterId ? `?semester_id=${selectedSemesterId}` : ''}`);

        setWeeklyData(data.weeklyData || []);

        setHourlyData(data.hourlyData || []);
        setCompletionData(
          (data.completionData || []).map((item) => ({
            ...item,
            color: {
              completed: "#68AF58",
              canceled: "#C6453A",
              pending: "#D3A257",
              scheduled: "#5B99DE",
            }[item.name] || "#d1d5db",
          }))
        );
        setFeedbackData(
          (data.feedbackCounts || []).map((item) => ({
            name: `${item.rating} Stars`,
            value: item.count,
            color: {
              5: "#22c55e",
              4: "#84cc16",
              3: "#facc15",
              2: "#f97316",
              1: "#ef4444",
            }[item.rating] || "#d1d5db",
          }))
        );

        const rate = data.averageRating || 0;

        setSessionAmount(data.sessionsAmount || 0);
        setAverageDuration(data.averageDuration || 0);
        setCompletionRate(data.completionRate || 0);
        setAverageRating(data.averageRating % 1 === 0 ?  Math.trunc(rate) : rate);
      } catch (e) {
        console.error("Error fetching report data:", e);
      }
    };
    getReportData();
  }, [selectedSemesterId]);

  // Memoizar charts
  const weeklyChart = useMemo(
    () => (
      <ResponsiveContainer width="100%" height="100%" minHeight={400}>
        <BarChart
          data={weeklyData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="completed" name="Completed" fill="#4ade80" />
          <Bar dataKey="cancelled" name="Cancelled" fill="#f87171" />
        </BarChart>
      </ResponsiveContainer>
    ),
    [weeklyData]
  );

  const hourlyChart = useMemo(
    () => (
      <ResponsiveContainer width="100%" height="100%" minHeight={400}>
        <BarChart
          data={hourlyData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="session_duration" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="sessions" name="Sessions" fill="#60a5fa" />
        </BarChart>
      </ResponsiveContainer>
    ),
    [hourlyData]
  );

  const completionChart = useMemo(
    () => (
      <ResponsiveContainer width="100%" height="100%" minHeight={400}>
        <PieChart>
          <Pie
            data={completionData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
          >
            {completionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} sessions`, "Count"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    ),
    [completionData]
  );

  const feedbackChart = useMemo(
    () => (
      <ResponsiveContainer width="100%" height="100%" minHeight={400}>
        <PieChart>
          <Pie
            data={feedbackData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
          >
            {feedbackData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} sessions`, "Count"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    ),
    [feedbackData]
  );

  const tabs = [
    { key: "weekly", label: "Sessions by Week", title: "Sessions by Week", description: "Number of tutoring sessions scheduled each week", chart: weeklyChart, data: weeklyData, refEl: weeklyRef, filename: "sessions_by_week", chartType: "bar" },
    { key: "hourly", label: "Sessions by Hour", title: "Sessions by Hour", description: "Distribution of tutoring sessions throughout the day", chart: hourlyChart, data: hourlyData, refEl: hourlyRef, filename: "sessions_by_hour", chartType: "bar" },
    { key: "completion", label: "Completion Rate", title: "Session Completion Rate", description: "Breakdown of completed, cancelled, pending, and scheduled sessions", chart: completionChart, data: completionData, refEl: completionRef, filename: "completion_rate", chartType: "pie" },
    { key: "feedback", label: "Feedback Scores", title: "Feedback Scores Distribution", description: "Distribution of student ratings for tutoring sessions", chart: feedbackChart, data: feedbackData, refEl: feedbackRef, filename: "feedback_scores", chartType: "pie" },
  ];

  return (
    <div className="mx-auto my-6 w-full max-w-[1320px]">
      <ReportSummaryGrid>
        <ReportSummaryCard title="Total Sessions" value={sessionAmount} change="+12%" period="from last period" />
        <ReportSummaryCard title="Completion Rate" value={`${completionRate}%`} change="+3%" period="from last period" />
        <ReportSummaryCard title="Average Duration" value={`${averageDuration} hr`} change="-2 min" period="from last period" />
        <ReportSummaryCard title="Average Rating" value={`${averageRating}/5`} change="+0.2" period="from last period" />
      </ReportSummaryGrid>
      <ReportTabs
        tabs={tabs}
        chartType={chartType}
        onTabChange={(tab) => setChartType(tab.chartType)}
      />
    </div>
  );
}

export default memo(SessionsReportComponent);
