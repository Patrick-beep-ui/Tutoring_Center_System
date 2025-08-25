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
import { AwardIcon } from "lucide-react";

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
              required: true,
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
                required: true,
                attributes: []
              },
              {
                model: SessionDetail,
                where: { session_status: 'completed' },
                required: true,
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
              { model: SessionDetail, attributes: [], required: true },
              { model: Semester, where: { is_current: true }, attributes: [], required: true }
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
                required: true,
                where: { session_status: 'completed' },
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

    const sessionsAmount = await safeQuery(
      TutorSession.count({
        include: [
          {
            model: SessionDetail,
            attributes: [],
            required: true,
            where: { session_status: 'completed' } 
          },
          {
            model: Semester,
            where: { is_current: true },
            attributes: [],
            required: true 
          }
        ],
      }),
    )

    console.log('Sessions Amount:', sessionsAmount);

    const avgSessionsPerTutor = parseFloat(sessionsAmount / tutorsAmount || 0).toFixed(2);

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
          },
          {
            model: SessionDetail,
            attributes: [],
            where: { session_status: 'completed' }, 
            required: true
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
          COUNT(DISTINCT s.session_id) AS sessions_amount,
          ROUND(AVG(f.rating), 2) AS avg_rating,
          COUNT(DISTINCT s.student_id) AS students_count
        FROM users u
        JOIN sessions s 
          ON u.user_id = s.tutor_id
          AND s.semester_id IN (
            SELECT semester_id FROM semester WHERE is_current = TRUE
          )
        LEFT JOIN session_details sd ON s.session_id = sd.session_id
        LEFT JOIN session_feedback f 
          ON s.session_id = f.session_id
        WHERE u.role = 'tutor' AND sd.session_status = 'completed'
        GROUP BY tutor_name
        ORDER BY sessions_amount DESC, avg_rating DESC;
      `)
    , 
    [[]]
  );

  const [tutorsHours] = await safeQuery(
    connection.query(`
      SELECT CONCAT(u.first_name, ' ', u.last_name) AS 'tutor_name', sum(s.session_totalhours) as 'total_hours'
      FROM sessions s JOIN semester se ON s.semester_id = se.semester_id
      JOIN session_details sd ON s.session_id = sd.session_id
      JOIN users u ON s.tutor_id = u.user_id 
      WHERE se.is_current = TRUE AND sd.session_status = 'completed'
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
              },
              
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

export const getStudentsReport = async (req, res) => {
  try {
    const studentsAmount = await safeQuery(
      User.count({
        where: {
          role: 'student'
        }
      }),
      0 
    );

    const attendanceData = await safeQuery(
      SessionDetail.findAll({
      attributes: [
        [fn('SUM', literal(`CASE WHEN session_status = 'completed' THEN 1 ELSE 0 END`)), 'completed'],
        [fn('SUM', literal(`CASE WHEN session_status IN ('scheduled','completed') THEN 1 ELSE 0 END`)), 'confirmed']
      ],
      include: [{
        model: TutorSession,
        attributes: [],
        required: true,
        include: [
          {
          model: Semester,
          required: true,
          attributes: [],
          where: { is_current: true }
        }
      ]
      }],
      raw: true
    }),
    0
  );
    
    const completed = Number(attendanceData[0].completed || 0);
    const confirmed = Number(attendanceData[0].confirmed || 0);
    const attendanceRate = confirmed ? completed / confirmed : 0;

    const [studentsSessions] = await safeQuery(
      connection.query(`
        SELECT ROUND(AVG(session_count), 2) AS avg_sessions_per_student
        FROM (
          SELECT s.student_id, COUNT(s.session_id) AS session_count
          FROM sessions s JOIN session_details sd ON s.session_id = sd.session_id
          JOIN semester se ON s.semester_id = se.semester_id
          WHERE sd.session_status = 'completed' AND se.is_current = TRUE
          GROUP BY student_id
        ) AS per_student;
      `),
      0 // fallback empty result
    )

    const [retentionRate] = await safeQuery(
      connection.query(`
        SELECT 
        ROUND(
            100.0 * SUM(CASE WHEN session_count > 1 THEN 1 ELSE 0 END) / COUNT(*), 
            2
        ) AS retention_rate
        FROM (
            SELECT s.student_id, COUNT(s.session_id) AS session_count
            FROM sessions s JOIN semester se ON s.semester_id = se.semester_id
            JOIN session_details sd ON s.session_id = sd.session_id
            WHERE se.is_current = TRUE AND sd.session_status = 'completed'
            GROUP BY student_id
        ) AS student_sessions;

        `
      ),
      0
    );

    const weeklyData = await safeQuery(
      TutorSession.findAll({
      attributes: [
        [literal("CONCAT('Week ', WEEK(session_date, 1) - WEEK(Semester.start_date, 1) + 1)"), 'name'],
        [literal("WEEK(session_date, 1) - WEEK(Semester.start_date, 1) + 1"), 'week_num'],
        [fn('SUM', literal("CASE WHEN `SessionDetails`.session_status IN ('completed') THEN 1 ELSE 0 END")), 'attended'],
        [fn('SUM', literal("CASE WHEN `SessionDetails`.session_status IN ('scheduled') THEN 1 ELSE 0 END")), 'scheduled'],
        [fn('SUM', literal("CASE WHEN `SessionDetails`.session_status = 'canceled' THEN 1 ELSE 0 END")), 'missed'],
      ],
      include: [
        { model: SessionDetail, attributes: [], required: true },
        { model: Semester, where: { is_current: true }, attributes: [], required: true }
      ],
      group: ['name','week_num'],
      order: [['week_num', 'ASC']],
      raw: true,
    }),
    [] // fallback empty result
  );

  const [popularCourses] = await safeQuery(
    connection.query(`
      SELECT 
        c.course_name AS course_name,
        COUNT(s.session_id) AS sessions_count,
        SUM(CASE WHEN sd.session_status = 'completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN sd.session_status = 'scheduled' THEN 1 ELSE 0 END) AS scheduled,
        SUM(CASE WHEN sd.session_status = 'pending' THEN 1 ELSE 0 END) AS pending
      FROM courses c
      JOIN sessions s ON s.course_id = c.course_id
      JOIN session_details sd ON s.session_id = sd.session_id
      JOIN semester se ON se.semester_id = s.semester_id
      WHERE se.is_current = TRUE
        AND sd.session_status IN ('completed', 'scheduled', 'pending')
      GROUP BY c.course_name
      ORDER BY sessions_count DESC
      LIMIT 8;
      `),
      [[]] // fallback empty result
  );

  const studentsByMajor = await safeQuery(
    Major.findAll({
      attributes: [
        'major_name',
        [fn('COUNT', col('Users.user_id')), 'students_count']
      ],
      include: [
        {
          model: User,
          where: { role: 'student' },
          attributes: [],
          required: true
        }
      ],
      group: ['major_name'],
      raw: true
    }),
    [] 
  )

  const [studentRetention] = await safeQuery(
    connection.query(`
      SELECT 
          SUM(CASE WHEN session_count = 1 THEN 1 ELSE 0 END) AS one_time_students,
          SUM(CASE WHEN session_count > 1 THEN 1 ELSE 0 END) AS returning_students
      FROM (
        SELECT s.student_id, COUNT(s.session_id) AS session_count
        FROM sessions s JOIN semester se ON s.semester_id = se.semester_id
        JOIN session_details sd ON s.session_id = sd.session_id
        WHERE se.is_current = TRUE AND sd.session_status = 'completed'
        GROUP BY student_id
      ) AS student_sessions;
          `),
    [[]] // fallback empty result
  )
    
    res.status(200).json({
      studentsAmount: studentsAmount,
      attendanceRate: (attendanceRate * 100).toFixed(2),
      retentionRate: retentionRate[0]?.retention_rate || 0,
      avgSessionsPerStudent: studentsSessions[0]?.avg_sessions_per_student || 0,
      weeklyData: weeklyData,
      popularCourses: popularCourses,
      studentsByMajor: studentsByMajor,
      studentRetention: studentRetention
    });
  }
  catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const getMajorsReport = async (req, res) => {
  try {
    const majorsCount = await Major.count();

    const [result] = await safeQuery(
      connection.query(`
        SELECT 
            ROUND(AVG(sessions_count), 2) AS avg_sessions_per_major
        FROM (
            SELECT 
                m.major_name,
                COUNT(s.session_id) AS sessions_count
            FROM majors m
            LEFT JOIN courses c ON m.major_id = c.major_id
            LEFT JOIN sessions s ON s.course_id = c.course_id
            LEFT JOIN session_details sd ON s.session_id = sd.session_id
            LEFT JOIN semester se ON s.semester_id = se.semester_id
            WHERE (se.is_current = TRUE OR se.semester_id IS NULL) 
              AND (sd.session_status = 'completed' OR sd.session_id IS NULL)
            GROUP BY m.major_name
        ) AS subquery;

      `),
      [[]] 
    );

    const avgSessionsPerMajor = parseFloat(result[0]?.avg_sessions_per_major || 0).toFixed(2);

    const [majorTotalHours] = await safeQuery(
      connection.query(`
        SELECT SUM(sessions_hours) as major_hours
        FROM(
          select m.major_name as 'major_name', SUM(s.session_totalhours) as 'sessions_hours'
          FROM sessions s JOIN courses c ON s.course_id = c.course_id
          JOIN session_details sd ON s.session_id = sd.session_id
          LEFT JOIN majors m ON c.major_id = m.major_id
          JOIN semester se ON s.semester_id = se.semester_id
          WHERE se.is_current = TRUE AND sd.session_status = 'completed'
          GROUP BY major_name
        ) as subquery;
      `),
      [[]] // fallback empty result
    );

    const majorHours = parseFloat(majorTotalHours[0]?.major_hours || 0);

    const [result_rating] = await safeQuery(
      connection.query(`
        SELECT ROUND(AVG(major_rating), 1) AS avg_rating_per_major
        FROM (
          SELECT m.major_name as 'major_name', ROUND(AVG(f.rating), 2) AS major_rating
          FROM session_feedback f 
          JOIN sessions s ON f.session_id = s.session_id
          JOIN semester se ON s.semester_id = se.semester_id
          JOIN courses c ON c.course_id = s.course_id
            JOIN majors m ON c.major_id = m.major_id
          WHERE se.is_current = TRUE
          GROUP BY major_name
        ) AS subquery;
      `),
      [[]] // fallback empty result
    );

    const avgRatingPerMajor = parseFloat(result_rating[0]?.avg_rating_per_major || 0).toFixed(1);

    const [result_sessions_usage] = await safeQuery(
      connection.query(`
        select m.major_name as 'major_name', count(s.session_id) as 'sessions_count', sum(s.session_totalhours) as 'session_hours'
        FROM sessions s JOIN session_details sd ON s.session_id = sd.session_id
        JOIN courses c ON s.course_id = c.course_id
        JOIN majors m ON c.major_id = m.major_id
        JOIN semester se ON s.semester_id = se.semester_id
        WHERE se.is_current = TRUE AND sd.session_status = 'completed'
        GROUP BY major_name;
      `),
      [[]] 
    );

    const tutorsByMajor = await safeQuery(
      Major.findAll({
        attributes: [
          'major_name',
          [fn('COUNT', col('Users.user_id')), 'tutors_count']
        ],
        include: [
          {
            model: User,
            attributes: [],
            required: true,
            where: { role: 'tutor' },
          }
        ],
        group: ['major_name'],
        raw: true
      }),
      [] 
    );

    const [result_sessions_by_major] = await safeQuery(
      connection.query(`
      SELECT m.major_name as 'major_name', count(s.session_id) as 'sessions_count'
      FROM sessions s JOIN courses c ON s.course_id = c.course_id
      JOIN session_details sd ON s.session_id = sd.session_id
      LEFT JOIN majors m ON c.major_id = m.major_id
      JOIN semester se ON s.semester_id = se.semester_id
      WHERE se.is_current = TRUE AND sd.session_status = 'completed'
      GROUP BY major_name;
      `),
      [[]] 
    );

    const [result_satisfaction_by_major] = await safeQuery(
      connection.query(`
        SELECT m.major_name as 'major_name', ROUND(AVG(f.rating), 2) AS major_rating
        FROM session_feedback f 
        JOIN sessions s ON f.session_id = s.session_id
        JOIN semester se ON s.semester_id = se.semester_id
        JOIN courses c ON c.course_id = s.course_id
        JOIN majors m ON c.major_id = m.major_id
        WHERE se.is_current = TRUE
        GROUP BY major_name;
      `),
      [[]]
    )

    res.status(200).json({
        majorsCount: majorsCount,
        avgSessionsPerMajor: avgSessionsPerMajor,
        totalHours: majorHours,
        avgRatingPerMajor: avgRatingPerMajor,
        sessionsUsage: result_sessions_usage,
        tutorsByMajor: tutorsByMajor,
        sessionsByMajor: result_sessions_by_major,
        satisfactionByMajor: result_satisfaction_by_major
      });

  }
  catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
}