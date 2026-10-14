import { DataTypes } from "sequelize";
import connection from "../connection.js";

const Announcement = connection.define('Announcement', {
    announcement_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    audience: {
        type: DataTypes.ENUM('all', 'students', 'tutors'),
        allowNull: false,
        defaultValue: 'all',
    },
    semester_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    author_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    published_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'announcements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default Announcement;
