import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Card } from "react-bootstrap"
import { Tabs, Tab } from "react-bootstrap"
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

import { exportToCSV } from "../../services/exportChart";
import { exportChartAsImage } from "../../services/exportChartAsImage";

export default function SessionsReport() {
  const [chartType, setChartType] = useState("bar")
  //const [weeklyData, setWeeklyData] = useState([])
  const [hourlyData, setHourlyData] = useState([])
  const [completionData, setCompletionData] = useState([])
  const [feedbackData, setFeedbackData] = useState([])

  // Direct Values
  const [sessionAmount, setSessionAmount] = useState(0)
  const [averageDuration, setAverageDuration] = useState(0)
  const [completionRate, setCompletionRate] = useState(0)
  const [averageRating, setAverageRating] = useState(4.5)

  const weeklyRef = useRef(null);
  const hourlyRef = useRef(null);
  const completionRef = useRef(null);
  const feedbackRef = useRef(null);


  useEffect(() => {
    const getReportData = async () => {
      try {
        const response = await axios.get("/api/report/sessions")
        const data = response.data
        //setWeeklyData(data.weeklyData || [])
        setHourlyData(data.hourlyData || [])
        setFeedbackData(data.feedbackCounts || [])

        // Direct Values
        setSessionAmount(data.sessionsAmount || 0)
        setAverageDuration(data.averageDuration || 0)
        setCompletionRate(data.completionRate || 0)
        setAverageRating(data.averageRating || 4.5)

        const statusColorMap = {
          completed: '#68AF58',
          canceled: '#C6453A',
          pending: '#D3A257',
          scheduled: '#5B99DE',
        };

        const feedbackColorMap = {
          '5': "#22c55e",
          4: "#84cc16",
          3: "#facc15",
          2: "#f97316",
          1: "#ef4444",
        }

        //setCompletionData(data.completionData || [])
        const pieChartData = (data.completionData || []).map(item => ({
          ...item,
          color: statusColorMap[item.name] || '#d1d5db',
        }));
        
        setCompletionData(pieChartData);


        const feedbackPieData = (data.feedbackCounts || []).map(item => ({
          name: `${item.rating} Stars`,  
          value: item.count,             
          color: feedbackColorMap[item.rating] || '#d1d5db',
        }));
        setFeedbackData(feedbackPieData);

        setFeedbackData(feedbackPieData);
        console.log("Feedback color data", feedbackPieData)
      }
      catch(e) {
        console.error("Error fetching report data:", e)
      }
    }

    getReportData()
  }, [])

  // Sample data for sessions by weeks
  const weeklyData = [
    { name: "Week 1", sessions: 45, completed: 42, cancelled: 3 },
    { name: "Week 2", sessions: 52, completed: 48, cancelled: 4 },
    { name: "Week 3", sessions: 48, completed: 45, cancelled: 3 },
    { name: "Week 4", sessions: 70, completed: 65, cancelled: 5 },
    { name: "Week 5", sessions: 65, completed: 60, cancelled: 5 },
    { name: "Week 6", sessions: 85, completed: 80, cancelled: 5 },
    { name: "Week 7", sessions: 78, completed: 72, cancelled: 6 },
    { name: "Week 8", sessions: 90, completed: 85, cancelled: 5 },
  ]

  /*

  // Sample data for sessions by hour
  const hourlyData = [
    { name: "8 AM", sessions: 5 },
    { name: "9 AM", sessions: 12 },
    { name: "10 AM", sessions: 18 },
    { name: "11 AM", sessions: 23 },
    { name: "12 PM", sessions: 17 },
    { name: "1 PM", sessions: 15 },
    { name: "2 PM", sessions: 27 },
    { name: "3 PM", sessions: 30 },
    { name: "4 PM", sessions: 25 },
    { name: "5 PM", sessions: 20 },
    { name: "6 PM", sessions: 15 },
    { name: "7 PM", sessions: 8 },
  ]

  // Sample data for completion rate
  const completionData = [
    { name: "Completed", value: 85, color: "#4ade80" },
    { name: "Cancelled", value: 10, color: "#f87171" },
    { name: "No-Show", value: 5, color: "#fbbf24" },
  ]
    */

  // Sample data for feedback scores
  const raitingData = [
    { name: "5 Stars", value: 45, color: "#22c55e" },
    { name: "4 Stars", value: 30, color: "#84cc16" },
    { name: "3 Stars", value: 15, color: "#facc15" },
    { name: "2 Stars", value: 7, color: "#f97316" },
    { name: "1 Star", value: 3, color: "#ef4444" },
  ]

  return (
    <div className="container my-4">
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mb-4">
        <div className="col">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Total Sessions</Card.Title>
              <Card.Text className="display-4">{sessionAmount}</Card.Text>
              <div className="small text-muted">
                <span className="text-success">+12%</span> from last period
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Completion Rate</Card.Title>
              <Card.Text className="display-4">{completionRate}%</Card.Text>
              <div className="small text-muted">
                <span className="text-success">+3%</span> from last period
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Average Duration</Card.Title>
              <Card.Text className="display-4">{averageDuration} hr</Card.Text>
              <div className="small text-muted">
                <span className="text-danger">-2 min</span> from last period
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Average Rating</Card.Title>
              <Card.Text className="display-4">{averageRating}/5</Card.Text>
              <div className="small text-muted">
                <span className="text-success">+0.2</span> from last period
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Tabs defaultActiveKey="weekly" id="report-tabs" className="mb-3">
        <Tab eventKey="weekly" title="Sessions by Week" onClick={() => setChartType("bar")}>
          <Card>
            <Card.Body>
              <Card.Title>Sessions by Week</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">Number of tutoring sessions scheduled each week</Card.Subtitle>
              <div ref={weeklyRef} className="h-100" style={{ minHeight: "400px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%" minHeight="400px">
                  <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" name="Completed" fill="#4ade80" />
                    <Bar dataKey="cancelled" name="Cancelled" fill="#f87171" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <button
                className="btn btn-outline-primary mb-3"
                style={{ marginTop: "20px" }}
                onClick={() => exportToCSV(weeklyData, "sessions_by_week", chartType)}
              >
                Export Weekly Data
              </button>
              <button
                className="btn btn-outline-primary mb-3"
                style={{ marginLeft: "15px", marginTop: "20px" }}
                onClick={() => exportChartAsImage(weeklyRef.current, "png", "sessions_by_week")}
              >
                Export Chart as Image
              </button>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="hourly" title="Sessions by Hour" onClick={() => setChartType("bar")}>
          <Card>
            <Card.Body>
              <Card.Title>Sessions by Hour</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">Distribution of tutoring sessions throughout the day</Card.Subtitle>
              <div ref={hourlyRef} className="h-100" style={{ minHeight: "400px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%" minHeight="400px">
                  <BarChart data={hourlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="session_duration" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sessions" name="Sessions" fill="#60a5fa" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <button
                className="btn btn-outline-primary mb-3"
                style={{ marginTop: "20px" }}
                onClick={() => exportToCSV(hourlyData, "sessions_by_hour", chartType)}
              >
                Export Hourly Data
              </button>
              <button
                className="btn btn-outline-primary mb-3"
                style={{ marginLeft: "15px", marginTop: "20px" }}
                onClick={() => exportChartAsImage(hourlyRef.current, "png", "sessions_by_hour")}
              >
                Export Chart as Image
              </button>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="completion" title="Completion Rate" onClick={() => setChartType("pie")}>
          <Card>
            <Card.Body>
              <Card.Title>Session Completion Rate</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">Breakdown of completed, cancelled, and no-show sessions</Card.Subtitle>
              <div ref={completionRef} className="h-100 d-flex align-items-center justify-content-center" style={{ minHeight: "400px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%" minHeight="400px">
                  <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
              </div>
              <button
                className="btn btn-outline-primary mb-3"
                style={{ marginTop: "20px" }}
                onClick={() => exportToCSV(completionData, "completion_rate", chartType)}
              >
                Export Completion Rate Data
              </button>
              <button
                className="btn btn-outline-primary mb-3"
                style={{ marginLeft: "15px", marginTop: "20px" }}
                onClick={() => exportChartAsImage(completionRef.current, "png", "completion_rate")}
              >
                Export Chart as Image
              </button>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="feedback" title="Feedback Scores" onClick={() => setChartType("pie")}>
          <Card>
            <Card.Body>
              <Card.Title>Feedback Scores Distribution</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">Distribution of student ratings for tutoring sessions</Card.Subtitle>
              <div ref={feedbackRef} className="h-100 d-flex align-items-center justify-content-center" style={{ minHeight: "400px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%" minHeight="400px">
                  <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                    <Tooltip formatter={(count) => [`${count} sessions`, "Count"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <button
                className="btn btn-outline-primary mb-3"
                style={{ marginTop: "20px" }}
                onClick={() => exportToCSV(feedbackData, "feedback_scores", chartType)}
              >
                Export Feedback Data
              </button>
              <button
                className="btn btn-outline-primary mb-3"
                style={{ marginLeft: "15px", marginTop: "20px" }}
                onClick={() => exportChartAsImage(feedbackRef.current, "png", "feedback_scores")}
              >
                Export Chart as Image
              </button>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  )
}
