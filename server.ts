import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { apiRouter, portfolioStore } from './server/routes.ts';
import { buildPortfolioHtml } from './src/services/portfolioBuilder.ts';
import { ResumeData } from './src/types.ts';

dotenv.config();

const app = express();
const PORT = 3000;
const outputDir = path.join(process.cwd(), 'output');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// CORS Configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// JSON and URL-encoded body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount Modular API Router
app.use('/api', apiRouter);

// Portfolio HTML Direct Preview Routes
app.get(['/output/portfolio.html', '/p', '/p/:slug', '/preview/:id'], (req, res) => {
  const { id, slug } = req.params;
  const key = id || slug;

  if (key && portfolioStore.has(key)) {
    const item = portfolioStore.get(key)!;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(item.html);
  }

  const filePath = path.join(outputDir, 'portfolio.html');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.sendFile(filePath);
  } else {
    const defaultData: ResumeData = {
      name: 'Alexander Vance',
      headline: 'Senior Software Architect',
      summary: 'Principal Systems Architect with 10+ years engineering high-scale distributed backends.',
      skills: [
        { category: 'Languages', items: ['Python', 'Go', 'TypeScript'] },
        { category: 'Infrastructure', items: ['Kubernetes', 'Docker', 'AWS'] }
      ],
      education: [{ degree: 'B.S. in Computer Science', institution: 'MIT', year: '2016' }],
      experience: [{ role: 'Principal Engineer', company: 'Stripe', duration: '2020 – Present', details: ['Scaled core ledger infrastructure'] }],
      projects: [{ title: 'Zero-Latency Cache Engine', description: 'Engineered memory cache layer', technologies: ['Go', 'Redis'] }],
      certifications: ['AWS Certified Solutions Architect – Professional'],
      achievements: ['Published 3 distributed computing papers'],
      contact: { email: 'alex@vance.io', location: 'San Francisco, CA' }
    };
    const defaultHtml = buildPortfolioHtml(defaultData);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(defaultHtml);
  }
});

// Unmatched API Route Handler to ensure JSON responses
app.all('/api/*', (req, res) => {
  res.status(404).json({
    valid: false,
    rejectionReason: `API endpoint not found: ${req.method} ${req.path}`
  });
});

// API Error Handler to guarantee JSON responses
app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    valid: false,
    rejectionReason: err.message || 'An error occurred during file processing.'
  });
});

async function startServer() {
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));

  if (process.env.NODE_ENV === 'production' || hasDist) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn('Vite middleware initialization warning, falling back to static:', e);
      if (hasDist) {
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
      }
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Folio server running on http://localhost:${PORT}`);
  });
}

startServer();
