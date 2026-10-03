import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, RotateCcw, Award, Loader2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion, QuizResult } from '../types';
import { SAMPLE_SCENARIOS } from '../data/sampleScenarios';

interface QuizSectionProps {
  onSaveResult?: (result: QuizResult) => void;
  initialTopic?: string;
}

interface QuestionFeedback {
  checked: boolean;
  isCorrect: boolean;
  selectedOption: string | null;
}

export const QuizSection: React.FC<QuizSectionProps> = ({ onSaveResult, initialTopic = '' }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState<QuizResult | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [qIndex: number]: string }>({});
  const [feedback, setFeedback] = useState<{ [qIndex: number]: QuestionFeedback }>({});
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setUserAnswers({});
    setFeedback({});

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          questionCount: 3,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      const questions: QuizQuestion[] = data.quiz || [];
      const newResult: QuizResult = {
        topic: topic.trim(),
        questions,
        timestamp: Date.now(),
      };

      setQuizData(newResult);
      if (onSaveResult) onSaveResult(newResult);
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qIndex: number, option: string) => {
    // If already checked, don't change or reset check state
    setUserAnswers((prev) => ({ ...prev, [qIndex]: option }));
    if (feedback[qIndex]?.checked) {
      setFeedback((prev) => {
        const copy = { ...prev };
        delete copy[qIndex];
        return copy;
      });
    }
  };

  const handleCheckAnswer = (qIndex: number) => {
    if (!quizData) return;
    const selected = userAnswers[qIndex];
    if (!selected) return;

    const question = quizData.questions[qIndex];
    // Normalize comparison to account for minor whitespace or prefix letter
    const isCorrect = selected.trim() === question.answer.trim();

    const updatedFeedback = {
      ...feedback,
      [qIndex]: {
        checked: true,
        isCorrect,
        selectedOption: selected,
      },
    };
    setFeedback(updatedFeedback);

    // Check if all answered and all correct
    const totalQuestions = quizData.questions.length;
    const checkedCount = Object.keys(updatedFeedback).length;
    if (checkedCount === totalQuestions) {
      const allCorrect = Object.values(updatedFeedback).every((f) => f.isCorrect);
      if (allCorrect) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const handleResetAnswers = () => {
    setUserAnswers({});
    setFeedback({});
  };

  const checkedCount = Object.keys(feedback).length;
  const correctCount = Object.values(feedback).filter((f) => f.isCorrect).length;
  const totalQuestions = quizData?.questions.length || 0;

  return (
    <section className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 mb-8 transition-all">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Generate a Quiz</h2>
            <p className="text-xs text-slate-500">Test understanding with instant multiple-choice questions & feedback</p>
          </div>
        </div>
        <span className="text-xs font-mono text-slate-400">Endpoint: /api/quiz</span>
      </div>

      {/* Suggested topics from PDF */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
        <span className="text-slate-400 font-medium">Examples:</span>
        {SAMPLE_SCENARIOS.quiz.map((t, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setTopic(t)}
            className="text-slate-600 hover:text-emerald-600 bg-slate-100 hover:bg-emerald-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
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
          placeholder="e.g. Pythagoras theorem, Solar System, Plate Tectonics..."
          required
          className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Quiz
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {error}
        </div>
      )}

      {quizData && (
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Interactive Quiz: &ldquo;{quizData.topic}&rdquo;
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Select an answer for each question and click &ldquo;Check Answer&rdquo; to verify.
              </p>
            </div>

            {checkedCount > 0 && (
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <span className="text-xs font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
                  Score: {correctCount}/{checkedCount}
                </span>
                <button
                  type="button"
                  onClick={handleResetAnswers}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Reset your answers"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {quizData.questions.map((q, qIndex) => {
              const currentFeedback = feedback[qIndex];
              const selected = userAnswers[qIndex];

              return (
                <div
                  key={qIndex}
                  className="p-5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3.5"
                >
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                    <span className="text-emerald-700 mr-1.5 font-bold">Q{qIndex + 1}:</span>
                    {q.question}
                  </h3>

                  {/* 4 Options */}
                  <div className="space-y-2">
                    {q.options.map((option, optIdx) => {
                      const isSelected = selected === option;
                      let optionBorder = 'border-slate-200 bg-white hover:border-slate-300';
                      let radioColor = 'border-slate-300 text-transparent';

                      if (currentFeedback?.checked) {
                        if (option === q.answer) {
                          optionBorder = 'border-emerald-500 bg-emerald-50/60 font-medium text-emerald-950';
                          radioColor = 'border-emerald-600 bg-emerald-600 text-white';
                        } else if (isSelected && !currentFeedback.isCorrect) {
                          optionBorder = 'border-red-400 bg-red-50/50 text-red-950';
                          radioColor = 'border-red-500 bg-red-500 text-white';
                        }
                      } else if (isSelected) {
                        optionBorder = 'border-emerald-600 bg-emerald-50/30 text-slate-900 shadow-xs';
                        radioColor = 'border-emerald-600 bg-emerald-600 text-white';
                      }

                      return (
                        <label
                          key={optIdx}
                          onClick={() => handleSelectOption(qIndex, option)}
                          className={`flex items-start gap-3 p-3 rounded-lg border text-sm transition-all cursor-pointer ${optionBorder}`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 transition-colors shrink-0 ${radioColor}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          </div>
                          <span className="leading-snug text-slate-800">{option}</span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Actions & Feedback */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleCheckAnswer(qIndex)}
                      disabled={!selected}
                      className="self-start px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors shadow-xs cursor-pointer"
                    >
                      Check Answer
                    </button>

                    {currentFeedback?.checked && (
                      <div className="flex-1 sm:ml-3">
                        {currentFeedback.isCorrect ? (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Correct!</span>
                          </div>
                        ) : (
                          <div className="text-xs text-red-700 bg-red-50 px-3 py-1.5 rounded-md border border-red-200 flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 font-semibold">
                              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                              <span>Incorrect. Correct answer: {q.answer}</span>
                            </div>
                            {q.explanation && (
                              <p className="text-slate-600 text-[11px] mt-0.5 pl-5">
                                {q.explanation}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {checkedCount === totalQuestions && (
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <h4 className="text-base font-semibold text-emerald-950">
                Quiz Complete! You scored {correctCount} out of {totalQuestions} ({Math.round((correctCount / totalQuestions) * 100)}%)
              </h4>
              <p className="text-xs text-emerald-800 mt-1">
                {correctCount === totalQuestions
                  ? 'Outstanding! You have mastered this concept.'
                  : 'Good effort! Review the explanations above to reinforce your understanding.'}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
