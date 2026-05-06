import { MigrationInterface, QueryRunner } from 'typeorm';
import bcrypt from 'bcrypt';

export class SeedSampleData1746000000009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Seed a demo member user
    const memberHash = await bcrypt.hash('Member1234!', 12);
    await queryRunner.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ('demo', 'demo@example.com', ?, 'member')
       ON DUPLICATE KEY UPDATE id = id`,
      [memberHash],
    );

    // Get user IDs
    const adminRows = (await queryRunner.query(
      `SELECT id FROM users WHERE role = 'admin' LIMIT 1`,
    )) as { id: number }[];
    const memberRows = (await queryRunner.query(
      `SELECT id FROM users WHERE username = 'demo' LIMIT 1`,
    )) as { id: number }[];
    const adminId: number = adminRows[0].id;
    const memberId: number = memberRows[0].id;

    // Seed tags
    await queryRunner.query(`
      INSERT INTO tags (name, slug) VALUES
        ('NestJS',     'nestjs'),
        ('TypeScript', 'typescript'),
        ('Tutorial',   'tutorial'),
        ('CSS',        'css'),
        ('Database',   'database')
      ON DUPLICATE KEY UPDATE id = id
    `);

    const tags = (await queryRunner.query(
      `SELECT id, slug FROM tags`,
    )) as { id: number; slug: string }[];
    const tagId = (slug: string): number =>
      tags.find((t: { id: number; slug: string }) => t.slug === slug)!.id;

    // Seed published posts
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const posts: { title: string; slug: string; body: string; authorId: number; tags: string[] }[] = [
      {
        title: 'Getting Started with NestJS',
        slug: 'getting-started-with-nestjs',
        body: `<p>NestJS is a progressive Node.js framework for building efficient and scalable server-side applications. It uses TypeScript by default and combines elements of OOP, FP, and FRP.</p>
<p>In this post we explore how to scaffold a new NestJS project, create modules, controllers and services, and wire everything together.</p>
<h2>Installation</h2>
<pre><code>npm i -g @nestjs/cli
nest new my-project</code></pre>
<p>That's all you need to get started!</p>`,
        authorId: adminId,
        tags: ['nestjs', 'typescript', 'tutorial'],
      },
      {
        title: 'TypeORM Column Naming with snake_case',
        slug: 'typeorm-column-naming-snake-case',
        body: `<p>By default TypeORM maps entity property names directly to column names. If your database uses snake_case conventions (e.g. <code>created_at</code>) but your entity uses camelCase (<code>createdAt</code>), you must explicitly set the column <code>name</code> option.</p>
<pre><code>@CreateDateColumn({ name: 'created_at' })
createdAt!: Date;</code></pre>
<p>Alternatively, install a custom <code>SnakeCaseNamingStrategy</code> to automate this across all entities.</p>`,
        authorId: adminId,
        tags: ['nestjs', 'database', 'typescript'],
      },
      {
        title: 'Tailwind CSS v4 — CLI is Now a Separate Package',
        slug: 'tailwind-css-v4-cli-separate-package',
        body: `<p>In Tailwind CSS v4 the CLI was extracted into its own npm package <code>@tailwindcss/cli</code>. The main <code>tailwindcss</code> package is now only a PostCSS plugin.</p>
<p>To use the CLI, install it separately:</p>
<pre><code>npm install --save-dev @tailwindcss/cli</code></pre>
<p>Then run your build as usual:</p>
<pre><code>npx tailwindcss -i src/styles/input.css -o public/css/tailwind.css --minify</code></pre>`,
        authorId: memberId,
        tags: ['css', 'tutorial'],
      },
      {
        title: 'Writing Your First Microblog Post',
        slug: 'writing-your-first-microblog-post',
        body: `<p>Welcome to Microblog CMS! This platform lets you write, tag, and publish short articles with ease.</p>
<p>To get started:</p>
<ol>
  <li>Register an account at <code>/register</code></li>
  <li>Go to your Dashboard at <code>/dashboard</code></li>
  <li>Click <strong>New Post</strong> and start writing</li>
  <li>Add tags to categorise your post</li>
  <li>Submit for review — an admin will approve and publish it</li>
</ol>
<p>Happy blogging!</p>`,
        authorId: memberId,
        tags: ['tutorial'],
      },
      {
        title: 'Understanding JWT Refresh Token Rotation',
        slug: 'understanding-jwt-refresh-token-rotation',
        body: `<p>Refresh token rotation is a security technique where each use of a refresh token issues a new one and immediately revokes the old one.</p>
<p>This limits the window of opportunity if a token is stolen. Our implementation stores a SHA-256 hash of the token in the database and uses HTTP-only cookies to transport them safely.</p>
<h2>Flow</h2>
<ol>
  <li>Login → receive <code>access_token</code> (15 min) + <code>refresh_token</code> (7 days) in cookies</li>
  <li>Access token expires → browser POSTs to <code>/auth/refresh</code></li>
  <li>Server validates refresh token, issues new pair, revokes old refresh token</li>
</ol>`,
        authorId: adminId,
        tags: ['nestjs', 'typescript'],
      },
    ];

    for (const post of posts) {
      await queryRunner.query(
        `INSERT INTO posts (title, slug, body, status, author_id, published_at, created_at, updated_at)
         VALUES (?, ?, ?, 'published', ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE id = id`,
        [post.title, post.slug, post.body, post.authorId, now, now, now],
      );

      const postRows = (await queryRunner.query(
        `SELECT id FROM posts WHERE slug = ?`,
        [post.slug],
      )) as { id: number }[];
      const postId = postRows[0].id;

      for (const tagSlug of post.tags) {
        await queryRunner.query(
          `INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)`,
          [postId, tagId(tagSlug)],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM posts WHERE slug IN (
        'getting-started-with-nestjs',
        'typeorm-column-naming-snake-case',
        'tailwind-css-v4-cli-separate-package',
        'writing-your-first-microblog-post',
        'understanding-jwt-refresh-token-rotation'
      )
    `);
    await queryRunner.query(`
      DELETE FROM tags WHERE slug IN ('nestjs','typescript','tutorial','css','database')
    `);
    await queryRunner.query(`DELETE FROM users WHERE username = 'demo'`);
  }
}
