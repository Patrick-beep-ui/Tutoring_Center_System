import { useState, useEffect, useRef, useMemo, memo } from "react"
import { Card, Button } from "react-bootstrap"
import { Tabs, Tab } from "react-bootstrap"
import api from "../../axiosService";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import exportToExcel from "../../services/exportChart"
import { exportChartAsImage } from "../../services/exportChartAsImage"

// Example Data

const performanceSampleData = [
  { name: "Alex J.", sessions: 45, rating: 4.8, students: 18 },
  { name: "Sarah W.", sessions: 38, rating: 4.7, students: 15 },
  { name: "Michael B.", sessions: 30, rating: 4.5, students: 12 },
  { name: "Emily D.", sessions: 42, rating: 4.9, students: 20 },
  { name: "David W.", sessions: 35, rating: 4.6, students: 14 },
  { name: "Jennifer L.", sessions: 28, rating: 4.4, students: 10 },
  { name: "Robert T.", sessions: 32, rating: 4.7, students: 15 },
  { name: "Lisa A.", sessions: 36, rating: 4.8, students: 16 },
]

const hoursSampleData = [
  { name: "Alex J.", hours: 45 },
  { name: "Sarah W.", hours: 38 },
  { name: "Michael B.", hours: 30 },
  { name: "Emily D.", hours: 42 },
  { name: "David W.", hours: 35 },
  { name: "Jennifer L.", hours: 28 },
  { name: "Robert T.", hours: 32 },
  { name: "Lisa A.", hours: 36 },
]

const subjectsSampleData = [
  { name: "Mathematics", value: 35, color: "#60a5fa" },
  { name: "Computer Science", value: 25, color: "#34d399" },
  { name: "Physics", value: 15, color: "#a78bfa" },
  { name: "Chemistry", value: 12, color: "#f87171" },
  { name: "Biology", value: 8, color: "#fbbf24" },
  { name: "Other", value: 5, color: "#94a3b8" },
]

const availabilitySampleData = [
  { name: "Morning (8AM-12PM)", value: 30, color: "#60a5fa" },
  { name: "Afternoon (12PM-4PM)", value: 45, color: "#34d399" },
  { name: "Evening (4PM-8PM)", value: 25, color: "#a78bfa" },
]

const TutorsReport = () => {
  const [chartType, setChartType] = useState("bar")

  // State variables for summary cards
  const [activeTutors, setActiveTutors] = useState(0);
  const [avgSessionsPerTutor, setAvgSessionsPerTutor] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  // State variables for charts data
  const [performanceData, setPerformanceData] = useState([]);
  const [hoursData, setHoursData] = useState([]);
  const [majorsData, setMajorsData] = useState([]);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [loading, setLoading] = useState(true);

  const performanceRef = useRef(null);
  const hoursRef = useRef(null);
  const majorsRef = useRef(null);
  const availabilityRef = useRef(null);

  useEffect(() => {
    const getReportData = async () => {
      try {
        setLoading(true);
        const {data} = await api.get("/report/tutors");

        setActiveTutors(data.tutorsAmount || 0);
        setAvgSessionsPerTutor(data.avgSessionsPerTutor || 0);

      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    }

    getReportData();
  }, [])

  const performanceChart = useMemo(
    () => (
      <ResponsiveContainer width="100%" height="100%" minHeight="400px">
        <BarChart data={performanceSampleData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#60a5fa" />
            <YAxis yAxisId="right" orientation="right" stroke="#f87171" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="sessions" name="Sessions" fill="#60a5fa" />
            <Bar yAxisId="right" dataKey="rating" name="Rating" fill="#f87171" />
        </BarChart>
      </ResponsiveContainer>
    ), 
    []
  );

  const hoursDataChart = useMemo(
    () => (
      <ResponsiveContainer width="100%" height="100%" minHeight="400px">
        <BarChart data={hoursSampleData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="hours" name="Hours" fill="#34d399" />
        </BarChart>
      </ResponsiveContainer>
    ),
    []
  );

  const majorsDataChart = useMemo(
    () => (
      <ResponsiveContainer width="100%" height="100%" minHeight="400px">
        <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <Pie
            data={subjectsSampleData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
          >
            {subjectsSampleData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} tutors`, "Count"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    ),
    []
  )

  const availabilityDataChart = useMemo(
    () => (
      <ResponsiveContainer width="100%" height="100%" minHeight="400px">
        <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <Pie
            data={availabilitySampleData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
          >
            {availabilitySampleData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} hours`, "Available"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    ),
    []
  )

  return (
    <div className="container my-4">
      {/* Cards */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mb-4">
        <CardSummary title="Active Tutors" value={activeTutors} change="+2"/>
        <CardSummary title="Avg. Sessions per Tutor" value={avgSessionsPerTutor} change="+3.5"/>
        <CardSummary title="Avg. Raiting" value="4.7/5" change="+0.1"/>
        <CardSummary title="Total Hours" value="286" change="+12%"/>
      </div>

      {/* Tabs with Charts */}
      <Tabs defaultActiveKey="weekly" id="report-tabs" className="mb-3">
        <Tab eventKey="weekly" title="Tutor Performance" onClick={() => setChartType("bar")}>
          <Card>
            <Card.Body ref={hoursRef}>
              <Card.Title>Tutor Performance</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">Sessions conducted and average ratings by tutor</Card.Subtitle>
              {performanceChart}
            </Card.Body>
            <ExportButtons
                data={performanceSampleData}
                refEl={performanceRef}
                filename="tutors_performance"
                chartType={chartType}
              />
          </Card>
        </Tab>

        <Tab eventKey="hourly" title="Hours by Tutor" onClick={() => setChartType("bar")}>
          <Card>
            <Card.Body ref={hoursRef}>
              <Card.Title>Hours by Tutors</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">Total tutoring hours provided by each tutor</Card.Subtitle>
              {/*<div className="h-100" style={{ minHeight: "400px", width: "100%" }}>*/}
                {hoursDataChart}
              {/*</div>}*/}
            </Card.Body>
            <ExportButtons
                data={hoursSampleData}
                refEl={hoursRef}
                filename="tutors_hours"
                chartType={chartType}
              />
          </Card>
        </Tab>

        <Tab eventKey="completion" title="Subjects Covered" onClick={() => setChartType("pie")}>
          <Card>
            <Card.Body ref={majorsRef}>
              <Card.Title>Subjects Covered</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">Distribution of tutoring sessions by subject area</Card.Subtitle>
              <div className="h-100 d-flex align-items-center justify-content-center" style={{ minHeight: "400px", width: "100%" }}>
                {majorsDataChart}
              </div>
            </Card.Body>
            <ExportButtons
                data={subjectsSampleData}
                refEl={majorsRef}
                filename="tutors_by_major"
                chartType={chartType}
              />
          </Card>
        </Tab>

        <Tab eventKey="feedback" title="Availability Analysis" onClick={() => setChartType("pie")}>
          <Card>
            <Card.Body ref={availabilityRef}>
              <Card.Title>Tutor Availability</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">Distribution of tutor availability throughout the day</Card.Subtitle>
              <div className="h-100 d-flex align-items-center justify-content-center" style={{ minHeight: "400px", width: "100%" }}>
                {availabilityDataChart}
              </div>
            </Card.Body>
            <ExportButtons
              data={availabilitySampleData}
              refEl={availabilityRef}
              filename="tutors_availability"
              chartType={chartType}
            />
          </Card>
        </Tab>
      </Tabs>
    </div>
  )
}

// --- Subcomponents to reuse code ---
const CardSummary = memo(({ title, value, change }) => (
  <div className="col">
    <Card className="h-100">
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text className="display-4">{value}</Card.Text>
        <div className="small text-muted"> <span className="text-success">{change}</span> from last month</div>
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

export default TutorsReport;
