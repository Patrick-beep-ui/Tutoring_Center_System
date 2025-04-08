import User from "../models/User.js";
import Contact from "../models/Contact.js";
import Major from "../models/Major.js";
import connection from "../connection.js";
import {QueryTypes} from "sequelize";
import {sanitizeUserInput} from "../utils/sanitize.js";

//Function to sanitize input variables when using raw queries


export const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(201);
        res.json({
            users
        })
    }
    catch(e) {
        console.error(e)
    }
}

export const getUser = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { user_id: req.params.user_id },
            include: [
                {
                    model: Major,
                    attributes: ["major_name"],
                    required: false,
                },
            ],
        });
        

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ user });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Server error" });
    }
};

export const getUserById = async (req, res) => {
    try {
        const id  = req.params.user_id;
        const user = await User.findByPk(id, {
            include: [
                {
                    model: Contact,
                    attributes: ["phone_number"], 
                    required: false 
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ user });
    }
    catch(e) {
        console.error(e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const getUserCourses = async (req, res) => {
    try {
        const user_id = sanitizeUserInput(req.params.user_id);
        const ku_id = sanitizeUserInput(req.params.ku_id);

      const userCourses = await connection.query(
            `SELECT 
                c.course_id,
                c.course_code,
                c.course_name,
                COUNT(sd.session_id) AS qtyOfSessions
            FROM 
                user_courses uc
            JOIN 
                courses c ON uc.course_id = c.course_id
            LEFT JOIN 
                sessions s ON s.course_id = c.course_id AND s.student_id = :ku_id
            LEFT JOIN 
                session_details sd ON s.session_id = sd.session_id AND sd.session_status = 'completed'
            WHERE 
                uc.user_id = :user_id AND uc.status = 'Received'
            GROUP BY 
                c.course_id, c.course_code, c.course_name;`,
                {
                    replacements: { user_id: user_id, ku_id: ku_id },
                    type: QueryTypes.SELECT 
                }
      )
      res.status(200).json({ userCourses });
      
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };