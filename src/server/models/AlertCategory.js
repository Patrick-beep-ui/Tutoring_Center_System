import { DataTypes } from "sequelize";
import connection from "../connection.js";

const AlertCategory = connection.define('AlertCategory', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    category_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    severity_level: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: false,
        defaultValue: 'medium',
    },
    target_role: {
        type: DataTypes.ENUM('admin', 'dev', 'tutor', 'student'),
        allowNull: false,
        defaultValue: 'admin',
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'alerts_categories',
    timestamps: false,
});

export default AlertCategory;
