import {DataTypes} from "sequelize"
import connection from "../connection.js"
import User from "./User.js"

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
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User, 
            key: "user_id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    }
}, {
    tableName: 'contacts',
    timestamps: false
})

Contact.belongsTo(User, {
    foreignKey: {
        field: 'user_id'
    }
})

export default Contact