import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Shield,
  Target,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { ROUTES } from '../config/routes';
import { APP_CONFIG } from '../config/brand';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { ReservationCategory, EducationLevel } from '../types/student';

export const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const { user, completeOnboarding } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Wizard state
  const [formData, setFormData] = useState({
    educationLevel: (user?.educationLevel || 'Bachelor of Engineering / B.Tech') as EducationLevel,
    majorStream: user?.majorStream || 'Computer Science & Engineering',
    graduationYear: user?.graduationYear || 2024,
    graduationPercentage: user?.graduationPercentage || 72,
    dateOfBirth: user?.dateOfBirth || '2001-05-15',
    category: (user?.category || 'General / UR') as ReservationCategory,
    domicileState: user?.domicileState || 'Karnataka',
    isPwD: user?.isPwD || false,
    targetCategories: user?.targetCategories || ['Civil Services', 'Teaching & Lectureship'],
    preferredDailyStudyHours: user?.preferredDailyStudyHours || 6,
  });

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

  const categoryOptions = [
    { label: 'General / Unreserved (UR)', value: 'General / UR' },
    { label: 'Economically Weaker Section (EWS)', value: 'EWS' },
    { label: 'Other Backward Classes (OBC-NCL)', value: 'OBC-NCL' },
    { label: 'Scheduled Caste (SC)', value: 'SC' },
    { label: 'Scheduled Tribe (ST)', value: 'ST' },
    { label: 'Person with Benchmark Disability (PwD)', value: 'PwD' },
  ];

  const educationOptions = [
    { label: 'Bachelor of Engineering / B.Tech', value: 'Bachelor of Engineering / B.Tech' },
    { label: 'Undergraduate (Final Year Student)', value: 'Undergraduate (Final Year)' },
    { label: 'Bachelor of Science (B.Sc)', value: 'Bachelor of Science (B.Sc)' },
    { label: 'Bachelor of Commerce (B.Com)', value: 'Bachelor of Commerce (B.Com)' },
    { label: 'Bachelor of Arts (B.A)', value: 'Bachelor of Arts (B.A)' },
    { label: 'Master of Technology (M.Tech)', value: 'Master of Technology (M.Tech)' },
    { label: 'Master of Science (M.Sc)', value: 'Master of Science (M.Sc)' },
    { label: 'Master of Arts (M.A)', value: 'Master of Arts (M.A)' },
    { label: 'Ph.D / Research Scholar', value: 'Ph.D / Research Scholar' },
  ];

  const targetCategoryList = [
    { id: 'Civil Services', name: 'Civil Services (UPSC CSE / State PSC)' },
    { id: 'Staff Selection', name: 'Staff Selection Commission (SSC CGL / CHSL)' },
    { id: 'Engineering & PSU', name: 'PSUs & Technical (ISRO / BARC / GATE)' },
    { id: 'Teaching & Lectureship', name: 'Teaching & Research (UGC-NET / KSET)' },
    { id: 'Banking & Finance', name: 'Banking & Finance (IBPS / SBI / RBI)' },
    { id: 'Railways', name: 'Indian Railways (RRB NTPC / JE)' },
  ];

  const toggleCategory = (catId: string) => {
    setFormData((prev) => {
      const exists = prev.targetCategories.includes(catId);
      const updated = exists
        ? prev.targetCategories.filter((c) => c !== catId)
        : [...prev.targetCategories, catId];
      return { ...prev, targetCategories: updated };
    });
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      completeOnboarding(formData);
      showToast('Onboarding Complete!', 'Your customized exam intelligence feed is ready.', 'success');
      navigate(ROUTES.DASHBOARD);
    }
  };

  const calculateAge = (dob: string) => {
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8 px-4">
      {/* Step Indicator Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-bold text-wisteria uppercase tracking-widest">
          Aspirant Profiling Wizard • Step {step} of 4
        </span>
        <h1 className="text-2xl font-black text-nocturne mt-1">Configure Your Examination Engine</h1>
        <div className="flex items-center justify-center gap-2 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step
                  ? 'w-10 bg-nocturne'
                  : i < step
                  ? 'w-6 bg-wisteria'
                  : 'w-6 bg-opaline/50'
              }`}
            />
          ))}
        </div>
      </div>

      <Card variant="elevated" className="p-6 sm:p-8">
        {/* STEP 1: Academic Background */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center gap-3 pb-3 border-b border-opaline/60">
              <div className="w-10 h-10 rounded-xl bg-nocturne text-starlight flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-nocturne">Academic Qualifications</h2>
                <p className="text-xs text-wisteria">Used for automatic qualification screening across exams</p>
              </div>
            </div>

            <Select
              label="Highest Qualification Degree"
              options={educationOptions}
              value={formData.educationLevel}
              onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value as EducationLevel })}
              required
            />

            <Input
              label="Major Discipline / Specialization"
              value={formData.majorStream}
              onChange={(e) => setFormData({ ...formData, majorStream: e.target.value })}
              placeholder="e.g. Computer Science, Mechanical, History, Commerce"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Passing / Final Year"
                type="number"
                min={1990}
                max={2030}
                value={formData.graduationYear}
                onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) || 2024 })}
                required
              />
              <Input
                label="Aggregate Marks / CGPA Equivalent (%)"
                type="number"
                min={35}
                max={100}
                value={formData.graduationPercentage}
                onChange={(e) => setFormData({ ...formData, graduationPercentage: parseFloat(e.target.value) || 60 })}
                helperText="Convert CGPA to % using your University formula"
                required
              />
            </div>
          </div>
        )}

        {/* STEP 2: Age, Domicile & Category */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center gap-3 pb-3 border-b border-opaline/60">
              <div className="w-10 h-10 rounded-xl bg-nocturne text-starlight flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-nocturne">Domicile & Statutory Category</h2>
                <p className="text-xs text-wisteria">Computes exact age relaxations and state reservation quotas</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Date of Birth (as per 10th Certificate)"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                />
                <p className="text-[11px] text-wisteria font-medium mt-1">
                  Computed Age: <strong className="text-eclipse">{calculateAge(formData.dateOfBirth)} years</strong>
                </p>
              </div>

              <Select
                label="Home State Domicile"
                options={stateOptions}
                value={formData.domicileState}
                onChange={(e) => setFormData({ ...formData, domicileState: e.target.value })}
                required
              />
            </div>

            <Select
              label="Reservation Category"
              options={categoryOptions}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ReservationCategory })}
              helperText="Statutory relaxations will be automatically applied to age limits and cutoffs."
              required
            />

            <div className="p-3.5 rounded-xl bg-opaline/20 border border-opaline/60">
              <label className="flex items-center gap-3 text-xs text-eclipse cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPwD}
                  onChange={(e) => setFormData({ ...formData, isPwD: e.target.checked })}
                  className="rounded border-opaline text-nocturne focus:ring-wisteria"
                />
                <div>
                  <span className="font-bold text-nocturne">Person with Benchmark Disability (PwD)</span>
                  <p className="text-wisteria text-[11px]">
                    Grants +10 years statutory age relaxation and fee exemptions in UPSC, SSC, and Banking exams.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* STEP 3: Target Exam Sectors */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center gap-3 pb-3 border-b border-opaline/60">
              <div className="w-10 h-10 rounded-xl bg-nocturne text-starlight flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-nocturne">Target Examination Sectors</h2>
                <p className="text-xs text-wisteria">Select 1 or more verticals to customize your dashboard</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {targetCategoryList.map((cat) => {
                const isSelected = formData.targetCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'border-wisteria bg-opaline/30 shadow-sm'
                        : 'border-opaline/60 bg-starlight hover:border-aurora'
                    }`}
                  >
                    <div>
                      <span className="block text-xs font-bold text-nocturne leading-snug">{cat.id}</span>
                      <span className="block text-[11px] text-wisteria mt-0.5">{cat.name}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-nocturne shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Study Habits & Daily Commitment */}
        {step === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center gap-3 pb-3 border-b border-opaline/60">
              <div className="w-10 h-10 rounded-xl bg-nocturne text-starlight flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-nocturne">Preparation Plan & Daily Commitment</h2>
                <p className="text-xs text-wisteria">Structures your weekly roadmap milestones and revision goals</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-nocturne mb-1.5 uppercase tracking-wider">
                Daily Study Hours Available: <span className="font-bold text-base text-wisteria">{formData.preferredDailyStudyHours} Hours / Day</span>
              </label>
              <input
                type="range"
                min={2}
                max={14}
                step={1}
                value={formData.preferredDailyStudyHours}
                onChange={(e) => setFormData({ ...formData, preferredDailyStudyHours: parseInt(e.target.value) || 6 })}
                className="w-full accent-nocturne"
              />
              <div className="flex justify-between text-[11px] text-wisteria mt-1 font-semibold">
                <span>2 hrs (Working Professional)</span>
                <span>6 hrs (Balanced)</span>
                <span>12+ hrs (Full Time)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-nocturne text-starlight text-xs space-y-2 border border-wisteria/40">
              <h4 className="font-bold text-starlight">Profile Summary Ready:</h4>
              <p className="text-opaline">
                • <strong>Discipline:</strong> {formData.educationLevel} ({formData.majorStream})
              </p>
              <p className="text-opaline">
                • <strong>Category & State:</strong> {formData.category} • {formData.domicileState} Domicile
              </p>
              <p className="text-opaline">
                • <strong>Targets:</strong> {formData.targetCategories.join(', ') || 'All Sectors'}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-opaline/60 mt-6">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setStep(step - 1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Previous Step
            </Button>
          ) : (
            <div />
          )}

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleNext}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {step === 4 ? 'Launch Dashboard' : 'Continue'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
