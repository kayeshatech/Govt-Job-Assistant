import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  CheckCircle2,
  Bell,
  Calendar,
  Milestone,
  BookOpen,
  Bookmark,
  Sparkles,
  GraduationCap,
  Flame,
  Award,
} from 'lucide-react';
import { MAIN_NAV_ITEMS } from '../../config/routes';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Compass,
  CheckCircle2,
  Bell,
  Calendar,
  Milestone,
  BookOpen,
  Bookmark,
  Sparkles,
  GraduationCap,
};

export interface SidebarProps {
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false }) => {
  const { user } = useAuth();

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 bg-starlight border-r border-opaline/70 transition-all duration-200 z-30 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
      aria-label="Dashboard Sidebar"
    >
      {/* Top Study Streak & Aspirant Status Card */}
      <div className="p-4 border-b border-opaline/60">
        {!isCollapsed ? (
          <div className="p-3 rounded-xl bg-opaline/20 border border-opaline/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-nocturne uppercase tracking-wider">
                Study Streak
              </span>
              <div className="flex items-center gap-1 text-xs font-extrabold text-nocturne bg-aurora/30 px-2 py-0.5 rounded-full border border-aurora/40">
                <Flame className="w-3.5 h-3.5 text-wisteria fill-current" />
                <span>14 Days</span>
              </div>
            </div>
            <p className="text-xs text-wisteria line-clamp-1">
              Target: <strong className="text-eclipse">{user?.targetCategories?.[0] || 'Civil Services'}</strong>
            </p>
            <div className="w-full bg-opaline/40 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-wisteria h-full rounded-full w-[65%]" />
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="14-Day Study Streak">
            <div className="w-10 h-10 rounded-xl bg-opaline/25 flex items-center justify-center text-wisteria border border-opaline/60">
              <Flame className="w-5 h-5 fill-current" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {MAIN_NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.iconName] || LayoutDashboard;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-nocturne text-starlight shadow-sm'
                    : 'text-eclipse hover:text-nocturne hover:bg-opaline/30'
                }`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge variant="accent" size="sm" className="ml-2">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Capstone / Help badge */}
      {!isCollapsed && (
        <div className="p-4 border-t border-opaline/60">
          <div className="flex items-center gap-2 text-xs text-wisteria">
            <Award className="w-4 h-4 shrink-0 text-wisteria" />
            <span className="text-[11px] font-medium leading-tight">
              India Government Exam Career Guidance Engine
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};
