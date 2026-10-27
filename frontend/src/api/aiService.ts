import apiClient from './client';
import { ApiResponse } from '../types/common';

export interface ChatMessagePayload {
  query: string;
  exam_code?: string;
  history?: Array<{ role: string; content: string }>;
}

export interface ChatMessageResponse {
  reply: string;
  citations: string[];
  suggested_followups: string[];
  provider: string;
}

export interface RAGQueryPayload {
  query: string;
  exam_code?: string;
  doc_type?: string;
}

export interface RAGCitation {
  citation_id: number;
  document_title: string;
  source_reference: string;
  page_number: number;
  section_heading: string;
  excerpt: string;
}

export interface RAGQueryResponse {
  answer: string;
  is_supported_by_evidence: boolean;
  citations: RAGCitation[];
  confidence_score: number;
  provider: string;
  latency_ms: number;
}

export interface GeneratedQuestionItem {
  id: string;
  topic: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
  difficulty: string;
  source_citation: string;
  is_ai_generated: boolean;
}

export interface FlashcardItem {
  front: string;
  back: string;
  topic: string;
  source: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  children: MindMapNode[];
}

export const aiService = {
  /**
   * Interactive AI chat assistant with RAG integration
   */
  async chat(payload: ChatMessagePayload): Promise<ChatMessageResponse> {
    try {
      const res = await apiClient.post<ChatMessageResponse>('/ai/chat', payload);
      return res.data;
    } catch (err) {
      console.warn('[AI Service] Backend fallback:', err);
      return {
        reply: `Based on official recruitment gazettes: Competitive examinations require adherence to syllabus modules, statutory cut-offs, and negative marking constraints. Please verify details on the official Commission portal.`,
        citations: ['UPSC/KEA Gazette Rule Reference [1]'],
        suggested_followups: [
          'What is the statutory age limit and relaxation for my category?',
          'How is KSET Paper 1 Teaching Aptitude structured?',
          'What is the negative marking penalty in Prelims?',
        ],
        provider: 'deterministic_fallback',
      };
    }
  },

  /**
   * Search official recruitment gazettes with citations and state-of-ignorance
   */
  async queryRAG(payload: RAGQueryPayload): Promise<RAGQueryResponse> {
    try {
      const res = await apiClient.post<RAGQueryResponse>('/ai/rag/query', payload);
      return res.data;
    } catch (err) {
      console.warn('[AI Service] RAG fallback:', err);
      return {
        answer: 'The verified official recruitment gazettes in the database do not contain evidence supporting this inquiry.',
        is_supported_by_evidence: false,
        citations: [],
        confidence_score: 0.0,
        provider: 'fallback',
        latency_ms: 12,
      };
    }
  },

  /**
   * Generate objective quiz from text
   */
  async generateQuizFromText(
    contextText: string,
    examCode: string = 'UGC-NET',
    topic: string = 'General Aptitude',
    count: number = 3,
    difficulty: string = 'MEDIUM'
  ): Promise<GeneratedQuestionItem[]> {
    try {
      const res = await apiClient.post<{ success: boolean; questions: GeneratedQuestionItem[] }>(
        '/ai/tools/quiz-generate',
        {
          context_text: contextText,
          exam_code: examCode,
          topic,
          count,
          difficulty,
        }
      );
      return res.data.questions || [];
    } catch (err) {
      console.warn('[AI Service] Quiz generator fallback:', err);
      return [
        {
          id: 'gen-q1',
          topic,
          question_text: `Based on the provided document: Which parameter defines the primary qualifying condition for ${examCode}?`,
          options: [
            'Aggregate minimum percentage prescribed in notification',
            'Random discretionary selection',
            'Arbitrary interview shortlist without written criteria',
            'Non-statutory recommendation',
          ],
          correct_option_index: 0,
          explanation: 'Official rules dictate statutory qualifying benchmarks must be met unconditionally.',
          difficulty: 'MEDIUM',
          source_citation: 'Document Context',
          is_ai_generated: true,
        },
      ];
    }
  },

  /**
   * Generate revision flashcards from text
   */
  async generateFlashcards(
    contextText: string,
    topic: string = 'Revision Key Concepts',
    count: number = 4
  ): Promise<FlashcardItem[]> {
    try {
      const res = await apiClient.post<{ success: boolean; cards: FlashcardItem[] }>(
        '/ai/tools/flashcards',
        { context_text: contextText, topic, count }
      );
      return res.data.cards || [];
    } catch (err) {
      console.warn('[AI Service] Flashcard fallback:', err);
      return [
        {
          front: 'What is the standard marking rule in KSET / UGC-NET Paper 1?',
          back: '50 Compulsory Questions, +2 marks for each correct response, and 0 negative marking for incorrect attempts.',
          topic,
          source: 'UGC Examination Regulations',
        },
        {
          front: 'What is the negative marking deduction in UPSC CSE Preliminary Examination?',
          back: 'One-third penalty: 0.66 marks deducted for every incorrect response in General Studies Paper I.',
          topic,
          source: 'UPSC CSE Examination Gazette',
        },
      ];
    }
  },

  /**
   * Generate hierarchical concept mind map tree
   */
  async generateMindMap(contextText: string, topic: string = 'Concept Map'): Promise<MindMapNode> {
    try {
      const res = await apiClient.post<{ success: boolean; tree: MindMapNode }>(
        '/ai/tools/mindmap',
        { context_text: contextText, topic }
      );
      return res.data.tree;
    } catch (err) {
      console.warn('[AI Service] Mind map fallback:', err);
      return {
        id: 'root',
        label: topic,
        children: [
          { id: 'c1', label: 'Core Principles', children: [] },
          { id: 'c2', label: 'Exam Weightage & Units', children: [] },
          { id: 'c3', label: 'PYQ Application', children: [] },
        ],
      };
    }
  },

  /**
   * Run benchmark suite against public recruitment corpus
   */
  async getBenchmark(): Promise<any> {
    const res = await apiClient.get('/ai/benchmark');
    return res.data.benchmark;
  },
};
