import express from "express";
import jwtAuth from "../middlewares/jwtAuth.js";
import isAdmin from "../middlewares/admin.js";
import {
    createAnnouncement,
    deleteAnnouncement,
    getAnnouncements,
    updateAnnouncement,
} from "../controllers/announcementsController.js";

const AnnouncementsRouter = express.Router();

AnnouncementsRouter.use(jwtAuth);
AnnouncementsRouter.get("/", getAnnouncements);
AnnouncementsRouter.post("/", isAdmin, createAnnouncement);
AnnouncementsRouter.put("/:announcement_id", isAdmin, updateAnnouncement);
AnnouncementsRouter.delete("/:announcement_id", isAdmin, deleteAnnouncement);

export default AnnouncementsRouter;
