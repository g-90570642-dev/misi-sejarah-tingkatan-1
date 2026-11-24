import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Award,
  CheckCircle2,
  Clock,
  Coins,
  Compass,
  Download,
  Gem,
  Lock,
  Search,
  Shirt,
  Sparkles,
  Star,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { ACHIEVEMENTS } from '../data/achievements';
import {
  MISSION_TOPICS,
  calculateProgressPercent,
  countCompletedMissions,
  countTotalStars,
} from '../data/sejarahBab1';
import {
  AchievementDefinition,
  AvatarAnimState,
  StudentProfile,
} from '../types/game';
import { soundEngine } from '../utils/audio';
import { exportProfilesToCsv } from '../utils/studentStorage';
import { AvatarPreview3D } from './AvatarPreview3D';

interface StudentProfileModalProps {
  profile: StudentProfile;
  allProfiles: StudentProfile[];
  onClose: () => void;
  onOpenAvatarStudio: () => void;
  onOpenStudentSwitcher: () => void;
}

function renderBadgeIcon(iconName: AchievementDefinition['iconName'], unlocked: boolean) {
  const cls = `w-5 h-5 ${unlocked ? 'text-slate-950' : 'text-slate-500'}`;
  switch (iconName) {
    case 'compass':
      return <Compass className={cls} />;
    case 'award':
      return <Award className={cls} />;
    case 'gem':
      return <Gem className={cls} />;
    case 'clock':
      return <Clock className={cls} />;
    case 'search':
      return <Search className={cls} />;
    case 'coins':
      return <Coins className={cls} />;
    case 'star':
      return <Star className={cls} />;
    default:
      return <Trophy className={cls} />;
  }
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  profile,
  allProfiles,
  onClose,
  onOpenAvatarStudio,
  onOpenStudentSwitcher,
}) => {
  const [previewEmote, setPreviewEmote] = useState<AvatarAnimState>('idle');
  const [csvFeedback, setCsvFeedback] = useState<string | null>(null);

  const totalStars = countTotalStars(profile);
  const completedMissions = countCompletedMissions(profile);
  const crystalCount = profile.knowledgeCrystals?.length || 0;
  const progressPct = calculateProgressPercent(profile);
  const unlockedSet = new Set(profile.achievements || []);

  const handleDownloadCsv = () => {
    const res = exportProfilesToCsv(allProfiles.length > 0 ? allProfiles : [profile]);
    if (res.ok) {
      soundEngine.playCoin();
      setCsvFeedback('Rekod kemajuan CSV berjaya dimuat turun.');
    } else {
      setCsvFeedback(res.error || 'Gagal mengeksport CSV.');
    }
    window.setTimeout(() => setCsvFeedback(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-2.5 sm:p-5">
      <div className="w-full max-w-5xl max-h-[94vh] bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base sm:text-xl text-white">
                Profil Pelajar & Pencapaian
              </h2>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span className="font-semibold text-amber-300">
                  {profile.playerName}
                </span>
                <span aria-hidden="true">·</span>
                <span>Kelas {profile.playerClass || '-'}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-num">{progressPct}% Selesai</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Muat Turun CSV</span>
            </button>
            <button
              type="button"
              onClick={onOpenStudentSwitcher}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/15 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-4 h-4 text-sky-400" />
              <span>Tukar Pelajar</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup profil pelajar"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scroll p-4 sm:p-6 space-y-6">
          {csvFeedback && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-400/40 text-emerald-200 text-xs font-semibold">
              {csvFeedback}
            </div>
          )}

          {/* Top Grid: 3D Avatar + Core Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left: Animated 3D Customised Avatar */}
            <div className="lg:col-span-4 space-y-3">
              <AvatarPreview3D
                avatarConfig={profile.avatarConfig}
                animState={previewEmote}
                className="w-full h-60 sm:h-64"
              />
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: 'idle', label: 'Diam' },
                    { id: 'wave', label: 'Lambai' },
                    { id: 'dance', label: 'Tarian' },
                  ] as const
                ).map((em) => (
                  <button
                    key={em.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setPreviewEmote(em.id);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                      previewEmote === em.id
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-800 text-slate-200 border-white/10 hover:bg-slate-700'
                    }`}
                  >
                    {em.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={onOpenAvatarStudio}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/15 text-amber-300 font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shirt className="w-4 h-4" />
                <span>Ubah Rupa di Studio Avatar 3D</span>
              </button>
            </div>

            {/* Right: Identity, Overall Progress & 5 Stat Cards */}
            <div className="lg:col-span-8 space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/60 border border-white/10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-slate-400">Kad Pengenalan Penjelajah</div>
                    <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white mt-0.5">
                      {profile.playerName}
                    </h3>
                    <div className="text-sm text-amber-300 font-semibold mt-0.5">
                      Kelas: {profile.playerClass || 'Belum ditetapkan'}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Kemajuan Keseluruhan</div>
                    <div className="font-display font-extrabold text-2xl sm:text-3xl text-emerald-400 font-mono-num">
                      {progressPct}%
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 rounded-full bg-slate-900 border border-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Stat Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>Syiling</span>
                    </div>
                    <div className="font-display font-bold text-lg text-amber-300 font-mono-num mt-1">
                      {profile.coins}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span>Bintang</span>
                    </div>
                    <div className="font-display font-bold text-lg text-yellow-200 font-mono-num mt-1">
                      {totalStars}/24
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Gem className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Kristal Ilmu</span>
                    </div>
                    <div className="font-display font-bold text-lg text-cyan-300 font-mono-num mt-1">
                      {crystalCount}/8
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Misi Selesai</span>
                    </div>
                    <div className="font-display font-bold text-lg text-emerald-300 font-mono-num mt-1">
                      {completedMissions}/8
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 col-span-2 sm:col-span-1">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      <span>Mata Ilmu</span>
                    </div>
                    <div className="font-display font-bold text-lg text-sky-300 font-mono-num mt-1">
                      {profile.points || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* 8 Mission Progress Strip */}
              <div className="p-4 rounded-2xl bg-slate-800/45 border border-white/10">
                <div className="font-display font-bold text-sm text-white mb-2.5">
                  Status 8 Portal Misi Bab 1
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MISSION_TOPICS.map((t) => {
                    const m = profile.missions[t.id];
                    const done = Boolean(m?.completed);
                    return (
                      <div
                        key={t.id}
                        className={`p-2.5 rounded-xl border text-xs ${
                          done
                            ? 'bg-emerald-950/35 border-emerald-400/40'
                            : 'bg-slate-900/70 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className="font-bold truncate"
                            style={{ color: t.colorHex }}
                          >
                            Misi {t.id}
                          </span>
                          <span className="text-yellow-300 font-mono-num text-[11px]">
                            {'★'.repeat(m?.stars || 0) || '—'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-200 truncate mt-0.5">
                          {t.title}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Achievements Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>Lencana Pencapaian Pelajar</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Selesaikan misi portal dan kumpulkan khazanah kampung untuk membuka kesemua 8 lencana.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-300 font-mono-num">
                {unlockedSet.size} / {ACHIEVEMENTS.length} Dibuka
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ACHIEVEMENTS.map((badge, idx) => {
                const unlocked = unlockedSet.has(badge.id);
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    style={{
                      borderColor: unlocked
                        ? badge.colorHex
                        : 'rgba(255,255,255,0.1)',
                    }}
                    className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between gap-2.5 ${
                      unlocked ? 'bg-slate-800/90' : 'bg-slate-900/70 opacity-75'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/20"
                        style={{
                          backgroundColor: unlocked
                            ? badge.colorHex
                            : '#1e293b',
                        }}
                      >
                        {renderBadgeIcon(badge.iconName, unlocked)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-display font-bold text-xs sm:text-sm text-white leading-tight">
                          {badge.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {badge.subtitle}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {badge.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10">
                      <span
                        className={`font-semibold ${
                          unlocked ? 'text-emerald-300' : 'text-slate-400'
                        }`}
                      >
                        {unlocked ? 'Lencana Dibuka' : 'Belum Dibuka'}
                      </span>
                      <span className="font-mono-num text-slate-300 flex items-center gap-1">
                        {!unlocked && <Lock className="w-3 h-3 text-slate-500" />}
                        <span>{badge.getProgressLabel(profile)}</span>
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Local Storage Scope Reminder */}
          <div className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-white/10">
            Simpanan automatik tempatan: Kemajuan pelajar ini disimpan dalam pelayar dan peranti semasa sahaja (`localStorage`). Gunakan butang <strong>Muat Turun CSV</strong> untuk menyimpan rekod atau berkongsi kemajuan dengan guru.
          </div>
        </div>
      </div>
    </div>
  );
};
