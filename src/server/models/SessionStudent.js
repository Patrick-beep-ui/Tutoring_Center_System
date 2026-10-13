import { DataTypes } from "sequelize";
import connection from "../connection.js";
import TutorSession from "./TutorSession.js";
import User from "./User.js";

const SessionStudent = connection.define("SessionStudent", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    session_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: TutorSession,
            key: "session_id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    },
    student_id: {
        type: DataTypes.STRING,
        allowNull: false // KU ID
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: User,
            key: "user_id"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
    },
    feedback: {
        type: DataTypes.STRING,
        allowNull: true 
    }
}, {
    tableName: "session_students",
    timestamps: false,
    indexes: [
        { unique: true, fields: ["session_id", "student_id"] },
        { fields: ["student_id"] }
    ]
});

export default SessionStudent;
