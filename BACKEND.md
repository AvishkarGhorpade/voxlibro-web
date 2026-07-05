# VoxLibro — Backend

Production backend for the VoxLibro blog/CMS, built entirely as Next.js API
Routes + Server Actions on top of the existing frontend. **No frontend file
was modified** except that the public site should eventually fetch from
`/api/posts`, `/api/categories`, `/api/tags`, `/api/search` instead of
`lib/mock-data.ts` — left to the frontend team since that's a UI-layer change.

## Stack

- **Next.js 15 API Routes** (App Router `route.ts` handlers) + **Server Actions**
- **PostgreSQL** via **Supabase**
- **Prisma ORM** — schema, migrations, type-safe queries
- **NextAuth v5** (Credentials provider, JWT sessions, Prisma adapter)
- **Cloudinary** — image storage, optimization, transformation
- **Zod** — input validation on every mutating endpoint
- **bcryptjs** — password hashing
- **isomorphic-dompurify** + **marked** — safe markdown → HTML rendering
- **Upstash Redis** (optional) — distributed rate limiting, with an
  in-memory fallback for local dev

## Folder-by-folder

### `prisma/`
- `schema.prisma` — the entire data model: NextAuth tables (`User`,
  `Account`, `Session`, `VerificationToken`), content (`Post`, `Category`,
  `Tag`, `PostTag` join table, `Media`), the draft/autosave history
  (`PostRevision`), and `AnalyticsEvent`. `Role` and `PostStatus` are enums
  enforced at the database level, not just in app code.
- `seed.ts` — creates the first `SUPER_ADMIN` from env vars and a few
  starter categories. Run with `npm run db:seed`.

### `lib/` — shared server-side logic, imported by routes and actions
- `prisma.ts` — the singleton Prisma client (avoids exhausting Supabase's
  connection pool during Next.js dev hot-reloads).
- `auth.ts` — NextAuth config: Credentials provider, JWT session strategy,
  brute-force-protected `authorize()`.
- `rbac.ts` — `requireRole(minRole)` / `isRoleAtLeast()`. Role hierarchy:
  `AUTHOR < EDITOR < ADMIN < SUPER_ADMIN`.
- `guard.ts` — `guardMutation(req, minRole)`: CSRF check + role check in one
  call, used at the top of every state-changing admin route.
- `security.ts` — CSRF token issuance/verification (double-submit cookie),
  plain-text sanitization, HTML sanitization (allowlist via DOMPurify), and
  IP hashing for privacy-preserving analytics.
- `rate-limit.ts` — `enforceRateLimit({ key, limit, windowSeconds })`.
  Upstash Redis in production, in-memory sliding window locally.
- `markdown.ts` — renders stored markdown to sanitized HTML at *read* time.
  Markdown is the only thing ever persisted (`Post.content`); HTML is never
  stored, so a sanitizer fix applies retroactively to all content.
- `cloudinary.ts` — `uploadImage()` / `deleteImage()`, with
  `fetch_format: "auto"` + `quality: "auto"` for automatic image optimization.
- `slugify.ts` — slug generation, uniqueness resolution, reading-time estimate.
- `api-response.ts` — `ok/created/noContent` helpers, `ApiError`, and
  `handleApiError()` — the single place that turns thrown errors (Zod,
  Prisma, `ApiError`) into consistent JSON responses without leaking
  internals.
- `validations/*.ts` — one Zod schema file per domain (`auth`, `post`,
  `category`, `tag`, `media`, `user`, `analytics`, `public`). Every request
  body and query string is parsed through one of these before touching the
  database — this is the app's SQL-injection and malformed-input defense,
  on top of Prisma's own parameterized queries.
- `actions/post-actions.ts` — Server Actions for the admin dashboard
  (create/publish/delete a post) as a lower-overhead alternative to a fetch
  call from Server/Client Components.

### `middleware.ts`
Runs on every request (edge runtime): sets hardened security headers
(CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy) on every
response, and rejects unauthenticated requests to `/api/admin/*` before
they reach a route handler — belt-and-suspenders on top of `requireRole()`
inside each handler.

### `app/api/auth/[...nextauth]` & `app/api/csrf`
NextAuth's own sign-in/session/callback handlers, and the endpoint the
admin dashboard calls once on load to receive a CSRF cookie.

### `app/api/admin/*` — authenticated CMS surface
Every route here calls `requireRole()` (reads) or `guardMutation()`
(writes) as its first line, and `middleware.ts` also blocks the whole tree
for unauthenticated requests.

| Route | Purpose |
|---|---|
| `posts/`, `posts/[id]/` | Blog CRUD, list with pagination/filtering |
| `posts/[id]/autosave/` | Debounced autosave → writes a `PostRevision` + updates the live draft |
| `posts/[id]/publish/` | `publish` / `unpublish` / `archive` status transitions |
| `posts/[id]/revisions/`, `revisions/[revisionId]/` | Revision history + one-click restore |
| `categories/`, `categories/[id]/` | Category CRUD |
| `tags/`, `tags/[id]/` | Tag CRUD |
| `media/`, `media/[id]/` | Media library: Cloudinary upload, list, alt-text edit, delete |
| `users/`, `users/[id]/` | Role management — invite teammates, change role/active status (`SUPER_ADMIN` only) |
| `analytics/` | Dashboard stats: post counts, total/recent views, top posts, recent searches, posts-by-category |

### `app/api/*` — public REST API (no auth, `PUBLISHED`-only)
- `posts/`, `posts/[slug]/` — blog listing and single-article view (renders
  markdown to safe HTML, increments `viewCount`, logs a `POST_VIEW` event)
- `categories/`, `tags/` — taxonomy lists, filtered to terms with at least
  one published post
- `search/` — searches title/excerpt/content via Prisma's parameterized
  `contains` filter, rate-limited per IP, logs a `SEARCH` analytics event
- `analytics/track/` — anonymous page-view beacon from the public site,
  rate-limited per IP, stores only a salted IP hash

### `app/feed.xml/route.ts` & `app/sitemap.ts`
RSS 2.0 feed of the 20 latest posts, and a Next.js sitemap
(`MetadataRoute.Sitemap`) combining static marketing routes with every
published post's URL — both auto-update as content is published, no
manual maintenance.

## Security checklist

- **CSRF**: double-submit cookie, timing-safe comparison, required on every
  admin mutation via `guardMutation()`.
- **XSS**: React escapes by default; markdown → HTML is passed through an
  allowlist sanitizer before ever reaching a client; plain-text fields
  (titles, names) are stripped of tags on write.
- **SQL injection**: 100% Prisma query builder — no raw SQL string
  concatenation anywhere in the codebase.
- **Rate limiting**: login, autosave, uploads, search, and analytics
  tracking are all throttled.
- **RBAC**: four-tier role hierarchy enforced both at the edge
  (`middleware.ts`) and per-route (`requireRole`/`guardMutation`), plus
  ownership checks (authors can only edit/delete their own posts unless
  `EDITOR+`).
- **Secrets**: never hardcoded — see `.env.example` for every variable the
  app reads, including the one-time seed credentials.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL, NEXTAUTH_SECRET, Cloudinary, etc.
npm run db:migrate           # creates tables from prisma/schema.prisma
npm run db:seed              # creates the first SUPER_ADMIN
npm run dev
```
