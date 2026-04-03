# Pathfinder Africa — Deployment Guide

## Pre-Deployment Checklist

### 1. Rotate Your Supabase Keys (CRITICAL)
Your old keys were accidentally exposed. You MUST rotate them:

1. Go to [supabase.com](https://supabase.com) → your project
2. Navigate to **Settings → API**
3. Click **Regenerate** on both the anon key and the service role key
4. Copy the new keys — you'll need them in step 3

### 2. Run the Feedback Migration
Before deploying, run this new migration in your Supabase SQL Editor:

1. Go to your Supabase project → **SQL Editor**
2. Paste the contents of `supabase/migrations/003_feedback.sql`
3. Click **Run**

This creates the `user_feedback` table for the new feedback popup feature.

### 3. Create `.env.local` with New Keys
In your project root, create/update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_NEW_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_NEW_service_role_key_here
OPENAI_API_KEY=sk-...your_openai_key_here
```

> ⚠️ The Supabase URL is hardcoded in `src/lib/supabase.ts`. No need to set it as an env variable.

---

## GitHub Setup

### 4. Initialize Git & Push

```bash
cd /Users/loris/Downloads/Pathfindernew-main
git init
git add .
git commit -m "Pathfinder Africa v2 — feedback system, improved career matching"
git remote add origin https://github.com/V3-rs/Pathfindernew.git
git branch -M main
git push -u origin main
```

If the repo already has content and you need to force-push:
```bash
git push -u origin main --force
```

---

## Vercel Deployment

### 5. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Click **Import Git Repository** and select `V3-rs/Pathfindernew`
3. Framework Preset should auto-detect **Next.js**
4. Under **Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your NEW anon key from step 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | Your NEW service role key from step 1 |
| `OPENAI_API_KEY` | Your OpenAI API key (for CV/cover letter AI features) |

5. Click **Deploy** — Vercel will build and deploy automatically

---

## Custom Domain Setup

### 6. Connect `pathfinderafrica.org`

1. In your Vercel project → **Settings → Domains**
2. Add two domains:
   - `pathfinderafrica.org`
   - `www.pathfinderafrica.org`
3. Vercel will show DNS records to configure

### 7. DNS Configuration

At your domain registrar (wherever you bought `pathfinderafrica.org`), add these records:

| Type | Name | Value |
|------|------|-------|
| **A** | `@` | `76.76.21.21` |
| **CNAME** | `www` | `cname.vercel-dns.com` |

> 💡 DNS propagation takes 5–30 minutes. Vercel will automatically provision an SSL certificate.

### 8. Verify

Once deployed and DNS is propagated:
- `https://pathfinderafrica.org` → Main site
- `https://www.pathfinderafrica.org/admin` → Admin console
- `https://www.pathfinderafrica.org/resources` → Resources page
- `https://www.pathfinderafrica.org/internships` → Internships page

---

## Data Preservation

Your existing data is 100% preserved because:
- You're using the **same Supabase project** (`dmdtnmvmnkzrarkdrknx.supabase.co`)
- The new deployment just connects to it via environment variables
- No tables are dropped or modified — `003_feedback.sql` only adds a new table

---

## Continuous Deployment

After initial setup, every time you push to `main` on GitHub, Vercel will automatically redeploy. The workflow:

```
Edit code locally → git add . → git commit → git push → Vercel auto-deploys in ~60s
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails on Vercel | Check env variables are set correctly |
| Feedback popup doesn't appear | Run `003_feedback.sql` migration in Supabase SQL Editor |
| Custom domain not working | Wait 30 min for DNS, verify A/CNAME records |
| Admin panel empty | Verify `SUPABASE_SERVICE_ROLE_KEY` is set on Vercel |
| Old users can't login | Keys were rotated — this is expected. Users just re-register |
