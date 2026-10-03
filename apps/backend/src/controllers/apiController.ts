import { Request, Response } from 'express';
import { parseResume } from '../services/resumeParser';
import { rankCandidate } from '../services/ranker';
import { findUserByEmail, signToken, verifyPassword } from '../services/authService';
import { ok, fail } from '../utils/apiResponse';
import { getCached, setCached } from '../services/redisCache';
import { buildMatchBreakdown } from '../services/matchingService';
import {
  getJobs,
  getCandidates,
  getApplications,
  createJob as dbCreateJob,
  createCandidate as dbCreateCandidate,
  createApplication,
  updateApplicationStatus,
  updateCandidateStatus,
  createResume,
  scheduleInterview,
  getJobByTitle
} from '../services/databaseService';
import { Resume } from '../types';

export async function health(req: Request, res: Response) {
  res.json(ok('Recruitment platform backend is healthy', { uptime: process.uptime() }));
}

export async function login(req: Request, res: Response) {
  const email = req.body?.email;
  const password = req.body?.password;

  if (!email || !password) {
    return res.status(400).json(fail('Email and password are required'));
  }

  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user)) {
    return res.status(401).json(fail('Invalid email or password'));
  }

  return res.json(ok('Login successful', { token: signToken(user), user: { id: user.id, email: user.email, role: user.role } }));
}

export async function listJobs(req: Request, res: Response) {
  const cacheKey = 'jobs:list';
  const cached = await getCached(cacheKey);
  if (cached) {
    return res.json(ok('Jobs retrieved from cache', cached));
  }

  const jobs = await getJobs();
  await setCached(cacheKey, jobs, 120);
  return res.json(ok('Jobs retrieved', jobs));
}

export async function listCandidates(req: Request, res: Response) {
  const skills = req.query.skills as string;
  const status = req.query.status as string;
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 10);

  const candidates = await getCandidates();
  const filtered = candidates.filter((candidate) => {
    const passStatus = !status || candidate.currentStatus === status;
    const passSkill = !skills || String(candidate.email).toLowerCase().includes(skills.toLowerCase());
    return passStatus && passSkill;
  });

  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return res.json(ok('Candidates retrieved', { items: paged, total: filtered.length, page, pageSize }));
}

export async function listApplications(req: Request, res: Response) {
  const applications = await getApplications();
  return res.json(ok('Applications retrieved', applications));
}

export async function createJob(req: Request, res: Response) {
  try {
    const job = await dbCreateJob({
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      salaryMin: req.body.salaryMin,
      salaryMax: req.body.salaryMax,
      employmentType: req.body.employmentType,
      status: req.body.status || 'draft',
      seniority: req.body.seniority,
      description: req.body.description,
      requirements: req.body.requirements || [],
      createdBy: req.body.createdBy || '11111111-1111-1111-1111-111111111111'
    });

    await invalidateJobCache();
    return res.json(ok('Job created', job));
  } catch (error) {
    return res.status(400).json(fail('Failed to create job', error instanceof Error ? error.message : 'Unknown error'));
  }
}

export async function createCandidate(req: Request, res: Response) {
  try {
    const candidate = await dbCreateCandidate({
      userId: req.body.userId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      yearsOfExperience: req.body.yearsOfExperience || 0,
      location: req.body.location || 'Unknown',
      currentStatus: req.body.currentStatus || 'draft'
    });

    return res.json(ok('Candidate created', candidate));
  } catch (error) {
    return res.status(400).json(fail('Failed to create candidate', error instanceof Error ? error.message : 'Unknown error'));
  }
}

export async function createApplicationEndpoint(req: Request, res: Response) {
  try {
    const application = await createApplication({
      jobId: req.body.jobId,
      candidateId: req.body.candidateId,
      status: req.body.status || 'review',
      source: req.body.source || 'career-site',
      appliedAt: new Date().toISOString(),
      reviewScore: req.body.reviewScore || 0,
      scoreBreakdown: req.body.scoreBreakdown || {}
    });

    return res.json(ok('Application created', application));
  } catch (error) {
    return res.status(400).json(fail('Failed to create application', error instanceof Error ? error.message : 'Unknown error'));
  }
}

export async function updateApplicationStatusEndpoint(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json(fail('Status is required'));
  }

  const app = await updateApplicationStatus(id, status);
  if (!app) {
    return res.status(404).json(fail('Application not found'));
  }

  return res.json(ok('Application status updated', app));
}

export async function createResumeEndpoint(req: Request, res: Response) {
  const rawText = req.body.rawText || '';
  if (!rawText.trim()) {
    return res.status(400).json(fail('Resume text is required'));
  }

  try {
    const parsed = parseResume(rawText);
    const resume: Omit<Resume, 'id' | 'parsedAt'> = {
      candidateId: req.body.candidateId,
      fileName: req.body.fileName || 'resume.txt',
      rawText,
      skills: parsed.skills,
      education: parsed.education,
      experience: parsed.experience,
      summary: parsed.summary,
      status: 'parsed'
    };

    const stored = await createResume(resume);
    return res.json(ok('Resume parsed and stored', { parsed, resume: stored }));
  } catch (error) {
    return res.status(400).json(fail('Resume parsing failed', error instanceof Error ? error.message : 'Unknown error'));
  }
}

export async function skillMatch(req: Request, res: Response) {
  const resumeText = req.query.resume as string || 'Avery Morgan - JavaScript React Node.js PostgreSQL TypeScript Docker REST API team lead experience';
  const parsed = parseResume(resumeText);
  const match = rankCandidate(parsed.skills, { title: 'Senior Full-stack Engineer', minimumSkills: ['typescript', 'react', 'node.js', 'postgresql'] });
  return res.json(ok('Skill match computed', { parsed, match }));
}

export async function matchCandidateToJob(req: Request, res: Response) {
  const { jobTitle, resumeText } = req.body || {};
  if (!jobTitle || !resumeText) {
    return res.status(400).json(fail('jobTitle and resumeText are required'));
  }

  try {
    const parsed = parseResume(resumeText);
    const job = await getJobByTitle(jobTitle);
    const requirements = job?.requirements ?? [];
    const breakdown = buildMatchBreakdown({
      id: 'resume-parse',
      candidateId: 'candidate-parse',
      fileName: 'resume.txt',
      rawText: resumeText,
      parsedAt: new Date().toISOString(),
      skills: parsed.skills,
      education: parsed.education,
      experience: parsed.experience,
      summary: parsed.summary,
      status: 'parsed'
    }, jobTitle, requirements);

    return res.json(ok('Transparent match breakdown generated', breakdown));
  } catch (error) {
    return res.status(400).json(fail('Match breakdown failed', error instanceof Error ? error.message : 'Unknown error'));
  }
}

export async function scheduleInterviewEndpoint(req: Request, res: Response) {
  const { applicationId, jobId, candidateId, interviewerId, scheduledAt, mode } = req.body || {};
  if (!applicationId || !jobId || !candidateId || !interviewerId || !scheduledAt || !mode) {
    return res.status(400).json(fail('applicationId, jobId, candidateId, interviewerId, scheduledAt, and mode are required'));
  }

  try {
    const interview = await scheduleInterview({
      applicationId,
      jobId,
      candidateId,
      interviewerId,
      scheduledAt,
      mode,
      status: 'scheduled'
    });

    return res.json(ok('Interview scheduled', interview));
  } catch (error) {
    return res.status(400).json(fail('Interview scheduling failed', error instanceof Error ? error.message : 'Unknown error'));
  }
}

export async function candidateStatusUpdate(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body || {};
  if (!status) {
    return res.status(400).json(fail('status is required'));
  }

  try {
    const candidate = await updateCandidateStatus(id, status);
    if (!candidate) {
      return res.status(404).json(fail('Candidate not found'));
    }

    return res.json(ok('Candidate status updated', candidate));
  } catch (error) {
    return res.status(400).json(fail('Candidate status update failed', error instanceof Error ? error.message : 'Unknown error'));
  }
}

async function invalidateJobCache() {
  await setCached('jobs:list', [], 1);
}
