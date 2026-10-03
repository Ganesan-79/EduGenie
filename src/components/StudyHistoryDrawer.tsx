import React from 'react';
import { X, Trash2, Clock, HelpCircle, BookOpen, Award, FileText, Compass, ExternalLink } from 'lucide-react';
import { QAResult, ExplainResult, QuizResult, SummaryResult, LearningPathResult } from '../types';

export interface HistoryItem {
  id: string;
  type: 'qa' | 'explain' | 'quiz' | 'summarize' | 'learn';
  title: string;
  timestamp: number;
  data: QAResult | ExplainResult | QuizResult | SummaryResult | LearningPathResult;
}

interface StudyHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onClearAll: () => void;
  onSelectItem: (item: HistoryItem) => void;
}

export const StudyHistoryDrawer: React.FC<StudyHistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onClearAll,
  onSelectItem,
}) => {
  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'qa':
        return <HelpCircle className="w-3.5 h-3.5 text-blue-500" />;
      case 'explain':
        return <BookOpen className="w-3.5 h-3.5 text-indigo-500" />;
      case 'quiz':
        return <Award className="w-3.5 h-3.5 text-emerald-500" />;
      case 'summarize':
        return <FileText className="w-3.5 h-3.5 text-amber-500" />;
      case 'learn':
        return <Compass className="w-3.5 h-3.5 text-teal-500" />;
      default:
        return null;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'qa':
        return 'Q&A Answer';
      case 'explain':
        return 'Explanation';
      case 'quiz':
        return 'Quiz';
      case 'summarize':
        return 'Summary';
      case 'learn':
        return 'Learning Path';
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">Study History</h3>
            <span className="text-xs text-slate-400">({items.length})</span>
          </div>
          <div className="flex items-center gap-1">
            {items.length > 0 && (
              <button
                onClick={onClearAll}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 transition-colors"
                title="Clear history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {items.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium">No study sessions recorded yet.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Questions asked, explanations, quizzes, and learning paths will appear here.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectItem(item);
                  onClose();
                }}
                className="p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    {getTypeIcon(item.type)}
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      {getTypeName(item.type)}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
