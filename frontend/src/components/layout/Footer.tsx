import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, ExternalLink, Activity } from 'lucide-react';
import { APP_CONFIG } from '../../config/brand';
import { ROUTES } from '../../config/routes';
import apiClient from '../../api/client';

export const Footer: React.FC = () => {
  const [health, setHealth] = useState<{
    status: string;
    dbStatus: string;
    latency?: number;
    provider?: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get('/health')
      .then((res) => {
        if (isMounted && res.data) {
          setHealth({
            status: res.data.status || 'online',
            dbStatus: res.data.database?.status || 'connected',
            latency: res.data.database?.latency_ms ?? 0,
            provider: res.data.database?.provider || 'Supabase PostgreSQL',
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setHealth({
            status: 'offline',
            dbStatus: 'disconnected',
            latency: 0,
          });
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <footer className="bg-eclipse text-starlight border-t border-wisteria/40 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand & Slogan */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-starlight text-nocturne flex items-center justify-center font-black text-sm">
                G
              </div>
              <span className="text-xl font-bold tracking-tight text-starlight">{APP_CONFIG.name}</span>
            </div>
            <p className="text-xs text-opaline leading-relaxed max-w-sm mb-4">
              AI-assisted discovery, eligibility rule screening, recruitment notification watchdog, and personalized preparation engine for Indian Government examinations.
            </p>
            <div className="space-y-1.5 text-xs text-opaline">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-aurora" />
                <span>{APP_CONFIG.supportEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-aurora" />
                <span>Helpline: {APP_CONFIG.nationalHelpline}</span>
              </div>
            </div>
          </div>

          {/* Core Categories */}
          <div>
            <h4 className="text-xs font-bold text-starlight uppercase tracking-wider mb-3">
              Exam Sectors
            </h4>
            <ul className="space-y-2 text-xs text-opaline">
              <li>
                <Link to={`${ROUTES.EXAMS}?category=Civil%20Services`} className="hover:text-starlight transition-colors">
                  Civil Services (UPSC / State)
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.EXAMS}?category=Staff%20Selection`} className="hover:text-starlight transition-colors">
                  Staff Selection (SSC CGL / CHSL)
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.EXAMS}?category=Engineering%20%26%20PSU`} className="hover:text-starlight transition-colors">
                  Engineering & PSUs (ISRO / GATE)
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.EXAMS}?category=Teaching%20%26%20Lectureship`} className="hover:text-starlight transition-colors">
                  Teaching & Research (UGC-NET / KSET)
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.EXAMS}?category=Banking%20%26%20Finance`} className="hover:text-starlight transition-colors">
                  Banking & Finance (IBPS / RBI)
                </Link>
              </li>
            </ul>
          </div>

          {/* Aspirant Tools */}
          <div>
            <h4 className="text-xs font-bold text-starlight uppercase tracking-wider mb-3">
              Preparation Tools
            </h4>
            <ul className="space-y-2 text-xs text-opaline">
              <li>
                <Link to={ROUTES.ELIGIBILITY} className="hover:text-starlight transition-colors">
                  Multi-Factor Eligibility Screener
                </Link>
              </li>
              <li>
                <Link to={ROUTES.ROADMAP} className="hover:text-starlight transition-colors">
                  Personalized Roadmap
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CALENDAR} className="hover:text-starlight transition-colors">
                  National Exam Calendar
                </Link>
              </li>
              <li>
                <Link to={ROUTES.MATERIALS} className="hover:text-starlight transition-colors">
                  Syllabus & PYQ Archive
                </Link>
              </li>
              <li>
                <Link to={ROUTES.AI_ASSISTANT} className="hover:text-starlight transition-colors">
                  AI Study Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals & Official Links */}
          <div>
            <h4 className="text-xs font-bold text-starlight uppercase tracking-wider mb-3">
              Monitored Portals
            </h4>
            <ul className="space-y-2 text-xs text-opaline">
              <li>
                <a href="https://upsc.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-starlight inline-flex items-center gap-1 transition-colors">
                  <span>UPSC Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://ssc.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-starlight inline-flex items-center gap-1 transition-colors">
                  <span>SSC Official</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://ugcnet.nta.ac.in" target="_blank" rel="noopener noreferrer" className="hover:text-starlight inline-flex items-center gap-1 transition-colors">
                  <span>NTA UGC-NET</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://cetonline.karnataka.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-starlight inline-flex items-center gap-1 transition-colors">
                  <span>Karnataka KEA / KSET</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-4 rounded-xl bg-nocturne/80 border border-wisteria/40 text-xs text-opaline leading-relaxed mb-6">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-aurora shrink-0 mt-0.5" />
            <p>
              <strong className="text-starlight">Statutory Note:</strong> {APP_CONFIG.name} is an academic software project. While notifications and exam syllabus guidelines are extracted from official government gazettes, candidates must always verify cutoff marks, age relaxations, and application procedures on the respective official commissioning portals before submitting final government applications.
            </p>
          </div>
        </div>

        {/* Copyright, Live System Health & Version */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-opaline/80 pt-4 border-t border-wisteria/30 gap-3">
          <p>© {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.</p>

          {/* Live System Health Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-nocturne border border-wisteria/40 text-[11px] font-medium shadow-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                health?.status === 'online'
                  ? 'bg-emerald-400 animate-pulse'
                  : health?.status === 'offline'
                  ? 'bg-rose-400'
                  : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="text-starlight font-semibold">
              {health ? (health.status === 'online' ? 'API Online' : 'API Offline') : 'Checking API...'}
            </span>
            <span className="text-wisteria/60">•</span>
            <span className={health?.dbStatus === 'connected' ? 'text-aurora' : 'text-rose-400'}>
              Database:{' '}
              {health?.dbStatus === 'connected'
                ? `Connected (${health.latency || 0}ms)`
                : health?.dbStatus || 'Checking...'}
            </span>
          </div>

          <p className="font-mono text-[11px]">{APP_CONFIG.version}</p>
        </div>
      </div>
    </footer>
  );
};
