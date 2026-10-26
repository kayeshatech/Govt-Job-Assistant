export type ReservationCategory = 'General / UR' | 'EWS' | 'OBC-NCL' | 'SC' | 'ST' | 'PwD';

export type EducationLevel = 
  | 'Undergraduate (Final Year)'
  | 'Bachelor of Engineering / B.Tech'
  | 'Bachelor of Science (B.Sc)'
  | 'Bachelor of Commerce (B.Com)'
  | 'Bachelor of Arts (B.A)'
  | 'Master of Science (M.Sc)'
  | 'Master of Technology (M.Tech)'
  | 'Master of Arts (M.A)'
  | 'Ph.D / Research Scholar';

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  age: number;
  gender: 'Male' | 'Female' | 'Transgender' | 'Prefer not to say';
  category: ReservationCategory;
  domicileState: string;
  isPwD: boolean;
  pwdPercentage?: number;
  educationLevel: EducationLevel;
  majorStream: string;
  graduationYear: number;
  graduationPercentage: number;
  targetCategories: string[];
  targetExams: string[];
  preferredDailyStudyHours: number;
  isOnboarded: boolean;
  createdAt: string;
}

export type ApplicationTrackingStatus = 
  | 'Draft / Planning'
  | 'Applied & Fee Paid'
  | 'Admit Card Downloaded'
  | 'Exam Appeared'
  | 'Cleared Prelims'
  | 'Interview Pending'
  | 'Final Result Declared';

export interface SavedApplication {
  id: string;
  examId: string;
  examTitle: string;
  conductingBody: string;
  registrationNumber?: string;
  rollNumber?: string;
  applicationDate?: string;
  examDate?: string;
  status: ApplicationTrackingStatus;
  notes?: string;
  savedAt: string;
}
