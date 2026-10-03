import test from 'node:test';
import assert from 'node:assert/strict';
import { parseResume } from '../services/resumeParser';
import { rankCandidate } from '../services/ranker';
import { buildMatchBreakdown } from '../services/matchingService';

test('resume parser extracts relevant candidate data', () => {
  const parsed = parseResume('Jane Candidate jane@example.com TypeScript React PostgreSQL REST API');
  assert.equal(parsed.fullName, 'Jane Candidate');
  assert.equal(parsed.email, 'jane@example.com');
  assert.ok(parsed.skills.includes('TypeScript'));
});

test('candidate ranker returns transparent match score', () => {
  const match = rankCandidate(['TypeScript', 'React', 'PostgreSQL'], {
    title: 'Senior Full-stack Engineer',
    minimumSkills: ['Typescript', 'React', 'PostgreSQL']
  });

  assert.equal(match.score, 100);
  assert.ok(match.reasons.length >= 1);
});

test('match breakdown returns explainable factors from a parsed resume', () => {
  const breakdown = buildMatchBreakdown({
    id: 'resume-1',
    candidateId: 'candidate-1',
    fileName: 'resume.txt',
    rawText: 'Jane Candidate has JavaScript React Node.js PostgreSQL TypeScript Docker REST API experience',
    parsedAt: new Date().toISOString(),
    skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Docker', 'REST', 'API'],
    education: ['BS Computer Science'],
    experience: ['Senior engineer and technical lead'],
    summary: 'Professional candidate profile',
    status: 'parsed'
  }, 'Senior Full-stack Engineer');

  assert.ok(breakdown.overallScore >= 0);
  assert.ok(breakdown.factorDetails.length >= 4);
  assert.ok(Array.isArray(breakdown.matchedSkills));
});
