import {Sequelize} from "sequelize";

const connection = new Sequelize("tutoring_center", "root", "patrick18", {
    host: "localhost",
    port: 3307,
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