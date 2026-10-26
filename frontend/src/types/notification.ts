export type NotificationStatus = 'Active' | 'Upcoming' | 'Corrigendum' | 'Admit Card' | 'Result' | 'Closed';

export type VerificationStatus = 'VERIFIED' | 'PENDING_REVIEW' | 'FLAGGED';

export interface NotificationVersionItem {
  id: string;
  versionNumber: number;
  changeType: 'INITIAL_NOTICE' | 'CORRIGENDUM' | 'DEADLINE_EXTENSION' | 'VACANCY_REVISION' | 'CANCELLATION';
  changeSummary: string;
  diffSummary?: string;
  previousDeadline?: string;
  newDeadline?: string;
  previousVacancies?: number;
  newVacancies?: number;
  createdAt: string;
  pdfUrl?: string;
}

export interface RecruitmentNotification {
  id: string;
  title: string;
  advertisementNumber: string;
  agency: string;
  category: string;
  releaseDate: string;
  applicationDeadline: string;
  totalVacancies: number;
  pdfUrl?: string;
  officialPortal: string;
  status: NotificationStatus;
  highlights: string[];
  eligibilitySnippet: string;
  feeStructure: string;
  isVerifiedOfficial: boolean;
  sourcePortalName: string;
  tags: string[];
  examDateTentative?: string;
  verificationStatus?: VerificationStatus;
  lastCheckedAt?: string;
  contentHash?: string;
  isSuperseded?: boolean;
  supersededByNoticeId?: string;
  versionHistory?: NotificationVersionItem[];
}
