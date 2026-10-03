export type ParsedResume = {
  fullName: string;
  email: string;
  skills: string[];
  education: string[];
  experience: string[];
  summary: string;
};

export function parseResume(rawText: string): ParsedResume {
  const fullName = rawText.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/)?.[0] || 'Candidate';
  const email = rawText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || 'candidate@example.com';
  const skills = Array.from(new Set(
    rawText.match(/(JavaScript|TypeScript|React|Node\.js|NodeJS|PostgreSQL|SQL|Python|Docker|Redis|Agile|REST|Express|API|ReactJS|GraphQL|Testing|CI\/CD|AWS|Azure)/gi) || []
  )).filter(Boolean);

  const education = rawText
    .split(/\n|\r\n/)
    .filter((line) => /school|university|college|degree|bachelor|master|education/i.test(line))
    .slice(0, 3);

  const experience = rawText
    .split(/\n|\r\n/)
    .filter((line) => /experience|worked|engineer|developer|manager|intern|team|lead/i.test(line))
    .slice(0, 5);

  return {
    fullName,
    email,
    skills,
    education,
    experience,
    summary: rawText.slice(0, 240) || 'Professional candidate profile'
  };
}
