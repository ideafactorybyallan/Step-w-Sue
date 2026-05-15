# Step w Sue 👟

**Sue's 3rd Official Annual Victoria Day Step Challenge** — a family PWA step tracker.

> 4 weeks · ~10 participants · May 18 – June 14, 2026 · Ontario, Canada

---

## What This App Does

- Family members join with a shared challenge password
- Create a simple account (name + PIN)
- Log daily or weekly steps
- See live leaderboards — overall and weekly
- Compete for cash prizes ($40 buy-in per person)
- Works on iPhone Safari, installable to home screen as a PWA

---

## Setup (one-time, ~20 minutes)

### Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project**, choose a name (e.g. "step-w-sue"), pick a region close to Ontario
3. Wait for it to initialize (~1 minute)
4. Go to **Settings → API**
5. Copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **service_role** key (under "Project API keys" — the long secret one)

### Step 2 — Set up the database

1. In Supabase, go to **SQL Editor → New Query**
2. Copy the entire contents of `supabase/schema.sql` in this repo
3. Paste it and click **Run**
4. You should see "Success" — 5 tables created

**Optional:** If you want test data to make the leaderboard look populated before anyone joins, also run `supabase/seed.sql`. Delete the test accounts from `/admin` before going live.

### Step 3 — Deploy to Vercel

1. Push this repo to GitHub (if you haven't already)
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**
3. Import your GitHub repo
4. Before clicking Deploy, go to **Environment Variables** and add:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role key |
| `JWT_SECRET` | A random string, 32+ characters (use a password manager to generate) |
| `ADMIN_PASSWORD` | A password you'll remember — for accessing `/admin` |
| `CHALLENGE_PASSWORD` | `Bluejays` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL (add after first deploy) |

5. Click **Deploy**
6. Your app is live! Copy the `.vercel.app` URL

### Step 4 — Generate app icons

```bash
npm run generate-icons
```

This creates the PWA icon files in `public/icons/`. Commit and push them so Vercel picks them up.

**For a polished custom icon:** Use [realfavicongenerator.net](https://realfavicongenerator.net) to create proper branded icons and replace the files in `public/icons/`.

---

## Sharing With Family

1. Share your Vercel URL in the family group chat
2. Tell everyone the challenge password: **Bluejays**
3. iPhone instructions for the home screen experience:
   - Open the link in **Safari** (not Chrome!)
   - Tap the **Share** button (square with arrow pointing up)
   - Scroll down and tap **Add to Home Screen**
   - Tap **Add** — the app appears on their home screen like a real app!

---

## Admin Panel

Go to: `[your-app-url]/admin`

Enter your `ADMIN_PASSWORD` to access the admin dashboard.

**What you can do:**
- **People tab:** See all participants, reset someone's PIN if they forget it, remove test accounts
- **Steps tab:** See all submissions, override a step total if someone entered wrong data
- **Weeks tab:** Lock a week once winners are finalized (prevents further edits)
- **Announce tab:** Post messages that appear on the home screen for everyone

**Admin tips:**
- Lock a week after you've verified everyone's submissions and are ready to declare the winner
- Reset PIN is for when someone forgets their 4-digit code — set a new one and text it to them
- Delete test participants before going live (if you ran seed.sql)

---

## How The App Works For Users

### Joining (first time)
1. Open the app → "Join the Challenge"
2. Enter the challenge password (`Bluejays`)
3. Enter your name + optional nickname
4. Set a 4–6 digit PIN
5. You're in! The app remembers you on this device for 30 days.

### Logging steps (weekly, by Monday midnight)
1. Tap **My Steps** tab
2. Select the current week
3. Choose "Daily steps" or "Weekly total"
4. Daily mode: enter each day's steps — the weekly total auto-calculates
5. Weekly mode: enter one number for the whole week
6. Tap **Submit** — confetti fires, steps appear on the leaderboard 🎉

### Signing back in
1. Open the app → "I Already Have an Account"
2. Tap your name → enter your PIN

---

## Challenge Structure

| Week | Dates | Submit By |
|---|---|---|
| Week 1 | May 18–24, 2026 | May 25 (Mon) |
| Week 2 | May 25–31, 2026 | Jun 1 (Mon) |
| Week 3 | Jun 1–7, 2026 | Jun 8 (Mon) |
| Week 4 | Jun 8–14, 2026 | Jun 15 (Mon) |

**Buy-in:** $40/person ($20 overall + $20 weekly)

**Prizes (based on 10 participants):**
- Overall champion (most total steps): **$200**
- Each weekly winner (most steps that week): **$50**
- Total prize pool: **$400**

---

## Known Limitations

- **No forgotten PIN recovery flow** — admin must reset PINs manually via `/admin`
- **No email/push notifications** — submission reminders are in-app only (Monday banner)
- **Icons are generated programmatically** — replace with proper artwork for a polished look
- **No real-time auto-refresh** — leaderboard updates when you navigate to it or reload
- **Tied steps:** whoever submitted first wins

---

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Supabase** (PostgreSQL database, service role key)
- **Vercel** (hosting)
- **Tailwind CSS** (styling)
- **jose** (JWT session cookies)
- **bcryptjs** (PIN hashing)
- **canvas-confetti** (celebration effects)
- **lucide-react** (icons)

---

## Local Development

```bash
# 1. Copy env file and fill in your values
cp .env.example .env.local

# 2. Install dependencies
npm install

# 3. Generate icons (one time)
npm run generate-icons

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Future Ideas (not built yet)

- Push notification reminders on Mondays
- Shareable weekly summary card
- Most improved week badge
- Historical challenge archives (2024, 2025)
- Photo upload for walk evidence 📸
