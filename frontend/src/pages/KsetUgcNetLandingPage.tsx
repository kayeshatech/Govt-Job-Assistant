import React from 'react';
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
} from 'lucide-react';
import { ROUTES } from '../config/routes';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const KsetUgcNetLandingPage: React.FC = () => {
  const paper1Units = [
    { unit: 'Unit 1', name: 'Teaching Aptitude', topics: 'Teaching concepts, objectives, levels of teaching, learner characteristics' },
    { unit: 'Unit 2', name: 'Research Aptitude', topics: 'Research types, methods, thesis formatting, ethics, paper writing' },
    { unit: 'Unit 3', name: 'Reading Comprehension', topics: 'Passage inferences, textual deductions, vocabulary' },
    { unit: 'Unit 4', name: 'Communication', topics: 'Classroom communication, barriers, effective mass-media interaction' },
    { unit: 'Unit 5', name: 'Mathematical Reasoning & Aptitude', topics: 'Number series, letter codes, proportions, percentages, interest' },
    { unit: 'Unit 6', name: 'Logical Reasoning', topics: 'Arguments, Indian Logic (Pramanas, Anumana), Venn diagrams' },
    { unit: 'Unit 7', name: 'Data Interpretation', topics: 'Graphical representation, bar-charts, tabular data analysis' },
    { unit: 'Unit 8', name: 'Information & Comm. Tech (ICT)', topics: 'General abbreviations, internet terminology, digital public initiatives' },
    { unit: 'Unit 9', name: 'People, Development & Environment', topics: 'SDGs, pollution impacts, climate agreements, National Action Plan' },
    { unit: 'Unit 10', name: 'Higher Education System', topics: 'Ancient universities, post-independence policies, NEP 2020 governance' },
  ];

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
            Master the Karnataka State Eligibility Test (KEA) and National Eligibility Test (NTA) for Assistant Professorship and Junior Research Fellowship (JRF). Complete Paper-1 unit handbook, Computer Science Paper-2 syllabus, and past qualifying cutoff benchmarks.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to={ROUTES.ROADMAP}>
              <Button variant="secondary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Launch KSET Roadmap
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
          </div>
        </div>
      </div>

      {/* 2. KEY ELIGIBILITY CRITERIA HIGHLIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="default" className="p-5">
          <div className="w-9 h-9 rounded-lg bg-opaline/30 flex items-center justify-center text-nocturne mb-3">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-nocturne mb-1">Qualifying Degree</h3>
          <p className="text-xs text-eclipse/80 leading-relaxed">
            Master's Degree (M.Sc, M.Tech, MCA, M.A, M.Com) with aggregate minimum 55% marks (50% for SC/ST/PwD/OBC-NCL candidates).
          </p>
        </Card>

        <Card variant="default" className="p-5">
          <div className="w-9 h-9 rounded-lg bg-opaline/30 flex items-center justify-center text-nocturne mb-3">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-nocturne mb-1">Age Limit Norms</h3>
          <p className="text-xs text-eclipse/80 leading-relaxed">
            <strong>No upper age ceiling</strong> for Assistant Professor eligibility test. For JRF, upper age limit is 30 years (relaxed up to 35 for reserved & women candidates).
          </p>
        </Card>

        <Card variant="default" className="p-5">
          <div className="w-9 h-9 rounded-lg bg-opaline/30 flex items-center justify-center text-nocturne mb-3">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-nocturne mb-1">Marking Scheme</h3>
          <p className="text-xs text-eclipse/80 leading-relaxed">
            Paper 1: 50 Questions (100 Marks). Paper 2: 100 Questions (200 Marks). <strong>Zero negative marking</strong> for wrong answers.
          </p>
        </Card>
      </div>

      {/* 3. PAPER 1 COMPULSORY 10 UNITS BREAKDOWN */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-wisteria uppercase tracking-widest mb-1">
              General Paper On Teaching & Research
            </h2>
            <p className="text-xl font-bold text-nocturne">Paper 1: 10 Core Syllabus Units</p>
          </div>
          <Link to={ROUTES.MATERIALS}>
            <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
              Download Handbook PDF
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {paper1Units.map((u, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-starlight border border-opaline/70 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-wisteria">{u.unit}</span>
                <span className="text-[11px] font-semibold text-nocturne bg-opaline/30 px-2 py-0.5 rounded">
                  5 Questions (10 Marks)
                </span>
              </div>
              <h3 className="text-sm font-bold text-nocturne">{u.name}</h3>
              <p className="text-xs text-eclipse/80">{u.topics}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. PAPER 2 SUBJECT DISCIPLINES */}
      <Card variant="default" className="p-6 space-y-4">
        <h2 className="text-base font-bold text-nocturne">
          Paper 2 Specialization Disciplines (100 Questions / 200 Marks)
        </h2>
        <p className="text-xs text-eclipse/80 leading-relaxed">
          KSET & UGC-NET evaluate in-depth postgraduate competence. Our system offers structured syllabus mapping and previous year papers for major streams:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            'Computer Science & Applications (Code 87)',
            'Electronic Science (Code 88)',
            'Commerce & Management',
            'Life Sciences & Biotechnology',
            'Chemical & Physical Sciences',
            'Economics & Rural Development',
            'English & Indian Languages',
            'Political Science & Public Admin',
          ].map((stream, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-opaline/20 border border-opaline/60 font-semibold text-nocturne">
              {stream}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
