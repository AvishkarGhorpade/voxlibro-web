# VoxLibro — Website

Marketing site + blog for VoxLibro (a free, independently developed
Android text-to-speech app by Avishkar Ghorpade), built with Next.js 15
(App Router), TypeScript, Tailwind CSS, Prisma, and NextAuth.

There is no company and no team behind VoxLibro — see `BACKEND.md` for the
data model and `lib/site-content.ts` for the real product copy this site
is built from.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in real values — see comments in the file
npx prisma generate
npx prisma migrate deploy    # or `prisma migrate dev` in local development
npm run db:seed              # creates the first SUPER_ADMIN account
npm run dev
```

Open http://localhost:3000.

Required before this is production-ready:
- `NEXT_PUBLIC_SITE_URL` set to the real deployed domain (used for
  sitemap.xml, robots.txt, RSS, canonical URLs, and JSON-LD).
- A real `DATABASE_URL` / `DIRECT_URL` (Postgres).
- `NEXTAUTH_SECRET` and `ANALYTICS_SALT` generated (see `.env.example`).
- Optional: `NEXT_PUBLIC_PLAY_STORE_URL`, `NEXT_PUBLIC_GITHUB_URL`,
  `NEXT_PUBLIC_TWITTER_URL`, `NEXT_PUBLIC_CONTACT_EMAIL` — each is hidden
  from the UI until set, so only fill in ones that are real.

## Stack

- **Next.js 15** — App Router, Server Components by default
- **TypeScript** — strict mode, no `any`
- **Tailwind CSS**
- **Prisma + PostgreSQL** — blog content, users, analytics, contact messages
- **NextAuth v5** — Credentials-based admin authentication
- **Cloudinary** — blog image storage/optimization
- **Zod** — input validation on every API route

## Folder structure

```
app/
  layout.tsx              Root layout: fonts, ThemeProvider, Navbar, Footer, WebSite JSON-LD
  page.tsx                 Home
  features/                 Features page
  download/                  Download page (Google Play link, env-gated)
  about/                      About page
  faq/                         FAQ page
  contact/                      Contact page — real form, posts to /api/contact
  privacy-policy/                 Privacy policy (factual only — see file header)
  search/                          Blog search (client) — calls /api/search
  blog/                              Blog listing — fetches /api/posts
  blog/[slug]/                       Single blog post — fetches /api/posts/:slug
  api/                                 Public + admin REST endpoints (see BACKEND.md)
  not-found.tsx                        Custom 404
  error.tsx                            Global error boundary
  robots.ts, sitemap.ts, feed.xml/     SEO infrastructure

components/
  ui/                     Design-system primitives
  layout/                 Navbar, Footer
  shared/                 Hero, PhoneMockup, Waveform, FeatureCard, FaqAccordion,
                          ContactForm, CommandMenu, ThemeToggle, SearchBar, BlogPostCard, Logo
  seo/                    Breadcrumbs, JsonLd
  skeletons/              Loading-state components used by loading.tsx files

lib/
  site-content.ts          Real product copy (features, FAQ) — no invented stats
  blog-api.ts               Server-side fetch helpers for the blog API
  blog-api-client.ts         Client-side (browser) fetch helper for search
  auth.ts, rbac.ts, guard.ts, security.ts, rate-limit.ts, markdown.ts, cloudinary.ts
                              Backend logic — see BACKEND.md

types/
  index.ts                 Shared types matching the real API response shapes

config/
  site.ts                   Nav links, env-driven external links, site metadata
```

## Admin panel

`/admin/login` — sign in with the account created by `npm run db:seed`
(uses `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from your `.env`). There
is no public sign-up page, so this is only accessible to whoever has
those credentials.

Once signed in: `/admin/posts` lists all posts (draft + published) with
publish/unpublish/delete actions, and `/admin/posts/new` is a Markdown
editor (Write/Preview tabs, category, tags) for writing new posts.

## Known remaining work

See the audit report delivered alongside this codebase for the full list.
Not yet built: a media library UI for cover images (the API supports
Cloudinary uploads — `app/api/admin/media` — but there's no page for it
yet, so cover images must be attached via the API directly for now), and
a revision-history UI (also API-only today).

## Accessibility & performance notes

- Skip-to-content link in the root layout.
- Visible focus rings via `:focus-visible` (see `app/globals.css`).
- `prefers-reduced-motion` respected globally.
- All interactive icons have `aria-label`s.
- Images use `next/image` with explicit `sizes`.
- Loading skeletons for every async route segment.
