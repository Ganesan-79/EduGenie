export type ModuleType = 'all' | 'qa' | 'explain' | 'quiz' | 'summarize' | 'learn';

export interface QAResult {
  question: string;
  answer: string;
  timestamp: number;
}

export interface ExplainResult {
  topic: string;
  summary: string;
  explanation: string;
  analogy?: string;
  keyPoints: string[];
  didYouKnow?: string;
  timestamp: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface QuizResult {
  topic: string;
  questions: QuizQuestion[];
  timestamp: number;
}

export interface SummaryResult {
  summary: string;
  keyPoints: string[];
  oneLiner?: string;
  stats?: {
    originalWords: number;
    summaryWords: number;
    reductionPercent: number;
  };
  timestamp: number;
}

export interface LearningResource {
  category: string;
  title: string;
  description: string;
}

export interface LearningLevel {
  levelName: string;
  estimatedTime: string;
  keyTopics: string[];
  resources: LearningResource[];
}

export interface LearningPathResult {
  topic: string;
  title: string;
  overview: string;
  levels: LearningLevel[];
  adaptiveTips: string[];
  milestoneProject?: string;
  timestamp: number;
}
