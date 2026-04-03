# Supabase Integration Guide — Career Dreamer / Pathfinder

## 1. Environment Variables

Create a `.env.local` file in the project root with these keys:

```env
# Supabase (required for all database features)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI (optional — enables AI-powered CV/cover letter generation)
OPENAI_API_KEY=sk-...your_key_here
```

### Where to find your Supabase keys:
1. Go to [supabase.com](https://supabase.com) → your project
2. Navigate to **Settings → API**
3. Copy the **anon/public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy the **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ The Supabase URL is already hardcoded in `src/lib/supabase.ts` as `https://dmdtnmvmnkzrarkdrknx.supabase.co`. If you change projects, update that file too.

---

## 2. Running Migrations

The database schema is defined in three migration files:

| File | Purpose |
|------|---------|
| `supabase/migrations/001_initial_schema.sql` | Students, submissions, applications, managed internships, archetypes |
| `supabase/migrations/002_employer_portal.sql` | Employer accounts, companies, listings, applications, demo tasks, interns |
| `supabase/migrations/003_feedback.sql` | User feedback (5-star ratings + notes) |

### To apply migrations:

**Option A — Supabase Dashboard (recommended for first setup):**
1. Go to your Supabase project → **SQL Editor**
2. Paste the contents of `001_initial_schema.sql` and run it
3. Then paste and run `002_employer_portal.sql`
4. Then paste and run `003_feedback.sql`

**Option B — Supabase CLI:**
```bash
npx supabase db push
```

---

## 3. Table-by-Table Mapping

### Student-Facing Tables

| Table | Used By | Description |
|-------|---------|-------------|
| `platform_students` | `/api/students`, Login modal | Student registration — name, email, city, age |
| `usage_events` | `/api/activity` | Tracks page views, CV downloads, feature usage |
| `applications` | `/api/applications/submit` | Student applications to internships |
| `user_feedback` | `/api/feedback` | 5-star ratings + notes from students (one per user) |

### Employer-Facing Tables

| Table | Used By | Description |
|-------|---------|-------------|
| `employer_accounts` | `/api/employer/auth` | Employer login credentials |
| `companies` | `/api/employer/profile` | Company profile (name, industry, contact) |
| `listings` | `/api/employer/listings` | Internship listings posted by employers |
| `employer_applications` | `/api/applications/submit`, employer dashboard | Applications received for listings |
| `demo_tasks` | Employer dashboard | Tasks sent to shortlisted applicants |
| `active_interns` | Employer dashboard | Accepted interns currently working |
| `milestones` | Employer dashboard | Intern milestone tracking |
| `check_ins` | Employer dashboard | Weekly check-in ratings |
| `employer_invites` | `/api/admin/invites` | Single-use invite tokens for employers |

### Admin-Managed Tables

| Table | Used By | Description |
|-------|---------|-------------|
| `managed_internships` | Admin panel | Admin-created internship listings |

### Content Management (JSON-based, no dedicated table)

The admin panel's "Resources" and "Bacheca" entries are managed through the `/api/admin/content` endpoint. Check if this uses Supabase or local JSON storage depending on your setup.

---

## 4. How Data Flows

### Student Registration Flow
```
Student fills login modal → POST /api/students/register
  → Inserts into `platform_students` table
  → Returns student data + stores in localStorage
```

### Internship Application Flow
```
Student clicks "Apply" on internship → POST /api/applications/submit
  → Inserts into `employer_applications` table
  → Links to `listings` and optionally `platform_students`
  → Employer sees application in their dashboard
```

### Admin Content Flow
```
Admin adds resource/listing → POST /api/admin/content
  → Stores data (Supabase or local)
  → Student-facing pages fetch from GET /api/admin/content
  → Resources page / Internships page display the data
```

### Employer Listing Flow
```
Employer creates listing → POST /api/employer/listings
  → Inserts into `listings` table
  → Students see it on /internships page via GET /api/employer/listings/public
```

---

## 5. Admin Panel CRUD — End-to-End Verification

### Adding Content from Admin
1. Log into admin panel at `/admin`
2. Add a new resource (name, URL, description, tags)
3. Navigate to `/resources` — verify the new resource appears with a "✦ New" badge
4. Add a new bacheca entry — verify it appears in the Bacheca section

### Deleting Content from Admin
1. In admin panel, remove a resource
2. Refresh `/resources` — verify it's gone
3. Same for bacheca entries

### Adding Internship Listings
1. Employer creates a listing via their portal
2. Navigate to `/internships` — verify the listing appears
3. Student applies → check employer dashboard for the application

### Student Account Sync
1. Student registers via the login modal
2. Check Supabase `platform_students` table — verify the row exists
3. Student's activity (CV downloads, page views) should appear in `usage_events`
4. Admin panel's "Student Insights" section should reflect the data

---

## 6. Row Level Security (RLS)

All employer tables have RLS enabled. The `service_role` key bypasses RLS, which is why server-side API routes use `getSupabaseAdmin()` (service role) while client-side code uses `getSupabase()` (anon key).

**Important:** Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client. It should only be used in server-side API routes (`/api/...`).

---

## 7. Troubleshooting

| Issue | Solution |
|-------|----------|
| "Registration failed" | Check that `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set and the `platform_students` table exists |
| Employer can't log in | Verify `employer_accounts` table has their email + password hash |
| Listings don't appear | Check `listings` table has `status = 'active'` entries |
| Admin content doesn't persist | Verify the admin content API is connected to Supabase (not just in-memory) |
| RLS errors | Make sure API routes use `getSupabaseAdmin()` (service role), not `getSupabase()` (anon) |

---

## 8. Quick Start Checklist

- [ ] Create Supabase project at [supabase.com](https://supabase.com)
- [ ] Copy anon key and service role key to `.env.local`
- [ ] Run migration `001_initial_schema.sql` in SQL Editor
- [ ] Run migration `002_employer_portal.sql` in SQL Editor
- [ ] Run migration `003_feedback.sql` in SQL Editor
- [ ] Start dev server: `npm run dev`
- [ ] Test student registration at the login modal
- [ ] Test admin panel at `/admin`
- [ ] Add a resource from admin → verify on `/resources`
- [ ] Create an employer account → post a listing → verify on `/internships`
- [ ] Wait 15s on career explorer → verify feedback popup appears
- [ ] Submit feedback → check `user_feedback` table in Supabase
- [ ] Check admin panel → Feedback tab shows the entry
