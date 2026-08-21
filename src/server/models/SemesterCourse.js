import {DataTypes} from "sequelize"
import connection from "../connection.js";

const SemesterCourse = connection.define('SemesterCourse', {
    semester_course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
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
    }
}, {
    tableName: 'semester_courses',
    timestamps: false
})

export default SemesterCourse;
