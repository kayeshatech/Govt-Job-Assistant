import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { eligibilityService } from '../api/eligibilityService';
import { EligibilityQuery, ExamEligibilityResult } from '../types/eligibility';
import { ReservationCategory } from '../types/student';
import { ROUTES } from '../config/routes';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/feedback/Skeleton';

export const EligibilityCheckerPage: React.FC = () => {
  const { user } = useAuth();

  const [query, setQuery] = useState<EligibilityQuery>({
    age: user?.age || 24,
    category: (user?.category || 'General / UR') as ReservationCategory,
    qualification: user?.educationLevel || 'Bachelor of Engineering / B.Tech',
    percentage: user?.graduationPercentage || 74,
    domicileState: user?.domicileState || 'Karnataka',
    isPwD: user?.isPwD || false,
    stream: user?.majorStream || 'Computer Science & Engineering',
  });

  const [results, setResults] = useState<ExamEligibilityResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const categoryOptions = [
    { label: 'General / Unreserved (UR)', value: 'General / UR' },
    { label: 'Economically Weaker Section (EWS)', value: 'EWS' },
    { label: 'Other Backward Classes (OBC-NCL)', value: 'OBC-NCL' },
    { label: 'Scheduled Caste (SC)', value: 'SC' },
    { label: 'Scheduled Tribe (ST)', value: 'ST' },
    { label: 'Person with Disability (PwD)', value: 'PwD' },
  ];

  const stateOptions = [
    'Karnataka',
    'Maharashtra',
    'Tamil Nadu',
    'Uttar Pradesh',
    'Delhi (NCT)',
    'Kerala',
    'Telangana',
    'Andhra Pradesh',
    'Rajasthan',
    'Madhya Pradesh',
    'Bihar',
    'West Bengal',
  ].map((s) => ({ label: s, value: s }));

  const qualificationOptions = [
    { label: 'Bachelor of Engineering / B.Tech', value: 'Bachelor of Engineering / B.Tech' },
    { label: 'Undergraduate (Final Year)', value: 'Undergraduate (Final Year)' },
    { label: 'Bachelor of Science (B.Sc)', value: 'Bachelor of Science (B.Sc)' },
    { label: 'Bachelor of Commerce (B.Com)', value: 'Bachelor of Commerce (B.Com)' },
    { label: 'Bachelor of Arts (B.A)', value: 'Bachelor of Arts (B.A)' },
    { label: 'Master of Technology (M.Tech)', value: 'Master of Technology (M.Tech)' },
    { label: 'Master of Science (M.Sc)', value: 'Master of Science (M.Sc)' },
    { label: 'Master of Arts (M.A)', value: 'Master of Arts (M.A)' },
    { label: 'Ph.D / Research Scholar', value: 'Ph.D / Research Scholar' },
  ];

  const runCheck = async () => {
    setIsLoading(true);
    try {
      const res = await eligibilityService.checkEligibility(query);
      setResults(res.data);
    } catch (err) {
      console.error('Eligibility check error', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runCheck();
  }, []);

  const handleResetToProfile = () => {
    if (user) {
      setQuery({
        age: user.age,
        category: user.category,
        qualification: user.educationLevel,
        percentage: user.graduationPercentage,
        domicileState: user.domicileState,
        isPwD: user.isPwD,
        stream: user.majorStream,
      });
    }
  };

  const eligibleCount = results.filter((r) => r.isEligible).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-nocturne">
          Multi-Factor Eligibility Screener
        </h1>
        <p className="text-xs sm:text-sm text-eclipse/80 mt-1">
          Screen your age, education, and statutory reservation categories against official Central and State government recruitment rules.
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input Form (1 Col) */}
        <div className="space-y-6">
          <Card variant="elevated" className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-opaline/60">
              <h2 className="text-sm font-bold text-nocturne uppercase tracking-wider">
                Candidate Parameters
              </h2>
              <button
                type="button"
                onClick={handleResetToProfile}
                className="text-xs font-semibold text-wisteria hover:text-nocturne inline-flex items-center gap-1"
                title="Reset to Profile Values"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Candidate Age (Yrs)"
                type="number"
                min={18}
                max={50}
                value={query.age}
                onChange={(e) => setQuery({ ...query, age: parseInt(e.target.value) || 21 })}
                required
              />

              <Input
                label="Qualifying Marks (%)"
                type="number"
                min={35}
                max={100}
                value={query.percentage}
                onChange={(e) => setQuery({ ...query, percentage: parseFloat(e.target.value) || 60 })}
                required
              />
            </div>

            <Select
              label="Reservation Category"
              options={categoryOptions}
              value={query.category}
              onChange={(e) => setQuery({ ...query, category: e.target.value as ReservationCategory })}
              helperText="Applies Central & State statutory age relaxations"
            />

            <Select
              label="Qualification Degree"
              options={qualificationOptions}
              value={query.qualification}
              onChange={(e) => setQuery({ ...query, qualification: e.target.value })}
            />

            <Input
              label="Discipline / Major Stream"
              value={query.stream}
              onChange={(e) => setQuery({ ...query, stream: e.target.value })}
              placeholder="e.g. Computer Science, Mechanical"
            />

            <Select
              label="State of Domicile"
              options={stateOptions}
              value={query.domicileState}
              onChange={(e) => setQuery({ ...query, domicileState: e.target.value })}
            />

            <div className="p-3 rounded-lg bg-opaline/20 border border-opaline/60">
              <label className="flex items-center gap-2.5 text-xs text-eclipse cursor-pointer">
                <input
                  type="checkbox"
                  checked={query.isPwD}
                  onChange={(e) => setQuery({ ...query, isPwD: e.target.checked })}
                  className="rounded border-opaline text-nocturne focus:ring-wisteria"
                />
                <span className="font-medium text-nocturne">
                  Person with Benchmark Disability (PwD)
                </span>
              </label>
            </div>

            <Button
              type="button"
              variant="primary"
              size="md"
              className="w-full"
              onClick={runCheck}
              isLoading={isLoading}
            >
              Recalculate Eligibility
            </Button>
          </Card>

          {/* Statutory Note Box */}
          <div className="p-4 rounded-xl bg-opaline/20 border border-opaline/60 text-xs text-eclipse/90 space-y-2">
            <div className="flex items-center gap-2 font-bold text-nocturne">
              <ShieldCheck className="w-4 h-4 text-wisteria" />
              <span>Age Relaxation Standards Applied</span>
            </div>
            <p className="text-[11px] text-wisteria leading-relaxed">
              • General: Standard notification limit<br />
              • OBC-NCL: +3 Years statutory relaxation<br />
              • SC / ST: +5 Years statutory relaxation<br />
              • PwD: +10 Years statutory relaxation
            </p>
          </div>
        </div>

        {/* Right Column: Results Feed (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-4 rounded-xl bg-starlight border border-opaline/70 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-wisteria uppercase tracking-wider block">
                Screening Summary
              </span>
              <span className="text-base font-black text-nocturne mt-0.5 block">
                Eligible for <strong className="text-nocturne underline">{eligibleCount}</strong> out of {results.length} National Examinations
              </span>
            </div>
            <Badge variant="active" size="md">
              {query.category}
            </Badge>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={160} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <Card
                  key={result.examId}
                  variant="default"
                  className={`p-5 border transition-all ${
                    result.isEligible
                      ? 'border-opaline/80 bg-starlight'
                      : 'border-opaline/50 bg-opaline/10 opacity-90'
                  }`}
                >
                  {/* Result Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-opaline/60">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={result.isEligible ? 'active' : 'default'} size="sm">
                          {result.isEligible ? '✓ Fully Eligible' : 'Criteria Under Review'}
                        </Badge>
                        <span className="text-xs text-wisteria font-semibold">
                          Match: {result.eligibilityPercentage}%
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-nocturne">{result.examTitle}</h3>
                      <p className="text-xs text-wisteria">{result.conductingBody}</p>
                    </div>

                    <Link to={ROUTES.EXAM_DETAIL(result.examId)}>
                      <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Exam Detail
                      </Button>
                    </Link>
                  </div>

                  {/* Individual Checks Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 text-xs">
                    {result.checks.map((check, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg border ${
                          check.passed
                            ? 'bg-opaline/15 border-opaline/60'
                            : 'bg-starlight border-wisteria/40'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold mb-1">
                          {check.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-nocturne shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-wisteria shrink-0" />
                          )}
                          <span className="text-nocturne">{check.title}</span>
                        </div>
                        <p className="text-[11px] text-eclipse/80">
                          <strong>Required:</strong> {check.required}
                        </p>
                        <p className="text-[11px] text-wisteria mt-0.5">
                          <strong>Your Profile:</strong> {check.candidateValue}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Recommendation Note */}
                  <div className="pt-2 text-xs text-eclipse font-medium">
                    <span className="text-wisteria font-bold">Recommendation: </span>
                    {result.recommendation}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
