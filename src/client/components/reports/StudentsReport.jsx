import { useState, useEffect, useCallback, useMemo, memo, useRef, useContext } from "react";
import api from "../../axiosService";
import { SemesterContext } from "../../context/currentSemester";
import { ReportSummaryCard, ReportSummaryGrid, ReportTabs } from "./ReportUI";
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

  const { selectedSemesterId } = useContext(SemesterContext);

  useEffect(() => {
    const getReportData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/report/students${selectedSemesterId ? `?semester_id=${selectedSemesterId}` : ''}`);
        const data = response.data;

        const formatRates = (value) => {
          return value % 1 === 0 ? Math.trunc(value) : value;
        }

        setActiveStudents(data.studentsAmount);
        setAttendanceRate(formatRates(data.attendanceRate));
        setAvgSessions(data.avgSessionsPerStudent);
        setRetentionRate(formatRates(data.retentionRate));

        setWeeklyData(data.weeklyData || [])

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
  }, [selectedSemesterId])

  const attendanceChart = useMemo(() => (
    <ResponsiveContainer width="100%" height="100%" minHeight="400px">
      <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="attended" name="Attended" fill="#4ade80" />
        <Bar dataKey="scheduled" name="Scheduled" fill="#60a5fa" />
        <Bar dataKey="missed" name="Missed" fill="#f87171" />
      </BarChart>
    </ResponsiveContainer>
  ), [weeklyData]);

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

  const tabs = [
    { key: "weekly", label: "Student Attendance", title: "Student Attendance", description: "Weekly attendance and missed sessions", chart: attendanceChart, data: attendanceSampleData, refEl: attendanceRef, filename: "students_attendance", chartType: "bar" },
    { key: "hourly", label: "Popular Courses", title: "Popular Courses", description: "Most requested tutoring courses", chart: coursesChart, data: popularCourses, refEl: coursesRef, filename: "popular_courses", chartType: "bar" },
    { key: "completion", label: "Students by Major", title: "Students by Major", description: "Distribution of active students by academic major", chart: <div className="flex min-h-[400px] w-full items-center justify-center">{majorsChart}</div>, data: studentsByMajor, refEl: majorsRef, filename: "students_by_major", chartType: "pie" },
    { key: "feedback", label: "Retention Rate", title: "Student Retention", description: "Percentage of returning vs. one-time students", chart: retentionChart, data: retentionData, refEl: retentionRef, filename: "students_retention", chartType: "pie" },
  ];

  return (
    <div className="mx-auto my-6 w-full max-w-[1320px]">
      <ReportSummaryGrid>
        <ReportSummaryCard title="Active Students" value={activeStudents} change="+2" />
        <ReportSummaryCard title="Attendance Rate" value={`${attendanceRate}%`} change="+2%" />
        <ReportSummaryCard title="Avg. Sessions per Student" value={avgSessions} change="+2" />
        <ReportSummaryCard title="Retention Rate" value={`${retentionRate}%`} change="+5%" />
      </ReportSummaryGrid>
      <ReportTabs
        tabs={tabs}
        chartType={chartType}
        onTabChange={(tab) => setChartType(tab.chartType)}
      />
    </div>
  );
};

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
