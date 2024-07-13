import {DataTypes} from "sequelize"
import connection from "../connection.js"

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
        type: DataTypes.ENUM('tutor', 'student', 'faculty')
    }, 
    password_hash: {
        type: DataTypes.STRING,
        allowNull: true
    }, 
    is_admin: {
        type: DataTypes.ENUM('yes', 'no')
    }, 
    ku_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'users',
    timestamps: false
})


export default User