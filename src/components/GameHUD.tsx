import React, { useRef, useState } from 'react';
import {
  Award,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Coins,
  Compass,
  Gamepad2,
  Gem,
  Hand,
  Map as MapIcon,
  Music,
  RotateCcw,
  Shirt,
  Sparkles,
  Star,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import {
  calculateProgressPercent,
  countCompletedMissions,
  countTotalStars,
} from '../data/sejarahBab1';
import {
  AchievementDefinition,
  NearbyTarget,
  PlayerProgress,
} from '../types/game';
import { TouchInputState } from './GameCanvas';
import { StudentAvatarBadge } from './StudentAvatarBadge';

interface GameHUDProps {
  progress: PlayerProgress;
  nearbyTarget: NearbyTarget;
  toastText: string | null;
  achievementToast: AchievementDefinition | null;
  muted: boolean;
  showTouchPad: boolean;
  sprintToggle: boolean;
  touchInputRef: React.MutableRefObject<TouchInputState>;
  onOpenMap: () => void;
  onOpenGuide: () => void;
  onOpenAvatarStudio: () => void;
  onOpenProfile: () => void;
  onOpenStudentSwitcher: () => void;
  onInteract: () => void;
  onResetCamera: () => void;
  onToggleMute: () => void;
  onToggleTouchPad: () => void;
  onToggleSprint: () => void;
  onTriggerEmote: (state: 'wave' | 'dance') => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  progress,
  nearbyTarget,
  toastText,
  achievementToast,
  muted,
  showTouchPad,
  sprintToggle,
  touchInputRef,
  onOpenMap,
  onOpenGuide,
  onOpenAvatarStudio,
  onOpenProfile,
  onOpenStudentSwitcher,
  onInteract,
  onResetCamera,
  onToggleMute,
  onToggleTouchPad,
  onToggleSprint,
  onTriggerEmote,
}) => {
  const [controlsCollapsed, setControlsCollapsed] = useState(false);

  const joyBaseRef = useRef<HTMLDivElement | null>(null);
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 });
  const joyActiveId = useRef<number | null>(null);

  const completedCount = countCompletedMissions(progress);
  const totalStars = countTotalStars(progress);
  const crystalCount = progress.knowledgeCrystals?.length || 0;
  const badgeCount = progress.achievements?.length || 0;
  const progressPct = calculateProgressPercent(progress);

  const handleJoystickStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    joyActiveId.current = e.pointerId;
    updateJoystick(e.clientX, e.clientY);
  };

  const handleJoystickMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (joyActiveId.current !== e.pointerId) return;
    updateJoystick(e.clientX, e.clientY);
  };

  const handleJoystickEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (joyActiveId.current !== e.pointerId) return;
    joyActiveId.current = null;
    setKnobOffset({ x: 0, y: 0 });
    touchInputRef.current.moveX = 0;
    touchInputRef.current.moveY = 0;
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    const base = joyBaseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = rect.width / 2 - 14;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR && dist > 0) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }
    setKnobOffset({ x: dx, y: dy });
    touchInputRef.current.moveX = dx / maxR;
    touchInputRef.current.moveY = dy / maxR;
  };

  const badgeColor = progress.avatarConfig?.shirtColor || progress.avatarColor;

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-3 sm:p-4">
      {/* Top Row: Player Card (Left) + Action Bar (Right) */}
      <div className="flex items-start justify-between gap-3">
        {/* Player Identity, Class, Points, Coins, Stars, Crystals, Badges & Mission Progress */}
        <div className="pointer-events-auto relative">
          <div className="bg-slate-900/92 border border-white/15 rounded-2xl px-3.5 py-2.5 shadow-xl flex items-center gap-3.5">
            <button
              type="button"
              onClick={onOpenProfile}
              title="Lihat Profil Pelajar & Lencana"
              className="shrink-0 transition-transform hover:scale-105 cursor-pointer"
            >
              <StudentAvatarBadge
                config={progress.avatarConfig}
                fallbackColor={badgeColor}
                size="md"
              />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="font-display font-bold text-sm sm:text-base text-white truncate max-w-[130px] sm:max-w-[175px] hover:text-amber-300 transition-colors text-left cursor-pointer"
                >
                  {progress.playerName}
                </button>
                {progress.playerClass && (
                  <>
                    <span className="text-xs text-slate-500" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-xs text-amber-300 font-semibold whitespace-nowrap">
                      {progress.playerClass}
                    </span>
                  </>
                )}
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/15 text-[11px] font-semibold text-emerald-300 flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Award className="w-3 h-3" />
                  <span className="hidden sm:inline">Profil</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenAvatarStudio}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/15 text-[11px] font-semibold text-amber-300 flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Shirt className="w-3 h-3" />
                  <span className="hidden sm:inline">Avatar</span>
                </button>
              </div>

              {/* Metrics Row */}
              <div className="flex items-center gap-2 sm:gap-2.5 mt-1 text-xs flex-wrap">
                <span
                  title="Mata Ilmu"
                  className="flex items-center gap-1 text-sky-300 font-semibold font-mono-num"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  {progress.points || 0}
                </span>
                <span className="text-slate-600" aria-hidden="true">·</span>
                <span
                  title="Syiling"
                  className="flex items-center gap-1 text-amber-300 font-semibold font-mono-num"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  {progress.coins}
                </span>
                <span className="text-slate-600" aria-hidden="true">·</span>
                <span
                  title="Bintang"
                  className="flex items-center gap-1 text-yellow-200 font-semibold font-mono-num"
                >
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  {totalStars}/24
                </span>
                <span className="text-slate-600" aria-hidden="true">·</span>
                <span
                  title="Kristal Ilmu"
                  className="flex items-center gap-1 text-cyan-300 font-semibold font-mono-num"
                >
                  <Gem className="w-3.5 h-3.5 text-cyan-400" />
                  {crystalCount}/8
                </span>
                <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>
                <span
                  title="Lencana Pencapaian"
                  className="hidden sm:flex items-center gap-1 text-pink-300 font-semibold font-mono-num"
                >
                  <Trophy className="w-3.5 h-3.5 text-pink-400" />
                  {badgeCount}/8
                </span>
                <span className="text-slate-600 hidden md:inline" aria-hidden="true">·</span>
                <span className="text-emerald-300 font-semibold font-mono-num whitespace-nowrap hidden md:inline">
                  {completedCount}/8 ({progressPct}%)
                </span>
              </div>

              {/* Compact Mission Progress Bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top-Right Compact Game Actions */}
        <div className="pointer-events-auto flex items-center gap-2 flex-wrap justify-end">
          <button
            type="button"
            onClick={onOpenMap}
            className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <MapIcon className="w-4 h-4" />
            <span>Peta Pulau ({completedCount}/8)</span>
            <span className="hidden lg:inline text-[11px] bg-slate-950/15 px-1.5 py-0.5 rounded font-mono-num">
              M
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenGuide}
            className="px-3 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-white font-semibold text-xs sm:text-sm shadow-lg flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Tok Guru</span>
          </button>

          <button
            type="button"
            onClick={onOpenStudentSwitcher}
            title="Tukar Pemain / Profil Pelajar"
            className="px-3 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-white font-semibold text-xs sm:text-sm shadow-lg flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4 text-sky-400" />
            <span className="hidden md:inline">Tukar Pelajar</span>
          </button>

          <button
            type="button"
            onClick={onResetCamera}
            title="Set Semula Kamera (R)"
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-slate-200 shadow-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            title={muted ? 'Pasang Bunyi' : 'Senyapkan Bunyi'}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-slate-200 shadow-lg transition-colors cursor-pointer"
          >
            {muted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-sky-400" />
            )}
          </button>
        </div>
      </div>

      {/* Achievement Unlocked Celebration Banner */}
      {achievementToast && (
        <div className="pointer-events-none fixed top-20 left-1/2 -translate-x-1/2 z-40">
          <div
            className="bg-slate-900/95 border-2 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3"
            style={{ borderColor: achievementToast.colorHex }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: achievementToast.colorHex }}
            >
              <Trophy className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-300">
                Lencana Pencapaian Baharu Dibuka!
              </div>
              <div className="font-display font-bold text-sm text-white">
                {achievementToast.title}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Center-Top Toast Notification */}
      {toastText && !achievementToast && (
        <div className="pointer-events-none fixed top-20 left-1/2 -translate-x-1/2 z-30">
          <div className="bg-slate-900/95 border border-amber-400/50 text-amber-200 px-4 py-2 rounded-xl shadow-2xl text-xs sm:text-sm font-semibold whitespace-nowrap">
            {toastText}
          </div>
        </div>
      )}

      {/* Bottom Area: Touch Controls + Contextual Prompt + Collapsible Controls Dock */}
      <div className="relative flex flex-col items-center justify-end gap-2.5">
        {/* Contextual Nearby Interaction Prompt */}
        {nearbyTarget && (
          <button
            type="button"
            onClick={onInteract}
            className="pointer-events-auto px-4 py-2.5 rounded-2xl bg-slate-900/95 border-2 shadow-2xl flex items-center gap-2.5 text-white font-semibold text-sm hover:scale-105 transition-transform cursor-pointer"
            style={{
              borderColor:
                nearbyTarget.type === 'portal'
                  ? nearbyTarget.color
                  : '#fbbf24',
            }}
          >
            <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-mono-num text-xs font-bold">
              E
            </span>
            <span>{nearbyTarget.label}</span>
          </button>
        )}

        {/* Mobile / Touch Virtual Joystick & Action Buttons */}
        {showTouchPad && (
          <div className="w-full flex items-end justify-between px-1 sm:px-4 pb-1">
            <div
              ref={joyBaseRef}
              onPointerDown={handleJoystickStart}
              onPointerMove={handleJoystickMove}
              onPointerUp={handleJoystickEnd}
              onPointerCancel={handleJoystickEnd}
              className="pointer-events-auto w-28 h-28 rounded-full bg-slate-900/75 border-2 border-white/25 relative flex items-center justify-center touch-none shadow-xl"
            >
              <div
                className="w-12 h-12 rounded-full bg-amber-400 border-2 border-white shadow-lg"
                style={{
                  transform: `translate(${knobOffset.x}px, ${knobOffset.y}px)`,
                }}
              />
            </div>

            <div className="pointer-events-auto flex items-center gap-2.5">
              {nearbyTarget && (
                <button
                  type="button"
                  onClick={onInteract}
                  className="w-16 h-16 rounded-full bg-emerald-500 active:bg-emerald-400 border-2 border-white text-slate-950 font-display font-bold text-xs shadow-xl flex flex-col items-center justify-center"
                >
                  <Compass className="w-5 h-5" />
                  <span>MASUK</span>
                </button>
              )}
              <button
                type="button"
                onClick={onToggleSprint}
                className={`w-14 h-14 rounded-full border-2 border-white font-display font-bold text-[11px] shadow-xl flex flex-col items-center justify-center ${
                  sprintToggle
                    ? 'bg-sky-400 text-slate-950'
                    : 'bg-slate-800 text-white'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>LARI</span>
              </button>
              <button
                type="button"
                onPointerDown={() => {
                  touchInputRef.current.jumpPressed = true;
                }}
                className="w-16 h-16 rounded-full bg-amber-500 active:bg-amber-400 border-2 border-white text-slate-950 font-display font-bold text-xs shadow-xl flex items-center justify-center"
              >
                LOMPAT
              </button>
            </div>
          </div>
        )}

        {/* Collapsible Bottom Controls Dock */}
        <div className="pointer-events-auto flex flex-col items-center">
          <button
            type="button"
            onClick={() => setControlsCollapsed((v) => !v)}
            className="px-3 py-1 rounded-t-xl bg-slate-900/90 border border-b-0 border-white/15 text-[11px] font-medium text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            {controlsCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Tunjuk Kawalan</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Sembunyi Kawalan</span>
              </>
            )}
          </button>

          {!controlsCollapsed && (
            <div className="bg-slate-900/90 border border-white/15 rounded-2xl px-4 py-2 shadow-xl flex items-center gap-2.5 sm:gap-3.5 text-xs text-slate-200 flex-wrap justify-center">
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/15 font-mono-num text-[11px] text-amber-300">
                  WASD
                </kbd>
                <span>Gerak</span>
              </span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/15 font-mono-num text-[11px] text-amber-300">
                  Space
                </kbd>
                <span>Lompat</span>
              </span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/15 font-mono-num text-[11px] text-amber-300">
                  E
                </kbd>
                <span>Masuk</span>
              </span>

              <button
                type="button"
                onClick={onToggleSprint}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                  sprintToggle
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-800 border-white/15 text-slate-300 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Lari (Shift)</span>
              </button>

              <button
                type="button"
                onClick={() => onTriggerEmote('wave')}
                className="px-2.5 py-1 rounded-lg border bg-slate-800 border-white/15 text-slate-200 hover:bg-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Hand className="w-3.5 h-3.5 text-emerald-400" />
                <span>Lambai (F)</span>
              </button>

              <button
                type="button"
                onClick={() => onTriggerEmote('dance')}
                className="px-2.5 py-1 rounded-lg border bg-slate-800 border-white/15 text-slate-200 hover:bg-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Music className="w-3.5 h-3.5 text-amber-400" />
                <span>Tarian (G)</span>
              </button>

              <button
                type="button"
                onClick={onToggleTouchPad}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                  showTouchPad
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                    : 'bg-slate-800 border-white/15 text-slate-300 hover:text-white'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Pad Sentuh</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
