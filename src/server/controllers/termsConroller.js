import Semester from "../models/Semester.js";

export const getSemesters = async (req, res) => {
    try {
        const terms = await Semester.findAll()
        res.status(200).json({
            terms
        })
    }
    catch(e) {
        console.error(e)
    }
}

export const addSemester = async (req, res) => {
    try {
        const term = new Semester({
            semester_type: req.body.semester_type,
            semester_code: req.body.semester_code,
            semester_year: req.body.semester_year,
            weeks: req.body.weeks
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