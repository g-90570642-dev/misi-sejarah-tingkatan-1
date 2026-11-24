import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Clock,
  Compass,
  Eye,
  Gem,
  GitBranch,
  Navigation,
  ScrollText,
  Search,
  Star,
  Users,
  X,
} from 'lucide-react';
import { countCompletedMissions, MISSION_TOPICS } from '../data/sejarahBab1';
import { MissionTopic, PlayerProgress, PortalId } from '../types/game';

interface AdventureMapModalProps {
  progress: PlayerProgress;
  onClose: () => void;
  onTeleportToPortal: (topic: MissionTopic) => void;
  onStartMissionDirect: (id: PortalId) => void;
}

function TopicIcon({
  name,
  className,
}: {
  name: MissionTopic['iconName'];
  className?: string;
}) {
  switch (name) {
    case 'book':
      return <BookOpen className={className} />;
    case 'users':
      return <Users className={className} />;
    case 'clock':
      return <Clock className={className} />;
    case 'scroll':
      return <ScrollText className={className} />;
    case 'search':
      return <Search className={className} />;
    case 'git-branch':
      return <GitBranch className={className} />;
    case 'eye':
      return <Eye className={className} />;
    default:
      return <Award className={className} />;
  }
}

export const AdventureMapModal: React.FC<AdventureMapModalProps> = ({
  progress,
  onClose,
  onTeleportToPortal,
  onStartMissionDirect,
}) => {
  const [selectedId, setSelectedId] = useState<PortalId>(1);
  const selectedTopic =
    MISSION_TOPICS.find((t) => t.id === selectedId) || MISSION_TOPICS[0];
  const selectedProg = progress.missions[selectedTopic.id];
  const hasCrystal = progress.knowledgeCrystals?.includes(selectedTopic.id);
  const completedCount = countCompletedMissions(progress);
  const crystalCount = progress.knowledgeCrystals?.length || 0;

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/85 flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-4 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <Compass className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-white">
                Peta Pengembaraan: Lapan Pulau Misteri
              </h2>
              <p className="text-xs text-slate-400">
                Kemajuan: {completedCount}/8 Misi · {crystalCount}/8 Kristal Ilmu
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup peta"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Map + Island Details Split */}
        <div className="flex-1 overflow-y-auto custom-scroll grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 p-4 sm:p-5 bg-[#0a2a4a] relative flex items-center justify-center min-h-[340px]">
            <svg
              viewBox="0 0 800 580"
              className="w-full h-auto max-h-[470px] rounded-2xl border border-sky-300/20 shadow-inner"
              style={{
                background:
                  'radial-gradient(circle at 50% 50%, #0369a1 0%, #0c4a6e 58%, #082f49 100%)',
              }}
            >
              <circle
                cx="400"
                cy="290"
                r="210"
                fill="none"
                stroke="rgba(186, 230, 253, 0.22)"
                strokeWidth="2"
                strokeDasharray="8 8"
              />
              <circle
                cx="400"
                cy="290"
                r="135"
                fill="none"
                stroke="rgba(186, 230, 253, 0.14)"
                strokeWidth="1.5"
                strokeDasharray="5 7"
              />

              <g transform="translate(76, 82)" opacity="0.78">
                <circle
                  cx="0"
                  cy="0"
                  r="34"
                  fill="rgba(15, 23, 42, 0.45)"
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                />
                <polygon points="0,-28 7,0 -7,0" fill="#fbbf24" />
                <polygon points="0,28 7,0 -7,0" fill="#94a3b8" />
                <polygon points="-28,0 0,7 0,-7" fill="#94a3b8" />
                <polygon points="28,0 0,7 0,-7" fill="#94a3b8" />
                <text
                  x="0"
                  y="-38"
                  textAnchor="middle"
                  fill="#fde68a"
                  fontSize="12"
                  fontWeight="700"
                >
                  U
                </text>
              </g>

              {MISSION_TOPICS.map((topic) => (
                <line
                  key={`route-${topic.id}`}
                  x1="400"
                  y1="290"
                  x2={topic.mapCoords.x}
                  y2={topic.mapCoords.y}
                  stroke={
                    progress.missions[topic.id]?.completed
                      ? '#fde047'
                      : 'rgba(224, 242, 254, 0.35)'
                  }
                  strokeWidth={selectedId === topic.id ? '3.5' : '2'}
                  strokeDasharray="6 6"
                />
              ))}

              <g transform="translate(400, 290)">
                <ellipse
                  cx="0"
                  cy="6"
                  rx="62"
                  ry="42"
                  fill="#fde68a"
                  opacity="0.95"
                />
                <ellipse cx="0" cy="0" rx="52" ry="34" fill="#22c55e" />
                <rect
                  x="-14"
                  y="-16"
                  width="28"
                  height="22"
                  rx="4"
                  fill="#b45309"
                />
                <polygon points="-18,-15 0,-30 18,-15" fill="#f59e0b" />
                <text
                  x="0"
                  y="24"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="700"
                >
                  Kampung Purba
                </text>
              </g>

              {MISSION_TOPICS.map((topic) => {
                const mProg = progress.missions[topic.id];
                const isSelected = selectedId === topic.id;
                const { x, y } = topic.mapCoords;

                return (
                  <g
                    key={topic.id}
                    transform={`translate(${x}, ${y})`}
                    onClick={() => setSelectedId(topic.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {isSelected && (
                      <circle
                        cx="0"
                        cy="0"
                        r="48"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="3"
                        strokeDasharray="6 4"
                      />
                    )}
                    <ellipse
                      cx="0"
                      cy="6"
                      rx="42"
                      ry="27"
                      fill="#fde68a"
                      opacity="0.9"
                    />
                    <ellipse
                      cx="0"
                      cy="0"
                      rx="35"
                      ry="21"
                      fill={topic.colorHex}
                    />
                    <circle
                      cx="0"
                      cy="-6"
                      r="14"
                      fill="#0f172a"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x="0"
                      y="-1"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="13"
                      fontWeight="800"
                    >
                      {topic.id}
                    </text>

                    <rect
                      x="-64"
                      y="24"
                      width="128"
                      height="22"
                      rx="7"
                      fill="rgba(15, 23, 42, 0.9)"
                      stroke={isSelected ? '#fbbf24' : 'rgba(255,255,255,0.2)'}
                      strokeWidth="1.2"
                    />
                    <text
                      x="0"
                      y="39"
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="11"
                      fontWeight="600"
                    >
                      {topic.islandName}
                    </text>

                    {mProg?.completed && (
                      <text
                        x="0"
                        y="-26"
                        textAnchor="middle"
                        fill="#fde047"
                        fontSize="13"
                        fontWeight="700"
                      >
                        {'★'.repeat(mProg.stars)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between bg-slate-900 border-t lg:border-t-0 lg:border-l border-white/10">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg text-slate-950"
                  style={{ backgroundColor: selectedTopic.colorHex }}
                >
                  Portal {selectedTopic.id} · {selectedTopic.islandName}
                </span>
                <span className="text-xs font-semibold text-amber-300 font-mono-num">
                  {selectedProg?.stars || 0} / 3 Bintang
                </span>
              </div>

              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-slate-950 shadow-lg"
                  style={{ backgroundColor: selectedTopic.colorHex }}
                >
                  <TopicIcon
                    name={selectedTopic.iconName}
                    className="w-6 h-6"
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-sky-300">
                    {selectedTopic.worldTitle}
                  </div>
                  <h3 className="font-display font-bold text-xl text-white">
                    {selectedTopic.title}
                  </h3>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                    {selectedTopic.subtitle}
                  </p>
                </div>
              </div>

              <div className="space-y-2 my-4">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/80 border border-white/10">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`w-5 h-5 ${
                        (selectedProg?.stars || 0) >= s
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-slate-300 ml-1">
                    {selectedProg?.completed
                      ? `Misi Selesai (Skor: ${selectedProg.bestScore})`
                      : 'Belum diterokai — 3 aktiviti interaktif menanti!'}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/60 border border-white/10 text-xs">
                  <Gem
                    className={`w-4 h-4 shrink-0 ${
                      hasCrystal ? 'text-cyan-400' : 'text-slate-500'
                    }`}
                  />
                  <span className={hasCrystal ? 'text-cyan-200 font-semibold' : 'text-slate-400'}>
                    {hasCrystal
                      ? `${selectedTopic.crystalName} telah dikumpul!`
                      : `Ganjaran Kristal: ${selectedTopic.crystalName}`}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-white/10 mb-5">
                <div className="text-xs font-semibold text-slate-400 mb-1">
                  Ringkasan Ilmu: {selectedTopic.facts[0].title}
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {selectedTopic.facts[0].summary}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => onTeleportToPortal(selectedTopic)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/15 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-sky-400" />
                <span>Gerak ke Portal {selectedTopic.id}</span>
              </button>
              <button
                type="button"
                onClick={() => onStartMissionDirect(selectedTopic.id)}
                className="flex-1 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Mula Misi</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
