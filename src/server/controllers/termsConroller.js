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
        console.error(e)
    }
}