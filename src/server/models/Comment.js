import {DataTypes} from "sequelize"
import connection from "../connection.js"
import User from "./User.js";
import TutorSession from "./TutorSession.js";

const Comment = connection.define('Comment', {
    comment_id: {
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
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }, 
    content: {
        type: DataTypes.STRING
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'comments',
    timestamps: false,
    createdAt: 'created_at'
})

Comment.belongsTo(TutorSession, {
    foreignKey: {
        field: 'session_id',
        allowNull: true
    }
})

Comment.belongsTo(User, {
    foreignKey: {
        field: 'user_id',
        allowNull: true
    }
})

export default Comment