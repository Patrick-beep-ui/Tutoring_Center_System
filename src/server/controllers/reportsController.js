import Tutor from "../models/Tutor.js";
import TutorCourse from "../models/TutorCourse.js";
import SessionDetail from "../models/SessionDetail.js";
import User from "../models/User.js";
import Major from "../models/Major.js";
import TutorSession from "../models/TutorSession.js";
import SessionFeedback from "../models/SessionFeedback.js";
import Semester from "../models/Semester.js";
import {literal, fn, col, Op} from "sequelize";
import connection from "../connection.js";
import safeQuery from "../utils/safeQuery.js";

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
        const sessionsAmount = await safeQuery(
          TutorSession.count({
            include: {
              model: Semester,
              where: { is_current: true },
              attributes: [] // do not return Semester fields
            }
          }),
          0 // fallback to 0 if the count fails
        );

          // Count of completed Sessions
          const completedSessions = await safeQuery(
            TutorSession.count({
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
          }),
            0 // fallback to 0 if the count fails
        );

        // Calculate the completion rate
        const completionRate = sessionsAmount > 0
        ? Math.round((completedSessions / sessionsAmount) * 10000) / 100  // rounded to 2 decimal places
        : 0;

        const [result] = await safeQuery(
          connection.query(`
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
          `),
          [[]] // fallback empty result
        );
          
          
          const averageDuration = parseFloat(result[0]?.average_duration || 0).toFixed(2);

        // Average Rating
        const averageRating = await safeQuery(
          SessionFeedback.findOne({
            attributes: [
              [fn('ROUND', fn('AVG', col('rating')), 1), 'avg_rating']
            ],
            where: {
              rating: { [Op.ne]: null } // Exclude null ratings properly
            },
            raw: true
          }),
          0
        );

          console.log('Average Rating:', averageRating);

          const weeklyData = await safeQuery(
            TutorSession.findAll({
            attributes: [
              [literal("CONCAT('Week ', WEEK(session_date, 1) - WEEK(Semester.start_date, 1) + 1)"), 'name'],
              [literal("WEEK(session_date, 1) - WEEK(Semester.start_date, 1) + 1"), 'week_num'],
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
          }),
          [] // fallback empty result
        );

          const hourlyData = await safeQuery(
            TutorSession.findAll({
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
          }),
          [] // fallback empty result
        );
          
          // Completion Data
          const completionData = await safeQuery(
            TutorSession.findAll({
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
          }),
          [] // fallback empty result
        );
          

        // Raitings Count
        const feedbackCounts = await safeQuery(
          SessionFeedback.findAll({
          attributes: [
            [col('rating'), 'rating'],
            [fn('COUNT', col('feedback_id')), 'count']
          ],
          where: {
            rating: { [Op.ne]: null }
          },
          group: ['rating'],
          raw: true
        }), []
      );


          res.status(200).json({
            sessionsAmount: sessionsAmount,
            completionRate: completionRate,
            averageDuration: averageDuration,
            averageRating: averageRating.avg_rating,
            weeklyData: weeklyData,
            hourlyData: hourlyData,
            completionData: completionData,
            feedbackCounts: feedbackCounts
            
          })
    }
    catch(e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getTutorsReport = async (req, res) => {
  try {
    const tutorsAmount = await safeQuery(
      User.count({
        where: {
          role: 'tutor'
        }
      }),
      0 // fallback to 0 if the count fails
    );

    const [result] = await safeQuery(
      connection.query(`
       SELECT ROUND(AVG(tutor_sessions), 2) AS avg_sessions_per_tutor
        FROM (SELECT COUNT(s.session_id) AS tutor_sessions
            FROM sessions s
            JOIN users u ON u.user_id = s.tutor_id
            JOIN semester se ON s.semester_id = se.semester_id
            WHERE se.is_current = TRUE
            GROUP BY s.tutor_id
        ) AS subquery
      `),
      [[]] // fallback empty result
    );

    const avgSessionsPerTutor = parseFloat(result[0]?.avg_sessions_per_tutor || 0).toFixed(2);

    res.status(200).json({
      tutorsAmount: tutorsAmount,
      avgSessionsPerTutor: avgSessionsPerTutor
    });
  }
  catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
}