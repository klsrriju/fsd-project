import { Router } from 'express';
import {
  health,
  login,
  listJobs,
  listCandidates,
  listApplications,
  createJob,
  createCandidate,
  createApplicationEndpoint,
  updateApplicationStatusEndpoint,
  createResumeEndpoint,
  scheduleInterviewEndpoint,
  skillMatch,
  matchCandidateToJob,
  candidateStatusUpdate
} from '../controllers/apiController';
import { authenticate, authorize } from '../middleware/auth';
import {
  loginValidator,
  jobValidator,
  candidateValidator,
  interviewValidator,
  validateRequest
} from '../middleware/validation';

const router = Router();

router.get('/health', health);
router.post('/auth/login', loginValidator, validateRequest, login);

router.get('/jobs', listJobs);
router.post('/jobs', authenticate, authorize('hr', 'recruiter'), jobValidator, validateRequest, createJob);

router.get('/candidates', authenticate, authorize('hr', 'recruiter'), listCandidates);
router.post('/candidates', authenticate, authorize('hr', 'recruiter'), candidateValidator, validateRequest, createCandidate);

router.get('/applications', authenticate, authorize('hr', 'recruiter'), listApplications);
router.post('/applications', authenticate, authorize('hr', 'recruiter'), createApplicationEndpoint);
router.patch('/applications/:id/status', authenticate, authorize('hr', 'recruiter'), updateApplicationStatusEndpoint);

router.post('/resumes/parse', authenticate, authorize('hr', 'recruiter'), createResumeEndpoint);
router.post('/skill-match', authenticate, authorize('hr', 'recruiter'), skillMatch);
router.post('/match-breakdown', authenticate, authorize('hr', 'recruiter'), matchCandidateToJob);

router.post('/interviews/schedule', authenticate, authorize('hr', 'recruiter'), interviewValidator, validateRequest, scheduleInterviewEndpoint);
router.patch('/candidates/:id/status', authenticate, authorize('hr', 'recruiter'), candidateStatusUpdate);

export default router;
