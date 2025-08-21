import { useState } from "react";
import { Card, Button } from "react-bootstrap";
import { Tabs, Tab } from "react-bootstrap";
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

const StudentsReport = () => {
  const [chartType, setChartType] = useState("bar");

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
  ];

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
  ];

  // Sample data for students by major
  const majorsData = [
    { name: "Computer Science", value: 25, color: "#60a5fa" },
    { name: "Engineering", value: 20, color: "#34d399" },
    { name: "Biology", value: 15, color: "#a78bfa" },
    { name: "Mathematics", value: 12, color: "#f87171" },
    { name: "Chemistry", value: 10, color: "#fbbf24" },
    { name: "Physics", value: 8, color: "#94a3b8" },
    { name: "Other", value: 10, color: "#cbd5e1" },
  ];

  // Sample data for retention rate
  const retentionData = [
    { name: "Returning", value: 65, color: "#4ade80" },
    { name: "One-time", value: 35, color: "#94a3b8" },
  ];

  return (
    <div className="container my-4">
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mb-4">
        <div className="col">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Total Students</Card.Title>
              <Card.Text className="display-4">128</Card.Text>
              <div className="small text-muted">
                <span className="text-success">+2</span> from last month
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Attendance Rate</Card.Title>
              <Card.Text className="display-4">88%</Card.Text>
              <div className="small text-muted">
                <span className="text-success">+2%</span> from last month
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Avg. Sessions per Student</Card.Title>
              <Card.Text className="display-4">4.2</Card.Text>
              <div className="small text-muted"></div>
            </Card.Body>
          </Card>
        </div>
        <div className="col">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Retention Rate</Card.Title>
              <Card.Text className="display-4">65%</Card.Text>
              <div className="small text-muted">
                <span className="text-success">+5%</span> from last month
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Tabs defaultActiveKey="weekly" id="report-tabs" className="mb-3">
        <Tab eventKey="weekly" title="Student Attendance" onClick={() => setChartType("bar")}>
          <Card>
            <Card.Body>
              <Card.Title>Student Attendance</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">Weekly attendance and missed sessions</Card.Subtitle>
              <div className="h-100" style={{ minHeight: "400px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%" minHeight="400px">
                  <BarChart data={attendanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="attended" name="Attended" fill="#4ade80" />
                    <Bar dataKey="missed" name="Missed" fill="#f87171" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Button onClick={() => exportToExcel(attendanceData, "Attendance Data", chartType)} variant="primary" className="mt-3">
                Export to CSV
              </Button>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="hourly" title="Popular Subjects" onClick={() => setChartType("bar")}>
          <Card>
            <Card.Body>
              <Card.Title>Popular Subjects</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">Most requested tutoring subjects</Card.Subtitle>
              <div className="h-100" style={{ minHeight: "400px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%" minHeight="400px">
                  <BarChart data={subjectsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="students" name="Students" fill="#60a5fa" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Button onClick={() => exportToExcel(subjectsData, "Popular Subjects", chartType)} variant="primary" className="mt-3">
                Export to CSV
              </Button>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="completion" title="Students by Major" onClick={() => setChartType("pie")}>
          <Card>
            <Card.Body>
              <Card.Title>Students by Major</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">Distribution of students by academic major</Card.Subtitle>
              <div className="h-100 d-flex align-items-center justify-content-center" style={{ minHeight: "400px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%" minHeight="400px">
                  <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <Pie data={majorsData} cx="50%" cy="50%" labelLine={true} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={150} fill="#8884d8" dataKey="value">
                      {majorsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} students`, "Count"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <Button onClick={() => exportToExcel(majorsData, "Students by Major", chartType)} variant="primary" className="mt-3">
                Export to CSV
              </Button>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="feedback" title="Retention Rate" onClick={() => setChartType("pie")}>
          <Card>
            <Card.Body>
              <Card.Title>Student Retention</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">Percentage of returning vs. one-time students</Card.Subtitle>
              <div className="h-100 d-flex align-items-center justify-content-center" style={{ minHeight: "400px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%" minHeight="400px">
                  <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <Pie data={retentionData} cx="50%" cy="50%" labelLine={true} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={150} fill="#8884d8" dataKey="value">
                      {retentionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} hours`, "Available"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <Button onClick={() => exportToExcel(retentionData, "Student Retention", chartType)} variant="primary" className="mt-3">
                Export to CSV
              </Button>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default StudentsReport;
