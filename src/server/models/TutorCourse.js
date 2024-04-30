import {DataTypes} from "sequelize"
import connection from "../connection.js";
import Tutor from "./Tutor.js";
import Course from "./Course.js";

const TutorCourse = connection.define('TutorCourse', {
    tutor_course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true, 
        autoIncrement: true
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    tutor_id: {
        type: DataTypes.STRING,
        allowNull: true
    }
    
}, {
    tableName: 'tutor_courses',
    timestamps: false
})

TutorCourse.belongsTo(Tutor, {
    foreignKey: {
        field: 'tutor_id',
        allowNull: true
    }
});

TutorCourse.belongsTo(Course, {
    foreignKey: {
        field: 'course_id',
        allowNull: true
    }
});

export default TutorCourse;