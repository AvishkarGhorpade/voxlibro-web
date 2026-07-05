# Going live — full setup checklist

This walks through every environment variable the app actually reads
(verified directly against the code, not guessed), where to get each
value, and how to deploy so the search/FAQ fixes actually take effect.

## First — about "search and FAQ do nothing"

I re-checked both components line by line and also ran `next build`
again, which recompiles and prerenders every page — it succeeds cleanly
with the fixed code. There's no remaining bug in what I sent you.

The near-certain explanation: **the live site is still running the old
build.** Fixing the code in the zip I gave you doesn't change anything
live until you actually redeploy it. Please do this to confirm:

1. Unzip the latest file I sent over your existing project folder
   (replacing the old files).
2. `npm install`
3. `npm run dev`, open `http://localhost:3000/faq`, click a question. If
   it expands locally, the fix is real and it's purely a deploy-it step.
4. Push/redeploy to your host (Vercel, etc.) so the live site picks up
   the new build.

If it still doesn't work *after* a real redeploy, tell me the exact
error from your browser's console (F12 → Console tab) when you click —
that'll tell us immediately what's actually happening rather than
guessing.

---

## Environment variables — what's required vs optional

| Variable | Required? | Why |
|---|---|---|
| `DATABASE_URL` | **Required** | Postgres connection — the whole site (blog, admin, contact) needs a database |
| `DIRECT_URL` | **Required** | Same database, direct (non-pooled) connection, needed only for migrations |
| `NEXTAUTH_SECRET` | **Required** | Encrypts admin login sessions |
| `ANALYTICS_SALT` | **Required** | Used to one-way-hash visitor IPs for analytics — never invent, just generate |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | **Required once** | Creates your one admin login |
| `NEXT_PUBLIC_SITE_URL` | **Required** | Your real domain — used in sitemap, RSS, canonical URLs, JSON-LD |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Recommended | Shared rate-limiting across serverless instances. Without it, rate limiting still works but only per-instance (fine for low traffic, not bulletproof at scale) |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | Optional | Only needed if you upload cover images for blog posts via the admin media API |
| `NEXT_PUBLIC_PLAY_STORE_URL` | Optional | Already defaults to your real Play Store link — only set this if it ever changes |
| `NEXT_PUBLIC_GITHUB_URL` / `_TWITTER_URL` / `_CONTACT_EMAIL` | Optional | Each stays hidden from the site until you set it |
| `NEXTAUTH_URL` | Optional | Auth already auto-detects the domain from the request (`trustHost: true` in `lib/auth.ts`); setting it explicitly is just extra safety |

---

## 1. Database — Supabase (free tier works fine)

1. Go to **supabase.com** → sign up → **New project**.
2. Pick a strong database password when prompted (Supabase asks you to
   set one) — save it somewhere safe.
3. Once the project finishes provisioning: **Project Settings → Database**.
4. You'll see two connection strings:
   - **Connection pooling** (port `6543`, mode "Transaction") → this is
     your `DATABASE_URL`. Add `?pgbouncer=true` to the end.
   - **Direct connection** (port `5432`) → this is your `DIRECT_URL`.
5. Paste both into your `.env`, replacing `[PASSWORD]` and `[HOST]` with
   your actual password and project host.

Any other managed Postgres (Neon, Railway, Render, RDS) works too — just
make sure you have both a pooled and a direct connection string if your
host distinguishes between them.

## 2. NEXTAUTH_SECRET and ANALYTICS_SALT — generate locally, no signup

Run in a terminal:
```bash
openssl rand -base64 32   # → NEXTAUTH_SECRET
openssl rand -hex 16      # → ANALYTICS_SALT
```
No account needed — these are just random secrets only your server knows.

## 3. Your admin login

Pick your own real email and a strong password:
```
SEED_ADMIN_EMAIL="you@yourdomain.com"
SEED_ADMIN_PASSWORD="something-long-and-unique"
```
This is the account you'll actually sign in with at `/admin/login`.

## 4. NEXT_PUBLIC_SITE_URL

Your real deployed domain, e.g. `https://voxlibro.com` or whatever
Vercel gives you, e.g. `https://voxlibro.vercel.app`. No trailing slash.

## 5. Upstash Redis (recommended, free tier available)

1. Go to **upstash.com** → sign up → **Create database**.
2. Choose the **Regional** type (simplest), pick a region close to where
   you'll deploy (e.g. same region as Vercel).
3. On the database's page, scroll to **REST API** — copy `UPSTASH_REDIS_REST_URL`
   and `UPSTASH_REDIS_REST_TOKEN` directly from there.

## 6. Cloudinary (only if you want cover images on blog posts)

1. Go to **cloudinary.com** → sign up (free tier).
2. Your **Dashboard** homepage shows Cloud Name, API Key, and API Secret
   right at the top — copy all three directly.

---

## Deploying

```bash
npm install
npx prisma generate
npx prisma migrate deploy     # applies the database schema
npm run db:seed               # creates your one admin account — run once
npm run build
npm start                     # or deploy this build to your host
```

If you're deploying to **Vercel**: connect your GitHub repo, paste all
the env vars above into Project Settings → Environment Variables, and
Vercel runs `npm install` + `npm run build` automatically (the
`postinstall` script in `package.json` already runs `prisma generate`
for you). You still need to run `npx prisma migrate deploy` and
`npm run db:seed` once yourself (from your own machine, pointed at the
production `DATABASE_URL`) since Vercel doesn't run those automatically.

## After deploying — quick smoke test

- [ ] `/` loads, hero renders
- [ ] `/faq` — click a question, it expands
- [ ] Search icon in the navbar opens the command palette
- [ ] `/download` — Google Play button links out correctly
- [ ] `/contact` — submit the form, get a success message
- [ ] `/admin/login` — sign in with your seeded admin account
- [ ] `/admin/posts` → New post → write something → Publish → check it
      shows up at `/blog`
