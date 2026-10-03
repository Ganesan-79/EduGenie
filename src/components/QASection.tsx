import React, { useState } from 'react';
import { HelpCircle, Send, Copy, Check, Sparkles, Loader2 } from 'lucide-react';
import { QAResult } from '../types';
import { SAMPLE_SCENARIOS } from '../data/sampleScenarios';

interface QASectionProps {
  onSaveResult?: (result: QAResult) => void;
  initialQuestion?: string;
}

export const QASection: React.FC<QASectionProps> = ({ onSaveResult, initialQuestion = '' }) => {
  const [question, setQuestion] = useState(initialQuestion);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QAResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAsk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get answer');
      }

      const newResult: QAResult = {
        question: question.trim(),
        answer: data.answer,
        timestamp: Date.now(),
      };

      setResult(newResult);
      if (onSaveResult) onSaveResult(newResult);
    } catch (err: any) {
      setError(err.message || 'An error occurred while getting the answer.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.answer) return;
    navigator.clipboard.writeText(result.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 mb-8 transition-all">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Ask EduGenie a Question</h2>
            <p className="text-xs text-slate-500">Concise, accurate answers for general and academic queries</p>
          </div>
        </div>
        <span className="text-xs font-mono text-slate-400">Endpoint: /api/qa</span>
      </div>

      {/* Suggested prompts from PDF */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
        <span className="text-slate-400 font-medium">Examples:</span>
        {SAMPLE_SCENARIOS.qa.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setQuestion(q)}
            className="text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer text-left"
          >
            {q}
          </button>
        ))}
      </div>

      <form onSubmit={handleAsk} className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Which is the largest ocean?"
          required
          className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Thinking...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Get Answer
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
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Answer for &ldquo;{result.question}&rdquo;
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Copy answer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg text-slate-800 text-sm leading-relaxed whitespace-pre-line">
            {result.answer}
          </div>
        </div>
      )}
    </section>
  );
};
