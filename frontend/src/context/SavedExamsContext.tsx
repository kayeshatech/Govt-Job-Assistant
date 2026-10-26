import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { SavedApplication } from '../types/student';
import { studentService } from '../api/studentService';
import { useToast } from './ToastContext';

interface SavedExamsContextType {
  savedApplications: SavedApplication[];
  isExamSaved: (examId: string) => boolean;
  toggleSaveExam: (examId: string, examTitle: string, conductingBody: string) => void;
  updateApplicationStatus: (appIdOrExamId: string, status: SavedApplication['status'], notes?: string) => void;
  removeApplication: (idOrExamId: string) => void;
}

const SavedExamsContext = createContext<SavedExamsContextType | undefined>(undefined);

export const SavedExamsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [savedApplications, setSavedApplications] = useState<SavedApplication[]>([]);
  const { showToast } = useToast();

  const refreshApplications = useCallback(async () => {
    // Immediate responsive local load
    const cachedList = studentService.getSavedApplications().data;
    setSavedApplications(cachedList);

    // Sync with FastAPI backend if token is available
    const apiRes = await studentService.fetchSavedApplicationsFromApi();
    if (!apiRes.isSampleData && Array.isArray(apiRes.data)) {
      setSavedApplications(apiRes.data);
    }
  }, []);

  useEffect(() => {
    refreshApplications();
  }, [refreshApplications]);

  const isExamSaved = (examId: string): boolean => {
    return savedApplications.some((a) => a.examId === examId);
  };

  const toggleSaveExam = (examId: string, examTitle: string, conductingBody: string) => {
    const exists = isExamSaved(examId);
    if (exists) {
      studentService.removeApplication(examId);
      refreshApplications();
      showToast('Removed from Tracker', `${examTitle} was removed from your tracked list.`, 'info');
    } else {
      const newApp: SavedApplication = {
        id: `app-${Date.now()}`,
        examId,
        examTitle,
        conductingBody,
        status: 'Draft / Planning',
        savedAt: new Date().toISOString(),
      };
      studentService.saveApplication(newApp);
      refreshApplications();
      showToast('Saved to Application Tracker', `${examTitle} has been added to your preparation board.`, 'success');
    }
  };

  const updateApplicationStatus = (
    appIdOrExamId: string,
    status: SavedApplication['status'],
    notes?: string
  ) => {
    const app = savedApplications.find((a) => a.id === appIdOrExamId || a.examId === appIdOrExamId);
    if (app) {
      studentService.saveApplication({
        ...app,
        status,
        notes: notes !== undefined ? notes : app.notes,
      });
      refreshApplications();
      showToast('Status Updated', `Status changed to "${status}".`, 'success');
    }
  };

  const removeApplication = (idOrExamId: string) => {
    studentService.removeApplication(idOrExamId);
    refreshApplications();
    showToast('Application Removed', 'Item removed from your tracking workspace.', 'info');
  };

  return (
    <SavedExamsContext.Provider
      value={{
        savedApplications,
        isExamSaved,
        toggleSaveExam,
        updateApplicationStatus,
        removeApplication,
      }}
    >
      {children}
    </SavedExamsContext.Provider>
  );
};

export const useSavedExams = (): SavedExamsContextType => {
  const context = useContext(SavedExamsContext);
  if (!context) {
    throw new Error('useSavedExams must be used within a SavedExamsProvider');
  }
  return context;
};
