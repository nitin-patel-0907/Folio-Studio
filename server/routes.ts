import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { ResumeData } from '../src/types.ts';
import { StoredPortfolio } from './types.ts';
import { runLayer1Validation, runLayer2Validation, runLayer3Validation } from './resumeValidator.ts';
import { extractPortfolioData, buildPortfolioHtml } from './portfolioEngine.ts';

export const apiRouter = Router();

const outputDir = path.join(process.cwd(), 'output');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// In-memory cache for generated portfolios
export const portfolioStore = new Map<string, StoredPortfolio>();

const storage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

/**
 * GET /api/health
 * System health and Gemini service status
 */
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    nodeEnv: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
  });
});

/**
 * POST /api/upload
 * 3-Layer Validation Guard endpoint
 */
apiRouter.post('/upload', uploadMiddleware.single('file'), async (req: Request, res: Response) => {
  try {
    let filename = 'pasted_resume.txt';
    let size = 0;
    let buffer: Buffer | undefined;
    let text = '';

    if (req.file) {
      filename = req.file.originalname;
      size = req.file.size;
      buffer = req.file.buffer;
    } else if (req.body.text) {
      text = req.body.text;
      filename = req.body.filename || 'input_resume.txt';
      size = Buffer.byteLength(text, 'utf8');
      buffer = Buffer.from(text, 'utf8');
    } else {
      return res.status(400).json({
        valid: false,
        rejectionReason: 'Please upload a resume file or paste resume text.',
      });
    }

    // Layer 1: File integrity & format
    const layer1 = await runLayer1Validation({ name: filename, size, buffer, text });
    if (!layer1.passed) {
      return res.status(422).json({
        valid: false,
        failedLayer: 1,
        rejectionReason: layer1.result.details,
        layers: {
          layer1: layer1.result,
          layer2: { layer: 2, name: 'Heuristic Content Scoring', passed: false, details: 'Skipped' },
          layer3: { layer: 3, name: 'AI Document Classification', passed: false, details: 'Skipped' },
        },
      });
    }

    // Layer 2: Heuristic structural density & non-resume rejection
    const layer2 = runLayer2Validation(layer1.cleanedText);
    if (!layer2.passed) {
      return res.status(422).json({
        valid: false,
        failedLayer: 2,
        rejectionReason: layer2.result.details,
        layers: {
          layer1: layer1.result,
          layer2: layer2.result,
          layer3: { layer: 3, name: 'AI Document Classification', passed: false, details: 'Skipped' },
        },
        cleanedText: layer1.cleanedText,
      });
    }

    // Layer 3: Gemini AI semantic classification
    const layer3 = await runLayer3Validation(layer1.cleanedText);
    if (!layer3.passed) {
      return res.status(422).json({
        valid: false,
        failedLayer: 3,
        rejectionReason: layer3.result.details,
        layers: {
          layer1: layer1.result,
          layer2: layer2.result,
          layer3: layer3.result,
        },
        cleanedText: layer1.cleanedText,
      });
    }

    res.json({
      valid: true,
      layers: {
        layer1: layer1.result,
        layer2: layer2.result,
        layer3: layer3.result,
      },
      cleanedText: layer1.cleanedText,
    });
  } catch (err: any) {
    console.error('Error in /api/upload:', err);
    res.status(500).json({
      valid: false,
      rejectionReason: `Internal validation processing error: ${err.message || 'Unknown error'}`,
    });
  }
});

/**
 * POST /api/generate
 * Generates portfolio from pre-cleaned resume text
 */
apiRouter.post('/generate', async (req: Request, res: Response) => {
  try {
    const { cleanedText, rawText, bypassValidation } = req.body;

    if (!cleanedText || cleanedText.trim().length < 150) {
      return res.status(400).json({
        error: 'Resume text is required and must be at least 150 characters.',
      });
    }

    if (!bypassValidation) {
      const l2 = runLayer2Validation(cleanedText);
      if (!l2.passed) {
        return res.status(422).json({ error: l2.result.details });
      }
    }

    const extractedData = await extractPortfolioData(cleanedText, rawText);
    const portfolioHtml = buildPortfolioHtml(extractedData);

    const id = `pf_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    portfolioStore.set(id, {
      data: extractedData,
      html: portfolioHtml,
      createdAt: new Date(),
    });

    fs.writeFileSync(path.join(outputDir, 'portfolio.html'), portfolioHtml, 'utf8');

    res.json({
      id,
      valid: true,
      extractedData,
      portfolioHtml,
    });
  } catch (err: any) {
    console.error('Error in /api/generate:', err);
    res.status(502).json({
      error: `Generation failed, please try again: ${err.message || 'Service Error'}`,
    });
  }
});

/**
 * POST /api/validate-and-generate
 * Unified all-in-one pipeline: Ingestion -> 3-Layer Check -> Extraction -> Portfolio Building
 */
apiRouter.post('/validate-and-generate', uploadMiddleware.single('file'), async (req: Request, res: Response) => {
  try {
    let filename = 'pasted_resume.txt';
    let size = 0;
    let buffer: Buffer | undefined;
    let text = '';

    if (req.file) {
      filename = req.file.originalname;
      size = req.file.size;
      buffer = req.file.buffer;
    } else if (req.body.text) {
      text = req.body.text;
      filename = req.body.filename || 'input_resume.txt';
      size = Buffer.byteLength(text, 'utf8');
      buffer = Buffer.from(text, 'utf8');
    } else {
      return res.status(400).json({
        valid: false,
        rejectionReason: 'Please upload a resume file or paste resume text.',
      });
    }

    // Layer 1
    const layer1 = await runLayer1Validation({ name: filename, size, buffer, text });
    if (!layer1.passed) {
      return res.status(422).json({
        valid: false,
        failedLayer: 1,
        rejectionReason: layer1.result.details,
        layers: {
          layer1: layer1.result,
          layer2: { layer: 2, name: 'Heuristic Content Scoring', passed: false, details: 'Skipped' },
          layer3: { layer: 3, name: 'AI Document Classification', passed: false, details: 'Skipped' },
        },
      });
    }

    // Layer 2
    const layer2 = runLayer2Validation(layer1.cleanedText);
    if (!layer2.passed) {
      return res.status(422).json({
        valid: false,
        failedLayer: 2,
        rejectionReason: layer2.result.details,
        layers: {
          layer1: layer1.result,
          layer2: layer2.result,
          layer3: { layer: 3, name: 'AI Document Classification', passed: false, details: 'Skipped' },
        },
        cleanedText: layer1.cleanedText,
      });
    }

    // Layer 3
    const layer3 = await runLayer3Validation(layer1.cleanedText);
    if (!layer3.passed) {
      return res.status(422).json({
        valid: false,
        failedLayer: 3,
        rejectionReason: layer3.result.details,
        layers: {
          layer1: layer1.result,
          layer2: layer2.result,
          layer3: layer3.result,
        },
        cleanedText: layer1.cleanedText,
      });
    }

    // Extract Structured Data
    const extractedData = await extractPortfolioData(layer1.cleanedText, layer1.rawText);

    // Build Portfolio HTML
    const portfolioHtml = buildPortfolioHtml(extractedData);

    const id = `pf_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    portfolioStore.set(id, {
      data: extractedData,
      html: portfolioHtml,
      createdAt: new Date(),
    });

    fs.writeFileSync(path.join(outputDir, 'portfolio.html'), portfolioHtml, 'utf8');

    res.json({
      valid: true,
      id,
      layers: {
        layer1: layer1.result,
        layer2: layer2.result,
        layer3: layer3.result,
      },
      cleanedText: layer1.cleanedText,
      extractedData,
      portfolioHtml,
    });
  } catch (err: any) {
    console.error('Unified pipeline error:', err);
    res.status(500).json({
      valid: false,
      rejectionReason: `Pipeline failure: ${err.message || 'Internal server error'}`,
    });
  }
});

/**
 * POST /api/build-custom
 * Generates and stores custom portfolio HTML from direct JSON modifications
 */
apiRouter.post('/build-custom', (req: Request, res: Response) => {
  try {
    const data: ResumeData = req.body;
    if (!data || !data.name) {
      return res.status(400).json({ error: 'Valid resume data object is required.' });
    }

    const portfolioHtml = buildPortfolioHtml(data);
    const id = `pf_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    portfolioStore.set(id, {
      data,
      html: portfolioHtml,
      createdAt: new Date(),
    });

    fs.writeFileSync(path.join(outputDir, 'portfolio.html'), portfolioHtml, 'utf8');

    res.json({
      id,
      success: true,
      portfolioHtml,
    });
  } catch (err: any) {
    console.error('Error in /api/build-custom:', err);
    res.status(500).json({ error: 'Failed to generate custom portfolio' });
  }
});
