CREATE TYPE user_role AS ENUM ('hr', 'recruiter', 'candidate');
CREATE TYPE employment_type AS ENUM ('full-time', 'part-time', 'contract', 'internship');
CREATE TYPE seniority_level AS ENUM ('junior', 'mid', 'senior', 'lead');
CREATE TYPE recruitment_status AS ENUM ('draft', 'active', 'closed', 'review', 'screening', 'interview', 'offer', 'hired', 'rejected');
CREATE TYPE interview_mode AS ENUM ('phone', 'video', 'onsite');
CREATE TYPE interview_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE resume_status AS ENUM ('pending', 'parsed', 'failed');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(160) NOT NULL,
  company VARCHAR(160) NOT NULL,
  location VARCHAR(160) NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  employment_type employment_type NOT NULL,
  status recruitment_status NOT NULL DEFAULT 'draft',
  seniority seniority_level NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  phone VARCHAR(60),
  years_of_experience INTEGER NOT NULL DEFAULT 0,
  location VARCHAR(160),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_status recruitment_status NOT NULL DEFAULT 'draft'
);

CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  raw_text TEXT NOT NULL,
  parsed_at TIMESTAMPTZ,
  skills TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  education TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  experience TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  summary TEXT,
  status resume_status NOT NULL DEFAULT 'pending'
);

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) UNIQUE NOT NULL,
  category VARCHAR(80) NOT NULL
);

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  status recruitment_status NOT NULL DEFAULT 'draft',
  source VARCHAR(80) NOT NULL DEFAULT 'career-site',
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  review_score INTEGER,
  score_breakdown JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  interviewer_id UUID NOT NULL REFERENCES users(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  mode interview_mode NOT NULL,
  status interview_status NOT NULL DEFAULT 'scheduled'
);

CREATE TABLE job_skills (
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  weight INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (job_id, skill_id)
);

CREATE TABLE candidate_skills (
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  confidence INTEGER NOT NULL DEFAULT 100,
  PRIMARY KEY (candidate_id, skill_id)
);

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_created_by ON jobs(created_by);
CREATE INDEX idx_candidates_status ON candidates(current_status);
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_resumes_candidate ON resumes(candidate_id);
CREATE INDEX idx_applications_job_candidate ON applications(job_id, candidate_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_interviews_scheduled_at ON interviews(scheduled_at);
CREATE INDEX idx_interviews_candidate ON interviews(candidate_id);
CREATE INDEX idx_skills_name ON skills(name);

CREATE EXTENSION IF NOT EXISTS pgcrypto;
