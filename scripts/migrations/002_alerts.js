export default async function migrate(connection) {
    // 1. alerts_categories table
    await connection.query(`
        CREATE TABLE IF NOT EXISTS alerts_categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            category_name VARCHAR(100) NOT NULL,
            description TEXT,
            severity_level ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
            target_role ENUM('admin','dev','tutor','student') NOT NULL DEFAULT 'admin',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_alerts_categories (category_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('[OK] alerts_categories table ready');

    // Alerts_categories must be uniquely-keyed by category_name so the seed
    // below is idempotent (INSERT IGNORE dedupes on a unique index).
    await connection.query(`
        ALTER TABLE alerts_categories
        ADD UNIQUE INDEX uq_alerts_categories (category_name)
    `).catch((e) => {
        if (e.code === 'ER_DUP_KEYNAME') {
            console.log('[SKIP] uq_alerts_categories already exists');
        } else {
            throw e;
        }
    });

    // 2. alerts table
    await connection.query(`
        CREATE TABLE IF NOT EXISTS alerts (
            alert_id INT AUTO_INCREMENT PRIMARY KEY,
            category_id INT NOT NULL,
            user_id INT NULL,
            semester_id INT NULL,
            source ENUM('activity','rule','manual') NOT NULL DEFAULT 'activity',
            message VARCHAR(255) NOT NULL,
            status ENUM('unread','read','pending') NOT NULL DEFAULT 'unread',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_alerts_category FOREIGN KEY (category_id) REFERENCES alerts_categories(id) ON DELETE CASCADE,
            CONSTRAINT fk_alerts_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            CONSTRAINT fk_alerts_semester FOREIGN KEY (semester_id) REFERENCES semester(semester_id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('[OK] alerts table ready');

    // 3. Seed alert categories (idempotent)
    const categories = [
        ['unaccepted_session', 'Tutor has not accepted a scheduled session within the allowed time', 'high', 'tutor'],
        ['new_tutor_registered', 'A new tutor account was created', 'low', 'admin'],
        ['high_cancellation', 'A program has an abnormally high session cancellation rate', 'high', 'admin'],
        ['low_attendance', 'A tutor or student has a low attendance rate', 'medium', 'tutor'],
        ['session_completed', 'A tutoring session was marked as completed', 'low', 'admin'],
        ['session_scheduled', 'A new tutoring session was scheduled', 'low', 'admin'],
        ['comment_added', 'A comment was added to a session', 'low', 'admin'],
        ['session_canceled', 'A session was canceled', 'medium', 'admin'],
        ['weekly_report_ready', 'Weekly performance report is available', 'medium', 'admin'],
        ['feedback_received', 'A student provided feedback on a session', 'low', 'tutor']
    ];

    let seeded = 0;
    for (const [name, desc, sev, role] of categories) {
        const [res] = await connection.query(
            `INSERT IGNORE INTO alerts_categories (category_name, description, severity_level, target_role)
             VALUES (?, ?, ?, ?)`,
            [name, desc, sev, role]
        );
        seeded += res.affectedRows;
    }
    console.log(`[OK] alert categories seeded (${seeded} inserted)`);

    // Summary
    const [[counts]] = await connection.query(`
        SELECT
            (SELECT COUNT(*) FROM alerts_categories) AS categories,
            (SELECT COUNT(*) FROM alerts) AS alerts
    `);
    console.log('\n=== Migration summary ===');
    console.log(JSON.stringify(counts, null, 2));
}
