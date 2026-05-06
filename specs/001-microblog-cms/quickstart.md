# Quickstart: Microblog CMS – Local Development

**Date**: 2026-05-05

---

## Prerequisites

| Tool | Min Version | Check |
|------|-------------|-------|
| Node.js | 20 LTS | `node -v` |
| npm | 10+ | `npm -v` |
| MySQL Server | 8.0+ | `mysql --version` |
| Docker (optional) | 24+ | `docker -v` |

---

## 1. Clone & Install

```bash
git clone <repo-url>
cd microblog_nestjs
npm install
```

---

## 2. Environment Variables

Copy the example env file and fill in values:

```bash
cp .env.example .env
```

`.env.example` contents:
```env
# App
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=secret
DB_NAME=microblog

# JWT
JWT_ACCESS_SECRET=change-me-access-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change-me-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Admin seed (used by migration 008)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin1234!
ADMIN_USERNAME=admin
```

---

## 3. Database Setup

### Option A — Docker (recommended for local dev)

```bash
docker compose up -d mysql
```

`docker-compose.yml` provides MySQL 8.0 on port 3306 with the `microblog` database pre-created.

### Option B — Local MySQL

Create the database manually:
```sql
CREATE DATABASE microblog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 4. Run Migrations & Seed Admin

```bash
# Run all TypeORM migrations (creates tables + seeds admin user)
npm run migration:run
```

---

## 5. Build Tailwind CSS

```bash
# One-time build
npm run build:css

# Watch mode (for development)
npm run watch:css
```

---

## 6. Start the Application

```bash
# Development (with hot reload)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

App runs at: **http://localhost:3000**

---

## 7. Available npm Scripts

| Script | Purpose |
|--------|---------|
| `npm run start:dev` | NestJS watch mode |
| `npm run build` | Compile TypeScript |
| `npm run start:prod` | Run compiled output |
| `npm run build:css` | Compile Tailwind CSS (minified) |
| `npm run watch:css` | Tailwind CSS watcher |
| `npm run migration:generate -- src/migrations/MigrationName` | Generate new migration |
| `npm run migration:run` | Apply pending migrations |
| `npm run migration:revert` | Revert last migration |
| `npm run test` | Run Jest unit tests |
| `npm run test:e2e` | Run Supertest e2e tests |
| `npm run lint` | ESLint check |

---

## 8. Default Accounts After Seeding

| Role | Email | Password |
|------|-------|---------|
| Admin | value of `ADMIN_EMAIL` | value of `ADMIN_PASSWORD` |

> **Security**: Change `ADMIN_PASSWORD` immediately after first login in production.

---

## 9. Key URLs

| URL | Description |
|-----|-------------|
| `http://localhost:3000/` | Homepage (3-column layout) |
| `http://localhost:3000/register` | Member registration |
| `http://localhost:3000/login` | Login |
| `http://localhost:3000/dashboard` | Member dashboard |
| `http://localhost:3000/admin` | Admin panel |
| `http://localhost:3000/about` | About Me page |

---

## 10. Project Structure

```
microblog_nestjs/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── styles/
│   │   └── input.css            # Tailwind entry point
│   ├── config/
│   │   └── database.config.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── posts/
│   │   ├── tags/
│   │   ├── comments/
│   │   ├── admin/
│   │   └── pages/
│   ├── entities/
│   │   ├── user.entity.ts
│   │   ├── post.entity.ts
│   │   ├── tag.entity.ts
│   │   ├── comment.entity.ts
│   │   ├── page.entity.ts
│   │   └── refresh-token.entity.ts
│   ├── migrations/
│   │   ├── 001_create_users.ts
│   │   ├── 002_create_tags.ts
│   │   ├── 003_create_posts.ts
│   │   ├── 004_create_post_tags.ts
│   │   ├── 005_create_comments.ts
│   │   ├── 006_create_pages.ts
│   │   ├── 007_create_refresh_tokens.ts
│   │   └── 008_seed_admin.ts
│   └── common/
│       ├── guards/
│       ├── decorators/
│       └── filters/
├── views/
│   ├── layouts/
│   │   └── main.hbs
│   ├── partials/
│   │   ├── header.hbs
│   │   ├── footer.hbs
│   │   ├── sidebar-left.hbs
│   │   ├── sidebar-right.hbs
│   │   └── post-card.hbs
│   ├── pages/
│   │   ├── home.hbs
│   │   ├── tag.hbs
│   │   ├── post-detail.hbs
│   │   └── about.hbs
│   ├── auth/
│   │   ├── login.hbs
│   │   └── register.hbs
│   ├── member/
│   │   ├── dashboard.hbs
│   │   └── post-form.hbs
│   └── admin/
│       ├── dashboard.hbs
│       ├── posts.hbs
│       └── comments.hbs
├── public/
│   ├── css/
│   │   └── tailwind.css         # Tailwind output (gitignored, built on deploy)
│   └── js/
│       └── app.js               # Minimal vanilla JS (e.g., mobile menu toggle)
├── test/
│   ├── unit/
│   └── e2e/
├── tailwind.config.js
├── docker-compose.yml
├── .env.example
└── package.json
```
