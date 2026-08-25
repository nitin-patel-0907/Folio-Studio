import { ResumeData, ValidationResponse, LayerResult, SkillCategory } from '../src/types.ts';

export interface ExtractedFilePayload {
  name: string;
  size: number;
  buffer?: Buffer;
  text?: string;
}

export interface Layer1Result {
  passed: boolean;
  result: LayerResult;
  rawText: string;
  cleanedText: string;
}

export interface Layer2Result {
  passed: boolean;
  result: LayerResult;
}

export interface Layer3Result {
  passed: boolean;
  result: LayerResult;
}

export interface StoredPortfolio {
  data: ResumeData;
  html: string;
  createdAt: Date;
}
