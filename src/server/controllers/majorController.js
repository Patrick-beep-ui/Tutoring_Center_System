import Major from "../models/Major.js";

export const getMajors = async (req, res) => {
    try {
        const majors = await Major.findAll()
        res.status(200).json({
            majors
        })
    }
    catch(e) {
        console.error(e);
    }
}

export const addMajor = async (req, res) => {
    try {
        const major = new Major({
            major_name: req.body.major_name
        })

        await major.save()

        res.status(201).json({
            msg: 'Major added successfully',
            major
        });
        
    } catch (e) {
        if (e.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ msg: 'This major already exists' });
        }
        console.error(e);
        res.status(500).json({ msg: 'An error occurred while adding the major' });
    }
    
}