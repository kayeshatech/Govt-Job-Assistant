import React, { useState, useEffect } from 'react';
import {
  Milestone,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { preparationService } from '../api/preparationService';
import { PreparationRoadmap, StudyMilestone } from '../types/preparation';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/feedback/Skeleton';
import { useToast } from '../context/ToastContext';

export const PreparationRoadmapPage: React.FC = () => {
  const [selectedExamId, setSelectedExamId] = useState<string>('upsc-cse-2026');
  const [roadmap, setRoadmap] = useState<PreparationRoadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const examOptions = [
    { label: 'UPSC Civil Services Examination (CSE) 2026', id: 'upsc-cse-2026' },
    { label: 'KSET / UGC-NET (Teaching & JRF) 2026', id: 'kset-ugc-net-2026' },
  ];

  const loadRoadmap = async (examId: string) => {
    setIsLoading(true);
    try {
      const res = await preparationService.getRoadmap(examId);
      setRoadmap(res.data);
    } catch (err) {
      console.error('Failed to load roadmap', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmap(selectedExamId);
  }, [selectedExamId]);

  const toggleMilestone = (stageId: string) => {
    if (!roadmap) return;
    const updatedStages = roadmap.stages.map((s) =>
      s.id === stageId ? { ...s, isCompleted: !s.isCompleted } : s
    );
    const completedCount = updatedStages.filter((s) => s.isCompleted).length;
    const progress = Math.round((completedCount / updatedStages.length) * 100);

    setRoadmap({
      ...roadmap,
      stages: updatedStages,
      overallProgressPercentage: progress,
    });

    showToast('Milestone Updated', 'Roadmap completion score refreshed.', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-wisteria uppercase tracking-widest">
              Stage-by-Stage Strategy
            </span>
            <Badge variant="active" size="sm">
              AI Syllabus Planner
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-nocturne">
            Personalized Preparation Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-eclipse/80 mt-1">
            Paced multi-week syllabus progression, milestone checklists, and NCERT foundation frameworks.
          </p>
        </div>

        {/* Exam Selector */}
        <div className="w-full sm:w-auto">
          <label className="block text-[11px] font-bold text-wisteria uppercase mb-1">
            Select Target Roadmap:
          </label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full sm:w-80 text-xs font-bold rounded-lg bg-starlight border border-opaline/80 text-nocturne py-2 px-3 focus:outline-none focus:ring-2 focus:ring-wisteria"
          >
            {examOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading || !roadmap ? (
        <div className="space-y-4">
          <Skeleton height={80} />
          <Skeleton height={200} />
          <Skeleton height={200} />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Roadmap Overall Summary Card */}
          <Card variant="elevated" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              <div className="md:col-span-2">
                <span className="text-xs font-bold text-wisteria uppercase tracking-wider block">
                  Target Examination
                </span>
                <h2 className="text-xl font-bold text-nocturne mt-0.5">{roadmap.examTitle}</h2>
                <p className="text-xs text-wisteria mt-1">
                  Estimated duration: <strong>{roadmap.estimatedPreparationWeeks} Weeks</strong> • Current: Week {roadmap.currentWeek}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-opaline/20 border border-opaline/60 text-center">
                <span className="text-[11px] font-bold text-wisteria uppercase block">
                  Overall Completion
                </span>
                <span className="text-3xl font-black text-nocturne block mt-0.5">
                  {roadmap.overallProgressPercentage}%
                </span>
                <div className="w-full bg-opaline/40 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-nocturne h-full rounded-full transition-all duration-300"
                    style={{ width: `${roadmap.overallProgressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-opaline/20 border border-opaline/60 text-center">
                <span className="text-[11px] font-bold text-wisteria uppercase block">
                  Pace Recommendation
                </span>
                <span className="text-xl font-black text-nocturne block mt-1">
                  28-32 Hrs/Wk
                </span>
                <span className="text-[11px] text-wisteria">Balanced with mock tests</span>
              </div>
            </div>
          </Card>

          {/* Sequential Stages List */}
          <div className="space-y-6">
            <h3 className="text-base font-bold text-nocturne flex items-center gap-2">
              <Milestone className="w-4 h-4 text-wisteria" />
              <span>Structured Preparation Milestones</span>
            </h3>

            <div className="space-y-4">
              {roadmap.stages.map((stage, idx) => {
                return (
                  <Card
                    key={stage.id}
                    variant="default"
                    className={`p-6 border transition-all ${
                      stage.isCompleted
                        ? 'border-wisteria/40 bg-starlight'
                        : 'border-opaline/70 bg-starlight hover:border-aurora'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-opaline/60">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={stage.isCompleted ? 'active' : 'default'} size="sm">
                            {stage.weekRange}
                          </Badge>
                          <span className="text-xs text-wisteria font-semibold">
                            Recommended: {stage.recommendedHoursPerWeek} hrs/week
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-nocturne">{stage.stageName}</h4>
                      </div>

                      <Button
                        variant={stage.isCompleted ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => toggleMilestone(stage.id)}
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      >
                        {stage.isCompleted ? 'Completed ✓' : 'Mark Completed'}
                      </Button>
                    </div>

                    {/* Stage Topics List */}
                    <div className="pt-4">
                      <h5 className="text-xs font-bold text-wisteria uppercase tracking-wider mb-2">
                        Core Syllabus Modules to Master:
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {stage.topics.map((topic, tidx) => (
                          <div
                            key={tidx}
                            className="p-2.5 rounded-lg bg-opaline/20 border border-opaline/50 flex items-start gap-2"
                          >
                            <span className="text-wisteria font-bold mt-0.5">•</span>
                            <span className="text-eclipse">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Milestone Notes if present */}
                    {stage.notes && (
                      <div className="mt-4 p-3 rounded-lg bg-opaline/30 border border-opaline/60 text-xs text-eclipse flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-wisteria shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-nocturne">Progress Note:</strong> {stage.notes}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
