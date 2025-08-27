import Comment from "../models/Comment.js";
import connection from "../connection.js";
import {QueryTypes} from "sequelize";
import { sanitizeUserInput } from "../utils/sanitize.js";

export const getComments = async (req, res) => {
    try {
        const session_id = req.params.session_id
        const sanitizedSessionId = sanitizeUserInput(session_id);

        if (!Number.isInteger(Number(sanitizedSessionId))) {
            return res.status(400).json({ error: 'Invalid tutor ID' });
        } 

        if(session_id) {
            const comments = await connection.query(
                `SELECT c.comment_id, CONCAT(u.first_name, ' ', u.last_name) as 'student_name', 
                        c.content as 'comment', c.created_at as 'creation_date', u.user_id as 'user_id'
                 FROM comments c 
                 JOIN users u ON c.user_id = u.user_id
                 JOIN sessions s ON s.session_id = c.session_id
                 WHERE c.session_id = :session_id
                 GROUP BY c.comment_id, student_name, comment, u.user_id;`, 
                { 
                   type: QueryTypes.SELECT, 
                   replacements: { session_id: sanitizedSessionId }
                }
            );
            

            res.status(200).json({comments})
        }
    }
    catch(e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const addComment = async (req, res) => {
    try {
        const session_id = req.params.session_id
        const sanitizedSessionId = sanitizeUserInput(session_id);

        if (!Number.isInteger(Number(sanitizedSessionId))) {
            return res.status(400).json({ error: 'Invalid tutor ID' });
        }

        const comment = new Comment({
            session_id: session_id,
            user_id: req.body.user_id,
            content: req.body.content
        })

        await comment.save();

        const comments = await connection.query(`SELECT c.comment_id, CONCAT(u.first_name, ' ', u.last_name) as 'student_name', c.content as 'comment', c.created_at as 'creation_date', u.user_id as 'user_id'
            FROM comments c JOIN users u ON c.user_id = u.user_id
            JOIN sessions s ON s.session_id = c.session_id
            WHERE c.session_id = :session_id
            GROUP BY c.comment_id, student_name, comment, u.user_id;`, {
                type: QueryTypes.SELECT,
                replacements: { session_id: sanitizedSessionId }
            })

            res.status(200).json({comments})
    }
    catch(e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const deleteComment = async (req, res) => {
    try {
        const comment_id = req.params.comment_id

        const comment = await Comment.findByPk(comment_id);

        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
          }

        await comment.destroy();

        res.status(200).json({msg: 'Comment Deleted Successfully'});
    }
    catch(e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}