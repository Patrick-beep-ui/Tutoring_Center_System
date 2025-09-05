import express from "express";
import { createFeedback, getFeedbacks } from "../controllers/feedbackController.js";
import passport from "passport";

const FeedbackRouter = express.Router();

FeedbackRouter.route("/")
  .get(passport.authenticate("jwt", { session: false }), getFeedbacks)
  .post(createFeedback);

export default FeedbackRouter;