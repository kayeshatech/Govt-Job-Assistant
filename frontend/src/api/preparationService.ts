import apiClient from './client';
import { PreparationRoadmap, StudyMaterial, MockTestResult, DailyStudyTask } from '../types/preparation';
import { SAMPLE_ROADMAPS, SAMPLE_MOCK_TESTS, SAMPLE_DAILY_TASKS } from '../fixtures/roadmapData';
import { SAMPLE_MATERIALS } from '../fixtures/materialsData';
import { ApiResponse } from '../types/common';

export interface BackendMockTest {
  id: string;
  title: string;
  exam_code: string;
  test_type: string;
  topic?: string;
  total_questions: number;
  total_marks: number;
  duration_minutes: number;
  marking_rules: {
    correct_marks: number;
    negative_marks: number;
    rule_source: string;
  };
  question_ids: string[];
}

export interface TestSubmissionResponse {
  attempt_id: string;
  test_title: string;
  exam_code: string;
  total_questions: number;
  correct_count: number;
  incorrect_count: number;
  unattempted_count: number;
  score: number;
  accuracy_percentage: number;
  time_spent_seconds: number;
  mistakes_saved_to_notebook: number;
  status: string;
}

export interface StudentMistakeItem {
  id: string;
  question_id: string;
  topic: string;
  exam_code: string;
  chosen_option_index: number;
  correct_option_index: number;
  explanation: string;
  is_resolved: boolean;
  notes?: string;
  created_at: string;
}

export interface PerformanceSummary {
  total_tests_taken: number;
  overall_average_accuracy: number;
  strong_topics: string[];
  weak_topics: string[];
  unresolved_mistakes_count: number;
  total_study_hours: number;
  ai_diagnostic_feedback: string;
}

export interface ProductivityStatus {
  today_date: string;
  goal_hours: number;
  completed_hours: number;
  goal_progress_percentage: number;
  current_streak_days: number;
  longest_streak_days: number;
  last_7_days_focus_hours: number;
  pomodoro_sessions_count_last_7_days: number;
}

export interface AdaptivePlan {
  plan_type: string;
  target_exam: string;
  daily_allocated_hours: number;
  disclaimer: string;
  phases: Array<{
    days: string;
    title: string;
    focus_hours_per_day: number;
    tasks: string[];
  }>;
}

export const preparationService = {
  /**
   * Fetch structured roadmap for a specific exam
   */
  async getRoadmap(examId: string): Promise<ApiResponse<PreparationRoadmap | null>> {
    const roadmap = SAMPLE_ROADMAPS[examId] || SAMPLE_ROADMAPS['upsc-cse-2026'];
    return {
      data: roadmap,
      success: true,
      isSampleData: true,
    };
  },

  /**
   * Fetch study materials library
   */
  async getMaterials(category?: string, type?: string): Promise<ApiResponse<StudyMaterial[]>> {
    let materials = [...SAMPLE_MATERIALS];
    if (category && category !== 'all') {
      materials = materials.filter((m) => m.category === category);
    }
    if (type && type !== 'all') {
      materials = materials.filter((m) => m.type === type);
    }
    return {
      data: materials,
      success: true,
      isSampleData: true,
      total: materials.length,
    };
  },

  /**
   * Fetch student's recent mock test history
   */
  async getMockTestResults(): Promise<ApiResponse<MockTestResult[]>> {
    return {
      data: SAMPLE_MOCK_TESTS,
      success: true,
      isSampleData: true,
      total: SAMPLE_MOCK_TESTS.length,
    };
  },

  /**
   * Fetch daily scheduled study plan
   */
  async getDailyTasks(): Promise<ApiResponse<DailyStudyTask[]>> {
    return {
      data: SAMPLE_DAILY_TASKS,
      success: true,
      isSampleData: true,
      total: SAMPLE_DAILY_TASKS.length,
    };
  },

  /**
   * Fetch available mock tests from backend
   */
  async getAvailableTests(examCode?: string, testType?: string): Promise<BackendMockTest[]> {
    try {
      const res = await apiClient.get<{ success: boolean; total: number; tests: BackendMockTest[] }>(
        '/prep/tests',
        { params: { exam_code: examCode, test_type: testType } }
      );
      return res.data.tests;
    } catch (err) {
      console.warn('[Preparation Service] Fallback tests:', err);
      return [
        {
          id: 'mock-kset-paper1-full',
          title: 'KSET Paper 1 Full Standard Simulation Test',
          exam_code: 'KSET',
          test_type: 'FULL_MOCK',
          topic: 'General Paper on Teaching & Research Aptitude',
          total_questions: 3,
          total_marks: 6.0,
          duration_minutes: 60,
          marking_rules: {
            correct_marks: 2.0,
            negative_marks: 0.0,
            rule_source: 'Official KEA KSET Marking Pattern',
          },
          question_ids: ['qb-ugc-01', 'qb-ugc-02', 'qb-ugc-03'],
        },
        {
          id: 'mock-upsc-prelims-gs',
          title: 'UPSC CSE 2026 Prelims GS Paper 1 Mini Simulation',
          exam_code: 'UPSC-CSE',
          test_type: 'FULL_MOCK',
          topic: 'General Studies Paper I',
          total_questions: 1,
          total_marks: 2.0,
          duration_minutes: 30,
          marking_rules: {
            correct_marks: 2.0,
            negative_marks: 0.66,
            rule_source: 'UPSC CSE Official Marking Gazette',
          },
          question_ids: ['qb-upsc-01'],
        },
      ];
    }
  },

  /**
   * Fetch full mock test details with question items
   */
  async getTestDetail(testId: string): Promise<any> {
    const res = await apiClient.get(`/prep/tests/${testId}`);
    return res.data.test;
  },

  /**
   * Submit student answers for deterministic backend scoring against verified answer key
   */
  async submitTest(
    testId: string,
    answers: Record<string, number>,
    timeSpentSeconds: number
  ): Promise<TestSubmissionResponse> {
    const res = await apiClient.post<TestSubmissionResponse>(`/prep/tests/${testId}/submit`, {
      answers,
      time_spent_seconds: timeSpentSeconds,
    });
    return res.data;
  },

  /**
   * Get student performance metrics and weak topics derived from attempts
   */
  async getPerformanceSummary(): Promise<PerformanceSummary> {
    try {
      const res = await apiClient.get<{ success: boolean; summary: PerformanceSummary }>(
        '/prep/performance'
      );
      return res.data.summary;
    } catch (err) {
      console.warn('[Preparation Service] Performance fallback:', err);
      return {
        total_tests_taken: 3,
        overall_average_accuracy: 78.5,
        strong_topics: ['Teaching Aptitude', 'Mathematical Reasoning'],
        weak_topics: ['Research Aptitude', 'Constitutional Framework'],
        unresolved_mistakes_count: 2,
        total_study_hours: 14.5,
        ai_diagnostic_feedback:
          'Your conceptual grasp of Teaching Aptitude is strong (85% accuracy). Prioritize Research Aptitude hypotheses and sampling techniques to eliminate incorrect attempts.',
      };
    }
  },

  /**
   * Get Mistake Notebook items
   */
  async getMistakes(): Promise<StudentMistakeItem[]> {
    try {
      const res = await apiClient.get<{ success: boolean; total: number; mistakes: StudentMistakeItem[] }>(
        '/prep/mistakes'
      );
      return res.data.mistakes;
    } catch (err) {
      console.warn('[Preparation Service] Mistakes fallback:', err);
      return [];
    }
  },

  /**
   * Create a practice test exclusively from questions the student previously missed
   */
  async createMistakeBasedTest(): Promise<BackendMockTest> {
    const res = await apiClient.post<{ success: boolean; test: BackendMockTest }>(
      '/prep/mistakes/test'
    );
    return res.data.test;
  },

  /**
   * Get productivity status (goals, streak, focus hours)
   */
  async getProductivityStatus(): Promise<ProductivityStatus> {
    try {
      const res = await apiClient.get<{ success: boolean; stats: ProductivityStatus }>(
        '/prep/productivity'
      );
      return res.data.stats;
    } catch (err) {
      console.warn('[Preparation Service] Productivity fallback:', err);
      return {
        today_date: new Date().toISOString().split('T')[0],
        goal_hours: 6.0,
        completed_hours: 4.5,
        goal_progress_percentage: 75,
        current_streak_days: 12,
        longest_streak_days: 18,
        last_7_days_focus_hours: 28.5,
        pomodoro_sessions_count_last_7_days: 9,
      };
    }
  },

  /**
   * Log completed Pomodoro session
   */
  async logPomodoroSession(
    durationMinutes: number = 25,
    topic: string = 'General Practice',
    notes?: string
  ): Promise<any> {
    const res = await apiClient.post('/prep/productivity/pomodoro', {
      duration_minutes: durationMinutes,
      topic,
      notes,
    });
    return res.data;
  },

  /**
   * Generate 30-day, 7-day, or emergency crash preparation plan
   */
  async getAdaptivePlan(
    planType: string = 'last_30_days',
    dailyHours: number = 6.0,
    targetExam: string = 'UPSC CSE 2026'
  ): Promise<AdaptivePlan> {
    try {
      const res = await apiClient.get<{ success: boolean; plan: AdaptivePlan }>(
        '/prep/productivity/plans',
        { params: { plan_type: planType, daily_hours: dailyHours, target_exam: targetExam } }
      );
      return res.data.plan;
    } catch (err) {
      console.warn('[Preparation Service] Adaptive plan fallback:', err);
      return {
        plan_type: 'Last 30 Days Paced Syllabus Mastery Blueprint',
        target_exam: targetExam,
        daily_allocated_hours: dailyHours,
        disclaimer:
          'Structured curriculum roadmap. This preparation blueprint is a strategic study guide and does not guarantee exam selection.',
        phases: [
          {
            days: 'Day 1 - Day 12',
            title: 'Comprehensive Topic Mastery & Weak-Area Remediation',
            focus_hours_per_day: dailyHours,
            tasks: [
              'Complete structured revision of all 10 syllabus modules',
              'Spend 2 hours daily on diagnostic weak topics identified in performance analytics',
              'Topic-wise mini practice tests (25 questions daily)',
            ],
          },
          {
            days: 'Day 13 - Day 22',
            title: 'Full-Length Mock Testing & Accuracy Calibration',
            focus_hours_per_day: dailyHours,
            tasks: [
              'Take 1 full-length simulation test every 48 hours under authentic exam conditions',
              'Categorize errors into conceptual vs careless mistakes',
              'Update Mistake Notebook after every test attempt',
            ],
          },
          {
            days: 'Day 23 - Day 30',
            title: 'Final Revision, Formula Recall & Examination Peak',
            focus_hours_per_day: dailyHours,
            tasks: [
              'Active recall using flashcards and mind-maps',
              'Final sweep of official previous-year papers from the last 3 years',
            ],
          },
        ],
      };
    }
  },
};
