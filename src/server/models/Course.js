import {DataTypes} from "sequelize"
import connection from "../connection.js"

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
        allowNull: false
    }
}, {
    tableName: 'courses',
    timestamps: false
})

export default Course