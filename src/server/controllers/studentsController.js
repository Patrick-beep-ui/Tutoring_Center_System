import User from "../models/User.js";
import connection from "../connection.js";

export const getStudents = async (req, res) => {
    try {
        const students = await connection.query(
            `SELECT 
                CONCAT(u.first_name, ' ', u.last_name) AS student_name, 
                u.email AS student_email, 
                u.ku_id AS student_id, 
                m.major_name AS student_major, 
                GROUP_CONCAT(DISTINCT c.course_code ORDER BY c.course_code SEPARATOR ', ') AS user_courses,
                GROUP_CONCAT(DISTINCT c.course_name ORDER BY c.course_name SEPARATOR ', ') AS student_courses_names,
                u.user_id AS id
            FROM 
                users u 
            JOIN 
                majors m ON u.major_id = m.major_id
            LEFT JOIN 
                user_courses tc ON u.user_id = tc.user_id AND tc.status = 'Received'  
            LEFT JOIN 
                courses c ON c.course_id = tc.course_id  -- Change to LEFT JOIN to include students without courses
            WHERE 
                u.role = 'student'
            GROUP BY 
                student_name, student_email, student_id, student_major, id
            ORDER BY 
                student_id;`,
            {
                type: connection.QueryTypes.SELECT,
            }
        );

        res.json({
            students
        });
    }
    catch(e) {
        console.error(e);
    }
}