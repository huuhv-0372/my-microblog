import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedAdmin1746000000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const email = process.env.ADMIN_EMAIL ?? 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD ?? 'Admin1234!';
    const username = process.env.ADMIN_USERNAME ?? 'admin';
    const passwordHash = await bcrypt.hash(password, 12);

    await queryRunner.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES (?, ?, ?, 'admin')
       ON DUPLICATE KEY UPDATE role = 'admin'`,
      [username, email, passwordHash],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const email = process.env.ADMIN_EMAIL ?? 'admin@example.com';
    await queryRunner.query(`DELETE FROM users WHERE email = ?`, [email]);
  }
}
