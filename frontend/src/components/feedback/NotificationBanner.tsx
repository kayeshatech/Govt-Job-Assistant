import React, { useState } from 'react';
import { AlertCircle, X, ExternalLink } from 'lucide-react';
import { APP_CONFIG } from '../../config/brand';

export const NotificationBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <aside
      className="bg-nocturne text-starlight text-xs border-b border-wisteria/40 px-4 py-2 transition-all"
      aria-label="Academic prototype notice"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="shrink-0 bg-wisteria/30 text-starlight px-2 py-0.5 rounded font-bold text-[10px] tracking-wider uppercase border border-wisteria/40">
            Notice
          </span>
          <p className="truncate text-opaline">
            <span className="font-semibold text-starlight">Academic Career Advisory System:</span>{' '}
            {APP_CONFIG.disclaimer}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://upsc.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-aurora hover:text-starlight underline text-[11px]"
          >
            <span>Official Gazettes</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => setIsVisible(false)}
            className="text-opaline hover:text-starlight p-0.5 rounded"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
