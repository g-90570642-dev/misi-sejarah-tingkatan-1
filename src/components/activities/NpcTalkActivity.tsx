import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, MessageSquare, User } from 'lucide-react';
import { NpcDialogueCard } from '../../types/game';
import { soundEngine } from '../../utils/audio';

interface NpcTalkActivityProps {
  title: string;
  instruction: string;
  npcs: NpcDialogueCard[];
  onActiveNpcChange?: (id: string) => void;
  onPointEarned: (pts: number) => void;
  onComplete: () => void;
}

export const NpcTalkActivity: React.FC<NpcTalkActivityProps> = ({
  title,
  instruction,
  npcs,
  onActiveNpcChange,
  onPointEarned,
  onComplete,
}) => {
  const [visitedIds, setVisitedIds] = useState<string[]>([]);
  const [activeNpc, setActiveNpc] = useState<NpcDialogueCard>(npcs[0]);

  const handleSelectNpc = (npc: NpcDialogueCard) => {
    setActiveNpc(npc);
    onActiveNpcChange?.(npc.id);
    if (!visitedIds.includes(npc.id)) {
      soundEngine.playCoin();
      setVisitedIds((prev) => [...prev, npc.id]);
      onPointEarned(10);
    }
  };

  // Mark first NPC visited on initial render? Wait—better let user click all 5 so every click gives feedback!
  const allVisited = visitedIds.length === npcs.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>{title}</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">{instruction}</p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-slate-800 border border-white/10 text-xs font-bold text-emerald-300 font-mono-num">
          Ditemui {visitedIds.length} / {npcs.length}
        </span>
      </div>

      {/* 5 Blocky Character NPC Cards in the City */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {npcs.map((npc) => {
          const isVisited = visitedIds.includes(npc.id);
          const isActive = activeNpc.id === npc.id;
          return (
            <button
              key={npc.id}
              type="button"
              onClick={() => handleSelectNpc(npc)}
              style={{
                borderColor: isActive
                  ? '#fbbf24'
                  : isVisited
                    ? '#10b981'
                    : 'rgba(255,255,255,0.12)',
              }}
              className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center gap-2 transition-transform hover:scale-105 cursor-pointer ${
                isActive ? 'bg-slate-800' : 'bg-slate-800/60'
              }`}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center border-2 border-white/30 relative"
                style={{ backgroundColor: npc.colorHex }}
              >
                <User className="w-6 h-6 text-white" />
                {isVisited && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 bg-slate-900 rounded-full absolute -top-1.5 -right-1.5" />
                )}
              </div>
              <div>
                <div className="font-display font-bold text-xs text-white leading-tight">
                  {npc.name}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                  {isVisited ? 'Sudah Ditemui' : 'Klik Bicara'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active NPC Dialogue Speech Panel */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-white/15 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div
              className="font-display font-bold text-base"
              style={{ color: activeNpc.colorHex }}
            >
              {activeNpc.name}
            </div>
            <div className="text-xs text-slate-400">{activeNpc.era}</div>
          </div>
          {!visitedIds.includes(activeNpc.id) && (
            <button
              type="button"
              onClick={() => handleSelectNpc(activeNpc)}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Rekod Takrif (+10 Mata)
            </button>
          )}
        </div>

        <p className="text-sm italic text-amber-200">"{activeNpc.quote}"</p>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10">
          <div className="text-[11px] font-semibold text-slate-400 mb-1">
            Pengertian Sejarah Menurut {activeNpc.name}:
          </div>
          <p className="text-sm text-white leading-relaxed font-medium">
            {activeNpc.definition}
          </p>
        </div>

        {allVisited && (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={onComplete}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-sm flex items-center gap-2 cursor-pointer"
            >
              <span>Seterusnya: Kenal Pasti Tokoh</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
