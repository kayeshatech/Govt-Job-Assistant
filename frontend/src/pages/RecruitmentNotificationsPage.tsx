import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Filter, RefreshCw, ShieldCheck, CheckCircle2, ShieldAlert } from 'lucide-react';
import { notificationService } from '../api/notificationService';
import { RecruitmentNotification } from '../types/notification';
import { NotificationCard } from '../components/notification/NotificationCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/feedback/Skeleton';
import { EmptyState } from '../components/feedback/EmptyState';
import { ROUTES } from '../config/routes';

export const RecruitmentNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<RecruitmentNotification[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const statusTabs = [
    { label: 'All Notices', value: 'all' },
    { label: 'Active Applications', value: 'Active' },
    { label: 'Corrigendums & Changes', value: 'Corrigendum' },
    { label: 'Admit Cards & Hall Tickets', value: 'Admit Card' },
    { label: 'Upcoming Calendar Alerts', value: 'Upcoming' },
  ];

  const loadNotifications = async (status: string) => {
    setIsLoading(true);
    try {
      const res = await notificationService.getNotifications(status);
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(activeFilter);
  }, [activeFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-wisteria uppercase tracking-widest">
              Official Gazetted Feed
            </span>
            <Badge variant="active" size="sm">
              Live Watchdog
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-nocturne">
            Government Recruitment Notifications
          </h1>
          <p className="text-xs sm:text-sm text-eclipse/80 mt-1">
            Official advertisements, corrigendum vacancy adjustments, and admit card notices extracted from verified commissioning portals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to={ROUTES.ADMIN_REVIEW}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-wisteria" />}
            >
              Source Registry & Review Queue
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadNotifications(activeFilter)}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Feed
          </Button>
        </div>
      </div>

      {/* Watchdog Integrity Banner */}
      <div className="p-4 rounded-xl bg-opaline/20 border border-opaline/60 flex items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-nocturne shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-eclipse/90">
            <strong>Official Source Watchdog:</strong> All notices are ingested on an automated schedule from verified commission portals (UPSC, SSC, ISRO, KPSC). High-impact corrigendums and vacancy revisions require dual-factor validation and human operator approval before authoritative publication.
          </p>
        </div>
        <span className="hidden md:inline-flex px-2.5 py-1 rounded bg-starlight font-mono text-[10px] text-wisteria border border-opaline/70 whitespace-nowrap">
          Deterministic SHA-256 Verified
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-opaline/70">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveFilter(tab.value)}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeFilter === tab.value
                ? 'bg-nocturne text-starlight shadow-sm'
                : 'bg-starlight text-wisteria hover:text-nocturne hover:bg-opaline/40 border border-opaline/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications Grid */}
      <div>
        <p className="text-xs font-bold text-wisteria mb-4">
          Displaying <strong className="text-nocturne">{notifications.length}</strong> Official Notices
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} height={220} />
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notifications.map((notif) => (
              <NotificationCard key={notif.id} notification={notif} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Bell className="w-8 h-8" />}
            title="No Notifications Found"
            description="There are currently no active gazettes matching this filter criteria."
            actionLabel="View All Notices"
            onAction={() => setActiveFilter('all')}
          />
        )}
      </div>
    </div>
  );
};
