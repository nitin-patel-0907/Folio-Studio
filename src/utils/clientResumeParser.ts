import { ResumeData, SkillCategory, EducationItem, ProjectItem, ExperienceItem } from '../types.ts';

export interface ValidationCheckResult {
  isValid: boolean;
  rejectionReason?: string;
  score: number;
}

/**
 * Validates whether the given raw text resembles a genuine resume.
 * Strict check: rejects invoices, code, stories, random text, and documents lacking career markers.
 */
export function validateResumeTextClient(text: string): ValidationCheckResult {
  if (!text || text.trim().length < 100) {
    return {
      isValid: false,
      score: 0,
      rejectionReason: 'The uploaded file does not contain enough text (< 100 characters) to be a valid resume.'
    };
  }

  const cleanText = text.trim();
  const lower = cleanText.toLowerCase();

  // 1. Check for prominent non-resume markers (invoices, receipts, stories, code)
  const isInvoice = /invoice\s*#|billed\s*to|total\s*due|subtotal|sales\s*tax|payment\s*terms|remit\s*payment|items\s*ordered|customer\s*id|due\s*date|amount\s*due|purchase\s*order|sku:/i.test(text);
  const isFiction = /once\s*upon\s*a\s*time|chapter\s*\d+|pirate\s*cove|kraken|swashbuckler|treasure\s*chest|gold\s*doubloons|ingredients:|recipe\s*yield|prep\s*time:/i.test(text);
  const isCode = /^import\s+|^const\s+|^function\s+|<!DOCTYPE\s+html>|public\s+static\s+void\s+main|npm\s+err!|exception\s+in\s+thread/i.test(text);

  if (isInvoice) {
    return {
      isValid: false,
      score: 10,
      rejectionReason: 'The uploaded document appears to be an invoice or receipt, not a candidate resume.'
    };
  }

  if (isFiction) {
    return {
      isValid: false,
      score: 15,
      rejectionReason: 'The uploaded document appears to be a fictional story or creative writing, not a resume.'
    };
  }

  if (isCode) {
    return {
      isValid: false,
      score: 10,
      rejectionReason: 'The uploaded document appears to be a source code file or system log, not a resume.'
    };
  }

  // 2. Positive resume structural markers
  const emailMatch = cleanText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i);
  const phoneMatch = cleanText.match(/(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{4,5}/);
  const linkedinMatch = cleanText.match(/linkedin\.com\/in\/[A-Za-z0-9_-]+/i);
  const githubMatch = cleanText.match(/github\.com\/[A-Za-z0-9_-]+/i);
  const yearMatch = cleanText.match(/\b(19\d{2}|20\d{2})\b/);

  // Resume section checks
  const hasExperienceSection = /^(experience|work experience|employment history|work history|professional experience|internships)[:\s]*$/im.test(text) ||
    /\b(work\s+experience|professional\s+experience|employment\s+history)\b/i.test(lower);
  
  const hasEducationSection = /^(education|academic background|degrees|academic history)[:\s]*$/im.test(text) ||
    /\b(bachelor|master|b\.tech|b\.s|m\.s|phd|diploma|university|college|gpa)\b/i.test(lower);

  const hasSkillsSection = /^(skills|technical skills|technologies|core competencies|proficiencies|areas of expertise)[:\s]*$/im.test(text) ||
    /\b(technical\s+skills|programming\s+languages|core\s+competencies|technologies)\b/i.test(lower);

  const hasProjectsSection = /^(projects|selected projects|featured projects|key projects|academic projects|portfolio projects)[:\s]*$/im.test(text) ||
    /\b(selected\s+projects|featured\s+projects|key\s+projects)\b/i.test(lower);

  const hasSummarySection = /^(summary|professional summary|profile|about me|objective|biography)[:\s]*$/im.test(text) ||
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
  if (yearMatch) score += 15;
  score += sectionCount * 15;

  // A genuine resume must have at least 2 distinct sections and some contact or date signal
  const hasMinSections = sectionCount >= 2;
  const hasContactOrDates = Boolean(emailMatch || phoneMatch || linkedinMatch || githubMatch || yearMatch);

  if (!hasMinSections || (!hasContactOrDates && sectionCount < 3) || score < 45) {
    return {
      isValid: false,
      score,
      rejectionReason: 'Unable to verify as a resume. The uploaded document lacks typical resume structure (such as work experience, education, skills, or projects sections).'
    };
  }

  return {
    isValid: true,
    score,
  };
}

export function parseResumeTextClient(text: string): ResumeData {
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  // Name extraction
  const rawFirst = lines[0] || '';
  let name = rawFirst.replace(/^(name|contact(\s+info)?)\s*[:\-–—|]?\s*/i, '').trim();
  if (name.length > 50 || /resume|curriculum|fictional|sample|template|summary|profile|skills/i.test(name)) {
    for (const l of lines.slice(0, 5)) {
      if (!/resume|curriculum|profile|summary|skills|education|experience|projects|contact|fictional/i.test(l) &&
          !l.includes('@') && !/\d{4}/.test(l) && l.length < 40 && l.length > 2) {
        name = l;
        break;
      }
    }
  }

  // Format capitalized name
  const formattedName = name
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ') || (lines[0]?.length < 40 ? lines[0] : 'Candidate');

  // Contact info
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i);
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{4,5}/);
  const linkedinMatch = text.match(/linkedin\.com\/in\/[A-Za-z0-9_-]+/i);
  const githubMatch = text.match(/github\.com\/[A-Za-z0-9_-]+/i);
  const websiteMatch = text.match(/https?:\/\/(?!linkedin|github)[A-Za-z0-9.-]+\.[A-Za-z]{2,}(\/[^\s]*)?/i);

  let location = '';
  for (const line of lines.slice(0, 8)) {
    const locMatch = line.match(/\b([A-Z][a-zA-Z\s.-]+,\s*[A-Z][a-zA-Z\s]+(?:\s+\d{5})?)\b/);
    if (locMatch && !locMatch[0].includes('University') && !locMatch[0].includes('College') && !locMatch[0].includes('Institute')) {
      const locClean = locMatch[0].replace(/^.*[•·|]\s*/, '').trim();
      if (locClean.length > 2 && locClean.length < 40) {
        location = locClean;
        break;
      }
    }
  }

  // Sections bucket
  const sections: Record<string, string[]> = {};
  let currentSection = 'header';
  sections[currentSection] = [];

  for (const line of lines) {
    const lower = line.toLowerCase().trim();
    if (/^(summary|professional summary|profile|about me|objective|biography)[:\s]*$/i.test(lower)) {
      currentSection = 'summary';
      sections[currentSection] = [];
    } else if (/^(experience|work experience|employment history|work history|professional experience|internships)[:\s]*$/i.test(lower)) {
      currentSection = 'experience';
      sections[currentSection] = [];
    } else if (/^(education|academic background|degrees|academic history)[:\s]*$/i.test(lower)) {
      currentSection = 'education';
      sections[currentSection] = [];
    } else if (/^(skills|technical skills|technologies|core competencies|proficiencies|areas of expertise)[:\s]*$/i.test(lower)) {
      currentSection = 'skills';
      sections[currentSection] = [];
    } else if (/^(projects?|featured projects?|selected projects?|key projects?|academic projects?|portfolio projects?)[:\s]*$/i.test(lower)) {
      currentSection = 'projects';
      sections[currentSection] = [];
    } else if (/^(certifications?(\s*(&|and|\+)\s*(activities|achievements|courses|training))?|certificates?|licenses?|courses?|training)[:\s]*$/i.test(lower)) {
      currentSection = 'certifications';
      sections[currentSection] = [];
    } else if (/^(achievements?|honors?|awards?|hackathons?(\s*(&|and|\+)\s*(achievements?|awards?|competitions?|activities))?|competitions?|activities|extracurricular activities?)[:\s]*$/i.test(lower)) {
      currentSection = 'achievements';
      sections[currentSection] = [];
    } else {
      if (!sections[currentSection]) sections[currentSection] = [];
      sections[currentSection].push(line);
    }
  }

  let headline = '';
  if (lines.length > 1) {
    const secondLine = lines[1];
    if (!secondLine.includes('@') && !secondLine.includes('http') && !/\d{3}/.test(secondLine) && secondLine.length < 80 && !secondLine.toLowerCase().includes('fictional')) {
      headline = secondLine.replace(/^([|•\-])\s*/, '').trim();
    }
  }

  let summary = '';
  if (sections['summary'] && sections['summary'].length > 0) {
    summary = sections['summary'].join(' ').replace(/^summary[:\s-]*/i, '').replace(/^profile[:\s-]*/i, '').trim();
  }

  // Skills
  const skillCategories: SkillCategory[] = [];
  if (sections['skills'] && sections['skills'].length > 0) {
    const knownCategoryPrefixes = [
      'programming languages', 'programming', 'languages', 'frontend', 'backend',
      'frameworks', 'libraries', 'data analysis', 'machine learning', 'artificial intelligence',
      'deep learning', 'data engineering', 'databases', 'cloud', 'devops', 'tools',
      'core competencies', 'technical skills', 'soft skills', 'methodologies'
    ];

    sections['skills'].forEach(line => {
      let category = '';
      let itemsStr = '';

      const colonMatch = line.match(/^([^:]+):\s*(.+)$/);
      if (colonMatch && colonMatch[2].length > 1) {
        category = colonMatch[1].trim();
        itemsStr = colonMatch[2];
      } else {
        for (const prefix of knownCategoryPrefixes) {
          const regex = new RegExp(`^(${prefix})\\s+([A-Za-z0-9].+)$`, 'i');
          const m = line.match(regex);
          if (m && m[2].length > 1) {
            category = m[1].trim();
            itemsStr = m[2];
            break;
          }
        }
      }

      if (category && itemsStr) {
        const items = itemsStr
          .split(/[,•|·/]/)
          .map(s => s.trim())
          .filter(s => s.length > 1 && s.length < 40);
        if (items.length > 0) {
          const formattedCategory = category.replace(/\b\w/g, c => c.toUpperCase());
          skillCategories.push({ category: formattedCategory, items });
          return;
        }
      }

      const items = line.split(/[,•|·/]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 40);
      if (items.length > 0) {
        skillCategories.push({ category: 'Technical Skills', items });
      }
    });
  }

  // Experience (Strict: never invent dummy roles or companies if empty)
  const experience: ExperienceItem[] = [];
  if (sections['experience'] && sections['experience'].length > 0) {
    let currentExp: ExperienceItem | null = null;
    sections['experience'].forEach(line => {
      const isBullet = /^[-•*–—]\s+/.test(line);
      const isDuration = /\b(19\d{2}|20\d{2}|present|current)\b/i.test(line);

      if (!isBullet && (line.length < 60 || isDuration)) {
        if (currentExp) experience.push(currentExp);
        const durMatch = line.match(/\b(19\d{2}|20\d{2}(?:\s*[-–—to\s]+\s*(?:19\d{2}|20\d{2}|Present|Current))?)\b/i);
        const duration = durMatch ? durMatch[0] : '';
        const roleAndCo = line.replace(duration, '').replace(/[,|–—]/g, ' ').trim();
        const parts = roleAndCo.split(/\s+at\s+|\s+-\s+/i);

        currentExp = {
          role: parts[0]?.trim() || '',
          company: parts[1]?.trim() || '',
          duration: duration || '',
          details: []
        };
      } else if (currentExp) {
        const cleanDetail = line.replace(/^[-•*–—]\s*/, '').trim();
        if (cleanDetail) currentExp.details.push(cleanDetail);
      }
    });
    if (currentExp) experience.push(currentExp);
  }

  // Education (Strict: never invent dummy universities)
  const education: EducationItem[] = [];
  if (sections['education'] && sections['education'].length > 0) {
    let curDegree = '';
    let curInst = '';
    let curYear = '';

    sections['education'].forEach(line => {
      const yearMatch = line.match(/\b(19\d{2}|20\d{2}(?:\s*[-–—to\s]+\s*(?:19\d{2}|20\d{2}|Present|Current))?)\b/i);
      if (yearMatch && !curYear) curYear = yearMatch[0];

      const cleanLine = line.trim();
      if (/degree|bachelor|master|phd|b\.tech|b\.s|b\.a|m\.s|diploma|associate|engineering/i.test(cleanLine)) {
        curDegree = cleanLine.replace(/[,|]/g, ' ').replace(/\s+/g, ' ').trim();
      } else if (/university|college|institute|school|academy/i.test(cleanLine)) {
        curInst = cleanLine.replace(/Expected Graduation.*$/i, '').replace(/CGPA.*$/i, '').replace(/[,|]/g, ' ').trim();
      } else if (!curInst && cleanLine.length > 2 && !cleanLine.includes('CGPA')) {
        curInst = cleanLine;
      }
    });

    if (curDegree || curInst) {
      education.push({
        degree: curDegree || curInst,
        institution: curInst || curDegree,
        year: curYear || undefined
      });
    }
  }

  // Projects
  const projects: ProjectItem[] = [];
  if (sections['projects'] && sections['projects'].length > 0) {
    let curProj: ProjectItem | null = null;

    sections['projects'].forEach(line => {
      const isBullet = /^[-•*–—]\s+/.test(line);
      const isActionOrContinuation = /^(and|or|with|using|including|comparison|based|built|designed|developed|implemented|created|evaluated|achieved|features?|managed|engineered|collaborated|trained|deployed|analyzed)\b/i.test(line);
      const endsWithPeriod = line.trim().endsWith('.');
      const startsWithLower = /^[a-z]/.test(line.trim());
      const looksLikeTitle = !isBullet && !isActionOrContinuation && !endsWithPeriod && !startsWithLower && line.length < 90 && !line.includes('.com');

      if (looksLikeTitle) {
        if (curProj) projects.push(curProj);
        curProj = {
          title: line.replace(/[:|]/g, '').trim(),
          description: '',
          technologies: []
        };
      } else if (curProj) {
        const cleanLine = line.replace(/^[-•*–—]\s*/, '').trim();
        curProj.description += (curProj.description ? ' ' : '') + cleanLine;

        const techCandidates = [
          'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express',
          'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
          'AWS', 'GCP', 'Azure', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'Pandas',
          'NumPy', 'Matplotlib', 'Seaborn', 'Random Forest', 'GridSearchCV', 'SVM',
          'Flask', 'Django', 'FastAPI', 'HTML', 'CSS', 'Tailwind', 'Git', 'GitHub'
        ];
        for (const tech of techCandidates) {
          const techRegex = new RegExp(`\\b${tech.replace('.', '\\.')}\\b`, 'i');
          if (techRegex.test(cleanLine) && !curProj.technologies?.includes(tech)) {
            if (!curProj.technologies) curProj.technologies = [];
            curProj.technologies.push(tech);
          }
        }
      }
    });
    if (curProj) projects.push(curProj);
  }

  // Certifications & Activities
  const certifications: string[] = [];
  const achievements: string[] = [];

  if (sections['achievements']) {
    sections['achievements'].forEach(line => {
      const clean = line.replace(/^[-•*📜★🏆]\s*/, '').replace(/This resume is entirely fictional.*$/i, '').trim();
      if (clean.length > 3 && !achievements.includes(clean)) {
        achievements.push(clean);
      }
    });
  }

  if (sections['certifications']) {
    sections['certifications'].forEach(line => {
      const clean = line.replace(/^[-•*📜★🏆]\s*/, '').replace(/This resume is entirely fictional.*$/i, '').trim();
      if (clean.length > 3) {
        if (/hackathon|competition|challenge|winner|award|participated|prize|finalist|showcase/i.test(clean)) {
          if (!achievements.includes(clean)) achievements.push(clean);
        } else {
          if (!certifications.includes(clean)) certifications.push(clean);
        }
      }
    });
  }

  return {
    name: formattedName,
    headline: headline || (skillCategories[0]?.items?.[0] ? `${skillCategories[0].items[0]} Specialist` : ''),
    summary: summary || '',
    skills: skillCategories,
    education,
    experience,
    projects,
    achievements,
    certifications,
    contact: {
      email: emailMatch ? emailMatch[0] : undefined,
      phone: phoneMatch ? phoneMatch[0].trim() : undefined,
      location: location || undefined,
      linkedin: linkedinMatch ? (linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`) : undefined,
      github: githubMatch ? (githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`) : undefined,
      website: websiteMatch ? websiteMatch[0] : undefined
    }
  };
}
