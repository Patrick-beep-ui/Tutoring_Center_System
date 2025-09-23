import {DataTypes} from "sequelize"
import connection from "../connection.js"
import Major from "./Major.js";
import TutorCourse from "./TutorCourse.js";

const Course = connection.define('Course', {
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true, 
        autoIncrement: true 
    },
    course_name: {
        type: DataTypes.STRING,
        allowNull: false
    }, 
    course_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    major_id: {
        type: DataTypes.INTEGER,
        allowNull: true, 
        references: {
            model: Major,
            key: 'major_id'
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    },
    credits: {
        type: DataTypes.INTEGER,
        allowNull: true 
    }
}, {
    tableName: 'courses',
    timestamps: false
})

Course.hasMany(TutorCourse, {
    foreignKey: "course_id"
});

export default Course