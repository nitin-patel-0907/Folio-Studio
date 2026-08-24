# 3-Layer Resume Authenticity Architecture & System Specifications

PortfolioCraft enforces a strict 3-layer validation pipeline to verify document authenticity before generating a green-and-white portfolio webpage. This architecture prevents corrupted files, non-resume documents, and adversarial inputs from invoking unnecessary AI operations.

---

## 1. Pipeline Overview

```
[Uploaded File / Raw Text]
          │
          ▼
┌───────────────────────────────────────────────┐
│ Layer 1: Low-Level File & Signature Check    │
│ - Whitelist: .pdf, .docx, .txt                │
│ - Binary magic bytes verification (%PDF, ZIP) │
│ - Size limit: ≤ 5 MB                          │
│ - Extracted character length: ≥ 150 chars     │
└───────────────────────┬───────────────────────┘
                        │ PASS
                        ▼
┌───────────────────────────────────────────────┐
│ Layer 2: Heuristic Content Scoring            │
│ - Contact regex (email, phone, dates)         │
│ - Section keywords (experience, edu, skills)  │
│ - Structural bullet points & line density     │
│ - Score threshold: ≥ 45 / 100                 │
└───────────────────────┬───────────────────────┘
                        │ PASS
                        ▼
┌───────────────────────────────────────────────┐
│ Layer 3: Gemini AI Document Classification    │
│ - Model: gemini-3.7-flash                     │
│ - Semantic intent verification                │
│ - Rejects recipes, stories, invoices, junk    │
│ - Confidence threshold: ≥ 0.60                │
└───────────────────────┬───────────────────────┘
                        │ PASS
                        ▼
┌───────────────────────────────────────────────┐
│ Data Extraction & Portfolio Builder           │
│ - Structured JSON extraction schema           │
│ - Zero-embellishment constraints              │
│ - Standalone HTML webpage generation          │
└───────────────────────────────────────────────┘
```

---

## 2. Layer Specifications

### Layer 1: File Integrity & Binary Signatures
- **Purpose**: Zero-latency guard against invalid file formats, oversized payloads, or corrupt binary streams.
- **Rules**:
  - File extension must match `.pdf`, `.docx`, `.doc`, `.txt`, or `.md`.
  - PDF files must start with binary magic bytes `0x25 0x50 0x44 0x46` (`%PDF-`).
  - DOCX files must start with PK ZIP header `0x50 0x4B 0x03 0x04`.
  - File size must be between 1 byte and 5,242,880 bytes (5 MB).
  - Extracted text must contain at least 150 characters.

### Layer 2: Heuristic Content Scoring
- **Purpose**: Fast regex-based scoring verifying structural resume components without external API dependencies.
- **Scoring Breakdown**:
  - **Contact Information (25 pts)**: Valid email format (`+15 pts`), valid phone number (`+10 pts`).
  - **Core Sections (45 pts)**: Experience headings (`+15 pts`), Education headings (`+15 pts`), Skills/Technical headings (`+15 pts`).
  - **Chronological Density (15 pts)**: Detection of year patterns (e.g. `2018 - 2024`, `Present`).
  - **Structural Format (15 pts)**: Multi-line layout and bullet point markers.
- **Rejection**: Score below 45 points immediately halts execution.

### Layer 3: Gemini AI Document Classifier
- **Purpose**: High-fidelity semantic check to distinguish authentic career resumes from creative writing, invoices, academic papers, or junk text.
- **Prompt**: Strict classification returning JSON with `is_resume: boolean`, `confidence: number`, and `reason: string`.
- **Rejection**: Files returning `is_resume: false` or confidence `< 0.60` are rejected.

---

## 3. Error Handling Matrix

| Scenario | HTTP Code | User-Facing Message |
| :--- | :--- | :--- |
| Empty / Missing file | 400 | Please select or upload a resume file. |
| Corrupted or invalid file extension | 422 | Unsupported file format. Please upload a PDF, DOCX, or TXT file. |
| Text too short (< 150 characters) | 422 | This file is too short to be a complete resume. |
| Missing vital sections (experience/skills) | 422 | This document does not look like a resume — no experience, education, or skills sections were detected. |
| AI classified as non-resume (invoice/story) | 422 | This document appears to be an invoice, story, or non-resume document. |
| Transient API timeout / connection failure | 502 | Connection timed out. Please retry in a moment. |

---

## 4. Responsible AI & Anti-Hallucination Guarantees

The extraction engine operates under strict zero-embellishment instructions:
1. **Verbatim Fidelity**: The AI model is strictly prohibited from fabricating skills, credentials, past employers, or project metrics not present in the source document.
2. **Clean Omission**: Any missing sections remain empty arrays or null values and are completely omitted from the rendered HTML DOM rather than populated with placeholder text.
