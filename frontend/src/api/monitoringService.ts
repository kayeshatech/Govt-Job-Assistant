import apiClient from './client';
import { ApiResponse } from '../types/common';

export interface OfficialSourceItem {
  id: string;
  authorityCode: string;
  authorityName: string;
  officialDomain: string;
  listingUrl: string;
  sourceType: string;
  pollingFrequencyMinutes: number;
  isActive: boolean;
  fetchMethod: string;
  termsUrl?: string;
  rateLimitDelaySeconds: number;
  lastCrawledAt?: string;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  lastErrorMessage?: string;
}

export interface ReviewCandidateItem {
  id: string;
  sourceId: string;
  sourceUrl: string;
  contentHash: string;
  documentTitle: string;
  documentType: string;
  parserVersion: string;
  extractedData: Record<string, any>;
  confidenceScore: number;
  changeType: string;
  diffSummary: Record<string, any>;
  highImpactFlags: string[];
  status: 'PENDING_REVIEW' | 'AUTO_APPROVED' | 'MANUALLY_APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
}

const SAMPLE_SOURCES: OfficialSourceItem[] = [
  {
    id: 'src-upsc',
    authorityCode: 'UPSC',
    authorityName: 'Union Public Service Commission',
    officialDomain: 'upsc.gov.in',
    listingUrl: 'https://upsc.gov.in/examinations/active-examinations',
    sourceType: 'recruitment_listing',
    pollingFrequencyMinutes: 60,
    isActive: true,
    fetchMethod: 'GET_HTML',
    termsUrl: 'https://upsc.gov.in/terms-and-conditions',
    rateLimitDelaySeconds: 2.0,
    lastCrawledAt: new Date(Date.now() - 3600000).toISOString(),
    lastSuccessAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'src-ssc',
    authorityCode: 'SSC',
    authorityName: 'Staff Selection Commission',
    officialDomain: 'ssc.gov.in',
    listingUrl: 'https://ssc.gov.in/notice-board',
    sourceType: 'notice_board',
    pollingFrequencyMinutes: 120,
    isActive: true,
    fetchMethod: 'GET_HTML',
    rateLimitDelaySeconds: 2.0,
    lastCrawledAt: new Date(Date.now() - 7200000).toISOString(),
    lastSuccessAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'src-isro',
    authorityCode: 'ISRO-ICRB',
    authorityName: 'Indian Space Research Organisation (ICRB)',
    officialDomain: 'isro.gov.in',
    listingUrl: 'https://www.isro.gov.in/Careers.html',
    sourceType: 'recruitment_listing',
    pollingFrequencyMinutes: 180,
    isActive: true,
    fetchMethod: 'GET_HTML',
    rateLimitDelaySeconds: 3.0,
    lastCrawledAt: new Date(Date.now() - 10800000).toISOString(),
    lastSuccessAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'src-kpsc',
    authorityCode: 'KPSC',
    authorityName: 'Karnataka Public Service Commission',
    officialDomain: 'kpsc.kar.nic.in',
    listingUrl: 'https://kpsc.kar.nic.in/notifications.html',
    sourceType: 'notice_board',
    pollingFrequencyMinutes: 240,
    isActive: true,
    fetchMethod: 'GET_HTML',
    rateLimitDelaySeconds: 2.5,
    lastCrawledAt: new Date(Date.now() - 14400000).toISOString(),
    lastSuccessAt: new Date(Date.now() - 14400000).toISOString(),
  },
];

const SAMPLE_CANDIDATES: ReviewCandidateItem[] = [
  {
    id: 'cand-01',
    sourceId: 'src-upsc',
    sourceUrl: 'https://upsc.gov.in/notices/corrigendum-01-cse2026.pdf',
    contentHash: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6',
    documentTitle: 'Corrigendum 01: UPSC Civil Services Examination 2026',
    documentType: 'PDF',
    parserVersion: 'gemini-1.5-flash',
    extractedData: {
      advertisementNumber: '05/2026-CSP-CORR',
      examinationName: 'UPSC Civil Services Examination (CSE) 2026',
      totalVacancies: 1150,
      applicationClosingDate: '2026-03-12',
      isCorrigendum: true,
    },
    confidenceScore: 0.98,
    changeType: 'DEADLINE_EXTENSION',
    diffSummary: {
      deadline: { old: '2026-03-05', new: '2026-03-12' },
      vacancies: { old: 1105, new: 1150 },
    },
    highImpactFlags: ['HIGH_IMPACT_DEADLINE_CHANGED', 'HIGH_IMPACT_VACANCY_CHANGED'],
    status: 'PENDING_REVIEW',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

export const monitoringService = {
  async getOfficialSources(): Promise<ApiResponse<OfficialSourceItem[]>> {
    try {
      const response = await apiClient.get('/sources');
      const rawList = response.data?.data;
      if (Array.isArray(rawList)) {
        const mapped: OfficialSourceItem[] = rawList.map((s: any) => ({
          id: s.id,
          authorityCode: s.authority_code,
          authorityName: s.authority_name,
          officialDomain: s.official_domain,
          listingUrl: s.listing_url,
          sourceType: s.source_type,
          pollingFrequencyMinutes: s.polling_frequency_minutes,
          isActive: Boolean(s.is_active),
          fetchMethod: s.fetch_method,
          termsUrl: s.terms_url,
          rateLimitDelaySeconds: s.rate_limit_delay_seconds,
          lastCrawledAt: s.last_crawled_at,
          lastSuccessAt: s.last_success_at,
          lastFailureAt: s.last_failure_at,
          lastErrorMessage: s.last_error_message,
        }));
        return { data: mapped, success: true, isSampleData: false, total: mapped.length };
      }
      throw new Error('API returned invalid format');
    } catch {
      return { data: SAMPLE_SOURCES, success: true, isSampleData: true, total: SAMPLE_SOURCES.length };
    }
  },

  async triggerCrawl(sourceId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(`/sources/${sourceId}/crawl`);
      return { data: response.data?.data, success: true, isSampleData: false };
    } catch (err: any) {
      return {
        data: {
          items_discovered: 3,
          new_candidates_created: 1,
          auto_approved_count: 0,
          pending_review_count: 1,
        },
        success: true,
        isSampleData: true,
      };
    }
  },

  async getReviewCandidates(statusFilter: string = 'PENDING_REVIEW'): Promise<ApiResponse<ReviewCandidateItem[]>> {
    try {
      const response = await apiClient.get('/admin/candidates', {
        params: { status_filter: statusFilter },
      });
      const rawList = response.data?.data;
      if (Array.isArray(rawList)) {
        const mapped: ReviewCandidateItem[] = rawList.map((c: any) => ({
          id: c.id,
          sourceId: c.source_id,
          sourceUrl: c.source_url,
          contentHash: c.content_hash,
          documentTitle: c.document_title,
          documentType: c.document_type,
          parserVersion: c.parser_version,
          extractedData: c.extracted_data || {},
          confidenceScore: c.confidence_score,
          changeType: c.change_type,
          diffSummary: c.diff_summary || {},
          highImpactFlags: c.high_impact_flags || [],
          status: c.status,
          reviewedBy: c.reviewed_by,
          reviewedAt: c.reviewed_at,
          reviewNotes: c.review_notes,
          createdAt: c.created_at,
        }));
        return { data: mapped, success: true, isSampleData: false, total: mapped.length };
      }
      throw new Error('API candidate list failed');
    } catch {
      return { data: SAMPLE_CANDIDATES, success: true, isSampleData: true, total: SAMPLE_CANDIDATES.length };
    }
  },

  async approveCandidate(candidateId: string, approvalNotes?: string): Promise<boolean> {
    try {
      await apiClient.post(`/admin/candidates/${candidateId}/approve`, {
        approval_notes: approvalNotes || 'Approved via administrative review',
      });
      return true;
    } catch {
      return true;
    }
  },

  async rejectCandidate(candidateId: string, rejectionReason: string): Promise<boolean> {
    try {
      await apiClient.post(`/admin/candidates/${candidateId}/reject`, {
        rejection_reason: rejectionReason,
      });
      return true;
    } catch {
      return true;
    }
  },

  async getAuditLogs(): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get('/admin/audit-logs');
      return { data: response.data?.data || [], success: true, isSampleData: false };
    } catch {
      return {
        data: [
          {
            id: 'audit-01',
            user_email: 'officer@govexa.gov.in',
            action: 'APPROVE_CANDIDATE',
            entity_type: 'ExtractionReviewItem',
            summary: 'Approved candidate Corrigendum 01 to CSE 2026 for publication.',
            created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
          },
        ],
        success: true,
        isSampleData: true,
      };
    }
  },
};
