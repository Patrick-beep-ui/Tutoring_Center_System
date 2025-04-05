import { useState } from "react"
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

const DepartmentReport = () => {
    const [chartType, setChartType] = useState("bar")

    // Nueva data
    const attendanceData = [
      { name: "Week 1", attended: 40, missed: 5 },
      { name: "Week 2", attended: 45, missed: 7 },
      { name: "Week 3", attended: 42, missed: 6 },
      { name: "Week 4", attended: 50, missed: 5 },
      { name: "Week 5", attended: 55, missed: 10 },
      { name: "Week 6", attended: 60, missed: 8 },
      { name: "Week 7", attended: 58, missed: 7 },
      { name: "Week 8", attended: 65, missed: 5 },
    ]
  
    // Sample data for popular subjects
    const subjectsData = [
      { name: "Calculus I", students: 35 },
      { name: "Intro to Programming", students: 30 },
      { name: "Organic Chemistry", students: 25 },
      { name: "Physics Mechanics", students: 22 },
      { name: "Data Structures", students: 20 },
      { name: "Linear Algebra", students: 18 },
      { name: "General Biology", students: 15 },
      { name: "Statistics", students: 12 },
    ]
  
    // Sample data for students by major
    const majorsData = [
      { name: "Computer Science", value: 25, color: "#60a5fa" },
      { name: "Engineering", value: 20, color: "#34d399" },
      { name: "Biology", value: 15, color: "#a78bfa" },
      { name: "Mathematics", value: 12, color: "#f87171" },
      { name: "Chemistry", value: 10, color: "#fbbf24" },
      { name: "Physics", value: 8, color: "#94a3b8" },
      { name: "Other", value: 10, color: "#cbd5e1" },
    ]
  
    // Sample data for retention rate
    const retentionData = [
      { name: "Returning", value: 65, color: "#4ade80" },
      { name: "One-time", value: 35, color: "#94a3b8" },
    ]

    const usageData = [
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
      const tutorsData = [
        { name: "Mathematics", value: 8, color: "#60a5fa" },
        { name: "Computer Science", value: 6, color: "#34d399" },
        { name: "Physics", value: 4, color: "#a78bfa" },
        { name: "Chemistry", value: 3, color: "#f87171" },
        { name: "Biology", value: 3, color: "#fbbf24" },
        { name: "Other", value: 4, color: "#94a3b8" },
      ]
    
      // Sample data for sessions by department
      const sessionsData = [
        { name: "Mathematics", value: 120, color: "#60a5fa" },
        { name: "Computer Science", value: 95, color: "#34d399" },
        { name: "Physics", value: 75, color: "#a78bfa" },
        { name: "Chemistry", value: 65, color: "#f87171" },
        { name: "Biology", value: 55, color: "#fbbf24" },
        { name: "Other", value: 105, color: "#94a3b8" },
      ]
    
      // Sample data for satisfaction by department
      const satisfactionData = [
        { name: "Mathematics", rating: 4.8 },
        { name: "Computer Science", rating: 4.7 },
        { name: "Physics", rating: 4.5 },
        { name: "Chemistry", rating: 4.6 },
        { name: "Biology", rating: 4.9 },
        { name: "Engineering", rating: 4.4 },
        { name: "Statistics", rating: 4.3 },
        { name: "Economics", rating: 4.5 },
      ]
  

  return (
    <div className="container my-4">
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mb-4">
        <div className="col">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Total Departments</Card.Title>
              <Card.Text className="display-4">8</Card.Text>
              <div className="small text-muted">
                <span className="text-success">+1</span> from last semester
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Total Sessions</Card.Title>
              <Card.Text className="display-4">515</Card.Text>
              <div className="small text-muted">
                <span className="text-success">+12%</span> from last month
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Total Hours</Card.Title>
              <Card.Text className="display-4">769</Card.Text>
              <div className="small text-muted">
                <span className="text-success">+15%</span> from last semester
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Avg. Satisfaction</Card.Title>
              <Card.Text className="display-4">4.6/5</Card.Text>
              <div className="small text-muted">
                <span className="text-success">+0.2%</span> from last semester
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Tabs defaultActiveKey="weekly" id="report-tabs" className="mb-3">
        <Tab eventKey="weekly" title="Department Usage" onClick={() => setChartType("bar")}>
          <Card>
            <Card.Body>
              <Card.Title>Department Usage</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">Sessions and hours by department</Card.Subtitle>
              <div className="h-100" style={{ minHeight: "400px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%" minHeight="400px">
                  <BarChart data={usageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sessions" name="Sessions" fill="#60a5fa" />
                    <Bar dataKey="hours" name="Hours" fill="#34d399" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="hourly" title="Tutors by Department" onClick={() => setChartType("bar")}>
          <Card>
            <Card.Body>
              <Card.Title>Tutors by Department</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">Distribution of tutors across departments</Card.Subtitle>
              <div className="h-100" style={{ minHeight: "400px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%" minHeight="400px">
                <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <Pie
                      data={tutorsData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {tutorsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} tutors`, "Count"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="completion" title="Sessions by Department" onClick={() => setChartType("pie")}>
          <Card>
            <Card.Body>
              <Card.Title>Sessions by Department</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">Distribution of tutoring sessions across departments</Card.Subtitle>
              <div className="h-100 d-flex align-items-center justify-content-center" style={{ minHeight: "400px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%" minHeight="400px">
                  <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <Pie
                      data={sessionsData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sessionsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} sessions`, "Count"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="feedback" title="Satisfaction by Department" onClick={() => setChartType("pie")}>
          <Card>
            <Card.Body>
              <Card.Title>Satisfaction by Department</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">Average student satisfaction ratings by department</Card.Subtitle>
              <div className="h-100 d-flex align-items-center justify-content-center" style={{ minHeight: "400px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%" minHeight="400px">
                <BarChart data={satisfactionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rating" name="Satisfaction Rating" fill="#a78bfa" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  )

}


export default DepartmentReport;