import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowDownUp,
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Coins,
  Download,
  Gem,
  GraduationCap,
  KeyRound,
  Lock,
  Printer,
  ShieldAlert,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
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
import { PortalId, StudentProfile } from '../types/game';
import { soundEngine } from '../utils/audio';
import { exportProfilesToCsv } from '../utils/studentStorage';
import {
  DEFAULT_TEACHER_PIN,
  loadTeacherPin,
  saveTeacherPin,
} from '../utils/teacherStorage';
import { StudentAvatarBadge } from './StudentAvatarBadge';

interface TeacherDashboardModalProps {
  profiles: StudentProfile[];
  onClose: () => void;
}

type ClassFilter = 'ALL' | '1 ZETA' | '1 SIGMA' | '1 THETA' | string;
type SortMode = 'highest-score' | 'most-missions' | 'lowest-progress';

const CORE_CLASSES = ['1 ZETA', '1 SIGMA', '1 THETA'];

export const TeacherDashboardModal: React.FC<TeacherDashboardModalProps> = ({
  profiles,
  onClose,
}) => {
  // Teacher PIN Access State
  const [teacherPin, setTeacherPin] = useState<string>(() => loadTeacherPin());
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Configurable PIN Form State
  const [showPinConfig, setShowPinConfig] = useState(false);
  const [newPinDraft, setNewPinDraft] = useState('');
  const [pinConfigMsg, setPinConfigMsg] = useState<string | null>(null);

  // Dashboard Filters & Sorting
  const [selectedClass, setSelectedClass] = useState<ClassFilter>('ALL');
  const [sortMode, setSortMode] = useState<SortMode>('highest-score');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setFeedbackMsg(msg);
    window.setTimeout(() => setFeedbackMsg(null), 3800);
  };

  // Discover all classes (guaranteeing 1 ZETA, 1 SIGMA, 1 THETA + any custom registered classes)
  const classTabs = useMemo(() => {
    const extras = new Set<string>();
    profiles.forEach((p) => {
      const c = (p.playerClass || '').trim().toUpperCase();
      if (c && !CORE_CLASSES.includes(c)) {
        extras.add(c);
      }
    });
    return ['ALL', ...CORE_CLASSES, ...Array.from(extras).sort()];
  }, [profiles]);

  const filteredStudents = useMemo(() => {
    if (selectedClass === 'ALL') return profiles;
    return profiles.filter(
      (p) => (p.playerClass || '').trim().toUpperCase() === selectedClass,
    );
  }, [profiles, selectedClass]);

  const sortedStudents = useMemo(() => {
    const list = [...filteredStudents];
    list.sort((a, b) => {
      const aMissions = countCompletedMissions(a);
      const bMissions = countCompletedMissions(b);
      const aStars = countTotalStars(a);
      const bStars = countTotalStars(b);
      const aPts = a.points || 0;
      const bPts = b.points || 0;

      if (sortMode === 'highest-score') {
        if (bPts !== aPts) return bPts - aPts;
        if (bStars !== aStars) return bStars - aStars;
        return bMissions - aMissions;
      }
      if (sortMode === 'most-missions') {
        if (bMissions !== aMissions) return bMissions - aMissions;
        if (bStars !== aStars) return bStars - aStars;
        return bPts - aPts;
      }
      // lowest-progress
      if (aMissions !== bMissions) return aMissions - bMissions;
      if (aStars !== bStars) return aStars - bStars;
      return aPts - bPts;
    });
    return list;
  }, [filteredStudents, sortMode]);

  // Class Overview & Learning Analytics calculated strictly from actual localStorage data
  const analytics = useMemo(() => {
    const totalStudents = filteredStudents.length;
    if (totalStudents === 0) {
      return {
        totalStudents: 0,
        completedAllCount: 0,
        avgMissions: 0,
        avgCompletionPct: 0,
        avgScore: 0,
        avgStars: 0,
        totalCrystals: 0,
        missionStats: MISSION_TOPICS.map((t) => ({
          id: t.id,
          title: t.title,
          colorHex: t.colorHex,
          completedCount: 0,
          completionRate: 0,
          avgStars: 0,
        })),
        mostSuccessful: null as null | { id: PortalId; title: string; completionRate: number; avgStars: number },
        mostDifficult: null as null | { id: PortalId; title: string; completionRate: number; avgStars: number },
        needsRevision: [] as StudentProfile[],
      };
    }

    let completedAllCount = 0;
    let sumMissions = 0;
    let sumPoints = 0;
    let sumStars = 0;
    let totalCrystals = 0;

    const needsRevision: StudentProfile[] = [];

    filteredStudents.forEach((s) => {
      const mDone = countCompletedMissions(s);
      const stars = countTotalStars(s);
      const crystals = s.knowledgeCrystals?.length || 0;
      if (mDone >= 8) completedAllCount += 1;
      sumMissions += mDone;
      sumPoints += s.points || 0;
      sumStars += stars;
      totalCrystals += crystals;

      if (mDone < 4 || stars < 6) {
        needsRevision.push(s);
      }
    });

    const missionStats = MISSION_TOPICS.map((topic) => {
      let doneCount = 0;
      let starSum = 0;
      filteredStudents.forEach((s) => {
        const m = s.missions[topic.id];
        if (m?.completed) doneCount += 1;
        starSum += m?.stars || 0;
      });
      return {
        id: topic.id,
        title: topic.title,
        colorHex: topic.colorHex,
        completedCount: doneCount,
        completionRate: Math.round((doneCount / totalStudents) * 100),
        avgStars: Number((starSum / totalStudents).toFixed(1)),
      };
    });

    const sortedBySuccess = [...missionStats].sort((a, b) => {
      if (b.completionRate !== a.completionRate) {
        return b.completionRate - a.completionRate;
      }
      return b.avgStars - a.avgStars;
    });

    const sortedByDifficulty = [...missionStats].sort((a, b) => {
      if (a.completionRate !== b.completionRate) {
        return a.completionRate - b.completionRate;
      }
      return a.avgStars - b.avgStars;
    });

    needsRevision.sort(
      (a, b) => countCompletedMissions(a) - countCompletedMissions(b),
    );

    return {
      totalStudents,
      completedAllCount,
      avgMissions: Number((sumMissions / totalStudents).toFixed(1)),
      avgCompletionPct: Math.round(((sumMissions / totalStudents) / 8) * 100),
      avgScore: Math.round(sumPoints / totalStudents),
      avgStars: Number((sumStars / totalStudents).toFixed(1)),
      totalCrystals,
      missionStats,
      mostSuccessful: sortedBySuccess[0] || null,
      mostDifficult: sortedByDifficulty[0] || null,
      needsRevision,
    };
  }, [filteredStudents]);

  const selectedStudent = useMemo(
    () => profiles.find((p) => p.id === selectedStudentId) || null,
    [profiles, selectedStudentId],
  );

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === teacherPin) {
      soundEngine.playVictory();
      setIsUnlocked(true);
      setPinError(null);
      setPinInput('');
    } else {
      soundEngine.playWrong();
      setPinError('PIN Guru tidak sepadan. Sila semak dan cuba semula.');
    }
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    const res = saveTeacherPin(newPinDraft);
    if (res.ok) {
      soundEngine.playCoin();
      setTeacherPin(newPinDraft.trim());
      setNewPinDraft('');
      setPinConfigMsg('PIN Guru baharu berjaya disimpan dalam pelayar ini.');
      window.setTimeout(() => {
        setPinConfigMsg(null);
        setShowPinConfig(false);
      }, 1800);
    } else {
      setPinConfigMsg(res.error || 'PIN tidak sah.');
    }
  };

  const handleExportAll = () => {
    const res = exportProfilesToCsv(profiles, 'semua-pelajar');
    if (res.ok) {
      soundEngine.playCoin();
      showNotice('Semua rekod pelajar berjaya dieksport ke CSV.');
    } else {
      showNotice(res.error || 'Tiada rekod pelajar untuk dieksport.');
    }
  };

  const handleExportClass = () => {
    const label = selectedClass === 'ALL' ? 'semua-kelas' : selectedClass;
    const res = exportProfilesToCsv(filteredStudents, `kelas-${label}`);
    if (res.ok) {
      soundEngine.playCoin();
      showNotice(
        `Rekod ${selectedClass === 'ALL' ? 'Semua Kelas' : selectedClass} berjaya dieksport ke CSV.`,
      );
    } else {
      showNotice(res.error || 'Tiada rekod dalam kelas terpilih untuk dieksport.');
    }
  };

  // =========================================================================
  // TEACHER ACCESS PIN GATE SCREEN
  // =========================================================================
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-[60] bg-slate-950/94 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-sky-300">
                  Kawalan Akses Guru
                </div>
                <h2 className="font-display font-bold text-lg text-white">
                  Papan Pemuka Guru
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Kembali ke skrin pelajar"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleVerifyPin} className="p-6 space-y-4">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Masukkan PIN Akses Guru untuk melihat analitik kelas, jadual prestasi pelajar, laporan individu dan eksport CSV.
            </p>

            <div>
              <label
                htmlFor="teacher-pin-input"
                className="block text-xs font-bold text-slate-200 mb-1.5"
              >
                PIN Akses Guru
              </label>
              <input
                id="teacher-pin-input"
                type="password"
                inputMode="numeric"
                maxLength={8}
                autoFocus
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  if (pinError) setPinError(null);
                }}
                placeholder="Masukkan PIN 4–8 digit"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-center text-lg tracking-widest font-mono-num text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            {pinError && (
              <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-400/40 text-xs text-rose-200">
                {pinError}
              </div>
            )}

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 text-[11px] text-amber-200 leading-relaxed space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Makluman Prototaip & Keselamatan Pelayar</span>
              </div>
              <p className="text-slate-300">
                PIN ini disimpan dalam simpanan tempatan pelayar (`localStorage`) dan bukan pengesahan pelayan yang selamat sepenuhnya. PIN lalai awal prototaip ialah <strong className="text-amber-300 font-mono-num">{DEFAULT_TEACHER_PIN}</strong> (boleh ditukar di dalam papan pemuka).
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Buka Papan Pemuka Guru</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // INDIVIDUAL STUDENT REPORT VIEW (PRINTABLE)
  // =========================================================================
  if (selectedStudent) {
    const pct = calculateProgressPercent(selectedStudent);
    const stars = countTotalStars(selectedStudent);
    const completed = countCompletedMissions(selectedStudent);
    const crystals = selectedStudent.knowledgeCrystals?.length || 0;
    const unlockedBadges = new Set(selectedStudent.achievements || []);

    return (
      <div className="fixed inset-0 z-[60] bg-slate-950/94 flex items-center justify-center p-2.5 sm:p-5">
        <div
          id="teacher-printable-report"
          className="w-full max-w-4xl max-h-[94vh] bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Report Header */}
          <div className="px-5 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedStudentId(null)}
                className="no-print p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                title="Kembali ke senarai pelajar"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="text-xs font-semibold text-amber-300">
                  Laporan Kemajuan Pelajar Individu · Sejarah Tingkatan 1 Bab 1
                </div>
                <h2 className="font-display font-bold text-lg sm:text-xl text-white">
                  {selectedStudent.playerName} — Kelas {selectedStudent.playerClass || '-'}
                </h2>
              </div>
            </div>

            <div className="no-print flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Laporan Pelajar</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedStudentId(null)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Kembali
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scroll p-5 space-y-5">
            {/* Student Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <StudentAvatarBadge
                  config={selectedStudent.avatarConfig}
                  fallbackColor={selectedStudent.avatarColor}
                  size="lg"
                />
                <div>
                  <div className="font-display font-extrabold text-lg text-white">
                    {selectedStudent.playerName}
                  </div>
                  <div className="text-xs text-slate-300">
                    Kelas: <strong>{selectedStudent.playerClass || '-'}</strong> · Terakhir aktif:{' '}
                    {new Date(selectedStudent.lastPlayedAt).toLocaleString('ms-MY')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 text-center">
                <div>
                  <div className="text-[11px] text-slate-400">Kemajuan</div>
                  <div className="font-display font-bold text-base text-emerald-400 font-mono-num">
                    {pct}%
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Misi</div>
                  <div className="font-display font-bold text-base text-white font-mono-num">
                    {completed}/8
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Bintang</div>
                  <div className="font-display font-bold text-base text-yellow-300 font-mono-num">
                    {stars}/24
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Kristal</div>
                  <div className="font-display font-bold text-base text-cyan-300 font-mono-num">
                    {crystals}/8
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Mata Ilmu</div>
                  <div className="font-display font-bold text-base text-sky-300 font-mono-num">
                    {selectedStudent.points || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Per-Mission Breakdown Table */}
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-slate-800/40">
              <div className="px-4 py-3 border-b border-white/10 font-display font-bold text-sm text-white">
                Pecahan Prestasi Mengikut 8 Misi Portal
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-900/80 text-slate-300 text-xs">
                    <tr>
                      <th className="py-2.5 px-4">Portal & Topik Bab 1</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Bintang</th>
                      <th className="py-2.5 px-4">Skor Kuiz Terbaik</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {MISSION_TOPICS.map((topic) => {
                      const mp = selectedStudent.missions[topic.id];
                      const done = Boolean(mp?.completed);
                      return (
                        <tr key={topic.id}>
                          <td className="py-2.5 px-4 font-semibold text-white">
                            Misi {topic.id}: {topic.title}
                          </td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`font-semibold ${
                                done ? 'text-emerald-300' : 'text-slate-400'
                              }`}
                            >
                              {done ? 'Selesai' : 'Belum Selesai'}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-mono-num text-yellow-300">
                            {mp?.stars || 0} / 3
                          </td>
                          <td className="py-2.5 px-4 font-mono-num text-slate-200">
                            {mp?.bestScore || 0} / {topic.questions.length}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Achievements Earned */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 space-y-2.5">
              <div className="font-display font-bold text-sm text-white">
                Lencana Pencapaian Dibuka ({unlockedBadges.size} / {ACHIEVEMENTS.length})
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ACHIEVEMENTS.map((b) => {
                  const has = unlockedBadges.has(b.id);
                  return (
                    <div
                      key={b.id}
                      className={`p-2.5 rounded-xl border text-xs ${
                        has
                          ? 'bg-emerald-950/35 border-emerald-400/40 text-white'
                          : 'bg-slate-900/60 border-white/10 text-slate-500'
                      }`}
                    >
                      <div className="font-bold">{b.title}</div>
                      <div className="text-[11px] mt-0.5">
                        {has ? 'Dibuka' : 'Belum Dibuka'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN TEACHER DASHBOARD
  // =========================================================================
  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/94 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-6xl max-h-[95vh] bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-sky-500 flex items-center justify-center text-slate-950 shrink-0 shadow-lg">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-sky-300">
                MISI SEJARAH: THE LOST CIVILIZATION · Sejarah Tingkatan 1 Bab 1
              </div>
              <h2 className="font-display font-extrabold text-lg sm:text-xl text-white">
                Papan Pemuka Guru & Analitik Pembelajaran
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setPinConfigMsg(null);
                setShowPinConfig((v) => !v);
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/15 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Tukar PIN</span>
            </button>
            <button
              type="button"
              onClick={handleExportClass}
              className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Eksport Kelas (CSV)</span>
            </button>
            <button
              type="button"
              onClick={handleExportAll}
              className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Eksport Semua (CSV)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup papan pemuka guru"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scroll p-4 sm:p-6 space-y-6">
          {/* PIN Configuration Drawer */}
          {showPinConfig && (
            <form
              onSubmit={handleSaveNewPin}
              className="p-4 rounded-2xl bg-slate-800/80 border border-amber-400/35 flex flex-wrap items-end justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="font-display font-bold text-sm text-amber-300">
                  Konfigurasi PIN Akses Guru
                </div>
                <p className="text-xs text-slate-300">
                  Masukkan PIN baharu (4–8 digit nombor). Disimpan di pelayar ini sahaja (`localStorage`).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={8}
                  value={newPinDraft}
                  onChange={(e) => setNewPinDraft(e.target.value)}
                  placeholder="PIN baharu (4-8 digit)"
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-xs text-white font-mono-num"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-xs cursor-pointer"
                >
                  Simpan PIN
                </button>
              </div>
              {pinConfigMsg && (
                <div className="w-full text-xs text-emerald-300 font-medium">
                  {pinConfigMsg}
                </div>
              )}
            </form>
          )}

          {feedbackMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-400/40 text-emerald-200 text-xs font-semibold">
              {feedbackMsg}
            </div>
          )}

          {/* CLASS MANAGEMENT FILTER BAR */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap bg-slate-800/70 p-1.5 rounded-2xl border border-white/10">
              {classTabs.map((cls) => {
                const count =
                  cls === 'ALL'
                    ? profiles.length
                    : profiles.filter(
                        (p) => (p.playerClass || '').trim().toUpperCase() === cls,
                      ).length;
                const active = selectedClass === cls;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedClass(cls);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-sky-500 text-slate-950'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {cls === 'ALL' ? 'Semua Kelas' : cls}{' '}
                    <span className="font-mono-num opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-slate-400">
              Sumber data: Simpanan Tempatan (`localStorage`) ·{' '}
              <span className="text-slate-200 font-semibold">
                {selectedClass === 'ALL' ? 'Semua Kelas' : `Kelas ${selectedClass}`}
              </span>
            </div>
          </div>

          {/* FEATURE 3: CLASS OVERVIEW (5 METRIC CARDS) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              {
                label: 'Pelajar Berdaftar',
                value: `${analytics.totalStudents}`,
                sub: 'Profil aktif dalam tapisan',
                icon: <Users className="w-4 h-4 text-sky-400" />,
                accent: 'text-sky-300',
              },
              {
                label: 'Tamat Semua 8 Misi',
                value: `${analytics.completedAllCount}`,
                sub: `${
                  analytics.totalStudents > 0
                    ? Math.round(
                        (analytics.completedAllCount / analytics.totalStudents) *
                          100,
                      )
                    : 0
                }% pelajar tamat Bab 1`,
                icon: <Trophy className="w-4 h-4 text-emerald-400" />,
                accent: 'text-emerald-300',
              },
              {
                label: 'Purata Penyelesaian',
                value: `${analytics.avgCompletionPct}%`,
                sub: `${analytics.avgMissions} / 8 misi selesai`,
                icon: <CheckCircle2 className="w-4 h-4 text-amber-400" />,
                accent: 'text-amber-300',
              },
              {
                label: 'Purata Skor Pelajar',
                value: `${analytics.avgScore}`,
                sub: `Purata ${analytics.avgStars} / 24 bintang`,
                icon: <Sparkles className="w-4 h-4 text-violet-400" />,
                accent: 'text-violet-300',
              },
              {
                label: 'Kristal Ilmu Dikumpul',
                value: `${analytics.totalCrystals}`,
                sub: 'Jumlah kristal seluruh kelas',
                icon: <Gem className="w-4 h-4 text-cyan-400" />,
                accent: 'text-cyan-300',
              },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="p-4 rounded-2xl bg-slate-800/65 border border-white/10 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2 text-xs text-slate-300">
                  <span>{card.label}</span>
                  {card.icon}
                </div>
                <div
                  className={`font-display font-extrabold text-2xl sm:text-3xl font-mono-num ${card.accent}`}
                >
                  {card.value}
                </div>
                <div className="text-[11px] text-slate-400">{card.sub}</div>
              </motion.div>
            ))}
          </div>

          {/* EMPTY CLASS GRACEFUL STATE */}
          {analytics.totalStudents === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-800/40 border border-white/10 text-center space-y-2">
              <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
              <div className="font-display font-bold text-base text-white">
                Tiada Rekod Pelajar untuk{' '}
                {selectedClass === 'ALL' ? 'Mana-Mana Kelas' : `Kelas ${selectedClass}`}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Pelajar perlu mendaftar profil menggunakan nama dan kelas mereka pada skrin alu-aluan permainan di pelayar ini terlebih dahulu.
              </p>
            </div>
          ) : (
            <>
              {/* FEATURE 5: LEARNING ANALYTICS CHARTS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Chart 1: Class Mission Completion Rates (Misi 1–8) */}
                <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-slate-800/50 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="font-display font-bold text-sm sm:text-base text-white flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-sky-400" />
                        <span>Kadar Penyelesaian Mengikut 8 Misi</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Peratusan pelajar yang telah menyelesaikan setiap portal Bab 1.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {analytics.missionStats.map((ms) => (
                      <div key={ms.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-200 font-medium truncate max-w-[65%]">
                            Misi {ms.id}: {ms.title}
                          </span>
                          <span className="font-mono-num text-slate-300">
                            {ms.completedCount}/{analytics.totalStudents} ({ms.completionRate}%) · ★ {ms.avgStars}
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${ms.completionRate}%` }}
                            transition={{ duration: 0.45 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: ms.colorHex }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart 2 & Insights: Most Successful, Most Difficult & Needs Revision + Student Comparison */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                    {analytics.mostSuccessful && (
                      <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-400/35 space-y-1">
                        <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4" />
                          <span>Misi Paling Berjaya</span>
                        </div>
                        <div className="font-display font-bold text-sm text-white">
                          Misi {analytics.mostSuccessful.id}: {analytics.mostSuccessful.title}
                        </div>
                        <div className="text-xs text-slate-300 font-mono-num">
                          Kadar selesai: {analytics.mostSuccessful.completionRate}% · Purata {analytics.mostSuccessful.avgStars}/3 bintang
                        </div>
                      </div>
                    )}

                    {analytics.mostDifficult && (
                      <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-400/35 space-y-1">
                        <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                          <TrendingDown className="w-4 h-4" />
                          <span>Misi Paling Mencabar</span>
                        </div>
                        <div className="font-display font-bold text-sm text-white">
                          Misi {analytics.mostDifficult.id}: {analytics.mostDifficult.title}
                        </div>
                        <div className="text-xs text-slate-300 font-mono-num">
                          Kadar selesai: {analytics.mostDifficult.completionRate}% · Purata {analytics.mostDifficult.avgStars}/3 bintang
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Student Performance Comparison Mini-Chart */}
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/10 space-y-3">
                    <div className="font-display font-bold text-sm text-white">
                      Perbandingan Prestasi Pelajar
                    </div>
                    <div className="space-y-2 max-h-44 overflow-y-auto custom-scroll pr-1">
                      {sortedStudents.slice(0, 8).map((st) => {
                        const pct = calculateProgressPercent(st);
                        return (
                          <div key={st.id} className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-200 font-semibold truncate max-w-[55%]">
                                {st.playerName}
                              </span>
                              <span className="text-amber-300 font-mono-num">
                                {pct}% · {st.points || 0} mata
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400"
                                style={{ width: `${Math.max(pct, 4)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Students Needing Additional Revision */}
                  <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-400/35 space-y-2.5">
                    <div className="text-xs font-bold text-amber-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Perlu Ulang Kaji Tambahan (&lt;50%)</span>
                      </span>
                      <span className="font-mono-num">
                        {analytics.needsRevision.length} pelajar
                      </span>
                    </div>
                    {analytics.needsRevision.length === 0 ? (
                      <p className="text-xs text-emerald-300">
                        Tahniah! Semua pelajar dalam kelas ini telah mencapai sekurang-kurangnya 50% kemajuan.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scroll pr-1">
                        {analytics.needsRevision.map((st) => (
                          <div
                            key={st.id}
                            className="flex items-center justify-between gap-2 text-xs bg-slate-900/70 px-2.5 py-1.5 rounded-xl"
                          >
                            <span className="text-white truncate">
                              {st.playerName}{' '}
                              <span className="text-slate-400">
                                ({st.playerClass || '-'})
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedStudentId(st.id)}
                              className="text-amber-300 hover:text-amber-200 font-semibold shrink-0 cursor-pointer"
                            >
                              {calculateProgressPercent(st)}% · Laporan
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* FEATURE 4: STUDENT PERFORMANCE TABLE */}
              <div className="rounded-2xl border border-white/10 bg-slate-800/45 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="font-display font-bold text-sm sm:text-base text-white">
                    Jadual Prestasi Pelajar ({sortedStudents.length})
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
                      <ArrowDownUp className="w-3.5 h-3.5" />
                      <span>Susun:</span>
                    </span>
                    {(
                      [
                        { id: 'highest-score', label: 'Skor Tertinggi' },
                        { id: 'most-missions', label: 'Misi Terbanyak' },
                        { id: 'lowest-progress', label: 'Kemajuan Terendah' },
                      ] as const
                    ).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          soundEngine.playClick();
                          setSortMode(s.id);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                          sortMode === s.id
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-900 text-slate-300 border-white/10 hover:text-white'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-900/90 text-slate-300 text-xs">
                      <tr>
                        <th className="py-3 px-4">Pelajar</th>
                        <th className="py-3 px-3">Kelas</th>
                        <th className="py-3 px-3">Misi</th>
                        <th className="py-3 px-3">Bintang</th>
                        <th className="py-3 px-3">Kristal</th>
                        <th className="py-3 px-3">Syiling</th>
                        <th className="py-3 px-3">Mata</th>
                        <th className="py-3 px-4">Kemajuan</th>
                        <th className="py-3 px-4 text-right">Laporan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {sortedStudents.map((st) => {
                        const mDone = countCompletedMissions(st);
                        const stars = countTotalStars(st);
                        const crystals = st.knowledgeCrystals?.length || 0;
                        const pct = calculateProgressPercent(st);
                        return (
                          <tr
                            key={st.id}
                            className="hover:bg-slate-800/60 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5 min-w-[150px]">
                                <StudentAvatarBadge
                                  config={st.avatarConfig}
                                  fallbackColor={st.avatarColor}
                                  size="sm"
                                />
                                <div>
                                  <div className="font-display font-bold text-white">
                                    {st.playerName}
                                  </div>
                                  <div className="text-[11px] text-slate-400">
                                    {st.achievements?.length || 0} lencana
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-semibold text-amber-300 whitespace-nowrap">
                              {st.playerClass || '-'}
                            </td>
                            <td className="py-3 px-3 font-mono-num text-white whitespace-nowrap">
                              {mDone}/8
                            </td>
                            <td className="py-3 px-3 font-mono-num text-yellow-300 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                {stars}/24
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono-num text-cyan-300 whitespace-nowrap">
                              {crystals}/8
                            </td>
                            <td className="py-3 px-3 font-mono-num text-amber-300 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1">
                                <Coins className="w-3.5 h-3.5 text-amber-400" />
                                {st.coins}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono-num text-sky-300 whitespace-nowrap">
                              {st.points || 0}
                            </td>
                            <td className="py-3 px-4 min-w-[135px]">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 rounded-full bg-slate-900 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-emerald-400 to-amber-400"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="font-mono-num text-xs font-bold text-emerald-300 w-9 text-right">
                                  {pct}%
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => {
                                  soundEngine.playClick();
                                  setSelectedStudentId(st.id);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-sky-500 hover:text-slate-950 border border-white/15 text-xs font-semibold text-sky-300 transition-colors cursor-pointer"
                              >
                                Lihat & Cetak
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Security & Local Storage Transparency Note */}
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-white/10 text-xs text-slate-400 leading-relaxed flex items-start gap-2.5">
            <Award className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <span>
              Semua metrik di atas dikira terus daripada rekod pelajar sebenar yang tersimpan dalam <strong className="text-slate-200">localStorage pelayar dan peranti ini sahaja</strong>. PIN Guru tempatan berfungsi sebagai sekatan akses bilik darjah bagi prototaip ini dan bukan sistem pengesahan pelayan yang selamat sepenuhnya.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
