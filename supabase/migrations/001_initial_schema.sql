-- Career Dreamer + Demand Intelligence Schema
-- Run in Supabase SQL Editor or via `supabase db push`

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector for embeddings (Supabase has this by default)
CREATE EXTENSION IF NOT EXISTS vector;

-- Platform Students (for registration / login)
CREATE TABLE IF NOT EXISTS platform_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  city TEXT DEFAULT 'Unknown',
  age INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage events (replaces in-memory tracking)
CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event TEXT NOT NULL,
  name TEXT DEFAULT 'Anonymous',
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students (PII decoupled: use email_hash only for analytics)
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_hash TEXT,
  major TEXT,
  year TEXT,
  consent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions: student dreams + embeddings
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id),
  dream_text TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opportunities (workshops, internships, etc.)
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT,
  description TEXT,
  link TEXT,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Archetypes for keyword/vector matching
CREATE TABLE IF NOT EXISTS archetypes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  keywords TEXT[],
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events for analytics (view/click)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES submissions(id),
  opportunity_id UUID REFERENCES opportunities(id),
  type TEXT CHECK (type IN ('view', 'click')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_events_submission ON events(submission_id);
CREATE INDEX IF NOT EXISTS idx_events_opportunity ON events(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_platform_students_email ON platform_students(email);
CREATE INDEX IF NOT EXISTS idx_usage_events_event ON usage_events(event);

-- Student Applications (tracks who applied to what)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES platform_students(id),
  internship_id TEXT NOT NULL,
  sector TEXT,
  role TEXT,
  company TEXT,
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'reviewed', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_internship ON applications(internship_id);

-- Managed Internships (employer-created internships)
CREATE TABLE IF NOT EXISTS managed_internships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  sector TEXT NOT NULL,
  location TEXT DEFAULT 'Accra',
  description TEXT,
  capacity INTEGER DEFAULT 10,
  is_open BOOLEAN DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_managed_internships_sector ON managed_internships(sector);
CREATE INDEX IF NOT EXISTS idx_managed_internships_open ON managed_internships(is_open);

-- Seed archetypes (Week 1 keyword matching)
INSERT INTO archetypes (title, description, keywords) VALUES
  ('Tech Innovator', 'Building software, startups, and digital products', ARRAY['software', 'coding', 'startup', 'tech', 'developer', 'programming', 'app', 'web']),
  ('Research Pioneer', 'Academic research, labs, and discovery', ARRAY['research', 'lab', 'phd', 'academic', 'publish', 'experiment', 'discovery', 'science']),
  ('Social Impact Leader', 'Nonprofits, policy, and community change', ARRAY['nonprofit', 'policy', 'community', 'social impact', 'advocacy', 'justice', 'sustainability']),
  ('Creative Professional', 'Design, arts, media, and content', ARRAY['design', 'art', 'creative', 'media', 'film', 'music', 'writing', 'content']),
  ('Business Builder', 'Consulting, finance, and corporate leadership', ARRAY['consulting', 'finance', 'business', 'corporate', 'management', 'leadership', 'investment'])
ON CONFLICT DO NOTHING;
