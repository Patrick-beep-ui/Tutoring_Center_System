import User from "../models/User.js";
import Contact from "../models/Contact.js";

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(201);
        res.json({
            users
        })
    }
    catch(e) {
        console.error(e)
    }
}

export const getUser = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { user_id: req.params.user_id },
            include: [
                {
                    model: Contact,
                    attributes: ["phone_number"], 
                    required: false 
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ user });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Server error" });
    }
};