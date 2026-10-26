export type NotificationStatus = 'Active' | 'Upcoming' | 'Corrigendum' | 'Admit Card' | 'Result' | 'Closed';

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
}
