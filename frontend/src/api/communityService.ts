import { apiClient } from './client';

export interface StudyGroup {
  id: string;
  name: string;
  exam_code: string;
  description: string;
  category: string;
  member_count: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface GroupDiscussionMessage {
  id: string;
  group_id: string;
  user_id: string;
  author_name: string;
  content: string;
  is_verified_mentor_answer: boolean;
  likes_count: number;
  created_at: string;
}

export interface MentorProfile {
  id: string;
  user_id: string;
  full_name: string;
  designation: string;
  specialization: string;
  institution: string;
  is_verified: boolean;
  total_answers_resolved: number;
  rating: number;
}

export interface MentorDashboardData {
  mentor_profile: MentorProfile;
  assigned_study_groups: StudyGroup[];
  unresolved_questions_count: number;
  recent_student_queries: GroupDiscussionMessage[];
}

export const communityService = {
  getStudyGroups: async (examCode?: string): Promise<StudyGroup[]> => {
    const params = examCode && examCode !== 'all' ? { exam_code: examCode } : {};
    const res = await apiClient.get<StudyGroup[]>('/community/groups', { params });
    return res.data;
  },

  createStudyGroup: async (data: {
    name: string;
    exam_code: string;
    description: string;
    category?: string;
  }): Promise<StudyGroup> => {
    const res = await apiClient.post<StudyGroup>('/community/groups', data);
    return res.data;
  },

  getGroupMessages: async (groupId: string, limit = 50): Promise<GroupDiscussionMessage[]> => {
    const res = await apiClient.get<GroupDiscussionMessage[]>(`/community/groups/${groupId}/messages`, {
      params: { limit },
    });
    return res.data;
  },

  postGroupMessage: async (groupId: string, content: string): Promise<GroupDiscussionMessage> => {
    const res = await apiClient.post<GroupDiscussionMessage>(`/community/groups/${groupId}/messages`, {
      content,
    });
    return res.data;
  },

  getMentors: async (): Promise<MentorProfile[]> => {
    const res = await apiClient.get<MentorProfile[]>('/community/mentors');
    return res.data;
  },

  getMentorDashboard: async (userId?: string): Promise<MentorDashboardData> => {
    const params = userId ? { user_id: userId } : {};
    const res = await apiClient.get<MentorDashboardData>('/community/mentor-dashboard', { params });
    return res.data;
  },
};

export default communityService;
