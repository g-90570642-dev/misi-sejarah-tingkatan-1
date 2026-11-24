import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, GripVertical, HelpCircle } from 'lucide-react';
import { MatchPair } from '../../types/game';
import { soundEngine } from '../../utils/audio';

interface DragDropMatchActivityProps {
  title: string;
  instruction: string;
  pairs: MatchPair[];
  accentColor: string;
  onPointEarned: (pts: number) => void;
  onComplete: () => void;
}

export const DragDropMatchActivity: React.FC<DragDropMatchActivityProps> = ({
  title,
  instruction,
  pairs,
  accentColor,
  onPointEarned,
  onComplete,
}) => {
  // Deterministic shuffle for right-side targets
  const shuffledRight = useMemo(() => {
    const arr = [...pairs];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (i * 7 + 3) % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [pairs]);

  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const attemptMatch = (leftId: string, rightTargetPair: MatchPair) => {
    if (matchedIds.includes(leftId) || matchedIds.includes(rightTargetPair.id)) {
      return;
    }
    if (leftId === rightTargetPair.id) {
      soundEngine.playCorrect();
      setMatchedIds((prev) => [...prev, leftId]);
      setSelectedLeftId(null);
      setDraggingId(null);
      onPointEarned(10);
      setFeedback({
        ok: true,
        message: `Tepat! (+10 Mata) ${rightTargetPair.explanation}`,
      });
    } else {
      soundEngine.playWrong();
      const leftItem = pairs.find((p) => p.id === leftId);
      setFeedback({
        ok: false,
        message: `Belum tepat! Petunjuk untuk "${leftItem?.leftTitle}": ${leftItem?.explanation}`,
      });
      setSelectedLeftId(null);
      setDraggingId(null);
    }
  };

  const allMatched = matchedIds.length === pairs.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display font-bold text-base sm:text-lg text-white">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            {instruction} (Seret & lepas atau klik kad kiri lalu klik padanan kanan)
          </p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-slate-800 border border-white/10 text-xs font-bold text-emerald-300 font-mono-num">
          Padanan {matchedIds.length} / {pairs.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Draggable / Selectable Left Cards */}
        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-slate-400">
            Istilah / Situasi (Seret atau Klik)
          </div>
          {pairs.map((p) => {
            const done = matchedIds.includes(p.id);
            const active = selectedLeftId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                draggable={!done}
                disabled={done}
                onDragStart={() => {
                  setDraggingId(p.id);
                  setSelectedLeftId(p.id);
                }}
                onClick={() => setSelectedLeftId(active ? null : p.id)}
                style={{
                  borderColor: done
                    ? '#10b981'
                    : active
                      ? accentColor
                      : 'rgba(255,255,255,0.12)',
                }}
                className={`w-full text-left p-3 rounded-xl border-2 flex items-center gap-2.5 transition-colors cursor-grab active:cursor-grabbing disabled:cursor-default ${
                  done
                    ? 'bg-emerald-950/50 text-emerald-200'
                    : active
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-800/70 hover:bg-slate-800 text-slate-100'
                }`}
              >
                {done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <GripVertical className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span className="text-xs sm:text-sm font-semibold">
                  {p.leftTitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Drop Target Right Cards */}
        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-slate-400">
            Maksud / Padanan Tepat (Lepas di Sini)
          </div>
          {shuffledRight.map((target) => {
            const done = matchedIds.includes(target.id);
            return (
              <button
                key={target.id}
                type="button"
                disabled={done}
                onDragOver={(e) => {
                  if (!done) e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const sourceId = draggingId || selectedLeftId;
                  if (sourceId) attemptMatch(sourceId, target);
                }}
                onClick={() => {
                  if (selectedLeftId) {
                    attemptMatch(selectedLeftId, target);
                  }
                }}
                className={`w-full text-left p-3 rounded-xl border-2 border-dashed transition-colors cursor-pointer disabled:cursor-default ${
                  done
                    ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200'
                    : selectedLeftId
                      ? 'bg-slate-800/90 border-amber-400/70 hover:bg-slate-800 text-white'
                      : 'bg-slate-800/40 border-white/15 text-slate-200'
                }`}
              >
                <div className="text-xs sm:text-sm leading-snug">
                  {target.rightTitle}
                </div>
                {done && (
                  <div className="text-[11px] font-bold text-emerald-400 mt-1">
                    Dipadankan: {target.leftTitle}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback & Next Stage */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            feedback.ok
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-100'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-100'
          }`}
        >
          <div className="flex items-start gap-2 text-xs sm:text-sm">
            <HelpCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{feedback.message}</span>
          </div>
          {allMatched && (
            <button
              type="button"
              onClick={onComplete}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-sm whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <span>Seterusnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
