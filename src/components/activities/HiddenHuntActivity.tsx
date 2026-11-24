import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Search, Sparkles } from 'lucide-react';
import { HiddenObjectItem } from '../../types/game';
import { soundEngine } from '../../utils/audio';

interface HiddenHuntActivityProps {
  title: string;
  instruction: string;
  items: HiddenObjectItem[];
  accentColor: string;
  onPointEarned: (pts: number) => void;
  onComplete: () => void;
}

export const HiddenHuntActivity: React.FC<HiddenHuntActivityProps> = ({
  title,
  instruction,
  items,
  accentColor,
  onPointEarned,
  onComplete,
}) => {
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [activeFact, setActiveFact] = useState<HiddenObjectItem | null>(null);

  const handleFind = (item: HiddenObjectItem) => {
    setActiveFact(item);
    if (!foundIds.includes(item.id)) {
      soundEngine.playCrystal();
      setFoundIds((prev) => [...prev, item.id]);
      onPointEarned(10);
    }
  };

  const allFound = foundIds.length === items.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2">
            <Search className="w-4 h-4" style={{ color: accentColor }} />
            <span>{title}</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">{instruction}</p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-slate-800 border border-white/10 text-xs font-bold text-amber-300 font-mono-num">
          Ditemui {foundIds.length} / {items.length}
        </span>
      </div>

      {/* Interactive Illustrated Hunt Arena */}
      <div
        className="relative w-full h-60 sm:h-64 rounded-2xl border border-white/15 overflow-hidden shadow-inner"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(30, 58, 138, 0.55) 0%, rgba(15, 23, 42, 0.95) 85%)',
        }}
      >
        {/* Subtle Decorative Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-20" aria-hidden="true">
          <defs>
            <pattern id="hunt-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#94a3b8" strokeWidth="0.7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hunt-grid)" />
        </svg>

        {items.map((item) => {
          const isFound = foundIds.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleFind(item)}
              style={{
                left: `${item.xPct}%`,
                top: `${item.yPct}%`,
                borderColor: isFound ? '#34d399' : item.colorHex,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded-2xl border-2 shadow-xl transition-transform duration-150 flex items-center gap-2 cursor-pointer ${
                isFound
                  ? 'bg-emerald-950/90 text-emerald-200 scale-95'
                  : 'bg-slate-900/90 hover:scale-110 text-white'
              }`}
            >
              {isFound ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Sparkles
                  className="w-4 h-4 shrink-0"
                  style={{ color: item.colorHex }}
                />
              )}
              <div className="text-left">
                <div className="text-[10px] text-slate-400 leading-none">
                  {item.badge}
                </div>
                <div className="text-xs font-bold whitespace-nowrap mt-0.5">
                  {isFound ? item.label : 'Klik Teroka!'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Discovery Readout */}
      {activeFact ? (
        <div className="p-4 rounded-2xl bg-slate-800/90 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-emerald-400">
              Ditemui: {activeFact.label} (+10 Mata)
            </div>
            <p className="text-sm text-slate-200 mt-1 leading-relaxed">
              {activeFact.fact}
            </p>
          </div>
          {allFound && (
            <button
              type="button"
              onClick={onComplete}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-sm whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <span>Terus ke Aktiviti Seterusnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-slate-800/50 border border-white/10 text-xs text-slate-300">
          Klik semua penanda bercahaya di atas untuk menemui kata kunci dan mengumpul mata.
        </div>
      )}
    </div>
  );
};
