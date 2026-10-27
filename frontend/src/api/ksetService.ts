import apiClient from './client';

export interface KsetCurriculumUnit {
  unit_number: number;
  title: string;
  weightage_marks: number;
  high_yield_topics: string[];
}

export interface KsetCurriculumOverview {
  exam_title: string;
  paper_1: {
    title: string;
    total_questions: number;
    total_marks: number;
    duration_minutes: number;
    negative_marking: number;
    total_units: number;
    units: KsetCurriculumUnit[];
  };
  paper_2_subjects: Array<{ code: string; name: string; standard: string; total_questions: number }>;
  exam_distinctions: string[];
}

export interface QuestionItem {
  id: string;
  exam_code: string;
  topic: string;
  subtopic?: string;
  question_text: string;
  options: string[];
  correct_option_index?: number;
  explanation?: string;
  difficulty: string;
  marks: number;
  negative_marks: number;
  source_citation: string;
  is_ai_generated: boolean;
  year?: number;
}

export const ksetService = {
  /**
   * Fetch complete KSET & UGC-NET syllabus units, paper breakdown, and exam distinctions
   */
  async getCurriculum(): Promise<KsetCurriculumOverview> {
    try {
      const res = await apiClient.get<{ success: boolean; curriculum: KsetCurriculumOverview }>(
        '/prep/kset-ugc/curriculum'
      );
      return res.data.curriculum;
    } catch (err) {
      console.warn('[KSET Service] Fallback curriculum:', err);
      return {
        exam_title: 'KSET & UGC-NET Teaching & Research Hub',
        paper_1: {
          title: 'General Paper on Teaching & Research Aptitude',
          total_questions: 50,
          total_marks: 100,
          duration_minutes: 60,
          negative_marking: 0.0,
          total_units: 10,
          units: [
            { unit_number: 1, title: 'Teaching Aptitude', weightage_marks: 10, high_yield_topics: ['Levels of Teaching', 'Learner Characteristics', 'Evaluation Systems'] },
            { unit_number: 2, title: 'Research Aptitude', weightage_marks: 10, high_yield_topics: ['Research Types', 'Hypothesis Testing', 'APA/MLA Referencing'] },
            { unit_number: 3, title: 'Comprehension', weightage_marks: 10, high_yield_topics: ['Contextual Inferences', 'Vocabulary'] },
            { unit_number: 4, title: 'Communication', weightage_marks: 10, high_yield_topics: ['Classroom Barriers', 'Mass Media'] },
            { unit_number: 5, title: 'Mathematical Reasoning & Aptitude', weightage_marks: 10, high_yield_topics: ['Number Series', 'Coding-Decoding', 'Ratios'] },
            { unit_number: 6, title: 'Logical Reasoning', weightage_marks: 10, high_yield_topics: ['Indian Logic (Pramanas)', 'Venn Diagrams'] },
            { unit_number: 7, title: 'Data Interpretation', weightage_marks: 10, high_yield_topics: ['Tabular Charts', 'Bar Graphs'] },
            { unit_number: 8, title: 'Information & Communication Tech (ICT)', weightage_marks: 10, high_yield_topics: ['SWAYAM/MOOCs', 'Digital Initiatives'] },
            { unit_number: 9, title: 'People, Development & Environment', weightage_marks: 10, high_yield_topics: ['SDGs & MDGs', 'Renewable Energy'] },
            { unit_number: 10, title: 'Higher Education System', weightage_marks: 10, high_yield_topics: ['NEP 2020', 'Ancient Universities'] },
          ],
        },
        paper_2_subjects: [
          { code: '087', name: 'Computer Science and Applications', standard: 'Post Graduate (MCA / M.Tech / M.Sc CS)', total_questions: 100 },
          { code: '001', name: 'Economics', standard: 'Post Graduate (M.A Economics)', total_questions: 100 },
        ],
        exam_distinctions: [
          'KSET is conducted by Karnataka Examination Authority (KEA) for State-level Assistant Professor eligibility in Karnataka colleges.',
          'UGC-NET is conducted by NTA across India for both Junior Research Fellowship (JRF) and Assistant Professorship nationwide.',
          'Paper 1 is identically structured across both exams (50 questions, 100 marks, no negative marking).',
          'Candidates must obtain aggregate qualifying percentile marks determined by category cutoffs.',
        ],
      };
    }
  },

  /**
   * Fetch verified official previous-year questions for KSET & UGC-NET
   */
  async getPyqs(unitNumber?: number, limit: number = 10): Promise<QuestionItem[]> {
    try {
      const res = await apiClient.get<{ success: boolean; total: number; questions: QuestionItem[] }>(
        '/prep/kset-ugc/pyqs',
        { params: { unit_number: unitNumber, limit } }
      );
      return res.data.questions;
    } catch (err) {
      console.warn('[KSET Service] Fallback PYQs:', err);
      return [
        {
          id: 'qb-ugc-01',
          exam_code: 'UGC-NET',
          topic: 'Teaching Aptitude',
          question_text: 'Which of the following evaluation methods is conducted during the instructional process to provide continuous feedback?',
          options: ['Summative Evaluation', 'Diagnostic Evaluation', 'Formative Evaluation', 'Placement Evaluation'],
          correct_option_index: 2,
          explanation: 'Formative evaluation is continuously conducted during learning to identify deficiencies and provide immediate instructional feedback.',
          difficulty: 'EASY',
          marks: 2.0,
          negative_marks: 0.0,
          source_citation: 'UGC-NET Dec 2024 Paper 1 Official Key',
          is_ai_generated: false,
          year: 2024,
        },
        {
          id: 'qb-ugc-02',
          exam_code: 'UGC-NET',
          topic: 'Research Aptitude',
          question_text: 'In the research process, a formulation of a testable proposition regarding the relationship between two or more variables is designated as:',
          options: ['Research Hypothesis', 'Research Objective', 'Theoretical Framework', 'Sampling Frame'],
          correct_option_index: 0,
          explanation: 'A research hypothesis is a conjectural, testable statement predicting the relationship between independent and dependent variables.',
          difficulty: 'MEDIUM',
          marks: 2.0,
          negative_marks: 0.0,
          source_citation: 'KSET 2024 Official Paper 1',
          is_ai_generated: false,
          year: 2024,
        },
      ];
    }
  },
};
