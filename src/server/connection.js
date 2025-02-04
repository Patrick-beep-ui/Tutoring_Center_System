import {Sequelize} from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const connection = new Sequelize(process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql"
});

const testConnection = async () => {
    try {
        await connection.authenticate();
        console.log("Authenticated successfully")
    }
    catch(err) {
        console.error('Unable to connect to the database: ' + err.message)
    }
}

testConnection();

export default connection