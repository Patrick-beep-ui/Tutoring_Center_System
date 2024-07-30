import {DataTypes} from "sequelize"
import connection from "../connection.js"
import SessionDetail from "./SessionDetail.js"
import User from "./User.js"

const SessionRating = connection.define('SessionRating', {
    rating_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    session_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    rating: {
        type: DataTypes.TINYINT,
        allowNull: false
    }, 
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'session_ratings',
    timestamps: false,
    createdAt: 'created_at'
})

SessionRating.belongsTo(SessionDetail, {
    foreignKey: {
        field: 'session_id',
        allowNull: false
    }
})

SessionRating.belongsTo(User, {
    foreignKey: {
        field: 'student_id',
        allowNull: false
    }
})

export default SessionRating