import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  Bell,
  Calendar,
  Milestone,
  BookOpen,
  Bookmark,
  Sparkles,
  Flame,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useSavedExams } from '../context/SavedExamsContext';
import { examService } from '../api/examService';
import { notificationService } from '../api/notificationService';
import { preparationService } from '../api/preparationService';
import { GovernmentExam } from '../types/exam';
import { RecruitmentNotification } from '../types/notification';
import { MockTestResult, DailyStudyTask } from '../types/preparation';
import { ROUTES } from '../config/routes';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/feedback/Skeleton';
import { ExamCard } from '../components/exam/ExamCard';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { savedApplications } = useSavedExams();

  const [matchingExams, setMatchingExams] = useState<GovernmentExam[]>([]);
  const [notifications, setNotifications] = useState<RecruitmentNotification[]>([]);
  const [mockTests, setMockTests] = useState<MockTestResult[]>([]);
  const [dailyTasks, setDailyTasks] = useState<DailyStudyTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [examsRes, notifsRes, mocksRes, tasksRes] = await Promise.all([
          examService.getExams(),
          notificationService.getNotifications(),
          preparationService.getMockTestResults(),
          preparationService.getDailyTasks(),
        ]);

        setMatchingExams(examsRes.data.slice(0, 3));
        setNotifications(notifsRes.data.slice(0, 4));
        setMockTests(mocksRes.data);
        setDailyTasks(tasksRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const toggleTask = (taskId: string) => {
    setDailyTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
          : t
      )
    );
  };

  const completedTasksCount = dailyTasks.filter((t) => t.status === 'completed').length;
  const taskProgress = dailyTasks.length > 0 ? Math.round((completedTasksCount / dailyTasks.length) * 100) : 0;

  // Chart data formatted strictly with approved colors
  const chartData = mockTests.map((m) => ({
    name: m.examCode,
    score: m.score,
    accuracy: m.accuracyPercentage,
    percentile: m.percentileRank,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. WELCOME SECTION & TOP STATS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-opaline/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-wisteria uppercase tracking-widest">
              Aspirant Workspace
            </span>
            <Badge variant="subtle" size="sm">
              Session Active
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-nocturne tracking-tight">
            Welcome back, {user?.fullName || 'Aspirant'}!
          </h1>
          <p className="text-xs sm:text-sm text-eclipse/80 mt-1">
            Tracking {user?.targetCategories?.join(', ') || 'Civil Services & State Exams'} • Domicile: {user?.domicileState}
          </p>
        </div>

        {/* Quick Top Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to={ROUTES.ROADMAP}>
            <Button variant="outline" size="sm" leftIcon={<Milestone className="w-4 h-4" />}>
              Study Roadmap
            </Button>
          </Link>
          <Link to={ROUTES.ELIGIBILITY}>
            <Button variant="secondary" size="sm" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
              Check Eligibility
            </Button>
          </Link>
          <Link to={ROUTES.AI_ASSISTANT}>
            <Button variant="primary" size="sm" leftIcon={<Sparkles className="w-4 h-4" />}>
              AI Doubt Assistant
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="default" className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-wisteria uppercase tracking-wider block">
              Study Streak
            </span>
            <span className="text-2xl font-black text-nocturne mt-0.5 block">14 Days</span>
            <span className="text-[11px] text-eclipse font-medium">Daily target: {user?.preferredDailyStudyHours || 6}h</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-opaline/30 flex items-center justify-center text-wisteria">
            <Flame className="w-5 h-5 fill-current" />
          </div>
        </Card>

        <Card variant="default" className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-wisteria uppercase tracking-wider block">
              Tracked Exams
            </span>
            <span className="text-2xl font-black text-nocturne mt-0.5 block">
              {savedApplications.length} Exams
            </span>
            <span className="text-[11px] text-wisteria font-medium">In application pipeline</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-opaline/30 flex items-center justify-center text-nocturne">
            <Bookmark className="w-5 h-5" />
          </div>
        </Card>

        <Card variant="default" className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-wisteria uppercase tracking-wider block">
              Mock Accuracy
            </span>
            <span className="text-2xl font-black text-nocturne mt-0.5 block">82.4%</span>
            <span className="text-[11px] text-eclipse font-medium">+4.2% from last week</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-opaline/30 flex items-center justify-center text-nocturne">
            <TrendingUp className="w-5 h-5" />
          </div>
        </Card>

        <Card variant="default" className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-wisteria uppercase tracking-wider block">
              Today's Plan
            </span>
            <span className="text-2xl font-black text-nocturne mt-0.5 block">
              {completedTasksCount}/{dailyTasks.length} Tasks
            </span>
            <span className="text-[11px] text-wisteria font-medium">{taskProgress}% completed</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-opaline/30 flex items-center justify-center text-wisteria">
            <Clock className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* 3. MAIN GRID: TODAY'S STUDY PLAN + MOCK PERFORMANCE CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Study Plan (1 Column) */}
        <Card variant="default" className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-opaline/60">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-wisteria" />
                <h2 className="text-sm font-bold text-nocturne">Today's Study Plan</h2>
              </div>
              <Badge variant="active" size="sm">
                {taskProgress}% Done
              </Badge>
            </div>

            {/* Task list with checkboxes */}
            <div className="space-y-2.5 my-2">
              {dailyTasks.map((task) => {
                const isDone = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                      isDone
                        ? 'bg-opaline/20 border-opaline/60 line-through opacity-75'
                        : 'bg-starlight border-opaline/80 hover:border-wisteria'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => {}}
                      className="mt-0.5 rounded border-opaline text-nocturne focus:ring-wisteria"
                    />
                    <div className="flex-1">
                      <span className="block text-xs font-bold text-nocturne leading-tight">
                        {task.subject}
                      </span>
                      <span className="block text-[11px] text-eclipse/80 mt-0.5 leading-snug">
                        {task.topic}
                      </span>
                      <span className="inline-block text-[10px] text-wisteria font-semibold mt-1">
                        ⏱ {task.durationMinutes} Mins
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-opaline/60">
            <Link to={ROUTES.ROADMAP} className="block text-center">
              <Button variant="subtle" size="sm" className="w-full">
                View Full Preparation Roadmap
              </Button>
            </Link>
          </div>
        </Card>

        {/* Mock Performance Chart (2 Columns) */}
        <Card variant="default" className="p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-opaline/60">
              <div>
                <h2 className="text-sm font-bold text-nocturne">Mock-Test Performance & Accuracy</h2>
                <p className="text-xs text-wisteria">Recent sectional & full test trends</p>
              </div>
              <Badge variant="accent" size="sm">
                Last 4 Simulations
              </Badge>
            </div>

            {/* Recharts strictly adhering to the 6 approved colors */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#CDC4DC" strokeOpacity={0.6} />
                  <XAxis dataKey="name" stroke="#6E5A88" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6E5A88" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#F3EEF8',
                      borderColor: '#6E5A88',
                      borderRadius: '8px',
                      color: '#0C0A16',
                      fontSize: '12px',
                    }}
                  />
                  {/* Bar fill strictly #6E5A88 (Wisteria) and #2A2550 (Nocturne) */}
                  <Bar dataKey="score" fill="#2A2550" radius={[4, 4, 0, 0]} name="Score" />
                  <Bar dataKey="accuracy" fill="#6E5A88" radius={[4, 4, 0, 0]} name="Accuracy %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-opaline/60 text-xs">
            <div className="flex items-center gap-4 text-eclipse">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-nocturne inline-block" /> Score (Marks)
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-wisteria inline-block" /> Accuracy (%)
              </span>
            </div>
            <Link to={ROUTES.MATERIALS} className="font-bold text-nocturne hover:text-wisteria">
              Practice More PYQs →
            </Link>
          </div>
        </Card>
      </div>

      {/* 4. MATCHING EXAMINATIONS ROW */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-nocturne">Matching Government Opportunities</h2>
            <p className="text-xs text-wisteria">Filtered based on your degree and category relaxation</p>
          </div>
          <Link to={ROUTES.EXAMS} className="text-xs font-bold text-nocturne hover:text-wisteria inline-flex items-center gap-1">
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={240} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchingExams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        )}
      </section>

      {/* 5. NEW OFFICIAL NOTIFICATIONS & UPCOMING DEADLINES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Official Notifications Feed */}
        <Card variant="default" className="p-5">
          <div className="flex items-center justify-between pb-3 border-b border-opaline/60 mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-wisteria" />
              <h2 className="text-sm font-bold text-nocturne">New Official Notifications</h2>
            </div>
            <Link to={ROUTES.NOTIFICATIONS} className="text-xs font-bold text-wisteria hover:text-nocturne">
              Full Feed →
            </Link>
          </div>

          <div className="space-y-3">
            {notifications.map((notif) => (
              <Link
                key={notif.id}
                to={ROUTES.NOTIFICATION_DETAIL(notif.id)}
                className="block p-3 rounded-lg border border-opaline/60 hover:border-wisteria/60 hover:bg-opaline/20 transition-all group"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Badge variant={notif.status === 'Active' ? 'active' : 'accent'} size="sm">
                    {notif.status}
                  </Badge>
                  <span className="text-[11px] text-wisteria">{notif.releaseDate}</span>
                </div>
                <h4 className="text-xs font-bold text-nocturne group-hover:text-wisteria line-clamp-1">
                  {notif.title}
                </h4>
                <p className="text-[11px] text-wisteria line-clamp-1 mt-0.5">{notif.agency}</p>
              </Link>
            ))}
          </div>
        </Card>

        {/* Upcoming Application Deadlines */}
        <Card variant="default" className="p-5">
          <div className="flex items-center justify-between pb-3 border-b border-opaline/60 mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-wisteria" />
              <h2 className="text-sm font-bold text-nocturne">Upcoming Deadlines & Countdown</h2>
            </div>
            <Link to={ROUTES.CALENDAR} className="text-xs font-bold text-wisteria hover:text-nocturne">
              Calendar View →
            </Link>
          </div>

          <div className="space-y-3">
            {[
              {
                title: 'UPSC CSE 2026 Application Closing',
                deadline: '2026-03-05',
                days: 9,
                portal: 'upsconline.nic.in',
              },
              {
                title: 'ISRO ICRB Scientist "SC" Registration',
                deadline: '2026-04-10',
                days: 45,
                portal: 'isro.gov.in',
              },
              {
                title: 'KSET / UGC-NET 2026 Form Submission',
                deadline: '2026-05-18',
                days: 83,
                portal: 'cetonline.karnataka.gov.in',
              },
              {
                title: 'SSC CGL 2026 Annual Cycle Opens',
                deadline: '2026-07-15',
                days: 141,
                portal: 'ssc.gov.in',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-opaline/60 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-nocturne leading-tight">{item.title}</h4>
                  <p className="text-[11px] text-wisteria mt-0.5">
                    Deadline: <strong>{item.deadline}</strong> • {item.portal}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded bg-nocturne text-starlight">
                  {item.days}d Left
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
