export default async function up(connection) {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS announcements (
            announcement_id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            body TEXT NOT NULL,
            audience ENUM('all', 'students', 'tutors') NOT NULL DEFAULT 'all',
            semester_id INT NULL,
            author_id INT NOT NULL,
            published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_announcements_semester
                FOREIGN KEY (semester_id) REFERENCES semester(semester_id)
                ON DELETE SET NULL ON UPDATE CASCADE,
            CONSTRAINT fk_announcements_author
                FOREIGN KEY (author_id) REFERENCES users(user_id)
                ON DELETE RESTRICT ON UPDATE CASCADE,
            INDEX idx_announcements_visibility (semester_id, audience, expires_at),
            INDEX idx_announcements_published_at (published_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
}
