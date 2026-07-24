import express from "express";
import { getMajors, addMajor, updateMajor, deleteMajor } from "../controllers/majorController.js";

const MajorRouter = express.Router();

MajorRouter.route("/")
.get(getMajors)
.post(addMajor);

MajorRouter.route("/:major_id")
.put(updateMajor)
.delete(deleteMajor);

export default MajorRouter;
