---
description: "Task list for Microblog CMS implementation"
---

# Tasks: Microblog CMS

**Input**: Design documents from `specs/001-microblog-cms/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/routes.md ✅ | quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.
**Tests**: Not explicitly requested — no test tasks generated. Add `test:` tasks if TDD is later required.

## Format: `[ID] [P?] [Story?] Description — file path`

- **[P]**: Parallelizable (operates on different files with no incomplete dependencies)
- **[US#]**: User story label (Phase 3+)
- No label = Setup or Foundational phase

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Scaffold the NestJS monolith, install all dependencies, configure tooling and environment.

- [X] T001 Initialize NestJS project with `nest new microblog_nestjs --package-manager npm` and verify TypeScript strict mode in `tsconfig.json`
- [X] T002 Install all runtime dependencies: `@nestjs/typeorm typeorm mysql2 passport passport-jwt @nestjs/passport bcrypt class-validator class-transformer slugify csurf method-override express-handlebars hbs` — `package.json`
- [X] T003 [P] Install dev dependencies: `@types/bcrypt @types/passport-jwt @types/csurf @types/method-override eslint prettier @typescript-eslint/eslint-plugin` — `package.json`
- [X] T004 [P] Configure ESLint + Prettier: create `.eslintrc.js` and `.prettierrc` with project rules
- [X] T005 [P] Install and configure Tailwind CSS CLI: create `tailwind.config.js` with content paths `src/**/*.ts views/**/*.hbs`; create `src/styles/input.css` with Tailwind directives
- [X] T006 [P] Add npm scripts for CSS build and watch in `package.json`: `build:css`, `watch:css`, `migration:generate`, `migration:run`, `migration:revert`
- [X] T007 Create `docker-compose.yml` with MySQL 8.0 service (port 3306, database `microblog`, utf8mb4 charset)
- [X] T008 [P] Create `.env.example` with all required variables: `NODE_ENV`, `PORT`, `DB_*`, `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_USERNAME`
- [X] T009 Create `public/` directory structure: `public/css/` (gitignored output), `public/js/app.js` (empty placeholder)
- [X] T010 [P] Create `views/` directory skeleton: `layouts/`, `partials/`, `pages/`, `auth/`, `member/`, `admin/`, `errors/` subdirectories with `.gitkeep` files

**Checkpoint**: `npm run lint` passes; `npm run build:css` produces `public/css/tailwind.css`; Docker MySQL starts successfully.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that ALL user stories depend on. Must be complete before any story work begins.

**CRITICAL**: No user story implementation can start until this phase is complete.

- [X] T011 Configure TypeORM MySQL datasource in `src/config/database.config.ts`: read all `DB_*` env vars, enable migrations mode, set `synchronize: false`
- [X] T012 Wire TypeORM into `src/app.module.ts` using `TypeOrmModule.forRootAsync` with the config from T011
- [X] T013 Create all 6 TypeORM entities (can be done in parallel within this task group):
  - [X] T013a [P] `src/entities/user.entity.ts` — columns: id, username, email, password_hash, role ENUM, created_at; UNIQUE indexes on email and username
  - [X] T013b [P] `src/entities/tag.entity.ts` — columns: id, name, slug, created_at; UNIQUE indexes on name and slug; ManyToMany relation to Post
  - [X] T013c [P] `src/entities/post.entity.ts` — columns: id, title, slug, body, status ENUM (draft/pending_review/published/rejected), author_id FK, created_at, published_at, updated_at; ManyToOne User; ManyToMany Tag
  - [X] T013d [P] `src/entities/comment.entity.ts` — columns: id, body, status ENUM (pending/approved/rejected), post_id FK, user_id FK nullable, display_name, email, created_at; ManyToOne Post; ManyToOne User nullable
  - [X] T013e [P] `src/entities/page.entity.ts` — columns: id, slug UNIQUE, title, body, updated_at
  - [X] T013f [P] `src/entities/refresh-token.entity.ts` — columns: id, token_hash UNIQUE, user_id FK, expires_at, created_at, revoked; ManyToOne User
- [X] T014 Write all 8 TypeORM migrations in `src/migrations/`:
  - [X] T014a `001_create_users.ts` — users table + UNIQUE indexes
  - [X] T014b `002_create_tags.ts` — tags table + UNIQUE indexes
  - [X] T014c `003_create_posts.ts` — posts table + all indexes + FK to users
  - [X] T014d `004_create_post_tags.ts` — post_tags join table (composite PK, cascade FKs)
  - [X] T014e `005_create_comments.ts` — comments table + composite index (post_id, status) + FKs
  - [X] T014f `006_create_pages.ts` — pages table + seed one row (slug=`about`, title="About Me", body placeholder)
  - [X] T014g `007_create_refresh_tokens.ts` — refresh_tokens table + UNIQUE index on token_hash
  - [X] T014h `008_seed_admin.ts` — read `ADMIN_EMAIL/PASSWORD/USERNAME` from env, hash with bcrypt cost 12, insert admin user with role=`admin`
- [ ] T015 Run `npm run migration:run` against Docker MySQL and confirm all 8 migrations apply cleanly
- [X] T016 Configure Handlebars view engine in `src/main.ts`: register `express-handlebars` with `views/layouts/main.hbs` as default layout, register `views/partials/` directory, set view engine to `hbs`
- [X] T017 Configure `method-override` middleware in `src/main.ts` (parse `_method` query param for HTML form PATCH/DELETE)
- [X] T018 Configure `csurf` middleware in `src/main.ts`; create a global interceptor that injects `csrfToken` into all `res.locals` so every Handlebars template can access `{{csrfToken}}`
- [X] T019 Configure `@nestjs/serve-static` (or Express `static()`) to serve `public/` directory at root
- [X] T020 Create global `HttpExceptionFilter` in `src/common/filters/http-exception.filter.ts` that renders `views/errors/404.hbs` and `views/errors/500.hbs` for 404 and 500 errors respectively
- [X] T021 Create `CurrentUser` decorator in `src/common/decorators/current-user.decorator.ts` to extract authenticated user from request
- [X] T022 Create Handlebars helpers in `src/common/helpers/hbs-helpers.ts`: `formatDate` (locale date string), `excerpt` (trim body to N chars), `eq` (equality check for conditionals), `range` (pagination numbers)
- [X] T023 Create shared layout `views/layouts/main.hbs`: 3-column grid (Tailwind `grid grid-cols-12`), include nav partial, left/right sidebar slots, centre content slot
- [X] T024 [P] Create `views/partials/nav.hbs`: logo, Home link, About link, conditional Login/Dashboard/Admin links based on `currentUser` and role
- [X] T025 [P] Create `views/errors/404.hbs` and `views/errors/500.hbs` with basic Tailwind-styled error pages
- [X] T026 Wire all NestJS modules into `src/app.module.ts` (stub modules are acceptable at this phase; real controllers added per story)

**Checkpoint**: `npm run start:dev` starts without errors; `GET /` returns 404 page (not a crash); migrations all applied; CSS is served at `/css/tailwind.css`.

---

## Phase 3: User Story 1 – Homepage 3-column layout (Priority: P1) — MVP

**Goal**: A visitor opens `/` and sees the 3-column layout with post cards, recent post list, and tag sidebar — all paginated, newest first.

**Independent Test**: Seed 5 published posts across 3 tags via direct DB insert. Open `http://localhost:3000/` — verify 3 columns render, posts appear newest-first, tag counts are correct.

- [X] T027 [US1] Create `src/modules/posts/posts.module.ts` and register in `app.module.ts`
- [X] T028 [US1] Create `src/modules/tags/tags.module.ts` and register in `app.module.ts`
- [X] T029 [US1] Implement `TagsService.findAllWithPublishedCount()` in `src/modules/tags/tags.service.ts`: TypeORM query joining Post where status=`published`, group by tag, order by count DESC
- [X] T030 [US1] Implement `PostsService.findPublished(page, limit)` in `src/modules/posts/posts.service.ts`: paginated query for status=`published`, order by `published_at DESC`, eager-load tags and author username; return `{ items, total }`
- [X] T031 [US1] Implement `PostsService.findRecentPublished(limit=10)`: top 10 published posts ordered by `published_at DESC`, return title + slug only (for left sidebar)
- [X] T032 [US1] Implement homepage controller action `GET /` in `src/modules/posts/posts.controller.ts`: call T029, T030, T031; pass `posts`, `tags`, `recentPosts`, `pagination` to `home.hbs`
- [X] T033 [US1] Create `views/partials/post-card.hbs`: Tailwind card with title link, excerpt (first 200 chars), tag badges linking to `/tags/:slug`, published date formatted with `{{formatDate}}`
- [X] T034 [US1] Create `views/partials/sidebar-left.hbs`: ordered list of recent post title links
- [X] T035 [US1] Create `views/partials/sidebar-right.hbs`: tag list items showing `name (count)` linking to `/tags/:slug`
- [X] T036 [US1] Create `views/partials/pagination.hbs`: previous/next links and page number list using `{{range}}` helper; receives `pagination` context
- [X] T037 [US1] Create `views/pages/home.hbs`: include left sidebar partial, loop over `posts` rendering `post-card` partial, include right sidebar partial, include pagination partial; show empty-state message when `posts` is empty
- [X] T038 [US1] Implement post detail route `GET /posts/:slug` in `posts.controller.ts`: look up post by slug where status=`published`; 404 if not found; pass `post`, `comments` (approved only), `commentCount`, `currentUser` to `post-detail.hbs`
- [X] T039 [US1] Implement `PostsService.findPublishedBySlug(slug)` in `src/modules/posts/posts.service.ts`: load post with tags, author, approved comments ordered by `created_at ASC`
- [X] T040 [US1] Create `views/pages/post-detail.hbs`: full post title, body, tag badges, author, published date; list of approved comments with submitter name and date; include `comment-form.hbs` partial at bottom

**Checkpoint**: Homepage renders 3 columns with seed data; clicking a post card navigates to post detail; empty-state shows when no posts.

---

## Phase 4: User Story 2 – Browse by Tag/Category (Priority: P2)

**Goal**: Visitor clicks a tag and sees `/tags/:slug` listing only published posts with that tag, paginated newest-first.

**Independent Test**: Insert 3 posts tagged "Tech". Navigate to `/tags/tech` — verify exactly 3 posts appear; other posts absent.

- [X] T041 [US2] Implement `TagsService.findBySlug(slug)` in `src/modules/tags/tags.service.ts`: find tag by slug or throw 404
- [X] T042 [US2] Implement `PostsService.findPublishedByTag(tagSlug, page, limit)` in `src/modules/posts/posts.service.ts`: join PostTag and Tag where tag.slug=tagSlug and post.status=`published`, order `published_at DESC`, paginated
- [X] T043 [US2] Implement tag controller `GET /tags/:slug` in `src/modules/tags/tags.controller.ts`: call T041, T042; pass `tag`, `posts`, `pagination` to `tag.hbs`; return 404 if tag not found
- [X] T044 [US2] Create `views/pages/tag.hbs`: page heading with tag name, reuse `post-card` partial in loop, include `pagination` partial; show empty-state if no posts for tag

**Checkpoint**: `/tags/tech` shows only posts tagged "Tech"; `/tags/nonexistent` returns 404 page; pagination links work.

---

## Phase 5: User Story 3 – Member Registration & Login (Priority: P3)

**Goal**: Visitors can register and log in; the JWT is stored in an HTTP-only cookie; the member dashboard link appears after login.

**Independent Test**: Submit the registration form with valid data — verify redirect to dashboard; submit login form with those credentials — verify `access_token` cookie is set.

- [X] T045 [US3] Create `src/modules/users/users.module.ts` and `users.service.ts`; register in `app.module.ts`
- [X] T046 [US3] Implement `UsersService.findByEmail` and `UsersService.create` in `src/modules/users/users.service.ts`: hash password with `bcrypt` cost 12 before storing
- [X] T047 [US3] Create `register.dto.ts` in `src/modules/auth/dto/`: `@IsString @Length(3,50)` username, `@IsEmail` email, `@MinLength(8)` password — all required
- [X] T048 [US3] Create `login.dto.ts` in `src/modules/auth/dto/`: `@IsEmail` email, `@IsString` password
- [X] T049 [US3] Create JWT cookie strategy in `src/modules/auth/strategies/jwt.strategy.ts`: extend `PassportStrategy(Strategy)`, extract `access_token` from `req.cookies`, validate payload, return user object
- [X] T050 [US3] Create `JwtAuthGuard` in `src/modules/auth/guards/jwt-auth.guard.ts` extending `AuthGuard('jwt')` with custom `handleRequest` that redirects unauthenticated requests to `/login` (SSR pattern)
- [X] T051 [US3] Create `RolesGuard` in `src/modules/auth/guards/roles.guard.ts`: check `currentUser.role` against `@Roles('admin')` decorator; redirect non-admins to `/`
- [X] T052 [US3] Implement `AuthService` in `src/modules/auth/auth.service.ts`: `register(dto)`, `validateUser(email, password)`, `login(user)` (issue access JWT + refresh token, store hashed refresh token in `refresh_tokens` table), `refresh(rawRefreshToken)` (rotate), `logout(userId)` (revoke all refresh tokens for user)
- [X] T053 [US3] Implement auth controller `GET /register` and `POST /register` in `src/modules/auth/auth.controller.ts`: validate RegisterDto, call `AuthService.register`, set `access_token` cookie (HTTP-only, SameSite=Strict, maxAge=15min) and `refresh_token` cookie (HTTP-only, maxAge=7d), redirect to `/dashboard`; on error re-render register form with errors
- [X] T054 [US3] Implement `GET /login` and `POST /login` in `auth.controller.ts`: validate LoginDto, call `AuthService.validateUser`, set both cookies, redirect to `/dashboard`; on error re-render login form
- [X] T055 [US3] Implement `POST /logout` in `auth.controller.ts`: call `AuthService.logout`, clear both cookies, redirect to `/`
- [X] T056 [US3] Implement `POST /auth/refresh` in `auth.controller.ts`: validate refresh token cookie, rotate tokens, set new cookies, redirect back
- [X] T057 [US3] Create `views/auth/register.hbs`: form with username, email, password fields + CSRF hidden input + validation error display
- [X] T058 [US3] Create `views/auth/login.hbs`: form with email, password fields + CSRF hidden input + error display
- [X] T059 [US3] Update `views/partials/nav.hbs`: show "Login / Register" when no `currentUser`; show "Dashboard" and "Logout" when `currentUser.role === 'member'`; additionally show "Admin" when `currentUser.role === 'admin'`

**Checkpoint**: Registration creates a user row in DB; login sets HTTP-only cookie; visiting `/dashboard` while unauthenticated redirects to `/login`.

---

## Phase 6: User Story 4 – Member writes and submits a post (Priority: P4)

**Goal**: Logged-in member can create a post (draft or pending_review), edit and delete their drafts, and see all their posts in the dashboard.

**Independent Test**: Log in as member. Create post with title, body, and 2 tags. Save as draft — verify it appears in dashboard with status "draft" but does NOT appear on homepage.

- [X] T060 [US4] Create `create-post.dto.ts` in `src/modules/posts/dto/`: `@IsString @MaxLength(255)` title, `@IsString @MinLength(1)` body, `@IsArray @ArrayMinSize(1) @IsInt({each:true})` tagIds, `@IsIn(['save_draft','submit_review'])` action
- [X] T061 [US4] Implement `PostsService.createDraft(authorId, dto)` in `src/modules/posts/posts.service.ts`: generate slug from title using `slugify`, handle collision by appending `-{n}`, set status based on `action` field, persist with tags
- [X] T062 [US4] Implement `PostsService.findAllByAuthor(authorId)` in `src/modules/posts/posts.service.ts`: return all posts (any status) for given author, order by `updated_at DESC`
- [X] T063 [US4] Implement `PostsService.updateDraft(postId, authorId, dto)`: verify post belongs to author and status=`draft`; update title/body/tags; regenerate slug if title changed
- [X] T064 [US4] Implement `PostsService.deleteDraft(postId, authorId)`: verify ownership and status=`draft`; hard-delete
- [X] T065 [US4] Implement `PostsService.submitForReview(postId, authorId)`: verify ownership, status=`draft`, and ≥1 tag; transition status to `pending_review`
- [X] T066 [US4] Implement dashboard controller `GET /dashboard` in `src/modules/users/dashboard.controller.ts`: guard with `JwtAuthGuard`; call `PostsService.findAllByAuthor`; render `dashboard.hbs`
- [X] T067 [US4] Implement `GET /posts/new` in `posts.controller.ts`: `JwtAuthGuard`; load all tags from `TagsService`; render `post-form.hbs`
- [X] T068 [US4] Implement `POST /posts` in `posts.controller.ts`: `JwtAuthGuard`; validate `CreatePostDto`; call `PostsService.createDraft`; redirect `/dashboard` on success; re-render form on validation error
- [X] T069 [US4] Implement `GET /posts/:id/edit` in `posts.controller.ts`: `JwtAuthGuard`; load post, verify ownership and status=`draft`; load all tags; render `post-form.hbs` pre-populated
- [X] T070 [US4] Implement `POST /posts/:id?_method=PATCH` in `posts.controller.ts`: `JwtAuthGuard`; validate dto; call `PostsService.updateDraft`; redirect `/dashboard`
- [X] T071 [US4] Implement `POST /posts/:id?_method=DELETE` in `posts.controller.ts`: `JwtAuthGuard`; call `PostsService.deleteDraft`; redirect `/dashboard`
- [X] T072 [US4] Implement `POST /posts/:id/submit` in `posts.controller.ts`: `JwtAuthGuard`; call `PostsService.submitForReview`; redirect `/dashboard`
- [X] T073 [US4] Create `views/member/post-form.hbs`: title input, body textarea, tag multi-select checkboxes (loop `tags`, pre-check `selectedTagIds`), CSRF hidden field, two submit buttons ("Save Draft" sets `action=save_draft`, "Submit for Review" sets `action=submit_review`); display validation errors inline
- [X] T074 [US4] Create `views/member/dashboard.hbs`: table of author's posts with columns: title, status badge (Tailwind colour-coded), created_at, actions (Edit — only for draft, Delete — only for draft, Submit — only for draft, View — only for published)

**Checkpoint**: Draft post not visible on homepage; post appears in dashboard with correct status badge; submit-for-review transitions status; delete removes the row.

---

## Phase 7: User Story 5 – Comments (anonymous & member) (Priority: P5)

**Goal**: Any visitor can submit a comment on a published post; comments queue as `pending`; only approved comments are shown publicly.

**Independent Test**: Open a published post. Submit a comment as anonymous (with name + email). Verify comment is NOT visible on the post page; verify it exists in DB with status=`pending`.

- [X] T075 [US5] Create `create-comment.dto.ts` in `src/modules/comments/dto/`: `@IsString @MinLength(1) @MaxLength(2000)` body; `@IsString @MaxLength(100)` displayName (optional); `@IsEmail` email (optional); `@IsInt` postId; conditional validation: if `userId` absent then `displayName` and `email` are required
- [X] T076 [US5] Implement `CommentsService.create(dto, currentUser?)` in `src/modules/comments/comments.service.ts`: verify post exists and status=`published` (throw 404 otherwise); set `user_id` if member is logged in; set `display_name`/`email` for anonymous; save with status=`pending`
- [X] T077 [US5] Implement comment controller `POST /comments` in `src/modules/comments/comments.controller.ts`: no auth guard (public); extract optional `currentUser` from cookie; validate `CreateCommentDto`; call `CommentsService.create`; redirect to `/posts/:slug#comment-submitted` on success; redirect back with flash error on failure
- [X] T078 [US5] Create `views/partials/comment-form.hbs`: conditional form — if `currentUser` exists show body textarea only; if anonymous show body + displayName + email fields; always include CSRF hidden input and postId hidden input; show flash success/error message
- [X] T079 [US5] Update `views/pages/post-detail.hbs`: render approved comments list (name, body, formatted date); include `comment-form` partial; show "No comments yet" when list is empty; show "Comment submitted for review" anchor target after form

**Checkpoint**: Anonymous comment saves to DB as `pending`; not visible on post page; member comment attaches user_id; approved comments (set manually in DB) appear on the post page.

---

## Phase 8: User Story 6 – Admin publishes posts (Priority: P6)

**Goal**: Admin can log in, view all pending-review posts, and publish or reject each one.

**Independent Test**: Submit a post as member. Log in as seeded admin. Navigate to `/admin/posts` — verify the post appears. Click "Publish" — verify it now appears on the homepage.

- [X] T080 [US6] Create `src/modules/admin/admin.module.ts`; register in `app.module.ts`
- [X] T081 [US6] Implement `AdminService.findPendingPosts(page, limit)` in `src/modules/admin/admin.service.ts`: TypeORM query for posts where status=`pending_review`, order by `created_at ASC`, paginate; eager-load author username and tags
- [X] T082 [US6] Implement `AdminService.publishPost(postId)`: set status=`published`, `published_at=NOW()`
- [X] T083 [US6] Implement `AdminService.rejectPost(postId)`: set status=`rejected`
- [X] T084 [US6] Implement admin controller `GET /admin` in `src/modules/admin/admin.controller.ts`: guard `JwtAuthGuard` + `RolesGuard(admin)`; count pending posts and comments; render `admin/dashboard.hbs`
- [X] T085 [US6] Implement `GET /admin/posts` in `admin.controller.ts`: call `AdminService.findPendingPosts`; render `admin/posts.hbs`
- [X] T086 [US6] Implement `POST /admin/posts/:id/publish` in `admin.controller.ts`: call `AdminService.publishPost`; redirect `/admin/posts`
- [X] T087 [US6] Implement `POST /admin/posts/:id/reject` in `admin.controller.ts`: call `AdminService.rejectPost`; redirect `/admin/posts`
- [X] T088 [US6] Create `views/admin/dashboard.hbs`: summary cards showing pending post count and pending comment count with links to respective queues; Tailwind-styled admin layout
- [X] T089 [US6] Create `views/admin/posts.hbs`: table of pending posts — title, author, created_at, tag badges, "Publish" button (POST form), "Reject" button (POST form); each with CSRF hidden input; empty-state row when queue is empty

**Checkpoint**: Seeded admin can access `/admin` but member cannot (redirect to `/`); published post appears on homepage; rejected post shows "rejected" badge in author's dashboard.

---

## Phase 9: User Story 7 – Admin moderates comments (Priority: P7)

**Goal**: Admin can view all pending comments and approve or reject each one.

**Independent Test**: Submit 2 anonymous comments. Log in as admin. Go to `/admin/comments` — both appear. Approve one, reject one. Verify only approved comment is visible on the post page.

- [X] T090 [US7] Implement `AdminService.findPendingComments(page, limit)` in `src/modules/admin/admin.service.ts`: query comments where status=`pending`, order `created_at ASC`, paginate; eager-load post title and slug
- [X] T091 [US7] Implement `AdminService.approveComment(commentId)`: set comment status=`approved`
- [X] T092 [US7] Implement `AdminService.rejectComment(commentId)`: set comment status=`rejected`
- [X] T093 [US7] Implement `GET /admin/comments` in `admin.controller.ts`: call `AdminService.findPendingComments`; render `admin/comments.hbs`
- [X] T094 [US7] Implement `POST /admin/comments/:id/approve` in `admin.controller.ts`: call `AdminService.approveComment`; redirect `/admin/comments`
- [X] T095 [US7] Implement `POST /admin/comments/:id/reject` in `admin.controller.ts`: call `AdminService.rejectComment`; redirect `/admin/comments`
- [X] T096 [US7] Create `views/admin/comments.hbs`: table of pending comments — post title (linked to `/posts/:slug`), submitter name/email or member username, comment body preview (first 100 chars), submitted_at, "Approve" button, "Reject" button; each row has its own form with CSRF; empty-state when queue is empty

**Checkpoint**: Approved comment appears on post detail page; rejected comment does not; admin comment count on dashboard decrements after action.

---

## Phase 10: User Story 8 – About Me static page (Priority: P8)

**Goal**: Any visitor can navigate to `/about` and see the site owner's bio page.

**Independent Test**: Navigate to `http://localhost:3000/about` — page renders without errors with the seeded bio content.

- [X] T097 [US8] Create `src/modules/pages/pages.module.ts` and register in `app.module.ts`
- [X] T098 [US8] Implement `PagesService.findBySlug(slug)` in `src/modules/pages/pages.service.ts`: find Page entity by slug; throw `NotFoundException` if not found
- [X] T099 [US8] Implement pages controller `GET /about` in `src/modules/pages/pages.controller.ts`: call `PagesService.findBySlug('about')`; pass `page` to `about.hbs`
- [X] T100 [US8] Create `views/pages/about.hbs`: render `page.title` as heading, `page.body` as content; the About Me content was seeded in migration `006`

**Checkpoint**: `GET /about` returns 200 with seeded content; `GET /pages/nonexistent` returns 404 error page.

---

## Phase 11: Polish & Cross-cutting Concerns

**Purpose**: Security hardening, UX improvements, production readiness.

- [X] T101 Add `helmet` middleware to `src/main.ts` for HTTP security headers (Content-Security-Policy, X-Frame-Options, etc.)
- [X] T102 [P] Implement global validation pipe in `src/main.ts`: `new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`
- [X] T103 [P] Add rate limiting via `@nestjs/throttler` on auth routes (`POST /login`, `POST /register`) — max 10 requests per minute per IP
- [X] T104 [P] Add `robots.txt` to `public/` disallowing `/admin` and `/dashboard` paths
- [X] T105 Add Tailwind responsive classes to `views/layouts/main.hbs`: 3-column layout on desktop (`lg:grid-cols-12`), single-column stack on mobile (`grid-cols-1`)
- [X] T106 [P] Add flash message support via `connect-flash` or cookie-based flash: wire into `res.locals` so all templates can display `{{flash.success}}` / `{{flash.error}}`
- [X] T107 [P] Add `public/js/app.js` minimal JS: mobile hamburger menu toggle for `nav.hbs`
- [X] T108 Update `views/partials/nav.hbs` mobile menu and responsive collapse behaviour (T107 dependency)
- [X] T109 [P] Add `public/css/tailwind.css` to `.gitignore`; add `node_modules/` and `.env` entries; confirm `.env.example` is tracked
- [X] T110 [P] Write `README.md` at repository root referencing `specs/001-microblog-cms/quickstart.md` for setup instructions, listing all npm scripts, and noting the constitution location

---

## Dependencies (User Story Completion Order)

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundation) ← ALL stories blocked until here
    │
    ├──► Phase 3 (US1 – Homepage)         [MVP]
    │         │
    │         └──► Phase 4 (US2 – Tag pages)   [depends on US1 views/services]
    │
    ├──► Phase 5 (US3 – Auth)             [independent; unblocks US4, US5, US6, US7]
    │         │
    │         ├──► Phase 6 (US4 – Write post)  [requires auth]
    │         ├──► Phase 7 (US5 – Comments)    [requires auth optional; requires US1 post detail]
    │         ├──► Phase 8 (US6 – Admin posts) [requires auth + admin role]
    │         └──► Phase 9 (US7 – Admin comments) [requires auth + admin role]
    │
    └──► Phase 10 (US8 – About page)      [fully independent after Foundation]

Phase 11 (Polish) — after all stories complete
```

---

## Parallel Execution Examples

**Within Phase 2 (Foundation)**:
- T013a–T013f: All 6 entity files can be written in parallel (separate files, no cross-deps).
- T014a–T014h: Migrations can be written in parallel once entities exist.
- T023–T025: Layout and error views can be built in parallel with service/controller code.

**Across phases (after Phase 2 complete)**:
- Phase 3 (US1) and Phase 5 (US3 auth) can be built in parallel — different modules, no dependency.
- Phase 10 (US8 about) can be built any time after Phase 2.

**Within each story phase**:
- DTOs and entity methods: parallel (different files).
- Controller: depends on service; service depends on entity.
- View template: parallel with controller/service (different file type).

---

## Implementation Strategy (MVP-first)

| Milestone | Phases | Deliverable |
|-----------|--------|-------------|
| **MVP** | 1 + 2 + 3 | Working homepage with seeded data — visitors can browse posts |
| **M2** | + 4 | Tag browsing works |
| **M3** | + 5 | Registration and login work |
| **M4** | + 6 + 7 | Members can write posts; comments work end-to-end |
| **M5** | + 8 + 9 | Full admin moderation loop |
| **M6** | + 10 + 11 | About page + production polish |

---

## Format Validation

All tasks follow the mandatory checklist format:
- [x] Every task starts with `- [ ]`
- [x] Every task has a sequential ID (T001–T110)
- [x] `[P]` label present on all parallelizable tasks
- [x] `[US#]` label present on all user-story-phase tasks (Phase 3–10)
- [x] Every task includes a concrete file path or action target
- [x] No placeholder text remains
