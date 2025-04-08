import { DataTypes } from "sequelize";
import connection from "../connection.js";
import Tutor from "./Tutor.js";

const Schedule = connection.define("Schedule", {
    schedule_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    day: {
        type: DataTypes.ENUM("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"),
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Tutor, // Referencia a la tabla tutors
            key: "tutor_id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
}, {
    tableName: "schedules",
    timestamps: false
});

// Definir relación
Schedule.belongsTo(Tutor, { foreignKey: "user_id" });
Tutor.hasMany(Schedule, { foreignKey: "user_id" });

export default Schedule;
