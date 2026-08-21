import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const CURRENT_SEMESTER_FALLBACK = 2;

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3307,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'patrick18',
        database: process.env.DB_NAME || 'tutoring_center',
        multipleStatements: true
    });

    try {
        // 1. Create semester_courses junction table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS semester_courses (
                semester_course_id INT NOT NULL AUTO_INCREMENT,
                semester_id INT NOT NULL,
                course_id INT NOT NULL,
                PRIMARY KEY (semester_course_id),
                UNIQUE KEY unique_semester_course (semester_id, course_id),
                CONSTRAINT fk_sc_semester FOREIGN KEY (semester_id) REFERENCES semester(semester_id) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT fk_sc_course FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);
        console.log('[OK] semester_courses table created');

        // 2. Add semester_id to user_courses
        const [ucCol] = await connection.query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_courses' AND COLUMN_NAME = 'semester_id'
        `);
        if (ucCol.length === 0) {
            const [[cur]] = await connection.query(`SELECT semester_id FROM semester WHERE is_current = TRUE LIMIT 1`);
            const sid = cur ? cur.semester_id : CURRENT_SEMESTER_FALLBACK;
            await connection.query(`ALTER TABLE user_courses ADD COLUMN semester_id INT NOT NULL DEFAULT ${sid}`);
            await connection.query(`
                ALTER TABLE user_courses ADD CONSTRAINT fk_uc_semester
                FOREIGN KEY (semester_id) REFERENCES semester(semester_id) ON DELETE CASCADE ON UPDATE CASCADE
            `);
            console.log(`[OK] user_courses.semester_id added (backfilled to semester ${sid})`);
        } else {
            console.log('[SKIP] user_courses.semester_id already exists');
        }

        // 3. Add semester_id to schedules
        const [scCol] = await connection.query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'schedules' AND COLUMN_NAME = 'semester_id'
        `);
        if (scCol.length === 0) {
            const [[cur]] = await connection.query(`SELECT semester_id FROM semester WHERE is_current = TRUE LIMIT 1`);
            const sid = cur ? cur.semester_id : CURRENT_SEMESTER_FALLBACK;
            await connection.query(`ALTER TABLE schedules ADD COLUMN semester_id INT NOT NULL DEFAULT ${sid}`);
            await connection.query(`
                ALTER TABLE schedules ADD CONSTRAINT fk_sched_semester
                FOREIGN KEY (semester_id) REFERENCES semester(semester_id) ON DELETE CASCADE ON UPDATE CASCADE
            `);
            console.log(`[OK] schedules.semester_id added (backfilled to semester ${sid})`);
        } else {
            console.log('[SKIP] schedules.semester_id already exists');
        }

        // 4. Backfill semester_courses from historical activity (per-semester accuracy)
        const [result] = await connection.query(`
            INSERT IGNORE INTO semester_courses (semester_id, course_id)
            SELECT DISTINCT uc.semester_id, uc.course_id FROM user_courses uc
            UNION
            SELECT DISTINCT s.semester_id, s.course_id FROM sessions s
        `);
        console.log(`[OK] semester_courses backfilled (${result.affectedRows} rows inserted)`);

        // Summary
        const [[counts]] = await connection.query(`
            SELECT
                (SELECT COUNT(*) FROM semester_courses) AS semester_courses,
                (SELECT COUNT(*) FROM user_courses WHERE semester_id IS NOT NULL) AS user_courses_scoped,
                (SELECT COUNT(*) FROM schedules WHERE semester_id IS NOT NULL) AS schedules_scoped
        `);
        console.log('\n=== Migration summary ===');
        console.log(JSON.stringify(counts, null, 2));
    } finally {
        await connection.end();
    }
}

migrate()
    .then(() => { console.log('\nMigration 001 completed successfully'); process.exit(0); })
    .catch((e) => { console.error('Migration failed:', e); process.exit(1); });
