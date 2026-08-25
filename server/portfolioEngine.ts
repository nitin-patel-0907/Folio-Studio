import { ResumeData } from '../src/types.ts';
import { extractResumeWithGemini } from './geminiService.ts';
import { fallbackExtractResume } from './deterministicParser.ts';
import { buildPortfolioHtml } from '../src/services/portfolioBuilder.ts';

/**
 * Extracts structured career fields using Gemini AI with fallback to deterministic heuristic parsing.
 */
export async function extractPortfolioData(
  cleanedText: string,
  rawExtractedText?: string
): Promise<ResumeData> {
  const aiResult = await extractResumeWithGemini(cleanedText);
  if (aiResult) {
    return aiResult;
  }
  return fallbackExtractResume(cleanedText);
}

export { buildPortfolioHtml };
