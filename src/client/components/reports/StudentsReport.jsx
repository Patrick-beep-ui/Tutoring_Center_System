import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import { Card, Button } from "react-bootstrap";
import { Tabs, Tab } from "react-bootstrap";
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
} from "recharts";

import exportToExcel from "../../services/exportChart"
import { exportChartAsImage } from "../../services/exportChartAsImage";

  // Nueva data
  const attendanceSampleData = [
    { name: "Week 1", attended: 40, missed: 5 },
    { name: "Week 2", attended: 45, missed: 7 },
    { name: "Week 3", attended: 42, missed: 6 },
    { name: "Week 4", attended: 50, missed: 5 },
    { name: "Week 5", attended: 55, missed: 10 },
    { name: "Week 6", attended: 60, missed: 8 },
    { name: "Week 7", attended: 58, missed: 7 },
    { name: "Week 8", attended: 65, missed: 5 },
  ];

  // Sample data for popular subjects
  const coursesSampleData = [
    { name: "Calculus I", students: 35 },
    { name: "Intro to Programming", students: 30 },
    { name: "Organic Chemistry", students: 25 },
    { name: "Physics Mechanics", students: 22 },
    { name: "Data Structures", students: 20 },
    { name: "Linear Algebra", students: 18 },
    { name: "General Biology", students: 15 },
    { name: "Statistics", students: 12 },
  ];

  // Sample data for students by major
  const majorsSampleData = [
    { name: "Computer Science", value: 25, color: "#60a5fa" },
    { name: "Engineering", value: 20, color: "#34d399" },
    { name: "Biology", value: 15, color: "#a78bfa" },
    { name: "Mathematics", value: 12, color: "#f87171" },
    { name: "Chemistry", value: 10, color: "#fbbf24" },
    { name: "Physics", value: 8, color: "#94a3b8" },
    { name: "Other", value: 10, color: "#cbd5e1" },
  ];

  // Sample data for retention rate
  const retentionSampleData = [
    { name: "Returning", value: 65, color: "#4ade80" },
    { name: "One-time", value: 35, color: "#94a3b8" },
  ];

const StudentsReport = () => {
  const [chartType, setChartType] = useState("bar");
  const [loading, setLoading] = useState(true);

  const [activeStudents, setActiveStudents] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [avgSessions, setAvgSessions] = useState(0);
  const [retentionRate, setRetentionRate] = useState(0);

  const [weeklyData, setWeeklyData] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]);
  const [studentsByMajor, setStudentsByMajor] = useState([]);
  const [retentionData, setRetentionData] = useState([]);

  const attendanceRef = useRef(null);
  const coursesRef = useRef(null);
  const majorsRef = useRef(null);
  const retentionRef = useRef(null);

  useEffect(() => {
    const getReportData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/report/students");
        const data = response.data;

        const formatRates = (value) => {
          return value % 1 === 0 ? Math.trunc(value) : value;
        }

        setActiveStudents(data.studentsAmount);
        setAttendanceRate(formatRates(data.attendanceRate));
        setAvgSessions(data.avgSessionsPerStudent);
        setRetentionRate(formatRates(data.retentionRate));

        setPopularCourses((data.popularCourses || []).map(course => {
          return {
            name: course.course_name,
            sessions: course.sessions_count,
            completed: course.completed,
            scheduled: course.scheduled,
            pending: course.pending
          }
        }));

        setStudentsByMajor((data.studentsByMajor || []).map((major, index) => {
          return {
            name: major.major_name,
            value: major.students_count,
            color: [
              "#60a5fa", "#34d399", "#a78bfa", "#f87171", "#fbbf24", "#94a3b8", "#cbd5e1"
            ][index] || "#cbd5e1"
          }
        }));

        const retentionRaw = data.studentRetention?.[0] || {};

        const retentionArray = [
          { name: "Returning", value: Number(retentionRaw.returning_students || 0), color: "#4ade80" },
          { name: "One-time", value: Number(retentionRaw.one_time_students || 0), color: "#94a3b8" }
        ];

        setRetentionData(retentionArray);


      }
      catch(e) {
        console.error("Error fetching report data:", e);
      }
      finally {
        setLoading(false);
      }
    }

    getReportData()
  }, [])

  const attendanceChart = useMemo(() => (
    <ResponsiveContainer width="100%" height="100%" minHeight="400px">
      <BarChart data={attendanceSampleData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="attended" name="Attended" fill="#4ade80" />
        <Bar dataKey="missed" name="Missed" fill="#f87171" />
      </BarChart>
    </ResponsiveContainer>
  ), [attendanceSampleData]);

  const coursesChart = useMemo(() => (
    <ResponsiveContainer width="100%" height="100%" minHeight="400px">
      <BarChart data={popularCourses} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={150} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="sessions" name="Sessions" fill="#a78bfa" />
      </BarChart>
    </ResponsiveContainer>
  ), [popularCourses]);

  const majorsChart = useMemo(() => (
    <ResponsiveContainer width="100%" height="100%" minHeight="400px">
      <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <Pie data={studentsByMajor} cx="50%" cy="50%" labelLine={true} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={150} fill="#8884d8" dataKey="value">
            {studentsByMajor.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} students`, "Count"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  ), [studentsByMajor]);

  const retentionChart = useMemo(() => (
    <ResponsiveContainer width="100%" height="100%" minHeight="400px">
      <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <Pie data={retentionData} cx="50%" cy="50%" labelLine={true} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={150} fill="#8884d8" dataKey="value">
          {retentionData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} students`, "Count"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  ), [retentionData]);

  return (
    <div className="container my-4">
      {/* Cards */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mb-4">
        <CardSummary title="Active Students" value={activeStudents} change="+2" />
        <CardSummary title="Attendance Rate" value={`${attendanceRate}%`} change="+2%" />
        <CardSummary title="Avg. Sessions per Student" value={avgSessions} change="+2" />
        <CardSummary title="Retention Rate" value={`${retentionRate}%`} change="+5%" />
      </div>

      {/* Tabs with Charts */}
      <Tabs defaultActiveKey="weekly" id="report-tabs" className="mb-3">
        <Tab eventKey="weekly" title="Student Attendance" onClick={() => setChartType("bar")}>
          <Card>
            <Card.Body ref={attendanceRef}>
              <Card.Title>Student Attendance</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">Weekly attendance and missed sessions</Card.Subtitle>
              {attendanceChart}
            </Card.Body>
            <ExportButtons
              data={attendanceSampleData}
              refEl={attendanceRef}
              filename="students_attendance"
              chartType={chartType}
            />
          </Card>
        </Tab>

        <Tab eventKey="hourly" title="Popular Courses" onClick={() => setChartType("bar")}>
          <Card>
            <Card.Body ref={coursesRef}>
              <Card.Title>Popular Courses</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">Most requested tutoring courses</Card.Subtitle>
              {coursesChart}
            </Card.Body>
            <ExportButtons
              data={popularCourses}
              refEl={coursesRef}
              filename="popular_courses"
              chartType={chartType}
            />
          </Card>
        </Tab>

        <Tab eventKey="completion" title="Students by Major" onClick={() => setChartType("pie")}>
          <Card>
            <Card.Body ref={majorsRef}>
              <Card.Title>Students by Major</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">Distribution of active students by academic major</Card.Subtitle>
              <div className="h-100 d-flex align-items-center justify-content-center" style={{ minHeight: "400px", width: "100%" }}>
                {majorsChart}
              </div>
            </Card.Body>
            <ExportButtons
              data={studentsByMajor}
              refEl={majorsRef}
              filename="students_by_major"
              chartType={chartType}
            />
          </Card>
        </Tab>

        <Tab eventKey="feedback" title="Retention Rate" onClick={() => setChartType("pie")}>
          <Card>
            <Card.Body ref={retentionRef}>
              <Card.Title>Student Retention</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">Percentage of returning vs. one-time students</Card.Subtitle>
             {retentionChart}
            </Card.Body>
            <ExportButtons
              data={retentionData}
              refEl={retentionRef}
              filename="students_retention"
              chartType={chartType}
            />
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

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

const CustomTooltip = memo(({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const { completed, scheduled, sessions, pending } = payload[0].payload;
    return (
      <div style={{ background: "#fff", padding: "10px", border: "1px solid #ccc" }}>
        <p>{label}</p>
        <p style={{color: "#a78bfa"}}>Total: {sessions}</p>
        <p style={{color: " #34d399"}}>Completed: {completed}</p>
        <p style={{color: "#60a5fa"}}>Scheduled: {scheduled}</p>
        <p style={{color: "#f2a93b"}}>Pending: {pending}</p>
      </div>
    );
  }
  return null;
});

export default memo(StudentsReport);
