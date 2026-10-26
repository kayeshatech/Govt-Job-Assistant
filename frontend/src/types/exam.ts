export type ExamLevel = 'Central' | 'State' | 'PSU' | 'Autonomous';

export type ExamCategory = 
  | 'Civil Services'
  | 'Staff Selection'
  | 'Engineering & PSU'
  | 'Banking & Finance'
  | 'Defense & Police'
  | 'Teaching & Lectureship'
  | 'Railways'
  | 'State Administration';

export type ExamStage = {
  name: string;
  details: string;
  marks?: number;
  duration?: string;
};

export type AgeLimit = {
  min: number;
  maxGeneral: number;
  maxOBC: number;
  maxSCST: number;
  maxPwD: number;
};

export type AttemptsLimit = {
  General: number | string;
  OBC: number | string;
  SCST: number | string;
  PwD: number | string;
};

export interface GovernmentExam {
  id: string;
  title: string;
  code: string;
  conductingBody: string;
  level: ExamLevel;
  category: ExamCategory;
  posts: string;
  vacancies: number;
  minQualification: string;
  eligibleStreams: string[];
  ageLimit: AgeLimit;
  attempts?: AttemptsLimit;
  payScale: string;
  payLevel: string;
  salaryBasic: string;
  salaryGross: string;
  applicationFee: string;
  notificationDate: string;
  lastDateToApply: string;
  prelimsDate: string;
  mainsDate?: string;
  status: 'Upcoming' | 'Active' | 'Closed' | 'Under Evaluation';
  officialWebsite: string;
  aiMatchScore?: number;
  negativeMarking: string;
  duration: string;
  relevanceForTech: string;
  stages: ExamStage[];
  syllabusOverview: {
    prelims: string[];
    mainsGS?: string[];
  };
}

export interface ExamFilterCriteria {
  searchQuery: string;
  category: string;
  level: string;
  conductingBody: string;
  stream: string;
  sortBy: 'relevance' | 'deadline' | 'vacancies' | 'salary';
}
