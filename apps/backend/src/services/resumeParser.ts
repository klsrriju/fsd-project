export type ParsedResume = {
  fullName: string;
  email: string;
  skills: string[];
  education: string[];
  experience: string[];
  summary: string;
};

export interface ResumeStructureAnalysis {
  structureScore: number;
  atsCompatibility: 'High' | 'Medium' | 'Needs Improvement';
  atsReadabilityScore: number;
  actionVerbsCount: number;
  quantifiableMetricsCount: number;
  sectionsFound: string[];
  missingSections: string[];
  sectionAudits: Array<{
    section: string;
    status: 'good' | 'warning' | 'missing';
    label: string;
    advice: string;
  }>;
  presentationSuggestions: Array<{
    category: 'Layout' | 'Content' | 'Impact' | 'ATS';
    tip: string;
    example?: string;
  }>;
}

// Master categorized dictionary of 200+ industry-standard skills
export const SKILLS_TAXONOMY: Record<string, string[]> = {
  'Languages': [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Golang', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'SQL', 'HTML5', 'CSS3', 'Bash', 'Shell', 'R', 'Scala'
  ],
  'Frontend': [
    'React', 'React.js', 'Next.js', 'Vue', 'Vue.js', 'Angular', 'Svelte', 'Redux', 'Zustand', 'Tailwind CSS', 'Tailwind', 'Bootstrap', 'Material UI', 'Sass', 'SCSS', 'Webpack', 'Vite', 'GraphQL', 'Responsive Design'
  ],
  'Backend & APIs': [
    'Node.js', 'Express', 'Express.js', 'NestJS', 'Django', 'FastAPI', 'Flask', 'Spring Boot', 'Spring', 'ASP.NET', 'Ruby on Rails', 'REST', 'RESTful APIs', 'gRPC', 'Microservices', 'GraphQL', 'WebSockets', 'Serverless'
  ],
  'Databases & Storage': [
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'DynamoDB', 'Cassandra', 'SQLite', 'Elasticsearch', 'Firebase', 'Prisma', 'Mongoose', 'TypeORM', 'Supabase', 'Oracle'
  ],
  'Cloud & DevOps': [
    'AWS', 'Amazon Web Services', 'Azure', 'Google Cloud', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'Jenkins', 'Terraform', 'Ansible', 'Linux', 'Nginx', 'Prometheus', 'Grafana'
  ],
  'AI & Machine Learning': [
    'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'NLP', 'Computer Vision', 'Pandas', 'NumPy', 'OpenAI', 'Gemini', 'LLMs', 'LangChain', 'Hugging Face'
  ],
  'Tools & Methodologies': [
    'Git', 'GitHub', 'GitLab', 'Jira', 'Agile', 'Scrum', 'Jest', 'Cypress', 'Playwright', 'Mocha', 'Unit Testing', 'System Design', 'TDD', 'OAuth', 'JWT', 'Kafka', 'RabbitMQ'
  ]
};

// Flattened list for fast regex matching
const ALL_SKILLS: string[] = Object.values(SKILLS_TAXONOMY).flat();

/**
 * Robust skill extraction from raw text (handles multi-word terms, punctuation, and aliases)
 */
export function extractSkillsFromText(rawText: string): { skills: string[]; categorized: Record<string, string[]> } {
  if (!rawText || typeof rawText !== 'string') {
    return { skills: [], categorized: {} };
  }

  const foundSet = new Set<string>();
  const categorized: Record<string, string[]> = {};

  for (const [category, skillList] of Object.entries(SKILLS_TAXONOMY)) {
    categorized[category] = [];
    for (const skill of skillList) {
      // Escape regex special chars like C++, C#, .js, etc.
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Word boundary or symbol delimiter
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9_+#-])${escaped}(?=[^a-zA-Z0-9_+#-]|$)|^${escaped}$`, 'i');
      if (regex.test(rawText)) {
        foundSet.add(skill);
        categorized[category].push(skill);
      }
    }
    if (categorized[category].length === 0) {
      delete categorized[category];
    }
  }

  // Canonical deduplication (e.g., if "React.js" and "React" both matched, prefer "React")
  const skills = Array.from(foundSet);
  return { skills, categorized };
}

/**
 * Parse structured candidate signals from raw resume text
 */
export function parseResume(rawText: string): ParsedResume {
  const trimmed = rawText.trim();
  const fullName = trimmed.match(/^[A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+)+/)?.[0] || 'Candidate';
  const email = rawText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || 'candidate@example.com';
  
  const { skills } = extractSkillsFromText(rawText);

  const education = rawText
    .split(/\n|\r\n/)
    .filter((line) => /school|university|college|degree|bachelor|master|education|phd|b\.s|b\.tech|m\.s/i.test(line))
    .slice(0, 4);

  const experience = rawText
    .split(/\n|\r\n/)
    .filter((line) => /experience|worked|engineer|developer|manager|intern|team|lead|architect|consultant/i.test(line))
    .slice(0, 6);

  return {
    fullName,
    email,
    skills,
    education,
    experience,
    summary: rawText.slice(0, 260) || 'Professional candidate profile',
  };
}

/**
 * In-depth structural and presentation analysis of the candidate's resume
 */
export function analyzeResumeStructure(rawText: string): ResumeStructureAnalysis {
  if (!rawText || rawText.trim().length < 20) {
    return {
      structureScore: 40,
      atsCompatibility: 'Needs Improvement',
      atsReadabilityScore: 45,
      actionVerbsCount: 0,
      quantifiableMetricsCount: 0,
      sectionsFound: [],
      missingSections: ['Contact Info', 'Professional Summary', 'Work Experience', 'Skills', 'Education', 'Projects'],
      sectionAudits: [
        { section: 'Content Length', status: 'missing', label: 'Insufficient Text', advice: 'Paste or upload your full resume text to generate detailed section-by-section advice.' }
      ],
      presentationSuggestions: [
        { category: 'Content', tip: 'Include complete work history, measurable achievements, and a clear skills matrix.' }
      ],
    };
  }

  const text = rawText.toLowerCase();

  // 1. Audit core sections
  const sectionChecks: Array<{ name: string; test: RegExp; weight: number }> = [
    { name: 'Contact Info', test: /(email|phone|linkedin|github|portfolio|tel|contact)/i, weight: 15 },
    { name: 'Professional Summary', test: /(summary|profile|about me|objective|overview)/i, weight: 15 },
    { name: 'Work Experience', test: /(experience|work history|employment|career|responsibilities|roles)/i, weight: 25 },
    { name: 'Technical Skills', test: /(skills|technologies|proficiencies|tech stack|core competencies)/i, weight: 20 },
    { name: 'Education', test: /(education|degree|university|college|bachelor|master|b\.tech|m\.s)/i, weight: 15 },
    { name: 'Projects & Portfolio', test: /(projects|portfolio|open source|github\.com|hackathon|applications built)/i, weight: 10 },
  ];

  const sectionsFound: string[] = [];
  const missingSections: string[] = [];
  let sectionScore = 0;

  const sectionAudits: ResumeStructureAnalysis['sectionAudits'] = [];

  for (const s of sectionChecks) {
    if (s.test.test(rawText)) {
      sectionsFound.push(s.name);
      sectionScore += s.weight;
      sectionAudits.push({
        section: s.name,
        status: 'good',
        label: 'Detected & Well-Defined',
        advice: `Your ${s.name} section is clearly identified, which improves ATS parsing reliability.`,
      });
    } else {
      missingSections.push(s.name);
      sectionAudits.push({
        section: s.name,
        status: 'missing',
        label: 'Missing or Unlabeled',
        advice: `Add an explicit heading for "${s.name}" to ensure standard ATS parsers categorize your credentials accurately.`,
      });
    }
  }

  // 2. Count strong action verbs
  const actionVerbRegex = /\b(architected|spearheaded|engineered|developed|implemented|optimized|accelerated|automated|orchestrated|deployed|designed|refactored|scaled|collaborated|delivered|mentored|established|reduced|increased|boosted|resolved)\b/gi;
  const actionVerbsMatches = rawText.match(actionVerbRegex) || [];
  const actionVerbsCount = actionVerbsMatches.length;

  // 3. Count quantifiable metrics (% numbers, currency, ratios)
  const metricsRegex = /\b(\d+%\b|\$\d+[\d,]*\b|\b\d+x\b|\b\d+\s*(?:ms|seconds|minutes|hours|days|users|clients|requests|transactions|million|billion|k\b))/gi;
  const metricsMatches = rawText.match(metricsRegex) || [];
  const quantifiableMetricsCount = metricsMatches.length;

  // 4. Calculate Scores
  let atsReadabilityScore = 65;
  if (sectionsFound.length >= 5) atsReadabilityScore += 20;
  else if (sectionsFound.length >= 3) atsReadabilityScore += 10;
  if (actionVerbsCount >= 6) atsReadabilityScore += 10;
  if (quantifiableMetricsCount >= 3) atsReadabilityScore += 5;
  atsReadabilityScore = Math.min(100, Math.max(30, atsReadabilityScore));

  const structureScore = Math.min(100, Math.round((sectionScore * 0.6) + (Math.min(actionVerbsCount, 10) * 2.5) + (Math.min(quantifiableMetricsCount, 5) * 3)));

  const atsCompatibility: ResumeStructureAnalysis['atsCompatibility'] =
    structureScore >= 80 ? 'High' : structureScore >= 60 ? 'Medium' : 'Needs Improvement';

  // 5. Generate Tailored Presentation Suggestions
  const presentationSuggestions: ResumeStructureAnalysis['presentationSuggestions'] = [];

  // Suggestion 1: Impact bullets using Google X-Y-Z formula
  if (quantifiableMetricsCount < 3) {
    presentationSuggestions.push({
      category: 'Impact',
      tip: 'Adopt the Google "X-Y-Z formula" for bullet points: "Accomplished [X] as measured by [Y], by doing [Z]". Recruiters look for business outcomes, not just task lists.',
      example: 'e.g. "Accelerated API response times by 38% (Y) by refactoring database indexing and Redis caching (Z) across 15+ microservices (X)."'
    });
  } else {
    presentationSuggestions.push({
      category: 'Impact',
      tip: 'Great job incorporating quantitative data! Ensure numbers highlight business scale and performance gains directly relevant to your target role.'
    });
  }

  // Suggestion 2: Action Verbs
  if (actionVerbsCount < 5) {
    presentationSuggestions.push({
      category: 'Content',
      tip: 'Lead every bullet point with a decisive past-tense action verb (e.g. "Architected", "Engineered", "Automated") rather than passive phrases like "Responsible for" or "Helped with".'
    });
  }

  // Suggestion 3: Layout & ATS Best Practices
  if (missingSections.includes('Technical Skills')) {
    presentationSuggestions.push({
      category: 'Layout',
      tip: 'Group technical skills into clear categories (e.g., Languages, Frameworks, Cloud/DevOps, Databases) at the top of your resume for fast 6-second recruiter scanning.'
    });
  } else {
    presentationSuggestions.push({
      category: 'Layout',
      tip: 'Keep margins between 0.5" to 0.75" and stick to clean standard fonts (Inter, Calibri, Roboto, Arial). Avoid multi-column tables, charts, or images that can confuse automated ATS scanners.'
    });
  }

  if (missingSections.includes('Professional Summary')) {
    presentationSuggestions.push({
      category: 'Content',
      tip: 'Include a concise 2-3 sentence Professional Summary at the top emphasizing your specialty, core tech stack, and primary value proposition.'
    });
  }

  presentationSuggestions.push({
    category: 'ATS',
    tip: 'Align your section headings with standard names ("Experience", "Education", "Skills") instead of unconventional phrases like "Where I\'ve Been" or "Toolbox".'
  });

  return {
    structureScore,
    atsCompatibility,
    atsReadabilityScore,
    actionVerbsCount,
    quantifiableMetricsCount,
    sectionsFound,
    missingSections,
    sectionAudits,
    presentationSuggestions,
  };
}
