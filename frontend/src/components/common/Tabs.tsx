import React, { ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`border-b border-opaline/70 flex gap-2 overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-150 ${
              isActive
                ? 'border-wisteria text-nocturne bg-opaline/20 rounded-t-lg'
                : 'border-transparent text-wisteria hover:text-nocturne hover:border-opaline'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-nocturne text-starlight' : 'bg-opaline/60 text-eclipse'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
