import {DataTypes} from "sequelize"
import connection from "../connection.js"
import TutorSession from "./TutorSession.js"

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
        type: DataTypes.ENUM('scheduled', 'completed', 'pending')
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
        onUpdate: DataTypes.NOW,
    }
}, {
    tableName: 'session_details',
    timestamps: false, 
    createdAt: 'createdAt', 
    updatedAt: 'updatedAt',
})

SessionDetail.belongsTo(TutorSession, {
    foreignKey: {
        field: 'session_id',
        allowNull: true
    }
})

export default SessionDetail
