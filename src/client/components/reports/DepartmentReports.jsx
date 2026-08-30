import { useState, useEffect, useCallback, useMemo, memo, useRef, useContext } from "react"
import api from "../../axiosService"
import { SemesterContext } from "../../context/currentSemester"
import { ReportSummaryCard, ReportSummaryGrid, ReportTabs } from "./ReportUI"
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

const usageSampleData = [
  { name: "Mathematics", sessions: 120, hours: 180 },
  { name: "Computer Science", sessions: 95, hours: 142 },
  { name: "Physics", sessions: 75, hours: 112 },
  { name: "Chemistry", sessions: 65, hours: 97 },
  { name: "Biology", sessions: 55, hours: 82 },
  { name: "Engineering", sessions: 45, hours: 67 },
  { name: "Statistics", sessions: 35, hours: 52 },
  { name: "Economics", sessions: 25, hours: 37 },
]

// Sample data for tutors by department
const tutorsSampleData = [
  { name: "Mathematics", value: 8, color: "#60a5fa" },
  { name: "Computer Science", value: 6, color: "#34d399" },
  { name: "Physics", value: 4, color: "#a78bfa" },
  { name: "Chemistry", value: 3, color: "#f87171" },
  { name: "Biology", value: 3, color: "#fbbf24" },
  { name: "Other", value: 4, color: "#94a3b8" },
]

// Sample data for sessions by department
const sessionsSampleData = [
  { name: "Mathematics", value: 120, color: "#60a5fa" },
  { name: "Computer Science", value: 95, color: "#34d399" },
  { name: "Physics", value: 75, color: "#a78bfa" },
  { name: "Chemistry", value: 65, color: "#f87171" },
  { name: "Biology", value: 55, color: "#fbbf24" },
  { name: "Other", value: 105, color: "#94a3b8" },
]

// Sample data for satisfaction by department
const satisfactionSampleData = [
  { name: "Mathematics", rating: 4.8 },
  { name: "Computer Science", rating: 4.7 },
  { name: "Physics", rating: 4.5 },
  { name: "Chemistry", rating: 4.6 },
  { name: "Biology", rating: 4.9 },
  { name: "Engineering", rating: 4.4 },
  { name: "Statistics", rating: 4.3 },
  { name: "Economics", rating: 4.5 },
]

const DepartmentReport = () => {
    const [chartType, setChartType] = useState("bar");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [totalMajors, setTotalMajors] = useState(0);
    const [avgSessionsByMajor, setAvgSessionsByMajor] = useState(0);
    const [totalHours, setTotalHours] = useState(0);
    const [avgSatisfaction, setAvgSatisfaction] = useState(0);

    const [sessionsUsage, setSessionsUsage] = useState([]);
    const [tutorsByMajor, setTutorsByMajor] = useState([]);
    const [sessionsByMajor, setSessionsByMajor] = useState([]);
    const [satisfactionByMajor, setSatisfactionByMajor] = useState([]);
  
    const usageRef = useRef(null);
    const tutorsRef = useRef(null);
    const sessionsRef = useRef(null);
    const satisfactionRef = useRef(null);

    const { selectedSemesterId } = useContext(SemesterContext);

    useEffect(() => {
      const getReportData = async () => {
        try {
          const response = await api.get(`/report/majors${selectedSemesterId ? `?semester_id=${selectedSemesterId}` : ''}`);
          const data = response.data;

          const formatRates = (value) => {
            return value % 1 === 0 ? Math.trunc(value) : value;
          }

          setTotalMajors(data.majorsCount);
          setAvgSessionsByMajor(formatRates(data.avgSessionsPerMajor));
          setTotalHours(data.totalHours);
          setAvgSatisfaction(data.avgRatingPerMajor);

          setSessionsUsage((data.sessionsUsage || []).map(s => ({
            name: s.major_name,
            sessions: Math.trunc(s.sessions_count),
            hours: Math.trunc(s.session_hours)
          })));

          setTutorsByMajor((data.tutorsByMajor || []).map((t, index) => ({
            name: t.major_name,
            value: t.tutors_count,
            color: ["#60a5fa", "#34d399", "#a78bfa", "#f87171", "#fbbf24", "#94a3b8"][index]
          })));

          setSessionsByMajor((data.sessionsByMajor || []).map((s, index) => ({
            name: s.major_name,
            value: s.sessions_count,
            color: ["#60a5fa", "#34d399", "#a78bfa", "#f87171", "#fbbf24", "#94a3b8"][index]
          })));

          setSatisfactionByMajor((data.satisfactionByMajor || []).map((s, index) => ({
            name: s.major_name,
            rating: formatRates(s.major_rating),
            color: ["#60a5fa", "#34d399", "#a78bfa", "#f87171", "#fbbf24", "#94a3b8"][index]
          })));

        }
        catch(e) {
          console.error("Error fetching report data:", e);
          setError("Failed to load report data");
        }
        finally {
          setLoading(false);
        }
      }

      getReportData()
    }, [selectedSemesterId])

    const usageChart = useMemo(() => (
      <ResponsiveContainer width="100%" height="100%" minHeight="400px">
        <BarChart data={sessionsUsage} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="sessions" name="Sessions" fill="#60a5fa" />
          <Bar dataKey="hours" name="Hours" fill="#34d399" />
        </BarChart>
      </ResponsiveContainer>
    ),[sessionsUsage]);

    const tutorsChart = useMemo(() => (
      <ResponsiveContainer width="100%" height="100%" minHeight="400px">
        <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <Pie
            data={tutorsByMajor}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
          >
            {tutorsByMajor.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} tutors`, "Count"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    ), [tutorsByMajor]);

    const sessionsChart = useMemo(() => (
      <ResponsiveContainer width="100%" height="100%" minHeight="400px">
        <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <Pie
            data={sessionsByMajor}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
          >
            {sessionsByMajor.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} sessions`, "Count"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    ), [sessionsByMajor]);

    const satisfactionChart = useMemo(() => (
      <ResponsiveContainer width="100%" height="100%" minHeight="400px">
      <BarChart data={satisfactionByMajor} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="rating" name="Satisfaction Rating" fill="#a78bfa" />
        </BarChart>
      </ResponsiveContainer>
    ), [satisfactionByMajor]);


  const tabs = [
    { key: "weekly", label: "Department Usage", title: "Department Usage", description: "Sessions and hours by department", chart: usageChart, data: sessionsUsage, refEl: usageRef, filename: "majors_usage", chartType: "bar" },
    { key: "hourly", label: "Tutors by Department", title: "Tutors by Department", description: "Distribution of tutors across departments", chart: tutorsChart, data: tutorsByMajor, refEl: tutorsRef, filename: "majors_tutors", chartType: "bar" },
    { key: "completion", label: "Sessions by Department", title: "Sessions by Department", description: "Distribution of tutoring sessions across departments", chart: sessionsChart, data: sessionsByMajor, refEl: sessionsRef, filename: "majors_sessions", chartType: "pie" },
    { key: "feedback", label: "Satisfaction by Department", title: "Satisfaction by Department", description: "Average student satisfaction ratings by department", chart: satisfactionChart, data: satisfactionByMajor, refEl: satisfactionRef, filename: "majors_satisfaction", chartType: "pie" },
  ];

  return (
    <div className="mx-auto my-6 w-full max-w-[1320px]">
      <ReportSummaryGrid>
        <ReportSummaryCard title="Total Departments" value={totalMajors} change="+1" />
        <ReportSummaryCard title="Avg. Sessions per Major" value={avgSessionsByMajor} change="+12%" />
        <ReportSummaryCard title="Total Hours" value={totalHours} change="+15%" />
        <ReportSummaryCard title="Avg. Satisfaction" value={`${avgSatisfaction}/5`} change="+0.2%" />
      </ReportSummaryGrid>
      <ReportTabs
        tabs={tabs}
        chartType={chartType}
        onTabChange={(tab) => setChartType(tab.chartType)}
      />
    </div>
  )
}

export default DepartmentReport;
