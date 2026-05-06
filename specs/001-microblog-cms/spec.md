# Feature Specification: Microblog CMS – Viết bài ngắn, Tag & Publish, Bình luận

**Feature Branch**: `001-microblog-cms`
**Created**: 2026-05-05
**Status**: Draft

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Reader browses the homepage (Priority: P1)

A visitor opens the homepage and sees a three-column layout:
- **Left column**: chronological list of recent post titles (linked).
- **Centre column**: blog post cards with title, excerpt, tag badges, and publication date, ordered by newest first. Visitors can click any card to read the full post.
- **Right column**: all categories/tags sorted descending by number of published posts.

**Why this priority**: This is the entry point for every visitor. Without a working homepage the product has no value.

**Independent Test**: Deploy the app with seed data (5 posts, 3 tags). Open `/` — verify three columns render, posts appear newest-first, and tag counts are correct.

**Acceptance Scenarios**:

1. **Given** published posts exist, **When** a visitor opens the homepage, **Then** they see post previews in the centre column ordered newest-first.
2. **Given** tags are assigned to posts, **When** the homepage loads, **Then** the right column lists tags with the correct number of associated published posts, sorted descending.
3. **Given** a published post exists, **When** the visitor clicks its title or card, **Then** they are taken to the full post page.
4. **Given** no published posts exist, **When** the homepage loads, **Then** an empty-state message is shown instead of post cards.

---

### User Story 2 – Reader browses by tag/category (Priority: P2)

A visitor clicks a tag (from the right column or from a post's badge) and lands on the tag page, which lists all published posts carrying that tag, newest first.

**Why this priority**: Tag/category browsing is the primary discovery mechanism beyond the homepage timeline.

**Independent Test**: Assign 3 posts to tag "Tech". Navigate to `/tags/tech` — verify only those 3 posts appear.

**Acceptance Scenarios**:

1. **Given** a tag with associated published posts, **When** a visitor navigates to `/tags/{slug}`, **Then** only published posts with that tag are listed, newest first.
2. **Given** a tag with no published posts, **When** a visitor navigates to its page, **Then** an empty-state message is shown.
3. **Given** the visitor is on a tag page, **When** they click a post, **Then** they are taken to the full post page.

---

### User Story 3 – Member registers and logs in (Priority: P3)

A new visitor registers with a username, email, and password. After registration they can log in and access member-only actions (writing posts, commenting as a named member).

**Why this priority**: Registration and login gate all author and named-commenter flows.

**Independent Test**: Register a new account via the sign-up form, log in with those credentials, verify the member dashboard link appears.

**Acceptance Scenarios**:

1. **Given** a unique email, **When** a visitor submits the registration form, **Then** an account is created and they are logged in automatically.
2. **Given** a duplicate email, **When** registration is submitted, **Then** an error message is shown and no account is created.
3. **Given** valid credentials, **When** the login form is submitted, **Then** the user is authenticated and redirected to the homepage.
4. **Given** invalid credentials, **When** login is submitted, **Then** an error message is shown and access is denied.

---

### User Story 4 – Member writes and submits a post (Priority: P4)

A logged-in member creates a short post (title + body + one or more tags), saves it as a **draft** or submits it for admin review (**pending review**). The member can edit or delete their own drafts. They cannot publish directly.

**Why this priority**: Post authoring is the core content-creation flow.

**Independent Test**: Log in as a member. Create a post with title, body, and two tags. Save as draft — verify it appears in the member's draft list but not on the public homepage.

**Acceptance Scenarios**:

1. **Given** a logged-in member, **When** they submit the post creation form with title, body, and at least one tag, **Then** the post is saved as a draft and listed in their personal dashboard.
2. **Given** a saved draft, **When** the member clicks "Submit for review", **Then** the post status changes to "pending review" and it is no longer editable until the admin acts.
3. **Given** a draft post, **When** the member edits and saves it, **Then** the updated content is persisted.
4. **Given** a draft post, **When** the member deletes it, **Then** it is removed and no longer visible anywhere.
5. **Given** a missing title or empty body, **When** the form is submitted, **Then** validation errors are shown and the post is not saved.

---

### User Story 5 – Reader/Member comments on a post (Priority: P5)

Any visitor (anonymous or logged-in member) can submit a comment on a published post. Anonymous visitors provide a display name and email (not stored beyond the comment record). Comments are held in a **pending** state until an admin approves them; approved comments are visible on the post page.

**Why this priority**: Comments drive reader engagement and are a key differentiator from a static blog.

**Independent Test**: Open a published post. Submit a comment as an anonymous user with a name and email. Verify the comment does not appear publicly until admin approves it.

**Acceptance Scenarios**:

1. **Given** a published post, **When** an anonymous visitor submits a comment with a display name and email, **Then** the comment is saved with status "pending" and a confirmation message is shown.
2. **Given** a published post, **When** a logged-in member submits a comment, **Then** the comment is saved with the member's name and status "pending".
3. **Given** a pending comment, **When** an admin approves it, **Then** it appears on the post page visible to all visitors.
4. **Given** a pending comment, **When** an admin rejects it, **Then** it is hidden and the commenter receives no public indication.
5. **Given** an empty comment body, **When** submission is attempted, **Then** a validation error is shown.

---

### User Story 6 – Admin publishes posts (Priority: P6)

An admin logs in to the admin panel and sees a list of posts with status "pending review". The admin can read the full post content, then **publish** or **reject** it. Published posts immediately appear on the public site.

**Why this priority**: The publish workflow is the bridge between member-submitted content and the public site.

**Independent Test**: Submit a post as a member. Log in as admin, navigate to the pending posts queue. Publish the post — verify it now appears on the homepage.

**Acceptance Scenarios**:

1. **Given** the admin is logged in, **When** they navigate to the admin panel, **Then** all pending-review posts are listed.
2. **Given** a pending post, **When** the admin clicks "Publish", **Then** the post status becomes "published" and it appears on the public site.
3. **Given** a pending post, **When** the admin clicks "Reject", **Then** the post status becomes "rejected" and it does not appear publicly; the author sees "rejected" in their dashboard.
4. **Given** no pending posts, **When** the admin views the queue, **Then** an empty-state message is shown.

---

### User Story 7 – Admin moderates comments (Priority: P7)

The admin sees all pending comments across all posts. They can approve or reject each comment. Approved comments become publicly visible; rejected comments remain hidden.

**Why this priority**: Moderation keeps the site free of spam and offensive content.

**Independent Test**: Submit 2 comments as anonymous users. Log in as admin. Approve one and reject one — verify only the approved comment is visible on the post page.

**Acceptance Scenarios**:

1. **Given** pending comments exist, **When** the admin opens the comment moderation panel, **Then** all pending comments are listed with the post title and submitter name.
2. **Given** a pending comment, **When** the admin approves it, **Then** the comment status becomes "approved" and is visible on the post page.
3. **Given** a pending comment, **When** the admin rejects it, **Then** the comment status becomes "rejected" and it remains hidden publicly.

---

### User Story 8 – Static pages: About Me (Priority: P8)

The site has an "About Me" page accessible from the navigation bar, displaying the site owner's bio and links.

**Why this priority**: Secondary content page; important for site credibility but not core to CMS functionality.

**Independent Test**: Navigate to `/about` — verify the page renders with static content.

**Acceptance Scenarios**:

1. **Given** the About Me page is configured, **When** any visitor navigates to `/about`, **Then** the page renders without errors.

---

### Edge Cases

- What happens when a post has no tags? → Validation error; at least one tag is required before submission.
- What happens when an admin is deleted? → Admin accounts cannot be self-deleted; only another admin can remove one.
- What happens if a member's post is rejected and they try to resubmit? → The post reverts to "draft" status so the member can edit and resubmit.
- What happens when a visitor paginates beyond the last page? → An empty results page with a "back to first page" link is shown.
- What happens if two members register with the same username? → Usernames must be unique; a validation error is returned.

---

## Requirements *(mandatory)*

### Functional Requirements

**Public Site**

- **FR-001**: System MUST display a three-column homepage layout: left = recent post list, centre = post cards with excerpt ordered newest-first, right = tags sorted by published post count descending.
- **FR-002**: System MUST support ordering posts by creation date (newest first by default).
- **FR-003**: System MUST provide tag/category pages listing all published posts for that tag, newest first.
- **FR-004**: System MUST provide individual post pages with the full post body and its approved comments.
- **FR-005**: System MUST provide a navigation bar with links to: Home, (tag pages accessible from right column), About Me.
- **FR-006**: System MUST paginate all post lists (homepage and tag pages), with a configurable page size defaulting to 20.
- **FR-007**: System MUST allow any visitor (anonymous or member) to submit a comment on a published post.
- **FR-008**: Anonymous comment submissions MUST collect a display name and email address.

**Member (registered user) flows**

- **FR-009**: System MUST allow visitors to register with a unique username, unique email, and password.
- **FR-010**: System MUST allow registered members to log in with email and password.
- **FR-011**: System MUST allow logged-in members to create posts with a title, body, and one or more tags.
- **FR-012**: Posts created by members MUST default to "draft" status and MUST NOT be publicly visible.
- **FR-013**: Members MUST be able to submit a draft post for admin review (status → "pending review").
- **FR-014**: Members MUST be able to edit or delete their own draft posts.
- **FR-015**: Members MUST be able to view a personal dashboard listing all their posts with statuses (draft, pending, published, rejected).

**Admin flows**

- **FR-016**: System MUST provide a protected admin panel accessible only to admin-role users via login.
- **FR-017**: Admin MUST be able to view all posts with status "pending review".
- **FR-018**: Admin MUST be able to publish a pending post (status → "published") making it immediately public.
- **FR-019**: Admin MUST be able to reject a pending post (status → "rejected"); the author sees the updated status in their dashboard.
- **FR-020**: Admin MUST be able to view all pending comments across all posts.
- **FR-021**: Admin MUST be able to approve a pending comment (status → "approved"), making it publicly visible.
- **FR-022**: Admin MUST be able to reject a pending comment (status → "rejected"), keeping it hidden.

### Key Entities

- **User**: unique username, unique email, hashed password, role (`member` or `admin`), registration date.
- **Post**: title, body (short-form text), slug (URL-safe, unique), status (`draft` | `pending_review` | `published` | `rejected`), author (User), tags (many-to-many), creation date, publication date.
- **Tag**: name, slug (unique), number of published posts (derived).
- **Comment**: body, status (`pending` | `approved` | `rejected`), associated post, commenter (User reference if member, or display name + email if anonymous), submission date.
- **Page**: slug (`about`), title, body (static content managed by admin).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can reach the homepage, browse a post, and read it in under 3 clicks.
- **SC-002**: A member can register, create a post, and submit it for review in under 5 minutes.
- **SC-003**: An admin can review and publish a pending post in under 1 minute from logging into the admin panel.
- **SC-004**: All list pages (homepage, tag pages, admin queues) load in under 2 seconds for data sets up to 10,000 posts.
- **SC-005**: Comment submissions by anonymous users require no login; the flow completes in under 3 steps (open post → fill form → submit).
- **SC-006**: 100% of comments and posts are held in a pending queue before becoming publicly visible, ensuring no unmoderated content reaches the public site.
- **SC-007**: The right-column tag list accurately reflects the number of published posts per tag at all times (no stale counts).

---

## Assumptions

- The site is single-language (Vietnamese or English); internationalisation is out of scope for v1.
- "Short post" is defined as plain text or basic markdown; rich media (images, video embeds) is out of scope for v1.
- Email delivery (registration confirmation, notification of post approval) is desirable but deferred to v2; no email service is required for v1.
- An admin account is seeded at deployment; self-service admin registration is out of scope.
- The "About Me" page content is managed via direct database seed or a simple admin edit form; a full page-builder is out of scope.
- Mobile responsiveness of the three-column layout collapses to a single-column stack on small screens; exact breakpoints are a UI implementation detail.
- Anonymous comment emails are stored solely to allow future spam filtering; they are not displayed publicly.
- Post slugs are auto-generated from the title at creation time and are not editable after first submission to avoid broken links.
