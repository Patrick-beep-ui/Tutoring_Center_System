import {DataTypes} from "sequelize"
import connection from "../connection.js"

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
    }
}, {
    tableName: 'contacts',
    timestamps: false
})

export default Contact