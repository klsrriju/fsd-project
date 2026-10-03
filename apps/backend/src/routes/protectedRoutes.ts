import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/secure/jobs', authenticate, authorize('hr', 'recruiter'), (req, res) => {
  res.json({ success: true, message: 'Protected jobs area accessible by HR or recruiters' });
});

export default router;
