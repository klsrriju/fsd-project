import test from 'node:test';
import assert from 'node:assert/strict';
import { parseResume } from '../services/resumeParser';
import { buildMatchBreakdown } from '../services/matchingService';
import { sendSMS, smsAuditLog } from '../services/smsService';
import { computeMatchScore, generateResumeFeedback } from '../data/demoData';

test('AI Resume Parser extracts structured candidate signals', () => {
  const sample = `
    Alex Morgan
    Email: alex.morgan@example.com
    Experience: 5 years software engineer building scalable web applications.
    Education: Bachelor of Science in Software Engineering from Stanford.
    Skills: React, TypeScript, Node.js, Docker, AWS, PostgreSQL, Python, GraphQL
  `;

  const parsed = parseResume(sample);
  assert.equal(parsed.fullName, 'Alex Morgan');
  assert.equal(parsed.email, 'alex.morgan@example.com');
  assert.ok(parsed.skills.includes('React'));
  assert.ok(parsed.skills.includes('TypeScript'));
  assert.ok(parsed.skills.includes('Docker'));
  assert.ok(parsed.education.length > 0);
  assert.ok(parsed.experience.length > 0);
});

test('Multi-Factor Matching produces transparent, weighted scoring breakdown', () => {
  const resume = {
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    experience: ['3 years frontend developer'],
    education: ['Bachelor degree in Computer Science'],
    rawText: 'React TypeScript Node.js PostgreSQL',
  };

  const jobTitle = 'Senior Full Stack Engineer';
  const requirements = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'];

  const breakdown = buildMatchBreakdown(resume as any, jobTitle, requirements);

  assert.ok(breakdown.overallScore > 0 && breakdown.overallScore <= 100);
  assert.ok(breakdown.factorDetails.length === 4);
  assert.equal(breakdown.matchedSkills.length, 4);
  assert.equal(breakdown.missingSkills.length, 2); // AWS, Docker missing
  assert.ok(breakdown.missingSkills.includes('Aws') || breakdown.missingSkills.includes('AWS'));
});

test('SMS Service suppresses duplicate sends within the deduplication window', async () => {
  const options = {
    to: '+1234567890',
    message: 'SkillProof: Interview invitation confirmed.',
    eventType: 'interview_invitation' as const,
    referenceId: 'test-interview-101',
  };

  // First send
  const res1 = await sendSMS(options);
  assert.equal(res1.success, true);

  // Immediate retry with the same referenceId should be suppressed as a duplicate
  const res2 = await sendSMS(options);
  assert.equal(res2.success, true);
  assert.equal(res2.simulated, true);
  assert.equal(res2.error, 'Duplicate send prevented');
});

test('Resume Feedback Generator produces specific skill improvement tips', () => {
  const candidateSkills = ['React', 'CSS', 'HTML'];
  const jobSkills = ['React', 'TypeScript', 'Node.js', 'Docker'];

  const feedback = generateResumeFeedback(candidateSkills, jobSkills, 'Frontend Developer');
  assert.ok(feedback.includes('Skills gap: You are missing TypeScript, Node.js, Docker'));
  assert.ok(feedback.includes('Recommended learning'));
});

test('ComputeMatchScore correctly identifies skill overlap and gap ratios', () => {
  const candSkills = ['Python', 'SQL', 'Pandas'];
  const jobSkills = ['Python', 'SQL', 'Pandas', 'TensorFlow', 'PyTorch'];
  const jobReqs = ['Strong machine learning experience'];

  const result = computeMatchScore(candSkills, jobSkills, jobReqs);
  assert.equal(result.score, 60); // 3 of 5
  assert.equal(result.matched.length, 3);
  assert.equal(result.missing.length, 2);
});
