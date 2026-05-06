import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePosts1746000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE posts (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(280) NOT NULL,
        body TEXT NOT NULL,
        status ENUM('draft', 'pending_review', 'published', 'rejected') NOT NULL DEFAULT 'draft',
        author_id INT UNSIGNED NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        published_at DATETIME NULL DEFAULT NULL,
        UNIQUE KEY uq_posts_slug (slug),
        INDEX idx_posts_status (status),
        INDEX idx_posts_author_id (author_id),
        INDEX idx_posts_published_at (published_at),
        CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE posts;`);
  }
}
