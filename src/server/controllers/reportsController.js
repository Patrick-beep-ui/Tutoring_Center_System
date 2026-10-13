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
import { resolveSemesterId } from "../utils/currentSemester.js";
import { getReportDateRange, reportSessionSql } from "../utils/reportDateRange.js";

export const getReportData = async (req, res) => {
    try {
        const semester_id = await resolveSemesterId(req.query.semester_id);
        const tutors = await Tutor.count();
        const completed_sessions = await SessionDetail.count({
            where: {
              session_status: 'completed',
            },
            include: [{
                model: TutorSession,
                attributes: [],
                required: true,
                where: { semester_id }
            }]
          });
          const pending_sessions = await SessionDetail.count({
            where: {
              session_status: 'pending',
            },
            include: [{
                model: TutorSession,
                attributes: [],
                required: true,
                where: { semester_id }
            }]
          });
        const tutor_courses = await TutorCourse.count({
            distinct: true,
            col: 'course_id',
            where: { semester_id }
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
        if (e.message === 'No current semester is set') {
            return res.status(404).json({ error: e.message });
        }
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getMajorSessions = async (req, res) => {
    try {
        const semester_id = await resolveSemesterId(req.query.semester_id);
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
                            where: { semester_id },
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
        if (e.message === 'No current semester is set') {
            return res.status(404).json({ error: e.message });
        }
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Sessions Reports

export const getSessionsReportLegacy = async (req, res) => {
    try {
        const semester_id = await resolveSemesterId(req.query.semester_id);

        const sessionsAmount = await safeQuery(
          TutorSession.count({
            distinct: true,
            col: 'session_id',
            where: { semester_id },
            include: [
              {
                model: SessionDetail,
                required: true
              }
            ]
          }),
          0 // fallback to 0 if the count fails
        );

          // Count of completed Sessions
          const completedSessions = await safeQuery(
            TutorSession.count({
            where: { semester_id },
            include: [
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
            WHERE s.semester_id = :semester_id
              AND EXISTS (
                SELECT 1
                FROM session_details sd
                WHERE sd.session_id = s.session_id
                  AND sd.session_status = 'completed'
              )
          `, {
            replacements: { semester_id }
          }),
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
                  where: { semester_id }
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
            where: { semester_id },
            include: [
              { model: SessionDetail, attributes: [], required: true },
              { model: Semester, attributes: ['start_date'], required: true }
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
            where: { semester_id },
            include: [
              {
                model: SessionDetail,
                attributes: [],
                required: true,
                where: { session_status: 'completed' },
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
            where: { semester_id },
            include: [
              {
                model: SessionDetail,
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
              where: { semester_id }
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
        if (e.message === 'No current semester is set') {
            return res.status(404).json({ error: e.message });
        }
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getTutorsReportLegacy = async (req, res) => {
  try {
    const semester_id = await resolveSemesterId(req.query.semester_id);

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
        where: { semester_id },
        include: [
          {
            model: SessionDetail,
            attributes: [],
            required: true,
            where: { session_status: 'completed' }
          }
        ],
      }),
      0
    )

    const avgSessionsPerTutor = parseFloat(sessionsAmount / tutorsAmount || 0).toFixed(2);

    const [result_rating] = await safeQuery(
      connection.query(`
        SELECT ROUND(AVG(tutor_rating), 1) as avg_rating_per_tutor
        FROM(
        SELECT s.tutor_id as 'tutor_id', ROUND(AVG(f.rating), 2) as 'tutor_rating'
        from session_feedback f JOIN sessions s ON f.session_id = s.session_id
        WHERE s.semester_id = :semester_id
        GROUP BY tutor_id
        ) AS subquery
      `, {
        replacements: { semester_id }
      }),
      [[]] // fallback empty result
    );

    const avgRatingPerTutor = parseFloat(result_rating[0]?.avg_rating_per_tutor || 0).toFixed(1);

    const totalHours = await safeQuery(
      TutorSession.findAll({
        attributes: [[fn('SUM', col('session_totalhours')), 'total_hours']],
        where: { semester_id },
        include: [
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
          AND s.semester_id = :semester_id
        LEFT JOIN session_details sd ON s.session_id = sd.session_id
        LEFT JOIN session_feedback f
          ON s.session_id = f.session_id
        WHERE u.role = 'tutor' AND sd.session_status = 'completed'
        GROUP BY tutor_name
        ORDER BY sessions_amount DESC, avg_rating DESC;
      `, {
        replacements: { semester_id }
      })
    ,
    [[]]
  );

  const [tutorsHours] = await safeQuery(
    connection.query(`
      SELECT CONCAT(u.first_name, ' ', u.last_name) AS 'tutor_name', sum(s.session_totalhours) as 'total_hours'
      FROM sessions s
      JOIN session_details sd ON s.session_id = sd.session_id
      JOIN users u ON s.tutor_id = u.user_id
      WHERE s.semester_id = :semester_id AND sd.session_status = 'completed'
      GROUP BY tutor_id;
      `, {
        replacements: { semester_id }
      })
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
            where: { semester_id }
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
      where: { semester_id },
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
    if (e.message === 'No current semester is set') {
        return res.status(404).json({ error: e.message });
    }
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const getStudentsReportLegacy = async (req, res) => {
  try {
    const semester_id = await resolveSemesterId(req.query.semester_id);

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
        where: { semester_id }
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
          WHERE sd.session_status = 'completed' AND s.semester_id = :semester_id
          GROUP BY student_id
        ) AS per_student;
      `, {
        replacements: { semester_id }
      }),
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
            FROM sessions s
            JOIN session_details sd ON s.session_id = sd.session_id
            WHERE s.semester_id = :semester_id AND sd.session_status = 'completed'
            GROUP BY student_id
        ) AS student_sessions;

        `, {
          replacements: { semester_id }
        }),
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
      where: { semester_id },
      include: [
        { model: SessionDetail, attributes: [], required: true },
        { model: Semester, attributes: ['start_date'], required: true }
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
      WHERE s.semester_id = :semester_id
        AND sd.session_status IN ('completed', 'scheduled', 'pending')
      GROUP BY c.course_name
      ORDER BY sessions_count DESC
      LIMIT 8;
      `, {
        replacements: { semester_id }
      }),
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
        FROM sessions s
        JOIN session_details sd ON s.session_id = sd.session_id
        WHERE s.semester_id = :semester_id AND sd.session_status = 'completed'
        GROUP BY student_id
      ) AS student_sessions;
          `, {
            replacements: { semester_id }
          }),
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
    if (e.message === 'No current semester is set') {
        return res.status(404).json({ error: e.message });
    }
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const getMajorsReportLegacy = async (req, res) => {
  try {
    const semester_id = await resolveSemesterId(req.query.semester_id);

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
            LEFT JOIN sessions s ON s.course_id = c.course_id AND s.semester_id = :semester_id
            LEFT JOIN session_details sd ON s.session_id = sd.session_id
            WHERE (sd.session_status = 'completed' OR sd.session_id IS NULL)
            GROUP BY m.major_name
        ) AS subquery;

      `, {
        replacements: { semester_id }
      }),
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
          WHERE s.semester_id = :semester_id AND sd.session_status = 'completed'
          GROUP BY major_name
        ) as subquery;
      `, {
        replacements: { semester_id }
      }),
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
          JOIN courses c ON c.course_id = s.course_id
            JOIN majors m ON c.major_id = m.major_id
          WHERE s.semester_id = :semester_id
          GROUP BY major_name
        ) AS subquery;
      `, {
        replacements: { semester_id }
      }),
      [[]] // fallback empty result
    );

    const avgRatingPerMajor = parseFloat(result_rating[0]?.avg_rating_per_major || 0).toFixed(1);

    const [result_sessions_usage] = await safeQuery(
      connection.query(`
        select m.major_name as 'major_name', count(s.session_id) as 'sessions_count', sum(s.session_totalhours) as 'session_hours'
        FROM sessions s JOIN session_details sd ON s.session_id = sd.session_id
        JOIN courses c ON s.course_id = c.course_id
        JOIN majors m ON c.major_id = m.major_id
        WHERE s.semester_id = :semester_id AND sd.session_status = 'completed'
        GROUP BY major_name;
      `, {
        replacements: { semester_id }
      }),
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
      [[]]
    );

    const [result_sessions_by_major] = await safeQuery(
      connection.query(`
      SELECT m.major_name as 'major_name', count(s.session_id) as 'sessions_count'
      FROM sessions s JOIN courses c ON s.course_id = c.course_id
      JOIN session_details sd ON s.session_id = sd.session_id
      LEFT JOIN majors m ON c.major_id = m.major_id
      WHERE s.semester_id = :semester_id AND sd.session_status = 'completed'
      GROUP BY major_name;
      `, {
        replacements: { semester_id }
      }),
      [[]]
    );

    const [result_satisfaction_by_major] = await safeQuery(
      connection.query(`
        SELECT m.major_name as 'major_name', ROUND(AVG(f.rating), 2) AS major_rating
        FROM session_feedback f
        JOIN sessions s ON f.session_id = s.session_id
        JOIN courses c ON c.course_id = s.course_id
        JOIN majors m ON c.major_id = m.major_id
        WHERE s.semester_id = :semester_id
        GROUP BY major_name;
      `, {
        replacements: { semester_id }
      }),
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
    if (e.message === 'No current semester is set') {
        return res.status(404).json({ error: e.message });
    }
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const reportQuery = (sql, replacements) => safeQuery(connection.query(sql, { replacements }), [[]]);

const reportRange = (req, res) => {
  const range = getReportDateRange(req.query);
  if (!range) {
    res.status(400).json({ error: 'Invalid date range' });
    return null;
  }
  return range;
};

const reportError = (error, res) => {
  if (error.message === 'No current semester is set') return res.status(404).json({ error: error.message });
  console.error(error);
  return res.status(500).json({ error: 'Internal server error' });
};

// session_students holds group membership; the scalar student_id is only an individual-session participant.
const participantSessionsSql = (dateSql) => `
  SELECT ss.student_id, s.session_id, s.course_id, s.session_date, s.session_totalhours, sd.session_status
  FROM sessions s
  JOIN session_details sd ON sd.session_id = s.session_id
  JOIN session_students ss ON ss.session_id = s.session_id
  WHERE s.semester_id = :semester_id${dateSql}
  UNION ALL
  SELECT s.student_id, s.session_id, s.course_id, s.session_date, s.session_totalhours, sd.session_status
  FROM sessions s
  JOIN session_details sd ON sd.session_id = s.session_id
  WHERE s.semester_id = :semester_id${dateSql}
    AND s.student_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM session_students ss WHERE ss.session_id = s.session_id)`;

export const getSessionsReport = async (req, res) => {
  const range = reportRange(req, res);
  if (!range) return;
  try {
    const dateSql = reportSessionSql('s', range);
    const replacements = { semester_id: await resolveSemesterId(req.query.semester_id), ...range };
    const [[summary], [weeklyData], [hourlyData], [completionData], [feedbackCounts]] = await Promise.all([
      reportQuery(`SELECT COUNT(*) AS sessionsAmount,
        COALESCE(ROUND(100 * SUM(sd.session_status = 'completed') / NULLIF(COUNT(*), 0), 2), 0) AS completionRate,
        COALESCE(ROUND(AVG(CASE WHEN sd.session_status = 'completed' THEN s.session_totalhours END), 2), 0) AS averageDuration,
        COALESCE(ROUND(AVG(f.rating), 1), 0) AS averageRating
        FROM sessions s JOIN session_details sd ON sd.session_id = s.session_id
        LEFT JOIN session_feedback f ON f.session_id = s.session_id
        WHERE s.semester_id = :semester_id${dateSql}`, replacements),
      reportQuery(`SELECT CONCAT('Week ', WEEK(s.session_date, 1) - WEEK(sem.start_date, 1) + 1) AS name,
        WEEK(s.session_date, 1) - WEEK(sem.start_date, 1) + 1 AS week_num, COUNT(*) AS sessions,
        SUM(sd.session_status = 'completed') AS completed, SUM(sd.session_status = 'canceled') AS cancelled
        FROM sessions s JOIN session_details sd ON sd.session_id = s.session_id JOIN semester sem ON sem.semester_id = s.semester_id
        WHERE s.semester_id = :semester_id${dateSql} GROUP BY name, week_num ORDER BY week_num`, replacements),
      reportQuery(`SELECT TIME_FORMAT(sd.session_time, '%l %p') AS session_duration, COUNT(*) AS sessions
        FROM sessions s JOIN session_details sd ON sd.session_id = s.session_id
        WHERE s.semester_id = :semester_id AND sd.session_status = 'completed'${dateSql}
        GROUP BY session_duration ORDER BY STR_TO_DATE(session_duration, '%l %p')`, replacements),
      reportQuery(`SELECT sd.session_status AS name, COUNT(*) AS value FROM sessions s JOIN session_details sd ON sd.session_id = s.session_id
        WHERE s.semester_id = :semester_id${dateSql} GROUP BY sd.session_status`, replacements),
      reportQuery(`SELECT f.rating, COUNT(*) AS count FROM session_feedback f JOIN sessions s ON s.session_id = f.session_id
        WHERE s.semester_id = :semester_id AND f.rating IS NOT NULL${dateSql} GROUP BY f.rating`, replacements)
    ]);
    res.json({ sessionsAmount: Number(summary?.sessionsAmount || 0), completionRate: Number(summary?.completionRate || 0), averageDuration: Number(summary?.averageDuration || 0).toFixed(2), averageRating: summary?.averageRating || 0, weeklyData, hourlyData, completionData, feedbackCounts });
  } catch (e) { return reportError(e, res); }
};

export const getTutorsReport = async (req, res) => {
  const range = reportRange(req, res);
  if (!range) return;
  try {
    const dateSql = reportSessionSql('s', range);
    const replacements = { semester_id: await resolveSemesterId(req.query.semester_id), ...range };
    const countSql = range.date_from || range.date_to
      ? `SELECT COUNT(DISTINCT s.tutor_id) AS tutorsAmount FROM sessions s WHERE s.semester_id = :semester_id${dateSql}`
      : `SELECT COUNT(*) AS tutorsAmount FROM users WHERE role = 'tutor'`;
    const [[totals], [tutorsPerformance], [tutorsHours], [sessionsPerMajor], [availabilityData]] = await Promise.all([
      (async () => {
        const [countRows] = await reportQuery(countSql, replacements);
        const [metricRows] = await reportQuery(`SELECT COUNT(*) AS sessionsAmount, COALESCE(SUM(s.session_totalhours), 0) AS totalHours,
          COALESCE(ROUND(AVG(f.rating), 1), 0) AS avgRatingPerTutor FROM sessions s JOIN session_details sd ON sd.session_id=s.session_id
          LEFT JOIN session_feedback f ON f.session_id=s.session_id WHERE s.semester_id=:semester_id AND sd.session_status='completed'${dateSql}`, replacements);
        return [{ ...metricRows[0], tutorsAmount: countRows[0]?.tutorsAmount || 0 }];
      })(),
      reportQuery(`SELECT CONCAT(u.first_name, ' ', u.last_name) AS tutor_name, COUNT(DISTINCT s.session_id) AS sessions_amount, ROUND(AVG(f.rating), 2) AS avg_rating,
        COUNT(DISTINCT p.student_id) AS students_count FROM sessions s JOIN session_details sd ON sd.session_id=s.session_id JOIN users u ON u.user_id=s.tutor_id
        LEFT JOIN session_feedback f ON f.session_id=s.session_id LEFT JOIN (${participantSessionsSql(dateSql)}) p ON p.session_id=s.session_id
        WHERE s.semester_id=:semester_id AND sd.session_status='completed'${dateSql} GROUP BY u.user_id, tutor_name ORDER BY sessions_amount DESC, avg_rating DESC`, replacements),
      reportQuery(`SELECT CONCAT(u.first_name, ' ', u.last_name) AS tutor_name, SUM(s.session_totalhours) AS total_hours FROM sessions s JOIN session_details sd ON sd.session_id=s.session_id JOIN users u ON u.user_id=s.tutor_id WHERE s.semester_id=:semester_id AND sd.session_status='completed'${dateSql} GROUP BY u.user_id, tutor_name`, replacements),
      reportQuery(`SELECT m.major_name, COUNT(*) AS sessions_amount FROM sessions s JOIN courses c ON c.course_id=s.course_id JOIN majors m ON m.major_id=c.major_id WHERE s.semester_id=:semester_id${dateSql} GROUP BY m.major_id, m.major_name`, replacements),
      reportQuery(`SELECT TIME_FORMAT(sd.session_time, '%l %p') AS time_block, COUNT(DISTINCT s.tutor_id) AS tutors_count FROM sessions s JOIN session_details sd ON sd.session_id=s.session_id WHERE s.semester_id=:semester_id${dateSql} GROUP BY time_block ORDER BY tutors_count DESC LIMIT 4`, replacements)
    ]);
    const total = totals?.[0] || {};
    res.json({ tutorsAmount: Number(total.tutorsAmount || 0), avgSessionsPerTutor: (Number(total.sessionsAmount || 0) / Number(total.tutorsAmount || 1)).toFixed(2), avgRatingPerTutor: Number(total.avgRatingPerTutor || 0).toFixed(1), totalHours: total.totalHours || 0, tutorsPerformance, tutorsHours, sessionsPerMajor, availabilityData });
  } catch (e) { return reportError(e, res); }
};

export const getStudentsReport = async (req, res) => {
  const range = reportRange(req, res);
  if (!range) return;
  try {
    const dateSql = reportSessionSql('s', range);
    const replacements = { semester_id: await resolveSemesterId(req.query.semester_id), ...range };
    const participants = participantSessionsSql(dateSql);
    const hasRange = range.date_from || range.date_to;
    const studentsCountSql = hasRange
      ? `SELECT COUNT(DISTINCT student_id) AS studentsAmount FROM (${participants}) p`
      : `SELECT COUNT(*) AS studentsAmount FROM users WHERE role = 'student'`;
    const [[summary], [weeklyData], [popularCourses], [studentsByMajor], [studentRetention]] = await Promise.all([
      reportQuery(`SELECT (${studentsCountSql}) AS studentsAmount,
        (SELECT COALESCE(ROUND(100 * SUM(p.session_status='completed') / NULLIF(SUM(p.session_status IN ('scheduled','completed')), 0), 2), 0) FROM (${participants}) p) AS attendanceRate,
        (SELECT COALESCE(ROUND(AVG(session_count), 2), 0) FROM (SELECT student_id, COUNT(*) AS session_count FROM (${participants}) p WHERE p.session_status='completed' GROUP BY student_id) counts) AS avgSessionsPerStudent,
        (SELECT COALESCE(ROUND(100 * AVG(session_count > 1), 2), 0) FROM (SELECT student_id, COUNT(*) AS session_count FROM (${participants}) p WHERE p.session_status='completed' GROUP BY student_id) counts) AS retentionRate`, replacements),
      reportQuery(`SELECT CONCAT('Week ', WEEK(p.session_date, 1) - WEEK(sem.start_date, 1) + 1) AS name, WEEK(p.session_date, 1) - WEEK(sem.start_date, 1) + 1 AS week_num,
        SUM(p.session_status='completed') AS attended, SUM(p.session_status='scheduled') AS scheduled, SUM(p.session_status='canceled') AS missed
        FROM (${participants}) p JOIN sessions s ON s.session_id=p.session_id JOIN semester sem ON sem.semester_id=s.semester_id GROUP BY name, week_num ORDER BY week_num`, replacements),
      reportQuery(`SELECT c.course_name, COUNT(*) AS sessions_count, SUM(sd.session_status='completed') AS completed, SUM(sd.session_status='scheduled') AS scheduled, SUM(sd.session_status='pending') AS pending
        FROM sessions s JOIN courses c ON c.course_id=s.course_id JOIN session_details sd ON sd.session_id=s.session_id
        WHERE s.semester_id=:semester_id AND sd.session_status IN ('completed','scheduled','pending')${dateSql} GROUP BY c.course_id, c.course_name ORDER BY sessions_count DESC LIMIT 8`, replacements),
      reportQuery(`SELECT m.major_name, COUNT(DISTINCT p.student_id) AS students_count FROM (${participants}) p JOIN users u ON u.ku_id=p.student_id JOIN majors m ON m.major_id=u.major_id GROUP BY m.major_id, m.major_name`, replacements),
      reportQuery(`SELECT SUM(session_count=1) AS one_time_students, SUM(session_count>1) AS returning_students FROM (SELECT student_id, COUNT(*) AS session_count FROM (${participants}) p WHERE p.session_status='completed' GROUP BY student_id) counts`, replacements)
    ]);
    res.json({ studentsAmount: Number(summary?.studentsAmount || 0), attendanceRate: Number(summary?.attendanceRate || 0).toFixed(2), retentionRate: summary?.retentionRate || 0, avgSessionsPerStudent: summary?.avgSessionsPerStudent || 0, weeklyData, popularCourses, studentsByMajor, studentRetention });
  } catch (e) { return reportError(e, res); }
};

export const getMajorsReport = async (req, res) => {
  const range = reportRange(req, res);
  if (!range) return;
  try {
    const dateSql = reportSessionSql('s', range);
    const replacements = { semester_id: await resolveSemesterId(req.query.semester_id), ...range };
    const activeMajorFrom = `FROM sessions s JOIN courses c ON c.course_id=s.course_id JOIN majors m ON m.major_id=c.major_id JOIN session_details sd ON sd.session_id=s.session_id`;
    const activeMajorWhere = `WHERE s.semester_id=:semester_id AND sd.session_status='completed'${dateSql}`;
    const [[summary], [sessionsUsage], [tutorsByMajor], [sessionsByMajor], [satisfactionByMajor]] = await Promise.all([
      reportQuery(`SELECT COUNT(DISTINCT major_id) AS majorsCount, COALESCE(ROUND(AVG(sessions_count), 2), 0) AS avgSessionsPerMajor, COALESCE(SUM(session_hours), 0) AS totalHours, COALESCE(ROUND(AVG(major_rating), 1), 0) AS avgRatingPerMajor FROM (
        SELECT m.major_id, COUNT(*) AS sessions_count, SUM(s.session_totalhours) AS session_hours, AVG(f.rating) AS major_rating ${activeMajorFrom} LEFT JOIN session_feedback f ON f.session_id=s.session_id ${activeMajorWhere} GROUP BY m.major_id) major_metrics`, replacements),
      reportQuery(`SELECT m.major_name, COUNT(*) AS sessions_count, SUM(s.session_totalhours) AS session_hours ${activeMajorFrom} ${activeMajorWhere} GROUP BY m.major_id, m.major_name`, replacements),
      reportQuery(`SELECT m.major_name, COUNT(DISTINCT s.tutor_id) AS tutors_count ${activeMajorFrom} ${activeMajorWhere} GROUP BY m.major_id, m.major_name`, replacements),
      reportQuery(`SELECT m.major_name, COUNT(*) AS sessions_count ${activeMajorFrom} ${activeMajorWhere} GROUP BY m.major_id, m.major_name`, replacements),
      reportQuery(`SELECT m.major_name, ROUND(AVG(f.rating), 2) AS major_rating ${activeMajorFrom} JOIN session_feedback f ON f.session_id=s.session_id ${activeMajorWhere} GROUP BY m.major_id, m.major_name`, replacements)
    ]);
    res.json({ majorsCount: Number(summary?.majorsCount || 0), avgSessionsPerMajor: Number(summary?.avgSessionsPerMajor || 0).toFixed(2), totalHours: Number(summary?.totalHours || 0), avgRatingPerMajor: Number(summary?.avgRatingPerMajor || 0).toFixed(1), sessionsUsage, tutorsByMajor, sessionsByMajor, satisfactionByMajor });
  } catch (e) { return reportError(e, res); }
};

// Monday of the week containing the given date
const startOfWeek = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
};

const toMySQLDate = (date) => {
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const getTopTutors = async (req, res) => {
    try {
        const semester_id = await resolveSemesterId(req.query.semester_id);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 10);

        const semester = await Semester.findByPk(semester_id);
        if (!semester) {
            return res.status(404).json({ error: 'Semester not found' });
        }

        // Decide the ranking window
        let from;
        let mode;
        const thisWeekStart = startOfWeek(new Date());
        const startDate = semester.start_date ? new Date(semester.start_date) : null;
        const endDate = startDate && semester.weeks
            ? new Date(startDate.getTime() + Number(semester.weeks) * 7 * 24 * 60 * 60 * 1000)
            : null;

        if (startDate && endDate && thisWeekStart >= startOfWeek(startDate) && thisWeekStart <= endDate) {
            from = thisWeekStart;               // this week (Monday)
            mode = 'this-week';
        } else {
            // Legacy/old semester: anchor on its last completed-session week
            const [[{ lastDate }]] = await connection.query(`
                SELECT MAX(s.session_date) AS lastDate
                FROM sessions s
                JOIN session_details sd ON sd.session_id = s.session_id
                WHERE s.semester_id = :semester_id AND sd.session_status = 'completed'
            `, { replacements: { semester_id } });

            if (lastDate) {
                from = startOfWeek(new Date(lastDate));   // last active week (Monday)
            } else if (endDate) {
                from = startOfWeek(new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000));
            } else {
                from = null;
            }
            mode = 'last-week';
        }

        if (!from) {
            return res.json({ tutors: [], window: { mode, from: null, to: null }, semester_code: semester.semester_code });
        }
        const to = new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000); // exclusive upper bound

        const [rows] = await connection.query(`
            SELECT CONCAT(u.first_name, ' ', u.last_name) AS tutor_name,
                   SUM(s.session_totalhours) AS total_hours,
                   COUNT(*) AS sessions_done
            FROM sessions s
            JOIN session_details sd ON sd.session_id = s.session_id
            JOIN tutors t ON t.tutor_id = s.tutor_id
            JOIN users u ON u.user_id = t.user_id
            WHERE s.semester_id = :semester_id
              AND sd.session_status = 'completed'
              AND s.session_date >= :from AND s.session_date < :to
            GROUP BY u.user_id, tutor_name
            ORDER BY total_hours DESC
            LIMIT :limit
        `, { replacements: { semester_id, from: toMySQLDate(from), to: toMySQLDate(to), limit } });

        res.json({
            tutors: rows,
            window: {
                mode,
                from: toMySQLDate(from),
                to: toMySQLDate(new Date(to.getTime() - 24 * 60 * 60 * 1000)) // inclusive Sunday
            },
            semester_code: semester.semester_code
        });
    }
    catch(e) {
        if (e.message === 'No current semester is set') {
            return res.status(404).json({ error: e.message });
        }
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}
