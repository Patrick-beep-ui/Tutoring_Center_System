import {DataTypes} from "sequelize"
import connection from "../connection.js"
import Major from "./Major.js"

const User = connection.define('User', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true, 
        autoIncrement: true
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false

    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    }, 
    role: {
        type: DataTypes.ENUM('tutor', 'student', 'admin')
    }, 
    password_hash: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ku_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    major_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Major,
            key: "major_id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    }
}, {
    tableName: 'users',
    timestamps: false
})


export default User