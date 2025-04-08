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

const TutorsReport = () => {
    const [chartType, setChartType] = useState("bar")

    const performanceData = [
        { name: "Alex J.", sessions: 45, rating: 4.8, students: 18 },
        { name: "Sarah W.", sessions: 38, rating: 4.7, students: 15 },
        { name: "Michael B.", sessions: 30, rating: 4.5, students: 12 },
        { name: "Emily D.", sessions: 42, rating: 4.9, students: 20 },
        { name: "David W.", sessions: 35, rating: 4.6, students: 14 },
        { name: "Jennifer L.", sessions: 28, rating: 4.4, students: 10 },
        { name: "Robert T.", sessions: 32, rating: 4.7, students: 15 },
        { name: "Lisa A.", sessions: 36, rating: 4.8, students: 16 },
      ]
    
      // Sample data for hours by tutor
      const hoursData = [
        { name: "Alex J.", hours: 45 },
        { name: "Sarah W.", hours: 38 },
        { name: "Michael B.", hours: 30 },
        { name: "Emily D.", hours: 42 },
        { name: "David W.", hours: 35 },
        { name: "Jennifer L.", hours: 28 },
        { name: "Robert T.", hours: 32 },
        { name: "Lisa A.", hours: 36 },
      ]
    
      // Sample data for subjects covered
      const subjectsData = [
        { name: "Mathematics", value: 35, color: "#60a5fa" },
        { name: "Computer Science", value: 25, color: "#34d399" },
        { name: "Physics", value: 15, color: "#a78bfa" },
        { name: "Chemistry", value: 12, color: "#f87171" },
        { name: "Biology", value: 8, color: "#fbbf24" },
        { name: "Other", value: 5, color: "#94a3b8" },
      ]
    
      // Sample data for availability
      const availabilityData = [
        { name: "Morning (8AM-12PM)", value: 30, color: "#60a5fa" },
        { name: "Afternoon (12PM-4PM)", value: 45, color: "#34d399" },
        { name: "Evening (4PM-8PM)", value: 25, color: "#a78bfa" },
      ]
    
  
    return (
      <div className="container my-4">
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mb-4">
          <div className="col">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Active Tutors</Card.Title>
                <Card.Text className="display-4">24</Card.Text>
                <div className="small text-muted">
                  <span className="text-success">+2</span> from last month
                </div>
              </Card.Body>
            </Card>
          </div>
          <div className="col">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Avg. Sessions per Tutor</Card.Title>
                <Card.Text className="display-4">22.2</Card.Text>
                <div className="small text-muted">
                  <span className="text-success">+3.5</span> from last month
                </div>
              </Card.Body>
            </Card>
          </div>
          <div className="col">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Avg. Rating</Card.Title>
                <Card.Text className="display-4">4.7/5</Card.Text>
                <div className="small text-muted">
                  <span className="text-success">+-0.1</span> from last month
                </div>
              </Card.Body>
            </Card>
          </div>
          <div className="col">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Total Hours</Card.Title>
                <Card.Text className="display-4">286</Card.Text>
                <div className="small text-muted">
                  <span className="text-success">+12%</span> from last month
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
  
        <Tabs defaultActiveKey="weekly" id="report-tabs" className="mb-3">
          <Tab eventKey="weekly" title="Tutor Performance" onClick={() => setChartType("bar")}>
            <Card>
              <Card.Body>
                <Card.Title>Tutor Performance</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">Sessions conducted and average ratings by tutor</Card.Subtitle>
                <div className="h-100" style={{ minHeight: "400px", width: "100%" }}>
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
                </div>
              </Card.Body>
            </Card>
          </Tab>
  
          <Tab eventKey="hourly" title="Hours by Tutor" onClick={() => setChartType("bar")}>
            <Card>
              <Card.Body>
                <Card.Title>Hours by Tutors</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">Total tutoring hours provided by each tutor</Card.Subtitle>
                <div className="h-100" style={{ minHeight: "400px", width: "100%" }}>
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
                </div>
              </Card.Body>
            </Card>
          </Tab>
  
          <Tab eventKey="completion" title="Subjects Covered" onClick={() => setChartType("pie")}>
            <Card>
              <Card.Body>
                <Card.Title>Subjects Covered</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">Distribution of tutoring sessions by subject area</Card.Subtitle>
                <div className="h-100 d-flex align-items-center justify-content-center" style={{ minHeight: "400px", width: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%" minHeight="400px">
                    <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <Pie
                        data={subjectsData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {subjectsData.map((entry, index) => (
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
  
          <Tab eventKey="feedback" title="Availability Analysis" onClick={() => setChartType("pie")}>
            <Card>
              <Card.Body>
                <Card.Title>Tutor Availability</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">Distribution of tutor availability throughout the day</Card.Subtitle>
                <div className="h-100 d-flex align-items-center justify-content-center" style={{ minHeight: "400px", width: "100%" }}>
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
                      <Tooltip formatter={(value) => [`${value} hours`, "Available"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </div>
    )
}


export default TutorsReport;