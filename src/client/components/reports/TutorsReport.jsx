import { useState, useEffect, useRef, useMemo, memo, useContext } from "react"
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
} from "recharts"

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

  const { selectedSemesterId } = useContext(SemesterContext);

  useEffect(() => {
    const getReportData = async () => {
      try {
        setLoading(true);
        const {data} = await api.get(`/report/tutors${selectedSemesterId ? `?semester_id=${selectedSemesterId}` : ''}`);

        const total_hours = data.totalHours || 0;

        setActiveTutors(data.tutorsAmount || 0);
        setAvgSessionsPerTutor(data.avgSessionsPerTutor || 0);
        setAvgRating(data.avgRatingPerTutor || 0);
        setTotalHours(data.totalHours % 1 === 0 ? Math.trunc(total_hours) : total_hours.toFixed(1) || 0);

        setPerformanceData(
          (data.tutorsPerformance || []).map(t => {
            const rawRating = t.avg_rating === null ? 0 : parseFloat(t.avg_rating);
            const formattedRating =
              rawRating % 1 === 0 ? Math.trunc(rawRating) : rawRating.toFixed(1);
        
            return {
              name: t.tutor_name,
              sessions: t.sessions_amount,
              rating: formattedRating,
              students: t.students_count,
            };
          })
        );

        setHoursData(
          (data.tutorsHours || []).map(t => {
            const formattedHours = t.total_hours % 1 === 0 ? Math.trunc(t.total_hours) : t.total_hours.toFixed(1); 

            return {
              name: t.tutor_name,
              hours: formattedHours,
            };
          })
        )

        setMajorsData(
          (data.sessionsPerMajor || [])
            .filter(t => t.sessions_amount > 0) // only keep majors with sessions
            .map(t => ({
              name: t.major_name,
              value: t.sessions_amount, 
              color: {
                "Software Engineering": "#60a5fa",
                "Business Administration": "#34d399",
                "General Studies": "#a78bfa",
                "Psychology": "#f87171",
                "Management Information Systems": "#fbbf24",
                "Political Science": "#94a3b8",
              }[t.major_name] || "#a78bfa"
            }))
        );

        setAvailabilityData(
          (data.availabilityData || []).map((t, index) => {
            // Split the time block into start and end
            const [start, end] = t.time_block.split('-');
        
            // Convert to AM/PM
            const formatTime = (timeStr) => {
              const [hour, minute] = timeStr.split(':').map(Number);
              const ampm = hour >= 12 ? 'PM' : 'AM';
              const hour12 = hour % 12 === 0 ? 12 : hour % 12;
              return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
            };
        
            return {
              name: `${formatTime(start)} - ${formatTime(end)}`,
              value: t.tutors_count,
              color: [
                "#60a5fa",
                "#34d399",
                "#a78bfa",
                "#f87171"
              ][index] || "#a78bfa"
            };
          })
        );
        

      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    }

    getReportData();
  }, [selectedSemesterId])

  const performanceChart = useMemo(
    () => (
      <ResponsiveContainer width="100%" height="100%" minHeight="400px">
        <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
    [performanceData]
  );

  const hoursDataChart = useMemo(
    () => (
      <ResponsiveContainer width="100%" height="100%" minHeight="400px">
        <BarChart data={hoursData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="hours" name="Hours" fill="#34d399" />
        </BarChart>
      </ResponsiveContainer>
    ),
    [hoursData]
  );

  const majorsDataChart = useMemo(
    () => (
      <ResponsiveContainer width="100%" height="100%" minHeight="400px">
        <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <Pie
            data={majorsData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
          >
            {majorsData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} sessions`, "Count"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    ),
    [majorsData]
  )

  const availabilityDataChart = useMemo(
    () => (
      <ResponsiveContainer width="100%" height="100%" minHeight="400px">
        <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <Pie
            data={availabilityData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
          >
            {availabilityData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} Tutors`, "Available"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    ),
    [availabilityData]
  )

  const tabs = [
    { key: "weekly", label: "Tutor Performance", title: "Tutor Performance", description: "Sessions conducted and average ratings by tutor", chart: performanceChart, data: performanceData, refEl: performanceRef, filename: "tutors_performance", chartType: "bar" },
    { key: "hourly", label: "Hours by Tutor", title: "Hours by Tutors", description: "Total tutoring hours provided by each tutor", chart: hoursDataChart, data: hoursData, refEl: hoursRef, filename: "tutors_hours", chartType: "bar" },
    { key: "completion", label: "Majors Covered", title: "Majors Covered", description: "Distribution of tutoring sessions by subject area", chart: <div className="flex min-h-[400px] w-full items-center justify-center">{majorsDataChart}</div>, data: majorsData, refEl: majorsRef, filename: "tutors_by_major", chartType: "pie" },
    { key: "feedback", label: "Availability Analysis", title: "Tutor Availability", description: "Distribution of tutor availability throughout the day", chart: <div className="flex min-h-[400px] w-full items-center justify-center">{availabilityDataChart}</div>, data: availabilityData, refEl: availabilityRef, filename: "tutors_availability", chartType: "pie" },
  ];

  return (
    <div className="mx-auto my-6 w-full max-w-[1320px]">
      <ReportSummaryGrid>
        <ReportSummaryCard title="Active Tutors" value={activeTutors} change="+2" />
        <ReportSummaryCard title="Avg. Sessions per Tutor" value={avgSessionsPerTutor} change="+3.5" />
        <ReportSummaryCard title="Avgerage Raiting" value={`${avgRating}/5`} change="+0.1" />
        <ReportSummaryCard title="Total Hours" value={totalHours} change="+12%" />
      </ReportSummaryGrid>
      <ReportTabs
        tabs={tabs}
        chartType={chartType}
        onTabChange={(tab) => setChartType(tab.chartType)}
      />
    </div>
  )
}

export default memo(TutorsReport);
