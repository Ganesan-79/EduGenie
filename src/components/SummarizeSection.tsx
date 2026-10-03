import React, { useState } from 'react';
import { FileText, AlignLeft, Copy, Check, Sparkles, Loader2 } from 'lucide-react';
import { SummaryResult } from '../types';
import { SAMPLE_SCENARIOS } from '../data/sampleScenarios';

interface SummarizeSectionProps {
  onSaveResult?: (result: SummaryResult) => void;
  initialText?: string;
}

export const SummarizeSection: React.FC<SummarizeSectionProps> = ({ onSaveResult, initialText = '' }) => {
  const [text, setText] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to summarize text');
      }

      const newResult: SummaryResult = {
        summary: data.summary,
        keyPoints: data.keyPoints || [],
        oneLiner: data.oneLiner,
        stats: data.stats,
        timestamp: Date.now(),
      };

      setResult(newResult);
      if (onSaveResult) onSaveResult(newResult);
    } catch (err: any) {
      setError(err.message || 'An error occurred while summarizing.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.summary) return;
    const content = `${result.summary}\n\nKey Points:\n${result.keyPoints.map((p) => `• ${p}`).join('\n')}`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 mb-8 transition-all">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Summarize a Paragraph</h2>
            <p className="text-xs text-slate-500">Transform large passages into concise, revision-ready key points</p>
          </div>
        </div>
        <span className="text-xs font-mono text-slate-400">Endpoint: /api/summarize</span>
      </div>

      {/* Preset passages from PDF */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
        <span className="text-slate-400 font-medium">Sample Passages:</span>
        {SAMPLE_SCENARIOS.summarize.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setText(s.text)}
            className="text-slate-600 hover:text-amber-700 bg-slate-100 hover:bg-amber-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
          >
            {s.title}
          </button>
        ))}
      </div>

      <form onSubmit={handleSummarize} className="space-y-3">
        <textarea
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste long educational content to summarize..."
          required
          className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900 placeholder:text-slate-400 resize-y"
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {text.trim() ? `${text.trim().split(/\s+/).length} words` : '0 words'}
          </span>
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Summarizing...
              </>
            ) : (
              <>
                <AlignLeft className="w-4 h-4" />
                Summarize
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Summary
              </span>
              {result.stats && (
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                  {result.stats.reductionPercent}% more concise ({result.stats.originalWords} → {result.stats.summaryWords} words)
                </span>
              )}
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Summary'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-lg text-slate-800 text-sm leading-relaxed">
              {result.summary}
            </div>

            {result.oneLiner && (
              <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <p className="text-xs font-medium text-slate-700">
                  <span className="text-slate-500">Takeaway: </span>
                  {result.oneLiner}
                </p>
              </div>
            )}

            {result.keyPoints && result.keyPoints.length > 0 && (
              <div className="p-4 bg-white border border-slate-200 rounded-lg">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Key Takeaways
                </h4>
                <ul className="space-y-1.5">
                  {result.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-amber-500 font-bold leading-5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
