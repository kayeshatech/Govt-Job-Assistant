import apiClient from './client';
import { GovernmentExam, ExamFilterCriteria } from '../types/exam';
import { SAMPLE_EXAMS } from '../fixtures/examsData';
import { ApiResponse } from '../types/common';

/**
 * Normalizes backend GovernmentExam response (snake_case) to frontend GovernmentExam interface (camelCase)
 */
export function mapBackendExam(raw: any): GovernmentExam {
  if (!raw) return raw;
  return {
    id: raw.slug || raw.id || '',
    title: raw.title || '',
    code: raw.code || '',
    conductingBody: raw.conducting_body || raw.conductingBody || 'Commission',
    level: raw.level || 'Central',
    category: raw.category || 'Civil Services & Administration',
    posts: raw.posts || raw.posts_summary || '',
    vacancies: typeof raw.vacancies === 'number' ? raw.vacancies : (raw.vacancies_count || 0),
    minQualification: raw.min_qualification || raw.minQualification || '',
    eligibleStreams: raw.eligible_streams || raw.eligibleStreams || [],
    ageLimit: raw.age_limit || raw.ageLimit || {
      min: 21,
      maxGeneral: 32,
      maxOBC: 35,
      maxSCST: 37,
      maxPwD: 42,
    },
    attempts: raw.attempts || {
      General: 6,
      OBC: 9,
      SCST: 'Unlimited',
      PwD: 9,
    },
    payScale: raw.pay_scale || raw.pay_level || 'Level 10 (₹56,100 - ₹1,77,500)',
    payLevel: raw.pay_level || raw.payLevel || 'Level 10',
    salaryBasic: raw.salary_basic || '₹56,100',
    salaryGross: raw.salary_gross || raw.salaryGross || '₹80,000/month',
    applicationFee: raw.application_fee || raw.applicationFee || '₹100',
    notificationDate: raw.notification_date || raw.release_date || '2026-02-01',
    lastDateToApply: raw.last_date_to_apply || raw.lastDateToApply || '2026-03-31',
    prelimsDate: raw.prelims_date || raw.prelimsDate || '2026-06-01',
    mainsDate: raw.mains_date || raw.mainsDate,
    status: raw.status || 'Upcoming',
    officialWebsite: raw.official_website || raw.officialWebsite || 'https://upsc.gov.in',
    aiMatchScore: raw.ai_match_score ?? raw.aiMatchScore ?? 88,
    negativeMarking: raw.negative_marking || raw.negativeMarking || '0.33 mark deduction',
    duration: raw.duration || raw.duration_info || '120 Minutes',
    relevanceForTech: raw.relevance_for_tech || raw.relevanceForTech || '',
    stages: (raw.stages || []).map((s: any) => ({
      name: s.name,
      details: s.details,
      marks: s.marks || s.total_marks,
      duration: s.duration || `${s.duration_minutes || 120} Minutes`,
    })),
    syllabusOverview: raw.syllabus_overview || raw.syllabusOverview || {
      prelims: [
        'General Studies Paper I (Indian Polity, Geography, History, Economy)',
        'Civil Services Aptitude Test - CSAT Paper II (Logical Reasoning, Data Interpretation)',
      ],
    },
  };
}

export const examService = {
  /**
   * Fetch all government examinations with fallback to sample fixture
   */
  async getExams(filters?: Partial<ExamFilterCriteria>): Promise<ApiResponse<GovernmentExam[]>> {
    try {
      const params: Record<string, any> = {};
      if (filters?.searchQuery) params.q = filters.searchQuery;
      if (filters?.category && filters.category !== 'all') params.category = filters.category;
      if (filters?.level && filters.level !== 'all') params.level = filters.level;
      if (filters?.sortBy) params.sort_by = filters.sortBy;

      const response = await apiClient.get('/exams', { params });
      const rawData = response.data?.data;
      const rawItems = Array.isArray(rawData?.items)
        ? rawData.items
        : Array.isArray(rawData)
        ? rawData
        : Array.isArray(response.data)
        ? response.data
        : [];

      if (rawItems.length > 0) {
        const mappedExams = rawItems.map(mapBackendExam);
        return {
          data: mappedExams,
          success: true,
          isSampleData: false,
          total: rawData?.total || mappedExams.length,
        };
      }
      throw new Error('No items from API, falling back to fixtures');
    } catch {
      // Graceful fallback for offline / mock mode
      let filtered = [...SAMPLE_EXAMS];

      if (filters?.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.title.toLowerCase().includes(query) ||
            e.code.toLowerCase().includes(query) ||
            e.conductingBody.toLowerCase().includes(query) ||
            e.posts.toLowerCase().includes(query)
        );
      }

      if (filters?.category && filters.category !== 'all') {
        filtered = filtered.filter((e) => e.category === filters.category);
      }

      if (filters?.level && filters.level !== 'all') {
        filtered = filtered.filter((e) => e.level === filters.level);
      }

      if (filters?.sortBy === 'vacancies') {
        filtered.sort((a, b) => b.vacancies - a.vacancies);
      } else if (filters?.sortBy === 'deadline') {
        filtered.sort((a, b) => new Date(a.lastDateToApply).getTime() - new Date(b.lastDateToApply).getTime());
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
   * Fetch single exam by ID or slug
   */
  async getExamById(idOrSlug: string): Promise<ApiResponse<GovernmentExam | null>> {
    try {
      const response = await apiClient.get(`/exams/${idOrSlug}`);
      const raw = response.data?.data || response.data;
      if (raw && (raw.title || raw.code)) {
        return {
          data: mapBackendExam(raw),
          success: true,
          isSampleData: false,
        };
      }
      throw new Error('Not found from API');
    } catch {
      const found = SAMPLE_EXAMS.find((e) => e.id === idOrSlug || e.code.toLowerCase() === idOrSlug.toLowerCase()) || null;
      return {
        data: found,
        success: !!found,
        isSampleData: true,
      };
    }
  },
};
