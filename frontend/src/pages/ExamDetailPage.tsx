import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  Award,
  CheckCircle2,
  Bookmark,
  ExternalLink,
  Shield,
  Layers,
  Clock,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { examService } from '../api/examService';
import { GovernmentExam } from '../types/exam';
import { ROUTES } from '../config/routes';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Skeleton } from '../components/feedback/Skeleton';
import { EmptyState } from '../components/feedback/EmptyState';
import { useSavedExams } from '../context/SavedExamsContext';

export const ExamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [exam, setExam] = useState<GovernmentExam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isExamSaved, toggleSaveExam } = useSavedExams();

  useEffect(() => {
    const fetchExam = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await examService.getExamById(id);
        setExam(res.data);
      } catch (err) {
        console.error('Failed to load exam details', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton height={40} width={200} />
        <Skeleton height={200} />
        <Skeleton height={400} />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <EmptyState
          icon={<Shield className="w-8 h-8" />}
          title="Examination Not Found"
          description="The requested examination could not be located in our gazette records."
          actionLabel="Return to Discovery"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  const saved = isExamSaved(exam.id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to={ROUTES.EXAMS}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-wisteria hover:text-nocturne"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Exam Directory</span>
      </Link>

      {/* Main Header Card */}
      <Card variant="elevated" className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-opaline/70">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="active" size="md">
                {exam.level} Government
              </Badge>
              <Badge variant="accent" size="md">
                {exam.category}
              </Badge>
              <span className="font-mono text-xs font-bold text-wisteria bg-opaline/30 px-2 py-0.5 rounded border border-opaline/50">
                {exam.code}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-nocturne leading-tight">
              {exam.title}
            </h1>
            <p className="text-xs sm:text-sm text-wisteria font-medium mt-1">
              Conducting Authority: <strong className="text-eclipse">{exam.conductingBody}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant={saved ? 'secondary' : 'outline'}
              size="md"
              onClick={() => toggleSaveExam(exam.id, exam.title, exam.conductingBody)}
              leftIcon={<Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />}
            >
              {saved ? 'Tracked in Apps' : 'Save & Track'}
            </Button>
            <a href={exam.officialWebsite} target="_blank" rel="noopener noreferrer">
              <Button variant="primary" size="md" rightIcon={<ExternalLink className="w-4 h-4" />}>
                Official Portal
              </Button>
            </a>
          </div>
        </div>

        {/* Highlight Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="p-3.5 rounded-xl bg-opaline/20 border border-opaline/60">
            <span className="text-[10px] font-bold text-wisteria uppercase tracking-wider block">
              Total Vacancies
            </span>
            <span className="text-lg font-black text-nocturne mt-0.5 block">
              {exam.vacancies.toLocaleString()} Posts
            </span>
            <span className="text-[11px] text-eclipse/80">Gazetted in notice</span>
          </div>

          <div className="p-3.5 rounded-xl bg-opaline/20 border border-opaline/60">
            <span className="text-[10px] font-bold text-wisteria uppercase tracking-wider block">
              Pay Matrix
            </span>
            <span className="text-lg font-black text-nocturne mt-0.5 block">{exam.payLevel}</span>
            <span className="text-[11px] text-eclipse/80">{exam.salaryGross}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-opaline/20 border border-opaline/60">
            <span className="text-[10px] font-bold text-wisteria uppercase tracking-wider block">
              Last Date to Apply
            </span>
            <span className="text-lg font-black text-nocturne mt-0.5 block">
              {exam.lastDateToApply}
            </span>
            <span className="text-[11px] text-eclipse/80">Notification: {exam.notificationDate}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-opaline/20 border border-opaline/60">
            <span className="text-[10px] font-bold text-wisteria uppercase tracking-wider block">
              Exam Date (Prelims)
            </span>
            <span className="text-lg font-black text-nocturne mt-0.5 block">
              {exam.prelimsDate}
            </span>
            <span className="text-[11px] text-eclipse/80">Tentative Schedule</span>
          </div>
        </div>
      </Card>

      {/* Two Column Layout: Eligibility & Stages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Selection Stages & Syllabus */}
        <div className="lg:col-span-2 space-y-6">
          {/* Posts & Roles */}
          <Card variant="default" className="p-6">
            <h3 className="text-sm font-bold text-nocturne uppercase tracking-wider mb-2">
              Cadres & Designated Posts
            </h3>
            <p className="text-xs text-eclipse leading-relaxed">{exam.posts}</p>
          </Card>

          {/* Examination Stages Breakdown */}
          <Card variant="default" className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-opaline/60">
              <Layers className="w-4 h-4 text-wisteria" />
              <h3 className="text-sm font-bold text-nocturne uppercase tracking-wider">
                Selection Process & Stages
              </h3>
            </div>

            <div className="space-y-3">
              {exam.stages.map((stage, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-starlight border border-opaline/70 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-nocturne">
                      Stage {idx + 1}: {stage.name}
                    </span>
                    <Badge variant="default" size="sm">
                      Mandatory
                    </Badge>
                  </div>
                  <p className="text-xs text-eclipse/90">{stage.details}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Syllabus Overview */}
          <Card variant="default" className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-opaline/60">
              <BookOpen className="w-4 h-4 text-wisteria" />
              <h3 className="text-sm font-bold text-nocturne uppercase tracking-wider">
                Syllabus & Test Framework
              </h3>
            </div>

            <div>
              <h4 className="text-xs font-bold text-nocturne mb-2">Preliminary / Screening Units:</h4>
              <ul className="space-y-1.5 text-xs text-eclipse">
                {exam.syllabusOverview.prelims.map((topic, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-wisteria shrink-0 mt-0.5" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>

            {exam.syllabusOverview.mainsGS && (
              <div className="pt-3 border-t border-opaline/50">
                <h4 className="text-xs font-bold text-nocturne mb-2">Main / Advanced Written Papers:</h4>
                <ul className="space-y-1.5 text-xs text-eclipse">
                  {exam.syllabusOverview.mainsGS.map((topic, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-wisteria font-bold mt-0.5">•</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Age Relaxations, Fees & Quick screener */}
        <div className="space-y-6">
          {/* Statutory Age Limits Table */}
          <Card variant="default" className="p-5 space-y-3">
            <h3 className="text-xs font-bold text-nocturne uppercase tracking-wider pb-2 border-b border-opaline/60">
              Statutory Age Limits & Relaxations
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-opaline/40">
                <span className="text-wisteria">Minimum Age</span>
                <span className="font-bold text-nocturne">{exam.ageLimit.min} Years</span>
              </div>
              <div className="flex justify-between py-1 border-b border-opaline/40">
                <span className="text-wisteria">General / UR Upper Limit</span>
                <span className="font-bold text-nocturne">{exam.ageLimit.maxGeneral} Years</span>
              </div>
              <div className="flex justify-between py-1 border-b border-opaline/40">
                <span className="text-wisteria">OBC-NCL (+3 Yrs)</span>
                <span className="font-bold text-nocturne">{exam.ageLimit.maxOBC} Years</span>
              </div>
              <div className="flex justify-between py-1 border-b border-opaline/40">
                <span className="text-wisteria">SC / ST (+5 Yrs)</span>
                <span className="font-bold text-nocturne">{exam.ageLimit.maxSCST} Years</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-wisteria">PwD (+10 Yrs)</span>
                <span className="font-bold text-nocturne">{exam.ageLimit.maxPwD} Years</span>
              </div>
            </div>
          </Card>

          {/* Attempts and Fees */}
          <Card variant="default" className="p-5 space-y-3">
            <h3 className="text-xs font-bold text-nocturne uppercase tracking-wider pb-2 border-b border-opaline/60">
              Application & Marking Rules
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[11px] font-bold text-wisteria block">Application Fee</span>
                <span className="text-eclipse font-medium">{exam.applicationFee}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-wisteria block">Negative Marking</span>
                <span className="text-eclipse font-medium">{exam.negativeMarking}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-wisteria block">Duration</span>
                <span className="text-eclipse font-medium">{exam.duration}</span>
              </div>
            </div>
          </Card>

          {/* Quick Screener Link Card */}
          <div className="p-5 rounded-2xl bg-nocturne text-starlight space-y-3 border border-wisteria/40">
            <h4 className="text-sm font-bold text-starlight">Am I Eligible for this Exam?</h4>
            <p className="text-xs text-opaline leading-relaxed">
              Run the multi-factor eligibility screener against your exact date of birth, category, and university marks.
            </p>
            <Link to={ROUTES.ELIGIBILITY} className="block">
              <Button variant="secondary" size="sm" className="w-full">
                Verify My Eligibility
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
