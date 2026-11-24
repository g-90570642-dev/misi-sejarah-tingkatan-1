import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Coins,
  Gem,
  Sparkles,
  Star,
  Trophy,
  X,
} from 'lucide-react';
import {
  M1_HIDDEN_WORDS,
  M1_MATCH_PAIRS,
  M2_HISTORIANS,
  M2_MATCH_PAIRS,
  M3_CHRONO_EVENTS,
  M3_MATCH_PAIRS,
  M4_BUCKETS,
  M4_CLASSIFY_ITEMS,
  M4_HIDDEN_OBJECTS,
  M5_BUCKETS,
  M5_CLASSIFY_ITEMS,
  M5_EXPEDITION_ZONES,
  M6_CAUSE_EFFECT_PAIRS,
  M6_DOMINO_CHAIN,
  M7_DETECTIVE_CASES,
  M7_HIDDEN_CLUES,
  M8_HIDDEN_TREASURES,
  M8_MATCH_PAIRS,
} from '../data/missionsContent';
import { MISSION_TOPICS } from '../data/sejarahBab1';
import { PortalId } from '../types/game';
import { HistorianId } from '../three/historicalCharacters';
import { soundEngine } from '../utils/audio';
import { MissionDiorama3D } from './MissionDiorama3D';
import { ClassifyActivity } from './activities/ClassifyActivity';
import { ChronoOrderActivity } from './activities/ChronoOrderActivity';
import { DetectiveCasesActivity } from './activities/DetectiveCasesActivity';
import { DragDropMatchActivity } from './activities/DragDropMatchActivity';
import { ExpeditionZonesActivity } from './activities/ExpeditionZonesActivity';
import { HiddenHuntActivity } from './activities/HiddenHuntActivity';
import { NpcTalkActivity } from './activities/NpcTalkActivity';
import { QuizChallengeActivity } from './activities/QuizChallengeActivity';

interface MissionModalProps {
  portalId: PortalId;
  bestStars: number;
  hasCrystal: boolean;
  onClose: () => void;
  onCompleteMission: (
    portalId: PortalId,
    stars: number,
    pointsEarned: number,
    coinsEarned: number,
    bestQuizScore: number,
  ) => void;
}

const STAGE_LABELS: Record<PortalId, [string, string, string]> = {
  1: ['1. Cari Kata Sejarah', '2. Padanan Istilah', '3. Buka Peti (5 Soalan)'],
  2: ['1. Temui 5 Tokoh', '2. Kenal Pasti Tokoh', '3. Padanan Takrif'],
  3: ['1. Ruang & Masa', '2. Susunan Kronologi', '3. Labirin Masa'],
  4: ['1. Cari Artifak', '2. Kelaskan Sumber', '3. Buka Peti Muzium'],
  5: ['1. Tapak Ekspedisi', '2. Kelaskan Kaedah', '3. Cabaran Lapangan'],
  6: ['1. Padankan Sebab-Akibat', '2. Rantaian Domino', '3. Jambatan Istana'],
  7: ['1. Cari Petunjuk Kota', '2. Analisis Bukti', '3. Pilih Pentafsiran'],
  8: ['1. 5 Khazanah Warisan', '2. Padanan Kepentingan', '3. Cabaran KBAT'],
};

export const MissionModal: React.FC<MissionModalProps> = ({
  portalId,
  bestStars,
  hasCrystal,
  onClose,
  onCompleteMission,
}) => {
  const topic = MISSION_TOPICS.find((t) => t.id === portalId)!;
  const [stageIndex, setStageIndex] = useState<0 | 1 | 2 | 3>(0); // 0,1,2 = 3 activities, 3 = celebration
  const [runPoints, setRunPoints] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizTotal, setQuizTotal] = useState(topic.questions.length);
  const [earnedStars, setEarnedStars] = useState(3);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [activeHistorianId, setActiveHistorianId] = useState<HistorianId>('herodotus');

  const addPoints = (pts: number) => {
    setRunPoints((p) => p + pts);
  };

  const finishMission = (
    finalQuizCorrect: number,
    totalQuestions: number,
    extraBonusPoints = 0,
  ) => {
    const totalPts = runPoints + extraBonusPoints;
    const ratio = totalQuestions > 0 ? finalQuizCorrect / totalQuestions : 1;
    const stars = ratio >= 0.85 ? 3 : ratio >= 0.5 ? 2 : 1;
    const coins = 40 + finalQuizCorrect * 15 + stars * 15;

    setQuizCorrect(finalQuizCorrect);
    setQuizTotal(totalQuestions);
    setEarnedStars(stars);
    setEarnedCoins(coins);
    setRunPoints(totalPts);

    soundEngine.playVictory();
    onCompleteMission(topic.id, stars, totalPts, coins, finalQuizCorrect);
    setStageIndex(3);
  };

  const handleReplay = () => {
    setStageIndex(0);
    setRunPoints(0);
    setQuizCorrect(0);
  };

  const stepNames = STAGE_LABELS[portalId];

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/88 flex items-center justify-center p-2.5 sm:p-5">
      <div className="w-full max-w-4xl max-h-[94vh] bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between gap-3 bg-slate-900">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-extrabold text-slate-950 text-lg shrink-0"
              style={{ backgroundColor: topic.colorHex }}
            >
              {topic.id}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">
                {topic.worldTitle} · {topic.islandName}
              </div>
              <h2 className="font-display font-bold text-base sm:text-xl text-white truncate">
                Misi {topic.id}: {topic.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 border border-white/10 text-xs font-bold text-sky-300 font-mono-num">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+{runPoints} Mata</span>
            </span>
            {bestStars > 0 && (
              <span className="hidden md:inline text-xs font-semibold text-yellow-300 font-mono-num">
                Rekod: {'★'.repeat(bestStars)}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Keluar dari portal"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Adventure Body */}
        <div className="flex-1 overflow-y-auto custom-scroll p-4 sm:p-6 space-y-5">
          {/* Live Unique 3D Mission World Diorama */}
          <div className="relative">
            <MissionDiorama3D
              portalId={portalId}
              stageIndex={stageIndex}
              colorHex={topic.colorHex}
              activeHistorianId={portalId === 2 ? activeHistorianId : undefined}
            />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span className="px-2.5 py-1 rounded-lg bg-slate-950/85 border border-white/15 text-[11px] font-semibold text-white">
                Alam 3D: {topic.worldTitle}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950/85 border border-white/15 text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                <Gem className="w-3 h-3" />
                <span>{hasCrystal ? `${topic.crystalName} Dimiliki` : `Ganjaran: ${topic.crystalName}`}</span>
              </span>
            </div>
          </div>

          {/* 3-Step Activity Progress Bar */}
          {stageIndex < 3 && (
            <div className="grid grid-cols-3 gap-2">
              {stepNames.map((label, idx) => {
                const done = idx < stageIndex;
                const active = idx === stageIndex;
                return (
                  <div
                    key={label}
                    style={{
                      borderColor: active
                        ? topic.colorHex
                        : done
                          ? '#10b981'
                          : 'rgba(255,255,255,0.1)',
                    }}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                      active
                        ? 'bg-slate-800 text-white'
                        : done
                          ? 'bg-emerald-950/40 text-emerald-300'
                          : 'bg-slate-800/40 text-slate-400'
                    }`}
                  >
                    {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    <span className="truncate">{label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ================= MISSION 1: MAKSUD SEJARAH ================= */}
          {portalId === 1 && stageIndex === 0 && (
            <HiddenHuntActivity
              title="Perpustakaan Sihir: Cari 4 Kata Sejarah Tersembunyi"
              instruction="Teroka rak buku ajaib dan klik 4 penanda bercahaya untuk menemui asal kata sejarah."
              items={M1_HIDDEN_WORDS}
              accentColor={topic.colorHex}
              onPointEarned={addPoints}
              onComplete={() => setStageIndex(1)}
            />
          )}
          {portalId === 1 && stageIndex === 1 && (
            <DragDropMatchActivity
              title="Padankan Akar Bahasa Sejarah dengan Maksudnya"
              instruction="Padankan Syajaratun, Historia dan History dengan maksud yang tepat mengikut KSSM."
              pairs={M1_MATCH_PAIRS}
              accentColor={topic.colorHex}
              onPointEarned={addPoints}
              onComplete={() => setStageIndex(2)}
            />
          )}
          {portalId === 1 && stageIndex === 2 && (
            <QuizChallengeActivity
              title="Buka Peti Khazanah Perpustakaan (5 Soalan)"
              questions={topic.questions}
              accentColor={topic.colorHex}
              finishButtonLabel="Buka Peti Khazanah!"
              onQuestionResult={(ok) => {
                if (ok) addPoints(10);
              }}
              onComplete={(correct) => finishMission(correct, topic.questions.length)}
            />
          )}

          {/* ================= MISSION 2: SEJARAH MENURUT TOKOH ================= */}
          {portalId === 2 && stageIndex === 0 && (
            <NpcTalkActivity
              title="Kota Para Sejarawan: Temui 5 Tokoh Sejarah"
              instruction="Klik setiap watak tokoh sejarah di kota purba untuk mendengar takrif sejarah menurut mereka."
              npcs={M2_HISTORIANS}
              onActiveNpcChange={(id) => setActiveHistorianId(id as HistorianId)}
              onPointEarned={addPoints}
              onComplete={() => setStageIndex(1)}
            />
          )}
          {portalId === 2 && stageIndex === 1 && (
            <QuizChallengeActivity
              title="Kenal Pasti Kelima-lima Tokoh Sejarah"
              questions={topic.questions}
              accentColor={topic.colorHex}
              finishButtonLabel="Terus ke Padanan Tokoh"
              onQuestionResult={(ok) => {
                if (ok) addPoints(10);
              }}
              onComplete={(correct) => {
                setQuizCorrect(correct);
                setQuizTotal(topic.questions.length);
                setStageIndex(2);
              }}
            />
          )}
          {portalId === 2 && stageIndex === 2 && (
            <DragDropMatchActivity
              title="Padankan Setiap Tokoh dengan Takrif Sejarah yang Tepat"
              instruction="Seret atau klik setiap tokoh dan padankan dengan takrif sejarah mereka."
              pairs={M2_MATCH_PAIRS}
              accentColor={topic.colorHex}
              onPointEarned={addPoints}
              onComplete={() => finishMission(quizCorrect, quizTotal)}
            />
          )}

          {/* ================= MISSION 3: RUANG DAN MASA ================= */}
          {portalId === 3 && stageIndex === 0 && (
            <DragDropMatchActivity
              title="Kenal Pasti Konsep Ruang dan Ukuran Masa"
              instruction="Padankan istilah Dekad, Abad, Alaf dan Ruang dengan penerangan yang betul."
              pairs={M3_MATCH_PAIRS}
              accentColor={topic.colorHex}
              onPointEarned={addPoints}
              onComplete={() => setStageIndex(1)}
            />
          )}
          {portalId === 3 && stageIndex === 1 && (
            <ChronoOrderActivity
              title="Susun Peristiwa Sejarah Mengikut Urutan Kronologi"
              instruction="Susun peristiwa dari yang paling awal (Sebelum Masihi) hingga pembentukan Malaysia."
              items={M3_CHRONO_EVENTS}
              modeLabel="Garis Masa Kronologi"
              onPointEarned={addPoints}
              onComplete={() => setStageIndex(2)}
            />
          )}
          {portalId === 3 && stageIndex === 2 && (
            <QuizChallengeActivity
              title="Lepasi Labirin Masa (Jawab Soalan Ruang & Masa)"
              questions={topic.questions}
              accentColor={topic.colorHex}
              finishButtonLabel="Keluar daripada Labirin Masa!"
              onQuestionResult={(ok) => {
                if (ok) addPoints(10);
              }}
              onComplete={(correct) => finishMission(correct, topic.questions.length)}
            />
          )}

          {/* ================= MISSION 4: SUMBER SEJARAH ================= */}
          {portalId === 4 && stageIndex === 0 && (
            <HiddenHuntActivity
              title="Muzium Arkeologi: Cari 5 Bahan & Artifak Sejarah"
              instruction="Cari objek sejarah tersembunyi di galeri muzium untuk memasukkannya ke dalam koleksi kajian."
              items={M4_HIDDEN_OBJECTS}
              accentColor={topic.colorHex}
              onPointEarned={addPoints}
              onComplete={() => setStageIndex(1)}
            />
          )}
          {portalId === 4 && stageIndex === 1 && (
            <ClassifyActivity
              title="Kelaskan Bahan kepada Sumber Primer dan Sumber Sekunder"
              instruction="Masukkan setiap bahan kajian ke dalam kategori sumber sejarah yang betul."
              buckets={M4_BUCKETS}
              items={M4_CLASSIFY_ITEMS}
              onPointEarned={addPoints}
              onComplete={() => setStageIndex(2)}
            />
          )}
          {portalId === 4 && stageIndex === 2 && (
            <QuizChallengeActivity
              title="Buka Peti Khazanah Muzium (Pilih Sumber Tepat)"
              questions={topic.questions}
              accentColor={topic.colorHex}
              finishButtonLabel="Buka Semua Peti Muzium!"
              onQuestionResult={(ok) => {
                if (ok) addPoints(10);
              }}
              onComplete={(correct) => finishMission(correct, topic.questions.length)}
            />
          )}

          {/* ================= MISSION 5: KAEDAH PENYELIDIKAN ================= */}
          {portalId === 5 && stageIndex === 0 && (
            <ExpeditionZonesActivity
              zones={M5_EXPEDITION_ZONES}
              onPointEarned={addPoints}
              onComplete={() => setStageIndex(1)}
            />
          )}
          {portalId === 5 && stageIndex === 1 && (
            <ClassifyActivity
              title="Kelaskan Aktiviti Mengikut Tiga Kaedah Penyelidikan Sejarah"
              instruction="Padankan setiap aktiviti penyelidikan kepada Kaedah Bertulis, Kaedah Lisan atau Kaedah Arkeologi."
              buckets={M5_BUCKETS}
              items={M5_CLASSIFY_ITEMS}
              onPointEarned={addPoints}
              onComplete={() => setStageIndex(2)}
            />
          )}
          {portalId === 5 && stageIndex === 2 && (
            <QuizChallengeActivity
              title="Ujian Lapangan Penyelidik Sejarah"
              questions={topic.questions}
              accentColor={topic.colorHex}
              finishButtonLabel="Lengkapkan Ekspedisi!"
              onQuestionResult={(ok) => {
                if (ok) addPoints(10);
              }}
              onComplete={(correct) => finishMission(correct, topic.questions.length)}
            />
          )}

          {/* ================= MISSION 6: SEBAB DAN AKIBAT ================= */}
          {portalId === 6 && stageIndex === 0 && (
            <DragDropMatchActivity
              title="Padankan Sebab (Punca) dengan Akibat (Kesan) Sejarah"
              instruction="Seret atau klik setiap sebab sejarah dan padankan dengan akibat yang berlaku."
              pairs={M6_CAUSE_EFFECT_PAIRS}
              accentColor={topic.colorHex}
              onPointEarned={addPoints}
              onComplete={() => setStageIndex(1)}
            />
          )}
          {portalId === 6 && stageIndex === 1 && (
            <ChronoOrderActivity
              title="Lengkapkan Rantaian Reaksi Domino Sejarah"
              instruction="Susun 3 domino berikut daripada Sebab Awal -> Tindak Balas Peristiwa -> Akibat Akhir."
              items={M6_DOMINO_CHAIN}
              modeLabel="Rantaian Domino"
              onPointEarned={addPoints}
              onComplete={() => setStageIndex(2)}
            />
          )}
          {portalId === 6 && stageIndex === 2 && (
            <QuizChallengeActivity
              title="Cabaran Menyeberangi Jambatan Istana Domino"
              questions={topic.questions}
              accentColor={topic.colorHex}
              finishButtonLabel="Seberangi Gerbang Istana!"
              onQuestionResult={(ok) => {
                if (ok) addPoints(10);
              }}
              onComplete={(correct) => finishMission(correct, topic.questions.length)}
            />
          )}

          {/* ================= MISSION 7: PENTAFSIRAN SEJARAH ================= */}
          {portalId === 7 && stageIndex === 0 && (
            <HiddenHuntActivity
              title="Kota Detektif: Cari 4 Petunjuk Punca Tafsiran Berbeza"
              instruction="Teroka lorong kota detektif dan kumpul 4 faktor mengapa wujud pentafsiran berbeza."
              items={M7_HIDDEN_CLUES}
              accentColor={topic.colorHex}
              onPointEarned={addPoints}
              onComplete={() => setStageIndex(1)}
            />
          )}
          {portalId === 7 && stageIndex === 1 && (
            <DetectiveCasesActivity
              cases={M7_DETECTIVE_CASES}
              onPointEarned={addPoints}
              onComplete={() => setStageIndex(2)}
            />
          )}
          {portalId === 7 && stageIndex === 2 && (
            <QuizChallengeActivity
              title="Keputusan Detektif: Pentafsiran Sejarah Objektif"
              questions={topic.questions}
              accentColor={topic.colorHex}
              finishButtonLabel="Tutup Fail Siasatan!"
              onQuestionResult={(ok) => {
                if (ok) addPoints(10);
              }}
              onComplete={(correct) => finishMission(correct, topic.questions.length)}
            />
          )}

          {/* ================= MISSION 8: KEPENTINGAN MEMPELAJARI SEJARAH ================= */}
          {portalId === 8 && stageIndex === 0 && (
            <HiddenHuntActivity
              title="Kerajaan Warisan: Temui 5 Khazanah Kepentingan Sejarah"
              instruction="Klik kelima-lima khazanah diraja untuk membuka lima kepentingan utama mempelajari sejarah."
              items={M8_HIDDEN_TREASURES}
              accentColor={topic.colorHex}
              onPointEarned={addPoints}
              onComplete={() => setStageIndex(1)}
            />
          )}
          {portalId === 8 && stageIndex === 1 && (
            <DragDropMatchActivity
              title="Padankan Situasi dengan 5 Kepentingan Mempelajari Sejarah"
              instruction="Padankan setiap situasi harian dengan salah satu daripada 5 kepentingan sejarah."
              pairs={M8_MATCH_PAIRS}
              accentColor={topic.colorHex}
              onPointEarned={addPoints}
              onComplete={() => setStageIndex(2)}
            />
          )}
          {portalId === 8 && stageIndex === 2 && (
            <QuizChallengeActivity
              title="Cabaran Patriotik & Soalan KBAT Kerajaan Warisan"
              questions={topic.questions}
              accentColor={topic.colorHex}
              finishButtonLabel="Tuntut Mahkota & Kristal Ilmu!"
              onQuestionResult={(ok) => {
                if (ok) addPoints(10);
              }}
              onComplete={(correct) => finishMission(correct, topic.questions.length)}
            />
          )}

          {/* ================= MISSION COMPLETION CELEBRATION SCREEN ================= */}
          {stageIndex === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="py-4 text-center space-y-5 relative overflow-hidden"
            >
              {/* Animated Celebration Confetti Sparkles */}
              <div className="flex items-center justify-center gap-3">
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, 12, -12, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-2xl"
                  style={{ backgroundColor: topic.colorHex }}
                >
                  <Gem className="w-9 h-9 text-slate-950" />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                  className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400/60 flex items-center justify-center shadow-2xl"
                >
                  <Trophy className="w-8 h-8 text-amber-400" />
                </motion.div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Misi Portal {topic.id} Berjaya Diselesaikan!
                </div>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
                  Tahniah! Anda Menerima {topic.crystalName}
                </h3>
                <p className="text-sm text-slate-300 mt-1">
                  Skor cabaran soalan:{' '}
                  <span className="font-bold text-white font-mono-num">
                    {quizCorrect} / {quizTotal}
                  </span>
                </p>
              </div>

              {/* Stars Earned */}
              <div className="flex items-center justify-center gap-3">
                {[1, 2, 3].map((s) => (
                  <motion.div
                    key={s}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: s * 0.14, type: 'spring' }}
                  >
                    <Star
                      className={`w-10 h-10 ${
                        earnedStars >= s
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-slate-700'
                      }`}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Rewards Breakdown */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-sky-500/15 border border-sky-400/35 text-sky-300 font-bold text-sm font-mono-num flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>+{runPoints} Mata Ilmu</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-400/35 text-amber-300 font-bold text-sm font-mono-num flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  <span>+{earnedCoins} Syiling</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 font-bold text-sm flex items-center gap-2">
                  <Gem className="w-4 h-4" />
                  <span>+1 Kristal Ilmu</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReplay}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold cursor-pointer"
                >
                  Main Semula Misi
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-sm cursor-pointer"
                >
                  Kembali ke Kampung Purba
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
