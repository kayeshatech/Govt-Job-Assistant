import { ReservationCategory } from './student';

export interface EligibilityQuery {
  age: number;
  category: ReservationCategory;
  qualification: string;
  percentage: number;
  domicileState: string;
  isPwD: boolean;
  stream: string;
}

export interface EligibilityCriterionCheck {
  title: string;
  required: string;
  candidateValue: string;
  passed: boolean;
  notes?: string;
}

export interface ExamEligibilityResult {
  examId: string;
  examTitle: string;
  conductingBody: string;
  isEligible: boolean;
  eligibilityPercentage: number; // 0 - 100 score
  checks: EligibilityCriterionCheck[];
  ageRelaxationApplied: string;
  recommendation: string;
}
