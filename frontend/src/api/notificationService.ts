import apiClient from './client';
import { RecruitmentNotification } from '../types/notification';
import { SAMPLE_NOTIFICATIONS } from '../fixtures/notificationsData';
import { ApiResponse } from '../types/common';

export function mapBackendNotification(raw: any): RecruitmentNotification {
  if (!raw) return raw;
  return {
    id: raw.id,
    title: raw.title || '',
    advertisementNumber: raw.advertisement_number || raw.advertisementNumber || '',
    agency: raw.agency_name || raw.agency || '',
    category: raw.category_name || raw.category || '',
    releaseDate: raw.release_date || raw.releaseDate || '',
    applicationDeadline: raw.application_deadline || raw.applicationDeadline || '',
    totalVacancies: typeof raw.total_vacancies === 'number' ? raw.total_vacancies : (raw.totalVacancies || 0),
    pdfUrl: raw.official_pdf_url || raw.pdfUrl,
    officialPortal: raw.official_portal || raw.officialPortal || '',
    status: raw.status || 'Active',
    highlights: raw.highlights || [],
    eligibilitySnippet: raw.eligibility_snippet || raw.eligibilitySnippet || '',
    feeStructure: raw.fee_structure || raw.feeStructure || '₹100',
    isVerifiedOfficial: raw.is_verified_official !== undefined ? raw.is_verified_official : (raw.isVerifiedOfficial ?? true),
    sourcePortalName: raw.source_portal_name || raw.sourcePortalName || 'Official Gazette',
    tags: raw.tags || [],
    examDateTentative: raw.tentative_exam_date || raw.examDateTentative,
  };
}

export const notificationService = {
  /**
   * Fetch recruitment notifications feed
   */
  async getNotifications(status?: string): Promise<ApiResponse<RecruitmentNotification[]>> {
    try {
      const response = await apiClient.get('/notifications', {
        params: status && status !== 'all' ? { status } : undefined,
      });
      const rawData = response.data?.data;
      const rawList = Array.isArray(rawData?.items)
        ? rawData.items
        : Array.isArray(rawData)
        ? rawData
        : Array.isArray(response.data)
        ? response.data
        : [];

      if (rawList.length > 0) {
        const mapped = rawList.map(mapBackendNotification);
        return {
          data: mapped,
          success: true,
          isSampleData: false,
          total: rawData?.total || mapped.length,
        };
      }
      throw new Error('No items returned from API');
    } catch {
      let filtered = [...SAMPLE_NOTIFICATIONS];
      if (status && status !== 'all') {
        filtered = filtered.filter((n) => n.status.toLowerCase() === status.toLowerCase());
      }
      return {
        data: filtered,
        success: true,
        isSampleData: true,
        total: filtered.length,
      };
    }
  },

  /**
   * Fetch single notification by ID or advertisement number
   */
  async getNotificationById(id: string): Promise<ApiResponse<RecruitmentNotification | null>> {
    try {
      const response = await apiClient.get(`/notifications/${id}`);
      const raw = response.data?.data || response.data;
      if (raw && raw.title) {
        return {
          data: mapBackendNotification(raw),
          success: true,
          isSampleData: false,
        };
      }
      throw new Error('Notification not found');
    } catch {
      const found = SAMPLE_NOTIFICATIONS.find((n) => n.id === id) || null;
      return {
        data: found,
        success: !!found,
        isSampleData: true,
      };
    }
  },
};
