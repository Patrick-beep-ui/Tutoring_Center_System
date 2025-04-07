import express from "express";
import { createFeedback } from "../controllers/feedbackController.js";

const FeedbackRouter = express.Router();

FeedbackRouter.route("/")
  .post(createFeedback);

export default FeedbackRouter;