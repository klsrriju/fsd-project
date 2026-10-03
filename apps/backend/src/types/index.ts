export type Role = 'hr' | 'recruiter' | 'candidate';
export type RecruitmentStatus = 'draft' | 'active' | 'closed' | 'review' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  status: RecruitmentStatus;
  seniority: 'junior' | 'mid' | 'senior' | 'lead';
  description: string;
  requirements: string[];
  createdBy: string;
  createdAt: string;
};

export type Candidate = {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  yearsOfExperience: number;
  location: string;
  createdAt: string;
  currentStatus: RecruitmentStatus;
};

export type Resume = {
  id: string;
  candidateId: string;
  fileName: string;
  rawText: string;
  parsedAt: string;
  skills: string[];
  education: string[];
  experience: string[];
  summary: string;
  status: 'pending' | 'parsed' | 'failed';
};

export type Skill = {
  id: string;
  name: string;
  category: string;
};

export type Application = {
  id: string;
  jobId: string;
  candidateId: string;
  status: RecruitmentStatus;
  source: string;
  appliedAt: string;
  reviewScore?: number;
  scoreBreakdown?: MatchBreakdown;
};

export type Interview = {
  id: string;
  applicationId: string;
  jobId: string;
  candidateId: string;
  interviewerId: string;
  scheduledAt: string;
  mode: 'phone' | 'video' | 'onsite';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
};

export type MatchBreakdown = {
  overallScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  requirementsScore: number;
  reasons: string[];
  missingSkills: string[];
  matchedSkills: string[];
};
