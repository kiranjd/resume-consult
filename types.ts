export interface ResumeHeader {
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl?: string;
  location?: string;
  title?: string;
}

export interface ExperienceItem {
  id?: string; // Added ID for inline editing targeting
  company: string;
  role: string;
  dateRange: string;
  location?: string;
  achievements: string[];
}

export interface EducationItem {
  id?: string; // Added ID
  institution: string;
  degree: string;
  dateRange: string;
  details?: string;
}

export interface ResumeData {
  header: ResumeHeader;
  summary: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
}

// --- New Analysis Types ---

export interface ClarificationQuestion {
  id: string;
  question: string;
  context: string; // Why we are asking this
  userAnswer?: string; // Field to store user input
}

// Updated Categories based on user request
export type StrategyCategory = 'Formatting & Tone' | 'Skill Gaps' | 'ATS & Systems';

export interface StrategicSuggestion {
  id: string;
  category: StrategyCategory; 
  label: string;
  description: string;
  benefit: string; // Why this helps get the job
  isSelected: boolean;
}

export interface InitialAnalysis {
  matchScore: number;
  executiveSummary: string;
  strengths: string[];
  hardSkillGaps: string[];
  softSkillGaps: string[];
  missingKeywords: string[];
  clarificationQuestions: ClarificationQuestion[];
  strategicSuggestions: StrategicSuggestion[];
}

export interface OptimizationResponse {
  analysis: InitialAnalysis;
  optimizedResume: ResumeData;
  changeOverview: string;
}

export enum AppStep {
  LANDING = 'LANDING',
  INPUT = 'INPUT',
  PROCESSING_ANALYSIS = 'PROCESSING_ANALYSIS',
  ANALYSIS_REVIEW = 'ANALYSIS_REVIEW',
  PROCESSING_GENERATION = 'PROCESSING_GENERATION',
  RESULT = 'RESULT',
}
