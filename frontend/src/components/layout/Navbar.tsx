import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  Bell,
  Calendar,
  Sparkles,
  BookOpen,
  Bookmark,
  User,
  LogOut,
  Menu,
  X,
  Search,
  ShieldCheck,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { APP_CONFIG } from '../../config/brand';
import { ROUTES } from '../../config/routes';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { alertService, StudentAlertItem } from '../../api/alertService';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [alerts, setAlerts] = useState<StudentAlertItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      alertService.getAlerts().then((res) => {
        if (res.data) {
          setAlerts(res.data);
        }
      });
    }
  }, [isAuthenticated]);

  const unreadAlerts = alerts.filter((a) => !a.isRead && !a.isDismissed);

  const handleMarkAllRead = async () => {
    await alertService.markAsRead(undefined, true);
    setAlerts(alerts.map((a) => ({ ...a, isRead: true })));
  };

  const handleDismiss = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await alertService.dismissAlert(id);
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.EXAMS}?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Exams', path: ROUTES.EXAMS, icon: Compass },
    { label: 'Eligibility', path: ROUTES.ELIGIBILITY, icon: CheckCircle2 },
    { label: 'Notifications', path: ROUTES.NOTIFICATIONS, icon: Bell, badge: '6' },
    { label: 'Calendar', path: ROUTES.CALENDAR, icon: Calendar },
    { label: 'AI Assistant', path: ROUTES.AI_ASSISTANT, icon: Sparkles, badge: 'AI' },
    { label: 'KSET/UGC Hub', path: ROUTES.KSET_UGC_NET, icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 bg-starlight/95 backdrop-blur-md border-b border-opaline/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Application Identity */}
          <div className="flex items-center gap-3">
            <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-nocturne flex items-center justify-center text-starlight shadow-sm group-hover:bg-wisteria transition-colors border border-nocturne">
                <span className="font-extrabold text-lg tracking-wider">G</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight text-nocturne leading-none">
                  {APP_CONFIG.name}
                </span>
                <span className="text-[10px] font-semibold text-wisteria uppercase tracking-widest leading-none mt-0.5">
                  Govt Exam Prep
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Search Bar (Desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xs relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-wisteria">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search exams, UPSC, SSC, KSET..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full bg-opaline/30 border border-opaline/70 text-eclipse placeholder:text-wisteria/70 focus:outline-none focus:ring-2 focus:ring-wisteria focus:bg-starlight transition-all"
            />
          </form>

          {/* Main Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-nocturne text-starlight'
                      : 'text-eclipse hover:text-nocturne hover:bg-opaline/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <Badge variant={isActive ? 'aurora' : 'accent'} size="sm" className="ml-0.5">
                      {link.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Account / Auth Actions */}
          <div className="hidden sm:flex items-center gap-2.5">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Personalized Watchdog Alerts Bell Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsAlertsOpen(!isAlertsOpen);
                      setIsProfileMenuOpen(false);
                    }}
                    className="relative p-2 rounded-xl text-nocturne hover:bg-opaline/40 border border-opaline/60 transition-colors"
                    aria-label="View personalized notifications and corrigendum alerts"
                  >
                    <Bell className="w-4 h-4 text-nocturne" />
                    {unreadAlerts.length > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-wisteria text-starlight text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                        {unreadAlerts.length}
                      </span>
                    )}
                  </button>

                  {/* Alerts Popover */}
                  {isAlertsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-starlight border border-opaline/80 shadow-modal py-2 z-50 animate-in fade-in-50">
                      <div className="px-4 py-2 border-b border-opaline/60 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-nocturne">Personalized Alerts & Corrigenda</p>
                          <p className="text-[10px] text-wisteria">
                            {unreadAlerts.length} unread notification{unreadAlerts.length === 1 ? '' : 's'}
                          </p>
                        </div>
                        {unreadAlerts.length > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] font-bold text-wisteria hover:text-nocturne"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Alert Items List */}
                      <div className="max-h-80 overflow-y-auto divide-y divide-opaline/40">
                        {alerts.length > 0 ? (
                          alerts.map((alert) => (
                            <div
                              key={alert.id}
                              className={`p-3 text-xs transition-colors hover:bg-opaline/20 ${
                                !alert.isRead ? 'bg-opaline/30' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span
                                  className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                    alert.priority === 'CRITICAL' || alert.priority === 'HIGH'
                                      ? 'bg-nocturne text-starlight'
                                      : 'bg-opaline/50 text-nocturne'
                                  }`}
                                >
                                  {alert.alertType.replace('_', ' ')}
                                </span>
                                <button
                                  onClick={(e) => handleDismiss(alert.id, e)}
                                  className="text-wisteria hover:text-nocturne p-0.5"
                                  title="Dismiss alert"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <p className="font-bold text-nocturne mt-1">{alert.title}</p>
                              <p className="text-[11px] text-eclipse/90 mt-0.5 line-clamp-2">
                                {alert.message}
                              </p>
                              <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-wisteria">
                                <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                                {alert.emailDispatched && (
                                  <span className="italic">Email Dispatched</span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-xs text-wisteria">
                            No notifications at this time
                          </div>
                        )}
                      </div>

                      {/* Popover Footer */}
                      <div className="px-4 py-2 border-t border-opaline/60 flex items-center justify-between text-xs bg-starlight">
                        <Link
                          to={ROUTES.NOTIFICATIONS}
                          onClick={() => setIsAlertsOpen(false)}
                          className="font-bold text-wisteria hover:text-nocturne text-[11px]"
                        >
                          View Official Gazettes →
                        </Link>
                        <Link
                          to={ROUTES.PROFILE}
                          onClick={() => setIsAlertsOpen(false)}
                          className="font-bold text-wisteria hover:text-nocturne text-[11px]"
                        >
                          Alert Preferences
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Avatar / Menu */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(!isProfileMenuOpen);
                      setIsAlertsOpen(false);
                    }}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-opaline/40 transition-colors border border-transparent hover:border-opaline/60"
                    aria-expanded={isProfileMenuOpen}
                    aria-label="Student profile menu"
                  >
                    <div className="w-8 h-8 rounded-lg bg-wisteria text-starlight flex items-center justify-center font-bold text-xs">
                      {user?.fullName ? user.fullName[0] : 'A'}
                    </div>
                    <div className="text-left hidden xl:block">
                      <span className="block text-xs font-bold text-nocturne leading-tight">
                        {user?.fullName?.split(' ')[0]}
                      </span>
                      <span className="block text-[10px] text-wisteria">Aspirant Profile</span>
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl bg-starlight border border-opaline/80 shadow-modal py-1.5 z-50 animate-in fade-in-50">
                      <div className="px-4 py-2 border-b border-opaline/60">
                        <p className="text-xs font-bold text-nocturne">{user?.fullName}</p>
                        <p className="text-[11px] text-wisteria truncate">{user?.email}</p>
                      </div>
                      <Link
                        to={ROUTES.DASHBOARD}
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-eclipse hover:bg-opaline/30 font-medium"
                      >
                        <span>Dashboard Workspace</span>
                      </Link>
                      <Link
                        to={ROUTES.SAVED_EXAMS}
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-eclipse hover:bg-opaline/30 font-medium"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-wisteria" />
                        <span>Application Tracker</span>
                      </Link>
                      <Link
                        to={ROUTES.PROFILE}
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-eclipse hover:bg-opaline/30 font-medium"
                      >
                        <User className="w-3.5 h-3.5 text-wisteria" />
                        <span>Profile & Eligibility Settings</span>
                      </Link>
                      <Link
                        to={ROUTES.ADMIN_REVIEW}
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-eclipse hover:bg-opaline/30 font-medium border-t border-opaline/50"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-wisteria" />
                        <span>Source Watchdog & Review Queue</span>
                      </Link>
                      <div className="border-t border-opaline/60 my-1" />
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          logout();
                          navigate(ROUTES.HOME);
                        }}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-nocturne hover:bg-opaline/30 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5 text-wisteria" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to={ROUTES.LOGIN}
                  className="text-xs font-semibold text-nocturne hover:text-wisteria px-3 py-1.5 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="text-xs font-semibold bg-nocturne text-starlight hover:bg-eclipse px-3.5 py-1.5 rounded-lg shadow-sm transition-all"
                >
                  Join Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-nocturne hover:bg-opaline/40"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-opaline/70 bg-starlight px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-wisteria">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search government exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-opaline/30 border border-opaline/80 text-eclipse"
            />
          </form>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold text-nocturne hover:bg-opaline/40 border border-opaline/50"
                >
                  <Icon className="w-4 h-4 text-wisteria" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-opaline/60 flex flex-col gap-2">
            <Link
              to={ROUTES.DASHBOARD}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-center py-2 text-xs font-bold bg-nocturne text-starlight rounded-lg"
            >
              Go to Dashboard
            </Link>
            <Link
              to={ROUTES.PROFILE}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-center py-2 text-xs font-medium text-nocturne hover:bg-opaline/30 rounded-lg"
            >
              Profile & Settings
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
