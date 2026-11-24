import {
  AchievementDefinition,
  PlayerProgress,
} from '../types/game';
import {
  countCompletedMissions,
  countTotalStars,
} from './sejarahBab1';

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'sejarah-explorer',
    title: 'Sejarah Explorer',
    subtitle: 'Penjelajah Kampung Purba',
    description: 'Selesaikan Misi 1 (Maksud Sejarah) atau temui khazanah pertama di kampung.',
    colorHex: '#10b981',
    iconName: 'compass',
    checkUnlocked: (p) =>
      Boolean(p.missions[1]?.completed) ||
      p.openedChests.length >= 1 ||
      p.collectedCrystals.length >= 1,
    getProgressLabel: (p) =>
      Boolean(p.missions[1]?.completed) ||
      p.openedChests.length >= 1 ||
      p.collectedCrystals.length >= 1
        ? '1 / 1 Selesai'
        : '0 / 1 Misi 1 / Peti',
  },
  {
    id: 'master-historian',
    title: 'Master Historian',
    subtitle: 'Sarjana Ilmu Sejarah',
    description: 'Selesaikan Misi 2 (Sejarah Menurut Tokoh) dan Misi 8 (Kepentingan Sejarah).',
    colorHex: '#0ea5e9',
    iconName: 'award',
    checkUnlocked: (p) =>
      Boolean(p.missions[2]?.completed && p.missions[8]?.completed),
    getProgressLabel: (p) => {
      const done =
        (p.missions[2]?.completed ? 1 : 0) + (p.missions[8]?.completed ? 1 : 0);
      return `${done} / 2 Misi`;
    },
  },
  {
    id: 'artefact-hunter',
    title: 'Artefact Hunter',
    subtitle: 'Pemburu Artifak & Sumber',
    description: 'Selesaikan Misi 4 (Sumber Sejarah) dan Misi 5 (Kaedah Penyelidikan).',
    colorHex: '#f59e0b',
    iconName: 'gem',
    checkUnlocked: (p) =>
      Boolean(p.missions[4]?.completed && p.missions[5]?.completed),
    getProgressLabel: (p) => {
      const done =
        (p.missions[4]?.completed ? 1 : 0) + (p.missions[5]?.completed ? 1 : 0);
      return `${done} / 2 Misi`;
    },
  },
  {
    id: 'time-traveller',
    title: 'Time Traveller',
    subtitle: 'Pengembara Ruang & Masa',
    description: 'Lepasi cabaran kronologi dalam Misi 3 (Ruang dan Masa dalam Sejarah).',
    colorHex: '#8b5cf6',
    iconName: 'clock',
    checkUnlocked: (p) => Boolean(p.missions[3]?.completed),
    getProgressLabel: (p) =>
      p.missions[3]?.completed ? '1 / 1 Selesai' : '0 / 1 Misi 3',
  },
  {
    id: 'history-detective',
    title: 'History Detective',
    subtitle: 'Detektif Sebab & Tafsiran',
    description: 'Selesaikan Misi 6 (Sebab & Akibat) dan Misi 7 (Pentafsiran Sejarah).',
    colorHex: '#14b8a6',
    iconName: 'search',
    checkUnlocked: (p) =>
      Boolean(p.missions[6]?.completed && p.missions[7]?.completed),
    getProgressLabel: (p) => {
      const done =
        (p.missions[6]?.completed ? 1 : 0) + (p.missions[7]?.completed ? 1 : 0);
      return `${done} / 2 Misi`;
    },
  },
  {
    id: 'first-treasure',
    title: 'Pemburu Harta Purba',
    subtitle: 'Kolektor Syiling Kampung',
    description: 'Buka sekurang-kurangnya 2 peti harta atau kumpul 150 Syiling Sejarah.',
    colorHex: '#f97316',
    iconName: 'coins',
    checkUnlocked: (p) => p.openedChests.length >= 2 || p.coins >= 150,
    getProgressLabel: (p) =>
      p.openedChests.length >= 2 || p.coins >= 150
        ? 'Terbuka'
        : `${Math.min(p.coins, 150)} / 150 Syiling`,
  },
  {
    id: 'star-collector',
    title: 'Pengumpul Bintang',
    subtitle: 'Penjelajah Cemerlang',
    description: 'Kumpulkan sekurang-kurangnya 12 Bintang daripada cabaran 8 portal.',
    colorHex: '#eab308',
    iconName: 'star',
    checkUnlocked: (p) => countTotalStars(p) >= 12,
    getProgressLabel: (p) => `${Math.min(countTotalStars(p), 12)} / 12 Bintang`,
  },
  {
    id: 'knowledge-champion',
    title: 'Knowledge Champion',
    subtitle: 'Juara Tamadun Bab 1',
    description: 'Lengkapkan kesemua 8 misi portal dan kumpulkan 8 Kristal Ilmu!',
    colorHex: '#ec4899',
    iconName: 'trophy',
    checkUnlocked: (p) =>
      countCompletedMissions(p) >= 8 ||
      (p.knowledgeCrystals?.length || 0) >= 8,
    getProgressLabel: (p) => `${countCompletedMissions(p)} / 8 Misi`,
  },
];

export function evaluateAchievements(progress: PlayerProgress): {
  updatedAchievements: string[];
  newlyUnlocked: AchievementDefinition[];
} {
  const existing = new Set(progress.achievements || []);
  const newlyUnlocked: AchievementDefinition[] = [];

  for (const badge of ACHIEVEMENTS) {
    if (!existing.has(badge.id) && badge.checkUnlocked(progress)) {
      existing.add(badge.id);
      newlyUnlocked.push(badge);
    }
  }

  return {
    updatedAchievements: Array.from(existing),
    newlyUnlocked,
  };
}
