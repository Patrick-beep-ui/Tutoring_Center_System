import express from 'express';
//import isAuth from './middlewares/auth.js';
import isAdmin from './middlewares/admin.js';
import upload from './middlewares/uploadMiddleware.js';
import { sendEmail } from './mail.js';
import jwtAuth from './middlewares/jwtAuth.js';
import passport from 'passport';
import si from 'systeminformation';
import userCheck from './middlewares/userCheck.js';

// Association Models
import Major from "./models/Major.js";
import Tutor from "./models/Tutor.js";
import TutorSession from "./models/TutorSession.js"

import User from "./models/User.js";

import "./models/associations.js"; // Check routes and controllers in case something goes wrong with some of the Models

import CalendarSessionsRouter from './routes/calendarSessionsRoutes.js';
import ReportRouter from './routes/reportsRoutes.js';
import TutorsRouter from './routes/tutorsRoutes.js';
import TermsRouter from './routes/termRoutes.js';
import MajorRouter from './routes/majorRoutes.js';
import CoursesRouter from './routes/coursesRoutes.js';
import CommentsRouter from './routes/commentsRoutes.js';
import SessionsRouter from './routes/sessionRoutes.js';
import UserRouter from './routes/userRoutes.js';
import FeedbackRouter from './routes/feedbackRoutes.js';
import SchedulesRouter from './routes/schedulesRoutes.js';
import StudentRouter from './routes/studentRoutes.js';

const api = express.Router({mergeParams: true});

api.use("/calendar-session", CalendarSessionsRouter);
api.use("/report", ReportRouter)
api.use("/tutors", TutorsRouter);
api.use("/terms", TermsRouter);
api.use("/majors", MajorRouter);
api.use("/courses", CoursesRouter);
api.use("/comments", CommentsRouter);
api.use("/sessions",SessionsRouter);
api.use("/users", UserRouter);
api.use("/feedback", FeedbackRouter);
api.use("/schedules", SchedulesRouter);
api.use("/students", StudentRouter);


// Endpoint to check authentication
api.route('/auth')
.get(passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const id = req.user.user_id;
    console.log('User ID on auth:', id);
    const user = await User.findByPk(id, {
      include: {
        model: Major,
        attributes: ['major_id', 'major_name'] 
      }
    });
    

    if (!user) {
      return res.status(404).json({ message: 'User not found' }); 
    }

    res.status(200).json({
        user
    });
  }
  catch(e) {
    console.error(e);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//Prueba branch


api.post('/send-email', async (req, res) => {
    const { to, subject, text } = req.body;
  
    try {
      sendEmail(to, subject, text);
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to send email', error: error.message });
    }
  });

api.post('/uploadProfilePic/:role?', upload.single('profilePic'), (req, res) => {
    console.log('File received:', req.file);
    res.status(200).json({
        message: 'Profile picture uploaded successfully'
    });
});

api.route('/system')
  .get(async (req, res) => {
    try {
      const [mem, cpu, disk, processes, cpuLoad, network, graphics] = await Promise.all([
        si.mem(),
        si.cpu(),
        si.fsSize(),
        si.processes(),
        si.currentLoad(),
        si.networkInterfaces(),
        si.graphics()
      ]);

      const wifiInfo = network.find(iface => iface.type === 'wifi') || {};

      const data = {
        memory: {
          total: (mem.total / (1024 ** 3)) + " GB",
          used: (mem.used / (1024 ** 3)) + " GB",
          free: (mem.free / (1024 ** 3)) + " GB",
        },
        cpu: {
          manufacturer: cpu.manufacturer,
          brand: cpu.brand,
          cores: cpu.cores,
          physicalCores: cpu.physicalCores,
          speed: cpu.speed + " GHz",
          usage: cpuLoad.currentLoad
        },
        disk: disk.map((d) => ({
          device: d.fs,
          total: (d.size / (1024 ** 3)) + " GB",
          used: (d.used / (1024 ** 3)) + " GB",
          free: (d.available / (1024 ** 3)) + " GB",
          mount: d.mount,
        })),
        topProcesses: processes.list
          .sort((a, b) => b.cpu - a.cpu)
          .slice(0, 10)
          .map(proc => ({
            pid: proc.pid,
            name: proc.name,
            memory: (proc.memRss / (1024 ** 2)) + " MB",
            cpu: proc.cpu + "%",
          })),
        wifi: {
          ssid: wifiInfo.ips ? wifiInfo.ips[0] : 'N/A',
          signalLevel: wifiInfo.signalLevel ? wifiInfo.signalLevel + " dBm" : 'N/A',
          speed: wifiInfo.speed ? wifiInfo.speed + " Mbps" : 'N/A'
        },
        graphics: graphics.controllers.map(gpu => ({
          name: gpu.model,
          usage: gpu.memoryUtil * 100 + "%",
          temperature: gpu.temperatureGpu ? gpu.temperatureGpu + " °C" : "N/A"
        })),
      };

      console.log('System Info:', data);
      res.status(200).json(data);
    } catch (err) {
      console.error('System Info Error:', err);
      res.status(500).json({ message: 'Failed to fetch system info' });
    }
  });




export default api