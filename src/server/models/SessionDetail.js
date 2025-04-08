import { DataTypes } from "sequelize";
import connection from "../connection.js";

const SessionDetail = connection.define('SessionDetail', {
    session_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    session_time: {
        type: DataTypes.TIME,
    }, 
    session_status: {
        type: DataTypes.ENUM('scheduled', 'completed', 'pending', 'canceled')
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }, 
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'session_details',
    timestamps: false
});

export default SessionDetail;
