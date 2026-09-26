import { GoogleGenerativeAI } from '@google/generative-ai';

function getModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set');
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

export type ClassifyResult = {
  category: string;
  severity: string;
  department: string;
  title: string;
  summary: string;
};

export async function classifyReport(text: string, city = 'Chennai'): Promise<ClassifyResult> {
  const model = getModel();
  const prompt = `You are a civic issue classifier for Tamil Nadu, India.
Classify the following citizen report and return JSON only.

Report: "${text}"
City: ${city}

Return this exact JSON (no markdown):
{
  "category": "<road|drain|garbage|light|water|tree|footpath>",
  "severity": "<critical|high|medium|low>",
  "department": "<department name>",
  "title": "<one short line issue title, under 10 words>",
  "summary": "<2 sentence factual summary in English>"
}

Departments: Roads & Bridges, Storm Water Drains, Solid Waste Mgmt, Electrical, Water & Sewerage, Parks & Trees.
Severity: critical=immediate safety risk, high=affects many/daily life, medium=inconvenience, low=minor.`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();
  const json = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/, '');
  return JSON.parse(json);
}

export type SimilarMatch = {
  id: string;
  score: number;
  reason: string;
};

export async function findSimilarIssues(
  reportText: string,
  candidates: Array<{ id: string; title: string; area: string; stage: string }>,
): Promise<SimilarMatch[]> {
  if (candidates.length === 0) return [];
  const model = getModel();

  const candidateList = candidates
    .map((c, i) => `${i + 1}. [${c.id}] ${c.title} — ${c.area} (${c.stage})`)
    .join('\n');

  const prompt = `You are matching a new civic report to existing issues in Tamil Nadu.

New report: "${reportText}"

Existing issues:
${candidateList}

Return JSON array of matches with similarity score 0-100. Only include issues scoring 70+. Return [] if none.
[{"id":"CP-XXXX","score":95,"reason":"same manhole, same street"}]
Return raw JSON only, no markdown.`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();
  const json = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/, '');
  return JSON.parse(json);
}

export type TranslateResult = {
  english: string;
  detectedLang: string;
  structured: { what: string; where: string; severity: string };
};

export async function translateAndExtract(text: string): Promise<TranslateResult> {
  const model = getModel();
  const prompt = `You are a multilingual civic assistant for Tamil Nadu.
The following text may be in Tamil, Tanglish (Tamil written in English letters), or English.

Text: "${text}"

Return JSON only:
{
  "english": "<English translation>",
  "detectedLang": "<Tamil|Tanglish|English>",
  "structured": {
    "what": "<what is the problem>",
    "where": "<location if mentioned>",
    "severity": "<how urgent it sounds>"
  }
}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();
  const json = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/, '');
  return JSON.parse(json);
}

export type GovSummaryResult = {
  caseSummary: string;
  keyFacts: string[];
  recommendedAction: string;
};

export async function summarizeForGov(
  issue: { title: string; area: string; city: string; dept: string; sev: string; summary: string },
  eventCount: number,
  reportCount: number,
): Promise<GovSummaryResult> {
  const model = getModel();
  const prompt = `You are summarizing a civic issue for a government officer in Tamil Nadu.

Issue: ${issue.title}
Location: ${issue.area}, ${issue.city}
Department: ${issue.dept}
Severity: ${issue.sev}
Citizen report: ${issue.summary}
Community reports: ${reportCount} merged reports
Timeline events: ${eventCount} recorded

Return JSON only:
{
  "caseSummary": "<2-3 sentence briefing for the officer>",
  "keyFacts": ["<fact 1>", "<fact 2>", "<fact 3>"],
  "recommendedAction": "<one specific recommended first action>"
}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();
  const json = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/, '');
  return JSON.parse(json);
}
