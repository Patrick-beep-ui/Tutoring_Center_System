import Tutor from "../models/Tutor.js";
import TutorCourse from "../models/TutorCourse.js";
import SessionDetail from "../models/SessionDetail.js";
import User from "../models/User.js";
import Major from "../models/Major.js";
import TutorSession from "../models/TutorSession.js";
import SessionFeedback from "../models/SessionFeedback.js";
import Semester from "../models/Semester.js";
import Course from "../models/Course.js";
import Schedule from "../models/Schedule.js";

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

          const [result_rating] = await safeQuery(
            SessionFeedback.findAll({
              attributes: [
                [fn('ROUND', fn('AVG', col('rating')), 1), 'avg_rating']
              ],
              where: {
                rating: { [Op.ne]: null } 
              },
              include: [
                {
                  model: TutorSession,
                  required: true,
                  attributes: [],
                  include: [
                    {
                      model: Semester,
                      required: true, // Only include sessions from the current semester
                      where: { is_current: true },
                      attributes: []
                    }
                  ]
                }
              ],
              raw: true
            }),
            [{ avg_rating: 0 }] // fallback result
          );

          const averageRating = result_rating?.avg_rating || 0;

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
                required: true
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
          include: [
            {
              model: TutorSession,
              attributes: [],
              required: true,
              include: [
                {
                  model: Semester,
                  where: { is_current: true },
                  attributes: []
                }
              ]
            }
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
            averageRating: averageRating,
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

    const [result_rating] = await safeQuery(
      connection.query(`
        SELECT ROUND(AVG(tutor_rating), 1) as avg_rating_per_tutor
        FROM(
        SELECT s.tutor_id as 'tutor_id', ROUND(AVG(f.rating), 2) as 'tutor_rating'
        from session_feedback f JOIN sessions s ON f.session_id = s.session_id
        JOIN semester se ON s.semester_id = se.semester_id
        WHERE se.is_current = TRUE
        GROUP BY tutor_id
        ) AS subquery
      `),
      [[]] // fallback empty result
    );

    const avgRatingPerTutor = parseFloat(result_rating[0]?.avg_rating_per_tutor || 0).toFixed(1);

    const totalHours = await safeQuery(
      TutorSession.findAll({
        attributes: [[fn('SUM', col('session_totalhours')), 'total_hours']],
        include: [
          {
            model: Semester,
            where: { is_current: true },
            attributes: []
          }
        ],
        raw: true
      }),
      0 // fallback empty result
    );

    const [tutorsPerformance] = await safeQuery(
      connection.query(`
        SELECT 
          CONCAT(u.first_name, ' ', u.last_name) AS tutor_name,
          COUNT(s.session_id) AS sessions_amount,
          ROUND(AVG(f.rating), 2) AS avg_rating,
          COUNT(s.student_id) AS students_count
        FROM users u
        JOIN sessions s 
          ON u.user_id = s.tutor_id
          AND s.semester_id IN (
            SELECT semester_id FROM semester WHERE is_current = TRUE
          )
        LEFT JOIN session_feedback f 
          ON s.session_id = f.session_id
        WHERE u.role = 'tutor'
        GROUP BY tutor_name;
      `)
    , 
    [[]]
  );

  const [tutorsHours] = await safeQuery(
    connection.query(`
      SELECT CONCAT(u.first_name, ' ', u.last_name) AS 'tutor_name', sum(s.session_totalhours) as 'total_hours'
      FROM sessions s JOIN semester se ON s.semester_id = se.semester_id
      JOIN users u ON s.tutor_id = u.user_id 
      WHERE se.is_current = TRUE
      GROUP BY tutor_id;
      `)
    ,
    [[]]
  );

  const sessionsPerMajor = await safeQuery(
    Major.findAll({
    attributes: [
      "major_name",
      [fn("COUNT", col("Courses.TutorSessions.session_id")), "sessions_amount"]
    ],
    include: [
      {
        model: Course,
        attributes: [],
        include: [
          {
            model: TutorSession,
            attributes: [],
            required: true,
            include: [
              {
                model: Semester,
                attributes: [],
                required: true,
                where: { is_current: true }
              }
            ]
          }
        ]
      }
    ],
    group: ["Major.major_name"],
    raw: true
    }), 
    [[]]
  );

  const availabilityData = await safeQuery(
    Schedule.findAll({
      attributes: [
        [literal("CONCAT(start_time, '-', end_time)"), 'time_block'],
        [fn('COUNT', fn('DISTINCT', col('user_id'))), 'tutors_count']
      ],
      group: ['time_block'],
      order: [[literal("tutors_count"), "DESC"]],
      limit: 4,
      raw: true,
    }),
    [[]] 
  )

    res.status(200).json({
      tutorsAmount: tutorsAmount,
      avgSessionsPerTutor: avgSessionsPerTutor,
      avgRatingPerTutor: avgRatingPerTutor,
      totalHours: totalHours[0]?.total_hours,
      tutorsPerformance: tutorsPerformance,
      tutorsHours: tutorsHours,
      sessionsPerMajor: sessionsPerMajor,
      availabilityData: availabilityData
    });
  }
  catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
}