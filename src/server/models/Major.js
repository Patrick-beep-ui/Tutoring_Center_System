import { DataTypes } from "sequelize";
import connection from "../connection.js";

const Major = connection.define('Major', {
    major_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true, 
        autoIncrement: true
    }, 
    major_name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: false
});

export default Major;
