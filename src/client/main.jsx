import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min';

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


//Implementation
import Activity from "./views/Activity";
import Activity_Students from "./views/Activity_Students";
//Components
import Auth from "./components/Auth";
import { LayoutProvider } from './context/Layout';
import Activity_Tutors from "./views/Activity_Tutors.jsx";
import Activity_Alerts from "./views/Activity_Alerts.jsx";

//import App from "./App";

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
        path: "/users",
        element: <Users />
      },
      {
        path: "/tutors",
        element: <Tutors />
      },
      {
        path: "/tutors/add",
        element: <AddTutor />
      },
      {
        path: "/classes",
        element: <ClassName />
      },
      {
        path: "/classes/add",
        element: <AddClass />
      },
      {
        path: "/profile/:tutor_id",
        element: <TutorProfile />
      },
      {
        path: "/settings/:user_id",
        element: <Settings />,
      },
      {
        path: "/majors",
        element: <Major />
      },
      {
        path: "/majors/add",
        element: <AddMajor />
      },
      {
        path: "/terms/add",
        element: <AddSemester />
      },
      {
        path: "/activity",
        element: <Activity />
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
        path: "/sessions/:tutor_id/:course_id",
        element: <Session />
      },
      {
        path: "/sessions/add/:tutor_id/:course_id",
        element: <AddSession />
      }, 
      {
        path: "/scheduled-sessions/:tutor_id",
        element: <ScheduledSessions />
      },
      {
        path: "/session/edit/:session_id/:tutor_id?", //Tutor id added to manage security later on
        element: <EditSession />
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
        path: "/tutors/reports",
        element: <TutorsReport/>
      }
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
  }, {
    path: "/test",
    element: <Test/>
  }
], { basename: "/" });

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <LayoutProvider>
      <RouterProvider router={router}> 
        <Login />
      </RouterProvider>
    </LayoutProvider>
  </React.StrictMode>
);
