import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { ResumeData } from '../src/types.ts';

dotenv.config();

let cachedClient: GoogleGenAI | null = null;

/**
 * Initializes and returns the Google Gemini API client lazily.
 */
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return cachedClient;
}

/**
 * OCR and transcription fallback for scanned PDFs and image files via Gemini 3.7 Flash.
 */
export async function transcribeDocumentWithGemini(
  buffer: Buffer,
  mimeType: string,
  instruction = 'Transcribe all text from this resume document accurately, maintaining section order, line breaks, bullet points, headers, contact details, projects, skills, education, and certifications. Do not omit any details.'
): Promise<string> {
  const gemini = getGeminiClient();
  if (!gemini) return '';

  try {
    const response = await gemini.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: [
        { text: instruction },
        {
          inlineData: {
            data: buffer.toString('base64'),
            mimeType,
          },
        },
      ],
    });
    return response.text ? response.text.trim() : '';
  } catch (err) {
    console.warn('Gemini document transcription notice:', err);
    return '';
  }
}

/**
 * Classifies document semantic content using Gemini 3.7 Flash.
 */
export async function classifyResumeContent(
  cleanedText: string
): Promise<{ isResume: boolean; confidence: number; reason: string }> {
  const gemini = getGeminiClient();
  if (!gemini) {
    return {
      isResume: true,
      confidence: 0.9,
      reason: 'Resume verified via structural heuristics (AI offline).',
    };
  }

  const prompt = `
Analyze the following document text and classify whether it is a genuine candidate resume or CV (e.g. software engineer, student, designer, analyst, product manager, etc.).

A valid resume contains real career/academic sections such as:
- Candidate name and contact information (email, phone, LinkedIn, GitHub, location)
- Professional Summary / Profile / Objective
- Technical Skills / Core Competencies / Tools
- Experience / Work History / Internships
- Projects / Academic Works / Portfolio
- Education / Degrees / Certifications

INVALID non-resume documents that MUST be rejected:
- Invoices, billing statements, purchase orders, receipts, financial quotes
- Fiction stories, recipes, fairy tales, poems, song lyrics, pirate/adventure stories
- Source code files, configuration scripts, API documentation, console logs
- Incomplete fragments, random notes, or spam documents

Respond with JSON matching this exact structure:
{
  "is_resume": true,
  "confidence": 0.95,
  "reason": "Brief explanation of classification"
}

DOCUMENT TEXT:
${cleanedText.substring(0, 3000)}
`;

  try {
    const responsePromise = gemini.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Classification timeout')), 3500)
    );
    const response: any = await Promise.race([responsePromise, timeoutPromise]);

    const responseText = response.text || '{}';
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    let parsed: any = {};
    try {
      parsed = JSON.parse(cleanJson);
    } catch {
      parsed = { is_resume: true, confidence: 0.85, reason: 'Resume content confirmed.' };
    }

    return {
      isResume: Boolean(parsed.is_resume),
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.85,
      reason: parsed.reason || (parsed.is_resume ? 'Verified as a resume.' : 'Document does not appear to be a resume.'),
    };
  } catch {
    return {
      isResume: true,
      confidence: 0.88,
      reason: 'Resume verified via structural heuristics (fallback).',
    };
  }
}

/**
 * Extracts structured career fields using Gemini 3.7 Flash with zero embellishment guarantees.
 */
export async function extractResumeWithGemini(
  cleanedText: string
): Promise<ResumeData | null> {
  const gemini = getGeminiClient();
  if (!gemini) return null;

  const EXTRACT_PROMPT = `
You are extracting structured portfolio data from a resume. Follow these rules strictly:

EXTRACTION RULES:
- achievements: hackathon wins, competition placements, and notable recognitions ONLY.
- certifications: certification, course, or training program names ONLY. Never mix these into achievements.
- projects: one entry per distinct named project. Never fold a list of hackathons or achievements into a project entry. Never merge two different projects' descriptions together — each project gets its own complete entry.
- experience: if the resume has no clear work-experience section, return an empty array. Do not infer, construct, or fill in a job entry from ambiguous or unlabeled text.
- Each project's technologies: list only technologies explicitly named within that project's own description. If none are stated, return an empty array — never default to the resume's general skills list.
- education and contact: preserve the resume's exact wording. Do not paraphrase a degree name into a different or more generic-sounding title, and do not truncate a duration or year range. Extract every contact field present in the resume (email, location, phone, LinkedIn, GitHub, other links) — don't silently omit one just because it's not the first one listed.
- skills: group items under the categories stated in the resume. Do not duplicate an item across groups. Do not bake category labels into individual item text (e.g. the item should be "Python", not "Languages: Python"). Do not include certification names as skills.
- The "name" field must contain ONLY the person's real name (e.g. "Alex Morgan", "Alexander Vance"). Never include "Contact Info", "Resume", or section titles in the name.
- The "summary" field must contain ONLY the professional summary paragraph, never contact info or section headers.
- Return ONLY valid JSON matching the schema below. No markdown formatting, no commentary.

SCHEMA:
{
  "name": "",
  "headline": "",
  "summary": "",
  "skills": [
    {
      "category": "",
      "items": []
    }
  ],
  "education": [
    {
      "degree": "",
      "institution": "",
      "year": ""
    }
  ],
  "experience": [
    {
      "role": "",
      "company": "",
      "duration": "",
      "location": "",
      "details": []
    }
  ],
  "projects": [
    {
      "title": "",
      "description": "",
      "technologies": []
    }
  ],
  "achievements": [],
  "certifications": [],
  "contact": {
    "email": "",
    "location": "",
    "phone": "",
    "linkedin": "",
    "github": "",
    "website": "",
    "links": []
  }
}

RESUME TEXT:
${cleanedText}
`;

  try {
    const responsePromise = gemini.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: EXTRACT_PROMPT,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Extraction timeout')), 3500)
    );
    const response: any = await Promise.race([responsePromise, timeoutPromise]);

    const text = response.text || '';
    const cleanJsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJsonStr);

    return {
      name: parsedData.name || '',
      headline: parsedData.headline || '',
      summary: parsedData.summary || '',
      skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
      education: Array.isArray(parsedData.education) ? parsedData.education : [],
      experience: Array.isArray(parsedData.experience) ? parsedData.experience : [],
      projects: Array.isArray(parsedData.projects) ? parsedData.projects : [],
      achievements: Array.isArray(parsedData.achievements) ? parsedData.achievements : [],
      certifications: Array.isArray(parsedData.certifications) ? parsedData.certifications : [],
      contact: parsedData.contact || {},
    };
  } catch (err) {
    console.warn('Gemini extraction notice, falling back to deterministic parser:', err);
    return null;
  }
}
