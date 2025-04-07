import Schedule from '../models/Schedule.js';

export const getSchedules = async (req, res) => {
    const { tutor_id } = req.params;
    try {
        const schedules = await Schedule.findAll({
            where: { user_id: tutor_id },
        });
        res.json(schedules);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}