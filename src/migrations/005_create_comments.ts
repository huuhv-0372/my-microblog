import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateComments1746000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE comments (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        body TEXT NOT NULL,
        status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
        post_id INT UNSIGNED NOT NULL,
        user_id INT UNSIGNED NULL DEFAULT NULL,
        display_name VARCHAR(100) NULL DEFAULT NULL,
        email VARCHAR(255) NULL DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_comments_post_status (post_id, status),
        INDEX idx_comments_user_id (user_id),
        CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE comments;`);
  }
}
