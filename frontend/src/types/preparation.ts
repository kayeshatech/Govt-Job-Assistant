export interface StudyMilestone {
  id: string;
  stageName: string;
  weekRange: string;
  topics: string[];
  recommendedHoursPerWeek: number;
  isCompleted: boolean;
  notes?: string;
}

export interface PreparationRoadmap {
  examId: string;
  examTitle: string;
  targetYear: number;
  estimatedPreparationWeeks: number;
  stages: StudyMilestone[];
  currentWeek: number;
  overallProgressPercentage: number;
}

export type MaterialType = 'PDF Syllabus' | 'PYQ Paper' | 'Formula Book' | 'Reference Notes' | 'Current Affairs Digest';

export interface StudyMaterial {
  id: string;
  title: string;
  category: string;
  type: MaterialType;
  examCode: string;
  fileSize: string;
  pagesCount: number;
  year?: number;
  description: string;
  downloadUrl?: string;
  authorAgency: string;
}

export interface MockTestResult {
  id: string;
  testTitle: string;
  examCode: string;
  dateTaken: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  score: number;
  totalMarks: number;
  accuracyPercentage: number;
  percentileRank: number;
  timeSpentMinutes: number;
}

export interface DailyStudyTask {
  id: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'normal';
}
