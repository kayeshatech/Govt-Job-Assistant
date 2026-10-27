/**
 * Govexa Route Constants
 * Single source of truth for all application URLs and navigation links
 */

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  ONBOARDING: '/onboarding',
  DASHBOARD: '/dashboard',
  EXAMS: '/exams',
  EXAM_DETAIL: (id: string = ':id') => `/exams/${id}`,
  ELIGIBILITY: '/eligibility',
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_DETAIL: (id: string = ':id') => `/notifications/${id}`,
  CALENDAR: '/calendar',
  SAVED_EXAMS: '/saved-exams',
  ROADMAP: '/roadmap',
  MATERIALS: '/materials',
  PROFILE: '/profile',
  AI_ASSISTANT: '/ai-assistant',
  KSET_UGC_NET: '/kset-ugc-net',
  COMMUNITY: '/community',
  ADMIN_REVIEW: '/admin/review-queue',
  NOT_FOUND: '/404',
} as const;

export interface NavItem {
  label: string;
  path: string;
  iconName: string;
  badge?: string;
  isExternal?: boolean;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, iconName: 'LayoutDashboard' },
  { label: 'Exam Discovery', path: ROUTES.EXAMS, iconName: 'Compass' },
  { label: 'Eligibility Screener', path: ROUTES.ELIGIBILITY, iconName: 'CheckCircle2' },
  { label: 'Notifications Feed', path: ROUTES.NOTIFICATIONS, iconName: 'Bell', badge: 'Live' },
  { label: 'Exam Calendar', path: ROUTES.CALENDAR, iconName: 'Calendar' },
  { label: 'Preparation Roadmap', path: ROUTES.ROADMAP, iconName: 'Milestone' },
  { label: 'Study Library', path: ROUTES.MATERIALS, iconName: 'BookOpen' },
  { label: 'Saved & Tracker', path: ROUTES.SAVED_EXAMS, iconName: 'Bookmark' },
  { label: 'AI Assistant', path: ROUTES.AI_ASSISTANT, iconName: 'Sparkles', badge: 'AI' },
  { label: 'KSET / UGC-NET Hub', path: ROUTES.KSET_UGC_NET, iconName: 'GraduationCap' },
  { label: 'Community & Mentors', path: ROUTES.COMMUNITY, iconName: 'Users', badge: 'Peer' },
];
