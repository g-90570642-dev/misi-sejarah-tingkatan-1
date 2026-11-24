import React, { useState } from 'react';
import { BookOpen, ChevronRight, Compass, Map as MapIcon, X } from 'lucide-react';
import { MISSION_TOPICS, TOK_GURU_DIALOGUES } from '../data/sejarahBab1';
import { MissionTopic, PlayerProgress } from '../types/game';

interface GuideModalProps {
  progress: PlayerProgress;
  onClose: () => void;
  onOpenMap: () => void;
  onTeleportToPortal: (topic: MissionTopic) => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({
  progress,
  onClose,
  onOpenMap,
  onTeleportToPortal,
}) => {
  const [tipIdx, setTipIdx] = useState(0);
  const currentTip = TOK_GURU_DIALOGUES[tipIdx];

  // Suggest next uncompleted portal
  const nextTopic =
    MISSION_TOPICS.find((t) => !progress.missions[t.id]?.completed) ||
    MISSION_TOPICS[0];

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/80 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="text-xs font-semibold text-teal-300">
                Panduan Sejarah Kampung Purba
              </div>
              <h2 className="font-display font-bold text-lg text-white">
                {currentTip.speaker}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-white/10">
            <div className="font-display font-bold text-base text-amber-300 mb-1.5">
              {currentTip.title}
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {currentTip.message}
            </p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
              <span className="text-xs text-slate-400 font-mono-num">
                Pesanan {tipIdx + 1} / {TOK_GURU_DIALOGUES.length}
              </span>
              <button
                type="button"
                onClick={() =>
                  setTipIdx((i) => (i + 1) % TOK_GURU_DIALOGUES.length)
                }
                className="text-xs font-semibold text-teal-300 hover:text-teal-200 flex items-center gap-1 cursor-pointer"
              >
                <span>Pesanan Seterusnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Recommended Next Portal */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-400">Cadangan Misi Seterusnya</div>
              <div className="font-display font-bold text-sm text-white mt-0.5">
                Portal {nextTopic.id}: {nextTopic.title}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onTeleportToPortal(nextTopic)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Pergi ke Portal {nextTopic.id}</span>
            </button>
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onOpenMap}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer"
            >
              <MapIcon className="w-4 h-4 text-amber-400" />
              <span>Buka Peta Pulau</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-display font-bold text-sm cursor-pointer"
            >
              Teruskan Pengembaraan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
