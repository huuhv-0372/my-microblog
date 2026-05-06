<!--
SYNC IMPACT REPORT
==================
Version change: (none) → 1.0.0
Added sections:
  - Core Principles (5 principles defined)
  - Technology Stack & Constraints
  - Development Workflow
  - Governance
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ — Constitution Check gates reviewed; no structural change required
  - .specify/templates/spec-template.md ✅ — scope/requirements alignment verified
  - .specify/templates/tasks-template.md ✅ — task categories align with defined principles
Deferred TODOs: none
-->

# Microblog CMS Constitution

## Core Principles

### I. Content-First Design

Every feature MUST serve the core content lifecycle: **create → tag → publish → comment**.
New capabilities are only added when they directly support this lifecycle.
UI and API surfaces MUST prioritise the author and reader experience above all else.
Gold standard: an author can write, tag, and publish a post in under three steps;
a reader can find and comment on a post without friction.

### II. RESTful API Design (NON-NEGOTIABLE)

All server-client communication MUST be implemented as RESTful HTTP endpoints.
Resources MUST follow noun-based URL conventions: `/posts`, `/tags`, `/comments`.
HTTP verbs MUST reflect semantic intent: GET (read), POST (create), PATCH (partial update), DELETE (remove).
Request and response bodies MUST use JSON.
API contracts MUST be documented (OpenAPI/Swagger) before implementation begins.

### III. Test-First Development (NON-NEGOTIABLE)

TDD is mandatory: unit tests MUST be written and approved before implementation code.
The Red → Green → Refactor cycle MUST be strictly enforced.
Every public service method, controller endpoint, and data-access function MUST have
at least one unit test.
Integration tests MUST cover the four core flows:
- Post creation & persistence
- Tag assignment & retrieval
- Post publication (status transition)
- Comment submission & association

### IV. Security & Access Control

Authentication MUST use JWT tokens with short expiry (≤24 h) and refresh-token rotation.
All write operations (create post, publish, delete, comment) MUST require a valid authenticated session.
Input MUST be validated and sanitised at the API boundary (class-validator + class-transformer in NestJS).
Stored content MUST be HTML-escaped before rendering to prevent XSS.
Role separation MUST be respected: `author` role for post management; `reader` role for commenting.
Sensitive data (passwords, secrets) MUST NOT be logged or stored in plain text.

### V. Simplicity & YAGNI

Start with the simplest solution that satisfies the requirement.
No feature, abstraction, or module MUST be added speculatively.
Each NestJS module MUST have a single, clearly stated responsibility.
Database schema changes MUST be managed through versioned migrations (TypeORM migrations).
Dependencies MUST be evaluated for necessity before adoption; prefer well-maintained,
widely-used libraries over bespoke solutions.

## Technology Stack & Constraints

**Runtime**: Node.js 20 LTS  
**Framework**: NestJS (latest stable)  
**Language**: TypeScript 5.x — strict mode MUST be enabled (`strict: true`)  
**Database**: PostgreSQL 15+ via TypeORM  
**Authentication**: Passport.js + JWT strategy  
**Validation**: class-validator + class-transformer  
**Testing**: Jest (unit), Supertest (e2e/integration)  
**Documentation**: Swagger/OpenAPI auto-generated via `@nestjs/swagger`  
**Containerisation**: Docker + docker-compose for local development  

**Performance Constraints**:
- API responses for list endpoints MUST be paginated (max 20 items per page by default).
- Post publish and comment endpoints MUST respond within 300 ms at p95 under normal load.

**Scope Boundaries** (out of scope for v1):
- Real-time notifications (WebSocket/SSE)
- Media/file uploads (images, attachments)
- Full-text search engine integration
- Multi-tenancy

## Development Workflow

1. **Specification first**: Every feature MUST have an approved `spec.md` before work begins.
2. **Branch naming**: `{issue-number}-{short-description}` (e.g., `42-add-tag-filtering`).
3. **PR requirements**: All PRs MUST include passing unit tests, passing e2e tests for affected
   endpoints, and a Swagger schema update if the API contract changed.
4. **Code review**: At least one peer review approval is REQUIRED before merging to `main`.
5. **Database migrations**: MUST be committed alongside the feature code; migration rollbacks
   MUST be tested locally before PR submission.
6. **Linting & formatting**: ESLint + Prettier MUST pass with zero errors; CI will enforce this.
7. **Commit messages**: Follow Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).

## Governance

This constitution supersedes all other development conventions and informal agreements.
Any amendment MUST:
1. Update this document with a version bump following semantic versioning rules.
2. Record the rationale in a pull request description.
3. Obtain approval from at least one maintainer before merging.

All pull requests and code reviews MUST verify compliance with the five Core Principles above.
Complexity violations MUST be explicitly justified; undocumented complexity MUST be refactored.
Constitution version MUST be referenced in the project `README.md`.

**Version**: 1.0.0 | **Ratified**: 2026-05-05 | **Last Amended**: 2026-05-05
