import {DataTypes} from "sequelize"
import connection from "../connection.js"
import Tutor from "./Tutor.js"

const Contact = connection.define('Contact', {
    phone_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true, 
        autoIncrement: true 
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: true
    }, 
    tutor_id: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'contacts',
    timestamps: false
})

Contact.belongsTo(Tutor, {
    foreignKey: {
        field: 'tutor_id'
    }
})

export default Contact