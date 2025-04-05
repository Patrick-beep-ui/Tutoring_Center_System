import { DataTypes } from "sequelize";
import connection from "../connection.js";
import User from "./User.js";
import TutorSession from "./TutorSession.js";
import Major from "./Major.js"; // ✅ Move this import AFTER defining Tutor

const Tutor = connection.define('Tutor', {
    tutor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true, 
        autoIncrement: true 
    }, 
    user_id: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'tutors',
    timestamps: false
});

Tutor.belongsTo(User, { foreignKey: 'user_id' });
Tutor.hasMany(TutorSession, { foreignKey: 'tutor_id' });

export default Tutor;
