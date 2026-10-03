import React, { useState } from 'react';
import { Compass, Clock, CheckSquare, Square, ExternalLink, BookOpen, Video, Code2, Copy, Check, Loader2, Sparkles } from 'lucide-react';
import { LearningPathResult } from '../types';
import { SAMPLE_SCENARIOS } from '../data/sampleScenarios';

interface LearningPathSectionProps {
  onSaveResult?: (result: LearningPathResult) => void;
  initialTopic?: string;
}

export const LearningPathSection: React.FC<LearningPathSectionProps> = ({ onSaveResult, initialTopic = '' }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [loading, setLoading] = useState(false);
  const [pathData, setPathData] = useState<LearningPathResult | null>(null);
  const [completedTopics, setCompletedTopics] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/learn/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate learning path');
      }

      const rec = data.recommendation;
      const newResult: LearningPathResult = {
        topic: topic.trim(),
        title: rec.title || `${topic.trim()} Learning Path`,
        overview: rec.overview || '',
        levels: rec.levels || [],
        adaptiveTips: rec.adaptiveTips || [],
        milestoneProject: rec.milestoneProject,
        timestamp: Date.now(),
      };

      setPathData(newResult);
      setCompletedTopics({});
      if (onSaveResult) onSaveResult(newResult);
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating learning recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTopicCheck = (key: string) => {
    setCompletedTopics((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Calculate completion percentage
  const allTopicKeys: string[] = [];
  pathData?.levels?.forEach((level, lIdx) => {
    level.keyTopics?.forEach((_, tIdx) => {
      allTopicKeys.push(`${lIdx}-${tIdx}`);
    });
  });
  const completedCount = allTopicKeys.filter((k) => completedTopics[k]).length;
  const progressPct = allTopicKeys.length > 0 ? Math.round((completedCount / allTopicKeys.length) * 100) : 0;

  const handleCopyMarkdown = () => {
    if (!pathData) return;
    let md = `# ${pathData.title}\n\n${pathData.overview}\n\n`;

    pathData.levels.forEach((lvl, idx) => {
      md += `## Level ${idx + 1}: ${lvl.levelName} (${lvl.estimatedTime})\n\n`;
      md += `### Key Topics:\n`;
      lvl.keyTopics.forEach((t) => {
        md += `- [ ] ${t}\n`;
      });
      md += `\n### Resources:\n`;
      lvl.resources.forEach((r) => {
        md += `- **[${r.category}] ${r.title}**: ${r.description}\n`;
      });
      md += `\n`;
    });

    if (pathData.adaptiveTips.length > 0) {
      md += `## Adaptive Learning Tips\n`;
      pathData.adaptiveTips.forEach((tip) => {
        md += `- ${tip}\n`;
      });
    }

    if (pathData.milestoneProject) {
      md += `\n## Capstone Milestone\n${pathData.milestoneProject}\n`;
    }

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getResourceIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('video')) return <Video className="w-3.5 h-3.5 text-rose-500" />;
    if (cat.includes('book')) return <BookOpen className="w-3.5 h-3.5 text-blue-500" />;
    if (cat.includes('tutorial') || cat.includes('code') || cat.includes('interactive')) {
      return <Code2 className="w-3.5 h-3.5 text-emerald-500" />;
    }
    return <ExternalLink className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 mb-8 transition-all">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Get Learning Recommendations</h2>
            <p className="text-xs text-slate-500">Structured roadmap from beginner to advanced with timelines & curated resources</p>
          </div>
        </div>
        <span className="text-xs font-mono text-slate-400">Endpoint: /api/learn/recommendations</span>
      </div>

      {/* Suggested topics from PDF */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
        <span className="text-slate-400 font-medium">Examples:</span>
        {SAMPLE_SCENARIOS.learningPath.map((t, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setTopic(t)}
            className="text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. SQL, Linear Regression, Machine Learning, Web Development..."
          required
          className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Building Plan...
            </>
          ) : (
            <>
              <Compass className="w-4 h-4" />
              Get Recommendations
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {error}
        </div>
      )}

      {pathData && (
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-teal-50/50 p-4 rounded-xl border border-teal-100/70">
            <div>
              <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
                Personalized Learning Plan
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {pathData.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {pathData.overview}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <button
                onClick={handleCopyMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                title="Copy entire roadmap as Markdown"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Export Markdown'}</span>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {allTopicKeys.length > 0 && (
            <div className="px-1">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>Checklist Progress: {completedCount} of {allTopicKeys.length} topics mastered</span>
                <span className="font-semibold text-teal-700">{progressPct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Levels (Beginner, Intermediate, Advanced) */}
          <div className="space-y-5">
            {pathData.levels.map((level, lIdx) => {
              const badgeColors = [
                'bg-blue-50 text-blue-700 border-blue-200',
                'bg-indigo-50 text-indigo-700 border-indigo-200',
                'bg-purple-50 text-purple-700 border-purple-200',
              ][lIdx % 3];

              return (
                <div
                  key={lIdx}
                  className="p-5 border border-slate-200 rounded-xl bg-slate-50/40 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold border ${badgeColors}`}>
                        Level {lIdx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {level.levelName}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Estimated: {level.estimatedTime}</span>
                    </div>
                  </div>

                  {/* Topics Grid */}
                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Key Topics & Milestones
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {level.keyTopics.map((topicItem, tIdx) => {
                        const key = `${lIdx}-${tIdx}`;
                        const isDone = !!completedTopics[key];

                        return (
                          <div
                            key={tIdx}
                            onClick={() => toggleTopicCheck(key)}
                            className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                              isDone
                                ? 'bg-teal-50/60 border-teal-200 text-teal-900 line-through decoration-teal-400'
                                : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                            }`}
                          >
                            <button
                              type="button"
                              className="mt-0.5 shrink-0 text-slate-400 hover:text-teal-600"
                            >
                              {isDone ? (
                                <CheckSquare className="w-4 h-4 text-teal-600" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                            <span className="leading-snug">{topicItem}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Curated Resources */}
                  {level.resources && level.resources.length > 0 && (
                    <div className="pt-2">
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                        Recommended Resources
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {level.resources.map((res, rIdx) => (
                          <div
                            key={rIdx}
                            className="p-3 bg-white border border-slate-200/90 rounded-lg space-y-1"
                          >
                            <div className="flex items-center gap-2">
                              {getResourceIcon(res.category)}
                              <span className="text-[11px] font-semibold text-slate-500">
                                {res.category}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-900">
                              {res.title}
                            </p>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              {res.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Adaptive Learning Tips */}
          {pathData.adaptiveTips && pathData.adaptiveTips.length > 0 && (
            <div className="p-5 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-900">
                  Adaptive Learning Tips
                </h4>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {pathData.adaptiveTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-amber-950">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Milestone Project */}
          {pathData.milestoneProject && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-0.5">
                  Suggested Capstone Project
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {pathData.milestoneProject}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
