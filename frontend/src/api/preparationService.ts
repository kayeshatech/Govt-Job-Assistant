import { PreparationRoadmap, StudyMaterial, MockTestResult, DailyStudyTask } from '../types/preparation';
import { SAMPLE_ROADMAPS, SAMPLE_MOCK_TESTS, SAMPLE_DAILY_TASKS } from '../fixtures/roadmapData';
import { SAMPLE_MATERIALS } from '../fixtures/materialsData';
import { ApiResponse } from '../types/common';

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
};
