import path from 'path';
import { LayerResult } from '../src/types.ts';
import { ExtractedFilePayload, Layer1Result, Layer2Result, Layer3Result } from './types.ts';
import { extractRawFileText, cleanResumeText } from './fileExtractor.ts';
import { classifyResumeContent } from './geminiService.ts';

/**
 * LAYER 1: File-level & Binary Signature Checks (Zero API latency)
 * Accepts ONLY .pdf and .txt files within size boundaries.
 */
export async function runLayer1Validation(file: ExtractedFilePayload): Promise<Layer1Result> {
  const ext = path.extname(file.name).toLowerCase();
  const allowedExtensions = ['.pdf', '.txt'];

  // Check 1: Extension whitelist
  if (!allowedExtensions.includes(ext)) {
    return {
      passed: false,
      result: {
        layer: 1,
        name: 'File Integrity & Format Check',
        passed: false,
        details: `Invalid file format "${ext || 'unknown'}". Only PDF (.pdf) and Text (.txt) files are supported.`,
        error: 'Unsupported file format. Please upload a .pdf or .txt file.',
        metrics: { filename: file.name, extension: ext, sizeBytes: file.size },
      },
      rawText: '',
      cleanedText: '',
    };
  }

  // Check 2: Size limits
  if (file.size <= 0) {
    return {
      passed: false,
      result: {
        layer: 1,
        name: 'File Integrity & Format Check',
        passed: false,
        details: 'The uploaded file is empty (0 bytes). Please upload a valid resume.',
        error: 'Empty file',
        metrics: { sizeBytes: 0 },
      },
      rawText: '',
      cleanedText: '',
    };
  }

  if (file.size > 10 * 1024 * 1024) {
    return {
      passed: false,
      result: {
        layer: 1,
        name: 'File Integrity & Format Check',
        passed: false,
        details: `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum limit of 10MB.`,
        error: 'File size exceeds limit',
        metrics: { sizeBytes: file.size },
      },
      rawText: '',
      cleanedText: '',
    };
  }

  // Check 3: PDF Binary Magic Bytes Signature
  if (file.buffer && file.buffer.length > 4 && ext === '.pdf') {
    const header = file.buffer.subarray(0, 5).toString('ascii');
    if (!header.startsWith('%PDF-')) {
      return {
        passed: false,
        result: {
          layer: 1,
          name: 'File Integrity & Format Check',
          passed: false,
          details: 'Corrupted or invalid PDF file. Header does not match "%PDF-".',
          error: 'Invalid PDF file signature',
          metrics: { header },
        },
        rawText: '',
        cleanedText: '',
      };
    }
  }

  // Extract raw text
  const rawText = await extractRawFileText(file);
  const cleaned = cleanResumeText(rawText);

  // Check 4: Text length threshold
  if (cleaned.length < 100) {
    return {
      passed: false,
      result: {
        layer: 1,
        name: 'File Integrity & Format Check',
        passed: false,
        details:
          'Extracted text is too brief to form a complete resume (< 100 characters). Please upload a complete resume document.',
        error: 'Extracted content too brief',
        metrics: { characterCount: cleaned.length, minRequired: 100 },
      },
      rawText,
      cleanedText: cleaned,
    };
  }

  return {
    passed: true,
    result: {
      layer: 1,
      name: 'File Integrity & Format Check',
      passed: true,
      details: 'File verified successfully (PDF/TXT format verified).',
      metrics: {
        filename: file.name,
        sizeBytes: file.size,
        characterCount: cleaned.length,
        extension: ext,
      },
    },
    rawText,
    cleanedText: cleaned,
  };
}

/**
 * LAYER 2: Heuristic Content Scoring (Zero API latency)
 * Verifies resume section density and rejects invoices, stories, recipes, and source code.
 */
export function runLayer2Validation(cleanedText: string): Layer2Result {
  const lower = cleanedText.toLowerCase();

  // Negative Indicators Check
  const isInvoice =
    /invoice\s*#|billed\s*to|total\s*due|subtotal|sales\s*tax|payment\s*terms|remit\s*payment|items\s*ordered|customer\s*id|due\s*date|amount\s*due|purchase\s*order|sku:/i.test(
      cleanedText
    );
  const isFiction =
    /once\s*upon\s*a\s*time|chapter\s*\d+|pirate\s*cove|kraken|swashbuckler|treasure\s*chest|gold\s*doubloons|ingredients:|recipe\s*yield|prep\s*time:/i.test(
      cleanedText
    );
  const isCode =
    /^import\s+|^const\s+|^function\s+|<!DOCTYPE\s+html>|public\s+static\s+void\s+main|npm\s+err!|exception\s+in\s+thread/i.test(
      cleanedText
    );

  if (isInvoice) {
    return {
      passed: false,
      result: {
        layer: 2,
        name: 'Heuristic Content Scoring',
        passed: false,
        score: 10,
        details: 'The uploaded document appears to be a commercial invoice or billing receipt, not a candidate resume.',
        error: 'Document classified as non-resume (invoice/receipt)',
        metrics: { isInvoice: true },
      },
    };
  }

  if (isFiction) {
    return {
      passed: false,
      result: {
        layer: 2,
        name: 'Heuristic Content Scoring',
        passed: false,
        score: 15,
        details: 'The uploaded document appears to be a fictional story or creative writing, not a professional resume.',
        error: 'Document classified as non-resume (fiction/story)',
        metrics: { isFiction: true },
      },
    };
  }

  if (isCode) {
    return {
      passed: false,
      result: {
        layer: 2,
        name: 'Heuristic Content Scoring',
        passed: false,
        score: 10,
        details: 'The uploaded document appears to be source code or a system log, not a resume.',
        error: 'Document classified as non-resume (source code/log)',
        metrics: { isCode: true },
      },
    };
  }

  // Positive pattern checks
  const emailMatch = cleanedText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  const phoneMatch = cleanedText.match(/(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{4,5}/);
  const dateMatch = cleanedText.match(/\b(19\d{2}|20\d{2})\b/);
  const linkedinMatch = cleanedText.match(/linkedin\.com\/in\/[A-Za-z0-9_-]+/i);
  const githubMatch = cleanedText.match(/github\.com\/[A-Za-z0-9_-]+/i);

  // Resume section checks
  const hasExperienceSection =
    /^(experience|work experience|employment history|work history|professional experience|internships)[:\s]*$/im.test(
      cleanedText
    ) || /\b(work\s+experience|professional\s+experience|employment\s+history)\b/i.test(lower);

  const hasEducationSection =
    /^(education|academic background|degrees|academic history)[:\s]*$/im.test(cleanedText) ||
    /\b(bachelor|master|b\.tech|b\.s|m\.s|phd|diploma|university|college|gpa)\b/i.test(lower);

  const hasSkillsSection =
    /^(skills|technical skills|technologies|core competencies|proficiencies|areas of expertise)[:\s]*$/im.test(
      cleanedText
    ) || /\b(technical\s+skills|programming\s+languages|core\s+competencies|technologies)\b/i.test(lower);

  const hasProjectsSection =
    /^(projects|selected projects|featured projects|key projects|academic projects|portfolio projects)[:\s]*$/im.test(
      cleanedText
    ) || /\b(selected\s+projects|featured\s+projects|key\s+projects)\b/i.test(lower);

  const hasSummarySection =
    /^(summary|professional summary|profile|about me|objective|biography)[:\s]*$/im.test(cleanedText) ||
    /\b(professional\s+summary|career\s+objective)\b/i.test(lower);

  let sectionCount = 0;
  if (hasExperienceSection) sectionCount++;
  if (hasEducationSection) sectionCount++;
  if (hasSkillsSection) sectionCount++;
  if (hasProjectsSection) sectionCount++;
  if (hasSummarySection) sectionCount++;

  let score = 0;
  if (emailMatch) score += 20;
  if (phoneMatch) score += 15;
  if (linkedinMatch || githubMatch) score += 15;
  if (dateMatch) score += 15;
  score += sectionCount * 15;

  const hasMinSections = sectionCount >= 2;
  const hasContactOrDates = Boolean(emailMatch || phoneMatch || linkedinMatch || githubMatch || dateMatch);

  if (!hasMinSections || (!hasContactOrDates && sectionCount < 3) || score < 45) {
    return {
      passed: false,
      result: {
        layer: 2,
        name: 'Heuristic Content Scoring',
        passed: false,
        score,
        details:
          'The document does not appear to be a resume. A valid resume must contain standard career sections such as Work Experience or Projects, Education, and Skills.',
        error: 'Insufficient resume structure and sections',
        metrics: {
          score,
          sectionMatches: sectionCount,
          hasExperience: hasExperienceSection,
          hasEducation: hasEducationSection,
          hasSkills: hasSkillsSection,
          hasProjects: hasProjectsSection,
          hasEmail: Boolean(emailMatch),
          hasPhone: Boolean(phoneMatch),
          hasDate: Boolean(dateMatch),
        },
      },
    };
  }

  return {
    passed: true,
    result: {
      layer: 2,
      name: 'Heuristic Content Scoring',
      passed: true,
      score,
      details: 'Resume structure and career section markers confirmed.',
      metrics: { score, sectionMatches: sectionCount },
    },
  };
}

/**
 * LAYER 3: Gemini AI Semantic Document Classifier
 */
export async function runLayer3Validation(cleanedText: string): Promise<Layer3Result> {
  const classification = await classifyResumeContent(cleanedText);

  if (!classification.isResume || classification.confidence < 0.6) {
    return {
      passed: false,
      result: {
        layer: 3,
        name: 'AI Document Classification',
        passed: false,
        confidence: classification.confidence,
        details:
          classification.reason || 'Document classification failed. The content does not appear to be a resume.',
        error: classification.reason,
        metrics: { isResume: classification.isResume, confidence: classification.confidence },
      },
    };
  }

  return {
    passed: true,
    result: {
      layer: 3,
      name: 'AI Document Classification',
      passed: true,
      confidence: classification.confidence,
      details: 'Resume verified.',
      metrics: { isResume: classification.isResume, confidence: classification.confidence },
    },
  };
}
