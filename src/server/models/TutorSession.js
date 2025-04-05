import { DataTypes } from "sequelize";
import connection from "../connection.js";
import Tutor from "./Tutor.js";
import Course from "./Course.js";
import Semester from "./Semester.js";

const TutorSession = connection.define('TutorSession', {
    session_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true, 
        autoIncrement: true 
    }, 
    tutor_id: {
        type: DataTypes.INTEGER
    },
    student_id: {
        type: DataTypes.STRING
    }, 
    course_id: {
        type: DataTypes.INTEGER
    }, 
    semester_id: {
        type: DataTypes.INTEGER
    },
    session_date: {
        type: DataTypes.DATE
    }, 
    session_totalhours: {
        type: DataTypes.DECIMAL,
    }, 
    feedback: {
        type: DataTypes.STRING,
        allowNull: true
    },
    topics: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'sessions',
    timestamps: false
});

// Associations will be defined in a separate file
export default TutorSession;
