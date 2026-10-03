import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {
  users, jobs, applications, interviews, notifications,
  computeMatchScore, generateResumeFeedback,
  User, Job, Application, Interview, Notification
} from '../data/demoData';
import { config } from '../config/env';

const router = Router();

// ─── Utility ──────────────────────────────────────────────────────────────────
function ok(message: string, data?: unknown) {
  return { success: true, message, data };
}
function fail(message: string, error?: string) {
  return { success: false, message, error };
}
function signToken(user: User) {
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

// ─── HEALTH ───────────────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json(ok('API is running', { version: '1.0.0', timestamp: new Date().toISOString() }));
});

// ─── AUTH ─────────────────────────────────────────────────────────────────────
router.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json(fail('Email and password required'));

  const user = users.find((u) => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json(fail('Invalid credentials'));
  }

  const token = signToken(user);
  const { passwordHash, ...safeUser } = user;
  return res.json(ok('Login successful', { token, user: safeUser }));
});

router.post('/auth/register', (req: Request, res: Response) => {
  const { email, password, role, name, ...rest } = req.body;
  if (!email || !password || !role || !name) {
    return res.status(400).json(fail('Email, password, role, and name are required'));
  }
  if (!['hr', 'candidate'].includes(role)) {
    return res.status(400).json(fail('Role must be hr or candidate'));
  }
  if (users.find((u) => u.email === email)) {
    return res.status(409).json(fail('Email already registered'));
  }

  const newUser: User = {
    id: `${role}-${Date.now()}`,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    role,
    name,
    createdAt: new Date().toISOString(),
    ...rest,
  };
  users.push(newUser);

  const token = signToken(newUser);
  const { passwordHash, ...safeUser } = newUser;
  return res.status(201).json(ok('Account created successfully', { token, user: safeUser }));
});

router.get('/auth/me', authenticate, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(404).json(fail('User not found'));
  const { passwordHash, ...safeUser } = user;
  res.json(ok('Profile retrieved', safeUser));
});

router.patch('/auth/profile', authenticate, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return res.status(404).json(fail('User not found'));
  const { passwordHash, id, email, role, ...updates } = req.body;
  Object.assign(users[idx], updates);
  const { passwordHash: _pw, ...safeUser } = users[idx];
  res.json(ok('Profile updated', safeUser));
});

// ─── JOBS ─────────────────────────────────────────────────────────────────────
router.get('/jobs', (req: Request, res: Response) => {
  const { search, type, industry, status = 'active' } = req.query as Record<string, string>;
  let result = jobs.filter((j) => j.status === (status || 'active'));
  if (search) result = result.filter((j) => j.title.toLowerCase().includes(search.toLowerCase()) || j.description.toLowerCase().includes(search.toLowerCase()));
  if (type) result = result.filter((j) => j.type === type);
  if (industry) result = result.filter((j) => j.industry === industry);
  res.json(ok('Jobs retrieved', result));
});

router.get('/jobs/:id', (req: Request, res: Response) => {
  const job = jobs.find((j) => j.id === req.params.id);
  if (!job) return res.status(404).json(fail('Job not found'));
  res.json(ok('Job retrieved', job));
});

router.post('/jobs', authenticate, requireHR, (req: Request, res: Response) => {
  const hrId = (req as any).user.id;
  const hr = users.find((u) => u.id === hrId);
  const newJob: Job = {
    id: `job-${Date.now()}`,
    hrId,
    company: hr?.company || 'Unknown',
    industry: hr?.industry || 'Technology',
    applicantsCount: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
    ...req.body,
  };
  jobs.push(newJob);

  // Notify matching candidates
  users.filter((u) => u.role === 'candidate').forEach((candidate) => {
    if (!candidate.skills) return;
    const { score } = computeMatchScore(candidate.skills, newJob.skills, newJob.requirements);
    if (score >= 60) {
      notifications.push({
        id: `notif-${Date.now()}-${candidate.id}`,
        userId: candidate.id,
        type: 'job_match',
        title: `New Job Match: ${newJob.title}`,
        message: `A new position "${newJob.title}" at ${newJob.company} matches your profile with ${score}% compatibility.`,
        read: false,
        createdAt: new Date().toISOString(),
        jobId: newJob.id,
      });
    }
  });

  res.status(201).json(ok('Job created', newJob));
});

router.patch('/jobs/:id', authenticate, requireHR, (req: Request, res: Response) => {
  const idx = jobs.findIndex((j) => j.id === req.params.id && j.hrId === (req as any).user.id);
  if (idx === -1) return res.status(404).json(fail('Job not found or unauthorized'));
  Object.assign(jobs[idx], req.body);
  res.json(ok('Job updated', jobs[idx]));
});

router.delete('/jobs/:id', authenticate, requireHR, (req: Request, res: Response) => {
  const idx = jobs.findIndex((j) => j.id === req.params.id && j.hrId === (req as any).user.id);
  if (idx === -1) return res.status(404).json(fail('Job not found or unauthorized'));
  jobs[idx].status = 'closed';
  res.json(ok('Job closed'));
});

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────
router.get('/applications', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  let result = applications;
  if (user.role === 'hr') {
    result = applications.filter((a) => a.hrId === user.id);
    const { jobId, status } = req.query as Record<string, string>;
    if (jobId) result = result.filter((a) => a.jobId === jobId);
    if (status) result = result.filter((a) => a.status === status);
  } else {
    result = applications.filter((a) => a.candidateId === user.id);
  }

  // Enrich with candidate and job info
  const enriched = result.map((app) => {
    const candidate = users.find((u) => u.id === app.candidateId);
    const job = jobs.find((j) => j.id === app.jobId);
    const { passwordHash, ...safeCandidate } = candidate || {} as User;
    return { ...app, candidate: safeCandidate, job };
  });

  res.json(ok('Applications retrieved', enriched));
});

router.post('/applications', authenticate, requireCandidate, (req: Request, res: Response) => {
  const candidateId = (req as any).user.id;
  const { jobId, resumeUrl, resumeText } = req.body;

  if (!jobId) return res.status(400).json(fail('jobId is required'));
  if (applications.find((a) => a.candidateId === candidateId && a.jobId === jobId)) {
    return res.status(409).json(fail('Already applied to this job'));
  }

  const job = jobs.find((j) => j.id === jobId);
  if (!job) return res.status(404).json(fail('Job not found'));

  const candidate = users.find((u) => u.id === candidateId);
  const { score, matched, missing } = computeMatchScore(
    candidate?.skills || [],
    job.skills,
    job.requirements
  );
  const feedback = generateResumeFeedback(candidate?.skills || [], job.skills, job.title);

  const newApp: Application = {
    id: `app-${Date.now()}`,
    jobId,
    candidateId,
    hrId: job.hrId,
    status: 'applied',
    appliedAt: new Date().toISOString(),
    matchScore: score,
    matchedSkills: matched,
    missingSkills: missing,
    resumeUrl: resumeUrl || candidate?.resumeUrl,
    resumeText,
    resumeFeedback: feedback,
    aiAnalysis: `AI Analysis: ${score}% match. ${matched.length} of ${job.skills.length} required skills matched.`,
  };
  applications.push(newApp);

  // Update job applicant count
  const jobIdx = jobs.findIndex((j) => j.id === jobId);
  if (jobIdx >= 0) jobs[jobIdx].applicantsCount++;

  // Notify HR
  notifications.push({
    id: `notif-${Date.now()}`,
    userId: job.hrId,
    type: 'application_received',
    title: `New Application: ${job.title}`,
    message: `${candidate?.name} has applied for ${job.title} with a ${score}% match score.`,
    read: false,
    createdAt: new Date().toISOString(),
    jobId,
    applicationId: newApp.id,
  });

  res.status(201).json(ok('Application submitted', { ...newApp, feedback, matchScore: score }));
});

router.patch('/applications/:id/status', authenticate, requireHR, (req: Request, res: Response) => {
  const { status, notes } = req.body;
  const idx = applications.findIndex((a) => a.id === req.params.id && a.hrId === (req as any).user.id);
  if (idx === -1) return res.status(404).json(fail('Application not found or unauthorized'));
  applications[idx].status = status;
  if (notes) applications[idx].notes = notes;

  const app = applications[idx];
  const job = jobs.find((j) => j.id === app.jobId);
  const statusMessages: Record<string, string> = {
    shortlisted: `You have been shortlisted for ${job?.title} at ${job?.company}! 🎉`,
    interview_scheduled: `Your interview for ${job?.title} has been scheduled.`,
    offered: `Congratulations! You have received a job offer for ${job?.title} at ${job?.company}! 🎊`,
    hired: `Welcome aboard! You have been hired for ${job?.title} at ${job?.company}!`,
    rejected: `Your application for ${job?.title} has been reviewed. Unfortunately, we will not be moving forward at this time.`,
  };

  if (statusMessages[status]) {
    notifications.push({
      id: `notif-${Date.now()}`,
      userId: app.candidateId,
      type: 'status_update',
      title: `Application Update: ${status.replace('_', ' ').toUpperCase()}`,
      message: statusMessages[status],
      read: false,
      createdAt: new Date().toISOString(),
      jobId: app.jobId,
      applicationId: app.id,
    });
  }

  res.json(ok('Application status updated', applications[idx]));
});

// ─── RESUME ANALYSIS ──────────────────────────────────────────────────────────
router.post('/resume/analyze', authenticate, (req: Request, res: Response) => {
  const { jobId, skills: inputSkills, resumeText } = req.body;
  const userId = (req as any).user.id;

  const job = jobs.find((j) => j.id === jobId);
  if (!job) return res.status(404).json(fail('Job not found'));

  const user = users.find((u) => u.id === userId);
  const candidateSkills = inputSkills || user?.skills || [];

  const { score, matched, missing } = computeMatchScore(candidateSkills, job.skills, job.requirements);
  const feedback = generateResumeFeedback(candidateSkills, job.skills, job.title);

  // Gap analysis by category
  const gapAnalysis = {
    score,
    matchedSkills: matched,
    missingSkills: missing,
    feedback,
    recommendations: [
      ...missing.slice(0, 3).map((skill) => ({
        skill,
        priority: 'high',
        action: `Learn ${skill} — take an online course or build a project using it`,
      })),
      {
        skill: 'Quantifiable Achievements',
        priority: 'medium',
        action: 'Add metrics to your experience (e.g., "Reduced load time by 50%")',
      },
      {
        skill: 'ATS Optimization',
        priority: 'medium',
        action: `Include keywords from the job description: "${job.title}", "${job.skills.slice(0, 3).join('", "')}"`,
      },
    ],
    overallSuggestion: score >= 80
      ? '🟢 Strong match! Polish your resume and apply with confidence.'
      : score >= 60
      ? '🟡 Good foundation. Fill the skill gaps listed above before applying.'
      : '🔴 Significant gaps detected. Focus on the high-priority skills first.',
  };

  res.json(ok('Resume analysis complete', gapAnalysis));
});

// ─── INTERVIEWS ───────────────────────────────────────────────────────────────
router.get('/interviews', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = interviews.filter((i) =>
    user.role === 'hr' ? i.hrId === user.id : i.candidateId === user.id
  );
  const enriched = result.map((interview) => {
    const candidate = users.find((u) => u.id === interview.candidateId);
    const job = jobs.find((j) => j.id === interview.jobId);
    const { passwordHash, ...safeCandidate } = candidate || {} as User;
    return { ...interview, candidate: safeCandidate, job };
  });
  res.json(ok('Interviews retrieved', enriched));
});

router.post('/interviews', authenticate, requireHR, (req: Request, res: Response) => {
  const hrId = (req as any).user.id;
  const { applicationId, scheduledAt, duration, mode, platform, meetLink, notes } = req.body;

  const app = applications.find((a) => a.id === applicationId && a.hrId === hrId);
  if (!app) return res.status(404).json(fail('Application not found or unauthorized'));

  const newInterview: Interview = {
    id: `int-${Date.now()}`,
    applicationId,
    jobId: app.jobId,
    candidateId: app.candidateId,
    hrId,
    scheduledAt,
    duration: duration || 60,
    mode: mode || 'video',
    platform,
    meetLink,
    status: 'scheduled',
    notes,
  };
  interviews.push(newInterview);

  // Update application status
  const appIdx = applications.findIndex((a) => a.id === applicationId);
  if (appIdx >= 0) applications[appIdx].status = 'interview_scheduled';

  const job = jobs.find((j) => j.id === app.jobId);
  notifications.push({
    id: `notif-${Date.now()}`,
    userId: app.candidateId,
    type: 'interview_scheduled',
    title: 'Interview Scheduled!',
    message: `Your interview for ${job?.title} at ${job?.company} is scheduled for ${new Date(scheduledAt).toLocaleString()}. Mode: ${mode}${meetLink ? `. Link: ${meetLink}` : ''}.`,
    read: false,
    createdAt: new Date().toISOString(),
    jobId: app.jobId,
    applicationId,
  });

  res.status(201).json(ok('Interview scheduled', newInterview));
});

router.patch('/interviews/:id', authenticate, (req: Request, res: Response) => {
  const idx = interviews.findIndex((i) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json(fail('Interview not found'));
  Object.assign(interviews[idx], req.body);
  res.json(ok('Interview updated', interviews[idx]));
});

// ─── AI DEMO INTERVIEW ────────────────────────────────────────────────────────
const interviewQuestions: Record<string, string[]> = {
  'React': [
    'Explain the difference between useState and useEffect hooks.',
    'How does React\'s virtual DOM improve performance?',
    'What are the differences between class components and functional components?',
    'Explain the concept of lifting state up in React.',
    'How would you optimize a slow-rendering React component?',
  ],
  'Python': [
    'What is the difference between a list and a tuple in Python?',
    'Explain Python\'s GIL (Global Interpreter Lock) and its implications.',
    'How do generators work in Python and when would you use them?',
    'What are decorators in Python? Give an example.',
    'How would you handle memory management for a large dataset?',
  ],
  'Java': [
    'Explain the difference between abstract class and interface in Java.',
    'What is the difference between HashMap and ConcurrentHashMap?',
    'Explain the concept of dependency injection.',
    'How does garbage collection work in the JVM?',
    'What are the SOLID principles?',
  ],
  'default': [
    'Tell me about yourself and your background.',
    'Why are you interested in this role?',
    'Describe a challenging project you worked on and how you overcame obstacles.',
    'Where do you see yourself in 5 years?',
    'What is your greatest professional achievement?',
    'How do you handle working under pressure or tight deadlines?',
    'Describe your ideal work environment.',
    'What salary range are you expecting for this role?',
  ],
};

router.post('/interview/questions', authenticate, (req: Request, res: Response) => {
  const { jobId, skills } = req.body;
  const job = jobs.find((j) => j.id === jobId);

  const questions: string[] = [];
  const jobSkills = skills || job?.skills || [];

  // Add skill-specific questions
  jobSkills.forEach((skill: string) => {
    const qs = interviewQuestions[skill];
    if (qs) {
      const picked = qs.sort(() => 0.5 - Math.random()).slice(0, 2);
      questions.push(...picked);
    }
  });

  // Always add behavioral questions
  const behavioral = interviewQuestions['default'].sort(() => 0.5 - Math.random()).slice(0, 3);
  questions.push(...behavioral);

  res.json(ok('Interview questions generated', {
    questions: questions.slice(0, 10),
    jobTitle: job?.title || 'General Role',
    totalQuestions: Math.min(questions.length, 10),
  }));
});

router.post('/interview/evaluate', authenticate, (req: Request, res: Response) => {
  const { question, answer, jobId } = req.body;
  if (!answer || !question) return res.status(400).json(fail('Question and answer are required'));

  // Simulated AI evaluation
  const wordCount = answer.split(' ').length;
  const hasStructure = answer.includes('because') || answer.includes('for example') || answer.includes('specifically') || answer.includes('result');
  const isDetailed = wordCount > 50;
  const hasTechnicalTerms = answer.match(/\b(API|database|component|function|class|async|promise|stack|algorithm|complexity|pattern)\b/gi);

  let score = 50;
  if (wordCount > 30) score += 10;
  if (wordCount > 80) score += 10;
  if (hasStructure) score += 15;
  if (isDetailed) score += 10;
  if (hasTechnicalTerms && hasTechnicalTerms.length > 0) score += 15;
  score = Math.min(100, score);

  const feedback = score >= 80
    ? 'Excellent answer! Well-structured with clear technical depth.'
    : score >= 60
    ? 'Good answer. Try to add more specific examples or quantifiable outcomes.'
    : 'Answer needs improvement. Be more specific, use the STAR method (Situation, Task, Action, Result), and add technical depth.';

  res.json(ok('Answer evaluated', {
    score,
    feedback,
    tips: [
      wordCount < 50 ? '💡 Tip: Expand your answer with more detail and examples.' : '✅ Good answer length.',
      !hasStructure ? '💡 Tip: Use structured phrases like "For example..." or "As a result...".' : '✅ Good structure.',
      !hasTechnicalTerms ? '💡 Tip: Include relevant technical terms to demonstrate expertise.' : '✅ Good technical depth.',
    ],
  }));
});

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
router.get('/notifications', authenticate, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const userNotifs = notifications.filter((n) => n.userId === userId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(ok('Notifications retrieved', userNotifs));
});

router.patch('/notifications/:id/read', authenticate, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const idx = notifications.findIndex((n) => n.id === req.params.id && n.userId === userId);
  if (idx === -1) return res.status(404).json(fail('Notification not found'));
  notifications[idx].read = true;
  res.json(ok('Notification marked as read'));
});

router.patch('/notifications/read-all', authenticate, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  notifications.filter((n) => n.userId === userId).forEach((n) => { n.read = true; });
  res.json(ok('All notifications marked as read'));
});

// ─── ANALYTICS (HR only) ──────────────────────────────────────────────────────
router.get('/analytics', authenticate, requireHR, (req: Request, res: Response) => {
  const hrId = (req as any).user.id;
  const hrJobs = jobs.filter((j) => j.hrId === hrId);
  const hrApps = applications.filter((a) => a.hrId === hrId);
  const hrInterviews = interviews.filter((i) => i.hrId === hrId);

  const statusCounts = {
    applied: hrApps.filter((a) => a.status === 'applied').length,
    shortlisted: hrApps.filter((a) => a.status === 'shortlisted').length,
    interview_scheduled: hrApps.filter((a) => a.status === 'interview_scheduled').length,
    interviewed: hrApps.filter((a) => a.status === 'interviewed').length,
    offered: hrApps.filter((a) => a.status === 'offered').length,
    hired: hrApps.filter((a) => a.status === 'hired').length,
    rejected: hrApps.filter((a) => a.status === 'rejected').length,
  };

  const avgMatchScore = hrApps.length > 0
    ? Math.round(hrApps.reduce((acc, a) => acc + a.matchScore, 0) / hrApps.length)
    : 0;

  const jobStats = hrJobs.map((job) => {
    const jobApps = hrApps.filter((a) => a.jobId === job.id);
    return {
      jobId: job.id,
      title: job.title,
      applicants: jobApps.length,
      avgScore: jobApps.length > 0 ? Math.round(jobApps.reduce((acc, a) => acc + a.matchScore, 0) / jobApps.length) : 0,
      hired: jobApps.filter((a) => a.status === 'hired').length,
    };
  });

  res.json(ok('Analytics retrieved', {
    totalJobs: hrJobs.length,
    activeJobs: hrJobs.filter((j) => j.status === 'active').length,
    totalApplications: hrApps.length,
    totalInterviews: hrInterviews.length,
    avgMatchScore,
    statusFunnel: [
      { stage: 'Applied', count: statusCounts.applied + statusCounts.shortlisted + statusCounts.interview_scheduled + statusCounts.interviewed + statusCounts.offered + statusCounts.hired + statusCounts.rejected },
      { stage: 'Shortlisted', count: statusCounts.shortlisted + statusCounts.interview_scheduled + statusCounts.interviewed + statusCounts.offered + statusCounts.hired },
      { stage: 'Interviewed', count: statusCounts.interview_scheduled + statusCounts.interviewed + statusCounts.offered + statusCounts.hired },
      { stage: 'Offered', count: statusCounts.offered + statusCounts.hired },
      { stage: 'Hired', count: statusCounts.hired },
    ],
    statusBreakdown: statusCounts,
    jobStats,
    upcomingInterviews: hrInterviews.filter((i) => i.status === 'scheduled').length,
    hireRate: hrApps.length > 0 ? Math.round((statusCounts.hired / hrApps.length) * 100) : 0,
  }));
});

// ─── CANDIDATE MATCH FOR A JOB ────────────────────────────────────────────────
router.get('/jobs/:id/candidates', authenticate, requireHR, (req: Request, res: Response) => {
  const job = jobs.find((j) => j.id === req.params.id && j.hrId === (req as any).user.id);
  if (!job) return res.status(404).json(fail('Job not found or unauthorized'));

  const candidates = users.filter((u) => u.role === 'candidate');
  const ranked = candidates.map((candidate) => {
    const { score, matched, missing } = computeMatchScore(
      candidate.skills || [],
      job.skills,
      job.requirements
    );
    const existingApp = applications.find((a) => a.candidateId === candidate.id && a.jobId === job.id);
    const { passwordHash, ...safeCandidate } = candidate;
    return {
      candidate: safeCandidate,
      matchScore: score,
      matchedSkills: matched,
      missingSkills: missing,
      application: existingApp || null,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);

  res.json(ok('Ranked candidates for job', ranked));
});

export default router;
