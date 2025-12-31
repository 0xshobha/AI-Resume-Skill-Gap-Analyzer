// Core data models for AI Resume Analyzer

export interface SectionAnalysis {
  present: boolean;
  score: number;
  feedback: string;
}

export interface Improvement {
  category: 'content' | 'format' | 'keywords' | 'structure';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  example?: string;
}

export interface ATSIssue {
  issue: string;
  impact: 'high' | 'medium' | 'low';
  solution: string;
}

export interface ResumeAnalysis {
  overallScore: number;           // 0-100
  atsScore: number;               // 0-100
  jobMatchScore?: number;         // 0-100, optional

  sections: {
    contact: SectionAnalysis;
    summary: SectionAnalysis;
    experience: SectionAnalysis;
    education: SectionAnalysis;
    skills: SectionAnalysis;
  };

  skills: {
    identified: string[];
    missing?: string[];           // If job description provided
  };

  improvements: Improvement[];
  atsIssues: ATSIssue[];

  extractedText: string;
  analyzedAt: string;
}

export interface FileUploadState {
  file: File | null;
  status: 'idle' | 'uploading' | 'extracting' | 'analyzing' | 'complete' | 'error';
  progress: number;
  error?: string;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export type AcceptedFileType = 'application/pdf' | 'image/png' | 'image/jpeg' | 'image/jpg';

export const ACCEPTED_FILE_TYPES: AcceptedFileType[] = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg'
];

export const MAX_FILE_SIZES = {
  pdf: 10 * 1024 * 1024,    // 10MB
  image: 5 * 1024 * 1024,   // 5MB
} as const;
