import axios from 'axios';
import { config } from '../config/env';

const GEMINI_MODEL = 'gemini-flash-latest';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

function extractJsonBlock(text: string, type: 'object' | 'array'): string {
  const cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  const startChar = type === 'array' ? '[' : '{';
  const endChar = type === 'array' ? ']' : '}';
  const start = cleaned.indexOf(startChar);
  const end = cleaned.lastIndexOf(endChar);
  if (start !== -1 && end !== -1 && end > start) {
    return cleaned.slice(start, end + 1);
  }
  return cleaned;
}

export function safeJsonParse<T = any>(raw: string, type: 'object' | 'array'): T | null {
  if (!raw) return null;
  try {
    const block = extractJsonBlock(raw, type);
    return JSON.parse(block) as T;
  } catch {
    try {
      let cleaned = extractJsonBlock(raw, type);
      // Remove trailing commas before closing braces/brackets
      cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(cleaned) as T;
    } catch {
      return null;
    }
  }
}

/**
 * Call Gemini REST API with prompt, timeout and safe error handling
 */
export async function callGemini(prompt: string, maxTokens = 2500, retryCount = 1): Promise<string | null> {
  const apiKey = config.gemini.apiKey;
  if (!apiKey) {
    return null;
  }

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      const url = `${API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
      const response = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            maxOutputTokens: maxTokens,
            temperature: 0.3,
          },
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 40000,
        }
      );

      const candidate = response.data?.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text;
      if (text) return text.trim();
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.error?.message || err.message;
      if ((status === 503 || status === 429 || msg?.includes('high demand')) && attempt < retryCount) {
        // Brief backoff before retry
        await new Promise(res => setTimeout(res, 2000));
        continue;
      }
      console.warn('⚠️ [Gemini AI] API call failed, falling back to local engine:', msg);
      return null;
    }
  }
  return null;
}

/**
 * AI-powered resume and job match analysis using Gemini
 */
export async function analyzeResumeWithGemini(params: {
  jobTitle: string;
  jobCompany: string;
  jobSkills: string[];
  jobRequirements: string[];
  candidateSkills: string[];
  resumeText?: string;
}): Promise<{
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  factorDetails: Array<{ name: string; weight: number; weightLabel: string; score: number; detail: string }>;
  recommendations: Array<{ skill: string; priority: 'high' | 'medium'; action: string; learningTip?: string }>;
  overallSuggestion: string;
  explanation: string;
} | null> {
  const prompt = `You are a strict, senior technical recruiter and AI talent matcher.
Analyze this candidate for the target job position and output ONLY a valid JSON object (no markdown, no backticks, no extra text).

Target Job:
- Title: ${params.jobTitle}
- Company: ${params.jobCompany}
- Required Skills: ${params.jobSkills.join(', ')}
- Requirements: ${params.jobRequirements.join('; ')}

Candidate Profile:
- Stated Skills: ${params.candidateSkills.join(', ')}
${params.resumeText ? `- Resume / Experience Text: "${params.resumeText.slice(0, 1500)}"` : ''}

Respond with EXACTLY this JSON structure:
{
  "score": <number between 0 and 100>,
  "skillsScore": <number between 0 and 100>,
  "experienceScore": <number between 0 and 100>,
  "educationScore": <number between 0 and 100>,
  "requirementsScore": <number between 0 and 100>,
  "matchedSkills": [<array of matched strings>],
  "missingSkills": [<array of missing skill strings from required skills>],
  "recommendations": [
    {
      "skill": "<skill name>",
      "priority": "<'high' or 'medium'>",
      "action": "<specific project or certification to close this gap>",
      "learningTip": "<practical learning recommendation>"
    }
  ],
  "overallSuggestion": "<1-2 sentence overall assessment>",
  "explanation": "<Clear explanation of why this score was awarded>"
}`;

  const rawJson = await callGemini(prompt, 2500);
  if (!rawJson) return null;

  try {
    const data = safeJsonParse(rawJson, 'object');
    if (!data) return null;

    const factorDetails = [
      {
        name: 'Skills Fit',
        weight: 45,
        weightLabel: '45%',
        score: Number(data.skillsScore) || Math.min(100, Math.round(((data.matchedSkills?.length || 1) / Math.max(params.jobSkills.length, 1)) * 100)),
        detail: `Matched ${data.matchedSkills?.length || 0}/${params.jobSkills.length} core technologies`,
      },
      {
        name: 'Experience Signals',
        weight: 20,
        weightLabel: '20%',
        score: Number(data.experienceScore) || (data.score >= 70 ? 85 : 60),
        detail: 'Evaluated based on career history and projects',
      },
      {
        name: 'Education Foundation',
        weight: 15,
        weightLabel: '15%',
        score: Number(data.educationScore) || 80,
        detail: 'Academic qualifications and fundamentals',
      },
      {
        name: 'Requirements Alignment',
        weight: 20,
        weightLabel: '20%',
        score: Number(data.requirementsScore) || Number(data.score) || 75,
        detail: 'Alignment with role responsibilities and criteria',
      },
    ];

    return {
      score: Math.min(100, Math.max(0, Math.round(Number(data.score) || 70))),
      matchedSkills: Array.isArray(data.matchedSkills) ? data.matchedSkills : [],
      missingSkills: Array.isArray(data.missingSkills) ? data.missingSkills : [],
      factorDetails,
      recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
      overallSuggestion: data.overallSuggestion || 'Analysis completed.',
      explanation: data.explanation || 'Score evaluated via Gemini AI multi-factor analysis.',
    };
  } catch (parseErr) {
    console.warn('⚠️ [Gemini AI] Failed to parse JSON response:', parseErr);
    return null;
  }
}

/**
 * AI-generated dynamic interview questions tailored to the job posting
 */
export async function generateInterviewQuestionsWithGemini(params: {
  jobTitle: string;
  company: string;
  skills: string[];
  description?: string;
}): Promise<string[] | null> {
  const prompt = `Generate 6 realistic, technical and behavioral interview questions for the role of ${params.jobTitle} at ${params.company}.
Required skills: ${params.skills.join(', ')}.
${params.description ? `Job summary: ${params.description.slice(0, 400)}` : ''}

Output ONLY a JSON array of 6 question strings:
["Question 1", "Question 2", "Question 3", "Question 4", "Question 5", "Question 6"]`;

  const rawJson = await callGemini(prompt, 1000);
  if (!rawJson) return null;

  try {
    const list = safeJsonParse(rawJson, 'array');
    if (Array.isArray(list) && list.length >= 4) {
      return list.map(q => String(q).trim());
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * AI evaluation of a candidate's interview response with honest, motivating, and STAR-focused critique
 */
export async function evaluateInterviewAnswerWithGemini(params: {
  question: string;
  answer: string;
  jobTitle?: string;
}): Promise<{
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  tips: string[];
} | null> {
  const prompt = `You are an honest, encouraging, and highly experienced senior engineering manager and interview coach.
Evaluate this candidate's interview answer with high honesty and constructive motivation.

Job Title: ${params.jobTitle || 'Software Engineer'}
Question: "${params.question}"
Candidate Answer: "${params.answer}"

Guidelines:
- Score HONESTLY between 0 and 100 based on technical accuracy, depth, relevance, and the STAR framework (Situation, Task, Action, Result).
  * If the answer is one vague sentence or just lists tools without context, score it realistically (35-60). Do NOT hand out 90s for minimal answers.
  * If the answer has good substance but lacks metrics or STAR outcomes, score it (65-78).
  * If the answer is detailed, specific, and articulates clear personal actions and results, score it (80-95).
- Feedback must be BOTH honest and motivating: celebrate what they did right first, then directly call out what is missing to make it stand out to hiring managers.
- Provide 3 concrete, encouraging improvement tips with examples tailored to this exact question.

Output ONLY a JSON object:
{
  "score": <number 0-100>,
  "feedback": "<2-4 sentences: honest assessment highlighting their real strengths, motivating tone, and exact gap>",
  "strengths": ["<specific strength 1>", "<specific strength 2>"],
  "improvements": ["<specific missing piece 1>", "<specific missing piece 2>"],
  "tips": [
    "<actionable tip 1 with practical example>",
    "<actionable tip 2 with practical example>",
    "<actionable tip 3 with practical example>"
  ]
}`;

  const rawJson = await callGemini(prompt, 1200);
  if (!rawJson) return null;

  try {
    const data = safeJsonParse(rawJson, 'object');
    if (!data) return null;
    return {
      score: Math.min(100, Math.max(0, Math.round(Number(data.score) || 70))),
      feedback: data.feedback || 'Good attempt. Structure your response using the STAR framework to showcase measurable impact.',
      strengths: Array.isArray(data.strengths) ? data.strengths : ['Clear communication', 'Relevant technical topic mentioned'],
      improvements: Array.isArray(data.improvements) ? data.improvements : ['Needs quantifiable results', 'Specify actions you personally took'],
      tips: Array.isArray(data.tips) ? data.tips.map((t: any) => `💡 ${String(t).replace(/^💡\s*/, '')}`) : [
        '💡 Use the STAR method: Briefly state the Situation, Task, your specific Action, and measurable Result.',
        '💡 Quantify outcomes (e.g., "reduced latency by 25%", "supported 10k daily active users").',
        '💡 Emphasize the reasoning behind your technical choices to prove architectural maturity.',
      ],
    };
  } catch {
    return null;
  }
}

/**
 * AI-powered Code Review & Pinpoint Improvement for Technical Coding Interviews (LeetCode style)
 */
export async function evaluateCodingSolutionWithGemini(params: {
  problemTitle: string;
  difficulty: string;
  language: string;
  code: string;
  problemDescription?: string;
}): Promise<{
  score: number;
  verdict: 'Accepted' | 'Optimal Solution' | 'Suboptimal Efficiency' | 'Logic Bug Detected' | 'Edge Case Failure' | 'Syntax Error';
  timeComplexity: string;
  spaceComplexity: string;
  overview: string;
  strengths: string[];
  pinpointImprovements: Array<{
    part: string;
    issue: string;
    suggestion: string;
    improvedSnippet?: string;
  }>;
  edgeCasesToConsider: string[];
  optimalCode: string;
  motivatingAdvice: string;
} | null> {
  const prompt = `You are a Principal Software Engineer and Staff Technical Interviewer evaluating a candidate's code submission for a LeetCode-style coding interview question.

Problem: ${params.problemTitle} (${params.difficulty})
${params.problemDescription ? `Description: ${params.problemDescription.slice(0, 500)}` : ''}
Language: ${params.language}
Candidate Code:
\`\`\`${params.language}
${params.code}
\`\`\`

Evaluate the submission thoroughly:
1. Correctness: Does it solve the problem? Are there logic bugs or missed edge cases (e.g. empty inputs, single element, negative numbers, duplicates)?
2. Complexity: Calculate Big-O Time Complexity and Space Complexity.
3. Pinpoint Exact Improvements: Identify the specific lines or parts of code (e.g. "Inside the nested for loop", "Variable initialization", "Condition on boundary check") where they can optimize or prevent bugs.
4. Optimal Solution: Provide the cleanest, optimal production-grade implementation with clear comments.
5. Motivating Mentorship: Give encouraging, honest coaching on how top engineers think through this problem pattern.

Output ONLY a JSON object:
{
  "score": <number 0-100>,
  "verdict": "<'Accepted' | 'Optimal Solution' | 'Suboptimal Efficiency' | 'Logic Bug Detected' | 'Edge Case Failure' | 'Syntax Error'>",
  "timeComplexity": "<e.g. O(N) or O(N^2)>",
  "spaceComplexity": "<e.g. O(1) or O(N)>",
  "overview": "<2-3 sentence honest, motivating summary of the approach>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "pinpointImprovements": [
    {
      "part": "<exact function, line, or block>",
      "issue": "<what makes this suboptimal or risky>",
      "suggestion": "<how to fix it>",
      "improvedSnippet": "<short replacement code snippet>"
    }
  ],
  "edgeCasesToConsider": ["<edge case 1>", "<edge case 2>"],
  "optimalCode": "<full optimal clean solution in ${params.language}>",
  "motivatingAdvice": "<encouraging coaching takeaway for the candidate>"
}`;

  const rawJson = await callGemini(prompt, 2000);
  if (!rawJson) return null;

  try {
    const data = safeJsonParse(rawJson, 'object');
    if (!data) return null;
    return {
      score: Math.min(100, Math.max(0, Math.round(Number(data.score) || 75))),
      verdict: data.verdict || 'Suboptimal Efficiency',
      timeComplexity: data.timeComplexity || 'O(N)',
      spaceComplexity: data.spaceComplexity || 'O(1)',
      overview: data.overview || 'Code analyzed. Review the pinpoint suggestions below to elevate your algorithmic efficiency.',
      strengths: Array.isArray(data.strengths) ? data.strengths : ['Clear logic flow'],
      pinpointImprovements: Array.isArray(data.pinpointImprovements) ? data.pinpointImprovements : [],
      edgeCasesToConsider: Array.isArray(data.edgeCasesToConsider) ? data.edgeCasesToConsider : [],
      optimalCode: data.optimalCode || params.code,
      motivatingAdvice: data.motivatingAdvice || 'Keep practicing! Mastering this pattern will build strong confidence for live coding rounds.',
    };
  } catch {
    return null;
  }
}

/**
 * AI-powered comprehensive technical interview test evaluator
 */
export async function evaluateTechnicalInterviewTestWithGemini(params: {
  questions: Array<{
    id: string;
    title: string;
    difficulty: string;
    description: string;
    code: string;
    language: string;
  }>;
}): Promise<{
  overallScore: number;
  logicScore: number;
  efficiencyScore: number;
  verdict: 'Strong Hire' | 'Hire' | 'Leaning Hire' | 'Needs Practice';
  executiveSummary: string;
  logicProgressionNote: string;
  questionReviews: Array<{
    problemId: string;
    problemTitle: string;
    score: number;
    timeComplexity: string;
    spaceComplexity: string;
    verdict: string;
    strengths: string[];
    improvements: string[];
  }>;
} | null> {
  const questionsPrompt = params.questions.map((q, idx) => `
--- Question ${idx + 1}: ${q.title} (${q.difficulty}) ---
Problem: ${q.description.slice(0, 300)}
Candidate Solution (${q.language}):
\`\`\`
${q.code}
\`\`\`
`).join('\n');

  const prompt = `You are a Principal Software Engineer and Bar Raiser conducting a comprehensive technical coding assessment review for a top-tier tech company.
Evaluate the candidate's test submission across all questions:
${questionsPrompt}

Provide a rigorous, honest, and motivating assessment of their engineering logic, algorithmic correctness, and code efficiency.

Output ONLY a JSON object:
{
  "overallScore": <number 0-100>,
  "logicScore": <number 0-100>,
  "efficiencyScore": <number 0-100>,
  "verdict": "<'Strong Hire' | 'Hire' | 'Leaning Hire' | 'Needs Practice'>",
  "executiveSummary": "<3-4 sentences synthesizing their technical logic, execution speed, edge-case vigilance, and interview readiness>",
  "logicProgressionNote": "<2-3 actionable sentences analyzing how their algorithmic thinking is progressing and where they should focus next>",
  "questionReviews": [
    {
      "problemId": "<question id>",
      "problemTitle": "<question title>",
      "score": <number 0-100>,
      "timeComplexity": "<e.g. O(N)>",
      "spaceComplexity": "<e.g. O(1)>",
      "verdict": "<'Optimal' | 'Accepted' | 'Suboptimal Efficiency' | 'Logic Bug'>",
      "strengths": ["<strength 1>", "<strength 2>"],
      "improvements": ["<actionable improvement 1>", "<actionable improvement 2>"]
    }
  ]
}`;

  const rawJson = await callGemini(prompt, 2500);
  if (!rawJson) return null;

  try {
    const data = safeJsonParse(rawJson, 'object');
    if (!data) return null;
    return {
      overallScore: Math.min(100, Math.max(0, Math.round(Number(data.overallScore) || 75))),
      logicScore: Math.min(100, Math.max(0, Math.round(Number(data.logicScore) || 75))),
      efficiencyScore: Math.min(100, Math.max(0, Math.round(Number(data.efficiencyScore) || 75))),
      verdict: data.verdict || 'Hire',
      executiveSummary: data.executiveSummary || 'Technical test completed. Candidate demonstrated good foundational algorithmic thinking.',
      logicProgressionNote: data.logicProgressionNote || 'Focus on optimizing nested loops into hash-table lookups or two-pointer patterns to achieve linear time.',
      questionReviews: Array.isArray(data.questionReviews) ? data.questionReviews : [],
    };
  } catch {
    return null;
  }
}

