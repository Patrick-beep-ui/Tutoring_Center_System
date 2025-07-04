import {DataTypes} from "sequelize"
import connection from "../connection.js"

const Semester = connection.define('Semester', {
    semester_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true, 
        autoIncrement: true
    }, 
    semester_type: {
        type: DataTypes.ENUM('Spring', 'Fall', 'Summer'),
        allowNull: false
    },
    semester_code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    semester_year: {
        type: DataTypes.STRING,
        allowNull: false
    }, 
    weeks: {
        type: DataTypes.INTEGER
    },
    is_current: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'semester',
    timestamps: false
})

export default Semester