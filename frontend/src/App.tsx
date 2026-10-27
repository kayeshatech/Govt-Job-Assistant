import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SavedExamsProvider } from './context/SavedExamsContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ROUTES } from './config/routes';

// 19 Pages
import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExamDiscoveryPage } from './pages/ExamDiscoveryPage';
import { ExamDetailPage } from './pages/ExamDetailPage';
import { EligibilityCheckerPage } from './pages/EligibilityCheckerPage';
import { RecruitmentNotificationsPage } from './pages/RecruitmentNotificationsPage';
import { NotificationDetailPage } from './pages/NotificationDetailPage';
import { ExamCalendarPage } from './pages/ExamCalendarPage';
import { SavedExamsPage } from './pages/SavedExamsPage';
import { PreparationRoadmapPage } from './pages/PreparationRoadmapPage';
import { StudyMaterialLibraryPage } from './pages/StudyMaterialLibraryPage';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { KsetUgcNetLandingPage } from './pages/KsetUgcNetLandingPage';
import { CommunityHubPage } from './pages/CommunityHubPage';
import { AdminReviewPage } from './pages/AdminReviewPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <SavedExamsProvider>
            <AppLayout>
              <Routes>
                {/* 1. Public Portal Pages */}
                <Route path={ROUTES.HOME} element={<LandingPage />} />
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
                <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />

                {/* 2. Onboarding Wizard (Protected) */}
                <Route
                  path={ROUTES.ONBOARDING}
                  element={
                    <ProtectedRoute>
                      <OnboardingPage />
                    </ProtectedRoute>
                  }
                />

                {/* 3. Main Dashboard Workspace (Protected) */}
                <Route
                  path={ROUTES.DASHBOARD}
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* 4. Examination Discovery & Details */}
                <Route path={ROUTES.EXAMS} element={<ExamDiscoveryPage />} />
                <Route path="/exams/:id" element={<ExamDetailPage />} />

                {/* 5. Eligibility Screener */}
                <Route path={ROUTES.ELIGIBILITY} element={<EligibilityCheckerPage />} />

                {/* 6. Recruitment Notifications & Details */}
                <Route path={ROUTES.NOTIFICATIONS} element={<RecruitmentNotificationsPage />} />
                <Route path="/notifications/:id" element={<NotificationDetailPage />} />

                {/* 7. Exam Calendar */}
                <Route path={ROUTES.CALENDAR} element={<ExamCalendarPage />} />

                {/* 8. Saved Examinations & Application Tracker (Protected) */}
                <Route
                  path={ROUTES.SAVED_EXAMS}
                  element={
                    <ProtectedRoute>
                      <SavedExamsPage />
                    </ProtectedRoute>
                  }
                />

                {/* 9. Preparation Roadmap (Protected) */}
                <Route
                  path={ROUTES.ROADMAP}
                  element={
                    <ProtectedRoute>
                      <PreparationRoadmapPage />
                    </ProtectedRoute>
                  }
                />

                {/* 10. Study Material Library */}
                <Route path={ROUTES.MATERIALS} element={<StudyMaterialLibraryPage />} />

                {/* 11. Student Profile & Settings (Protected) */}
                <Route
                  path={ROUTES.PROFILE}
                  element={
                    <ProtectedRoute>
                      <StudentProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* 12. AI Assistant (Protected) */}
                <Route
                  path={ROUTES.AI_ASSISTANT}
                  element={
                    <ProtectedRoute>
                      <AIAssistantPage />
                    </ProtectedRoute>
                  }
                />

                {/* 13. KSET / UGC-NET Specialized Hub */}
                <Route path={ROUTES.KSET_UGC_NET} element={<KsetUgcNetLandingPage />} />

                {/* 14. Peer Study Circles & Faculty Hub (Protected) */}
                <Route
                  path={ROUTES.COMMUNITY}
                  element={
                    <ProtectedRoute>
                      <CommunityHubPage />
                    </ProtectedRoute>
                  }
                />

                {/* 15. Admin Source Watchdog & Review Queue (Protected) */}
                <Route
                  path={ROUTES.ADMIN_REVIEW}
                  element={
                    <ProtectedRoute>
                      <AdminReviewPage />
                    </ProtectedRoute>
                  }
                />

                {/* 15. Responsive 404 Page */}
                <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
              </Routes>
            </AppLayout>
          </SavedExamsProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
