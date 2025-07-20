import Tutor from "../models/Tutor.js";
import TutorCourse from "../models/TutorCourse.js";
import SessionDetail from "../models/SessionDetail.js";
import User from "../models/User.js";
import Major from "../models/Major.js";
import TutorSession from "../models/TutorSession.js";
import Semester from "../models/Semester.js";
import {literal, fn, col} from "sequelize";
import connection from "../connection.js";

export const getReportData = async (req, res) => {
    try {
        const tutors = await Tutor.count();
        const completed_sessions = await SessionDetail.count({
            where: {
              session_status: 'completed',
            },
          });
          const pending_sessions = await SessionDetail.count({
            where: {
              session_status: 'pending',
            },
          });
        const tutor_courses = await TutorCourse.count({
            distinct: true,
            col: 'course_id'
        });
        const students = await User.count({
            where: {
                role: 'student'
            }
        });
        res.status(200).json({
            report: {
                tutors: tutors,
                tutor_courses: tutor_courses,
                students: students,
                completed_sessions: completed_sessions,
                pending_sessions: pending_sessions
              }
        })
    }
    catch(e) {
        console.error(e);
    }
}

export const getMajorSessions = async (req, res) => {
    try {
        const sessions = await Major.findAll({
            attributes: [
                'major_name',
                [literal(`COUNT(CASE WHEN session_status = 'completed' THEN 1 END)`), 'completed_sessions']
            ],
            include: [
                {
                    model: Tutor,
                    attributes: [],
                    include: [
                        {
                            model: TutorSession, 
                            attributes: [],
                            include: [
                                {
                                    model: SessionDetail,
                                    attributes: [],
                                    required: false
                                }
                            ],
                            required: false
                        }
                    ],
                    required: false
                }
            ],
            group: ['Major.major_id'],
        });

        res.status(200).json({
            sessions: sessions
        })
    }
    catch(e) {
        console.error(e);
    }
}

// Sessions Reports

export const getSessionsReport = async (req, res) => {
    try {  
        const sessionsAmount = await TutorSession.count({
            include: {
              model: Semester,
              where: { is_current: true },
              attributes: [] // do not return Semester fields
            }
          });

          // Count of completed Sessions
          const completedSessions = await TutorSession.count({
            include: [
              {
                model: Semester,
                where: { is_current: true },
                attributes: []
              },
              {
                model: SessionDetail,
                where: { session_status: 'completed' },
                attributes: []
              }
            ]
          });

        // Calculate the completion rate
        const completionRate = sessionsAmount > 0
        ? Math.round((completedSessions / sessionsAmount) * 10000) / 100  // rounded to 2 decimal places
        : 0;

        const [result] = await connection.query(`
            SELECT AVG(s.session_totalhours) as average_duration
            FROM sessions s
            JOIN semester sem ON s.semester_id = sem.semester_id
            WHERE sem.is_current = true
              AND EXISTS (
                SELECT 1
                FROM session_details sd
                WHERE sd.session_id = s.session_id
                  AND sd.session_status = 'completed'
              )
          `);
          
          
          const averageDuration = parseFloat(result[0]?.average_duration || 0).toFixed(2);

          const weeklyData = await TutorSession.findAll({
            attributes: [
              [literal("CONCAT('Week ', WEEK(session_date, 1) - WEEK(semester.start_date, 1) + 1)"), 'name'],
              [literal("WEEK(session_date, 1) - WEEK(semester.start_date, 1) + 1"), 'week_num'],
              [fn('COUNT', col('TutorSession.session_id')), 'sessions'],
              [fn('SUM', literal("CASE WHEN `SessionDetails`.session_status = 'completed' THEN 1 ELSE 0 END")), 'completed'],
              [fn('SUM', literal("CASE WHEN `SessionDetails`.session_status = 'canceled' THEN 1 ELSE 0 END")), 'cancelled'],
            ],
            include: [
              { model: SessionDetail, attributes: [] },
              { model: Semester, where: { is_current: true }, attributes: [] }
            ],
            group: ['name','week_num'],
            order: [['week_num', 'ASC']],
            raw: true,
          });

          const hourlyData = await TutorSession.findAll({
            attributes: [
              [fn("TIME_FORMAT", col("SessionDetails.session_time"), "%l %p"), "session_duration"],
              [fn("COUNT", "*"), "sessions"]
            ],
            include: [
              {
                model: SessionDetail,
                attributes: [],
                required: false
              },
              {
                model: Semester,
                attributes: [],
                required: true,
                where: { is_current: true }
              }
            ],
            group: [literal("session_duration")],
            order: [literal("STR_TO_DATE(session_duration, '%l %p')")],
            raw: true // <== IMPORTANT: tells Sequelize not to include session_id etc.
          });
          
          

          const completionData = await TutorSession.findAll({
            include: [
              {
                model: SessionDetail,
                attributes: [],
              },
              {
                model: Semester,
                where: { is_current: true },
                attributes: [],
              }
            ],
            attributes: [
              [col('SessionDetails.session_status'), 'name'],
              [fn('COUNT', col('TutorSession.session_id')), 'value'],
            ],
            group: ['SessionDetails.session_status'],
            raw: true,
          });
          

          console.log('Completion Data:', completionData);


          res.status(200).json({
            sessionsAmount: sessionsAmount,
            completionRate: completionRate,
            averageDuration: averageDuration,
            weeklyData: weeklyData,
            hourlyData: hourlyData,
            completionData: completionData
          })
    }
    catch(e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}