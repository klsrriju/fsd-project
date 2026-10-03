-- Recruitment seed data for local development
-- Users
INSERT INTO users (id, name, email, password_hash, role, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'HR Admin', 'hr@company.com', '$2a$10$V3T5kY6gmQmLrge2nOgd0OQkZ7Qh8bBz1F8gVJfPz5vhEI39wg3qK', 'hr', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Recruiter Lead', 'recruiter@company.com', '$2a$10$V3T5kY6gmQmLrge2nOgd0OQkZ7Qh8bBz1F8gVJfPz5vhEI39wg3qK', 'recruiter', NOW()),
  ('33333333-3333-3333-3333-333333333333', 'Candidate One', 'candidate@company.com', '$2a$10$V3T5kY6gmQmLrge2nOgd0OQkZ7Qh8bBz1F8gVJfPz5vhEI39wg3qK', 'candidate', NOW());

-- Skills
INSERT INTO skills (id, name, category)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'TypeScript', 'Language'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'React', 'Frontend'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Node.js', 'Backend'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'PostgreSQL', 'Database'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Redis', 'Caching'),
  ('ffffffff-ffffffff-ffffffff-ffffffffffffffff', 'Docker', 'Infrastructure');

-- Jobs
INSERT INTO jobs (id, title, company, location, salary_min, salary_max, employment_type, status, seniority, description, requirements, created_by, created_at)
VALUES
  ('44444444-4444-4444-4444-444444444444', 'Senior Full-stack Engineer', 'RecruitIQ', 'Remote', 120000, 150000, 'full-time', 'active', 'senior', 'Build secure, scalable recruitment platform APIs and dashboards.', ARRAY['TypeScript','React','Node.js','PostgreSQL'], '11111111-1111-1111-1111-111111111111', NOW()),
  ('55555555-5555-5555-5555-555555555555', 'Data Scientist', 'RecruitIQ', 'Hybrid', 110000, 140000, 'full-time', 'active', 'mid', 'Work on ranking, analytics, search and AI-assisted candidate matching.', ARRAY['Python','SQL','Statistics','Data Modeling'], '11111111-1111-1111-1111-111111111111', NOW());

-- Candidates
INSERT INTO candidates (id, user_id, first_name, last_name, email, phone, years_of_experience, location, created_at, current_status)
VALUES
  ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'Avery', 'Morgan', 'avery@company.com', '+1-555-111-1111', 7, 'San Francisco, CA', NOW(), 'screening'),
  ('77777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', 'Chris', 'Rivera', 'chris@company.com', '+1-555-222-2222', 5, 'Austin, TX', NOW(), 'interview');

-- Resumes
INSERT INTO resumes (id, candidate_id, file_name, raw_text, parsed_at, skills, education, experience, summary, status)
VALUES
  ('88888888-8888-8888-8888-888888888888', '66666666-6666-6666-6666-666666666666', 'avery_morgan_resume.pdf', 'Avery Morgan has over 7 years of experience building TypeScript React Node.js applications with PostgreSQL and REST APIs. Education: BS Computer Science. Experience includes full-stack leadership and technical design.', NOW(), ARRAY['TypeScript','React','Node.js','PostgreSQL','REST API'], ARRAY['BS Computer Science'], ARRAY['7 years full-stack engineering','technical design','application delivery'], 'Full-stack engineer with TypeScript, React, and Node.js experience.', 'parsed'),
  ('99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-777777777777', 'chris_rivera_resume.pdf', 'Chris Rivera has experience in Python SQL and analytics, Redis caching, and cross-functional data science work. Education: MS Data Science. Experience includes analytics dashboard and statistics modeling.', NOW(), ARRAY['Python','SQL','Redis','Statistics'], ARRAY['MS Data Science'], ARRAY['analytics dashboards','data science modeling'], 'Data scientist with analytics and SQL experience.', 'parsed');

-- Applications
INSERT INTO applications (id, job_id, candidate_id, status, source, applied_at, review_score, score_breakdown)
VALUES
  ('12121212-1212-1212-1212-121212121212', '44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', 'screening', 'career-site', NOW(), 91, '{"overallScore":91,"skillsScore":95,"experienceScore":92,"educationScore":84,"requirementsScore":95,"matchedSkills":["TypeScript","React","Node.js","PostgreSQL"],"missingSkills":[],"reasons":["Strong full-stack skill alignment","Experience matches senior engineering requirements"]}'),
  ('13131313-1313-1313-1313-131313131313', '55555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777', 'interview', 'referral', NOW(), 86, '{"overallScore":86,"skillsScore":90,"experienceScore":84,"educationScore":88,"requirementsScore":84,"matchedSkills":["Python","SQL","Statistics"],"missingSkills":["Data Modeling"],"reasons":["Strong analytics and model experience","Partial skill match for job requirements"]}');

-- Interviews
INSERT INTO interviews (id, application_id, job_id, candidate_id, interviewer_id, scheduled_at, mode, status)
VALUES
  ('14141414-1414-1414-1414-141414141414', '12121212-1212-1212-1212-121212121212', '44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', '2026-02-03T10:00:00Z', 'video', 'scheduled');
