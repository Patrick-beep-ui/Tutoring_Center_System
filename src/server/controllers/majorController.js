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
        res.status(500).json({ msg: 'An error occurred while fetching majors' });
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

export const updateMajor = async (req, res) => {
    try {
        const { major_id } = req.params;
        const { major_name } = req.body;

        if (!major_name || !major_name.trim()) {
            return res.status(400).json({ msg: 'Major name is required' });
        }

        const major = await Major.findByPk(major_id);
        if (!major) {
            return res.status(404).json({ msg: 'Major not found' });
        }

        major.major_name = major_name.trim();
        await major.save();

        res.status(200).json({ msg: 'Major updated successfully', major });
    } catch (e) {
        if (e.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ msg: 'A major with that name already exists' });
        }
        console.error(e);
        res.status(500).json({ msg: 'An error occurred while updating the major' });
    }
}

export const deleteMajor = async (req, res) => {
    try {
        const { major_id } = req.params;

        const major = await Major.findByPk(major_id);
        if (!major) {
            return res.status(404).json({ msg: 'Major not found' });
        }

        await major.destroy();

        res.status(200).json({ msg: 'Major deleted successfully' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: 'An error occurred while deleting the major' });
    }
}
