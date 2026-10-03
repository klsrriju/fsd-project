import { Resume } from '../types';

export type MatchFactor = {
  name: string;
  weight: number;
  weightLabel: string;
  matched: boolean;
  score: number;
  detail: string;
};

export type CandidateScoreBreakdown = {
  overallScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  requirementsScore: number;
  reasons: string[];
  missingSkills: string[];
  matchedSkills: string[];
  factorDetails: MatchFactor[];
};

export function buildMatchBreakdown(resume: Resume, jobTitle: string, requirements: string[] = []): CandidateScoreBreakdown {
  const normalizedCandidateSkills = (resume.skills || []).map((s) => s.toLowerCase());
  const required = (requirements || []).map((item) => item.toLowerCase());

  const matchedSkills = required.filter((skill) => normalizedCandidateSkills.includes(skill));
  const missingSkills = required.filter((skill) => !normalizedCandidateSkills.includes(skill));

  const skillsScore = Math.min(100, Math.round((matchedSkills.length / Math.max(required.length, 1)) * 100));
  const experienceScore = Math.min(100, Math.round(Math.max(50, Math.min(100, resume.experience.length * 25))));
  const educationScore = resume.education.length > 0 ? 90 : 50;
  const requirementsScore = Math.min(100, Math.round((matchedSkills.length / Math.max(required.length, 1)) * 100));
  const overallScore = Math.round(skillsScore * 0.45 + experienceScore * 0.2 + educationScore * 0.15 + requirementsScore * 0.2);

  const factors: MatchFactor[] = [
    { name: 'Skills', weight: 45, weightLabel: '45%', matched: matchedSkills.length > 0, score: skillsScore, detail: `Matched ${matchedSkills.length}/${required.length} core skills` },
    { name: 'Experience', weight: 20, weightLabel: '20%', matched: resume.experience.length > 0, score: experienceScore, detail: `${resume.experience.length} experience signals identified` },
    { name: 'Education', weight: 15, weightLabel: '15%', matched: resume.education.length > 0, score: educationScore, detail: `${resume.education.length} education signal${resume.education.length === 1 ? '' : 's'} found` },
    { name: 'Requirements Fit', weight: 20, weightLabel: '20%', matched: matchedSkills.length >= 2, score: requirementsScore, detail: `${required.length} requested skills compared` }
  ];

  return {
    overallScore,
    skillsScore,
    experienceScore,
    educationScore,
    requirementsScore,
    matchedSkills: matchedSkills.map((skill) => skill[0].toUpperCase() + skill.slice(1)),
    missingSkills: missingSkills.map((skill) => skill[0].toUpperCase() + skill.slice(1)),
    reasons: [
      `Skills matched: ${matchedSkills.join(', ') || 'none'}`,
      `Experience signals detected: ${resume.experience.length}`,
      `Education details found: ${resume.education.length}`
    ],
    factorDetails: factors
  };
}
