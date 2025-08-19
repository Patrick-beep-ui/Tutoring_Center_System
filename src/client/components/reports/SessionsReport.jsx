import React, { useState, useEffect, useRef, useMemo, memo } from "react";
import api from "../../axiosService";
import { Card } from "react-bootstrap";
import { Tabs, Tab } from "react-bootstrap";
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

import { exportChartAsImage } from "../../services/exportChartAsImage";
import exportToExcel from "../../services/exportChart";

// Datos de ejemplo para weeklyData
const weeklyData = [
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
  const [hourlyData, setHourlyData] = useState([]);
  const [completionData, setCompletionData] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);
  const [sessionAmount, setSessionAmount] = useState(0);
  const [averageDuration, setAverageDuration] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [averageRating, setAverageRating] = useState(4.5);
  const [chartType, setChartType] = useState("bar");

  const weeklyRef = useRef(null);
  const hourlyRef = useRef(null);
  const completionRef = useRef(null);
  const feedbackRef = useRef(null);

  useEffect(() => {
    const getReportData = async () => {
      try {
        const { data } = await api.get("/report/sessions");

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

        setSessionAmount(data.sessionsAmount || 0);
        setAverageDuration(data.averageDuration || 0);
        setCompletionRate(data.completionRate || 0);
        setAverageRating(data.averageRating || 4.5);
      } catch (e) {
        console.error("Error fetching report data:", e);
      }
    };
    getReportData();
  }, []);

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
    []
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
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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

  return (
    <div className="container my-4">
      {/* Cards */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mb-4">
        <CardSummary title="Total Sessions" value={sessionAmount} change="+12%" />
        <CardSummary title="Completion Rate" value={`${completionRate}%`} change="+3%" />
        <CardSummary title="Average Duration" value={`${averageDuration} hr`} change="-2 min" />
        <CardSummary title="Average Rating" value={`${averageRating}/5`} change="+0.2" />
      </div>

      {/* Tabs with Charts */}
      <Tabs
        defaultActiveKey="weekly"
        id="report-tabs"
        className="mb-3"
        onSelect={(k) => setChartType(k === "weekly" || k === "hourly" ? "bar" : "pie")}
      >
        <Tab eventKey="weekly" title="Sessions by Week">
          <Card>
            <Card.Body ref={weeklyRef}>
              <Card.Title>Sessions by Week</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                Number of tutoring sessions scheduled each week
              </Card.Subtitle>
              {weeklyChart}
            </Card.Body>
            <ExportButtons
                data={weeklyData}
                refEl={weeklyRef}
                filename="sessions_by_week"
                chartType={chartType}
            />
          </Card>
        </Tab>

        <Tab eventKey="hourly" title="Sessions by Hour">
          <Card>
            <Card.Body ref={hourlyRef}>
              <Card.Title>Sessions by Hour</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                Distribution of tutoring sessions throughout the day
              </Card.Subtitle>
              {hourlyChart}
            </Card.Body>
            <ExportButtons
                data={hourlyData}
                refEl={hourlyRef}
                filename="sessions_by_hour"
                chartType={chartType}
              />
          </Card>
        </Tab>

        <Tab eventKey="completion" title="Completion Rate">
          <Card>
            <Card.Body ref={completionRef}>
              <Card.Title>Session Completion Rate</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                Breakdown of completed, cancelled, pending, and scheduled sessions
              </Card.Subtitle>
              {completionChart}
            </Card.Body>
            <ExportButtons
                data={completionData}
                refEl={completionRef}
                filename="completion_rate"
                chartType={chartType}
              />
          </Card>
        </Tab>

        <Tab eventKey="feedback" title="Feedback Scores">
          <Card>
            <Card.Body ref={feedbackRef}>
              <Card.Title>Feedback Scores Distribution</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                Distribution of student ratings for tutoring sessions
              </Card.Subtitle>
              {feedbackChart}
            </Card.Body>
            <ExportButtons
                data={feedbackData}
                refEl={feedbackRef}
                filename="feedback_scores"
                chartType={chartType}
              />
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}

// --- Subcomponents to reuse code ---
const CardSummary = memo(({ title, value, change }) => (
  <div className="col">
    <Card className="h-100">
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text className="display-4">{value}</Card.Text>
        <div className="small text-muted">{change} from last period</div>
      </Card.Body>
    </Card>
  </div>
));

const ExportButtons = memo(({ data, refEl, filename, chartType }) => (
  <>
  <div className="d-flex justify-content-start align-self-center">
    <button
      className="btn btn-outline-primary mb-3"
      style={{ marginTop: "20px" }}
      onClick={() => exportToExcel(data, filename, chartType)}
    >
      Export Data
    </button>
    <button
      className="btn btn-outline-primary mb-3"
      style={{ marginLeft: "15px", marginTop: "20px" }}
      onClick={() => exportChartAsImage(refEl.current, "png", filename)}
    >
      Export Chart as Image
    </button>
  </div>
  </>
));

export default memo(SessionsReportComponent);
