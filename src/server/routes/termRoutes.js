import express from "express";
import { getSemesters, addSemester } from "../controllers/termsConroller.js";

const TermsRouter = express.Router();

TermsRouter.route("/")
.get(getSemesters)
.post(addSemester);

export default TermsRouter;