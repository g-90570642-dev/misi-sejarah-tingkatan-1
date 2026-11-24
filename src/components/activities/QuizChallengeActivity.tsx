import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { QuizQuestion } from '../../types/game';
import { soundEngine } from '../../utils/audio';

interface QuizChallengeActivityProps {
  title: string;
  questions: QuizQuestion[];
  accentColor: string;
  finishButtonLabel: string;
  onQuestionResult: (correct: boolean) => void;
  onComplete: (correctCount: number) => void;
}

export const QuizChallengeActivity: React.FC<QuizChallengeActivityProps> = ({
  title,
  questions,
  accentColor,
  finishButtonLabel,
  onQuestionResult,
  onComplete,
}) => {
  const [qIndex, setQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const current = questions[qIndex];

  const handleSelect = (idx: number) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);
    const isCorrect = idx === current.correctIndex;
    if (isCorrect) {
      soundEngine.playCorrect();
      setCorrectCount((c) => c + 1);
      onQuestionResult(true);
    } else {
      soundEngine.playWrong();
      onQuestionResult(false);
    }
  };

  const handleNext = () => {
    if (qIndex + 1 < questions.length) {
      setQIndex((i) => i + 1);
      setSelectedOpt(null);
      setShowHint(false);
    } else {
      onComplete(correctCount);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display font-bold text-base sm:text-lg text-white">
          {title}
        </h3>
        <span className="px-3 py-1 rounded-xl bg-slate-800 border border-white/10 text-xs font-bold text-amber-300 font-mono-num">
          Soalan {qIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Stepper Progress */}
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${((qIndex + 1) / questions.length) * 100}%`,
            backgroundColor: accentColor,
          }}
        />
      </div>

      {/* Illustrated Question Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/85 border border-white/10 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[11px] font-bold px-2.5 py-0.5 rounded-md text-slate-950 flex items-center gap-1"
            style={{ backgroundColor: accentColor }}
          >
            <Sparkles className="w-3 h-3" />
            <span>{current.illustrationLabel || 'Cabaran Ilmu Sejarah'}</span>
          </span>

          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Petunjuk</span>
          </button>
        </div>

        <h4 className="font-display font-bold text-base sm:text-lg text-white leading-snug">
          {current.prompt}
        </h4>

        {showHint && (
          <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-400/40 text-xs text-amber-200">
            Petunjuk: {current.hint}
          </div>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-2.5">
        {current.options.map((opt, idx) => {
          const answered = selectedOpt !== null;
          const isCorrect = idx === current.correctIndex;
          const isPicked = idx === selectedOpt;

          let btnClass =
            'bg-slate-800/65 hover:bg-slate-800 border-white/15 text-slate-100';
          if (answered) {
            if (isCorrect) {
              btnClass =
                'bg-emerald-500/20 border-emerald-400 text-emerald-100';
            } else if (isPicked) {
              btnClass = 'bg-rose-500/20 border-rose-400 text-rose-100';
            } else {
              btnClass = 'bg-slate-800/35 border-white/5 text-slate-400';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={answered}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-between gap-3 transition-colors cursor-pointer disabled:cursor-default ${btnClass}`}
            >
              <span className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-slate-900/75 border border-white/10 flex items-center justify-center font-mono-num text-xs font-bold shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt}</span>
              </span>
              {answered && isCorrect && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              {answered && isPicked && !isCorrect && (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {selectedOpt !== null && (
        <div className="p-4 rounded-2xl bg-slate-800 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div
              className={`text-xs font-bold mb-1 ${
                selectedOpt === current.correctIndex
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {selectedOpt === current.correctIndex
                ? 'Tepat sekali! (+10 Mata Ilmu)'
                : 'Kurang tepat — lihat penerangan:'}
            </div>
            <p className="text-xs sm:text-sm text-slate-200">
              {current.explanation}
            </p>
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-sm whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <span>
              {qIndex + 1 < questions.length
                ? 'Soalan Seterusnya'
                : finishButtonLabel}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
