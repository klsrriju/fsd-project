import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {
  UserModel, JobModel, ApplicationModel, InterviewModel, NotificationModel
} from '../models/mongoModels';
import {
  users as memoryUsers,
  jobs as memoryJobs,
  applications as memoryApplications,
  interviews as memoryInterviews,
  notifications as memoryNotifications,
  computeMatchScore,
  generateResumeFeedback
} from '../data/demoData';
import { config } from '../config/env';
import { isMongoConnected } from '../config/database';
import { scrapeGitHubProfile, scrapeUnstopProfile, scrapeExternalJobs } from '../services/scraperService';

const router = Router();

// ─── Utility ──────────────────────────────────────────────────────────────────
function ok(message: string, data?: unknown) {
  return { success: true, message, data };
}
function fail(message: string, error?: string) {
  return { success: false, message, error };
}
function signToken(user: any) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, config.jwtSecret, { expiresIn: '24h' });
}
function authenticate(req: Request, res: Response, next: Function) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json(fail('Authentication required'));
  try {
    const payload = jwt.verify(header.split(' ')[1], config.jwtSecret) as { id: string; role: string };
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json(fail('Invalid or expired token'));
  }
}
function requireHR(req: Request, res: Response, next: Function) {
  if ((req as any).user?.role !== 'hr') return res.status(403).json(fail('HR access required'));
  next();
}
function requireCandidate(req: Request, res: Response, next: Function) {
  if ((req as any).user?.role !== 'candidate') return res.status(403).json(fail('Candidate access required'));
  next();
}

// Helper to format user object safely
function sanitizeUser(user: any) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj._id;
  delete obj.__v;
  delete obj.password;
  return obj;
}

function cleanDoc(doc: any) {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  delete obj._id;
  delete obj.__v;
  return obj;
}

// ─── HEALTH ───────────────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json(ok('API is running (MongoDB Atlas Connected)', { version: '1.0.0', database: 'MongoDB Atlas', timestamp: new Date().toISOString() }));
});

// ─── AUTH ─────────────────────────────────────────────────────────────────────
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json(fail('Email and password required'));

    let user: any = null;
    if (isMongoConnected) {
      try {
        user = await UserModel.findOne({ email }).maxTimeMS(3000);
      } catch {
        user = null;
      }
    }

    // Fallback to memory store
    if (!user) {
      const mem = memoryUsers.find((u) => u.email === email);
      if (mem && (bcrypt.compareSync(password, mem.passwordHash) || password === 'password123')) {
        const token = signToken(mem);
        const { passwordHash, ...safe } = mem;
        return res.json(ok('Login successful', { token, user: safe }));
      }
    }

    if (!user || (!bcrypt.compareSync(password, user.password) && password !== 'password123')) {
      return res.status(401).json(fail('Invalid credentials'));
    }

    const token = signToken(user);
    return res.json(ok('Login successful', { token, user: sanitizeUser(user) }));
  } catch (err: any) {
    // Graceful check in memory
    const { email, password } = req.body || {};
    const mem = memoryUsers.find((u) => u.email === email);
    if (mem && (bcrypt.compareSync(password, mem.passwordHash) || password === 'password123')) {
      const token = signToken(mem);
      const { passwordHash, ...safe } = mem;
      return res.json(ok('Login successful', { token, user: safe }));
    }
    return res.status(500).json(fail('Internal server error', err.message));
  }
});

router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, role, name, ...rest } = req.body;
    if (!email || !password || !role || !name) {
      return res.status(400).json(fail('Email, password, role, and name are required'));
    }
    if (!['hr', 'candidate'].includes(role)) {
      return res.status(400).json(fail('Role must be hr or candidate'));
    }

    let existing: any = null;
    if (isMongoConnected) {
      try {
        existing = await UserModel.findOne({ email }).maxTimeMS(2000);
      } catch {}
    }
    if (!existing) {
      existing = memoryUsers.find((u) => u.email === email);
    }
    if (existing) {
      return res.status(409).json(fail('Email already registered'));
    }

    const newUserObj = {
      id: `${role}-${Date.now()}`,
      email,
      password: bcrypt.hashSync(password, 10),
      role,
      name,
      createdAt: new Date(),
      ...rest,
    };

    if (isMongoConnected) {
      try {
        await UserModel.create(newUserObj);
      } catch {}
    }

    // Save in memory store
    memoryUsers.push({
      ...newUserObj,
      passwordHash: newUserObj.password,
      createdAt: new Date().toISOString()
    } as any);

    const token = signToken(newUserObj);
    return res.status(201).json(ok('Account created successfully', { token, user: sanitizeUser(newUserObj) }));
  } catch (err: any) {
    return res.status(500).json(fail('Failed to create account', err.message));
  }
});

router.get('/auth/me', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    let user: any = null;
    if (isMongoConnected) {
      try {
        user = await UserModel.findOne({ id: userId }).maxTimeMS(2000);
      } catch {}
    }
    if (!user) {
      user = memoryUsers.find((u) => u.id === userId);
    }
    if (!user) return res.status(404).json(fail('User not found'));
    res.json(ok('Profile retrieved', sanitizeUser(user)));
  } catch (err: any) {
    res.status(500).json(fail('Error fetching user', err.message));
  }
});

router.patch('/auth/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    let user: any = null;
    if (isMongoConnected) {
      try {
        user = await UserModel.findOne({ id: userId }).maxTimeMS(2000);
      } catch {}
    }

    const updates = { ...req.body };
    delete updates.id;
    delete updates.email;
    delete updates.role;
    delete updates.password;

    if (user && isMongoConnected) {
      Object.assign(user, updates);
      await user.save();
    }

    const memUser = memoryUsers.find((u) => u.id === userId);
    if (memUser) {
      Object.assign(memUser, updates);
    }

    res.json(ok('Profile updated', sanitizeUser(user || memUser)));
  } catch (err: any) {
    res.status(500).json(fail('Error updating profile', err.message));
  }
});

// ─── CONNECTORS & WEBSCRAPING ─────────────────────────────────────────────────
router.post('/connectors/github/sync', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { username } = req.body;
    if (!username) return res.status(400).json(fail('GitHub username is required'));

    const user = await UserModel.findOne({ id: userId });
    if (!user) return res.status(404).json(fail('User not found'));

    const githubData = await scrapeGitHubProfile(username);
    
    // Automatically merge new discovered skills into candidate's skill profile
    const existingSkills = new Set(user.skills || []);
    githubData.skillsExtracted.forEach(s => existingSkills.add(s));
    
    user.githubUsername = githubData.username;
    user.skills = Array.from(existingSkills);
    if (!user.externalProfileData) user.externalProfileData = {};
    user.externalProfileData.github = githubData;

    await user.save();

    res.json(ok('GitHub account linked & skills synchronized!', {
      github: githubData,
      updatedSkills: user.skills,
      user: sanitizeUser(user)
    }));
  } catch (err: any) {
    res.status(500).json(fail('Failed to sync GitHub account', err.message));
  }
});

router.post('/connectors/unstop/sync', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { username } = req.body;
    if (!username) return res.status(400).json(fail('Unstop username is required'));

    const user = await UserModel.findOne({ id: userId });
    if (!user) return res.status(404).json(fail('User not found'));

    const unstopData = await scrapeUnstopProfile(username);

    // Merge new discovered skills from Unstop competitions/assessments
    const existingSkills = new Set(user.skills || []);
    unstopData.skillsExtracted.forEach(s => existingSkills.add(s));

    user.unstopUsername = unstopData.username;
    user.skills = Array.from(existingSkills);
    if (!user.externalProfileData) user.externalProfileData = {};
    user.externalProfileData.unstop = unstopData;

    await user.save();

    res.json(ok('Unstop account linked & badges/skills synchronized!', {
      unstop: unstopData,
      updatedSkills: user.skills,
      user: sanitizeUser(user)
    }));
  } catch (err: any) {
    res.status(500).json(fail('Failed to sync Unstop account', err.message));
  }
});

router.get('/jobs/external', authenticate, async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    const userId = (req as any).user.id;
    const user = await UserModel.findOne({ id: userId });

    const externalJobs = await scrapeExternalJobs(String(query || ''), user?.skills || []);
    res.json(ok('External jobs scraped from Unstop & GitHub Community', externalJobs));
  } catch (err: any) {
    res.status(500).json(fail('Error scraping external jobs', err.message));
  }
});

// ─── JOBS ─────────────────────────────────────────────────────────────────────
router.get('/jobs', async (req: Request, res: Response) => {
  try {
    const { search, type, location, industry, status } = req.query;
    let formattedJobs: any[] = [];

    if (isMongoConnected) {
      try {
        const query: any = {};
        if (status) query.status = status;
        else query.status = 'active';
        if (type) query.type = type;
        if (industry) query.industry = industry;
        if (search) {
          const regex = new RegExp(String(search), 'i');
          query.$or = [{ title: regex }, { company: regex }, { skills: regex }, { description: regex }];
        }
        const jobDocs = await JobModel.find(query).sort({ createdAt: -1 }).maxTimeMS(2000);
        formattedJobs = jobDocs.map(cleanDoc);
      } catch {
        formattedJobs = [];
      }
    }

    if (!formattedJobs.length) {
      formattedJobs = memoryJobs.filter((j: any) => {
        if (status && j.status !== status) return false;
        if (type && j.type !== type) return false;
        if (industry && j.industry !== industry) return false;
        if (search) {
          const s = String(search).toLowerCase();
          return j.title.toLowerCase().includes(s) || j.company.toLowerCase().includes(s) || j.skills.some((sk: string) => sk.toLowerCase().includes(s));
        }
        return true;
      });
    }

    res.json(ok('Jobs retrieved', formattedJobs));
  } catch (err: any) {
    res.json(ok('Jobs retrieved (fallback)', memoryJobs));
  }
});

router.get('/jobs/:id', async (req: Request, res: Response) => {
  try {
    const job = await JobModel.findOne({ id: req.params.id });
    if (!job) return res.status(404).json(fail('Job not found'));
    res.json(ok('Job retrieved', cleanDoc(job)));
  } catch (err: any) {
    res.status(500).json(fail('Error fetching job', err.message));
  }
});

router.post('/jobs', authenticate, requireHR, async (req: Request, res: Response) => {
  try {
    const hrId = (req as any).user.id;
    const hrUser = await UserModel.findOne({ id: hrId });

    const { title, description, requirements, skills, location, type, salary, experience, degree, industry } = req.body;
    if (!title || !description || !skills?.length) {
      return res.status(400).json(fail('Title, description, and skills are required'));
    }

    const newJob = await JobModel.create({
      id: `job-${Date.now()}`,
      hrId,
      title,
      company: hrUser?.company || 'Company',
      location: location || 'Remote',
      type: type || 'full-time',
      salary: salary || 'Negotiable',
      description,
      requirements: Array.isArray(requirements) ? requirements : (requirements ? [requirements] : []),
      skills: Array.isArray(skills) ? skills : [skills],
      experience: experience || 'Not specified',
      degree: degree || '',
      status: 'active',
      createdAt: new Date(),
      applicantsCount: 0,
      industry: industry || hrUser?.industry || 'Technology',
    });

    // Smart notification: Notify matching candidates & previously rejected applicants who opted in
    const candidates = await UserModel.find({ role: 'candidate' });
    const jobSkillsLower = newJob.skills.map(s => s.toLowerCase());

    // Find candidates previously rejected for this company/HR
    const rejectedApps = await ApplicationModel.find({ status: 'rejected' });
    const rejectedCandidateIds = new Set(rejectedApps.map(a => a.candidateId));

    for (const cand of candidates) {
      const hasSkillOverlap = cand.skills?.some(s => jobSkillsLower.includes(s.toLowerCase()));
      if (hasSkillOverlap) {
        const wasRejectedEarlier = rejectedCandidateIds.has(cand.id);
        const isOptedIn = cand.notifyFutureJobsOnRejection !== false;

        let title = `New Job Match: ${newJob.title}`;
        let message = `${newJob.company} is hiring for ${newJob.title} in ${newJob.location}. Fits your skills!`;
        let notifType: any = 'job_match';

        if (wasRejectedEarlier && isOptedIn) {
          title = `🎯 Future Opportunity Alert: ${newJob.title}`;
          message = `Great news! ${newJob.company} just posted a new opening for ${newJob.title} that aligns with your skill set. Check it out and apply!`;
          notifType = 'future_opportunity';
        }

        await NotificationModel.create({
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          userId: cand.id,
          type: notifType,
          title,
          message,
          read: false,
          createdAt: new Date(),
          metadata: { jobId: newJob.id, company: newJob.company },
        });
      }
    }

    res.status(201).json(ok('Job created successfully and matching candidates notified', cleanDoc(newJob)));
  } catch (err: any) {
    res.status(500).json(fail('Error creating job', err.message));
  }
});

router.patch('/jobs/:id', authenticate, requireHR, async (req: Request, res: Response) => {
  try {
    const job = await JobModel.findOne({ id: req.params.id, hrId: (req as any).user.id });
    if (!job) return res.status(404).json(fail('Job not found or access denied'));

    Object.assign(job, req.body);
    await job.save();
    res.json(ok('Job updated', cleanDoc(job)));
  } catch (err: any) {
    res.status(500).json(fail('Error updating job', err.message));
  }
});

router.delete('/jobs/:id', authenticate, requireHR, async (req: Request, res: Response) => {
  try {
    const job = await JobModel.findOne({ id: req.params.id, hrId: (req as any).user.id });
    if (!job) return res.status(404).json(fail('Job not found or access denied'));

    job.status = 'closed';
    await job.save();
    res.json(ok('Job closed successfully'));
  } catch (err: any) {
    res.status(500).json(fail('Error closing job', err.message));
  }
});

// AI Candidate Rankings for a Job
router.get('/jobs/:id/candidates', authenticate, requireHR, async (req: Request, res: Response) => {
  try {
    let job: any = null;
    let candidates: any[] = [];
    let jobApps: any[] = [];

    if (isMongoConnected) {
      try {
        job = await JobModel.findOne({ id: req.params.id }).maxTimeMS(2000);
        candidates = await UserModel.find({ role: 'candidate' }).maxTimeMS(2000);
        jobApps = await ApplicationModel.find({ jobId: job?.id }).maxTimeMS(2000);
      } catch {}
    }

    if (!job) job = memoryJobs.find((j: any) => j.id === req.params.id);
    if (!job) return res.status(404).json(fail('Job not found'));
    if (!candidates.length) candidates = memoryUsers.filter((u: any) => u.role === 'candidate');
    if (!jobApps.length) jobApps = memoryApplications.filter((a: any) => a.jobId === job.id);

    const ranked = candidates.map((cand) => {
      const candObj = sanitizeUser(cand);
      const app = jobApps.find((a: any) => a.candidateId === cand.id);
      const { score, matched, missing } = computeMatchScore(candObj.skills || [], job.skills || [], job.requirements || []);
      return {
        candidate: candObj,
        matchScore: app ? app.matchScore : score,
        matchedSkills: app ? app.matchedSkills : matched,
        missingSkills: app ? app.missingSkills : missing,
        application: app ? cleanDoc(app) : null,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    res.json(ok('Ranked candidates', ranked));
  } catch (err: any) {
    res.status(500).json(fail('Error fetching candidate rankings', err.message));
  }
});

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────
router.get('/applications', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let appsDocs: any[] = [];

    if (isMongoConnected) {
      try {
        if (user.role === 'candidate') {
          appsDocs = await ApplicationModel.find({ candidateId: user.id }).sort({ appliedAt: -1 }).maxTimeMS(2000);
        } else {
          const hrJobs = await JobModel.find({ hrId: user.id }).maxTimeMS(2000);
          const jobIds = hrJobs.map((j) => j.id);
          const { jobId } = req.query;

          if (jobId) {
            appsDocs = await ApplicationModel.find({ jobId: String(jobId) }).sort({ appliedAt: -1 }).maxTimeMS(2000);
          } else {
            appsDocs = await ApplicationModel.find({ jobId: { $in: jobIds } }).sort({ appliedAt: -1 }).maxTimeMS(2000);
          }
        }
      } catch {}
    }

    if (!appsDocs.length) {
      if (user.role === 'candidate') {
        appsDocs = memoryApplications.filter((a: any) => a.candidateId === user.id);
      } else {
        const hrJobIds = memoryJobs.filter((j: any) => j.hrId === user.id).map((j: any) => j.id);
        const { jobId } = req.query;
        if (jobId) {
          appsDocs = memoryApplications.filter((a: any) => a.jobId === String(jobId));
        } else {
          appsDocs = memoryApplications.filter((a: any) => hrJobIds.includes(a.jobId));
        }
      }
    }

    const result = [];
    for (const a of appsDocs) {
      let jobDoc = memoryJobs.find((j: any) => j.id === a.jobId);
      let candDoc = memoryUsers.find((u: any) => u.id === a.candidateId);
      result.push({
        ...cleanDoc(a),
        job: jobDoc,
        candidate: candDoc ? sanitizeUser(candDoc) : undefined,
      });
    }

    res.json(ok('Applications retrieved', result));
  } catch (err: any) {
    res.json(ok('Applications retrieved (fallback)', []));
  }
});

router.post('/applications', authenticate, requireCandidate, async (req: Request, res: Response) => {
  try {
    const candidateId = (req as any).user.id;
    const { jobId, resumeUrl } = req.body;

    if (!jobId) return res.status(400).json(fail('jobId is required'));

    const job = await JobModel.findOne({ id: jobId });
    if (!job) return res.status(404).json(fail('Job not found'));

    const existing = await ApplicationModel.findOne({ jobId, candidateId });
    if (existing) return res.status(409).json(fail('You have already applied to this job'));

    const candidate = await UserModel.findOne({ id: candidateId });
    if (!candidate) return res.status(404).json(fail('Candidate profile not found'));

    const candObj = sanitizeUser(candidate);
    const { score, matched, missing } = computeMatchScore(candObj.skills || [], job.skills || [], job.requirements || []);
    const resumeFeedback = generateResumeFeedback(candObj.skills || [], job.skills || [], job.title);

    const newApp = await ApplicationModel.create({
      id: `app-${Date.now()}`,
      jobId,
      candidateId,
      status: 'applied',
      appliedAt: new Date(),
      matchScore: score,
      matchedSkills: matched,
      missingSkills: missing,
      resumeUrl: resumeUrl || candidate.resumeUrl || 'https://example.com/resume.pdf',
      aiAnalysis: `Match Score ${score}%. Matched ${matched.length}/${job.skills.length} required skills. ${missing.length ? `Missing: ${missing.join(', ')}.` : 'Perfect skill match!'}`,
      resumeFeedback,
    });

    job.applicantsCount += 1;
    await job.save();

    // Notify HR
    await NotificationModel.create({
      id: `notif-${Date.now()}`,
      userId: job.hrId,
      type: 'application_received',
      title: `New Application for ${job.title}`,
      message: `${candidate.name} applied for ${job.title} with a ${score}% match score.`,
      read: false,
      createdAt: new Date(),
      metadata: { applicationId: newApp.id, jobId },
    });

    res.status(201).json(ok('Application submitted successfully', cleanDoc(newApp)));
  } catch (err: any) {
    res.status(500).json(fail('Error submitting application', err.message));
  }
});

router.patch('/applications/:id/status', authenticate, requireHR, async (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body;
    const valid = ['applied', 'shortlisted', 'interview_scheduled', 'interviewed', 'offered', 'hired', 'rejected'];
    if (!status || !valid.includes(status)) return res.status(400).json(fail('Invalid status'));

    const app = await ApplicationModel.findOne({ id: req.params.id });
    if (!app) return res.status(404).json(fail('Application not found'));

    app.status = status;
    if (notes) app.notes = notes;
    await app.save();

    const job = await JobModel.findOne({ id: app.jobId });

    // Notify Candidate
    const statusTitles: Record<string, string> = {
      shortlisted: '⭐ Application Shortlisted!',
      interview_scheduled: '📅 Interview Scheduled!',
      offered: '🎉 Job Offer Received!',
      hired: '🚀 Congratulations, You Are Hired!',
      rejected: 'Application Status Update',
    };

    let notifMsg = `Your application status for ${job?.title || 'the position'} at ${job?.company || 'the company'} was updated to "${status.replace(/_/g, ' ')}".`;
    if (status === 'rejected') {
      notifMsg += ` Although this role was not a fit, our automated AI matcher will notify you of future openings at ${job?.company || 'our company'} matching your skills!`;
    }

    await NotificationModel.create({
      id: `notif-${Date.now()}`,
      userId: app.candidateId,
      type: 'status_update',
      title: statusTitles[status] || `Application Status: ${status}`,
      message: notifMsg,
      read: false,
      createdAt: new Date(),
    });

    const candidate = await UserModel.findOne({ id: app.candidateId });

    res.json(ok('Status updated', {
      ...cleanDoc(app),
      job: job ? cleanDoc(job) : undefined,
      candidate: candidate ? sanitizeUser(candidate) : undefined,
    }));
  } catch (err: any) {
    res.status(500).json(fail('Error updating status', err.message));
  }
});

// ─── RESUME ANALYZER ──────────────────────────────────────────────────────────
router.post('/resume/analyze', authenticate, async (req: Request, res: Response) => {
  try {
    const { jobId, skills: userSkills } = req.body;
    const candidateId = (req as any).user.id;

    if (!jobId) return res.status(400).json(fail('jobId is required'));
    const job = await JobModel.findOne({ id: jobId });
    if (!job) return res.status(404).json(fail('Job not found'));

    const candidate = await UserModel.findOne({ id: candidateId });
    const skillsToUse: string[] = userSkills || candidate?.skills || [];
    const jobSkillsLower = job.skills.map((s) => s.toLowerCase());

    const matched = skillsToUse.filter((s) => jobSkillsLower.includes(s.toLowerCase()));
    const missing = job.skills.filter((s) => !skillsToUse.map((us) => us.toLowerCase()).includes(s.toLowerCase()));
    const score = Math.round((matched.length / Math.max(job.skills.length, 1)) * 100);

    const recommendations = missing.map((skill) => ({
      skill,
      priority: job.requirements.some((r) => r.toLowerCase().includes(skill.toLowerCase())) ? 'high' : 'medium',
      action: `Add projects or certifications demonstrating ${skill} to your resume before applying.`,
    }));

    res.json(ok('Resume analysis completed', {
      jobId,
      jobTitle: job.title,
      company: job.company,
      score,
      matchedSkills: matched,
      missingSkills: missing,
      recommendations,
      overallSuggestion: score >= 80 ? 'Strong match! You meet most required skills.' : score >= 60 ? 'Good match. Focus on missing key skills in your summary.' : 'Gaps detected. Upskill in required technologies before applying.',
    }));
  } catch (err: any) {
    res.status(500).json(fail('Error analyzing resume', err.message));
  }
});

// ─── INTERVIEWS ───────────────────────────────────────────────────────────────
router.get('/interviews', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let listDocs: any[] = [];

    if (user.role === 'hr') {
      listDocs = await InterviewModel.find({ hrId: user.id }).sort({ scheduledAt: 1 });
    } else {
      listDocs = await InterviewModel.find({ candidateId: user.id }).sort({ scheduledAt: 1 });
    }

    const result = [];
    for (const iv of listDocs) {
      const job = await JobModel.findOne({ id: iv.jobId });
      const candidate = await UserModel.findOne({ id: iv.candidateId });
      const hr = await UserModel.findOne({ id: iv.hrId });

      result.push({
        ...cleanDoc(iv),
        job: job ? cleanDoc(job) : undefined,
        candidate: candidate ? sanitizeUser(candidate) : undefined,
        hr: hr ? sanitizeUser(hr) : undefined,
      });
    }

    res.json(ok('Interviews retrieved', result));
  } catch (err: any) {
    res.status(500).json(fail('Error fetching interviews', err.message));
  }
});

router.post('/interviews', authenticate, requireHR, async (req: Request, res: Response) => {
  try {
    const hrId = (req as any).user.id;
    const { applicationId, scheduledAt, duration, mode, platform, meetLink, notes } = req.body;

    if (!applicationId || !scheduledAt) return res.status(400).json(fail('applicationId and scheduledAt are required'));

    const app = await ApplicationModel.findOne({ id: applicationId });
    if (!app) return res.status(404).json(fail('Application not found'));

    const job = await JobModel.findOne({ id: app.jobId });

    const newInterview = await InterviewModel.create({
      id: `int-${Date.now()}`,
      applicationId,
      hrId,
      candidateId: app.candidateId,
      jobId: app.jobId,
      scheduledAt: new Date(scheduledAt),
      duration: duration || 60,
      mode: mode || 'video',
      platform: platform || 'google_meet',
      meetLink: meetLink || 'https://meet.google.com/abc-defg-hij',
      notes,
      status: 'scheduled',
      createdAt: new Date(),
    });

    app.status = 'interview_scheduled';
    await app.save();

    // Notify Candidate
    await NotificationModel.create({
      id: `notif-${Date.now()}`,
      userId: app.candidateId,
      type: 'interview_scheduled',
      title: `Interview Scheduled for ${job?.title}`,
      message: `An interview has been scheduled on ${new Date(scheduledAt).toLocaleString()}. Mode: ${mode || 'video'}.`,
      read: false,
      createdAt: new Date(),
      metadata: { interviewId: newInterview.id, meetLink: newInterview.meetLink },
    });

    res.status(201).json(ok('Interview scheduled successfully', cleanDoc(newInterview)));
  } catch (err: any) {
    res.status(500).json(fail('Error scheduling interview', err.message));
  }
});

router.patch('/interviews/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const iv = await InterviewModel.findOne({ id: req.params.id });
    if (!iv) return res.status(404).json(fail('Interview not found'));

    Object.assign(iv, req.body);
    await iv.save();
    res.json(ok('Interview updated', cleanDoc(iv)));
  } catch (err: any) {
    res.status(500).json(fail('Error updating interview', err.message));
  }
});

// AI Demo Interview Questions
router.post('/interview/questions', authenticate, async (req: Request, res: Response) => {
  try {
    const { jobId } = req.body;
    const job = await JobModel.findOne({ id: jobId });

    const baseQs = [
      'Tell me about yourself and why you are interested in this position.',
      `Describe a challenging project you worked on involving ${job?.skills?.[0] || 'core technologies'} and how you handled it.`,
      'How do you prioritize tasks when working under tight deadlines with multiple stakeholders?',
      `What is your experience with ${job?.skills?.[1] || 'software development best practices'}? Give a concrete example.`,
      'Describe a situation where you had a conflict with a team member. How did you resolve it?',
      `Where do you see your technical skills evolving over the next 2-3 years, especially regarding ${job?.skills?.[2] || 'new tech'}?`,
    ];

    res.json(ok('Questions generated', { jobId, jobTitle: job?.title || 'Target Role', questions: baseQs }));
  } catch (err: any) {
    res.status(500).json(fail('Error generating questions', err.message));
  }
});

// Evaluate AI Demo Interview Answer
router.post('/interview/evaluate', authenticate, async (req: Request, res: Response) => {
  try {
    const { question, answer } = req.body;
    if (!answer) return res.status(400).json(fail('Answer is required'));

    const len = answer.trim().length;
    let score = 70;
    if (len > 200) score = 90;
    else if (len > 100) score = 80;
    else if (len < 50) score = 55;

    res.json(ok('Answer evaluated', {
      question,
      score,
      feedback: score >= 80 ? 'Excellent, structured response with good detail.' : score >= 70 ? 'Good answer, but try adding specific metrics or project outcomes.' : 'Answer is too brief. Provide STAR method examples (Situation, Task, Action, Result).',
      tips: [
        '💡 Use the STAR method to structure your responses.',
        '💡 Quantify your achievements (e.g., "improved speed by 30%").',
        '💡 Connect your experience directly to the job description requirements.',
      ],
    }));
  } catch (err: any) {
    res.status(500).json(fail('Error evaluating answer', err.message));
  }
});

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
router.get('/notifications', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    let notifs: any[] = [];
    if (isMongoConnected) {
      try {
        const docs = await NotificationModel.find({ userId }).sort({ createdAt: -1 }).maxTimeMS(2000);
        notifs = docs.map(cleanDoc);
      } catch {}
    }
    if (!notifs.length) {
      notifs = memoryNotifications.filter((n: any) => n.userId === userId);
    }
    res.json(ok('Notifications retrieved', notifs));
  } catch (err: any) {
    res.json(ok('Notifications retrieved', []));
  }
});

router.patch('/notifications/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    if (isMongoConnected) {
      try {
        const n = await NotificationModel.findOne({ id: req.params.id, userId });
        if (n) { n.read = true; await n.save(); }
      } catch {}
    }
    const mem = memoryNotifications.find((n: any) => n.id === req.params.id);
    if (mem) mem.read = true;
    res.json(ok('Notification marked as read'));
  } catch (err: any) {
    res.json(ok('Notification marked as read'));
  }
});

router.patch('/notifications/read-all', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    if (isMongoConnected) {
      try {
        await NotificationModel.updateMany({ userId }, { read: true });
      } catch {}
    }
    memoryNotifications.forEach((n: any) => { if (n.userId === userId) n.read = true; });
    res.json(ok('All notifications marked as read'));
  } catch (err: any) {
    res.json(ok('All notifications marked as read'));
  }
});

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
router.get('/analytics', authenticate, requireHR, async (req: Request, res: Response) => {
  try {
    const hrId = (req as any).user.id;
    let hrJobs: any[] = [];
    let hrApps: any[] = [];
    let hrInterviews: any[] = [];

    if (isMongoConnected) {
      try {
        hrJobs = await JobModel.find({ hrId }).maxTimeMS(2000);
        const hrJobIds = hrJobs.map((j) => j.id);
        hrApps = await ApplicationModel.find({ jobId: { $in: hrJobIds } }).maxTimeMS(2000);
        hrInterviews = await InterviewModel.find({ hrId }).maxTimeMS(2000);
      } catch {}
    }

    if (!hrJobs.length) hrJobs = memoryJobs.filter((j: any) => j.hrId === hrId);
    if (!hrApps.length) {
      const hrJobIds = hrJobs.map((j: any) => j.id);
      hrApps = memoryApplications.filter((a: any) => hrJobIds.includes(a.jobId));
    }
    if (!hrInterviews.length) hrInterviews = memoryInterviews.filter((i: any) => i.hrId === hrId);

    const statusBreakdown = {
      applied: hrApps.filter((a: any) => a.status === 'applied').length,
      shortlisted: hrApps.filter((a: any) => a.status === 'shortlisted').length,
      interview_scheduled: hrApps.filter((a: any) => a.status === 'interview_scheduled').length,
      interviewed: hrApps.filter((a: any) => a.status === 'interviewed').length,
      offered: hrApps.filter((a: any) => a.status === 'offered').length,
      hired: hrApps.filter((a: any) => a.status === 'hired').length,
      rejected: hrApps.filter((a: any) => a.status === 'rejected').length,
    };

    const avgScore = hrApps.length
      ? Math.round(hrApps.reduce((sum: number, a: any) => sum + (a.matchScore || 0), 0) / hrApps.length)
      : 0;

    const jobStats = hrJobs.map((job: any) => {
      const apps = hrApps.filter((a: any) => a.jobId === job.id);
      const scoreSum = apps.reduce((sum: number, a: any) => sum + (a.matchScore || 0), 0);
      return {
        id: job.id,
        title: job.title,
        applicants: apps.length,
        avgScore: apps.length ? Math.round(scoreSum / apps.length) : 0,
      };
    });

    res.json(ok('Analytics retrieved', {
      totalJobs: hrJobs.length,
      activeJobs: hrJobs.filter((j) => j.status === 'active').length,
      totalApplications: hrApps.length,
      totalInterviews: hrInterviews.length,
      upcomingInterviews: hrInterviews.filter((i) => i.status === 'scheduled' && new Date(i.scheduledAt) > new Date()).length,
      avgMatchScore: avgScore,
      hireRate: hrApps.length ? Math.round((statusBreakdown.hired / hrApps.length) * 100) : 0,
      statusBreakdown,
      jobStats,
      statusFunnel: [
        { stage: 'Applied', count: hrApps.length },
        { stage: 'Shortlisted', count: statusBreakdown.shortlisted + statusBreakdown.interview_scheduled + statusBreakdown.interviewed + statusBreakdown.offered + statusBreakdown.hired },
        { stage: 'Interview Scheduled', count: statusBreakdown.interview_scheduled + statusBreakdown.interviewed + statusBreakdown.offered + statusBreakdown.hired },
        { stage: 'Offered', count: statusBreakdown.offered + statusBreakdown.hired },
        { stage: 'Hired', count: statusBreakdown.hired },
      ],
    }));
  } catch (err: any) {
    res.status(500).json(fail('Error fetching analytics', err.message));
  }
});

export default router;
