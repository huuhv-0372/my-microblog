# Research: Microblog CMS – Technical Decisions

**Phase**: 0 (Pre-design)
**Date**: 2026-05-05
**For**: `specs/001-microblog-cms/plan.md`

---

## R-001: Server-Side Rendering Engine for NestJS

**Question**: The user requested "static site using NestJS". NestJS is a Node.js backend framework with no built-in templating; a view engine must be chosen for SSR.

**Decision**: Use **Handlebars (HBS)** via `@nestjs/platform-express` + `hbs` package.

**Rationale**:
- Handlebars is the most widely documented NestJS view engine with first-class support in the `@nestjs/platform-express` adapter.
- Supports partial templates (header, footer, sidebar) which are essential for the 3-column layout shared across all pages.
- Layouts via `express-handlebars` allow a single `main.hbs` shell wrapping all pages — minimal duplication.
- Simpler logic-less syntax keeps HTML clean; business logic stays in NestJS controllers and services.

**Alternatives considered**:
- **EJS**: More JS logic in templates; higher risk of mixing concerns. Rejected.
- **Pug** (Jade): Indentation-based syntax unfamiliar to most frontend developers. Rejected.
- **Next.js frontend + NestJS API**: Adds a second runtime, build pipeline, and deployment target. Over-engineered for a small CMS. Rejected per Principle V (YAGNI).

---

## R-002: Tailwind CSS Integration with NestJS (SSR)

**Question**: How to compile and serve Tailwind CSS in a NestJS server-rendered app?

**Decision**: Use **Tailwind CSS CLI** (standalone or via PostCSS) integrated as an npm script; output CSS is placed in the `public/css/` static directory served by `@nestjs/serve-static` or Express's `static` middleware.

**Rationale**:
- NestJS with `@nestjs/serve-static` can serve `public/` as the static files root.
- `tailwindcss` CLI compiles `src/styles/input.css` → `public/css/tailwind.css` on build.
- A dev-mode watcher (`tailwindcss --watch`) runs alongside `nest start --watch`.
- No Webpack or Vite configuration required — simplest setup per Principle V.

**Implementation steps**:
```
"build:css": "tailwindcss -i src/styles/input.css -o public/css/tailwind.css --minify",
"watch:css": "tailwindcss -i src/styles/input.css -o public/css/tailwind.css --watch"
```

**Alternatives considered**:
- **Vite with NestJS**: Adds build complexity. Rejected.
- **CDN `<script>` tag (Play CDN)**: Not suitable for production. Rejected.

---

## R-003: MySQL vs PostgreSQL — ORM & Driver

**Question**: The user specified MySQL instead of the PostgreSQL in the constitution. TypeORM supports both.

**Decision**: Use **MySQL 8.0+** with **TypeORM** and the `mysql2` driver.

**Rationale**:
- TypeORM natively supports MySQL 8 through the `mysql2` driver; the entity definitions are identical to PostgreSQL — only the datasource `type` changes.
- `mysql2` is the modern replacement for the deprecated `mysql` package and supports async/await natively.
- The constitution's amendment: "Storage: MySQL 8.0+ via TypeORM" (minor amendment, no principle violation).

**Config change from constitution**:
```
"Database": "MySQL 8.0+ via TypeORM (replaces PostgreSQL; Principle V satisfied — single ORM, minimal change)"
```

**Migration tooling**: TypeORM's built-in migration CLI (`typeorm migration:generate`, `migration:run`) satisfies Principle V (versioned migrations).

**Alternatives considered**:
- **Prisma**: Excellent DX but introduces a second schema language and `prisma generate` step. Adds build complexity for marginal gain. Rejected.
- **Sequelize**: Less TypeScript-idiomatic than TypeORM in a NestJS context. Rejected.

---

## R-004: Authentication Strategy for SSR Application

**Question**: The constitution mandates JWT. For a server-rendered app, should auth be session-based or JWT-in-cookie?

**Decision**: **JWT stored in HTTP-only cookies** (hybrid approach).

**Rationale**:
- Satisfies the constitution's JWT mandate (Principle IV).
- HTTP-only cookies prevent XSS access to the token — better than localStorage.
- `SameSite=Strict` mitigates CSRF for same-origin form submissions.
- NestJS Passport + `passport-jwt` with a custom cookie extractor is straightforward.
- Server-side guard logic (`@UseGuards(JwtAuthGuard)`) is identical for both REST and SSR controllers.
- Short-lived access tokens (15 min) + refresh tokens stored in a `refresh_tokens` table (rotation on use).

**Alternatives considered**:
- **Express session + passport-local**: Simpler for pure SSR but violates the constitution's JWT mandate. Rejected.
- **Bearer token in Authorization header**: Requires JS on the client to attach the header — incompatible with standard HTML form-based navigation. Rejected.

---

## R-005: Post & Comment Status State Machines

**Question**: What are the exact states and transitions for posts and comments?

**Decision**:

**Post FSM**:
```
[draft] → submit → [pending_review]
[pending_review] → publish (admin) → [published]
[pending_review] → reject (admin) → [rejected]
[rejected] → resubmit (author) → [draft]
```

**Comment FSM**:
```
[pending] → approve (admin) → [approved]
[pending] → reject (admin) → [rejected]
```

**Stored as**: `ENUM` columns in MySQL — `post.status`, `comment.status`.

---

## R-006: Slug Generation Strategy

**Question**: How are post/tag slugs generated and kept unique?

**Decision**: Auto-generate slug from title using `slugify` npm package at creation time. Slugs are immutable after first submission (per spec Assumption 8). A UNIQUE constraint is placed on `post.slug` and `tag.slug` in MySQL. If a slug collision occurs, append `-{n}` suffix.

---

## R-007: Pagination Strategy

**Decision**: Offset-based pagination via query parameters `?page=1&limit=20`. TypeORM's `.skip()` / `.take()` methods handle the SQL `LIMIT / OFFSET`. The constitution mandates max 20 per page by default.

---

## R-008: Admin Seeding

**Decision**: A TypeORM data seeder (custom NestJS CLI command via `@nestjs/cli` plugin or a simple seed script) creates the first admin user from environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) on first run. No self-registration for admins.

---

## Summary of All Decisions

| ID | Area | Decision |
|----|------|----------|
| R-001 | View engine | Handlebars (HBS) via express-handlebars |
| R-002 | CSS | Tailwind CSS CLI → `public/css/tailwind.css` |
| R-003 | Database | MySQL 8.0+ / TypeORM / mysql2 driver |
| R-004 | Auth | JWT in HTTP-only cookie, passport-jwt |
| R-005 | State machines | ENUM columns, explicit FSM transitions |
| R-006 | Slugs | `slugify` + UNIQUE constraint + collision suffix |
| R-007 | Pagination | Offset-based, `?page&limit`, default 20 |
| R-008 | Admin seeding | Env-var seed script on first run |
