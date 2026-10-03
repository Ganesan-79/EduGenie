import React, { useState } from 'react';
import { BookOpen, Lightbulb, Sparkles, Copy, Check, Loader2, ArrowRight } from 'lucide-react';
import { ExplainResult } from '../types';
import { SAMPLE_SCENARIOS } from '../data/sampleScenarios';

interface ExplainSectionProps {
  onSaveResult?: (result: ExplainResult) => void;
  initialTopic?: string;
}

export const ExplainSection: React.FC<ExplainSectionProps> = ({ onSaveResult, initialTopic = '' }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [audience, setAudience] = useState('school student');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExplain = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          audience: audience,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate explanation');
      }

      const newResult: ExplainResult = {
        topic: topic.trim(),
        summary: data.summary || '',
        explanation: data.explanation || '',
        analogy: data.analogy,
        keyPoints: data.keyPoints || [],
        didYouKnow: data.didYouKnow,
        timestamp: Date.now(),
      };

      setResult(newResult);
      if (onSaveResult) onSaveResult(newResult);
    } catch (err: any) {
      setError(err.message || 'An error occurred while explaining the concept.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `${result.topic}\n\nSummary:\n${result.summary}\n\nExplanation:\n${result.explanation}${
      result.analogy ? `\n\nAnalogy:\n${result.analogy}` : ''
    }\n\nKey Takeaways:\n${result.keyPoints.map((p) => `• ${p}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 mb-8 transition-all">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Need an Explanation?</h2>
            <p className="text-xs text-slate-500">Break down complex concepts into simple, readable explanations</p>
          </div>
        </div>
        <span className="text-xs font-mono text-slate-400">Endpoint: /api/explain</span>
      </div>

      {/* Suggested topics from PDF */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
        <span className="text-slate-400 font-medium">Examples:</span>
        {SAMPLE_SCENARIOS.explain.map((t, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setTopic(t)}
            className="text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleExplain} className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Quantum Computing, Photosynthesis, Binary Search..."
          required
          className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
        />
        <select
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 cursor-pointer"
        >
          <option value="school student">School Student</option>
          <option value="complete beginner">Beginner Learner</option>
          <option value="high school or college">College Level</option>
        </select>
        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Explaining...
            </>
          ) : (
            <>
              <Lightbulb className="w-4 h-4" />
              Explain
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Explanation for &ldquo;{result.topic}&rdquo;
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Breakdown'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Quick summary */}
            <div className="p-4 bg-indigo-50/60 border border-indigo-100/80 rounded-lg">
              <h4 className="text-xs font-semibold text-indigo-900 uppercase tracking-wider mb-1">
                Quick Essence
              </h4>
              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                {result.summary}
              </p>
            </div>

            {/* In-depth explanation */}
            <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-lg">
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Simplified Explanation
              </h4>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                {result.explanation}
              </p>
            </div>

            {/* Analogy if available */}
            {result.analogy && (
              <div className="p-4 bg-amber-50/70 border border-amber-200/70 rounded-lg">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
                    Everyday Analogy
                  </h4>
                </div>
                <p className="text-sm text-amber-950 leading-relaxed italic">
                  &ldquo;{result.analogy}&rdquo;
                </p>
              </div>
            )}

            {/* Key takeaways */}
            {result.keyPoints && result.keyPoints.length > 0 && (
              <div className="p-4 bg-white border border-slate-200 rounded-lg">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Key Takeaways
                </h4>
                <ul className="space-y-1.5">
                  {result.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-indigo-500 font-bold leading-5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Did you know? */}
            {result.didYouKnow && (
              <div className="text-xs text-slate-500 bg-slate-50/50 p-3 rounded-lg border border-slate-100 flex items-start gap-2">
                <span className="font-semibold text-slate-700">Did you know?</span>
                <span>{result.didYouKnow}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
