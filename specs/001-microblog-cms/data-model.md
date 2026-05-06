# Data Model: Microblog CMS

**Phase**: 1 (Design)
**Date**: 2026-05-05

---

## Entity Relationship Overview

```
User ──< Post >──< PostTag >── Tag
          │
          └──< Comment
```

- A `User` authors many `Post`s.
- A `Post` has many `Tag`s through the `PostTag` join table.
- A `Post` has many `Comment`s.
- A `Comment` may reference a `User` (member) or store anonymous identity fields.

---

## Entities

### User

Represents a registered account. Role determines available actions.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INT UNSIGNED | PK, AUTO_INCREMENT | |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | URL-safe, lowercase |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt, cost factor 12 |
| `role` | ENUM('member','admin') | NOT NULL, DEFAULT 'member' | |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | |

**Indexes**: `email` (UNIQUE), `username` (UNIQUE)

**Validation rules**:
- `username`: 3–50 chars, alphanumeric + underscore only.
- `email`: valid email format.
- `password`: min 8 chars at registration (never stored plain).

**State / behaviour**: No FSM. Role is set at creation; only admin can elevate another user.

---

### Post

Represents a short-form blog post. Core entity of the CMS.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INT UNSIGNED | PK, AUTO_INCREMENT | |
| `title` | VARCHAR(255) | NOT NULL | |
| `slug` | VARCHAR(280) | UNIQUE, NOT NULL | Auto-generated from title via `slugify`; collision suffix `-{n}` |
| `body` | TEXT | NOT NULL | Plain text or basic Markdown |
| `status` | ENUM('draft','pending_review','published','rejected') | NOT NULL, DEFAULT 'draft' | |
| `author_id` | INT UNSIGNED | NOT NULL, FK → User.id | ON DELETE CASCADE |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | |
| `published_at` | DATETIME | NULL | Set when admin publishes |
| `updated_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | |

**Indexes**: `slug` (UNIQUE), `status` (INDEX), `author_id` (INDEX), `published_at` (INDEX)

**Status FSM**:
```
draft ──[submit]──► pending_review ──[publish]──► published
                           │
                           └──[reject]──► rejected ──[resubmit]──► draft
```

**Validation rules**:
- `title`: 1–255 chars, required.
- `body`: min 1 char, required.
- Must have ≥ 1 tag before `submit` transition.

---

### Tag

Represents a topic category for posts.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INT UNSIGNED | PK, AUTO_INCREMENT | |
| `name` | VARCHAR(100) | UNIQUE, NOT NULL | Display label |
| `slug` | VARCHAR(110) | UNIQUE, NOT NULL | Auto-generated from name |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | |

**Computed field** (not stored): `published_post_count` — derived via JOIN at query time.

**Validation rules**:
- `name`: 1–100 chars, required; trimmed.

---

### PostTag (Join Table)

Resolves the many-to-many relationship between Post and Tag.

| Column | Type | Constraints |
|--------|------|-------------|
| `post_id` | INT UNSIGNED | FK → Post.id, ON DELETE CASCADE |
| `tag_id` | INT UNSIGNED | FK → Tag.id, ON DELETE CASCADE |

**Primary key**: composite (`post_id`, `tag_id`)

---

### Comment

Represents a reader comment on a published post. Supports both member and anonymous submission.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INT UNSIGNED | PK, AUTO_INCREMENT | |
| `body` | TEXT | NOT NULL | Min 1 char |
| `status` | ENUM('pending','approved','rejected') | NOT NULL, DEFAULT 'pending' | |
| `post_id` | INT UNSIGNED | NOT NULL, FK → Post.id, ON DELETE CASCADE | |
| `user_id` | INT UNSIGNED | NULL, FK → User.id, ON DELETE SET NULL | NULL for anonymous |
| `display_name` | VARCHAR(100) | NULL | Set for anonymous; NULL for member (use username) |
| `email` | VARCHAR(255) | NULL | Anonymous only; not displayed publicly |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | |

**Status FSM**:
```
pending ──[approve]──► approved
        ──[reject]──►  rejected
```

**Validation rules**:
- `body`: 1–2000 chars, required.
- If anonymous: `display_name` (1–100 chars) and `email` (valid format) are required.
- Comments may only be submitted on posts with `status = 'published'`.

**Indexes**: `post_id` + `status` (composite INDEX for moderation queries), `user_id` (INDEX)

---

### Page

Represents a static content page (e.g., About Me). Admin-managed.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INT UNSIGNED | PK, AUTO_INCREMENT | |
| `slug` | VARCHAR(100) | UNIQUE, NOT NULL | e.g., `about` |
| `title` | VARCHAR(255) | NOT NULL | |
| `body` | TEXT | NOT NULL | Plain text / Markdown |
| `updated_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | |

---

### RefreshToken

Stores refresh tokens for JWT rotation. Required by constitution Principle IV.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INT UNSIGNED | PK, AUTO_INCREMENT | |
| `token_hash` | VARCHAR(255) | UNIQUE, NOT NULL | SHA-256 hash of the raw token |
| `user_id` | INT UNSIGNED | NOT NULL, FK → User.id, ON DELETE CASCADE | |
| `expires_at` | DATETIME | NOT NULL | |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | |
| `revoked` | TINYINT(1) | NOT NULL, DEFAULT 0 | Soft-revoke on rotation |

---

## TypeORM Entity Mapping Summary

```
entities/
├── user.entity.ts          → User
├── post.entity.ts          → Post
├── tag.entity.ts           → Tag
├── comment.entity.ts       → Comment
├── page.entity.ts          → Page
└── refresh-token.entity.ts → RefreshToken
```

---

## Database Migrations Plan

| Migration | Description |
|-----------|-------------|
| `001_create_users` | User table + indexes |
| `002_create_tags` | Tag table |
| `003_create_posts` | Post table + FK → users |
| `004_create_post_tags` | PostTag join table |
| `005_create_comments` | Comment table + FKs |
| `006_create_pages` | Page table + seed About Me row |
| `007_create_refresh_tokens` | RefreshToken table |
| `008_seed_admin` | Seed admin user from env vars |
