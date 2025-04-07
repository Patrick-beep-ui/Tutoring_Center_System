import SessionFeedback from "../models/SessionFeedback.js";

export const createFeedback = async (req, res) => {
    const { sessionId, rating, feedback, user_id } = req.body;

    try {
        await SessionFeedback.create({
        session_id: sessionId,
        user_id: user_id, 
        rating: rating,
        feedback_text: feedback,
        });

        res.status(200).send('Thank you for your feedback!');

    } catch (error) {
        console.error('Error saving feedback:', error);
        res.status(500).send('Internal Server Error');
    }
}