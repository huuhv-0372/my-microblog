# Route & View Contracts: Microblog CMS

**Phase**: 1 (Design)
**Date**: 2026-05-05
**Format**: Server-Side Rendered (NestJS + Handlebars) — no JSON REST API for public pages; form submissions use standard HTML POST.

---

## Conventions

- All pages use a shared Handlebars layout `views/layouts/main.hbs`.
- Navigation bar: **Home** | **About Me** | **Login** (guest) | **Dashboard** (member) | **Admin Panel** (admin).
- Authentication state is read from the JWT in an HTTP-only cookie named `access_token`.
- Forms use `POST` with `application/x-www-form-urlencoded` body and include a CSRF token hidden field.
- Pagination: `?page={n}` query parameter; default `limit=20`.
- All list routes redirect to page 1 if `page` is out of range.

---

## Public Routes

### GET /

**Template**: `views/pages/home.hbs`
**Guard**: None (public)
**View data**:
```
{
  posts: PaginatedPostSummary[],   // status=published, ordered by published_at DESC
  tags: TagWithCount[],            // all tags, ordered by published_post_count DESC
  recentPosts: PostLink[],         // last 10 published posts for left column
  pagination: PaginationMeta
}
```
**Layout regions**:
- Left column: `recentPosts` list (title + link)
- Centre column: `posts` cards (title, excerpt ≤ 200 chars, tags, published_at)
- Right column: `tags` list (name + count)

---

### GET /tags/:slug

**Template**: `views/pages/tag.hbs`
**Guard**: None (public)
**View data**:
```
{
  tag: Tag,
  posts: PaginatedPostSummary[],   // status=published, tagged with slug, newest first
  pagination: PaginationMeta
}
```

---

### GET /posts/:slug

**Template**: `views/pages/post-detail.hbs`
**Guard**: None (public)
**View data**:
```
{
  post: PostDetail,               // status=published only; 404 otherwise
  comments: Comment[],            // status=approved only
  commentCount: number,
  currentUser: UserContext | null
}
```

---

### GET /about

**Template**: `views/pages/about.hbs`
**Guard**: None (public)
**View data**:
```
{ page: Page }   // slug='about'
```

---

## Auth Routes

### GET /register

**Template**: `views/auth/register.hbs`
**Guard**: Redirect to `/` if already authenticated.

### POST /register

**Body**: `username`, `email`, `password`, `_csrf`
**On success**: Set `access_token` cookie → redirect `/dashboard`
**On error**: Re-render `register.hbs` with validation errors

---

### GET /login

**Template**: `views/auth/login.hbs`
**Guard**: Redirect to `/` if already authenticated.

### POST /login

**Body**: `email`, `password`, `_csrf`
**On success**: Set `access_token` + `refresh_token` cookies → redirect `/dashboard`
**On error**: Re-render `login.hbs` with error message

---

### POST /logout

**Body**: `_csrf`
**Action**: Clear `access_token` + `refresh_token` cookies; revoke refresh token in DB → redirect `/`

---

### POST /auth/refresh

**Cookie**: `refresh_token`
**Action**: Validate refresh token, issue new `access_token` + rotated `refresh_token` → redirect original URL or `/`

---

## Member Routes (require `member` or `admin` role)

### GET /dashboard

**Template**: `views/member/dashboard.hbs`
**Guard**: `JwtAuthGuard`
**View data**:
```
{
  posts: PostSummaryWithStatus[],  // all posts by currentUser, sorted by updated_at DESC
  currentUser: UserContext
}
```

---

### GET /posts/new

**Template**: `views/member/post-form.hbs`
**Guard**: `JwtAuthGuard`
**View data**: `{ tags: Tag[], currentUser: UserContext }`

---

### POST /posts

**Guard**: `JwtAuthGuard`
**Body**: `title`, `body`, `tagIds[]`, `action` (`save_draft` | `submit_review`), `_csrf`
**On success**:
- `save_draft` → create post with `status=draft` → redirect `/dashboard`
- `submit_review` → create post with `status=pending_review` → redirect `/dashboard`
**On error**: Re-render `post-form.hbs` with validation errors

---

### GET /posts/:id/edit

**Template**: `views/member/post-form.hbs`
**Guard**: `JwtAuthGuard` + ownership check (author_id = currentUser.id) + status must be `draft`
**View data**: `{ post: Post, tags: Tag[], selectedTagIds: number[], currentUser: UserContext }`

---

### PATCH /posts/:id

**Guard**: `JwtAuthGuard` + ownership + `draft` status
**Body**: `title`, `body`, `tagIds[]`, `action`, `_csrf`
**On success**: redirect `/dashboard`
**Note**: HTML forms cannot send PATCH; use `POST /posts/:id?_method=PATCH` with `method-override` middleware.

---

### DELETE /posts/:id

**Guard**: `JwtAuthGuard` + ownership + status must be `draft`
**Note**: Use `POST /posts/:id?_method=DELETE`
**On success**: redirect `/dashboard`

---

### POST /posts/:id/submit

**Guard**: `JwtAuthGuard` + ownership + status must be `draft`
**Body**: `_csrf`
**Action**: Transition post to `pending_review`
**On success**: redirect `/dashboard`

---

## Comment Route (public, no login required)

### POST /comments

**Body**: `postId`, `body`, `displayName` (anon only), `email` (anon only), `_csrf`
**Guard**: None; if `access_token` cookie present → attach user to comment
**Action**: Create comment with `status=pending`
**On success**: redirect `/posts/{slug}#comment-submitted`
**On error**: redirect back with error flash

---

## Admin Routes (require `admin` role)

### GET /admin

**Template**: `views/admin/dashboard.hbs`
**Guard**: `JwtAuthGuard` + `RolesGuard(admin)`
**View data**: `{ pendingPostCount, pendingCommentCount }`

---

### GET /admin/posts

**Template**: `views/admin/posts.hbs`
**Guard**: admin
**Query**: `?status=pending_review` (default)
**View data**: `{ posts: PostSummaryWithStatus[], pagination: PaginationMeta }`

---

### POST /admin/posts/:id/publish

**Guard**: admin
**Body**: `_csrf`
**Action**: Set `status=published`, `published_at=NOW()`
**On success**: redirect `/admin/posts`

---

### POST /admin/posts/:id/reject

**Guard**: admin
**Body**: `_csrf`
**Action**: Set `status=rejected`
**On success**: redirect `/admin/posts`

---

### GET /admin/comments

**Template**: `views/admin/comments.hbs`
**Guard**: admin
**Query**: `?status=pending` (default)
**View data**: `{ comments: CommentWithPost[], pagination: PaginationMeta }`

---

### POST /admin/comments/:id/approve

**Guard**: admin
**Body**: `_csrf`
**Action**: Set comment `status=approved`
**On success**: redirect `/admin/comments`

---

### POST /admin/comments/:id/reject

**Guard**: admin
**Body**: `_csrf`
**Action**: Set comment `status=rejected`
**On success**: redirect `/admin/comments`

---

## Shared View Data Types

```typescript
interface PaginatedPostSummary {
  id: number;
  title: string;
  slug: string;
  excerpt: string;        // first 200 chars of body
  tags: { name: string; slug: string }[];
  publishedAt: Date;
  authorUsername: string;
}

interface TagWithCount {
  name: string;
  slug: string;
  publishedPostCount: number;
}

interface PostLink {
  title: string;
  slug: string;
  publishedAt: Date;
}

interface PostDetail {
  id: number;
  title: string;
  body: string;           // full body
  tags: { name: string; slug: string }[];
  authorUsername: string;
  publishedAt: Date;
}

interface UserContext {
  id: number;
  username: string;
  role: 'member' | 'admin';
}

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}
```

---

## CSRF Strategy

All mutating routes (`POST`, `PATCH`, `DELETE`) require a `_csrf` hidden input rendered by the server using `csurf` middleware (or equivalent). The token is injected into all form templates via a Handlebars helper `{{csrfToken}}`.
