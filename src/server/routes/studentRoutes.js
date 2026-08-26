import express from "express";
import passport from "passport";
import {getStudents} from "../controllers/studentsController.js";
import semesterScope from "../middlewares/semesterScope.js";

const StudentRouter = express.Router();

StudentRouter.route("/")
.get(passport.authenticate("jwt", { session: false }), semesterScope, getStudents);

export default StudentRouter;
