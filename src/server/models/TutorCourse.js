import {DataTypes} from "sequelize"
import connection from "../connection.js";
import User from "./User.js";

const TutorCourse = connection.define('TutorCourse', {
    tutor_course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true, 
        autoIncrement: true
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Course',
            key: "course_id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User, 
            key: "user_id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    },
    status: {
        type: DataTypes.ENUM("Given", "Received"),
        allowNull: true
    },
    semester_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Semester',
            key: "semester_id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    }
}, {
    tableName: 'user_courses',
    timestamps: false
})

export default TutorCourse;