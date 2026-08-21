import Semester from "../models/Semester.js";
import TutorSession from "../models/TutorSession.js";
import connection from "../connection.js";

export const getSemesters = async (req, res) => {
    try {
        const terms = await Semester.findAll({
            order: [["semester_year", "DESC"], ["semester_id", "DESC"]]
        })
        res.status(200).json({
            terms
        })
    }
    catch(e) {
        console.error(e)
        res.status(500).json({ msg: 'An error occurred while fetching semesters' });
    }
}

export const addSemester = async (req, res) => {
    try {
        const term = new Semester({
            semester_type: req.body.semester_type,
            semester_code: req.body.semester_code,
            semester_year: req.body.semester_year,
            weeks: req.body.weeks,
            start_date: req.body.start_date || null
        })

        await term.save();

        res.status(200).json({
            msg: 'Term saved successfully',
            term
        });
    }
    catch(e) {
        if (e.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ msg: 'This semester already exists' });
        }
        console.error(e)
        res.status(500).json({ msg: 'An error occurred while adding the semester' });
    }
}

export const getCurrentSemester = async (req, res) => {
    try {
        const currentSemester = await Semester.findOne({
            where: {
                is_current: true
            }
        });

        if (!currentSemester) {
            return res.status(404).json({ msg: 'No current semester found' });
        }

        res.status(200).json({
            currentSemester
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: 'Server error' });
    }
}

export const setCurrentSemester = async (req, res) => {
    const t = await connection.transaction();
    try {
        const { semester_id } = req.params;

        const term = await Semester.findByPk(semester_id, { transaction: t });
        if (!term) {
            await t.rollback();
            return res.status(404).json({ msg: 'Semester not found' });
        }

        if (term.is_current) {
            await t.rollback();
            return res.status(400).json({ msg: 'This semester is already the current one' });
        }

        await Semester.update(
            { is_current: false },
            { where: { is_current: true }, transaction: t }
        );

        term.is_current = true;
        await term.save({ transaction: t });

        await t.commit();

        res.status(200).json({
            msg: `${term.semester_type} ${term.semester_year} is now the current semester`,
            term
        });
    } catch (e) {
        await t.rollback();
        console.error(e);
        res.status(500).json({ msg: 'An error occurred while setting the current semester' });
    }
}

export const deleteSemester = async (req, res) => {
    try {
        const { semester_id } = req.params;

        const term = await Semester.findByPk(semester_id);
        if (!term) {
            return res.status(404).json({ msg: 'Semester not found' });
        }

        if (term.is_current) {
            return res.status(400).json({ msg: 'Cannot delete the current semester. Set another semester as current first.' });
        }

        const sessionCount = await TutorSession.count({ where: { semester_id } });
        if (sessionCount > 0) {
            return res.status(400).json({ msg: `Cannot delete this semester: it has ${sessionCount} session(s) recorded. Historical data must be preserved.` });
        }

        await term.destroy();

        res.status(200).json({ msg: 'Semester deleted successfully' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: 'An error occurred while deleting the semester' });
    }
}
