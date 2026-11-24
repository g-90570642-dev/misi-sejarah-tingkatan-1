import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, CheckCircle2, HelpCircle } from 'lucide-react';
import { ChronoEventItem } from '../../types/game';
import { soundEngine } from '../../utils/audio';

interface ChronoOrderActivityProps {
  title: string;
  instruction: string;
  items: ChronoEventItem[];
  modeLabel?: string;
  onPointEarned: (pts: number) => void;
  onComplete: () => void;
}

export const ChronoOrderActivity: React.FC<ChronoOrderActivityProps> = ({
  title,
  instruction,
  items,
  modeLabel = 'Susunan Kronologi',
  onPointEarned,
  onComplete,
}) => {
  // Initial scrambled order (deterministic so it is never pre-solved)
  const initialOrder = useMemo(() => {
    const arr = [...items];
    if (arr.length >= 3) {
      [arr[0], arr[arr.length - 1]] = [arr[arr.length - 1], arr[0]];
      [arr[1], arr[2]] = [arr[2], arr[1]];
    }
    return arr;
  }, [items]);

  const [ordered, setOrdered] = useState<ChronoEventItem[]>(initialOrder);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= ordered.length || isCorrect) return;
    const copy = [...ordered];
    const [picked] = copy.splice(from, 1);
    copy.splice(to, 0, picked);
    setOrdered(copy);
    setChecked(false);
  };

  const handleCheck = () => {
    const ok = ordered.every((item, idx) => item.order === idx + 1);
    setChecked(true);
    if (ok) {
      soundEngine.playVictory();
      setIsCorrect(true);
      onPointEarned(items.length * 10);
    } else {
      soundEngine.playWrong();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display font-bold text-base sm:text-lg text-white">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">{instruction}</p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-slate-800 border border-white/10 text-xs font-bold text-sky-300">
          {modeLabel}
        </span>
      </div>

      <div className="space-y-2.5">
        {ordered.map((item, idx) => {
          const rightSpot = checked && item.order === idx + 1;
          return (
            <div
              key={item.id}
              draggable={!isCorrect}
              onDragStart={() => setDragIdx(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIdx !== null && dragIdx !== idx) {
                  moveItem(dragIdx, idx);
                }
                setDragIdx(null);
              }}
              className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 transition-colors ${
                isCorrect || rightSpot
                  ? 'bg-emerald-950/50 border-emerald-500/60'
                  : checked
                    ? 'bg-rose-950/40 border-rose-500/40'
                    : 'bg-slate-800/80 border-white/15 cursor-grab'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-slate-900 border border-white/15 flex items-center justify-center font-mono-num text-xs font-bold text-amber-300 shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div>
                  <div className="font-display font-bold text-sm text-white">
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {isCorrect ? `${item.timeLabel} — ${item.detail}` : item.detail}
                  </div>
                </div>
              </div>

              {!isCorrect ? (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, idx - 1)}
                    aria-label="Naikkan kedudukan"
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 disabled:opacity-35 text-slate-200 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === ordered.length - 1}
                    onClick={() => moveItem(idx, idx + 1)}
                    aria-label="Turunkan kedudukan"
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 disabled:opacity-35 text-slate-200 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {checked && !isCorrect && (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-rose-300">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>
              Petunjuk: Mulakan daripada kejadian paling awal hingga yang paling terkemudian!
            </span>
          </div>
        )}

        {isCorrect ? (
          <div className="w-full flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40">
            <span className="text-sm font-semibold text-emerald-200">
              Susunan tepat! (+{items.length * 10} Mata Ilmu)
            </span>
            <button
              type="button"
              onClick={onComplete}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-sm flex items-center gap-2 cursor-pointer"
            >
              <span>Seterusnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleCheck}
            className="ml-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-sm cursor-pointer"
          >
            Semak Susunan
          </button>
        )}
      </div>
    </div>
  );
};
