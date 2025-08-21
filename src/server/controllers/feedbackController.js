import SessionFeedback from "../models/SessionFeedback.js";
import TutorSession from "../models/TutorSession.js";
import User from "../models/User.js";

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