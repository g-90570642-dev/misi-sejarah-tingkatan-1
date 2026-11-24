import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Eye, HelpCircle, XCircle } from 'lucide-react';
import { DetectiveCaseItem } from '../../types/game';
import { soundEngine } from '../../utils/audio';

interface DetectiveCasesActivityProps {
  cases: DetectiveCaseItem[];
  onPointEarned: (pts: number) => void;
  onComplete: () => void;
}

export const DetectiveCasesActivity: React.FC<DetectiveCasesActivityProps> = ({
  cases,
  onPointEarned,
  onComplete,
}) => {
  const [caseIdx, setCaseIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);

  const current = cases[caseIdx];

  const handleSelect = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === current.correctIndex) {
      soundEngine.playCorrect();
      onPointEarned(10);
    } else {
      soundEngine.playWrong();
    }
  };

  const handleNext = () => {
    if (caseIdx + 1 < cases.length) {
      setCaseIdx((i) => i + 1);
      setPicked(null);
      setShowHint(false);
    } else {
      onComplete();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2">
          <Eye className="w-4 h-4 text-teal-400" />
          <span>{current.caseTitle}</span>
        </h3>
        <span className="px-3 py-1 rounded-xl bg-slate-800 border border-white/10 text-xs font-bold text-teal-300 font-mono-num">
          Kes {caseIdx + 1} / {cases.length}
        </span>
      </div>

      {/* Two Conflicting Sources Side by Side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-teal-500/30">
          <div className="text-xs font-bold text-teal-300 mb-1">
            {current.sourceA.label}
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {current.sourceA.text}
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-amber-500/30">
          <div className="text-xs font-bold text-amber-300 mb-1">
            {current.sourceB.label}
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {current.sourceB.text}
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-800/90 border border-white/10 flex items-center justify-between gap-3">
        <p className="font-display font-bold text-sm sm:text-base text-white">
          {current.question}
        </p>
        <button
          type="button"
          onClick={() => setShowHint((v) => !v)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-amber-300 flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Petunjuk</span>
        </button>
      </div>

      {showHint && (
        <div className="px-4 py-2.5 rounded-xl bg-amber-950/50 border border-amber-400/40 text-xs text-amber-200">
          Petunjuk Detektif: {current.hint}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2.5">
        {current.options.map((opt, idx) => {
          const answered = picked !== null;
          const isCorrect = idx === current.correctIndex;
          const isSelected = idx === picked;
          let cls =
            'bg-slate-800/70 hover:bg-slate-800 border-white/15 text-slate-100';
          if (answered) {
            if (isCorrect) {
              cls = 'bg-emerald-500/20 border-emerald-400 text-emerald-100';
            } else if (isSelected) {
              cls = 'bg-rose-500/20 border-rose-400 text-rose-100';
            } else {
              cls = 'bg-slate-800/35 border-white/5 text-slate-400';
            }
          }
          return (
            <button
              key={idx}
              type="button"
              disabled={answered}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-between gap-3 cursor-pointer disabled:cursor-default ${cls}`}
            >
              <span>{opt}</span>
              {answered && isCorrect && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              {answered && isSelected && !isCorrect && (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="p-4 rounded-2xl bg-slate-800 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div
              className={`text-xs font-bold ${
                picked === current.correctIndex ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {picked === current.correctIndex
                ? 'Analisis Tepat! (+10 Mata Ilmu)'
                : 'Penilaian kurang tepat — penerangan:'}
            </div>
            <p className="text-xs sm:text-sm text-slate-200 mt-1">
              {current.explanation}
            </p>
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-sm whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <span>{caseIdx + 1 < cases.length ? 'Kes Seterusnya' : 'Teruskan'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
