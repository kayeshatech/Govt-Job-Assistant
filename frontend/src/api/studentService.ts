import apiClient from './client';
import { StudentProfile, SavedApplication, ApplicationTrackingStatus } from '../types/student';
import { ApiResponse } from '../types/common';

const PROFILE_STORAGE_KEY = 'govexa_student_profile';
const SAVED_APPS_STORAGE_KEY = 'govexa_saved_applications';

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  id: 'aspirant-2026-demo',
  fullName: 'Priya Sharma',
  email: 'priya.sharma@aspirant.in',
  dateOfBirth: '2001-08-15',
  age: 24,
  gender: 'Female',
  category: 'General / UR',
  domicileState: 'Karnataka',
  isPwD: false,
  educationLevel: 'Bachelor of Engineering / B.Tech',
  majorStream: 'Computer Science & Engineering',
  graduationYear: 2024,
  graduationPercentage: 74.5,
  targetCategories: ['Civil Services', 'Engineering & PSU', 'Teaching & Lectureship'],
  targetExams: ['upsc-cse-2026', 'isro-scientist-sc-2026', 'kset-ugc-net-2026'],
  preferredDailyStudyHours: 6,
  isOnboarded: true,
  createdAt: '2026-01-10T08:30:00Z',
};

const DEFAULT_SAVED_APPS: SavedApplication[] = [
  {
    id: 'app-01',
    examId: 'upsc-cse-2026',
    examTitle: 'UPSC Civil Services Examination (CSE) 2026',
    conductingBody: 'Union Public Service Commission (UPSC)',
    registrationNumber: 'UPSC-2026-894102',
    status: 'Applied & Fee Paid',
    applicationDate: '2026-02-16',
    examDate: '2026-05-24',
    notes: 'Prelims exam center allotted at Bengaluru North Center 04.',
    savedAt: '2026-02-15T10:00:00Z',
  },
  {
    id: 'app-02',
    examId: 'kset-ugc-net-2026',
    examTitle: 'KSET / UGC-NET (Lectureship & JRF) 2026',
    conductingBody: 'KEA & NTA',
    status: 'Draft / Planning',
    notes: 'Master degree mark sheets verified. Paper 1 preparation ongoing.',
    savedAt: '2026-02-18T14:30:00Z',
  },
];

export function mapBackendSavedExam(raw: any): SavedApplication {
  return {
    id: raw.id,
    examId: raw.exam_id || raw.examId,
    examTitle: raw.exam_title || raw.examTitle || 'Government Examination',
    conductingBody: raw.conducting_body || raw.conductingBody || 'Commission',
    status: (raw.status || 'Draft / Planning') as ApplicationTrackingStatus,
    registrationNumber: raw.registration_number || raw.registrationNumber,
    rollNumber: raw.roll_number || raw.rollNumber,
    applicationDate: raw.application_date || raw.applicationDate,
    examDate: raw.exam_date || raw.examDate,
    notes: raw.notes,
    savedAt: raw.created_at || new Date().toISOString(),
  };
}

export const studentService = {
  getProfile(): ApiResponse<StudentProfile> {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      try {
        return { data: JSON.parse(raw), success: true, isSampleData: true };
      } catch {
        // Fall back to default
      }
    }
    return { data: DEFAULT_STUDENT_PROFILE, success: true, isSampleData: true };
  },

  async fetchProfileFromApi(): Promise<ApiResponse<StudentProfile>> {
    try {
      const response = await apiClient.get('/auth/profile');
      const raw = response.data?.data;
      if (raw) {
        const mapped: StudentProfile = {
          id: raw.id,
          fullName: raw.full_name || 'Aspirant',
          email: raw.email,
          dateOfBirth: raw.date_of_birth || '2001-08-15',
          age: raw.age || 24,
          gender: raw.gender || 'Female',
          category: raw.category || 'General / UR',
          domicileState: raw.domicile_state || 'Karnataka',
          isPwD: Boolean(raw.is_pwd),
          pwdPercentage: raw.pwd_percentage,
          educationLevel: raw.education_level || 'Bachelor of Engineering / B.Tech',
          majorStream: raw.major_stream || 'Computer Science & Engineering',
          graduationYear: raw.graduation_year || 2024,
          graduationPercentage: raw.graduation_percentage || 74.5,
          targetCategories: raw.target_categories || [],
          targetExams: raw.target_exam_codes || [],
          preferredDailyStudyHours: raw.preferred_daily_study_hours || 6,
          isOnboarded: Boolean(raw.is_onboarded),
          createdAt: raw.created_at || new Date().toISOString(),
        };
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(mapped));
        return { data: mapped, success: true, isSampleData: false };
      }
      throw new Error('No profile data returned');
    } catch {
      return studentService.getProfile();
    }
  },

  updateProfile(profile: Partial<StudentProfile>): ApiResponse<StudentProfile> {
    const current = studentService.getProfile().data;
    const updated = { ...current, ...profile };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));

    // Async sync with FastAPI backend
    apiClient.put('/auth/profile', {
      full_name: profile.fullName,
      date_of_birth: profile.dateOfBirth,
      gender: profile.gender,
      category: profile.category,
      domicile_state: profile.domicileState,
      is_pwd: profile.isPwD,
      pwd_percentage: profile.pwdPercentage,
      education_level: profile.educationLevel,
      major_stream: profile.majorStream,
      graduation_year: profile.graduationYear,
      graduation_percentage: profile.graduationPercentage,
      preferred_daily_study_hours: profile.preferredDailyStudyHours,
      is_onboarded: profile.isOnboarded,
      target_categories: profile.targetCategories,
      target_exam_codes: profile.targetExams,
    }).catch((err) => {
      console.warn('[Govexa API] Background profile sync failed, local state preserved:', err.message);
    });

    return { data: updated, success: true, isSampleData: true };
  },

  getSavedApplications(): ApiResponse<SavedApplication[]> {
    const raw = localStorage.getItem(SAVED_APPS_STORAGE_KEY);
    if (raw) {
      try {
        return { data: JSON.parse(raw), success: true, isSampleData: true };
      } catch {
        // Fall back to default
      }
    }
    localStorage.setItem(SAVED_APPS_STORAGE_KEY, JSON.stringify(DEFAULT_SAVED_APPS));
    return { data: DEFAULT_SAVED_APPS, success: true, isSampleData: true };
  },

  async fetchSavedApplicationsFromApi(): Promise<ApiResponse<SavedApplication[]>> {
    try {
      const response = await apiClient.get('/saved-exams');
      const rawList = response.data?.data;
      if (Array.isArray(rawList)) {
        const mappedList = rawList.map(mapBackendSavedExam);
        localStorage.setItem(SAVED_APPS_STORAGE_KEY, JSON.stringify(mappedList));
        return { data: mappedList, success: true, isSampleData: false };
      }
      throw new Error('Invalid format from API');
    } catch {
      return studentService.getSavedApplications();
    }
  },

  saveApplication(application: SavedApplication): ApiResponse<SavedApplication[]> {
    const current = studentService.getSavedApplications().data;
    const index = current.findIndex((a) => a.id === application.id || a.examId === application.examId);
    let updated: SavedApplication[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = { ...updated[index], ...application };
    } else {
      updated = [application, ...current];
    }
    localStorage.setItem(SAVED_APPS_STORAGE_KEY, JSON.stringify(updated));

    // Async sync with FastAPI backend
    apiClient.post('/saved-exams', {
      exam_id: application.examId,
      status: application.status,
      registration_number: application.registrationNumber,
      roll_number: application.rollNumber,
      notes: application.notes,
    }).catch((err) => {
      console.warn('[Govexa API] Background saved exam sync failed, local state preserved:', err.message);
    });

    return { data: updated, success: true, isSampleData: true };
  },

  removeApplication(idOrExamId: string): ApiResponse<SavedApplication[]> {
    const current = studentService.getSavedApplications().data;
    const updated = current.filter((a) => a.id !== idOrExamId && a.examId !== idOrExamId);
    localStorage.setItem(SAVED_APPS_STORAGE_KEY, JSON.stringify(updated));

    // Async sync with FastAPI backend
    apiClient.delete(`/saved-exams/${idOrExamId}`).catch((err) => {
      console.warn('[Govexa API] Background remove exam sync failed, local state preserved:', err.message);
    });

    return { data: updated, success: true, isSampleData: true };
  },
};
