import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Award, Bookmark, ExternalLink } from 'lucide-react';
import { GovernmentExam } from '../../types/exam';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { useSavedExams } from '../../context/SavedExamsContext';
import { ROUTES } from '../../config/routes';

export interface ExamCardProps {
  exam: GovernmentExam;
}

export const ExamCard: React.FC<ExamCardProps> = ({ exam }) => {
  const { isExamSaved, toggleSaveExam } = useSavedExams();
  const saved = isExamSaved(exam.id);

  // Calculate days remaining to apply
  const calculateDaysLeft = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysLeft = calculateDaysLeft(exam.lastDateToApply);

  return (
    <Card variant="interactive" className="p-5 flex flex-col justify-between h-full group">
      <div>
        {/* Top Badges & Save Action */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="active" size="sm">
              {exam.level}
            </Badge>
            <Badge variant="accent" size="sm">
              {exam.category}
            </Badge>
            {exam.aiMatchScore && (
              <Badge variant="aurora" size="sm">
                ★ {exam.aiMatchScore}% Match
              </Badge>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSaveExam(exam.id, exam.title, exam.conductingBody);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              saved
                ? 'bg-nocturne text-starlight'
                : 'text-wisteria hover:text-nocturne hover:bg-opaline/40'
            }`}
            title={saved ? 'Remove from saved' : 'Save examination'}
            aria-label={saved ? 'Saved exam' : 'Save exam'}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Exam Title & Body */}
        <Link to={ROUTES.EXAM_DETAIL(exam.id)} className="block group-hover:text-wisteria transition-colors">
          <h3 className="text-base font-bold text-nocturne line-clamp-2 leading-snug mb-1">
            {exam.title}
          </h3>
        </Link>
        <p className="text-xs text-wisteria font-medium mb-3">{exam.conductingBody}</p>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-opaline/20 border border-opaline/50 text-xs mb-4">
          <div className="flex items-center gap-2 text-eclipse">
            <Users className="w-4 h-4 text-wisteria shrink-0" />
            <div>
              <span className="block text-[10px] text-wisteria uppercase font-semibold">Vacancies</span>
              <span className="font-bold">{exam.vacancies.toLocaleString()} Posts</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-eclipse">
            <Award className="w-4 h-4 text-wisteria shrink-0" />
            <div>
              <span className="block text-[10px] text-wisteria uppercase font-semibold">Pay Level</span>
              <span className="font-bold">{exam.payLevel}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-eclipse col-span-2 pt-1 border-t border-opaline/40">
            <Calendar className="w-4 h-4 text-wisteria shrink-0" />
            <div className="flex items-center justify-between w-full">
              <div>
                <span className="block text-[10px] text-wisteria uppercase font-semibold">Last Date to Apply</span>
                <span className="font-medium">{exam.lastDateToApply}</span>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  daysLeft > 0 ? 'bg-nocturne text-starlight' : 'bg-opaline/60 text-eclipse'
                }`}
              >
                {daysLeft > 0 ? `${daysLeft} Days Left` : 'Closed'}
              </span>
            </div>
          </div>
        </div>

        {/* Qualification Snippet */}
        <p className="text-xs text-eclipse/80 line-clamp-2 mb-4">
          <span className="font-semibold text-nocturne">Eligibility: </span>
          {exam.minQualification}
        </p>
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2 pt-3 border-t border-opaline/60">
        <Link to={ROUTES.EXAM_DETAIL(exam.id)} className="flex-1">
          <Button variant="primary" size="sm" className="w-full">
            View Details
          </Button>
        </Link>
        <a
          href={exam.officialWebsite}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg text-wisteria hover:text-nocturne hover:bg-opaline/40 transition-colors"
          title="Visit Official Commission Website"
          aria-label="Official Website"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </Card>
  );
};
