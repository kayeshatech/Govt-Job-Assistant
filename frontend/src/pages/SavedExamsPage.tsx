import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ExternalLink, Trash2, CheckCircle2, Clock, Edit3, ArrowRight } from 'lucide-react';
import { useSavedExams } from '../context/SavedExamsContext';
import { ApplicationTrackingStatus } from '../types/student';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/feedback/EmptyState';
import { ROUTES } from '../config/routes';

export const SavedExamsPage: React.FC = () => {
  const { savedApplications, updateApplicationStatus, removeApplication } = useSavedExams();
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<string>('');

  const statusOptions: ApplicationTrackingStatus[] = [
    'Draft / Planning',
    'Applied & Fee Paid',
    'Admit Card Downloaded',
    'Exam Appeared',
    'Cleared Prelims',
    'Interview Pending',
    'Final Result Declared',
  ];

  const handleEditNotes = (appId: string, currentNotes?: string) => {
    setEditingNotesId(appId);
    setNoteInput(currentNotes || '');
  };

  const handleSaveNotes = (appId: string) => {
    const app = savedApplications.find((a) => a.id === appId);
    if (app) {
      updateApplicationStatus(appId, app.status, noteInput);
    }
    setEditingNotesId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-wisteria uppercase tracking-widest">
              Aspirant Pipeline
            </span>
            <Badge variant="active" size="sm">
              {savedApplications.length} Tracked
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-nocturne">
            Saved Examinations & Application Tracker
          </h1>
          <p className="text-xs sm:text-sm text-eclipse/80 mt-1">
            Maintain your personal government examination applications, registration credentials, admit card statuses, and stage notes.
          </p>
        </div>

        <Link to={ROUTES.EXAMS}>
          <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Add More Exams
          </Button>
        </Link>
      </div>

      {/* Applications List */}
      {savedApplications.length > 0 ? (
        <div className="space-y-4">
          {savedApplications.map((app) => (
            <Card
              key={app.id}
              variant="default"
              className="p-5 sm:p-6 border border-opaline/70 hover:border-wisteria transition-all"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-opaline/60">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="accent" size="sm">
                      {app.status}
                    </Badge>
                    {app.registrationNumber && (
                      <span className="font-mono text-xs font-bold text-wisteria bg-opaline/30 px-2 py-0.5 rounded border border-opaline/50">
                        Reg: {app.registrationNumber}
                      </span>
                    )}
                  </div>
                  <Link to={ROUTES.EXAM_DETAIL(app.examId)} className="group">
                    <h2 className="text-base sm:text-lg font-bold text-nocturne group-hover:text-wisteria transition-colors">
                      {app.examTitle}
                    </h2>
                  </Link>
                  <p className="text-xs text-wisteria font-medium">{app.conductingBody}</p>
                </div>

                {/* Status Selector Dropdown */}
                <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-wisteria hidden sm:inline">
                      Lifecycle Status:
                    </span>
                    <select
                      value={app.status}
                      onChange={(e) =>
                        updateApplicationStatus(app.id, e.target.value as ApplicationTrackingStatus)
                      }
                      className="text-xs font-bold rounded-lg bg-starlight border border-opaline/80 text-nocturne py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-wisteria"
                    >
                      {statusOptions.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => removeApplication(app.id)}
                    className="p-2 text-wisteria hover:text-nocturne hover:bg-opaline/40 rounded-lg transition-colors"
                    title="Remove from tracker"
                    aria-label="Remove application"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notes & Exam Details Row */}
              <div className="pt-4 flex flex-col sm:flex-row items-start justify-between gap-4 text-xs">
                <div className="flex-1">
                  <span className="font-bold text-wisteria block mb-1">Aspirant Prep Notes:</span>
                  {editingNotesId === app.id ? (
                    <div className="flex items-center gap-2 max-w-lg">
                      <input
                        type="text"
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        placeholder="Add notes: e.g. Roll number, center location, revision progress..."
                        className="w-full text-xs p-1.5 rounded bg-starlight border border-opaline text-eclipse"
                      />
                      <Button variant="primary" size="sm" onClick={() => handleSaveNotes(app.id)}>
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-eclipse">
                      <p className="italic text-eclipse/80">
                        {app.notes || 'No notes added. Click edit to add roll number, center or strategy.'}
                      </p>
                      <button
                        onClick={() => handleEditNotes(app.id, app.notes)}
                        className="text-wisteria hover:text-nocturne p-1"
                        title="Edit notes"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link to={ROUTES.EXAM_DETAIL(app.examId)}>
                    <Button variant="outline" size="sm">
                      Exam Details
                    </Button>
                  </Link>
                  <Link to={ROUTES.ROADMAP}>
                    <Button variant="secondary" size="sm">
                      View Roadmap
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bookmark className="w-8 h-8" />}
          title="No Tracked Examinations Yet"
          description="You haven't saved any government examination applications to your tracker board."
          actionLabel="Browse Exam Directory"
          onAction={() => window.location.assign(ROUTES.EXAMS)}
        />
      )}
    </div>
  );
};
