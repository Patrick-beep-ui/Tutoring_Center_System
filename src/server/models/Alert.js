import { DataTypes } from "sequelize";
import connection from "../connection.js";

const Alert = connection.define('Alert', {
    alert_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    semester_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    source: {
        type: DataTypes.ENUM('activity', 'rule', 'manual'),
        allowNull: false,
        defaultValue: 'activity',
    },
    message: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('unread', 'read', 'pending'),
        allowNull: false,
        defaultValue: 'unread',
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'alerts',
    timestamps: false,
});

export default Alert;
