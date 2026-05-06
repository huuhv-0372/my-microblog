import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshTokens1746000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE refresh_tokens (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        token_hash VARCHAR(255) NOT NULL,
        user_id INT UNSIGNED NOT NULL,
        expires_at DATETIME NOT NULL,
        revoked TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_refresh_tokens_hash (token_hash),
        INDEX idx_refresh_tokens_user_id (user_id),
        CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE refresh_tokens;`);
  }
}
