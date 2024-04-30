import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet, useOutletContext } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min';

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

//import App from "./App";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
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
    element: <ClassName/>
  }, 
  {
    path: "/classes/add",
    element: <AddClass/>
  }, 
  {
    path: "/profile/:tutor_id",
    element: <TutorProfile/>
  }, 
  {
    path: "/majors",
    element: <Major/>
  },
  {
    path: "/majors/add",
    element: <AddMajor/>
  }, {
    path: "/terms/add",
    element: <AddSemester/>
  },
  {
    path: "/sessions/:tutor_id/:course_id",
    element: <Session/>
  },
  {
    path: "/sessions/add/:tutor_id/:course_id",
    element: <AddSession/>
  }

], {basename: "/"});

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router}>
  <React.StrictMode>
    <Home />
  </React.StrictMode>
</RouterProvider>
);
