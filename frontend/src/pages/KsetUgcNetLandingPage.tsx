import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ArrowRight,
  Download,
  Users,
  Shield,
  Layers,
  Sparkles,
  HelpCircle,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { ROUTES } from '../config/routes';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/feedback/Skeleton';
import { ksetService, KsetCurriculumOverview, QuestionItem } from '../api/ksetService';
import { preparationService } from '../api/preparationService';
import { useToast } from '../context/ToastContext';

export const KsetUgcNetLandingPage: React.FC = () => {
  const [curriculum, setCurriculum] = useState<KsetCurriculumOverview | null>(null);
  const [pyqs, setPyqs] = useState<QuestionItem[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<number>(1);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  useEffect(() => {
    const loadCurriculumData = async () => {
      setIsLoading(true);
      try {
        const [currData, pyqData] = await Promise.all([
          ksetService.getCurriculum(),
          ksetService.getPyqs(selectedUnit),
        ]);
        setCurriculum(currData);
        setPyqs(pyqData);
      } catch (err) {
        console.error('Failed to load KSET curriculum', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadCurriculumData();
  }, []);

  const handleUnitChange = async (unitNum: number) => {
    setSelectedUnit(unitNum);
    setIsLoading(true);
    setUserAnswers({});
    setIsSubmitted(false);
    try {
      const pyqData = await ksetService.getPyqs(unitNum);
      setPyqs(pyqData);
    } catch (err) {
      console.error('Failed to fetch unit PYQs', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleGradeQuiz = () => {
    setIsSubmitted(true);
    let correct = 0;
    pyqs.forEach((q) => {
      if (userAnswers[q.id] === q.correct_option_index) {
        correct++;
      }
    });
    const marks = correct * 2.0;
    showToast('Practice Scored', `Scored ${marks}/${pyqs.length * 2} marks (+2 per correct, 0 negative).`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* 1. HERO HUB BANNER */}
      <div className="p-8 sm:p-10 rounded-2xl bg-nocturne text-starlight border border-wisteria/40 relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <Badge variant="aurora" size="md">
            Collegiate Lectureship & Research Hub
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-starlight leading-tight">
            KSET & UGC-NET Preparation Headquarters
          </h1>
          <p className="text-sm text-opaline leading-relaxed">
            Master the Karnataka State Eligibility Test (KEA) and National Eligibility Test (NTA) for Assistant Professorship and Junior Research Fellowship (JRF). Complete Paper-1 10-unit curriculum, Computer Science Paper-2 syllabus, and verified PYQ practice with zero negative marking.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to={ROUTES.ROADMAP}>
              <Button variant="secondary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Launch Curriculum Roadmap
              </Button>
            </Link>
            <a
              href="https://cetonline.karnataka.gov.in/kea/kset2026"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="md" rightIcon={<ExternalLink className="w-4 h-4" />}>
                KEA KSET Portal
              </Button>
            </a>
            <a
              href="https://ugcnet.nta.ac.in"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="md" rightIcon={<ExternalLink className="w-4 h-4" />}>
                NTA UGC-NET Portal
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* 2. STATUTORY ELIGIBILITY & MARKING RULES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="default" className="p-5 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-opaline/30 flex items-center justify-center text-nocturne mb-1">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-nocturne">Qualifying Degree Standard</h3>
          <p className="text-xs text-eclipse/80 leading-relaxed">
            Master's Degree (M.Sc, M.Tech, MCA, M.A, M.Com) with aggregate minimum 55% marks (50% for SC/ST/PwD/OBC-NCL candidates). Final year candidates may appear conditionally.
          </p>
        </Card>

        <Card variant="default" className="p-5 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-opaline/30 flex items-center justify-center text-nocturne mb-1">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-nocturne">Age Ceiling Norms</h3>
          <p className="text-xs text-eclipse/80 leading-relaxed">
            <strong>No upper age ceiling</strong> for Assistant Professor eligibility test. For JRF, upper age limit is 30 years (relaxed up to 35 years for reserved & women candidates).
          </p>
        </Card>

        <Card variant="default" className="p-5 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-opaline/30 flex items-center justify-center text-nocturne mb-1">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-nocturne">Objective Marking Pattern</h3>
          <p className="text-xs text-eclipse/80 leading-relaxed">
            Paper 1: 50 Questions (100 Marks). Paper 2: 100 Questions (200 Marks). <strong>Zero negative marking</strong> for wrong attempts (+2 marks per correct answer).
          </p>
        </Card>
      </div>

      {/* 3. EXAM DISTINCTIONS: KEA KSET VS NTA UGC-NET */}
      {curriculum && (
        <Card variant="default" className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-wisteria" />
            <h2 className="text-base font-bold text-nocturne">
              Institutional Distinctions & Guidelines
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {curriculum.exam_distinctions.map((dist, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white border border-opaline text-xs text-eclipse flex items-start gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-aurora flex-shrink-0 mt-0.5" />
                <span>{dist}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 4. PAPER 1 10-UNIT CURRICULUM BROWSER & PYQ PRACTICE */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-wisteria uppercase tracking-widest">
              Paper I Unit Breakdown
            </span>
            <Badge variant="active" size="sm">
              10 Compulsory Units
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-nocturne">
            General Paper on Teaching & Research Aptitude
          </h2>
          <p className="text-xs text-eclipse/80 mt-1">
            Select any unit below to inspect high-yield subtopics and practice verified previous-year questions with backend scoring.
          </p>
        </div>

        {/* Units Navigation Grid */}
        {curriculum && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {curriculum.paper_1.units.map((u) => (
              <button
                key={u.unit_number}
                onClick={() => handleUnitChange(u.unit_number)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  selectedUnit === u.unit_number
                    ? 'bg-nocturne text-starlight border-nocturne shadow-md'
                    : 'bg-starlight text-nocturne border-opaline hover:border-wisteria'
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-wisteria block">
                  Unit {u.unit_number}
                </span>
                <span className="text-xs font-bold line-clamp-1 mt-0.5">
                  {u.title}
                </span>
                <span className="text-[10px] opacity-70 block mt-1">
                  {u.weightage_marks} Marks
                </span>
              </button>
            ))}
          </div>
        )}

        {/* PYQ Practice Section for Selected Unit */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-nocturne uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-wisteria" />
              Unit {selectedUnit} Practice Questions ({pyqs.length} Verified Items)
            </h3>
            {isSubmitted ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setUserAnswers({});
                  setIsSubmitted(false);
                }}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Reset Answers
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleGradeQuiz}
                disabled={Object.keys(userAnswers).length === 0}
                rightIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Grade Unit Practice
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-36 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {pyqs.map((q, idx) => {
                const selected = userAnswers[q.id];
                const isCorrect = isSubmitted && selected === q.correct_option_index;
                const isWrong = isSubmitted && selected !== undefined && selected !== q.correct_option_index;

                return (
                  <Card
                    key={q.id}
                    variant="default"
                    className={`p-5 space-y-3 transition-colors ${
                      isCorrect ? 'border-aurora/80 bg-starlight/40' : isWrong ? 'border-wisteria/60' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant="subtle" size="sm">
                          Q{idx + 1}
                        </Badge>
                        <Badge variant="active" size="sm">
                          {q.difficulty}
                        </Badge>
                        <span className="text-wisteria font-bold text-[11px]">
                          +{q.marks} / -{q.negative_marks}
                        </span>
                      </div>
                      <span className="text-[11px] text-eclipse/60 font-mono">
                        {q.source_citation}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-nocturne leading-relaxed">
                      {q.question_text}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, oIdx) => {
                        const isChosen = selected === oIdx;
                        const isAnswerKey = isSubmitted && oIdx === q.correct_option_index;

                        let style = 'bg-white border-opaline/80 text-eclipse hover:border-wisteria';
                        if (isChosen && !isSubmitted) {
                          style = 'bg-nocturne text-starlight border-nocturne font-bold';
                        } else if (isAnswerKey) {
                          style = 'bg-opaline/50 border-wisteria text-nocturne font-bold';
                        } else if (isChosen && isWrong) {
                          style = 'bg-wisteria/20 border-wisteria text-nocturne font-semibold line-through';
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectOption(q.id, oIdx)}
                            disabled={isSubmitted}
                            className={`p-3 rounded-xl text-left text-xs transition-all border flex items-center justify-between ${style}`}
                          >
                            <span>
                              <span className="font-mono font-bold mr-2">
                                {String.fromCharCode(65 + oIdx)}.
                              </span>
                              {opt}
                            </span>
                            {isAnswerKey && (
                              <span className="text-[10px] text-wisteria font-bold uppercase ml-2">
                                Correct Key
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {isSubmitted && q.explanation && (
                      <div className="p-3 rounded-xl bg-starlight border border-opaline text-xs text-eclipse/90 space-y-1">
                        <strong className="text-nocturne">Authoritative Explanation: </strong>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. PAPER 2 SUBJECTS */}
      {curriculum && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-black text-nocturne">
              Subject-Specific Paper II Disciplines
            </h2>
            <p className="text-xs text-eclipse/80 mt-1">
              100 Objective Questions (200 Marks) aligned with Post-Graduate discipline standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {curriculum.paper_2_subjects.map((sub) => (
              <Card key={sub.code} variant="default" className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="subtle" size="sm">
                    Subject Code: {sub.code}
                  </Badge>
                  <span className="text-xs font-bold text-wisteria">
                    {sub.total_questions} Questions (200 Marks)
                  </span>
                </div>
                <h3 className="text-sm font-bold text-nocturne">{sub.name}</h3>
                <p className="text-xs text-eclipse/80">Academic Level: {sub.standard}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
