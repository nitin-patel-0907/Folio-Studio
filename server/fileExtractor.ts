import path from 'path';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import AdmZip from 'adm-zip';
import { ExtractedFilePayload } from './types.ts';
import { transcribeDocumentWithGemini } from './geminiService.ts';

const PDFParseClass: any = PDFParse;

/**
 * PDF extraction using PDFParse with page artifact stripping and layout handling.
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    if (typeof PDFParseClass === 'function') {
      try {
        const parser = new PDFParseClass({ data: buffer });
        const res = await parser.getText();
        if (typeof parser.destroy === 'function') {
          await parser.destroy();
        }
        let text = res && res.text ? res.text : '';
        if (text && text.trim().length > 30) {
          text = text.replace(/--\s*\d+\s+of\s+\d+\s*--/gi, '\n');
          return text.trim();
        }
      } catch (classErr) {
        console.warn('PDFParseClass execution warning:', classErr);
      }
    }
  } catch (err) {
    console.warn('Standard PDF parsing error:', err);
  }

  // Multimodal Gemini OCR fallback if text layer is empty (e.g. scanned image PDF)
  return await transcribeDocumentWithGemini(buffer, 'application/pdf');
}

/**
 * DOCX extraction that reads paragraphs, tables (cells/rows in order), headers, footers, and floating text boxes.
 */
export async function extractDocxText(buffer: Buffer): Promise<string> {
  const parts: string[] = [];

  // Method 1: Mammoth raw text extraction (handles paragraphs and tables)
  try {
    const mammothResult = await mammoth.extractRawText({ buffer });
    if (mammothResult.value && mammothResult.value.trim()) {
      parts.push(mammothResult.value.trim());
    }
  } catch (mErr) {
    console.warn('Mammoth extraction failed:', mErr);
  }

  // Method 2: Inspect document.xml via AdmZip for tables, floating text boxes (<w:txbxContent>, <v:textbox>) and headers
  try {
    const zip = new AdmZip(buffer);
    const docEntry = zip.getEntry('word/document.xml');
    if (docEntry) {
      const xml = docEntry.getData().toString('utf8');

      // Extract floating text boxes: <w:txbxContent>...</w:txbxContent> or <v:textbox>...</v:textbox>
      const textboxMatches = xml.match(/<(w:txbxContent|v:textbox)[\s\S]*?<\/(w:txbxContent|v:textbox)>/g) || [];
      for (const txbxXml of textboxMatches) {
        const textSnippets = txbxXml.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [];
        const boxLines: string[] = [];
        for (const snip of textSnippets) {
          const cleanText = snip.replace(/<[^>]+>/g, '').trim();
          if (cleanText) boxLines.push(cleanText);
        }
        const boxContent = boxLines.join(' ').trim();
        if (boxContent && !parts.some(p => p.includes(boxContent))) {
          parts.push(boxContent);
        }
      }
    }

    // Inspect header/footer XML files for contact details frequently placed in headers
    const entries = zip.getEntries();
    for (const entry of entries) {
      if (entry.entryName.startsWith('word/header') || entry.entryName.startsWith('word/footer')) {
        const headerXml = entry.getData().toString('utf8');
        const textSnippets = headerXml.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [];
        const headerLines: string[] = [];
        for (const snip of textSnippets) {
          const clean = snip.replace(/<[^>]+>/g, '').trim();
          if (clean) headerLines.push(clean);
        }
        const headerContent = headerLines.join(' ').trim();
        if (headerContent && !parts.some(p => p.includes(headerContent))) {
          parts.unshift(headerContent);
        }
      }
    }
  } catch (zErr) {
    console.warn('DOCX ZIP inspection notice:', zErr);
  }

  if (parts.length > 0) {
    return parts.join('\n\n');
  }

  return buffer.toString('utf-8');
}

/**
 * Master file text extraction router with OCR & Multimodal fallback
 */
export async function extractRawFileText(file: ExtractedFilePayload): Promise<string> {
  if (file.text) return file.text;
  if (!file.buffer) return '';

  const ext = path.extname(file.name).toLowerCase();

  if (ext === '.pdf') {
    let extracted = await extractPdfText(file.buffer);
    if (extracted.trim().length < 80) {
      const fallbackOcr = await transcribeDocumentWithGemini(file.buffer, 'application/pdf');
      if (fallbackOcr && fallbackOcr.trim().length > 30) {
        return fallbackOcr;
      }
    }
    return extracted;
  } else if (ext === '.docx' || ext === '.doc') {
    return await extractDocxText(file.buffer);
  } else if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
    const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    return await transcribeDocumentWithGemini(file.buffer, mimeType);
  }

  return file.buffer.toString('utf-8');
}

/**
 * Clean whitespace per line, not across the whole document.
 * Strips extra spaces per line and reduces runs of blank lines to at most one,
 * preserving line and paragraph breaks.
 */
export function cleanResumeText(rawText: string): string {
  if (!rawText) return '';
  const lines = rawText.split(/\r?\n/);
  const cleanedLines = lines.map(line => line.replace(/[ \t]+/g, ' ').trim());

  const result: string[] = [];
  let blankRun = 0;
  for (const line of cleanedLines) {
    if (line === '') {
      blankRun++;
      if (blankRun <= 1) {
        result.push('');
      }
    } else {
      blankRun = 0;
      result.push(line);
    }
  }

  return result.join('\n').trim();
}
