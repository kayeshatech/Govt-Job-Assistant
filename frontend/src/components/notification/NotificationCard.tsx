import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { RecruitmentNotification } from '../../types/notification';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { ROUTES } from '../../config/routes';

export interface NotificationCardProps {
  notification: RecruitmentNotification;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({ notification }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'active';
      case 'Corrigendum':
        return 'accent';
      case 'Admit Card':
        return 'aurora';
      default:
        return 'default';
    }
  };

  return (
    <Card variant="interactive" className="p-5 flex flex-col justify-between h-full">
      <div>
        {/* Header badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant(notification.status)} size="sm">
              {notification.status}
            </Badge>
            <span className="text-xs text-wisteria font-mono">{notification.advertisementNumber}</span>
          </div>
          {notification.isVerifiedOfficial && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-nocturne bg-opaline/40 px-2 py-0.5 rounded-full border border-opaline/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-wisteria" />
              <span>Gazetted</span>
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={ROUTES.NOTIFICATION_DETAIL(notification.id)} className="block group">
          <h3 className="text-base font-bold text-nocturne line-clamp-2 mb-1.5 group-hover:text-wisteria transition-colors">
            {notification.title}
          </h3>
        </Link>
        <p className="text-xs text-wisteria font-medium mb-3">{notification.agency}</p>

        {/* Highlight Bullets */}
        <ul className="space-y-1.5 mb-4 text-xs text-eclipse/90">
          {notification.highlights.slice(0, 2).map((item, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-wisteria font-bold mt-0.5">•</span>
              <span className="line-clamp-1">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-3 border-t border-opaline/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-wisteria">
          <Calendar className="w-3.5 h-3.5" />
          <span>Deadline: <strong className="text-eclipse">{notification.applicationDeadline}</strong></span>
        </div>
        <Link
          to={ROUTES.NOTIFICATION_DETAIL(notification.id)}
          className="inline-flex items-center gap-1 text-xs font-bold text-nocturne hover:text-wisteria transition-colors group"
        >
          <span>View Notice</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </Card>
  );
};
