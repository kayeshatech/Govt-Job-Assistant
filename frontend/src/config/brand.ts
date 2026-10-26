/**
 * Govexa Centralized Branding & Application Identity Configuration
 * All branding, metadata, agency descriptions, and portal links are declared here
 * so they can be globally renamed or rebranded without touching page components.
 */

export const APP_CONFIG = {
  name: 'Govexa',
  fullName: 'Govexa — AI Government Exam Career Guidance & Preparation Platform',
  tagline: 'Empowering Aspirants with AI-Driven Examination Intelligence & Personalized Preparation',
  version: '1.0.0 (Part 1 Frontend Architecture)',
  supportEmail: 'aspirant-support@govexa.gov.in',
  nationalHelpline: '1800-11-2026 (Mon-Sat 9AM-6PM IST)',
  disclaimer: 'Academic Prototype & Career Advisory System. Official notifications, dates, eligibility criteria, and vacancies must be verified with respective official government gazettes and commissioning agency portals.',
  colors: {
    starlight: '#F3EEF8',
    opaline: '#CDC4DC',
    aurora: '#8EA4C4',
    wisteria: '#6E5A88',
    nocturne: '#2A2550',
    eclipse: '#0C0A16',
  },
  examCategories: [
    { id: 'civil-services', name: 'Civil Services & Administration', code: 'UPSC / State PSC' },
    { id: 'banking-insurance', name: 'Banking & Financial Institutions', code: 'IBPS / SBI / RBI' },
    { id: 'ssc-central', name: 'Staff Selection Commission', code: 'SSC CGL / CHSL' },
    { id: 'defense-police', name: 'Defense & Police Forces', code: 'NDA / CDS / AFCAT / CAPF' },
    { id: 'engineering-psu', name: 'PSUs & Technical Services', code: 'GATE / ISRO / BARC / DRDO' },
    { id: 'teaching-ugc', name: 'Teaching, Lecturership & Research', code: 'UGC-NET / CSIR / KSET' },
    { id: 'railways', name: 'Indian Railways Recruitment', code: 'RRB NTPC / JE' },
  ],
  monitoredPortalsCount: 42,
  sampleDatabaseCount: 28,
};
