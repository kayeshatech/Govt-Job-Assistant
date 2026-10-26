import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  FileText,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
  Download,
  AlertCircle,
  Users,
} from 'lucide-react';
import { notificationService } from '../api/notificationService';
import { RecruitmentNotification } from '../types/notification';
import { ROUTES } from '../config/routes';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/feedback/Skeleton';
import { EmptyState } from '../components/feedback/EmptyState';

export const NotificationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [notification, setNotification] = useState<RecruitmentNotification | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotification = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await notificationService.getNotificationById(id);
        setNotification(res.data);
      } catch (err) {
        console.error('Failed to fetch notification detail', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotification();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton height={30} width={200} />
        <Skeleton height={200} />
        <Skeleton height={300} />
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <EmptyState
          icon={<AlertCircle className="w-8 h-8" />}
          title="Notification Record Not Found"
          description="The requested recruitment gazette notice is not available in our current index."
          actionLabel="Back to Notifications"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Link */}
      <Link
        to={ROUTES.NOTIFICATIONS}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-wisteria hover:text-nocturne"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Notifications Feed</span>
      </Link>

      {/* Main Notification Card */}
      <Card variant="elevated" className="p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="pb-6 border-b border-opaline/70">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="active" size="md">
                {notification.status}
              </Badge>
              <span className="font-mono text-xs font-bold text-wisteria bg-opaline/30 px-2 py-0.5 rounded border border-opaline/50">
                {notification.advertisementNumber}
              </span>
            </div>
            {notification.isVerifiedOfficial && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-nocturne bg-opaline/40 px-3 py-1 rounded-full border border-opaline/70">
                <ShieldCheck className="w-4 h-4 text-wisteria" />
                <span>Verified Gazette Notice</span>
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-nocturne leading-tight">
            {notification.title}
          </h1>
          <p className="text-xs sm:text-sm text-wisteria font-medium mt-1">
            Issuing Commission: <strong className="text-eclipse">{notification.agency}</strong>
          </p>
        </div>

        {/* Key Dates & Vacancy Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-opaline/20 border border-opaline/60 text-xs">
          <div>
            <span className="text-[10px] font-bold text-wisteria uppercase block">Release Date</span>
            <span className="font-bold text-nocturne text-sm block mt-0.5">
              {notification.releaseDate}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-wisteria uppercase block">
              Application Deadline
            </span>
            <span className="font-bold text-nocturne text-sm block mt-0.5">
              {notification.applicationDeadline}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-wisteria uppercase block">
              Total Vacancies
            </span>
            <span className="font-bold text-nocturne text-sm block mt-0.5">
              {notification.totalVacancies.toLocaleString()} Posts
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-wisteria uppercase block">
              Tentative Exam Date
            </span>
            <span className="font-bold text-nocturne text-sm block mt-0.5">
              {notification.examDateTentative || 'Announced Later'}
            </span>
          </div>
        </div>

        {/* Highlights List */}
        <div>
          <h2 className="text-xs font-bold text-nocturne uppercase tracking-wider mb-2">
            Official Highlights & Key Stipulations
          </h2>
          <ul className="space-y-2 text-xs text-eclipse leading-relaxed">
            {notification.highlights.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-wisteria shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Eligibility & Fee Structure */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-opaline/60 text-xs">
          <div className="p-3.5 rounded-lg bg-starlight border border-opaline/70">
            <h3 className="font-bold text-nocturne mb-1">Prescribed Eligibility Criteria:</h3>
            <p className="text-eclipse/90 leading-relaxed">{notification.eligibilitySnippet}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-starlight border border-opaline/70">
            <h3 className="font-bold text-nocturne mb-1">Application Fee Structure:</h3>
            <p className="text-eclipse/90 leading-relaxed">{notification.feeStructure}</p>
          </div>
        </div>

        {/* External Official Portal Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-opaline/60">
          <div className="text-xs text-wisteria">
            Official Source: <strong className="text-eclipse">{notification.sourcePortalName}</strong>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {notification.pdfUrl && (
              <a
                href={notification.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<Download className="w-4 h-4" />}
                  className="w-full"
                >
                  Download PDF Notice
                </Button>
              </a>
            )}
            <a
              href={notification.officialPortal}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                variant="primary"
                size="md"
                rightIcon={<ExternalLink className="w-4 h-4" />}
                className="w-full"
              >
                Apply on Official Portal
              </Button>
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
};
