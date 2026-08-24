export interface ContactInfo {
  email?: string;
  location?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  links?: { label: string; url: string }[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  year?: string;
  gpa?: string;
  details?: string[];
}

export interface ExperienceItem {
  role: string;
  company: string;
  duration: string;
  location?: string;
  details: string[];
}

export interface ProjectItem {
  title: string;
  description: string;
  technologies?: string[];
  link?: string;
  github?: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface ResumeData {
  name: string;
  headline: string;
  summary: string;
  skills: (SkillCategory | string)[];
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  achievements?: string[];
  certifications?: string[];
  contact: ContactInfo;
}

export interface LayerResult {
  layer: 1 | 2 | 3;
  name: string;
  passed: boolean;
  score?: number;
  confidence?: number;
  details: string;
  metrics?: Record<string, any>;
  error?: string;
}

export interface ValidationResponse {
  valid: boolean;
  rejectionReason?: string;
  failedLayer?: 1 | 2 | 3;
  layers: {
    layer1: LayerResult;
    layer2: LayerResult;
    layer3: LayerResult;
  };
  cleanedText?: string;
  extractedData?: ResumeData;
  portfolioHtml?: string;
  id?: string;
}

export interface SampleResume {
  id: string;
  title: string;
  category: string;
  expectedResult: 'pass' | 'fail_layer1' | 'fail_layer2' | 'fail_layer3';
  badge: string;
  description: string;
  filename: string;
  content: string;
}
