import { DataTypes } from "sequelize";
import connection from "../connection.js";
import TutorSession from "./TutorSession.js";
import User from "./User.js";

const SessionFeedback = connection.define("SessionFeedback", {
    feedback_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    session_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: TutorSession, // Referencia a la tabla sessions
            key: "session_id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User, // Referencia a la tabla users
            key: "user_id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    },
    rating: {
        type: DataTypes.TINYINT,
        allowNull: true
    },
    feedback_text: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "session_feedback",
    timestamps: false
});

// Definir relaciones
SessionFeedback.belongsTo(TutorSession, { foreignKey: "session_id" });
SessionFeedback.belongsTo(User, { foreignKey: "user_id" });

TutorSession.hasMany(SessionFeedback, { foreignKey: "session_id" });
User.hasMany(SessionFeedback, { foreignKey: "user_id" });

export default SessionFeedback;
