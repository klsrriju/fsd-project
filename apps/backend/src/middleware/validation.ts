import { body, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const loginValidator = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

export const jobValidator = [
  body('title').isString().trim().isLength({ min: 2 }).withMessage('Job title is required'),
  body('company').isString().trim().isLength({ min: 2 }).withMessage('Company is required'),
  body('location').isString().trim().isLength({ min: 2 }).withMessage('Location is required'),
  body('employmentType').isIn(['full-time', 'part-time', 'contract', 'internship']).withMessage('Invalid employment type'),
  body('seniority').isIn(['junior', 'mid', 'senior', 'lead']).withMessage('Invalid seniority level'),
  body('description').isString().trim().isLength({ min: 20 }).withMessage('Job description should be descriptive')
];

export const candidateValidator = [
  body('firstName').isString().trim().isLength({ min: 2 }).withMessage('First name is required'),
  body('lastName').isString().trim().isLength({ min: 2 }).withMessage('Last name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('location').optional().isString().trim().isLength({ min: 2 }),
  body('yearsOfExperience').optional().isInt({ min: 0 })
];

export const interviewValidator = [
  body('applicationId').isUUID().withMessage('Valid application id is required'),
  body('jobId').isUUID().withMessage('Valid job id is required'),
  body('candidateId').isUUID().withMessage('Valid candidate id is required'),
  body('interviewerId').isUUID().withMessage('Valid interviewer id is required'),
  body('scheduledAt').isISO8601().withMessage('A valid interview datetime is required'),
  body('mode').isIn(['phone', 'video', 'onsite']).withMessage('Invalid interview mode')
];

export function validateRequest(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((error) => ({ field: (error as any).path || (error as any).param || 'body', message: error.msg }))
    });
  }

  next();
}
