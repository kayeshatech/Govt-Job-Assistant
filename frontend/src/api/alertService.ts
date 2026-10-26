import apiClient from './client';
import { ApiResponse } from '../types/common';

export interface StudentAlertItem {
  id: string;
  studentId: string;
  alertType: 'MATCHING_EXAM' | 'NEW_NOTIFICATION' | 'CLOSING_SOON' | 'CORRIGENDUM_ALERT' | 'ADMIT_CARD';
  title: string;
  message: string;
  referenceId?: string;
  referenceType?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isRead: boolean;
  isDismissed: boolean;
  emailDispatched: boolean;
  createdAt: string;
}

export interface AlertPreferences {
  alertNewExams: boolean;
  alertDeadlineReminders: boolean;
  alertExamUpdates: boolean;
  alertCorrigendum: boolean;
  emailNotificationOptIn: boolean;
}

const SAMPLE_ALERTS: StudentAlertItem[] = [
  {
    id: 'alert-01',
    studentId: 'aspirant-2026-demo',
    alertType: 'CLOSING_SOON',
    title: 'UPSC CSE 2026: Closing in 3 Days',
    message: 'Official registration deadline closes on 05 March 2026. Complete your fee payment on upsc.gov.in.',
    referenceId: 'upsc-cse-2026',
    referenceType: 'exam',
    priority: 'HIGH',
    isRead: false,
    isDismissed: false,
    emailDispatched: true,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'alert-02',
    studentId: 'aspirant-2026-demo',
    alertType: 'CORRIGENDUM_ALERT',
    title: 'Corrigendum Notice: SSC CGL 2026',
    message: 'Staff Selection Commission revised Tier-I scheduling and added 450 regional posts.',
    referenceId: 'ssc-cgl-2026',
    referenceType: 'exam',
    priority: 'MEDIUM',
    isRead: false,
    isDismissed: false,
    emailDispatched: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'alert-03',
    studentId: 'aspirant-2026-demo',
    alertType: 'MATCHING_EXAM',
    title: 'New Eligibility Match: ISRO ICRB Scientist SC',
    message: 'Your B.Tech degree and aggregate marks qualify you for 326 Group A engineering posts.',
    referenceId: 'isro-scientist-sc-2026',
    referenceType: 'exam',
    priority: 'MEDIUM',
    isRead: true,
    isDismissed: false,
    emailDispatched: false,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

export const alertService = {
  async getAlerts(): Promise<ApiResponse<StudentAlertItem[]>> {
    try {
      const response = await apiClient.get('/alerts');
      const rawList = response.data?.data;
      if (Array.isArray(rawList)) {
        const mapped: StudentAlertItem[] = rawList.map((a: any) => ({
          id: a.id,
          studentId: a.student_id,
          alertType: a.alert_type,
          title: a.title,
          message: a.message,
          referenceId: a.reference_id,
          referenceType: a.reference_type,
          priority: a.priority,
          isRead: Boolean(a.is_read),
          isDismissed: Boolean(a.is_dismissed),
          emailDispatched: Boolean(a.email_dispatched),
          createdAt: a.created_at,
        }));
        return { data: mapped, success: true, isSampleData: false, total: mapped.length };
      }
      throw new Error('Invalid format from API');
    } catch {
      return { data: SAMPLE_ALERTS, success: true, isSampleData: true, total: SAMPLE_ALERTS.length };
    }
  },

  async markAsRead(alertIds?: string[], markAll: boolean = false): Promise<boolean> {
    try {
      await apiClient.put('/alerts/read', { alert_ids: alertIds, mark_all: markAll });
      return true;
    } catch {
      return true;
    }
  },

  async dismissAlert(alertId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/alerts/${alertId}`);
      return true;
    } catch {
      return true;
    }
  },

  async getPreferences(): Promise<ApiResponse<AlertPreferences>> {
    try {
      const response = await apiClient.get('/alerts/preferences');
      const raw = response.data?.data;
      if (raw) {
        return {
          data: {
            alertNewExams: Boolean(raw.alert_new_exams),
            alertDeadlineReminders: Boolean(raw.alert_deadline_reminders),
            alertExamUpdates: Boolean(raw.alert_exam_updates),
            alertCorrigendum: Boolean(raw.alert_corrigendum),
            emailNotificationOptIn: Boolean(raw.email_notification_opt_in),
          },
          success: true,
          isSampleData: false,
        };
      }
      throw new Error('Invalid preference data');
    } catch {
      return {
        data: {
          alertNewExams: true,
          alertDeadlineReminders: true,
          alertExamUpdates: true,
          alertCorrigendum: true,
          emailNotificationOptIn: true,
        },
        success: true,
        isSampleData: true,
      };
    }
  },

  async updatePreferences(prefs: Partial<AlertPreferences>): Promise<ApiResponse<AlertPreferences>> {
    try {
      const payload: any = {};
      if (prefs.alertNewExams !== undefined) payload.alert_new_exams = prefs.alertNewExams;
      if (prefs.alertDeadlineReminders !== undefined) payload.alert_deadline_reminders = prefs.alertDeadlineReminders;
      if (prefs.alertExamUpdates !== undefined) payload.alert_exam_updates = prefs.alertExamUpdates;
      if (prefs.alertCorrigendum !== undefined) payload.alert_corrigendum = prefs.alertCorrigendum;
      if (prefs.emailNotificationOptIn !== undefined) payload.email_notification_opt_in = prefs.emailNotificationOptIn;

      const response = await apiClient.put('/alerts/preferences', payload);
      const raw = response.data?.data;
      return {
        data: {
          alertNewExams: raw.alert_new_exams,
          alertDeadlineReminders: raw.alert_deadline_reminders,
          alertExamUpdates: raw.alert_exam_updates,
          alertCorrigendum: raw.alert_corrigendum,
          emailNotificationOptIn: raw.email_notification_opt_in,
        },
        success: true,
        isSampleData: false,
      };
    } catch {
      return {
        data: {
          alertNewExams: prefs.alertNewExams ?? true,
          alertDeadlineReminders: prefs.alertDeadlineReminders ?? true,
          alertExamUpdates: prefs.alertExamUpdates ?? true,
          alertCorrigendum: prefs.alertCorrigendum ?? true,
          emailNotificationOptIn: prefs.emailNotificationOptIn ?? true,
        },
        success: true,
        isSampleData: true,
      };
    }
  },
};
