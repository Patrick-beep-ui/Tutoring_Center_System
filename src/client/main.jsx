import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min';

// wrappers
import RequireRole from "./wrappers/RequireRole.jsx";
import CheckUser from "./wrappers/CheckUser.jsx";
import RequireRoleAndCheck from "./wrappers/RequireRoleAndCheck.jsx";

//Views
import MainDashboard from "./views/MainDashboard";
import Home from "./views/Home";
import Tutors from "./views/Tutors";
import AddTutor from "./views/AddTutor";
import ClassName from "./views/Course";
import AddClass from "./views/AddClass";
import TutorProfile from "./views/TutorProfile";
import Major from "./views/Major";
import AddMajor from "./views/AddMajor";
import AddSemester from "./views/AddSemester";
import Session from "./views/Sessions";
import AddSession from "./views/AddSession";
import Report from "./views/Report";
import ScheduledSessions from "./views/ScheduledSessions";
import EditSession from "./views/EditSession";
import SessionDetails from "./views/SessionDetails";
import Settings  from "./views/Settings";
import Feedback from "./views/Feedback.jsx";
import ThanksFeedback from "../server/models/ThanksFeedback.jsx";

// Admin Views
import Users from "./views-admin/User";
import TutorsReport from "./views-admin/ReportsView.jsx";

import Login from "./views/Login";
import Signup from "./views/Signup";

import Graph from "./components/Chart";
import SideBar from "./components/Sidebar";
import Header from "./components/Header";
import MyCalendar from "./components/Calendar";
import Test from "./views/Test";
import AdminHome from "./views-admin/AdminHome.jsx";


//Implementation
import Activity from "./views/Activity";
import Activity_Students from "./views/Activity_Students";
import Activity_Tutors from "./views/Activity_Tutors.jsx";
import Activity_Alerts from "./views/Activity_Alerts.jsx";
import Activity_Sessions from "./views/Activity_Sessions.jsx";

//Contexts
import Auth from "./components/Auth";
import { LayoutProvider } from './context/Layout';
import { SemesterProvider } from './context/currentSemester'; 

//import App from "./App";

import EmailForm from "./components/Email.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Auth />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/home",
        element: <RequireRole allowedRoles={["admin", "dev"]} />,
        children: [
          {index: true, element: <AdminHome />}, 
        ]
      },
      {
        path: "/users",
        element: <Users />
      },
      {
        path: "/tutors",
        element: <Tutors />
      },
      {
        path: "/tutors/add",
        element: <RequireRole allowedRoles={["admin", "dev"]} />,
        children: [
          {index: true, element: <AddTutor />}
        ]
      },
      {
        path: "/classes",
        element: <RequireRole allowedRoles={["admin", "dev", "tutor"]} />,
        children: [
          {index: true, element: <ClassName />}
        ]
      },
      {
        path: "/classes/add",
        element: <RequireRole allowedRoles={["admin", "dev"]} />,
        children: [
          {index: true, element: <AddClass />}
        ]
      },
      {
        path: "/profile/:role?/:tutor_id",
        element: <TutorProfile />
      },
      {
        path: "/settings/:user_id",
        element: <CheckUser />,
        children: [
          { index: true, element: <Settings /> }
        ]
      },      
      {
        path: "/majors",
        element: <Major />
      },
      {
        path: "/majors/add",
        element: <RequireRole allowedRoles={["admin", "dev"]} />,
        children: [
          {index: true, element: <AddMajor />}
        ]
      },
      {
        path: "/terms/add",
        element: <RequireRole allowedRoles={["admin", "dev"]} />,
        children: [
          {index: true, element: <AddSemester />}
        ]
      },
      {
        path: "/activity",
        element: <RequireRole allowedRoles={["admin", "dev"]} />,
        children: [
          {index: true, element: <Activity />}
        ]
      },
      {
        path: "/activity-sessions",
        element: <Activity_Sessions />
      },
      {
        path: "/activity-students",
        element: <Activity_Students />
      },
      {
        path: "/activity-tutors",
        element: <Activity_Tutors />
      },
      {
        path: "/activity-alerts",
        element: <Activity_Alerts />
      },
      {
        path: "session/details/:session_id?",
        element: <SessionDetails />
      },
      {
        path: "/sessions/:role/:tutor_id/:course_id",
        element: <RequireRole allowedRoles={["admin", "dev", "tutor"]} />,
        children: [
          {index: true, element: <Session />}
        ]
      },
      {
        path: "/sessions/add/:tutor_id/:course_id",
        element: (
          <RequireRoleAndCheck
            allowedRoles={["admin", "dev", "tutor"]}
            rolesToCheck={["tutor"]}
            paramName="tutor_id"
          />
        ),
        children: [
          {index: true, element: <AddSession />}
        ]
      }, 
      {
        path: "/scheduled-sessions/:role/:tutor_id",
        element: (
          <RequireRoleAndCheck
            allowedRoles={["admin", "dev", "tutor"]}
            rolesToCheck={["tutor"]}
            paramName="tutor_id"
          />
        ),
        children: [
          { index: true, element: <ScheduledSessions /> }
        ]
      },
      {
        path: "/session/edit/:session_id/:tutor_id?", //Tutor id added to manage security later on
        element: (
          <RequireRoleAndCheck
            allowedRoles={["admin", "dev", "tutor"]}
            rolesToCheck={["tutor"]}
            paramName="tutor_id"
          />
        ), 
        children: [
          {index: true, element: <EditSession />}
        ]
      },
      {
        path: "/header",
        element: <Header />
      }, 
      {
        path: "/report",
        element: <Report />
      }, {
        path: "/calendar/:tutor_id",
        element: <MyCalendar />
      },
      {
        path: "/admin/reports",
        element: <RequireRole allowedRoles={["admin", "dev"]} />,
        children: [
          {index: true, element: <TutorsReport />}
        ]
      },
      {
        path: '/auth/test/:id?',
        element: <RequireRole allowedRoles={["admin", "dev"]} />,
        children: [
          {index: true, element: <Test />}
        ]
      },
    ]
  },
  {
    path: "/dashboard/",
    element: <MainDashboard />
  },
  {
    path: "/login",
    element: <Login />
  }, {
    path: "/signup",
    element: <Signup />
  } , {
    path: "/chart",
    element: <Graph />
  } , {
    path: "/sidebar", 
    element: <SideBar />
  },
  {
    path: "/feedback/:sessionId/:userId",
    element: <Feedback />
  },
  {
    path: "/feedback/submission",
    element: <ThanksFeedback />
  },
  {
    path: "/email-testing",
    element: <EmailForm />
  }


], { basename: "/" });

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <LayoutProvider>
      <SemesterProvider>
        <RouterProvider router={router}> 
          <Login />
        </RouterProvider>
      </SemesterProvider>
    </LayoutProvider>
  </React.StrictMode>
);
