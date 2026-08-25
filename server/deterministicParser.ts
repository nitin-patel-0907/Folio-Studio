import { ResumeData, SkillCategory } from '../src/types.ts';

/**
 * Post-parsing sanity cleanups for Candidate Name
 */
export function sanitizeExtractedName(rawName: string, cleanedText: string): string {
  if (!rawName) return 'Professional';

  let sanitized = rawName.trim();
  sanitized = sanitized.replace(
    /^(contact(\s+info(rmation)?)?|resume|cv|curriculum\s+vitae|profile|name)\s*[:\-–—|]?\s*/i,
    ''
  );
  sanitized = sanitized.replace(/\s+(contact|email|phone|summary|experience|skills|education).*$/i, '');

  const words = sanitized.split(/\s+/).filter(Boolean);
  const suspiciousKeywords = [
    'contact',
    'info',
    'summary',
    'experience',
    'education',
    'skills',
    'curriculum',
    'resume',
    'fictional',
    'sample',
    'template',
  ];
  const hasSuspiciousWord = words.some(w => suspiciousKeywords.includes(w.toLowerCase()));

  if (words.length > 4 || hasSuspiciousWord) {
    const lines = cleanedText.split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines.slice(0, 4)) {
      const cleanLine = line.replace(/^(contact(\s+info)?|name)\s*[:\-–—|]?\s*/i, '').trim();
      const lineWords = cleanLine.split(/\s+/).filter(Boolean);
      const isNotHeading = !/^(summary|experience|education|skills|projects|contact|profile|technical)/i.test(
        cleanLine
      );
      const isNotContact =
        !cleanLine.includes('@') &&
        !/\d{3}/.test(cleanLine) &&
        !cleanLine.includes('http') &&
        !cleanLine.toLowerCase().includes('fictional');

      if (lineWords.length >= 1 && lineWords.length <= 4 && isNotHeading && isNotContact) {
        return cleanLine;
      }
    }
    if (words.length > 4) {
      return words.slice(0, 3).join(' ');
    }
  }

  return (
    sanitized
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ') || 'Professional'
  );
}

export function sanitizeExtractedSummary(summary: string): string {
  if (!summary) return '';
  let clean = summary.trim();
  clean = clean.replace(/^(summary|professional\s+summary|profile|about\s+me)\s*[:\-–—|]?\s*/i, '');
  return clean;
}

/**
 * Structured fallback parser that follows all extraction rules when Gemini is unavailable.
 */
export function fallbackExtractResume(text: string): ResumeData {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const firstLine = lines[0] || 'Professional';

  // Contact regexes
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i);
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{4,5}/);
  const linkedinMatch = text.match(/linkedin\.com\/in\/[A-Za-z0-9_-]+/i);
  const githubMatch = text.match(/github\.com\/[A-Za-z0-9_-]+/i);
  const websiteMatch = text.match(/https?:\/\/(?!linkedin|github)[A-Za-z0-9.-]+\.[A-Za-z]{2,}(\/[^\s]*)?/i);

  // Extract location
  let location = '';
  for (const line of lines.slice(0, 8)) {
    const locMatch = line.match(/\b([A-Z][a-zA-Z\s.-]+,\s*[A-Z][a-zA-Z\s]+(?:\s+\d{5})?)\b/);
    if (
      locMatch &&
      !locMatch[0].includes('University') &&
      !locMatch[0].includes('College') &&
      !locMatch[0].includes('Institute')
    ) {
      const locClean = locMatch[0].replace(/^.*[•·|]\s*/, '').trim();
      if (locClean.length > 2 && locClean.length < 40) {
        location = locClean;
        break;
      }
    }
  }

  // Section splitting
  const sections: { [key: string]: string[] } = {};
  let currentSection = 'header';
  sections[currentSection] = [];

  for (const line of lines) {
    const lower = line.toLowerCase().trim();
    if (/^(summary|professional summary|profile|about me|objective|biography)[:\s]*$/i.test(lower)) {
      currentSection = 'summary';
      sections[currentSection] = [];
    } else if (
      /^(experience|work experience|employment history|work history|professional experience|internships)[:\s]*$/i.test(
        lower
      )
    ) {
      currentSection = 'experience';
      sections[currentSection] = [];
    } else if (/^(education|academic background|degrees|academic history)[:\s]*$/i.test(lower)) {
      currentSection = 'education';
      sections[currentSection] = [];
    } else if (
      /^(skills|technical skills|technologies|core competencies|proficiencies|areas of expertise)[:\s]*$/i.test(
        lower
      )
    ) {
      currentSection = 'skills';
      sections[currentSection] = [];
    } else if (
      /^(projects?|featured projects?|selected projects?|key projects?|academic projects?|portfolio projects?)[:\s]*$/i.test(
        lower
      )
    ) {
      currentSection = 'projects';
      sections[currentSection] = [];
    } else if (
      /^(certifications?(\s*(&|and|\+)\s*(activities|achievements|courses|training))?|certificates?|licenses?|courses?|training)[:\s]*$/i.test(
        lower
      )
    ) {
      currentSection = 'certifications';
      sections[currentSection] = [];
    } else if (
      /^(achievements?|honors?|awards?|hackathons?(\s*(&|and|\+)\s*(achievements?|awards?|competitions?|activities))?|competitions?|activities|extracurricular activities?)[:\s]*$/i.test(
        lower
      )
    ) {
      currentSection = 'achievements';
      sections[currentSection] = [];
    } else {
      if (!sections[currentSection]) sections[currentSection] = [];
      sections[currentSection].push(line);
    }
  }

  // Name extraction
  const cleanName = sanitizeExtractedName(firstLine, text);

  // Headline extraction
  let headline = '';
  if (lines.length > 1) {
    const secondLine = lines[1];
    if (
      !secondLine.includes('@') &&
      !secondLine.includes('http') &&
      !/\d{3}/.test(secondLine) &&
      secondLine.length < 80 &&
      !secondLine.toLowerCase().includes('fictional')
    ) {
      headline = secondLine.replace(/^([|•\-])\s*/, '').trim();
    }
  }

  // Summary extraction
  let summary = '';
  if (sections['summary'] && sections['summary'].length > 0) {
    summary = sections['summary']
      .join(' ')
      .replace(/^summary[:\s-]*/i, '')
      .replace(/^profile[:\s-]*/i, '')
      .trim();
  }

  // Grouped skills extraction
  const skillCategories: SkillCategory[] = [];
  if (sections['skills'] && sections['skills'].length > 0) {
    const knownCategoryPrefixes = [
      'programming languages',
      'programming',
      'languages',
      'frontend',
      'backend',
      'frameworks',
      'libraries',
      'data analysis',
      'machine learning',
      'artificial intelligence',
      'deep learning',
      'data engineering',
      'databases',
      'cloud',
      'devops',
      'tools',
      'core competencies',
      'technical skills',
      'soft skills',
      'methodologies',
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

      const items = line
        .split(/[,•|·/]/)
        .map(s => s.trim())
        .filter(s => s.length > 1 && s.length < 40);
      if (items.length > 0) {
        skillCategories.push({ category: 'Technical Skills', items });
      }
    });
  }

  // Work experience extraction
  const experience: { role: string; company: string; duration: string; details: string[] }[] = [];
  if (sections['experience'] && sections['experience'].length > 0) {
    let currentExp: { role: string; company: string; duration: string; details: string[] } | null = null;

    sections['experience'].forEach(line => {
      const isBullet = /^[-•*–—]\s+/.test(line);
      const isDateLine = /\b(19\d{2}|20\d{2})\b/.test(line) || /\b(present|current)\b/i.test(line);

      if (!isBullet && (isDateLine || line.includes('–') || line.includes('-') || line.includes('|') || line.length < 60)) {
        if (currentExp) {
          experience.push(currentExp);
        }

        const dateMatch = line.match(
          /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4})\s*[-–—to\s]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4}|Present|Current)\b/i
        );
        const duration = dateMatch ? dateMatch[0] : '';
        const titleWithoutDate = line.replace(duration, '').replace(/[|–—]/g, ' ').trim();
        const parts = titleWithoutDate.split(/\s+at\s+|\s+,\s+|\s+-\s+/i).filter(Boolean);

        currentExp = {
          role: parts[0] || 'Role Title',
          company: parts[1] || 'Company',
          duration: duration || '',
          details: [],
        };
      } else if (currentExp) {
        const cleanDetail = line.replace(/^[-•*–—]\s*/, '').trim();
        if (cleanDetail) currentExp.details.push(cleanDetail);
      }
    });

    if (currentExp) {
      experience.push(currentExp);
    }
  }

  // Education extraction
  const education: { degree: string; institution: string; year: string }[] = [];
  if (sections['education'] && sections['education'].length > 0) {
    let curDegree = '';
    let curInst = '';
    let curYear = '';

    sections['education'].forEach(line => {
      const yearMatch = line.match(
        /\b(19\d{2}|20\d{2}(?:\s*[-–—to\s]+\s*(?:19\d{2}|20\d{2}|Present|Current))?)\b/i
      );
      if (yearMatch && !curYear) curYear = yearMatch[0];

      const cleanLine = line.trim();
      if (/degree|bachelor|master|phd|b\.tech|b\.s|b\.a|m\.s|diploma|associate|engineering/i.test(cleanLine)) {
        curDegree = cleanLine.replace(/[,|]/g, ' ').replace(/\s+/g, ' ').trim();
      } else if (/university|college|institute|school|academy/i.test(cleanLine)) {
        curInst = cleanLine
          .replace(/Expected Graduation.*$/i, '')
          .replace(/CGPA.*$/i, '')
          .replace(/[,|]/g, ' ')
          .trim();
      } else if (!curInst && cleanLine.length > 2 && !cleanLine.includes('CGPA')) {
        curInst = cleanLine;
      }
    });

    if (curDegree || curInst) {
      education.push({
        degree: curDegree || curInst,
        institution: curInst || curDegree,
        year: curYear || '',
      });
    }
  }

  // Projects extraction
  const projects: { title: string; description: string; technologies: string[] }[] = [];
  if (sections['projects'] && sections['projects'].length > 0) {
    let curProj: { title: string; description: string; technologies: string[] } | null = null;

    sections['projects'].forEach(line => {
      const isBullet = /^[-•*–—]\s+/.test(line);
      const isActionOrContinuation =
        /^(and|or|with|using|including|comparison|based|built|designed|developed|implemented|created|evaluated|achieved|features?|managed|engineered|collaborated|trained|deployed|analyzed)\b/i.test(
          line
        );
      const endsWithPeriod = line.trim().endsWith('.');
      const startsWithLower = /^[a-z]/.test(line.trim());
      const looksLikeTitle =
        !isBullet &&
        !isActionOrContinuation &&
        !endsWithPeriod &&
        !startsWithLower &&
        line.length < 90 &&
        !line.includes('.com');

      if (looksLikeTitle) {
        if (curProj) projects.push(curProj);
        curProj = {
          title: line.replace(/[:|]/g, '').trim(),
          description: '',
          technologies: [],
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
          if (techRegex.test(cleanLine) && !curProj.technologies.includes(tech)) {
            curProj.technologies.push(tech);
          }
        }
      }
    });
    if (curProj) projects.push(curProj);
  }

  // Certifications and Achievements
  const certifications: string[] = [];
  const achievements: string[] = [];

  if (sections['achievements']) {
    sections['achievements'].forEach(line => {
      const clean = line
        .replace(/^[-•*📜★🏆]\s*/, '')
        .replace(/This resume is entirely fictional.*$/i, '')
        .trim();
      if (clean.length > 3 && !achievements.includes(clean)) {
        achievements.push(clean);
      }
    });
  }

  if (sections['certifications']) {
    sections['certifications'].forEach(line => {
      const clean = line
        .replace(/^[-•*📜★🏆]\s*/, '')
        .replace(/This resume is entirely fictional.*$/i, '')
        .trim();
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
    name: cleanName,
    headline,
    summary,
    skills: skillCategories,
    education,
    experience,
    projects,
    certifications,
    achievements,
    contact: {
      email: emailMatch ? emailMatch[0] : '',
      location,
      phone: phoneMatch ? phoneMatch[0] : '',
      linkedin: linkedinMatch
        ? linkedinMatch[0].startsWith('http')
          ? linkedinMatch[0]
          : `https://${linkedinMatch[0]}`
        : '',
      github: githubMatch
        ? githubMatch[0].startsWith('http')
          ? githubMatch[0]
          : `https://${githubMatch[0]}`
        : '',
      website: websiteMatch ? websiteMatch[0] : '',
    },
  };
}
