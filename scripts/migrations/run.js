import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3308),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS,
    database: process.env.DB_NAME || 'tutoring_center',
    multipleStatements: true
};

async function ensureMigrationTable(connection) {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            migration_name VARCHAR(255) NOT NULL UNIQUE,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

async function getAppliedMigrations(connection) {
    const [rows] = await connection.query(`
        SELECT migration_name
        FROM schema_migrations
        ORDER BY migration_name
    `);

    return new Set(rows.map(row => row.migration_name));
}

async function getMigrationFiles() {
    const files = await fs.readdir(__dirname);

    return files
        .filter(file => /^\d{3}_.+\.js$/.test(file))
        .sort();
}

async function run() {
    const connection = await mysql.createConnection(connectionConfig);

    try {
        console.log('\n=== Database migrations ===\n');

        await ensureMigrationTable(connection);

        const appliedMigrations = await getAppliedMigrations(connection);
        const migrationFiles = await getMigrationFiles();

        if (migrationFiles.length === 0) {
            console.log('No migrations found.');
            return;
        }

        for (const file of migrationFiles) {
            if (appliedMigrations.has(file)) {
                console.log(`[SKIP] ${file}`);
                continue;
            }

            console.log(`[RUN] ${file}`);

            const migrationPath = path.join(__dirname, file);
            const migrationModule = await import(
                pathToFileURL(migrationPath).href
            );

            if (typeof migrationModule.default !== 'function') {
                throw new Error(
                    `Migration ${file} does not export a default function`
                );
            }

            await migrationModule.default(connection);

            await connection.query(
                `
                    INSERT INTO schema_migrations (migration_name)
                    VALUES (?)
                `,
                [file]
            );

            console.log(`[DONE] ${file}\n`);
        }

        console.log('=== All migrations are up to date ===\n');

    } finally {
        await connection.end();
    }
}

run().catch(error => {
    console.error('\nMigration runner failed:');
    console.error(error);
    process.exit(1);
});