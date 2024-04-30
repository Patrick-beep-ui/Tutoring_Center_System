import {DataTypes} from "sequelize"
import connection from "../connection.js"
import User from "./User.js";
import Major from "./Major.js";

const Student = connection.define('Student', {
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true, 
        autoIncrement: true 
    }, 
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }, 
    major_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'students',
    timestamps: false
})

Student.belongsTo(User, {
    foreignKey: {
        field: 'user_id',
        allowNull: true
    }
});

Student.hasMany(Major, {
    foreignKey: {
        field: 'major_id',
        allowNull: true
    }
})

export default Student