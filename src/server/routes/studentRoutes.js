import express from "express";
import {getStudents} from "../controllers/studentsController.js";

const StudentRouter = express.Router();

StudentRouter.route("/")
.get(getStudents);

export default StudentRouter;