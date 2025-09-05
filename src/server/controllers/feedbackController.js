import SessionFeedback from "../models/SessionFeedback.js";
import TutorSession from "../models/TutorSession.js";
import User from "../models/User.js";
import connection from "../connection.js";

export const createFeedback = async (req, res) => {
    const { sessionId, rating, feedback, user_id } = req.body;

    try {
        // Get the session to verify if the user is a student in that session
        const session = await TutorSession.findOne({
            where: {
                session_id: sessionId,
                student_id: user_id
            }
        });

        if (!session) {
            return res.status(404).send('Session not found');
        }
        
        const user = await User.findOne({
            where: {
                ku_id: user_id
            }
        })

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check if feedback already exists for this session and user
        const existingFeedback = await SessionFeedback.findOne({
            where: {
                session_id: sessionId,
                user_id: user.user_id
            }
        });

        if (existingFeedback) {
            return res.status(400).send('Feedback already submitted for this session by this user');
        }

        await SessionFeedback.create({
        session_id: sessionId,
        user_id: user.user_id,
        rating: rating,
        feedback_text: feedback,
        });

        res.status(200).send('Thank you for your feedback!');

    } catch (error) {
        console.error('Error saving feedback:', error);
        res.status(500).send('Internal Server Error');
    }
}

export const getFeedbacks = async (req, res) => {
    try {
        const feedbacks = await connection.query(
            `SELECT
            f.feedback_id as 'feedback_id', s.session_id as 'session_id', CONCAT(t.first_name, ' ', t.last_name) as 'tutor_name', CONCAT(st.first_name, ' ', st.last_name) as 'student_name', f.feedback_text as 'feedback_text', f.rating as 'rating', f.created_at as 'creation_date'
            FROM session_feedback f JOIN sessions s ON f.session_id = s.session_id
            JOIN users t ON s.tutor_id = t.user_id
            JOIN users st ON s.student_id = st.ku_id
            GROUP BY feedback_id, session_id, feedback_text, rating, creation_date
            ORDER BY feedback_id;`,
            { type: connection.QueryTypes.SELECT }
        )

        res.json({ feedbacks });
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        res.status(500).send('Internal Server Error');
    }
}