import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  Bell,
  Calendar,
  Milestone,
  ArrowRight,
  Shield,
  Search,
  BookOpen,
  ChevronDown,
  Sparkles,
  Users,
  Award,
  Layers,
} from 'lucide-react';
import { APP_CONFIG } from '../config/brand';
import { ROUTES } from '../config/routes';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { SAMPLE_EXAMS } from '../fixtures/examsData';
import { ExamCard } from '../components/exam/ExamCard';

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [quickSearch, setQuickSearch] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`${ROUTES.EXAMS}?q=${encodeURIComponent(quickSearch.trim())}`);
    } else {
      navigate(ROUTES.EXAMS);
    }
  };

  const benefits = [
    {
      icon: Compass,
      title: 'Curated Government Directory',
      desc: 'Centralized repository covering UPSC, SSC, Banking, Railways, Defense, PSUs, and UGC-NET/KSET with verified pay scales and vacancies.',
    },
    {
      icon: CheckCircle2,
      title: 'Rule-Based Eligibility Screener',
      desc: 'Instant assessment against statutory criteria including age limits, community category relaxations (OBC, SC, ST, PwD), and educational streams.',
    },
    {
      icon: Bell,
      title: 'Official Notification Watchdog',
      desc: 'Monitor official gazettes and commission updates for new recruitment cycles, corrigendum announcements, and admit card dates.',
    },
    {
      icon: Milestone,
      title: 'Structured Preparation Roadmaps',
      desc: 'Stage-by-stage milestone roadmaps with weekly syllabus goals, NCERT foundation lists, and test series checkpoints.',
    },
    {
      icon: BookOpen,
      title: 'Verified PYQ & Syllabus Library',
      desc: 'Access official 10-year question papers, marking patterns, negative marking rules, and topic-wise distribution graphs.',
    },
    {
      icon: Sparkles,
      title: 'AI Examination Assistant',
      desc: 'Instant guidance on syllabus doubts, preparation timelines, optionals selection, and overlapping topic analysis across exams.',
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Profile & Academic Background',
      desc: 'Enter your graduation discipline, aggregate percentage, date of birth, domicile state, and reservation category.',
    },
    {
      step: '02',
      title: 'Automated Eligibility Screening',
      desc: 'Our engine computes statutory age relaxations and filters matching central and state government recruitment opportunities.',
    },
    {
      step: '03',
      title: 'Plan & Track Milestones',
      desc: 'Bookmark exams, receive calendar deadlines, study topic-wise syllabi, and simulate exam condition mock tests.',
    },
  ];

  const faqs = [
    {
      q: 'Does Govexa show private sector jobs?',
      a: 'No. Govexa is exclusively dedicated to Indian Government examinations, Public Sector Undertakings (PSUs), Central and State Civil Services, and University Lectureship (UGC-NET / KSET). We do not list private corporate jobs.',
    },
    {
      q: 'How does the Eligibility Checker calculate age relaxations?',
      a: 'The engine applies official statutory reservation guidelines: +3 years for OBC-NCL, +5 years for SC/ST, and +10 years for PwD candidates across Central and State examination categories, cross-referencing your date of birth with each exam notice.',
    },
    {
      q: 'Are the syllabus and previous year questions verified?',
      a: 'Yes. All study syllabi and question archives in Govexa correspond to official gazettes published by UPSC, SSC, NTA, and State Commissions. Each record links directly to the official Commission portal.',
    },
    {
      q: 'What is the KSET / UGC-NET preparation module?',
      a: 'It is a dedicated hub for collegiate lectureship and Junior Research Fellowship (JRF) aspirants, featuring Paper 1 Teaching & Research Aptitude drills, Paper 2 syllabus units, and historical cut-off benchmarks.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 py-8">
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="active" size="md" className="mb-4">
            India Government Exam Career Guidance Platform
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-nocturne tracking-tight leading-tight mb-4">
            Discover, Verify & Prepare for Every Indian Government Exam
          </h1>
          <p className="text-base sm:text-lg text-eclipse/80 leading-relaxed mb-8">
            Navigate UPSC, SSC, Banking, Railways, State PSC, and UGC-NET/KSET with intelligent eligibility screening, official notification feeds, and personalized preparation roadmaps.
          </p>

          {/* Quick Search Input */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-xl mx-auto mb-6 bg-opaline/30 p-2 rounded-2xl border border-opaline/80 shadow-sm"
          >
            <div className="relative w-full">
              <Search className="w-5 h-5 text-wisteria absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search exams: UPSC, SSC CGL, ISRO, KSET..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl bg-starlight border border-opaline/70 focus:outline-none focus:ring-2 focus:ring-wisteria text-eclipse placeholder:text-wisteria/70"
              />
            </div>
            <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto shrink-0">
              Find Exams
            </Button>
          </form>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-wisteria">
            <span className="font-semibold text-nocturne">Popular Searches:</span>
            {['UPSC CSE', 'SSC CGL 2026', 'ISRO Scientist SC', 'KSET / UGC-NET', 'KPSC KAS'].map(
              (term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => navigate(`${ROUTES.EXAMS}?q=${encodeURIComponent(term)}`)}
                  className="px-2.5 py-1 rounded-md bg-opaline/30 hover:bg-opaline/60 text-nocturne font-medium transition-colors border border-opaline/50"
                >
                  {term}
                </button>
              )
            )}
          </div>
        </div>

        {/* Highlight Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-5xl mx-auto">
          {[
            { label: 'Central & State Exams', value: '45+', icon: Award },
            { label: 'Monitored Portals', value: '42 Portals', icon: Shield },
            { label: 'Active Vacancies', value: '38,000+', icon: Users },
            { label: 'Eligibility Screener', value: '100% Free', icon: CheckCircle2 },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-starlight border border-opaline/70 shadow-sm text-center"
              >
                <Icon className="w-5 h-5 text-wisteria mx-auto mb-1.5" />
                <span className="block text-xl sm:text-2xl font-black text-nocturne">{stat.value}</span>
                <span className="text-xs text-wisteria font-medium">{stat.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. EXAMINATION CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xs font-bold text-wisteria uppercase tracking-widest mb-1">
              Examination Sectors
            </h2>
            <p className="text-2xl font-black text-nocturne">Explore by Governance Vertical</p>
          </div>
          <Link to={ROUTES.EXAMS} className="text-xs font-bold text-wisteria hover:text-nocturne inline-flex items-center gap-1">
            <span>View All Exams</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {APP_CONFIG.examCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`${ROUTES.EXAMS}?category=${encodeURIComponent(cat.name)}`}
              className="p-5 rounded-xl bg-starlight border border-opaline/70 hover:border-wisteria/60 hover:shadow-card transition-all group block"
            >
              <div className="w-9 h-9 rounded-lg bg-opaline/30 flex items-center justify-center text-nocturne mb-3 group-hover:bg-nocturne group-hover:text-starlight transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-nocturne mb-1 leading-snug">{cat.name}</h3>
              <p className="text-xs text-wisteria font-medium">{cat.code}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED ACTIVE EXAMINATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xs font-bold text-wisteria uppercase tracking-widest mb-1">
              Upcoming Cycles
            </h2>
            <p className="text-2xl font-black text-nocturne">Featured Government Opportunities</p>
          </div>
          <Link to={ROUTES.EXAMS} className="text-xs font-bold text-wisteria hover:text-nocturne inline-flex items-center gap-1">
            <span>Browse Full Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAMPLE_EXAMS.slice(0, 3).map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      </section>

      {/* 4. PLATFORM BENEFITS */}
      <section className="bg-opaline/20 border-y border-opaline/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-wisteria uppercase tracking-widest mb-1">
              Built for Serious Aspirants
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-nocturne">
              Everything You Need for Government Examination Success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <Card key={idx} variant="default" className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-nocturne text-starlight flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-nocturne mb-2">{b.title}</h3>
                  <p className="text-xs text-eclipse/80 leading-relaxed">{b.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS WORKFLOW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-wisteria uppercase tracking-widest mb-1">
            Structured Workflow
          </h2>
          <p className="text-2xl sm:text-3xl font-black text-nocturne">
            From Qualification to Appointment Order
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {workflowSteps.map((step, idx) => (
            <div key={idx} className="relative p-6 rounded-2xl bg-starlight border border-opaline/70">
              <span className="text-4xl font-black text-opaline block mb-3">{step.step}</span>
              <h3 className="text-base font-bold text-nocturne mb-2">{step.title}</h3>
              <p className="text-xs text-eclipse/80 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to={ROUTES.ONBOARDING}>
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Start Student Onboarding Wizard
            </Button>
          </Link>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-xs font-bold text-wisteria uppercase tracking-widest mb-1">
            Frequently Asked Questions
          </h2>
          <p className="text-2xl font-black text-nocturne">Clarifications for Aspirants</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-opaline/70 bg-starlight overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-sm text-nocturne hover:bg-opaline/20"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-wisteria shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-eclipse/80 border-t border-opaline/40 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
