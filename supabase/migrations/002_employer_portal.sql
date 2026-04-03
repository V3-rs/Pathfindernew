-- Employer Portal Schema
-- Run after 001_initial_schema.sql

-- Add role column to platform_students for role-based routing
ALTER TABLE platform_students ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student' CHECK (role IN ('student', 'employer', 'anonymous'));

-- Employer accounts (separate from students)
CREATE TABLE IF NOT EXISTS employer_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies (employer profile)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID REFERENCES employer_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  industry TEXT NOT NULL DEFAULT '',
  size TEXT NOT NULL DEFAULT '',
  contact_name TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  hiring_intent TEXT DEFAULT '',
  profile_complete INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK from employer_accounts to companies (after both tables exist)
ALTER TABLE employer_accounts ADD CONSTRAINT fk_employer_company
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
  NOT VALID;

-- Internship listings (employer-posted)
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES employer_accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT DEFAULT 'Accra, Ghana',
  duration TEXT DEFAULT '3 months',
  pay_type TEXT CHECK (pay_type IN ('Paid', 'Stipend', 'Unpaid')) DEFAULT 'Unpaid',
  pay_amount TEXT,
  description TEXT NOT NULL,
  required_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  demo_task_required BOOLEAN DEFAULT false,
  deadline DATE,
  spots INTEGER DEFAULT 1,
  status TEXT CHECK (status IN ('draft','active','paused','closed','filled')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student applications to employer listings
CREATE TABLE IF NOT EXISTS employer_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES employer_accounts(id) ON DELETE CASCADE,
  student_id UUID REFERENCES platform_students(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  student_photo TEXT,
  student_university TEXT DEFAULT '',
  student_year TEXT DEFAULT '',
  skill_scores JSONB DEFAULT '{}'::JSONB,
  match_score INTEGER DEFAULT 0,
  career_path TEXT,
  cover_note TEXT,
  status TEXT CHECK (status IN ('pending','shortlisted','rejected','demo_task_sent','accepted')) DEFAULT 'pending',
  demo_task_id UUID,
  demo_task_score NUMERIC(4,1),
  previous_rating NUMERIC(3,1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Demo tasks sent to shortlisted applicants
CREATE TABLE IF NOT EXISTS demo_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES employer_applications(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES employer_accounts(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  template_title TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('sent','submitted','reviewed')) DEFAULT 'sent',
  submission_text TEXT,
  ai_score NUMERIC(4,1),
  ai_summary TEXT,
  ai_flags TEXT[],
  employer_notes TEXT,
  employer_decision TEXT CHECK (employer_decision IN ('pass','fail')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ
);

-- Active interns (accepted applicants who started)
CREATE TABLE IF NOT EXISTS active_interns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES employer_applications(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES employer_accounts(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  final_rating NUMERIC(3,1),
  status TEXT CHECK (status IN ('active','completed','terminated')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Milestones for each intern
CREATE TABLE IF NOT EXISTS milestones (
  id TEXT PRIMARY KEY,
  intern_id UUID REFERENCES active_interns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT CHECK (status IN ('pending','in_progress','complete')) DEFAULT 'pending'
);

-- Weekly check-ins
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intern_id UUID REFERENCES active_interns(id) ON DELETE CASCADE,
  week TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post-internship ratings
CREATE TABLE IF NOT EXISTS intern_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intern_id UUID REFERENCES active_interns(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES employer_accounts(id) ON DELETE CASCADE,
  overall_rating NUMERIC(3,1),
  skills_rating NUMERIC(3,1),
  attitude_rating NUMERIC(3,1),
  would_rehire BOOLEAN,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employer invite tokens (single-use, 7-day expiry)
CREATE TABLE IF NOT EXISTS employer_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT UNIQUE NOT NULL,
  email TEXT,
  note TEXT,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  used_by_email TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employer_invites_token ON employer_invites(token);
CREATE INDEX IF NOT EXISTS idx_employer_invites_used ON employer_invites(used);

-- Allow service role to manage invites
ALTER TABLE employer_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_employer_invites" ON employer_invites FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_employer_accounts_email ON employer_accounts(email);
CREATE INDEX IF NOT EXISTS idx_companies_employer ON companies(employer_id);
CREATE INDEX IF NOT EXISTS idx_listings_employer ON listings(employer_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_employer_applications_listing ON employer_applications(listing_id);
CREATE INDEX IF NOT EXISTS idx_employer_applications_employer ON employer_applications(employer_id);
CREATE INDEX IF NOT EXISTS idx_employer_applications_status ON employer_applications(status);
CREATE INDEX IF NOT EXISTS idx_demo_tasks_application ON demo_tasks(application_id);
CREATE INDEX IF NOT EXISTS idx_active_interns_employer ON active_interns(employer_id);
CREATE INDEX IF NOT EXISTS idx_milestones_intern ON milestones(intern_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_intern ON check_ins(intern_id);

-- Row Level Security (enable but allow service role full access)
ALTER TABLE employer_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_interns ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Allow service role to bypass RLS (used by server-side API)
CREATE POLICY "service_role_employer_accounts" ON employer_accounts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_companies" ON companies FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_listings" ON listings FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_employer_applications" ON employer_applications FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_demo_tasks" ON demo_tasks FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_active_interns" ON active_interns FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_milestones" ON milestones FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_check_ins" ON check_ins FOR ALL TO service_role USING (true) WITH CHECK (true);
