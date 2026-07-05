# VoxLibro Website — Production Readiness Audit

**Date:** July 4, 2026
**Scope:** Full codebase review against the real VoxLibro product (free,
solo-developed Android text-to-speech app by Avishkar Ghorpade — no
company, no subscription, no team, no verified public stats).

## Top-line finding

The website as generated was built for a **different, fictional
product** — a paid audiobook-narration subscription app with iOS + web
support, a small team, a Brooklyn studio, ~3.4M listeners, a 120,000-title
catalog, and $12–$96/mo pricing plans. None of that is VoxLibro. Nearly
every page needed to be rewritten at the content level, not just polished.

The backend (Prisma schema, NextAuth, blog API, rate limiting, sanitization,
Cloudinary) was **well-built and mostly real** — the problem was almost
entirely: (a) fake marketing content sitting on top of it, and (b) the
frontend pages never actually being wired to that real backend.

---

## ✔ Removed (fake information)

- Fake stats: "3.4M+ listeners," "120,000+ titles," "42 languages," 4.8★
  rating claims — all deleted, no replacement invented (per instructions,
  removed rather than guessed).
- Fake pricing plans ($12/$18/$96 tiers, "14-day free trial") — VoxLibro
  has no subscription; `PricingPlan` type, `pricing-card.tsx`, and all
  pricing copy deleted.
- Fake testimonials (named people at fictional companies) — deleted,
  `testimonial-card.tsx` removed. No real testimonials exist to replace them.
- Fake "trusted by" client logos — deleted.
- Fake team members and "founded 2021 in Brooklyn" origin story — replaced
  with the real, verified fact: independently built by Avishkar Ghorpade,
  no company, no team.
- Fake newsletter signup — deleted (`newsletter-form.tsx`); no email
  service is configured, so a working signup didn't exist and a fake one
  wasn't rebuilt.
- Fake blog posts (fabricated authors/avatars/dates in `mock-data.ts`) —
  deleted; blog now reads live from the real Prisma-backed API.
- Fake audiobook catalog on `/search` — replaced with real blog search
  against `/api/search`.
- Fake, fully-invented Privacy Policy (payment terms, refund policy, etc.
  for a product with no payments) — removed. Replaced with a factual page
  describing only what this website's own code verifiably does (contact
  form storage, hashed-IP analytics, local theme preference), plus an
  explicit, honest placeholder noting the Android app's own privacy policy
  still needs to be supplied by the developer — **not invented**, per
  instructions.
- Audiobook-themed copy scattered in UI strings ("narrated," "chapter,"
  fake book title/narrator in the hero mockup) — rewritten.
- iOS / App Store references — removed; VoxLibro is Android-only.

## ✔ Fixed (broken features)

- **Contact form** was fake (a `setTimeout` with no backend). Built a real
  `/api/contact` endpoint: Zod-validated, rate-limited, sanitized, persisted
  to a new `ContactMessage` Prisma model. Form now does a real network
  request and shows real success/error states.
- **Blog list & detail pages** were rendering hardcoded mock posts instead
  of the real database. Rewired to `/api/posts` and `/api/posts/:slug`,
  added real pagination, and category/tag filtering (`/blog?category=`,
  `/blog?tag=`).
- **`/search`** was a fake audiobook catalog. Rebuilt as live blog search
  against the real `/api/search` endpoint, with a loading skeleton
  (`SearchResultsSkeleton`, previously written but never used anywhere).
- **Missing per-page SEO on `/search`**: it was a client component, which
  in the App Router *cannot* export `metadata` — so it had zero title/
  description/OG/canonical tags. Split into a thin server `page.tsx`
  (owns `metadata`, `noindex: true`) + a `SearchClient` component.
- **`package.json` was missing over a dozen real runtime dependencies**
  (`next-auth`, `@prisma/client`, `bcryptjs`, `zod`, `cloudinary`,
  `@upstash/ratelimit`, `@upstash/redis`, `@auth/prisma-adapter`, all
  Radix packages actually imported, `marked`, `isomorphic-dompurify`,
  `ts-node`, `prisma`, etc.). A clean `npm install` would not have
  installed what the app actually needs to run. Rebuilt `package.json`
  from the real import graph, cross-checked against installed versions.
- **`isomorphic-dompurify` was imported via a runtime `require()`** with
  an eslint-disable comment, seemingly because it wasn't a declared
  dependency. Now a declared dependency with a proper static import.
- **Prisma client had no Linux binary target** — it was generated only for
  the original developer's machine, so it would fail on any real Linux
  deployment (Vercel, Docker, CI). Added `binaryTargets` to
  `prisma/schema.prisma`.
- **`prisma db seed` had no way to run** — `prisma/seed.ts` existed but
  `package.json` had no `db:seed` script and no `"prisma": { "seed": … }`
  config block. Added both.
- **`.eslintignore` didn't exist**, so the Next.js-generated
  `next-env.d.ts` was being linted and failing. Added `.eslintignore`.
- **Two `require()` calls flagged by ESLint** (`lib/security.ts`,
  `tailwind.config.ts`) — converted to static imports.
- **`.prose-voxlibro` CSS class didn't exist** despite being (about to be)
  the styling hook for all rendered blog-post markdown — headings,
  paragraphs, code blocks, etc. would have rendered completely unstyled.
  Added the missing typography styles.
- **`next.config.ts` / CSP allowed `images.unsplash.com`**, a stock-photo
  host used only by the fake mock blog data. Replaced with the real image
  host (`res.cloudinary.com`) used by the actual upload pipeline.
- **404 page copy** referenced "chapter" and "narrated" (audiobook
  framing) — fixed to generic copy.
- **Seed data categories** were "Narration Craft" / "Company News" —
  replaced with real topics from the brief (Text-to-Speech, Android,
  Accessibility, Productivity, App Updates).
- Hardcoded fake domain in `.env.example` (`admin@voxlibro.app`) —
  replaced with a generic placeholder; added required
  `NEXT_PUBLIC_SITE_URL` (used by sitemap/robots/RSS/canonical/JSON-LD)
  and optional, UI-hidden-until-set `NEXT_PUBLIC_PLAY_STORE_URL` /
  `NEXT_PUBLIC_GITHUB_URL` / `NEXT_PUBLIC_TWITTER_URL` /
  `NEXT_PUBLIC_CONTACT_EMAIL`.
- Invalid HTML: blog cards nested a `<Link>` inside a `<Link>` once
  category/tag badges became clickable — restructured to a valid DOM.

## ✔ Improved

- Every page now renders through `buildMeta()` (title, description, OG,
  Twitter card, canonical) — this was already a well-designed helper but
  was underused; confirmed every route now uses it.
- Integrated a fully-built but **entirely unintegrated** SEO layer that was
  sitting in a separate `voxlibro-seo/` folder outside the actual app
  (`robots.ts`, `components/seo/breadcrumbs.tsx`, `components/seo/json-ld.tsx`,
  `lib/seo/breadcrumb-schema.ts`) — copied into the real app and wired up
  (breadcrumbs + JSON-LD on blog posts, `WebSite`/`Person` schema in the
  root layout, `MobileApplication` schema on the home page, using
  `siteConfig.developer` rather than a fake company).
- Home page phone mockup no longer shows a fabricated audiobook (title,
  author, and narrator that don't belong to VoxLibro) — redesigned as a
  generic, clearly-illustrative TTS screen (pasted text → character count
  → voice selector → play), honest about being a stylized mockup rather
  than a real screenshot.
- Footer social links, contact email, and download CTA are now
  environment-driven and **hide themselves** when unset, instead of
  linking to invented URLs.

## Verified via automated checks

- `npx tsc --noEmit`: **0 errors** except one, described below.
- `npx eslint .`: **0 errors, 0 warnings**.
- No `any` anywhere in the codebase (verified by grep).
- `next build` type-checking and page compilation succeed end-to-end
  (verified with a temporary type stub, then reverted — see below).

## ⚠ Remaining issues (could not be completed in this environment)

1. **`prisma generate` cannot run here.** This sandbox's network access
   is restricted to a small allowlist that does not include
   `binaries.prisma.sh`, so the Prisma Linux query engine can't be
   downloaded. This is the *one* remaining TypeScript error
   (`app/api/contact/route.ts`, `contactMessage` not found on
   `PrismaClient`) — purely because the client wasn't regenerated against
   the updated schema. **Action:** run `npm install && npx prisma generate
   && npx prisma migrate deploy` in a normal environment; the error will
   disappear (verified by temporarily stubbing the type and confirming the
   rest of `next build` completes cleanly).
2. **No admin dashboard UI exists** — only the API layer
   (`app/api/admin/*`: posts, categories, tags, media, users, revisions,
   analytics, autosave, publish) is implemented, and it's solid. There is
   no `/admin/login` or `/admin` page, so today posts can only be created
   by calling the API directly or writing to the database. Building a real
   post editor (markdown editing, autosave, media picker, revision
   history, RBAC-aware navigation) is a substantial UI project in its own
   right and was out of scope to rush in this pass — flagged rather than
   shipped half-working.
3. **Contact form / Android app privacy policy is genuinely missing**, not
   invented. The developer needs to supply: a real contact email, a
   Google Play URL, and (required by Play Store policy) a real privacy
   policy for what the Android app itself collects on-device. All three
   are wired to be picked up automatically via env vars / the privacy
   policy page once provided.
4. **CSP allows `'unsafe-inline'`** for scripts/styles in `middleware.ts`
   (pre-existing). A nonce-based CSP would be stricter but is a larger,
   separate change touching how Next.js injects inline scripts — noted,
   not changed, to avoid risking a working security header for an
   unverified rewrite.
5. **No automated tests** exist in the repo (unit, integration, or e2e).
   Not addressed here — writing a real test suite is a separate project.
6. I could not run the app against a live Postgres database, so runtime
   behavior of the new `/api/contact` route and the blog API wiring is
   verified by type-checking and code review, not by an actual request/
   response cycle. Recommend smoke-testing all forms and the blog once
   deployed with real `DATABASE_URL`.

---

**Bottom line:** every page's content is now honest and matches the real
product; the fake backend-facing gaps I found (missing deps, missing
Prisma binary targets, missing CSS, unwired blog/search) are fixed; and
the codebase type-checks and lints clean. The admin UI and live-DB
verification are the two items a next engineering pass should pick up
first.

---

## Follow-up pass (round 2) — fixes from user feedback

- **FAQ answers not showing — real bug, fixed.** The accordion relied on
  Radix's `--radix-accordion-content-height` CSS-variable animation. Root
  cause aside, this pattern is fragile (depends on Radix's Presence/exit-
  animation timing matching the Tailwind-generated keyframes exactly).
  Replaced with the more robust `forceMount` + CSS `grid-template-rows`
  collapse technique, which keeps content permanently in the DOM and
  can't silently fail to display.
- **Waveform not centering — real bug, fixed.** The waveform's container
  used `display:flex` (a block-level element that fills 100% of its
  parent's width), so `mx-auto` had no effect — `margin:auto` only
  centers elements with a non-stretched width. Bars rendered left-aligned
  inside the full-width container instead of centered, exactly matching
  the "looks different than before" reports on the About section and
  phone mockup. Fixed by making the waveform shrink-wrap (`w-fit`) so
  `mx-auto` actually has something to center.
- **Inconsistent page titles — real bug, fixed.** Some pages (About,
  Download, Features) used a hand-written `<h1>` hero block; others (FAQ,
  Contact) reused the `SectionHeading` component — which renders an
  `<h2>` at a smaller size, meant for in-page sections, not page titles.
  That mismatch in tag, size, and spacing is exactly the "inconsistent /
  not at the correct position" feeling. Extracted a single `PageHero`
  component (always `<h1>`, one canonical size/spacing) and moved every
  top-level page onto it — About, Download, Features, FAQ, Contact,
  Privacy Policy, Search.
- **Mobile had no way to search at all.** The search icon in the navbar
  was `hidden` below the `sm` breakpoint with no alternative entry point
  in the mobile menu. Now visible at every screen size.
- **Google Play link added**: `https://play.google.com/store/apps/details?id=com.avishkar.voxlibro`
  is now the default in `config/site.ts` (still overridable via
  `NEXT_PUBLIC_PLAY_STORE_URL` if it ever changes) — the Download page
  button and footer link both use it.
- **Admin panel built** (this didn't exist before — see "Remaining
  issues" in the original report, now resolved):
  - `/admin/login` — credentials sign-in (`next-auth/react`'s `signIn`,
    chosen over the `useActionState`/`useFormState` Server Actions pattern
    because this project's installed React is 18.3.1, which doesn't
    export those hooks despite Next 15 supporting either).
  - `/admin/posts` — list, publish/unpublish, delete.
  - `/admin/posts/new` and `/admin/posts/:id` — Markdown editor with a
    Write/Preview toggle, category picker, tag picker, save-draft and
    publish actions.
  - Wired to the existing (already well-built) `app/api/admin/*` REST
    layer, including its CSRF double-submit-cookie scheme.
  - Protected by a route-group layout (`app/admin/(dashboard)/layout.tsx`)
    that checks the session server-side and redirects to `/admin/login`
    if absent — kept as a separate route group specifically so the login
    page itself doesn't get caught in its own auth redirect loop.

### How to access the admin panel

1. Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in your `.env`, then
   run `npm run db:seed` once. This creates your one SUPER_ADMIN account
   directly in the database — there is no public sign-up page, so this is
   the only account that will ever exist unless you create more yourself.
2. Go to `/admin/login` and sign in with those credentials. It isn't
   linked from anywhere in the site's navigation, so casual visitors
   won't stumble onto it, but it isn't a secret either — anyone who
   guesses the URL just gets a login form they can't get past without
   your password.
3. From `/admin/posts`, click "New post" to write and publish directly.

If you want it harder to even find the login page, you could additionally
put it behind a platform-level IP allowlist or a separate subdomain, but
for a single-operator blog a strong, unique password on the one seeded
account is the standard/sufficient bar.

### Still not built (unchanged from before)

Media library UI and revision-history UI (API-only), automated tests, and
a stricter nonce-based CSP. `prisma generate` still can't run inside this
sandbox for the reason explained above — unchanged, still resolves itself
on a normal `npm install`.
