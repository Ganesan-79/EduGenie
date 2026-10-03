import React from 'react';
import { GraduationCap, Sparkles, History, Layers, HelpCircle, BookOpen, Award, FileText, Compass } from 'lucide-react';
import { ModuleType } from '../types';

interface NavbarProps {
  currentTab: ModuleType;
  onSelectTab: (tab: ModuleType) => void;
  historyCount: number;
  onOpenHistory: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  historyCount,
  onOpenHistory,
}) => {
  const tabs = [
    { id: 'all' as ModuleType, label: 'All Modules', icon: Layers },
    { id: 'qa' as ModuleType, label: 'Q&A', icon: HelpCircle },
    { id: 'explain' as ModuleType, label: 'Explain', icon: BookOpen },
    { id: 'quiz' as ModuleType, label: 'Quiz', icon: Award },
    { id: 'summarize' as ModuleType, label: 'Summarize', icon: FileText },
    { id: 'learn' as ModuleType, label: 'Learning Path', icon: Compass },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  EduGenie
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                  Gemini AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                AI Powered Learning Assistant
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenHistory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
              title="View your study history"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>History</span>
              {historyCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {historyCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 -mb-px border-t border-slate-100 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/70 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
