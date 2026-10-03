// Demo data store - simulates a database for the platform
import bcrypt from 'bcryptjs';

export type Role = 'hr' | 'candidate';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  name: string;
  createdAt: string;
  // HR-specific
  company?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  location?: string;
  // Candidate-specific
  phone?: string;
  targetRole?: string;
  targetIndustry?: string;
  degree?: string;
  fieldOfStudy?: string;
  university?: string;
  graduationYear?: string;
  yearsOfExperience?: number;
  skills?: string[];
  bio?: string;
  linkedIn?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  expectedSalary?: string;
  jobType?: string; // full-time, part-time, remote, hybrid
  availability?: string;
}

export interface Job {
  id: string;
  hrId: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'remote' | 'hybrid' | 'contract';
  salary: string;
  description: string;
  requirements: string[];
  skills: string[];
  experience: string;
  degree?: string;
  status: 'active' | 'closed' | 'draft';
  createdAt: string;
  applicantsCount: number;
  industry: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  hrId: string;
  status: 'applied' | 'shortlisted' | 'interview_scheduled' | 'interviewed' | 'offered' | 'hired' | 'rejected';
  appliedAt: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  resumeUrl?: string;
  resumeText?: string;
  resumeFeedback?: string;
  notes?: string;
  aiAnalysis?: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  jobId: string;
  candidateId: string;
  hrId: string;
  scheduledAt: string;
  duration: number; // minutes
  mode: 'video' | 'phone' | 'onsite';
  platform?: 'google_meet' | 'zoom' | 'other';
  meetLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'job_match' | 'status_update' | 'interview_scheduled' | 'application_received';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  jobId?: string;
  applicationId?: string;
}

// ─── SEED DATA ─────────────────────────────────────────────────────────────────

const pw = (plain: string) => bcrypt.hashSync(plain, 10);

export const users: User[] = [
  // HR Users
  {
    id: 'hr-001',
    email: 'sarah@techcorp.com',
    passwordHash: pw('password123'),
    role: 'hr',
    name: 'Sarah Mitchell',
    company: 'TechCorp Solutions',
    industry: 'Technology',
    companySize: '501-1000',
    website: 'https://techcorp.com',
    location: 'San Francisco, CA',
    createdAt: '2024-01-10T09:00:00Z',
  },
  {
    id: 'hr-002',
    email: 'james@innovate.io',
    passwordHash: pw('password123'),
    role: 'hr',
    name: 'James Patel',
    company: 'Innovate.io',
    industry: 'Fintech',
    companySize: '101-500',
    website: 'https://innovate.io',
    location: 'Austin, TX',
    createdAt: '2024-02-05T10:00:00Z',
  },
  // Candidates
  {
    id: 'cand-001',
    email: 'alex@gmail.com',
    passwordHash: pw('password123'),
    role: 'candidate',
    name: 'Alex Johnson',
    phone: '+1-555-0101',
    targetRole: 'Full Stack Developer',
    targetIndustry: 'Technology',
    degree: 'Bachelor of Science',
    fieldOfStudy: 'Computer Science',
    university: 'MIT',
    graduationYear: '2021',
    yearsOfExperience: 3,
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS'],
    bio: 'Passionate full-stack developer with 3 years building scalable web applications.',
    linkedIn: 'https://linkedin.com/in/alexjohnson',
    resumeUrl: 'https://drive.google.com/demo/alex-resume.pdf',
    expectedSalary: '$90,000 - $120,000',
    jobType: 'full-time',
    availability: 'Immediately',
    createdAt: '2024-03-01T08:00:00Z',
  },
  {
    id: 'cand-002',
    email: 'priya@gmail.com',
    passwordHash: pw('password123'),
    role: 'candidate',
    name: 'Priya Sharma',
    phone: '+1-555-0102',
    targetRole: 'Data Scientist',
    targetIndustry: 'Technology',
    degree: 'Master of Science',
    fieldOfStudy: 'Data Science',
    university: 'Stanford University',
    graduationYear: '2022',
    yearsOfExperience: 2,
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Pandas', 'NumPy'],
    bio: 'Data scientist specializing in NLP and computer vision models.',
    linkedIn: 'https://linkedin.com/in/priyasharma',
    resumeUrl: 'https://drive.google.com/demo/priya-resume.pdf',
    expectedSalary: '$95,000 - $130,000',
    jobType: 'remote',
    availability: '2 weeks notice',
    createdAt: '2024-03-05T08:00:00Z',
  },
  {
    id: 'cand-003',
    email: 'marcus@gmail.com',
    passwordHash: pw('password123'),
    role: 'candidate',
    name: 'Marcus Williams',
    phone: '+1-555-0103',
    targetRole: 'DevOps Engineer',
    targetIndustry: 'Technology',
    degree: 'Bachelor of Engineering',
    fieldOfStudy: 'Software Engineering',
    university: 'Georgia Tech',
    graduationYear: '2020',
    yearsOfExperience: 4,
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD', 'Linux', 'Python'],
    bio: 'DevOps engineer with expertise in cloud infrastructure and automation.',
    resumeUrl: 'https://drive.google.com/demo/marcus-resume.pdf',
    expectedSalary: '$100,000 - $135,000',
    jobType: 'hybrid',
    availability: '1 month notice',
    createdAt: '2024-03-10T08:00:00Z',
  },
  {
    id: 'cand-004',
    email: 'emma@gmail.com',
    passwordHash: pw('password123'),
    role: 'candidate',
    name: 'Emma Chen',
    phone: '+1-555-0104',
    targetRole: 'UX Designer',
    targetIndustry: 'Technology',
    degree: 'Bachelor of Fine Arts',
    fieldOfStudy: 'Graphic Design',
    university: 'UCLA',
    graduationYear: '2022',
    yearsOfExperience: 2,
    skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'CSS', 'React'],
    bio: 'Creative UX designer passionate about building intuitive digital experiences.',
    resumeUrl: 'https://drive.google.com/demo/emma-resume.pdf',
    expectedSalary: '$75,000 - $95,000',
    jobType: 'hybrid',
    availability: 'Immediately',
    createdAt: '2024-03-15T08:00:00Z',
  },
  {
    id: 'cand-005',
    email: 'daniel@gmail.com',
    passwordHash: pw('password123'),
    role: 'candidate',
    name: 'Daniel Torres',
    phone: '+1-555-0105',
    targetRole: 'Backend Developer',
    targetIndustry: 'Fintech',
    degree: 'Bachelor of Science',
    fieldOfStudy: 'Computer Engineering',
    university: 'UT Austin',
    graduationYear: '2021',
    yearsOfExperience: 3,
    skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Redis', 'Kafka'],
    bio: 'Backend developer specialized in high-performance financial systems.',
    resumeUrl: 'https://drive.google.com/demo/daniel-resume.pdf',
    expectedSalary: '$95,000 - $125,000',
    jobType: 'full-time',
    availability: '2 weeks notice',
    createdAt: '2024-03-20T08:00:00Z',
  },
];

export const jobs: Job[] = [
  {
    id: 'job-001',
    hrId: 'hr-001',
    title: 'Senior Full Stack Developer',
    company: 'TechCorp Solutions',
    location: 'San Francisco, CA (Hybrid)',
    type: 'hybrid',
    salary: '$120,000 - $150,000',
    description: 'We are looking for a Senior Full Stack Developer to join our growing engineering team. You will work on our core product platform, building scalable APIs and beautiful frontend experiences. You will collaborate with product managers, designers, and other engineers to deliver impactful features.',
    requirements: [
      'Strong proficiency in React and TypeScript',
      'Backend experience with Node.js or Python',
      'Experience with cloud platforms (AWS or GCP)',
      'Familiarity with Docker and Kubernetes',
      'Strong understanding of RESTful API design',
      '3+ years of professional software development experience',
    ],
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'REST APIs'],
    experience: '3-5 years',
    degree: 'Bachelor\'s in Computer Science or related field',
    status: 'active',
    createdAt: '2024-04-01T09:00:00Z',
    applicantsCount: 3,
    industry: 'Technology',
  },
  {
    id: 'job-002',
    hrId: 'hr-001',
    title: 'Data Scientist',
    company: 'TechCorp Solutions',
    location: 'Remote',
    type: 'remote',
    salary: '$100,000 - $140,000',
    description: 'Join our AI/ML team and work on cutting-edge machine learning models that power our recommendation engine and data analytics platform. You will design, train, and deploy models at scale.',
    requirements: [
      'Strong background in Python and ML frameworks',
      'Experience with TensorFlow or PyTorch',
      'Proficiency in SQL and data manipulation',
      'Understanding of statistical modeling',
      'Experience deploying models to production',
      '2+ years in a data science or ML engineering role',
    ],
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Pandas', 'Statistics'],
    experience: '2-4 years',
    degree: 'Master\'s in Data Science, Statistics, or Computer Science',
    status: 'active',
    createdAt: '2024-04-05T09:00:00Z',
    applicantsCount: 2,
    industry: 'Technology',
  },
  {
    id: 'job-003',
    hrId: 'hr-002',
    title: 'Backend Engineer (Java/Spring)',
    company: 'Innovate.io',
    location: 'Austin, TX',
    type: 'full-time',
    salary: '$110,000 - $140,000',
    description: 'Innovate.io is building the next generation of fintech infrastructure. We need a strong backend engineer to help us scale our payment processing and financial data systems to handle millions of transactions per day.',
    requirements: [
      'Expert-level Java and Spring Boot',
      'Experience with microservices architecture',
      'Knowledge of message queues (Kafka or RabbitMQ)',
      'Database expertise: PostgreSQL and Redis',
      'Understanding of financial regulations (PCI DSS a plus)',
      '3+ years of backend engineering experience',
    ],
    skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Redis', 'Kafka'],
    experience: '3-5 years',
    degree: 'Bachelor\'s in Computer Science or Engineering',
    status: 'active',
    createdAt: '2024-04-10T09:00:00Z',
    applicantsCount: 1,
    industry: 'Fintech',
  },
  {
    id: 'job-004',
    hrId: 'hr-001',
    title: 'UX/UI Designer',
    company: 'TechCorp Solutions',
    location: 'San Francisco, CA',
    type: 'full-time',
    salary: '$85,000 - $110,000',
    description: 'We need a creative UX/UI Designer to lead design for our web and mobile products. You will conduct user research, create wireframes and prototypes, and collaborate with engineering to bring designs to life.',
    requirements: [
      'Proficiency in Figma and Adobe Creative Suite',
      'Strong portfolio of UX/UI work',
      'Experience with user research and usability testing',
      'Understanding of design systems',
      'Basic knowledge of HTML/CSS a plus',
      '2+ years of UX/UI design experience',
    ],
    skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'CSS', 'Design Systems'],
    experience: '2-4 years',
    degree: 'Bachelor\'s in Design, HCI, or related field',
    status: 'active',
    createdAt: '2024-04-12T09:00:00Z',
    applicantsCount: 1,
    industry: 'Technology',
  },
];

export const applications: Application[] = [
  // Alex applied to Full Stack job - 92% match
  {
    id: 'app-001',
    jobId: 'job-001',
    candidateId: 'cand-001',
    hrId: 'hr-001',
    status: 'shortlisted',
    appliedAt: '2024-04-10T10:00:00Z',
    matchScore: 92,
    matchedSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
    missingSkills: ['Kubernetes'],
    resumeUrl: 'https://drive.google.com/demo/alex-resume.pdf',
    resumeText: 'Alex Johnson - Full Stack Developer with 3 years experience in React, TypeScript, Node.js...',
    resumeFeedback: 'Strong technical foundation. Consider adding more quantifiable achievements (e.g., "Reduced API response time by 40%"). Add Kubernetes experience to fill the only gap.',
    aiAnalysis: 'Excellent match. Alex meets 6 of 7 required skills. Experience aligns with the role. High recommendation for interview.',
    notes: 'Strong candidate, schedule technical interview',
  },
  // Priya applied to Data Scientist job - 95% match
  {
    id: 'app-002',
    jobId: 'job-002',
    candidateId: 'cand-002',
    hrId: 'hr-001',
    status: 'interview_scheduled',
    appliedAt: '2024-04-11T09:00:00Z',
    matchScore: 95,
    matchedSkills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Pandas'],
    missingSkills: ['PyTorch'],
    resumeUrl: 'https://drive.google.com/demo/priya-resume.pdf',
    resumeText: 'Priya Sharma - Data Scientist with MS from Stanford...',
    resumeFeedback: 'Outstanding profile. Add PyTorch projects to complete the skill set. Consider highlighting specific model accuracy improvements.',
    aiAnalysis: 'Near-perfect match. Stanford MS pedigree + 5 of 6 required skills. Top candidate for this role.',
    notes: 'Top candidate, fast-track to interview',
  },
  // Marcus applied to Full Stack job - 65% match
  {
    id: 'app-003',
    jobId: 'job-001',
    candidateId: 'cand-003',
    hrId: 'hr-001',
    status: 'applied',
    appliedAt: '2024-04-12T11:00:00Z',
    matchScore: 65,
    matchedSkills: ['Docker', 'AWS'],
    missingSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    resumeUrl: 'https://drive.google.com/demo/marcus-resume.pdf',
    resumeText: 'Marcus Williams - DevOps Engineer...',
    resumeFeedback: 'Strong infrastructure skills but lacks frontend/backend development experience for this role. Better fit for a DevOps role.',
    aiAnalysis: 'Partial match. Strong DevOps skills but missing core development requirements. Consider for a DevOps role instead.',
    notes: 'Underqualified for this specific role, suggest redirect',
  },
  // Daniel applied to Backend job - 98% match
  {
    id: 'app-004',
    jobId: 'job-003',
    candidateId: 'cand-005',
    hrId: 'hr-002',
    status: 'hired',
    appliedAt: '2024-04-13T08:00:00Z',
    matchScore: 98,
    matchedSkills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Redis', 'Kafka'],
    missingSkills: [],
    resumeUrl: 'https://drive.google.com/demo/daniel-resume.pdf',
    resumeText: 'Daniel Torres - Backend Engineer specializing in Java/Spring Boot...',
    resumeFeedback: 'Perfect match! All required skills present. Add PCI DSS certification to strengthen profile even further.',
    aiAnalysis: 'Perfect match. All 6 required skills present. Finance background aligns perfectly with Innovate.io\'s needs.',
    notes: 'Hired! Starting next month.',
  },
  // Emma applied to UX Designer job - 88% match
  {
    id: 'app-005',
    jobId: 'job-004',
    candidateId: 'cand-004',
    hrId: 'hr-001',
    status: 'offered',
    appliedAt: '2024-04-14T10:00:00Z',
    matchScore: 88,
    matchedSkills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'CSS'],
    missingSkills: ['Design Systems'],
    resumeUrl: 'https://drive.google.com/demo/emma-resume.pdf',
    resumeText: 'Emma Chen - UX/UI Designer with 2 years experience...',
    resumeFeedback: 'Strong design portfolio. Add design system experience and component library work to your portfolio.',
    aiAnalysis: 'Strong match. Creative portfolio + 5 of 6 required skills. Excellent communication noted during screening.',
    notes: 'Offer sent, awaiting response',
  },
  // Alex also applied to Data Science job - 45% match
  {
    id: 'app-006',
    jobId: 'job-002',
    candidateId: 'cand-001',
    hrId: 'hr-001',
    status: 'rejected',
    appliedAt: '2024-04-08T09:00:00Z',
    matchScore: 45,
    matchedSkills: ['SQL'],
    missingSkills: ['Python', 'Machine Learning', 'TensorFlow', 'Pandas', 'Statistics'],
    resumeUrl: 'https://drive.google.com/demo/alex-resume.pdf',
    resumeText: 'Alex Johnson - Full Stack Developer...',
    resumeFeedback: 'Your background is better aligned with Full Stack or Software Engineering roles. Focus on building Python and ML skills if you want to transition to data science.',
    aiAnalysis: 'Low match. Strong software engineering background but lacks core data science skills.',
    notes: 'Not a fit for data science role',
  },
];

export const interviews: Interview[] = [
  {
    id: 'int-001',
    applicationId: 'app-002',
    jobId: 'job-002',
    candidateId: 'cand-002',
    hrId: 'hr-001',
    scheduledAt: '2024-04-20T14:00:00Z',
    duration: 60,
    mode: 'video',
    platform: 'google_meet',
    meetLink: 'https://meet.google.com/abc-defg-hij',
    status: 'scheduled',
    notes: 'Technical round: Focus on ML model design and Python proficiency',
  },
  {
    id: 'int-002',
    applicationId: 'app-001',
    jobId: 'job-001',
    candidateId: 'cand-001',
    hrId: 'hr-001',
    scheduledAt: '2024-04-18T10:00:00Z',
    duration: 90,
    mode: 'video',
    platform: 'zoom',
    meetLink: 'https://zoom.us/j/123456789',
    status: 'completed',
    notes: 'Excellent performance. Strong React knowledge. Proceed to offer stage.',
  },
];

export const notifications: Notification[] = [
  {
    id: 'notif-001',
    userId: 'cand-001',
    type: 'status_update',
    title: 'Application Shortlisted!',
    message: 'Congratulations! Your application for Senior Full Stack Developer at TechCorp Solutions has been shortlisted.',
    read: false,
    createdAt: '2024-04-11T12:00:00Z',
    jobId: 'job-001',
    applicationId: 'app-001',
  },
  {
    id: 'notif-002',
    userId: 'cand-002',
    type: 'interview_scheduled',
    title: 'Interview Scheduled',
    message: 'Your interview for Data Scientist at TechCorp Solutions has been scheduled for April 20 at 2:00 PM.',
    read: false,
    createdAt: '2024-04-15T09:00:00Z',
    jobId: 'job-002',
    applicationId: 'app-002',
  },
  {
    id: 'notif-003',
    userId: 'cand-003',
    type: 'job_match',
    title: 'New Job Match!',
    message: 'A new DevOps Engineer position at TechCorp Solutions matches your profile.',
    read: true,
    createdAt: '2024-04-13T10:00:00Z',
    jobId: 'job-001',
  },
  {
    id: 'notif-004',
    userId: 'hr-001',
    type: 'application_received',
    title: 'New Application Received',
    message: 'Alex Johnson has applied for Senior Full Stack Developer.',
    read: true,
    createdAt: '2024-04-10T10:30:00Z',
    jobId: 'job-001',
    applicationId: 'app-001',
  },
];

// ─── HELPER: compute match score between candidate skills and job skills ────────
export function computeMatchScore(candidateSkills: string[], jobSkills: string[], jobRequirements: string[]): {
  score: number;
  matched: string[];
  missing: string[];
} {
  const normalizeSkill = (s: string) => s.toLowerCase().trim();
  const candidateNorm = candidateSkills.map(normalizeSkill);
  const jobNorm = jobSkills.map(normalizeSkill);

  const matched = jobSkills.filter((s) => candidateNorm.includes(normalizeSkill(s)));
  const missing = jobSkills.filter((s) => !candidateNorm.includes(normalizeSkill(s)));

  const skillScore = jobSkills.length > 0 ? (matched.length / jobSkills.length) * 100 : 0;
  const score = Math.min(100, Math.round(skillScore));

  return { score, matched, missing };
}

// ─── HELPER: resume analysis feedback ──────────────────────────────────────────
export function generateResumeFeedback(candidateSkills: string[], jobSkills: string[], jobTitle: string): string {
  const missing = jobSkills.filter(
    (s) => !candidateSkills.map((cs) => cs.toLowerCase()).includes(s.toLowerCase())
  );

  const tips = [];

  if (missing.length === 0) {
    tips.push('✅ Your skills are a perfect match for this role!');
    tips.push('💡 Strengthen your resume by quantifying achievements (e.g., "Increased performance by 40%").');
  } else {
    tips.push(`❌ Skills gap: You are missing ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? ` and ${missing.length - 3} more` : ''}.`);
    tips.push(`📚 Recommended learning: Focus on acquiring ${missing[0]} first as it is the most critical skill.`);
    tips.push(`💡 Add a "Projects" section to demonstrate practical experience with the required technologies.`);
  }

  tips.push(`📝 Tailor your resume summary specifically for "${jobTitle}" to pass ATS filters.`);
  tips.push(`🔗 Link to GitHub projects or a portfolio that showcases relevant work.`);

  return tips.join('\n');
}
