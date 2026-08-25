# AI Resume to Portfolio Generator (Folio Studio)

An intelligent, full-stack application that transforms raw candidate resumes (PDF, TXT, DOCX) into production-ready, beautifully styled, responsive personal portfolio websites in seconds.

Powered by a **3-Layer Authenticity Validation Guard**, **Google Gemini 3.7 Flash AI**, and a **Standalone HTML5 Portfolio Engine**.

---

## 📑 Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [How the System Converts Resumes to Portfolios](#how-the-system-converts-resumes-to-portfolios)
3. [3-Layer Authenticity Validation Pipeline](#3-layer-authenticity-validation-pipeline)
4. [API Specification & Service Roles](#api-specification--service-roles)
5. [Directory & File Organization (System Design)](#directory--file-organization-system-design)
6. [Local Setup & Build Instructions](#local-setup--build-instructions)
7. [Team Members & Role Contributions](#team-members--role-contributions)

---

## 🏗️ System Architecture Overview

The system is architected around high-throughput, fault-tolerant processing with clear separation of concerns between file extraction, security validation, structured AI parsing, and static HTML compilation.

```
                    ┌────────────────────────────────────────────────────────┐
                    │                    CLIENT BROWSER                      │
                    │   React 18 + Tailwind CSS + Lucide Icons + PDF.js      │
                    └───────────────────────────┬────────────────────────────┘
                                                │
                          HTTP REST API / JSON  │  (Multipart / Upload)
                                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 EXPRESS BACKEND SERVER                                 │
│                                                                                        │
│  ┌──────────────────────┐   ┌──────────────────────────┐   ┌────────────────────────┐  │
│  │   fileExtractor.ts   │──▶│   resumeValidator.ts     │──▶│    geminiService.ts    │  │
│  │  - PDFParse Streams  │   │  - Layer 1: Format/Magic │   │  - Google GenAI SDK    │  │
│  │  - Mammoth XML DOCX  │   │  - Layer 2: Regex Score  │   │  - Gemini 3.7 Flash    │  │
│  │  - Gemini Multimodal │   │  - Layer 3: AI Classifier│   │  - Strict JSON Schema  │  │
│  └──────────────────────┘   └──────────────────────────┘   └───────────┬────────────┘  │
│                                                                        │               │
│                                                                        ▼               │
│  ┌──────────────────────┐   ┌──────────────────────────┐   ┌────────────────────────┐  │
│  │     Static Output    │◀──│   portfolioEngine.ts     │◀──│ deterministicParser.ts │  │
│  │  - /output/portfolio │   │  - Scoped CSS / Vanilla  │   │  - Heuristic Sanitizer │  │
│  │  - Self-contained    │   │  - Zero External Scripts │   │  - Zero-AI Fallback    │  │
│  └──────────────────────┘   └──────────────────────────┘   └────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ How the System Converts Resumes to Portfolios

The end-to-end transformation from raw document to an interactive web portfolio follows a deterministic 5-stage pipeline:

```
[Resume File] ──▶ [1. Extraction] ──▶ [2. 3-Layer Validation] ──▶ [3. AI Structured Extraction] ──▶ [4. HTML Compilation] ──▶ [5. Live Folio Studio]
```

### Stage 1: Multi-Format Ingestion & Text Extraction
* Accepts `.pdf` and `.txt` documents via drag-and-drop or manual upload (with DOCX and image fallback support).
* **PDF Streams**: Strips PDF binary headers and layout metadata while preserving section breaks and bullet indents.
* **Scanned OCR Fallback**: If a PDF is a scanned image lacking a native text layer, the backend transparently dispatches multimodal OCR via Gemini 3.7 Flash.
* **Whitespace Normalization**: Preserves natural line breaks and paragraphs while eliminating extraneous spacing and null characters.

### Stage 2: 3-Layer Authenticity Validation Guard
Before passing text to generative models, the file undergoes three sequential security and semantic gates:
1. **Layer 1 (File & Format Integrity)**: Verifies file extensions, maximum file size (≤10MB), binary magic byte signatures (`%PDF-`), and minimum extracted text length (≥100 characters).
2. **Layer 2 (Heuristic Content Scoring)**: Evaluates chronological density, contact patterns, and standard resume section headers (Experience, Education, Skills, Projects). Instantly rejects commercial invoices, receipts, source code, and fictional stories with custom error messages.
3. **Layer 3 (AI Document Classification)**: Semantic classification via Gemini 3.7 Flash to confirm candidate CV authenticity.

### Stage 3: Zero-Embellishment Structured Extraction
* Ingests validated text into a structured JSON schema comprising:
  * `name`, `headline`, `summary`
  * `skills` (categorized: Languages, Frameworks, Cloud, Tools, etc.)
  * `experience` (role, company, duration, location, achievement bullets)
  * `projects` (title, description, explicitly used technologies)
  * `education` (degree, institution, graduation year)
  * `certifications` & `achievements` (hackathons, competitions, honors)
  * `contact` (email, phone, location, LinkedIn, GitHub, portfolio link)
* **Anti-Hallucination Safeguard**: If Gemini API encounters a network timeout, the deterministic regex engine (`deterministicParser.ts` / `clientResumeParser.ts`) steps in immediately to ensure uninterrupted generation.

### Stage 4: Standalone Self-Contained HTML5 Compilation
* The `portfolioEngine` compiles the JSON into a **single, standalone HTML5 document**.
* Injects scoped CSS variables with an emerald-and-white theme (`#087A5B` primary, `#F4F8F5` background, `#2ECC71` accent).
* Includes Google Web Fonts (`Playfair Display`, `Plus Jakarta Sans`, `JetBrains Mono`), smooth-scrolling navigation, and responsive CSS grid.
* Contains **zero external JavaScript dependencies**, making the generated `.html` file 100% portable, hostable on GitHub Pages/Netlify, or shareable via email.

### Stage 5: Live Folio Studio & Dual-Mode Editing
* Renders the portfolio directly in an isolated browser iframe.
* Allows instantaneous data editing with real-time hot-reloading.
* Provides **One-Click HTML Download**, **Open in New Tab**, and **Shareable URL** capabilities.

---

## 🛡️ 3-Layer Authenticity Validation Pipeline

| Layer | Component | Checks Performed | Failure Action |
| :--- | :--- | :--- | :--- |
| **Layer 1** | Binary & Format Integrity | File extension whitelist (`.pdf`, `.txt`), size bounds, PDF magic bytes (`%PDF-`), text length > 100 chars. | HTTP `422` with clear formatting guidance. |
| **Layer 2** | Heuristic Content Scoring | Detects core sections (Experience, Education, Skills), dates, emails, phones; scans negative patterns (invoices, stories, source code). | HTTP `422` with specific non-resume rejection cause. |
| **Layer 3** | AI Semantic Classifier | Evaluates semantic document intent using Gemini 3.7 Flash (confidence threshold ≥ 0.60). | HTTP `422` with AI classification report. |

---

## 📡 API Specification & Service Roles

The Express backend exposes RESTful endpoints powering both automated portfolio generation and custom in-browser edits:

### 1. `GET /api/health`
* **Role**: Heartbeat and dependency diagnostic monitor.
* **Response**:
  ```json
  {
    "status": "ok",
    "hasGeminiKey": true,
    "nodeEnv": "development",
    "time": "2026-08-25T05:08:26.449Z"
  }
  ```

### 2. `POST /api/upload`
* **Role**: Runs document ingestion and tests the 3-Layer Validation Guard without building HTML.
* **Payload**: `multipart/form-data` (`file`) or `application/json` (`{ "text": "...", "filename": "..." }`)
* **Success Response (200)**:
  ```json
  {
    "valid": true,
    "layers": {
      "layer1": { "layer": 1, "passed": true, "details": "File verified successfully." },
      "layer2": { "layer": 2, "passed": true, "score": 95 },
      "layer3": { "layer": 3, "passed": true, "confidence": 0.96 }
    },
    "cleanedText": "..."
  }
  ```

### 3. `POST /api/generate`
* **Role**: Extracts career data from pre-cleaned resume text and compiles the portfolio HTML.
* **Payload**:
  ```json
  {
    "cleanedText": "Candidate resume text...",
    "rawText": "Raw text...",
    "bypassValidation": false
  }
  ```

### 4. `POST /api/validate-and-generate` *(Primary All-in-One Endpoint)*
* **Role**: Complete end-to-end pipeline: ingests raw file/text, validates all 3 layers, runs AI extraction, and compiles the standalone HTML webpage.
* **Success Response (200)**:
  ```json
  {
    "valid": true,
    "id": "pf_1740460000000_abc123",
    "layers": { "layer1": {...}, "layer2": {...}, "layer3": {...} },
    "cleanedText": "...",
    "extractedData": {
      "name": "Alex Vance",
      "headline": "Senior Software Architect",
      "summary": "...",
      "skills": [...],
      "experience": [...],
      "education": [...],
      "projects": [...],
      "contact": {...}
    },
    "portfolioHtml": "<!DOCTYPE html>..."
  }
  ```

### 5. `POST /api/build-custom`
* **Role**: Receives modified `ResumeData` JSON from the Folio Studio Editor and instantly compiles an updated standalone HTML portfolio.

### 6. `GET /preview/:id` or `/p/:id`
* **Role**: Serves the standalone HTML webpage directly with `Content-Type: text/html` for live viewing or embedding.

---

## 🗂️ Directory & File Organization (System Design)

The repository follows a clean, modular structure reflecting professional system design:

```
├── docs/
│   └── ARCHITECTURE.md          # 3-Layer Authenticity & Technical Design Specifications
│
├── server/                      # Modular Backend Subsystem
│   ├── types.ts                 # Server-side interfaces & validation types
│   ├── geminiService.ts         # Google Gemini 3.7 Flash AI client, prompts & schemas
│   ├── fileExtractor.ts         # PDF, DOCX (Mammoth/AdmZip), image OCR text extractors
│   ├── resumeValidator.ts       # 3-Layer Validation Guard (Binary, Regex, AI Classifier)
│   ├── deterministicParser.ts   # Rule-based fallback parser & sanitizer engine
│   ├── portfolioEngine.ts       # Career data orchestrator & HTML compilation bridge
│   └── routes.ts                # Express REST API route handlers
│
├── src/                         # Frontend React Application
│   ├── components/              # Modular UI Components
│   │   ├── Header.tsx           # Folio navigation header, status badges & export actions
│   │   ├── UploadZone.tsx       # Drag-and-drop resume upload zone & sample loader
│   │   ├── ValidationMonitor.tsx# Real-time 3-Layer validation progress & error diagnostic modal
│   │   ├── PortfolioView.tsx    # Live portfolio iframe preview & responsive mode switcher
│   │   └── PortfolioEditor.tsx  # In-browser career data modifier with live updates
│   │
│   ├── services/                # Client-Side Domain Services
│   │   ├── portfolioBuilder.ts  # Client HTML5 template builder (CSS styles, section layouts)
│   │   └── sampleResumes.ts     # Pre-configured test resumes (SWE, ML, Student, Edge cases)
│   │
│   ├── utils/                   # Client Helper Utilities
│   │   ├── clientResumeParser.ts# Browser-based deterministic fallback parser
│   │   └── pdfExtractor.ts      # Client-side PDF.js text stream extractor
│   │
│   ├── types.ts                 # Shared TypeScript models (ResumeData, LayerResult, etc.)
│   ├── App.tsx                  # Root state controller & workflow coordinator
│   ├── main.tsx                 # React entry point
│   └── index.css                # Global styling & Tailwind CSS directives
│
├── server.ts                    # Backend entry point (Express + Vite Middleware + Production server)
├── metadata.json                # AI Studio application metadata & capabilities
├── package.json                 # Dependency definitions & build scripts
├── tsconfig.json                # TypeScript compiler configuration
└── vite.config.ts               # Vite build configuration
```

---

## 🚀 Local Setup & Build Instructions

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **Gemini API Key**: Set `GEMINI_API_KEY` in `.env` (optional; deterministic fallback will activate if absent).

### Installation & Run

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY=...
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   *The application will launch on `http://localhost:3000`.*

4. **Production Build**:
   ```bash
   npm run build
   ```
   *Compiles Vite static client bundle to `dist/` and bundles `server.ts` into a self-contained Node server `dist/server.cjs`.*

5. **Start Production Server**:
   ```bash
   npm start
   ```

---

## 👥 Team Members & Role Contributions

| # | Team Member | Primary Role | Key Engineering Contributions |
| :---: | :--- | :--- | :--- |
| **1** | **Nitin Patel** | **Project Lead & Full-Stack Architect** | • Architected the unified full-stack system layout and Express-Vite middleware integration.<br>• Designed and implemented the REST API routes (`/api/validate-and-generate`, `/api/health`, `/api/build-custom`).<br>• Established server production build pipelines with esbuild bundling and runtime safety fallbacks. |
| **2** | **Krishnam Gupta** | **AI Engine & Resume Parser Specialist** | • Formulated zero-embellishment Gemini 3.7 Flash extraction prompts and structured JSON schemas.<br>• Developed the **3-Layer Authenticity Validation Guard** (Layer 2 Heuristic Scoring + Layer 3 AI Classification).<br>• Implemented intelligent rejection filters for invoices, source code, recipes, and fiction stories. |
| **3** | **Naitik Mishra** | **Frontend Lead & UI/UX Engineer** | • Designed the modern Folio Studio interface with fluid upload states, validation monitors, and editors.<br>• Implemented real-time form editing with bi-directional synchronization and live hot-reload in the preview iframe.<br>• Crafted responsive desktop, tablet, and mobile views with accessibility-compliant touch targets. |
| **4** | **Om Jee** | **Document Processing & Extraction Engineer** | • Built multi-format document extractors supporting PDF streams, Mammoth/AdmZip DOCX parsers, and OCR.<br>• Engineered the dual-mode client/server fallback architecture (`pdfExtractor.ts`, `clientResumeParser.ts`).<br>• Designed whitespace sanitization, header/footer table parsing, and layout artifact stripping algorithms. |
| **5** | **Keshav** | **QA, Performance & Portfolio Template Designer** | • Crafted the emerald-and-white standalone HTML/CSS portfolio engine with zero external JS dependencies.<br>• Engineered Playfair Display & JetBrains Mono typographic hierarchy, micro-interactions, and card elevations.<br>• Curated standard and edge-case sample resumes; authored test suites and validation benchmarks. |
