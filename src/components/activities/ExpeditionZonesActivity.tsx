import React, { useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Mic, Pickaxe } from 'lucide-react';
import { DigTile } from '../../types/game';
import { soundEngine } from '../../utils/audio';

interface ExpeditionZonesActivityProps {
  zones: DigTile[];
  onPointEarned: (pts: number) => void;
  onComplete: () => void;
}

export const ExpeditionZonesActivity: React.FC<ExpeditionZonesActivityProps> = ({
  zones,
  onPointEarned,
  onComplete,
}) => {
  const [exploredIds, setExploredIds] = useState<string[]>([]);
  const [activeZone, setActiveZone] = useState<DigTile | null>(null);

  const handleExplore = (zone: DigTile) => {
    setActiveZone(zone);
    if (!exploredIds.includes(zone.id)) {
      soundEngine.playChest();
      setExploredIds((prev) => [...prev, zone.id]);
      onPointEarned(10);
    }
  };

  const allDone = exploredIds.length === zones.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display font-bold text-base sm:text-lg text-white">
            Terokai Tapak Ekspedisi Arkeologi, Arkib & Temu Bual
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Klik setiap zon ekspedisi untuk mengkaji perpustakaan, menemubual orang sumber dan menggali artifak!
          </p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-slate-800 border border-white/10 text-xs font-bold text-rose-300 font-mono-num">
          Zon {exploredIds.length} / {zones.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {zones.map((z) => {
          const done = exploredIds.includes(z.id);
          const Icon =
            z.methodTag === 'Bertulis'
              ? BookOpen
              : z.methodTag === 'Lisan'
                ? Mic
                : Pickaxe;
          const color =
            z.methodTag === 'Bertulis'
              ? '#f59e0b'
              : z.methodTag === 'Lisan'
                ? '#10b981'
                : '#f43f5e';

          return (
            <button
              key={z.id}
              type="button"
              onClick={() => handleExplore(z)}
              style={{ borderColor: done ? '#34d399' : color }}
              className={`p-4 rounded-2xl border-2 text-left transition-transform hover:scale-[1.02] cursor-pointer ${
                done ? 'bg-emerald-950/50' : 'bg-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span
                  className="text-xs font-bold flex items-center gap-1.5"
                  style={{ color }}
                >
                  <Icon className="w-4 h-4" />
                  <span>Kaedah {z.methodTag}</span>
                </span>
                {done && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <div className="font-display font-bold text-sm text-white">
                {z.zoneLabel}
              </div>
              <div className="text-xs text-slate-300 mt-1">
                {done
                  ? `Penemuan: ${z.discoveryTitle}`
                  : z.methodTag === 'Arkeologi'
                    ? 'Klik untuk menggali petak arkeologi!'
                    : z.methodTag === 'Lisan'
                      ? 'Klik untuk menemubual NPC saksi!'
                      : 'Klik untuk menyemak dokumen purba!'}
              </div>
            </button>
          );
        })}
      </div>

      {activeZone && (
        <div className="p-4 rounded-2xl bg-slate-800/90 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-amber-300">
              {activeZone.discoveryTitle} (+10 Mata)
            </div>
            <p className="text-sm text-slate-200 mt-1 leading-relaxed">
              {activeZone.discoveryText}
            </p>
          </div>
          {allDone && (
            <button
              type="button"
              onClick={onComplete}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-sm whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <span>Seterusnya: Kelaskan Aktiviti</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
