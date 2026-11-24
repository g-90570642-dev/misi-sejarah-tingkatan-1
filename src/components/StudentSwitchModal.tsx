import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  Coins,
  Compass,
  Download,
  Gem,
  GraduationCap,
  Play,
  Plus,
  Star,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  AVATAR_COLORS,
  CLASS_SUGGESTIONS,
  DEFAULT_AVATAR_CONFIG,
  calculateProgressPercent,
  countCompletedMissions,
  countTotalStars,
} from '../data/sejarahBab1';
import { AvatarConfig, StudentProfile } from '../types/game';
import { soundEngine } from '../utils/audio';
import { exportProfilesToCsv } from '../utils/studentStorage';
import { AvatarPreview3D } from './AvatarPreview3D';
import { StudentAvatarBadge } from './StudentAvatarBadge';

interface StudentSwitchModalProps {
  profiles: StudentProfile[];
  activeProfileId: string | null;
  isInitialWelcome: boolean;
  needsClassCompletion: boolean;
  storageWarning: string | null;
  onRegisterStudent: (
    name: string,
    playerClass: string,
    avatarConfig: AvatarConfig,
  ) => void;
  onUpdateMigratedIdentity: (name: string, playerClass: string) => void;
  onSelectStudent: (profileId: string) => void;
  onDeleteStudent: (profileId: string) => void;
  onOpenTeacherDashboard: () => void;
  onClose?: () => void;
}

export const StudentSwitchModal: React.FC<StudentSwitchModalProps> = ({
  profiles,
  activeProfileId,
  isInitialWelcome,
  needsClassCompletion,
  storageWarning,
  onRegisterStudent,
  onUpdateMigratedIdentity,
  onSelectStudent,
  onDeleteStudent,
  onOpenTeacherDashboard,
  onClose,
}) => {
  const activeProfile =
    profiles.find((p) => p.id === activeProfileId) || profiles[0] || null;

  const [tab, setTab] = useState<'register' | 'switch'>(
    profiles.length === 0 ? 'register' : 'switch',
  );
  const [nameInput, setNameInput] = useState(
    needsClassCompletion && activeProfile ? activeProfile.playerName : '',
  );
  const [classInput, setClassInput] = useState(
    needsClassCompletion && activeProfile ? activeProfile.playerClass : '1 ZETA',
  );
  const [starterAvatar, setStarterAvatar] = useState<AvatarConfig>(
    DEFAULT_AVATAR_CONFIG,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nameInput.trim();
    const cleanClass = classInput.trim().toUpperCase();
    if (cleanName.length < 2) {
      setFormError('Sila masukkan nama paparan pelajar (sekurang-kurangnya 2 aksara).');
      return;
    }
    if (cleanClass.length < 2) {
      setFormError('Sila masukkan atau pilih nama kelas anda (contoh: 1 ZETA).');
      return;
    }
    setFormError(null);
    soundEngine.playVictory();
    if (needsClassCompletion && activeProfile && tab === 'switch') {
      onUpdateMigratedIdentity(cleanName, cleanClass);
      return;
    }
    onRegisterStudent(cleanName, cleanClass, starterAvatar);
  };

  const handleExportCsv = () => {
    const res = exportProfilesToCsv(profiles);
    if (res.ok) {
      soundEngine.playCoin();
      setExportNotice('Fail CSV kemajuan pelajar berjaya dimuat turun.');
    } else {
      setExportNotice(res.error || 'Gagal mengeksport CSV.');
    }
    window.setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/92 flex items-center justify-center p-2.5 sm:p-5">
      <div className="w-full max-w-4xl max-h-[94vh] bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shrink-0 shadow-lg">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-300">
                Sejarah Tingkatan 1 · Bab 1: Terokai Ilmu Sejarah
              </div>
              <h1 className="font-display font-extrabold text-lg sm:text-xl text-white">
                MISI SEJARAH: THE LOST CIVILIZATION
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onOpenTeacherDashboard();
              }}
              className="px-3 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-sky-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Papan Pemuka Guru</span>
            </button>
            {profiles.length > 0 && (
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Eksport CSV</span>
              </button>
            )}
            {onClose && activeProfile && !needsClassCompletion && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup skrin pelajar"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scroll p-4 sm:p-6 space-y-5">
          {/* Storage Warning / Export Feedback */}
          {storageWarning && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-400/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{storageWarning}</span>
            </div>
          )}
          {exportNotice && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-400/40 text-emerald-200 text-xs font-semibold">
              {exportNotice}
            </div>
          )}

          {/* Mode Tabs when existing profiles are present */}
          {profiles.length > 0 && (
            <div className="grid grid-cols-2 gap-2 bg-slate-800/70 p-1.5 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setTab('switch');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  tab === 'switch'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Pilih Pelajar Berdaftar ({profiles.length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setNameInput('');
                  setClassInput('1 ZETA');
                  setFormError(null);
                  setTab('register');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  tab === 'register'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Daftar Pelajar Baharu</span>
              </button>
            </div>
          )}

          {/* TAB 1: STUDENT REGISTRATION / WELCOME SCREEN */}
          {tab === 'register' && (
            <form
              onSubmit={handleSubmitRegistration}
              className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start"
            >
              {/* Left: Live 3D Avatar Starter Preview */}
              <div className="md:col-span-5 space-y-3">
                <AvatarPreview3D
                  avatarConfig={starterAvatar}
                  animState="wave"
                  className="w-full h-56 sm:h-64"
                />
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: 'boy', label: 'Avatar Lelaki', hair: 'spiky' as const },
                      { id: 'girl', label: 'Avatar Perempuan', hair: 'ponytail' as const },
                    ] as const
                  ).map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setStarterAvatar((prev) => ({
                          ...prev,
                          gender: g.id,
                          hairStyle: g.hair,
                        }));
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                        starterAvatar.gender === g.id
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                          : 'bg-slate-800 border-white/10 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      title={c.name}
                      onClick={() => {
                        soundEngine.playClick();
                        setStarterAvatar((prev) => ({
                          ...prev,
                          shirtColor: c.hex,
                        }));
                      }}
                      className={`w-7 h-7 rounded-lg border-2 cursor-pointer transition-transform hover:scale-110 ${
                        starterAvatar.shirtColor === c.hex
                          ? 'border-white scale-110'
                          : 'border-white/20'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Right: Registration Form (Name + Class ONLY) */}
              <div className="md:col-span-7 space-y-4 bg-slate-800/45 border border-white/10 rounded-2xl p-5">
                <div>
                  <h2 className="font-display font-bold text-xl text-white">
                    {isInitialWelcome
                      ? 'Selamat Datang, Penjelajah Sejarah!'
                      : 'Pendaftaran Pelajar Baharu'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    Masukkan nama paparan dan kelas anda untuk memulakan pengembaraan 3D Bab 1. Anda boleh mengubah rupa penuh avatar anda dalam Studio Avatar bila-bila masa.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="student-display-name"
                    className="block text-xs font-bold text-slate-200 mb-1.5"
                  >
                    1. Nama Paparan Pelajar
                  </label>
                  <input
                    id="student-display-name"
                    type="text"
                    maxLength={24}
                    value={nameInput}
                    onChange={(e) => {
                      setNameInput(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="Contoh: Aiman Hakim / Nurul Izzah"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="student-class"
                    className="block text-xs font-bold text-slate-200 mb-1.5"
                  >
                    2. Kelas Tingkatan 1
                  </label>
                  <input
                    id="student-class"
                    type="text"
                    maxLength={16}
                    value={classInput}
                    onChange={(e) => {
                      setClassInput(e.target.value.toUpperCase());
                      if (formError) setFormError(null);
                    }}
                    placeholder="Contoh: 1 ZETA, 1 SIGMA, 1 THETA"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-sm text-white uppercase placeholder:text-slate-500 focus:outline-none focus:border-amber-400 mb-2"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {CLASS_SUGGESTIONS.map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => {
                          soundEngine.playClick();
                          setClassInput(cls);
                          if (formError) setFormError(null);
                        }}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                          classInput.trim().toUpperCase() === cls
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/30'
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>

                {formError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-400/40 text-xs text-rose-200">
                    {formError}
                  </div>
                )}

                <div className="pt-1">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-extrabold text-sm sm:text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Play className="w-5 h-5 fill-slate-950" />
                    <span>MULA PENGEMBARAAN</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Privasi terjaga: Tiada nombor kad pengenalan, alamat, nombor telefon atau kata laluan diperlukan.
                </p>
              </div>
            </form>
          )}

          {/* TAB 2: RETURNING / SWITCH STUDENT SELECTION */}
          {tab === 'switch' && profiles.length > 0 && (
            <div className="space-y-4">
              {/* If legacy progress was migrated without class, let student complete their name & class without losing progress */}
              {needsClassCompletion && activeProfile && (
                <form
                  onSubmit={handleSubmitRegistration}
                  className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/40 space-y-3"
                >
                  <div className="font-display font-bold text-sm text-amber-300">
                    Kemajuan Sedia Ada Dikesan! Lengkapkan Nama & Kelas Anda
                  </div>
                  <p className="text-xs text-slate-200">
                    Semua syiling, bintang, kristal dan misi anda selamat dikekalkan. Masukkan nama dan kelas anda untuk menyambung pengembaraan.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      type="text"
                      maxLength={24}
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Nama Pelajar"
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-sm text-white"
                    />
                    <input
                      type="text"
                      maxLength={16}
                      value={classInput}
                      onChange={(e) => setClassInput(e.target.value.toUpperCase())}
                      placeholder="Kelas (cth: 1 ZETA)"
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-sm text-white uppercase"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-xs sm:text-sm cursor-pointer"
                    >
                      Simpan & Teruskan
                    </button>
                  </div>
                  {formError && (
                    <div className="text-xs text-rose-300">{formError}</div>
                  )}
                </form>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display font-bold text-base sm:text-lg text-white">
                    {isInitialWelcome
                      ? 'Selamat Kembali! Pilih Profil Pelajar'
                      : 'Tukar Pemain / Pilih Profil Pelajar'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Setiap pelajar mempunyai rekod syiling, bintang, avatar 3D, kristal dan lencana berasingan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setNameInput('');
                    setClassInput('1 ZETA');
                    setFormError(null);
                    setTab('register');
                  }}
                  className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Pelajar Baharu</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profiles.map((prof) => {
                  const isCurrent = prof.id === activeProfileId;
                  const stars = countTotalStars(prof);
                  const completed = countCompletedMissions(prof);
                  const pct = calculateProgressPercent(prof);
                  const crystals = prof.knowledgeCrystals?.length || 0;
                  const badgeCount = prof.achievements?.length || 0;
                  const confirmingDelete = confirmDeleteId === prof.id;

                  return (
                    <div
                      key={prof.id}
                      className={`p-4 rounded-2xl border-2 transition-colors flex flex-col justify-between gap-3 ${
                        isCurrent
                          ? 'bg-slate-800 border-amber-400'
                          : 'bg-slate-800/55 border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <StudentAvatarBadge
                            config={prof.avatarConfig}
                            fallbackColor={prof.avatarColor}
                            size="md"
                          />
                          <div className="min-w-0">
                            <div className="font-display font-bold text-sm sm:text-base text-white truncate">
                              {prof.playerName}
                            </div>
                            <div className="text-xs text-slate-300 flex items-center gap-1.5">
                              <span className="font-semibold text-amber-300">
                                {prof.playerClass || 'Tiada Kelas'}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="text-slate-400 font-mono-num">
                                {pct}% Kemajuan
                              </span>
                            </div>
                          </div>
                        </div>

                        {isCurrent && (
                          <span className="text-[11px] font-bold text-emerald-300 shrink-0">
                            Aktif
                          </span>
                        )}
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-4 gap-2 text-center bg-slate-900/75 rounded-xl p-2 border border-white/5">
                        <div>
                          <div className="text-[10px] text-slate-400">Syiling</div>
                          <div className="text-xs font-bold text-amber-300 font-mono-num flex items-center justify-center gap-1">
                            <Coins className="w-3 h-3" />
                            <span>{prof.coins}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Bintang</div>
                          <div className="text-xs font-bold text-yellow-300 font-mono-num flex items-center justify-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{stars}/24</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Kristal</div>
                          <div className="text-xs font-bold text-cyan-300 font-mono-num flex items-center justify-center gap-1">
                            <Gem className="w-3 h-3" />
                            <span>{crystals}/8</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Lencana</div>
                          <div className="text-xs font-bold text-emerald-300 font-mono-num flex items-center justify-center gap-1">
                            <Award className="w-3 h-3" />
                            <span>{badgeCount}/8</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Misi Selesai: {completed}/8</span>
                          <span>
                            {new Date(prof.lastPlayedAt).toLocaleDateString('ms-MY')}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-amber-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Actions or Delete Confirmation */}
                      {confirmingDelete ? (
                        <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-400/40 space-y-2">
                          <div className="text-xs text-rose-100 font-medium">
                            Padam profil <strong>{prof.playerName}</strong> ({prof.playerClass || '-'})? Tindakan ini tidak boleh dipulihkan.
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 cursor-pointer"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                soundEngine.playWrong();
                                setConfirmDeleteId(null);
                                onDeleteStudent(prof.id);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white cursor-pointer"
                            >
                              Ya, Padam
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              soundEngine.playPortal();
                              onSelectStudent(prof.id);
                            }}
                            className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Play className="w-4 h-4 fill-slate-950" />
                            <span>
                              {isCurrent ? 'Teruskan Pengembaraan' : 'Pilih & Main'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(prof.id)}
                            title={`Padam profil ${prof.playerName}`}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 border border-white/10 hover:border-rose-400/40 text-slate-400 hover:text-rose-300 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Honest Browser localStorage Limitation Notice */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-white/10 text-xs text-slate-300 leading-relaxed">
            <strong className="text-sky-300">Nota Simpanan Tempatan (localStorage):</strong>{' '}
            Semua profil pelajar, avatar, syiling, bintang, kristal dan lencana disimpan secara automatik dalam <strong>pelayar dan peranti ini sahaja</strong>. Kemajuan tidak disegerakkan secara automatik ke peranti lain. Guru boleh menekan <strong>Eksport CSV Guru</strong> untuk menyimpan salinan rekod kelas.
          </div>
        </div>
      </div>
    </div>
  );
};
