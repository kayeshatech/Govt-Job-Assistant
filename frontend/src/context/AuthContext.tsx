import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StudentProfile } from '../types/student';
import { studentService, DEFAULT_STUDENT_PROFILE } from '../api/studentService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: StudentProfile | null;
  login: (email?: string, password?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<StudentProfile>) => void;
  completeOnboarding: (data: Partial<StudentProfile>) => void;
  isLoading: boolean;
  isDevelopmentDemo: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'govexa_auth_token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StudentProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isDevelopmentDemo = true;

  useEffect(() => {
    // Check initial local session state
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const profile = studentService.getProfile().data;
    setUser(profile);
    setIsAuthenticated(Boolean(token));

    if (token) {
      studentService.fetchProfileFromApi().then((res) => {
        if (!res.isSampleData && res.data) {
          setUser(res.data);
        }
      });
    } else {
      // By default for smooth preview, provide instant demo session
      setUser(profile);
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_TOKEN_KEY, 'demo_jwt_aspirant_session');
    }
    setIsLoading(false);
  }, []);

  const login = async (_email?: string, _password?: string): Promise<boolean> => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'demo_jwt_aspirant_session');
    const profile = studentService.getProfile().data;
    setUser(profile);
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateProfile = (partial: Partial<StudentProfile>) => {
    const updated = studentService.updateProfile(partial).data;
    setUser(updated);
  };

  const completeOnboarding = (data: Partial<StudentProfile>) => {
    const updated = studentService.updateProfile({
      ...data,
      isOnboarded: true,
    }).data;
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user: user || DEFAULT_STUDENT_PROFILE,
        login,
        logout,
        updateProfile,
        completeOnboarding,
        isLoading,
        isDevelopmentDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
