import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker
if (typeof window !== 'undefined' && 'GlobalWorkerOptions' in pdfjsLib) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  } catch {
    // Fallback if URL resolution fails
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
    } catch {
      // Ignore
    }
  }
}

/**
 * Extracts plain text from a PDF File or ArrayBuffer in the browser.
 * Preserves line breaks and basic spatial ordering.
 */
export async function extractTextFromPdf(fileOrBuffer: File | ArrayBuffer | Uint8Array): Promise<string> {
  try {
    let arrayBuffer: ArrayBuffer;
    if (fileOrBuffer instanceof File) {
      arrayBuffer = await fileOrBuffer.arrayBuffer();
    } else if (fileOrBuffer instanceof Uint8Array) {
      arrayBuffer = fileOrBuffer.buffer.slice(fileOrBuffer.byteOffset, fileOrBuffer.byteOffset + fileOrBuffer.byteLength);
    } else {
      arrayBuffer = fileOrBuffer;
    }

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      useSystemFonts: true
    } as any);

    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const fullTextParts: string[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const items = textContent.items as Array<{
        str: string;
        transform: number[];
        width?: number;
      }>;

      if (!items || items.length === 0) continue;

      // Filter out empty items
      const validItems = items.filter(it => it.str && it.str.trim().length > 0);
      if (validItems.length === 0) continue;

      // Group items by vertical position (Y)
      validItems.sort((a, b) => {
        const yDiff = b.transform[5] - a.transform[5];
        if (Math.abs(yDiff) > 4) return yDiff;
        return a.transform[4] - b.transform[4];
      });

      const lines: string[] = [];
      let currentLineY = -1;
      let currentLineParts: string[] = [];

      for (const item of validItems) {
        const y = item.transform[5];
        if (currentLineY === -1 || Math.abs(y - currentLineY) <= 4) {
          currentLineParts.push(item.str);
          if (currentLineY === -1) currentLineY = y;
        } else {
          if (currentLineParts.length > 0) {
            lines.push(currentLineParts.join(' ').trim());
          }
          currentLineParts = [item.str];
          currentLineY = y;
        }
      }
      if (currentLineParts.length > 0) {
        lines.push(currentLineParts.join(' ').trim());
      }

      fullTextParts.push(lines.join('\n'));
    }

    return fullTextParts.join('\n\n');
  } catch (err) {
    console.warn('Browser PDF extraction warning:', err);
    return '';
  }
}
