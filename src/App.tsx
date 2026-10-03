/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { QASection } from './components/QASection';
import { ExplainSection } from './components/ExplainSection';
import { QuizSection } from './components/QuizSection';
import { SummarizeSection } from './components/SummarizeSection';
import { LearningPathSection } from './components/LearningPathSection';
import { StudyHistoryDrawer, HistoryItem } from './components/StudyHistoryDrawer';
import { ModuleType, QAResult, ExplainResult, QuizResult, SummaryResult, LearningPathResult } from './types';
import { GraduationCap, Sparkles, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'edugenie_study_history_v1';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ModuleType>('all');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load study history', e);
    }
  }, []);

  const saveHistoryItem = (item: HistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev.filter((i) => i.id !== item.id)].slice(0, 30);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setCurrentTab(item.type as ModuleType);
  };

  // Pre-configured scenario triggers from the PDF
  const applyScenario = (type: ModuleType) => {
    setCurrentTab(type);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {/* Header Hero matching PDF */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Google Gemini Powered Learning Assistant</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome to EduGenie <span role="img" aria-label="graduation cap">🎓</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-xl mx-auto">
            Your personal AI tutor for learning support!
          </p>

          {/* Quick PDF scenario shortcuts */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Test Scenarios:</span>
            <button
              onClick={() => applyScenario('qa')}
              className="px-3 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-md transition-all shadow-2xs cursor-pointer"
            >
              🌊 Scenario 1: Largest Ocean (Q&A)
            </button>
            <button
              onClick={() => applyScenario('quiz')}
              className="px-3 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 rounded-md transition-all shadow-2xs cursor-pointer"
            >
              📐 Scenario 2: Pythagoras Quiz
            </button>
            <button
              onClick={() => applyScenario('learn')}
              className="px-3 py-1 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 rounded-md transition-all shadow-2xs cursor-pointer"
            >
              🗄️ Scenario 3: SQL Roadmap
            </button>
            <button
              onClick={() => applyScenario('explain')}
              className="px-3 py-1 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 rounded-md transition-all shadow-2xs cursor-pointer"
            >
              🔬 Photosynthesis Concept
            </button>
            <button
              onClick={() => applyScenario('summarize')}
              className="px-3 py-1 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 rounded-md transition-all shadow-2xs cursor-pointer"
            >
              🏭 Industrial Revolution Summary
            </button>
          </div>
        </div>

        {/* Dynamic Section rendering */}
        {currentTab === 'all' && (
          <div className="space-y-6">
            {/* 1. Q&A Module */}
            <QASection
              onSaveResult={(res: QAResult) =>
                saveHistoryItem({
                  id: `qa-${res.timestamp}`,
                  type: 'qa',
                  title: `Q&A: ${res.question}`,
                  timestamp: res.timestamp,
                  data: res,
                })
              }
            />

            {/* 2. Concept Explanation Module */}
            <ExplainSection
              onSaveResult={(res: ExplainResult) =>
                saveHistoryItem({
                  id: `explain-${res.timestamp}`,
                  type: 'explain',
                  title: `Concept: ${res.topic}`,
                  timestamp: res.timestamp,
                  data: res,
                })
              }
            />

            {/* 3. Summarization Module */}
            <SummarizeSection
              onSaveResult={(res: SummaryResult) =>
                saveHistoryItem({
                  id: `summarize-${res.timestamp}`,
                  type: 'summarize',
                  title: `Summary: ${res.oneLiner || res.summary.slice(0, 40)}...`,
                  timestamp: res.timestamp,
                  data: res,
                })
              }
            />

            {/* 4. Quiz Generation Module */}
            <QuizSection
              onSaveResult={(res: QuizResult) =>
                saveHistoryItem({
                  id: `quiz-${res.timestamp}`,
                  type: 'quiz',
                  title: `Quiz on: ${res.topic}`,
                  timestamp: res.timestamp,
                  data: res,
                })
              }
            />

            {/* 5. Learning Recommendations Module */}
            <LearningPathSection
              onSaveResult={(res: LearningPathResult) =>
                saveHistoryItem({
                  id: `learn-${res.timestamp}`,
                  type: 'learn',
                  title: `Learning Path: ${res.topic}`,
                  timestamp: res.timestamp,
                  data: res,
                })
              }
            />
          </div>
        )}

        {/* Focused Single Tab Views */}
        {currentTab === 'qa' && (
          <QASection
            onSaveResult={(res: QAResult) =>
              saveHistoryItem({
                id: `qa-${res.timestamp}`,
                type: 'qa',
                title: `Q&A: ${res.question}`,
                timestamp: res.timestamp,
                data: res,
              })
            }
          />
        )}

        {currentTab === 'explain' && (
          <ExplainSection
            onSaveResult={(res: ExplainResult) =>
              saveHistoryItem({
                id: `explain-${res.timestamp}`,
                type: 'explain',
                title: `Concept: ${res.topic}`,
                timestamp: res.timestamp,
                data: res,
              })
            }
          />
        )}

        {currentTab === 'quiz' && (
          <QuizSection
            onSaveResult={(res: QuizResult) =>
              saveHistoryItem({
                id: `quiz-${res.timestamp}`,
                type: 'quiz',
                title: `Quiz on: ${res.topic}`,
                timestamp: res.timestamp,
                data: res,
              })
            }
          />
        )}

        {currentTab === 'summarize' && (
          <SummarizeSection
            onSaveResult={(res: SummaryResult) =>
              saveHistoryItem({
                id: `summarize-${res.timestamp}`,
                type: 'summarize',
                title: `Summary: ${res.oneLiner || res.summary.slice(0, 40)}...`,
                timestamp: res.timestamp,
                data: res,
              })
            }
          />
        )}

        {currentTab === 'learn' && (
          <LearningPathSection
            onSaveResult={(res: LearningPathResult) =>
              saveHistoryItem({
                id: `learn-${res.timestamp}`,
                type: 'learn',
                title: `Learning Path: ${res.topic}`,
                timestamp: res.timestamp,
                data: res,
              })
            }
          />
        )}

        {/* System Architecture info footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <p className="font-semibold text-slate-700">EduGenie Learning Architecture</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                REST API endpoints: <code className="text-slate-600 bg-slate-100 px-1 py-0.5 rounded">/api/qa</code>, <code className="text-slate-600 bg-slate-100 px-1 py-0.5 rounded">/api/explain</code>, <code className="text-slate-600 bg-slate-100 px-1 py-0.5 rounded">/api/quiz</code>, <code className="text-slate-600 bg-slate-100 px-1 py-0.5 rounded">/api/summarize</code>, <code className="text-slate-600 bg-slate-100 px-1 py-0.5 rounded">/api/learn/recommendations</code>
              </p>
            </div>
            <div className="text-[11px] text-slate-400">
              SmartBridge Project Implementation
            </div>
          </div>
        </div>
      </main>

      {/* History Drawer */}
      <StudyHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={history}
        onClearAll={handleClearHistory}
        onSelectItem={handleSelectHistoryItem}
      />
    </div>
  );
}
