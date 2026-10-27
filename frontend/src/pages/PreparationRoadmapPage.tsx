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
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { preparationService, AdaptivePlan } from '../api/preparationService';
import { PreparationRoadmap } from '../types/preparation';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/feedback/Skeleton';
import { useToast } from '../context/ToastContext';

export const PreparationRoadmapPage: React.FC = () => {
  const [activeView, setActiveView] = useState<'roadmap' | 'adaptive_plans' | 'pomodoro'>('roadmap');
  const [selectedExamId, setSelectedExamId] = useState<string>('upsc-cse-2026');
  const [roadmap, setRoadmap] = useState<PreparationRoadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Adaptive Plans State
  const [selectedPlanType, setSelectedPlanType] = useState<string>('last_30_days');
  const [dailyHours, setDailyHours] = useState<number>(6.0);
  const [adaptivePlan, setAdaptivePlan] = useState<AdaptivePlan | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(false);

  // Pomodoro Focus Timer State
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerTopic, setTimerTopic] = useState('General Aptitude Practice');

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

  const loadAdaptivePlan = async (type: string, hours: number) => {
    setIsPlanLoading(true);
    try {
      const plan = await preparationService.getAdaptivePlan(type, hours, 'UPSC CSE 2026');
      setAdaptivePlan(plan);
    } catch (err) {
      console.error('Failed to load adaptive plan', err);
    } finally {
      setIsPlanLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmap(selectedExamId);
  }, [selectedExamId]);

  useEffect(() => {
    if (activeView === 'adaptive_plans') {
      loadAdaptivePlan(selectedPlanType, dailyHours);
    }
  }, [activeView, selectedPlanType, dailyHours]);

  // Pomodoro Timer Interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      preparationService.logPomodoroSession(25, timerTopic);
      showToast('Pomodoro Session Complete!', '25-minute focus session recorded in your streak.', 'success');
      setTimerSeconds(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

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

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
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
              Adaptive Syllabus & Focus Engine
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-nocturne">
            Personalized Preparation Roadmap & Productivity
          </h1>
          <p className="text-xs sm:text-sm text-eclipse/80 mt-1">
            Paced multi-week syllabus progression, 30/7-day emergency blueprints, and Pomodoro focus tracking.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-starlight p-1.5 rounded-xl border border-opaline">
          <button
            onClick={() => setActiveView('roadmap')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeView === 'roadmap'
                ? 'bg-nocturne text-starlight'
                : 'text-eclipse hover:bg-opaline/40'
            }`}
          >
            Syllabus Stages
          </button>
          <button
            onClick={() => setActiveView('adaptive_plans')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeView === 'adaptive_plans'
                ? 'bg-nocturne text-starlight'
                : 'text-eclipse hover:bg-opaline/40'
            }`}
          >
            Adaptive Plans (30d / 7d / Crash)
          </button>
          <button
            onClick={() => setActiveView('pomodoro')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeView === 'pomodoro'
                ? 'bg-nocturne text-starlight'
                : 'text-eclipse hover:bg-opaline/40'
            }`}
          >
            Pomodoro Focus Mode
          </button>
        </div>
      </div>

      {activeView === 'roadmap' && (
        <div className="space-y-6">
          {/* Exam Selector & Progress Bar */}
          <div className="p-5 rounded-2xl bg-starlight border border-opaline/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <label className="block text-[11px] font-bold text-wisteria uppercase mb-1">
                Select Target Roadmap:
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full sm:w-80 text-xs font-bold rounded-lg bg-white border border-opaline text-nocturne py-2 px-3 focus:outline-none focus:ring-2 focus:ring-wisteria"
              >
                {examOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {roadmap && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs font-bold text-wisteria uppercase block">
                    Curriculum Completion
                  </span>
                  <span className="text-xl font-black text-nocturne">
                    {roadmap.overallProgressPercentage}%
                  </span>
                </div>
                <div className="w-32 sm:w-48 bg-opaline/40 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-nocturne h-full rounded-full transition-all duration-500"
                    style={{ width: `${roadmap.overallProgressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Stages Accordion */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
          ) : roadmap ? (
            <div className="space-y-4">
              {roadmap.stages.map((stage, idx) => (
                <Card key={stage.id} variant="default" className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleMilestone(stage.id)}
                        className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-colors border ${
                          stage.isCompleted
                            ? 'bg-nocturne text-starlight border-nocturne'
                            : 'bg-starlight text-transparent border-opaline hover:border-wisteria'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-bold text-wisteria uppercase tracking-wider">
                            {stage.weekRange} • {stage.recommendedHoursPerWeek} hrs/week
                          </span>
                          {stage.isCompleted && (
                            <Badge variant="active" size="sm">
                              Completed
                            </Badge>
                          )}
                        </div>
                        <h2 className="text-base font-bold text-nocturne">
                          {stage.stageName}
                        </h2>
                        {stage.notes && (
                          <p className="text-xs text-eclipse/80 mt-1 leading-relaxed">
                            {stage.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Core Topics Checklist */}
                  <div className="pl-9 space-y-2 pt-2 border-t border-opaline/40">
                    <h3 className="text-[11px] font-bold text-wisteria uppercase">
                      Actionable Topics:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {stage.topics.map((topic, tIdx) => (
                        <div
                          key={tIdx}
                          className="p-2.5 rounded-lg bg-starlight border border-opaline/60 text-xs text-nocturne font-medium flex items-center gap-2"
                        >
                          <Milestone className="w-3.5 h-3.5 text-wisteria flex-shrink-0" />
                          <span>{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {activeView === 'adaptive_plans' && (
        <div className="space-y-6">
          {/* Plan Settings Bar */}
          <div className="p-5 rounded-2xl bg-starlight border border-opaline/70 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-wisteria uppercase mb-1">
                Plan Strategy:
              </label>
              <select
                value={selectedPlanType}
                onChange={(e) => setSelectedPlanType(e.target.value)}
                className="w-full text-xs font-bold rounded-lg bg-white border border-opaline text-nocturne py-2 px-3 focus:outline-none focus:ring-2 focus:ring-wisteria"
              >
                <option value="last_30_days">Last 30 Days Paced Syllabus Mastery</option>
                <option value="last_7_days">Last 7 Days Final Revision Blueprint</option>
                <option value="emergency_crash">Emergency Crash Strategy (60% Rule)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-wisteria uppercase mb-1">
                Daily Study Hours Available:
              </label>
              <input
                type="number"
                min="2"
                max="14"
                step="0.5"
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value) || 6.0)}
                className="w-full text-xs font-bold rounded-lg bg-white border border-opaline text-nocturne py-2 px-3 focus:outline-none focus:ring-2 focus:ring-wisteria"
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => loadAdaptivePlan(selectedPlanType, dailyHours)}
                rightIcon={<Sparkles className="w-4 h-4" />}
              >
                Recalibrate Plan
              </Button>
            </div>
          </div>

          {/* Plan Display */}
          {isPlanLoading ? (
            <Skeleton className="h-64 rounded-2xl" />
          ) : adaptivePlan ? (
            <div className="space-y-4">
              <Card variant="default" className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-opaline/60 pb-3">
                  <div>
                    <Badge variant="aurora" size="sm">
                      {adaptivePlan.target_exam}
                    </Badge>
                    <h2 className="text-lg font-black text-nocturne mt-1">
                      {adaptivePlan.plan_type}
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-wisteria bg-opaline/30 px-3 py-1.5 rounded-lg">
                    {adaptivePlan.daily_allocated_hours} Hours Allocated / Day
                  </span>
                </div>

                {/* Important Pedagogical Disclaimer */}
                <div className="p-3.5 rounded-xl bg-starlight border border-opaline/80 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-wisteria flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-eclipse/80 italic leading-relaxed">
                    <strong>Notice: </strong>
                    {adaptivePlan.disclaimer}
                  </p>
                </div>

                {/* Plan Phases */}
                <div className="space-y-4 pt-2">
                  {adaptivePlan.phases.map((phase, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-5 rounded-2xl bg-white border border-opaline/80 space-y-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-wisteria uppercase bg-opaline/30 px-2 py-0.5 rounded">
                          {phase.days}
                        </span>
                        <span className="text-xs font-bold text-nocturne">
                          {phase.focus_hours_per_day} hrs/day
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-nocturne">
                        {phase.title}
                      </h3>

                      <ul className="space-y-1.5 pl-2">
                        {phase.tasks.map((task, tIdx) => (
                          <li
                            key={tIdx}
                            className="text-xs text-eclipse/90 flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-wisteria" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : null}
        </div>
      )}

      {activeView === 'pomodoro' && (
        <div className="max-w-xl mx-auto space-y-6">
          <Card variant="default" className="p-8 text-center space-y-6">
            <div className="space-y-1">
              <Badge variant="active" size="md">
                Focus Engine
              </Badge>
              <h2 className="text-xl font-black text-nocturne">
                Standard 25-Minute Study Block
              </h2>
              <p className="text-xs text-eclipse/80">
                Eliminate distractions. Timed blocks improve memory consolidation and stamina.
              </p>
            </div>

            <div className="p-8 rounded-full w-56 h-56 mx-auto bg-starlight border-4 border-wisteria flex flex-col items-center justify-center shadow-inner">
              <span className="text-4xl font-mono font-black text-nocturne tracking-widest">
                {formatTimer(timerSeconds)}
              </span>
              <span className="text-[10px] uppercase font-bold text-wisteria mt-1">
                {isTimerRunning ? 'Focus Session Active' : 'Ready to Start'}
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-wisteria uppercase text-left">
                Focus Topic:
              </label>
              <input
                type="text"
                value={timerTopic}
                onChange={(e) => setTimerTopic(e.target.value)}
                className="w-full text-xs font-medium rounded-xl bg-starlight border border-opaline p-2.5 text-nocturne focus:outline-none focus:ring-2 focus:ring-wisteria"
              />
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant={isTimerRunning ? 'outline' : 'primary'}
                size="lg"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                leftIcon={isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              >
                {isTimerRunning ? 'Pause Session' : 'Start Focus Timer'}
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(25 * 60);
                }}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Reset
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
