import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, GripVertical, HelpCircle } from 'lucide-react';
import { ClassifyBucket, ClassifyItem } from '../../types/game';
import { soundEngine } from '../../utils/audio';

interface ClassifyActivityProps {
  title: string;
  instruction: string;
  buckets: ClassifyBucket[];
  items: ClassifyItem[];
  onPointEarned: (pts: number) => void;
  onComplete: () => void;
}

export const ClassifyActivity: React.FC<ClassifyActivityProps> = ({
  title,
  instruction,
  buckets,
  items,
  onPointEarned,
  onComplete,
}) => {
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const remainingItems = items.filter((it) => !placed[it.id]);

  const tryPlace = (itemId: string, bucketId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item || placed[item.id]) return;

    if (item.bucketId === bucketId) {
      soundEngine.playCorrect();
      setPlaced((prev) => ({ ...prev, [item.id]: bucketId }));
      setSelectedItemId(null);
      setDraggingId(null);
      onPointEarned(10);
      setFeedback({
        ok: true,
        message: `Betul! (+10 Mata) ${item.explanation}`,
      });
    } else {
      soundEngine.playWrong();
      setFeedback({
        ok: false,
        message: `Cuba lagi! Petunjuk: ${item.hint}`,
      });
      setSelectedItemId(null);
      setDraggingId(null);
    }
  };

  const allSorted = remainingItems.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display font-bold text-base sm:text-lg text-white">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            {instruction} (Seret kad ke kotak kategori atau klik kad lalu klik kategori)
          </p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-slate-800 border border-white/10 text-xs font-bold text-amber-300 font-mono-num">
          Dikelaskan {Object.keys(placed).length} / {items.length}
        </span>
      </div>

      {/* Unsorted Cards Pool */}
      {!allSorted && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {remainingItems.map((item) => {
            const active = selectedItemId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                draggable
                onDragStart={() => {
                  setDraggingId(item.id);
                  setSelectedItemId(item.id);
                }}
                onClick={() => setSelectedItemId(active ? null : item.id)}
                className={`p-3 rounded-xl border-2 text-left flex items-center gap-2.5 transition-colors cursor-grab active:cursor-grabbing ${
                  active
                    ? 'bg-slate-800 border-amber-400 text-white'
                    : 'bg-slate-800/75 hover:bg-slate-800 border-white/15 text-slate-100'
                }`}
              >
                <GripVertical className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs sm:text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Target Category Buckets */}
      <div
        className={`grid gap-3 ${
          buckets.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'
        }`}
      >
        {buckets.map((b) => {
          const bucketItems = items.filter((it) => placed[it.id] === b.id);
          return (
            <div
              key={b.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = draggingId || selectedItemId;
                if (id) tryPlace(id, b.id);
              }}
              onClick={() => {
                if (selectedItemId) tryPlace(selectedItemId, b.id);
              }}
              style={{ borderColor: b.colorHex }}
              className={`p-3.5 rounded-2xl border-2 border-dashed bg-slate-900/80 min-h-[120px] flex flex-col gap-2 transition-colors ${
                selectedItemId ? 'cursor-pointer hover:bg-slate-800/90' : ''
              }`}
            >
              <div>
                <div
                  className="font-display font-bold text-sm"
                  style={{ color: b.colorHex }}
                >
                  {b.title}
                </div>
                <div className="text-[11px] text-slate-400">{b.subtitle}</div>
              </div>
              <div className="space-y-1.5 mt-1">
                {bucketItems.map((bi) => (
                  <div
                    key={bi.id}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-100 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{bi.label}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

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
          {allSorted && (
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
