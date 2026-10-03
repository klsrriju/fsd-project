export type JobRequirement = {
  title: string;
  minimumSkills: string[];
};

export type CandidateMatch = {
  candidateId: string;
  candidateName: string;
  score: number;
  reasons: string[];
};

export function rankCandidate(candidateSkills: string[], requirements: JobRequirement): CandidateMatch {
  const normalizedCandidateSkills = candidateSkills.map((skill) => skill.toLowerCase());
  const normalizedRequiredSkills = requirements.minimumSkills.map((skill) => skill.toLowerCase());

  const matchedSkills = normalizedRequiredSkills.filter((skill) => normalizedCandidateSkills.includes(skill));
  const missingSkills = normalizedRequiredSkills.filter((skill) => !normalizedCandidateSkills.includes(skill));

  const score = Math.min(100, Math.max(24, Math.round((matchedSkills.length / normalizedRequiredSkills.length) * 100)));

  return {
    candidateId: 'candidate-1',
    candidateName: 'Ranked Candidate',
    score,
    reasons: matchedSkills.length
      ? [`Matched skills: ${matchedSkills.join(', ')}`]
      : ['No strong skills match found'],
  };
}
