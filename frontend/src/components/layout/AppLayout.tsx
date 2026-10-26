import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { NotificationBanner } from '../feedback/NotificationBanner';

export interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();

  // Pages that display the dashboard workspace sidebar
  const isDashboardRoute = [
    '/dashboard',
    '/saved-exams',
    '/roadmap',
    '/profile',
    '/ai-assistant',
  ].some((path) => location.pathname.startsWith(path));

  // Auth pages that don't need the standard layout shell
  const isAuthPage = ['/login', '/register', '/forgot-password', '/onboarding'].includes(
    location.pathname
  );

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-starlight flex flex-col justify-between">
        <NotificationBanner />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">{children}</main>
        <footer className="py-4 text-center text-xs text-wisteria border-t border-opaline/50">
          Govexa • AI Government Examination System • Academic Platform
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-starlight text-eclipse">
      <a href="#mainContent" className="skip-link">
        Skip to main content
      </a>

      {/* Top Banner */}
      <NotificationBanner />

      {/* Main Navbar */}
      <Navbar />

      {/* Layout Body with Conditional Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row w-full">
        {isDashboardRoute && <Sidebar />}

        <main id="mainContent" className="flex-1 w-full focus:outline-none overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Portal Footer */}
      <Footer />
    </div>
  );
};
