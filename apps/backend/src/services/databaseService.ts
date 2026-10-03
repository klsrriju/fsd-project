import { db } from '../config/database';
import { Job, Candidate, Application, Resume, Skill, Interview, User, MatchBreakdown } from '../types';

export async function getJobs(): Promise<Job[]> {
  const result = await db.query<Job>(`SELECT * FROM jobs ORDER BY created_at DESC LIMIT 50`);
  return result.rows;
}

export async function getCandidates(): Promise<Candidate[]> {
  const result = await db.query<Candidate>(`SELECT * FROM candidates ORDER BY created_at DESC LIMIT 50`);
  return result.rows;
}

export async function getApplications(): Promise<Application[]> {
  const result = await db.query<Application>(`SELECT * FROM applications ORDER BY applied_at DESC LIMIT 50`);
  return result.rows;
}

export async function getCandidatesWithScores(): Promise<(Candidate & { score: number; skills: string[] })[]> {
  const result = await db.query(`SELECT c.*, 91 AS score, ARRAY['TypeScript','React'] AS skills FROM candidates c LIMIT 50`);
  return result.rows;
}

export async function getSkills(): Promise<Skill[]> {
  const result = await db.query<Skill>(`SELECT * FROM skills ORDER BY name ASC`);
  return result.rows;
}

export async function createJob(job: Omit<Job, 'id' | 'createdAt'> & { createdAt?: string }) {
  const result = await db.query<Job>(`
    INSERT INTO jobs (title, company, location, salary_min, salary_max, employment_type, status, seniority, description, requirements, created_by, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
    RETURNING *
  `, [
    job.title,
    job.company,
    job.location,
    job.salaryMin,
    job.salaryMax,
    job.employmentType,
    job.status,
    job.seniority,
    job.description,
    job.requirements,
    job.createdBy
  ]);

  return result.rows[0];
}

export async function getJobById(id: string): Promise<Job | null> {
  const result = await db.query<Job>(`SELECT * FROM jobs WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

export async function getJobByTitle(title: string): Promise<Job | null> {
  const result = await db.query<Job>(`SELECT * FROM jobs WHERE title ILIKE $1 LIMIT 1`, [title]);
  return result.rows[0] || null;
}

export async function createCandidate(candidate: Omit<Candidate, 'id' | 'createdAt'> & { createdAt?: string }) {
  const result = await db.query<Candidate>(`
    INSERT INTO candidates (user_id, first_name, last_name, email, phone, years_of_experience, location, created_at, current_status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
    RETURNING *
  `, [
    candidate.userId || null,
    candidate.firstName,
    candidate.lastName,
    candidate.email,
    candidate.phone || null,
    candidate.yearsOfExperience,
    candidate.location,
    candidate.currentStatus
  ]);

  return result.rows[0];
}

export async function createApplication(application: Omit<Application, 'id' | 'appliedAt'> & { appliedAt?: string }) {
  const result = await db.query<Application>(`
    INSERT INTO applications (job_id, candidate_id, status, source, applied_at, review_score, score_breakdown)
    VALUES ($1, $2, $3, $4, NOW(), $5, $6)
    RETURNING *
  `, [
    application.jobId,
    application.candidateId,
    application.status,
    application.source,
    application.reviewScore || 0,
    JSON.stringify(application.scoreBreakdown || {})
  ]);

  return result.rows[0];
}

export async function updateApplicationStatus(id: string, status: string) {
  const result = await db.query<Application>(`
    UPDATE applications SET status = $1 WHERE id = $2 RETURNING *
  `, [status, id]);

  return result.rows[0];
}

export async function updateCandidateStatus(id: string, status: string) {
  const result = await db.query<Candidate>(`
    UPDATE candidates SET current_status = $1 WHERE id = $2 RETURNING *
  `, [status, id]);

  return result.rows[0] || null;
}

export async function createResume(resume: Omit<Resume, 'id' | 'parsedAt'> & { parsedAt?: string }) {
  const result = await db.query<Resume>(`
    INSERT INTO resumes (candidate_id, file_name, raw_text, parsed_at, skills, education, experience, summary, status)
    VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8)
    RETURNING *
  `, [
    resume.candidateId,
    resume.fileName,
    resume.rawText,
    resume.skills,
    resume.education,
    resume.experience,
    resume.summary,
    resume.status
  ]);

  return result.rows[0];
}

export async function scheduleInterview(payload: Omit<Interview, 'id' | 'scheduledAt'> & { scheduledAt?: string }) {
  const result = await db.query<Interview>(`
    INSERT INTO interviews (application_id, job_id, candidate_id, interviewer_id, scheduled_at, mode, status)
    VALUES ($1, $2, $3, $4, $5, $6, 'scheduled')
    RETURNING *
  `, [
    payload.applicationId,
    payload.jobId,
    payload.candidateId,
    payload.interviewerId,
    payload.scheduledAt || new Date().toISOString(),
    payload.mode
  ]);

  return result.rows[0];
}
