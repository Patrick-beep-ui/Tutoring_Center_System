export default async function up(connection) {
    // Add session_type to session_details
    try {
        await connection.query(`
            ALTER TABLE session_details
            ADD COLUMN IF NOT EXISTS session_type ENUM('individual','group') NOT NULL DEFAULT 'individual'
            AFTER session_status
        `);
    } catch (err) {
        // MySQL < 8 may not support IF NOT EXISTS on ALTER in some cases; fallback
        try {
            await connection.query(`
                ALTER TABLE session_details
                ADD COLUMN session_type ENUM('individual','group') NOT NULL DEFAULT 'individual'
                AFTER session_status
            `);
        } catch (e) {
            if (!e.message.includes('Duplicate column name')) {
                throw e;
            }
        }
    }

    // Backfill session_details.session_type to 'individual' where null (safety)
    await connection.query(`
        UPDATE session_details
        SET session_type = 'individual'
        WHERE session_type IS NULL
    `);

    // Create session_students table
    await connection.query(`
        CREATE TABLE IF NOT EXISTS session_students (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id INT NOT NULL,
            student_id VARCHAR(50) NOT NULL,
            user_id INT NULL,
            feedback TEXT NULL,
            CONSTRAINT fk_session_students_session
                FOREIGN KEY (session_id)
                REFERENCES sessions(session_id)
                ON DELETE CASCADE
                ON UPDATE CASCADE,
            CONSTRAINT fk_session_students_user
                FOREIGN KEY (user_id)
                REFERENCES users(user_id)
                ON DELETE SET NULL
                ON UPDATE CASCADE,
            UNIQUE KEY uq_session_student (session_id, student_id),
            INDEX idx_session_students_student_id (student_id)
        )
    `);

    // Backfill session_students from existing sessions
    await connection.query(`
        INSERT IGNORE INTO session_students (session_id, student_id, user_id, feedback)
        SELECT
            s.session_id,
            s.student_id,
            u.user_id,
            s.feedback
        FROM sessions s
        LEFT JOIN users u ON u.ku_id = s.student_id
        WHERE s.student_id IS NOT NULL AND s.student_id <> ''
    `);

    // Make sessions.student_id nullable for group compatibility
    try {
        await connection.query(`
            ALTER TABLE sessions
            MODIFY COLUMN student_id VARCHAR(50) NULL
        `);
    } catch (e) {
        // ignore if already nullable
    }
}
