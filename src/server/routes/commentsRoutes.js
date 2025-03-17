import express from "express";
import { getComments, addComment, deleteComment } from "../controllers/commentsController.js";

const CommentsRouter = express.Router();

CommentsRouter.route("/:session_id")
.get(getComments)
.post(addComment);

CommentsRouter.route("/:session_id/:comment_id?")
.delete(deleteComment);

export default CommentsRouter;