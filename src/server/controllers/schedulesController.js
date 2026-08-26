import Schedule from '../models/Schedule.js';
import Tutor from '../models/Tutor.js';
import { sanitizeUserInput } from '../utils/sanitize.js';
import { resolveSemesterId } from '../utils/currentSemester.js';

export const getSchedules = async (req, res) => {
    const { tutor_id } = req.params;
    try {
        const semester_id = await resolveSemesterId(req.query.semester_id);
        const schedules = await Schedule.findAll({
            where: { user_id: tutor_id, semester_id },
        });
        res.json({schedules});
    } catch (error) {
        if (error.message === 'No current semester is set') {
            return res.status(404).json({ error: error.message });
        }
        console.error('Error fetching schedules:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const updateSchedules = async (req, res) => {
    try {
        const tutor_id = sanitizeUserInput(req.params.tutor_id);
        const { schedules } = req.body;
        const semester_id = await resolveSemesterId(req.body.semester_id);

        if (!Array.isArray(schedules)) {
            return res.status(400).json({ error: 'schedules must be an array' });
        }

        const tutor = await Tutor.findByPk(tutor_id);
        if (!tutor) {
            return res.status(404).json({ error: 'Tutor not found' });
        }

        await Schedule.destroy({
            where: { user_id: tutor_id, semester_id }
        });

        if (schedules.length > 0) {
            const records = [];
            for (const block of schedules) {
                if (!block.days || !Array.isArray(block.days) || !block.start_time || !block.end_time) {
                    continue;
                }
                for (const day of block.days) {
                    records.push({
                        user_id: tutor_id,
                        day,
                        start_time: block.start_time,
                        end_time: block.end_time,
                        semester_id
                    });
                }
            }
            if (records.length > 0) {
                await Schedule.bulkCreate(records);
            }
        }

        const updatedSchedules = await Schedule.findAll({
            where: { user_id: tutor_id, semester_id },
            order: [['day', 'ASC'], ['start_time', 'ASC']]
        });

        res.status(200).json({
            msg: 'Schedules updated successfully',
            schedules: updatedSchedules
        });
    } catch (e) {
        if (e.message === 'No current semester is set') {
            return res.status(404).json({ error: e.message });
        }
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const clearSchedules = async (req, res) => {
    try {
        const tutor_id = sanitizeUserInput(req.params.tutor_id);
        const semester_id = await resolveSemesterId(req.query.semester_id ?? req.body?.semester_id);

        const tutor = await Tutor.findByPk(tutor_id);
        if (!tutor) {
            return res.status(404).json({ error: 'Tutor not found' });
        }

        await Schedule.destroy({
            where: { user_id: tutor_id, semester_id }
        });

        res.status(200).json({
            msg: 'Schedules cleared successfully',
            schedules: []
        });
    } catch (e) {
        if (e.message === 'No current semester is set') {
            return res.status(404).json({ error: e.message });
        }
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}
