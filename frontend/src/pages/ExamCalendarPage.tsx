import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Bookmark, Filter, Download } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';

interface CalendarEvent {
  id: string;
  title: string;
  examCode: string;
  conductingBody: string;
  date: string;
  type: 'Deadline' | 'Exam Day' | 'Admit Card' | 'Result';
  daysLeft: number;
  officialPortal: string;
}

export const ExamCalendarPage: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'monthly'>('list');
  const { showToast } = useToast();

  const events: CalendarEvent[] = [
    {
      id: 'cal-01',
      title: 'UPSC CSE 2026 Online Application Last Date',
      examCode: 'UPSC-CSE',
      conductingBody: 'Union Public Service Commission',
      date: '2026-03-05',
      type: 'Deadline',
      daysLeft: 9,
      officialPortal: 'https://upsconline.nic.in',
    },
    {
      id: 'cal-02',
      title: 'KSET 2026 Application Closing Date',
      examCode: 'KSET',
      conductingBody: 'Karnataka Examination Authority',
      date: '2026-03-12',
      type: 'Deadline',
      daysLeft: 16,
      officialPortal: 'https://cetonline.karnataka.gov.in',
    },
    {
      id: 'cal-03',
      title: 'ISRO ICRB Scientist "SC" Application Deadline',
      examCode: 'ISRO-ICRB',
      conductingBody: 'ISRO Headquarters Bengaluru',
      date: '2026-04-10',
      type: 'Deadline',
      daysLeft: 45,
      officialPortal: 'https://isro.gov.in',
    },
    {
      id: 'cal-04',
      title: 'KPSC Gazetted Probationers (KAS) Preliminary Examination',
      examCode: 'KPSC-KAS',
      conductingBody: 'Karnataka Public Service Commission',
      date: '2026-04-26',
      type: 'Exam Day',
      daysLeft: 61,
      officialPortal: 'https://kpsc.kar.nic.in',
    },
    {
      id: 'cal-05',
      title: 'UPSC Civil Services (Preliminary) Examination 2026',
      examCode: 'UPSC-CSE',
      conductingBody: 'Union Public Service Commission',
      date: '2026-05-24',
      type: 'Exam Day',
      daysLeft: 89,
      officialPortal: 'https://upsc.gov.in',
    },
    {
      id: 'cal-06',
      title: 'ISRO Scientist "SC" Written Examination 2026',
      examCode: 'ISRO-ICRB',
      conductingBody: 'ISRO ICRB Bangalore',
      date: '2026-06-21',
      type: 'Exam Day',
      daysLeft: 117,
      officialPortal: 'https://isro.gov.in',
    },
    {
      id: 'cal-07',
      title: 'KSET / UGC-NET 2026 Computer Based Examination',
      examCode: 'UGC-NET / KSET',
      conductingBody: 'NTA & KEA',
      date: '2026-07-02',
      type: 'Exam Day',
      daysLeft: 128,
      officialPortal: 'https://ugcnet.nta.ac.in',
    },
  ];

  const filteredEvents = filterType === 'all'
    ? events
    : events.filter((e) => e.type.toLowerCase() === filterType.toLowerCase());

  const handleExportICS = () => {
    showToast('Export Calendar (.ICS)', 'Calendar deadlines downloaded for Google Calendar & Outlook.', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-wisteria uppercase tracking-widest">
              National Examination Timetable
            </span>
            <Badge variant="active" size="sm">
              2026 Academic Year
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-nocturne">
            Government Exam Calendar & Deadlines
          </h1>
          <p className="text-xs sm:text-sm text-eclipse/80 mt-1">
            Real-time countdown to official application closing dates, hall ticket download dates, and national preliminary examinations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportICS}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export .ICS
          </Button>
          <div className="flex rounded-lg border border-opaline/80 p-0.5 bg-starlight">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                viewMode === 'list' ? 'bg-nocturne text-starlight' : 'text-wisteria hover:text-nocturne'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                viewMode === 'monthly' ? 'bg-nocturne text-starlight' : 'text-wisteria hover:text-nocturne'
              }`}
            >
              Monthly Planner
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-opaline/60">
        {[
          { label: 'All Dates', value: 'all' },
          { label: 'Application Deadlines', value: 'Deadline' },
          { label: 'Examination Days', value: 'Exam Day' },
          { label: 'Admit Cards & Hall Tickets', value: 'Admit Card' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterType(tab.value)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterType === tab.value
                ? 'bg-nocturne text-starlight'
                : 'bg-starlight text-wisteria hover:bg-opaline/30 border border-opaline/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* View Content */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <Card
              key={event.id}
              variant="default"
              className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-opaline/70 hover:border-wisteria"
            >
              <div className="flex items-start gap-4">
                {/* Date badge */}
                <div className="w-16 h-16 rounded-xl bg-nocturne text-starlight flex flex-col items-center justify-center shrink-0 border border-nocturne">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-aurora">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-xl font-black leading-none">
                    {new Date(event.date).getDate()}
                  </span>
                  <span className="text-[9px] text-opaline">{new Date(event.date).getFullYear()}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={event.type === 'Deadline' ? 'active' : 'accent'} size="sm">
                      {event.type}
                    </Badge>
                    <span className="font-mono text-xs font-bold text-wisteria">
                      {event.examCode}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-nocturne">{event.title}</h3>
                  <p className="text-xs text-wisteria">{event.conductingBody}</p>
                </div>
              </div>

              {/* Countdown & Action */}
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-opaline/60">
                <div className="text-right">
                  <span className="block text-xs font-black text-nocturne">
                    {event.daysLeft > 0 ? `${event.daysLeft} Days Remaining` : 'Event Passed'}
                  </span>
                  <span className="block text-[11px] text-wisteria">
                    Scheduled on: {event.date}
                  </span>
                </div>
                <a href={event.officialPortal} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="sm">
                    Portal
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Monthly Planner View */
        <Card variant="default" className="p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-opaline/60">
            <h2 className="text-base font-bold text-nocturne">March — July 2026 Major Examination Pipeline</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-wisteria">
              <span>National Academic Timeline</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-opaline/20 border border-opaline/60 space-y-3">
              <h3 className="text-xs font-bold text-nocturne uppercase tracking-wider pb-1 border-b border-opaline/50">
                March 2026 (Application Windows)
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded bg-starlight border border-opaline/60">
                  <span className="font-bold text-nocturne block">05 Mar: UPSC CSE Closes</span>
                  <span className="text-[11px] text-wisteria">Last day for Online Application</span>
                </div>
                <div className="p-2.5 rounded bg-starlight border border-opaline/60">
                  <span className="font-bold text-nocturne block">12 Mar: KSET 2026 Closes</span>
                  <span className="text-[11px] text-wisteria">KEA Karnataka Registration</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-opaline/20 border border-opaline/60 space-y-3">
              <h3 className="text-xs font-bold text-nocturne uppercase tracking-wider pb-1 border-b border-opaline/50">
                April — May 2026 (Prelims Phase)
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded bg-starlight border border-opaline/60">
                  <span className="font-bold text-nocturne block">26 Apr: KPSC KAS Prelims</span>
                  <span className="text-[11px] text-wisteria">Karnataka State Gazetted</span>
                </div>
                <div className="p-2.5 rounded bg-starlight border border-opaline/60">
                  <span className="font-bold text-nocturne block">24 May: UPSC CSE Prelims</span>
                  <span className="text-[11px] text-wisteria">Paper I & Paper II (CSAT)</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-opaline/20 border border-opaline/60 space-y-3">
              <h3 className="text-xs font-bold text-nocturne uppercase tracking-wider pb-1 border-b border-opaline/50">
                June — July 2026 (Technical & NET)
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded bg-starlight border border-opaline/60">
                  <span className="font-bold text-nocturne block">21 Jun: ISRO Scientist "SC"</span>
                  <span className="text-[11px] text-wisteria">Core Technical Computer Science</span>
                </div>
                <div className="p-2.5 rounded bg-starlight border border-opaline/60">
                  <span className="font-bold text-nocturne block">02 Jul: UGC-NET / KSET</span>
                  <span className="text-[11px] text-wisteria">NTA National Eligibility Test</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
