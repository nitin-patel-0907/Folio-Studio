import { ResumeData, SkillCategory } from '../types.ts';

/**
 * Escapes unsafe characters for clean HTML injection.
 */
function escapeHtml(str: string | undefined | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Normalizes skills data into SkillCategory[] format.
 */
function normalizeSkills(skills: (SkillCategory | string)[] | undefined): SkillCategory[] {
  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    return [];
  }

  const result: SkillCategory[] = [];
  const uncategorizedItems: string[] = [];

  for (const item of skills) {
    if (typeof item === 'string') {
      const clean = item.trim();
      if (clean) {
        // Check if string is in format "Category: Item 1, Item 2"
        const colonMatch = clean.match(/^([^:]+):\s*(.+)$/);
        if (colonMatch && colonMatch[2].length > 1) {
          const category = colonMatch[1].trim();
          const items = colonMatch[2]
            .split(/[,•|·/]/)
            .map(s => s.trim())
            .filter(Boolean);
          if (items.length > 0) {
            result.push({ category, items });
            continue;
          }
        }
        uncategorizedItems.push(clean);
      }
    } else if (item && typeof item === 'object') {
      const category = (item.category || 'General').trim();
      const rawItems = Array.isArray(item.items) ? item.items : [];
      const cleanItems = rawItems
        .map(i => (typeof i === 'string' ? i.trim() : ''))
        .filter(Boolean)
        .map(i => {
          // Remove redundant category prefix from item if present (e.g. "Languages: Python" -> "Python")
          return i.replace(new RegExp(`^${category}\\s*[:\\-]\\s*`, 'i'), '').trim();
        })
        .filter(Boolean);

      // Deduplicate items within group
      const uniqueItems = Array.from(new Set(cleanItems));
      if (uniqueItems.length > 0) {
        result.push({
          category,
          items: uniqueItems
        });
      }
    }
  }

  if (uncategorizedItems.length > 0) {
    const unique = Array.from(new Set(uncategorizedItems));
    result.push({
      category: 'Core Competencies',
      items: unique
    });
  }

  return result;
}

/**
 * Builds a standalone, zero-dependency, self-contained HTML portfolio webpage
 * following the "Professional Polish" Green & White modern developer theme.
 * Completely omits empty sections from the DOM.
 */
export function buildPortfolioHtml(data: ResumeData): string {
  const name = escapeHtml(data.name || 'Professional Portfolio');
  const headline = escapeHtml(data.headline || '');
  const summary = escapeHtml(data.summary || '');

  // Normalized categorized skills
  const skillCategories = normalizeSkills(data.skills);

  // Check section content availability (to completely omit empty sections)
  const hasSummary = Boolean(data.summary && data.summary.trim().length > 0);
  const hasSkills = skillCategories.length > 0;
  const hasExperience = Boolean(data.experience && Array.isArray(data.experience) && data.experience.length > 0);
  const hasProjects = Boolean(data.projects && Array.isArray(data.projects) && data.projects.length > 0);
  const hasEducation = Boolean(data.education && Array.isArray(data.education) && data.education.length > 0);
  const hasCertifications = Boolean(data.certifications && Array.isArray(data.certifications) && data.certifications.length > 0);
  const hasAchievements = Boolean(data.achievements && Array.isArray(data.achievements) && data.achievements.length > 0);
  const hasContact = Boolean(
    data.contact && (
      data.contact.email ||
      data.contact.location ||
      data.contact.phone ||
      data.contact.linkedin ||
      data.contact.github ||
      data.contact.website ||
      (data.contact.links && data.contact.links.length > 0)
    )
  );

  // Compute monogram initials
  const initials = (data.name || 'P')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('') || 'P';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — Portfolio</title>
  <meta name="description" content="${headline ? `${name} - ${headline}` : `${name}'s professional portfolio`}">
  
  <!-- Premium Typography: Playfair Display + Plus Jakarta Sans + JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

  <style>
    /* CSS RESET & DESIGN TOKENS */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :root {
      --primary: #087A5B;
      --primary-hover: #065842;
      --primary-light: #EBF5F1;
      --accent: #2ECC71;
      --accent-muted: #16A36B;
      --bg: #F8FAF9;
      --surface: #FFFFFF;
      --surface-subtle: #F3F7F5;
      --dark: #111111;
      --body: #4B5563;
      --muted: #8A9691;
      --border: #E5ECE8;
      --border-focus: #087A5B;
      --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.03);
      --shadow-md: 0 4px 16px -2px rgba(8, 122, 91, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.02);
      --shadow-lg: 0 12px 32px -4px rgba(8, 122, 91, 0.09), 0 4px 12px -2px rgba(0, 0, 0, 0.03);
      --radius-sm: 8px;
      --radius-md: 14px;
      --radius-lg: 20px;
      --font-serif: 'Playfair Display', Georgia, serif;
      --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    html {
      scroll-behavior: smooth;
      scroll-padding-top: 84px;
      background-color: var(--bg);
      color: var(--dark);
      font-family: var(--font-sans);
      line-height: 1.6;
      text-rendering: optimizeLegibility;
    }

    body {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--bg);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      position: relative;
    }

    /* ACCESSIBILITY: Visible focus outlines */
    a:focus-visible,
    button:focus-visible,
    input:focus-visible,
    [tabindex="0"]:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 3px;
      border-radius: 4px;
    }

    /* TOP NAVIGATION - FIXED & STICKY TO TOP */
    .site-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-bottom: 1px solid var(--border);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
      pointer-events: auto;
    }

    .nav-container {
      max-width: 1140px;
      margin: 0 auto;
      padding: 0.85rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      position: relative;
      z-index: 101;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: var(--dark);
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.2s ease;
    }

    .brand:hover {
      opacity: 0.9;
    }

    .brand-initials {
      width: 34px;
      height: 34px;
      border-radius: var(--radius-sm);
      background: var(--primary);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-mono);
      font-size: 0.825rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      box-shadow: 0 2px 6px rgba(8, 122, 91, 0.25);
    }

    .brand-name {
      font-family: var(--font-serif);
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--dark);
      letter-spacing: -0.01em;
    }

    .nav-menu {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      list-style: none;
    }

    .nav-link {
      text-decoration: none;
      color: var(--body);
      font-size: 0.875rem;
      font-weight: 600;
      transition: color 0.18s ease;
      position: relative;
      cursor: pointer;
      padding: 0.35rem 0;
    }

    .nav-link:hover,
    .nav-link.active {
      color: var(--primary);
    }

    .nav-link.active::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 2px;
      background: var(--primary);
      border-radius: 2px;
    }

    .nav-cta {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 1rem;
      border-radius: 9999px;
      background: var(--primary-light);
      color: var(--primary);
      border: 1px solid rgba(8, 122, 91, 0.2);
      font-size: 0.8125rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.18s ease;
      cursor: pointer;
      white-space: nowrap;
    }

    .nav-cta:hover {
      background: var(--primary);
      color: #ffffff;
      border-color: var(--primary);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(8, 122, 91, 0.25);
    }

    /* MOBILE HAMBURGER BUTTON */
    .mobile-menu-btn {
      display: none;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      width: 38px;
      height: 38px;
      color: var(--dark);
      cursor: pointer;
      font-size: 1.15rem;
      align-items: center;
      justify-content: center;
      transition: background 0.18s ease, border-color 0.18s ease;
    }

    .mobile-menu-btn:hover {
      background: var(--surface-subtle);
      border-color: var(--border-focus);
    }

    /* MOBILE DRAWER NAVIGATION */
    .mobile-nav-drawer {
      display: none;
      position: fixed;
      top: 60px;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      padding: 1.25rem 1.5rem;
      z-index: 999;
      box-shadow: var(--shadow-lg);
      flex-direction: column;
      gap: 0.5rem;
    }

    .mobile-nav-drawer.is-open {
      display: flex;
    }

    .mobile-nav-link {
      text-decoration: none;
      color: var(--dark);
      font-size: 0.95rem;
      font-weight: 600;
      padding: 0.75rem 0.25rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: color 0.15s ease;
    }

    .mobile-nav-link:hover,
    .mobile-nav-link.active {
      color: var(--primary);
    }

    /* MAIN CONTAINER */
    .page-container {
      max-width: 1140px;
      width: 100%;
      margin: 0 auto;
      padding: 5.75rem 1.5rem 5.5rem 1.5rem;
      flex: 1;
    }

    section[id],
    .reveal-section[id] {
      scroll-margin-top: 84px;
    }

    /* SCROLL REVEAL ANIMATIONS */
    .reveal-section {
      opacity: 0;
      transform: translateY(16px);
      transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .reveal-section.is-visible {
      opacity: 1;
      transform: translateY(0);
    }

    /* Respect prefers-reduced-motion */
    @media (prefers-reduced-motion: reduce) {
      *, ::before, ::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
      .reveal-section {
        opacity: 1 !important;
        transform: none !important;
      }
    }

    /* HERO SECTION */
    .hero-section {
      margin-bottom: 4rem;
      padding-bottom: 2.75rem;
      border-bottom: 1px solid var(--border);
    }

    .hero-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.32rem 0.85rem;
      border-radius: 9999px;
      background: var(--primary-light);
      border: 1px solid rgba(8, 122, 91, 0.2);
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 1.25rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      line-height: 1;
    }

    .hero-status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--accent);
      box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.25);
    }

    .hero-name {
      font-family: var(--font-serif);
      font-size: clamp(2.5rem, 5vw, 3.85rem);
      font-weight: 700;
      line-height: 1.15;
      color: var(--primary);
      letter-spacing: -0.025em;
      margin-bottom: 0.75rem;
    }

    .hero-headline {
      font-size: clamp(1.05rem, 2vw, 1.25rem);
      font-weight: 600;
      color: #2D3748;
      letter-spacing: 0.02em;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .emerald-divider {
      width: 56px;
      height: 3px;
      background: var(--accent);
      border-radius: 2px;
      margin-bottom: 1.5rem;
    }

    .hero-summary {
      font-size: 1.05rem;
      color: var(--body);
      line-height: 1.75;
      max-width: 760px;
      margin-bottom: 2rem;
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.85rem;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: var(--primary);
      color: #ffffff;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 0.875rem;
      text-decoration: none;
      transition: all 0.18s ease;
      box-shadow: 0 2px 6px rgba(8, 122, 91, 0.2);
    }

    .btn-primary:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(8, 122, 91, 0.28);
    }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: var(--surface);
      color: var(--dark);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 0.875rem;
      text-decoration: none;
      transition: all 0.18s ease;
      box-shadow: var(--shadow-sm);
    }

    .btn-secondary:hover {
      background: var(--surface-subtle);
      border-color: var(--border-focus);
      color: var(--primary);
      transform: translateY(-1px);
    }

    /* TWO-COLUMN GRID LAYOUT */
    .layout-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 3.5rem;
      align-items: start;
    }

    @media (min-width: 960px) {
      .layout-grid {
        grid-template-columns: minmax(0, 1.75fr) minmax(0, 1.25fr);
        gap: 3.75rem;
      }
    }

    .main-stream {
      display: flex;
      flex-direction: column;
      gap: 3.5rem;
    }

    .side-stream {
      display: flex;
      flex-direction: column;
      gap: 3rem;
    }

    /* SECTION LABELS */
    .section-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--muted);
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .section-title::after {
      content: "";
      flex: 1;
      height: 1px;
      background: var(--border);
    }

    /* WORK EXPERIENCE TIMELINE */
    .experience-list {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .exp-item {
      position: relative;
      padding-left: 1.75rem;
      border-left: 2px solid var(--border);
      transition: border-color 0.2s ease;
    }

    .exp-dot {
      position: absolute;
      left: -7px;
      top: 4px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--primary);
      box-shadow: 0 0 0 3px rgba(8, 122, 91, 0.15);
      transition: transform 0.2s ease;
    }

    .exp-role {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--dark);
      line-height: 1.35;
      margin-bottom: 0.25rem;
    }

    .exp-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--muted);
      margin-bottom: 0.85rem;
      font-weight: 500;
    }

    .exp-company {
      color: var(--primary);
      font-weight: 600;
    }

    .exp-duration {
      font-family: var(--font-mono);
      font-size: 0.775rem;
      background: var(--surface-subtle);
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      border: 1px solid var(--border);
    }

    .exp-details {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .exp-details li {
      font-size: 0.9rem;
      color: var(--body);
      line-height: 1.6;
      position: relative;
      padding-left: 1.25rem;
    }

    .exp-details li::before {
      content: "•";
      color: var(--primary);
      position: absolute;
      left: 0;
      font-weight: bold;
      font-size: 1.1rem;
      line-height: 1.2;
    }

    /* FEATURED PROJECTS */
    .projects-container {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .project-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1.25rem;
    }

    .project-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: rgba(8, 122, 91, 0.28);
    }

    .project-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
    }

    .project-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--dark);
      margin-bottom: 0.45rem;
      line-height: 1.35;
    }

    .project-description {
      font-size: 0.875rem;
      color: var(--body);
      line-height: 1.65;
    }

    .tech-pill-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
    }

    .tech-pill {
      font-family: var(--font-mono);
      font-size: 0.725rem;
      font-weight: 500;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      background: var(--primary-light);
      color: var(--primary);
      border: 1px solid rgba(8, 122, 91, 0.18);
      transition: all 0.15s ease;
    }

    .tech-pill:hover {
      background: var(--primary);
      color: #ffffff;
      border-color: var(--primary);
    }

    /* SIDEBAR SECTIONS */
    
    /* CONTACT CARD */
    .contact-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
    }

    .contact-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .contact-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.875rem;
    }

    .contact-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--accent);
      flex-shrink: 0;
    }

    .contact-label {
      color: var(--muted);
      font-size: 0.8rem;
      min-width: 68px;
      font-weight: 600;
      text-transform: capitalize;
    }

    .contact-value {
      color: var(--dark);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.15s ease;
      word-break: break-all;
    }

    .contact-value:hover {
      color: var(--primary);
      text-decoration: underline;
    }

    /* SKILLS CATEGORY GROUPS */
    .skills-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .skill-group-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      box-shadow: var(--shadow-sm);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .skill-group-card:hover {
      border-color: rgba(8, 122, 91, 0.25);
      box-shadow: var(--shadow-sm);
    }

    .skill-group-header {
      font-size: 0.775rem;
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    .skill-group-badge {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent);
    }

    .skills-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
    }

    .skill-chip {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.32rem 0.75rem;
      border-radius: 9999px;
      background: var(--surface-subtle);
      border: 1px solid var(--border);
      color: var(--dark);
      transition: all 0.18s ease;
      line-height: 1.4;
    }

    .skill-chip:hover {
      border-color: var(--primary);
      color: var(--primary);
      background: var(--primary-light);
      transform: translateY(-1px);
    }

    /* EDUCATION */
    .edu-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      margin-bottom: 0.85rem;
      box-shadow: var(--shadow-sm);
      transition: border-color 0.2s ease, transform 0.2s ease;
    }

    .edu-card:hover {
      border-color: rgba(8, 122, 91, 0.25);
      transform: translateY(-1px);
    }

    .edu-degree {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--dark);
      margin-bottom: 0.25rem;
      line-height: 1.35;
    }

    .edu-institution {
      font-size: 0.875rem;
      color: var(--primary);
      font-weight: 600;
    }

    .edu-year {
      font-family: var(--font-mono);
      font-size: 0.775rem;
      color: var(--muted);
      margin-top: 0.35rem;
      display: inline-block;
    }

    /* CERTIFICATIONS */
    .cert-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 0.85rem 1rem;
      margin-bottom: 0.65rem;
      font-size: 0.875rem;
      color: var(--dark);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      line-height: 1.45;
      box-shadow: var(--shadow-sm);
      transition: all 0.18s ease;
    }

    .cert-card:hover {
      border-color: rgba(8, 122, 91, 0.25);
      transform: translateY(-1px);
    }

    .cert-icon-wrapper {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: var(--primary-light);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
      flex-shrink: 0;
    }

    /* AWARDS / ACHIEVEMENTS */
    .award-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 0.85rem 1rem;
      margin-bottom: 0.65rem;
      font-size: 0.875rem;
      color: var(--dark);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      line-height: 1.45;
      box-shadow: var(--shadow-sm);
      transition: all 0.18s ease;
    }

    .award-card:hover {
      border-color: rgba(217, 119, 6, 0.3);
      transform: translateY(-1px);
    }

    .award-icon-wrapper {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: #FEF3C7;
      color: #D97706;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
      flex-shrink: 0;
    }

    /* FOOTER */
    .site-footer {
      border-top: 1px solid var(--border);
      background: var(--surface);
      padding: 2.25rem 1.5rem;
      text-align: center;
      color: var(--muted);
      font-size: 0.85rem;
    }

    .site-footer a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
    }

    .site-footer a:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .nav-menu {
        display: none;
      }
      .mobile-menu-btn {
        display: inline-flex;
      }
      .page-container {
        padding: 5rem 1.25rem 4rem 1.25rem;
      }
      .hero-section {
        margin-bottom: 3rem;
        padding-bottom: 2rem;
      }
    }
  </style>
</head>
<body>

  <!-- Top Navigation Bar -->
  <header class="site-header" id="header">
    <div class="nav-container">
      <a href="#about" class="brand" aria-label="${name} Home">
        <div class="brand-initials">${initials}</div>
        <span class="brand-name">${name}</span>
      </a>

      <!-- Desktop Nav -->
      <nav aria-label="Main Navigation">
        <ul class="nav-menu">
          ${hasExperience ? '<li><a href="#experience" class="nav-link">Experience</a></li>' : ''}
          ${hasProjects ? '<li><a href="#projects" class="nav-link">Projects</a></li>' : ''}
          ${hasSkills ? '<li><a href="#skills" class="nav-link">Skills</a></li>' : ''}
          ${hasEducation ? '<li><a href="#education" class="nav-link">Education</a></li>' : ''}
          ${hasCertifications ? '<li><a href="#certifications" class="nav-link">Certifications</a></li>' : ''}
          ${hasAchievements ? '<li><a href="#achievements" class="nav-link">Achievements</a></li>' : ''}
          ${hasContact ? '<li><a href="#contact" class="nav-cta" id="nav-cta-btn">Get in touch</a></li>' : (data.contact?.email ? `<li><a href="mailto:${escapeHtml(data.contact.email)}" class="nav-cta" title="Email ${name}">Get in touch</a></li>` : '')}
        </ul>
      </nav>

      <!-- Mobile Hamburger Button -->
      <button 
        type="button" 
        class="mobile-menu-btn" 
        id="mobileMenuToggle" 
        aria-label="Toggle navigation menu" 
        aria-expanded="false" 
        aria-controls="mobileDrawer"
      >
        <span id="menuIcon">☰</span>
      </button>
    </div>

    <!-- Mobile Drawer Menu -->
    <div class="mobile-nav-drawer" id="mobileDrawer" aria-label="Mobile Navigation">
      <a href="#about" class="mobile-nav-link"><span>About</span><span>→</span></a>
      ${hasExperience ? '<a href="#experience" class="mobile-nav-link"><span>Experience</span><span>→</span></a>' : ''}
      ${hasProjects ? '<a href="#projects" class="mobile-nav-link"><span>Projects</span><span>→</span></a>' : ''}
      ${hasSkills ? '<a href="#skills" class="mobile-nav-link"><span>Skills</span><span>→</span></a>' : ''}
      ${hasEducation ? '<a href="#education" class="mobile-nav-link"><span>Education</span><span>→</span></a>' : ''}
      ${hasCertifications ? '<a href="#certifications" class="mobile-nav-link"><span>Certifications</span><span>→</span></a>' : ''}
      ${hasAchievements ? '<a href="#achievements" class="mobile-nav-link"><span>Achievements</span><span>→</span></a>' : ''}
      ${hasContact ? '<a href="#contact" class="nav-cta" style="text-align:center; justify-content:center; margin-top:0.5rem;">Get in touch ✉</a>' : (data.contact?.email ? `<a href="mailto:${escapeHtml(data.contact.email)}" class="nav-cta" style="text-align:center; justify-content:center; margin-top:0.5rem;">Get in touch ✉</a>` : '')}
    </div>
  </header>

  <!-- Page Main Container -->
  <main class="page-container">
    
    <!-- Hero Header -->
    <section class="hero-section reveal-section" id="about">
      <div class="hero-status-pill">
        <div class="hero-status-dot"></div>
        <span>Available for opportunities</span>
      </div>

      <h1 class="hero-name">${name}</h1>
      ${headline ? `<div class="hero-headline">${headline}</div>` : ''}
      <div class="emerald-divider"></div>

      ${hasSummary ? `<p class="hero-summary">${summary}</p>` : ''}

      <div class="hero-actions">
        ${hasContact ? `
          <a href="#contact" class="btn-primary">
            <span>Get in Touch</span>
            <span>→</span>
          </a>
        ` : (data.contact?.email ? `
          <a href="mailto:${escapeHtml(data.contact.email)}" class="btn-primary" title="Email ${name}">
            <span>Get in Touch</span>
            <span>→</span>
          </a>
        ` : '')}
        ${hasProjects ? `
          <a href="#projects" class="btn-secondary">
            <span>View Projects</span>
          </a>
        ` : (hasExperience ? `
          <a href="#experience" class="btn-secondary">
            <span>View Experience</span>
          </a>
        ` : '')}
      </div>
    </section>

    <!-- Two-Column Layout Grid -->
    <div class="layout-grid">
      
      <!-- Main Content Stream (Left: Experience & Projects) -->
      <div class="main-stream">
        
        ${hasExperience ? `
          <!-- WORK EXPERIENCE -->
          <section id="experience" class="reveal-section">
            <h2 class="section-title">Selected Experience</h2>
            <div class="experience-list">
              ${data.experience.map(exp => `
                <div class="exp-item">
                  <div class="exp-dot"></div>
                  <h3 class="exp-role">${escapeHtml(exp.role)}</h3>
                  <div class="exp-meta">
                    <span class="exp-company">${escapeHtml(exp.company)}</span>
                    ${exp.duration ? `<span>•</span><span class="exp-duration">${escapeHtml(exp.duration)}</span>` : ''}
                    ${exp.location ? `<span>•</span><span>${escapeHtml(exp.location)}</span>` : ''}
                  </div>
                  ${exp.details && exp.details.length > 0 ? `
                    <ul class="exp-details">
                      ${exp.details.map(d => `<li>${escapeHtml(d)}</li>`).join('')}
                    </ul>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        ${hasProjects ? `
          <!-- FEATURED PROJECTS -->
          <section id="projects" class="reveal-section">
            <h2 class="section-title">Featured Projects</h2>
            <div class="projects-container">
              ${data.projects.map(proj => `
                <div class="project-card">
                  <div>
                    <div class="project-header">
                      <h3 class="project-title">${escapeHtml(proj.title)}</h3>
                    </div>
                    <p class="project-description">${escapeHtml(proj.description)}</p>
                  </div>
                  ${proj.technologies && Array.isArray(proj.technologies) && proj.technologies.length > 0 ? `
                    <div class="tech-pill-list">
                      ${proj.technologies.map(t => `<span class="tech-pill">${escapeHtml(t)}</span>`).join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

      </div>

      <!-- Side Stream (Right: Contact, Skills, Education, Certifications, Achievements) -->
      <div class="side-stream">
        
        ${hasContact ? `
          <!-- CONTACT -->
          <section id="contact" class="reveal-section">
            <h2 class="section-title">Contact Information</h2>
            <div class="contact-card">
              <ul class="contact-list">
                ${data.contact.email ? `
                  <li class="contact-row">
                    <span class="contact-dot"></span>
                    <span class="contact-label">Email</span>
                    <a href="mailto:${escapeHtml(data.contact.email)}" class="contact-value">${escapeHtml(data.contact.email)}</a>
                  </li>
                ` : ''}
                ${data.contact.location ? `
                  <li class="contact-row">
                    <span class="contact-dot"></span>
                    <span class="contact-label">Location</span>
                    <span class="contact-value">${escapeHtml(data.contact.location)}</span>
                  </li>
                ` : ''}
                ${data.contact.phone ? `
                  <li class="contact-row">
                    <span class="contact-dot"></span>
                    <span class="contact-label">Phone</span>
                    <a href="tel:${escapeHtml(data.contact.phone)}" class="contact-value">${escapeHtml(data.contact.phone)}</a>
                  </li>
                ` : ''}
                ${data.contact.linkedin ? `
                  <li class="contact-row">
                    <span class="contact-dot"></span>
                    <span class="contact-label">LinkedIn</span>
                    <a href="${escapeHtml(data.contact.linkedin.startsWith('http') ? data.contact.linkedin : `https://${data.contact.linkedin}`)}" target="_blank" rel="noopener noreferrer" class="contact-value">View Profile ↗</a>
                  </li>
                ` : ''}
                ${data.contact.github ? `
                  <li class="contact-row">
                    <span class="contact-dot"></span>
                    <span class="contact-label">GitHub</span>
                    <a href="${escapeHtml(data.contact.github.startsWith('http') ? data.contact.github : `https://${data.contact.github}`)}" target="_blank" rel="noopener noreferrer" class="contact-value">github.com ↗</a>
                  </li>
                ` : ''}
                ${data.contact.website ? `
                  <li class="contact-row">
                    <span class="contact-dot"></span>
                    <span class="contact-label">Website</span>
                    <a href="${escapeHtml(data.contact.website.startsWith('http') ? data.contact.website : `https://${data.contact.website}`)}" target="_blank" rel="noopener noreferrer" class="contact-value">Visit site ↗</a>
                  </li>
                ` : ''}
                ${data.contact.links && Array.isArray(data.contact.links) ? data.contact.links.map(l => `
                  <li class="contact-row">
                    <span class="contact-dot"></span>
                    <span class="contact-label">${escapeHtml(l.label || 'Link')}</span>
                    <a href="${escapeHtml(l.url.startsWith('http') ? l.url : `https://${l.url}`)}" target="_blank" rel="noopener noreferrer" class="contact-value">${escapeHtml(l.url)} ↗</a>
                  </li>
                `).join('') : ''}
              </ul>
            </div>
          </section>
        ` : ''}

        ${hasSkills ? `
          <!-- GROUPED SKILLS -->
          <section id="skills" class="reveal-section">
            <h2 class="section-title">Core Skills</h2>
            <div class="skills-container">
              ${skillCategories.map(cat => `
                <div class="skill-group-card">
                  <div class="skill-group-header">
                    <div class="skill-group-badge"></div>
                    <span>${escapeHtml(cat.category)}</span>
                  </div>
                  <div class="skills-cloud">
                    ${cat.items.map(s => `<span class="skill-chip">${escapeHtml(s)}</span>`).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        ${hasEducation ? `
          <!-- EDUCATION -->
          <section id="education" class="reveal-section">
            <h2 class="section-title">Education</h2>
            <div>
              ${data.education.map(edu => `
                <div class="edu-card">
                  <div class="edu-degree">${escapeHtml(edu.degree)}</div>
                  <div class="edu-institution">${escapeHtml(edu.institution)}</div>
                  ${edu.year ? `<div class="edu-year">${escapeHtml(edu.year)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        ${hasCertifications ? `
          <!-- CERTIFICATIONS -->
          <section id="certifications" class="reveal-section">
            <h2 class="section-title">Certifications &amp; Courses</h2>
            <div>
              ${data.certifications!.map(cert => `
                <div class="cert-card">
                  <div class="cert-icon-wrapper">📜</div>
                  <span>${escapeHtml(cert)}</span>
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        ${hasAchievements ? `
          <!-- ACHIEVEMENTS / AWARDS -->
          <section id="achievements" class="reveal-section">
            <h2 class="section-title">Key Achievements</h2>
            <div>
              ${data.achievements!.map(ach => `
                <div class="award-card">
                  <div class="award-icon-wrapper">🏆</div>
                  <span>${escapeHtml(ach)}</span>
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

      </div>

    </div>

  </main>

  <!-- Footer -->
  <footer class="site-footer">
    <p>© ${new Date().getFullYear()} ${name}. Generated with Folio.</p>
  </footer>

  <!-- Interactive Client Scripts: Hamburger, ScrollSpy, ScrollReveal, Anchor Navigation -->
  <script>
    (function() {
      // 0. Smooth Anchor Navigation Interceptor
      // Explicitly handles all hash-based links (e.g., #projects, #skills, #education, #certifications, #achievements, #contact, #about)
      // and smoothly scrolls to the target element without triggering parent window navigation or iframe reloads.
      const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
      const drawer = document.getElementById('mobileDrawer');
      const menuBtn = document.getElementById('mobileMenuToggle');
      const menuIcon = document.getElementById('menuIcon');

      function setupAnchorScroll() {
        const anchors = document.querySelectorAll('a[href^="#"]');
        anchors.forEach(function(anchor) {
          anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            const targetId = href.substring(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
              e.preventDefault();
              e.stopPropagation();

              // If mobile drawer is open, close it
              if (drawer && drawer.classList.contains('is-open')) {
                drawer.classList.remove('is-open');
                if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
                if (menuIcon) menuIcon.textContent = '☰';
              }

              // Compute exact offset taking the fixed header into account
              const headerEl = document.querySelector('.site-header');
              const headerHeight = headerEl ? headerEl.getBoundingClientRect().height + 16 : 76;
              const elementPosition = targetEl.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

              window.scrollTo({
                top: Math.max(0, offsetPosition),
                behavior: 'smooth'
              });

              // Update active nav styling
              navLinks.forEach(function(link) {
                if (link.getAttribute('href') === href) {
                  link.classList.add('active');
                } else {
                  link.classList.remove('active');
                }
              });
            }
          });
        });
      }
      setupAnchorScroll();

      // 1. Mobile Menu Toggle
      if (menuBtn && drawer) {
        menuBtn.addEventListener('click', function() {
          const isOpen = drawer.classList.toggle('is-open');
          menuBtn.setAttribute('aria-expanded', isOpen);
          menuIcon.textContent = isOpen ? '✕' : '☰';
        });
      }

      // 2. Scrollspy for Desktop and Mobile Navigation
      const sections = Array.from(document.querySelectorAll('section[id]'));

      function onScroll() {
        const scrollPosition = window.scrollY + 120;
        let currentId = '';

        for (let i = sections.length - 1; i >= 0; i--) {
          const section = sections[i];
          if (section.offsetTop <= scrollPosition) {
            currentId = section.getAttribute('id');
            break;
          }
        }

        navLinks.forEach(function(link) {
          const href = link.getAttribute('href');
          if (href === '#' + currentId) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      // 3. Scroll Reveal Animation via IntersectionObserver
      if ('IntersectionObserver' in window) {
        const revealSections = document.querySelectorAll('.reveal-section');
        const observer = new IntersectionObserver(function(entries, obs) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              obs.unobserve(entry.target);
            }
          });
        }, {
          threshold: 0.1,
          rootMargin: '0px 0px -40px 0px'
        });

        revealSections.forEach(function(sec) {
          observer.observe(sec);
        });
      } else {
        // Fallback for older browsers
        document.querySelectorAll('.reveal-section').forEach(function(sec) {
          sec.classList.add('is-visible');
        });
      }
    })();
  </script>

</body>
</html>`;
}
