import { DataTypes } from "sequelize";
import connection from "../connection.js";
import User from "./User.js";
import Major from "./Major.js";

const Tutor = connection.define('Tutor', {
    tutor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true, 
        autoIncrement: true 
    }, 
    user_id: {
        type: DataTypes.INTEGER // Remove allowNull: false
    },
    official_schedule: {
        type: DataTypes.STRING,
        allowNull: false
    },
    major_id: {
        type: DataTypes.INTEGER // Remove allowNull: false
    }
}, {
    tableName: 'tutors',
    timestamps: false
});

Tutor.belongsTo(User, {
    foreignKey: 'user_id' // Adjust the foreignKey option
});

Tutor.belongsTo(Major, {
    foreignKey: 'major_id' // Adjust the foreignKey option
});

export default Tutor;
