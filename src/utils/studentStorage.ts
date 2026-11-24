import {
  DEFAULT_AVATAR_CONFIG,
  INITIAL_PROGRESS,
  calculateProgressPercent,
  countCompletedMissions,
  countTotalStars,
} from '../data/sejarahBab1';
import { ACHIEVEMENTS, evaluateAchievements } from '../data/achievements';
import {
  AvatarConfig,
  PlayerProgress,
  PortalId,
  StudentProfile,
  StudentProfileStore,
} from '../types/game';

export const PROFILES_STORAGE_KEY = 'misi-sejarah-bab1-profiles-v1';
const LEGACY_STORAGE_KEYS = [
  'misi-sejarah-bab1-save-v2',
  'misi-sejarah-bab1-save-v1',
];

function generateProfileId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `pelajar-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizePlayerProgress(
  raw: Partial<PlayerProgress> | null | undefined,
): PlayerProgress {
  const safe = raw || {};
  const mergedMissions = { ...INITIAL_PROGRESS.missions };
  if (safe.missions) {
    (Object.keys(INITIAL_PROGRESS.missions) as unknown as PortalId[]).forEach(
      (id) => {
        if (safe.missions?.[id]) {
          mergedMissions[id] = {
            completed: Boolean(safe.missions[id].completed),
            stars: Number(safe.missions[id].stars) || 0,
            bestScore: Number(safe.missions[id].bestScore) || 0,
          };
        }
      },
    );
  }

  const base: PlayerProgress = {
    playerName:
      typeof safe.playerName === 'string' && safe.playerName.trim()
        ? safe.playerName.trim()
        : INITIAL_PROGRESS.playerName,
    playerClass:
      typeof safe.playerClass === 'string' ? safe.playerClass.trim() : '',
    avatarColor:
      safe.avatarConfig?.shirtColor ||
      safe.avatarColor ||
      DEFAULT_AVATAR_CONFIG.shirtColor,
    avatarConfig: {
      ...DEFAULT_AVATAR_CONFIG,
      ...(safe.avatarConfig || {}),
      shirtColor:
        safe.avatarConfig?.shirtColor ||
        safe.avatarColor ||
        DEFAULT_AVATAR_CONFIG.shirtColor,
    },
    points: typeof safe.points === 'number' ? safe.points : 0,
    coins: typeof safe.coins === 'number' ? safe.coins : 50,
    knowledgeCrystals: Array.isArray(safe.knowledgeCrystals)
      ? safe.knowledgeCrystals
      : [],
    openedChests: Array.isArray(safe.openedChests) ? safe.openedChests : [],
    collectedCrystals: Array.isArray(safe.collectedCrystals)
      ? safe.collectedCrystals
      : [],
    achievements: Array.isArray(safe.achievements) ? safe.achievements : [],
    missions: mergedMissions,
  };

  const { updatedAchievements } = evaluateAchievements(base);
  base.achievements = updatedAchievements;
  return base;
}

function hasMeaningfulProgress(p: PlayerProgress): boolean {
  return (
    countCompletedMissions(p) > 0 ||
    p.points > 0 ||
    p.coins !== INITIAL_PROGRESS.coins ||
    p.openedChests.length > 0 ||
    p.collectedCrystals.length > 0 ||
    p.knowledgeCrystals.length > 0 ||
    p.playerName !== INITIAL_PROGRESS.playerName
  );
}

export function createStudentProfile(
  playerName: string,
  playerClass: string,
  avatarConfig?: Partial<AvatarConfig>,
  baseProgress?: Partial<PlayerProgress>,
): StudentProfile {
  const now = new Date().toISOString();
  const normalized = normalizePlayerProgress({
    ...INITIAL_PROGRESS,
    ...(baseProgress || {}),
    playerName: playerName.trim() || 'Penjelajah Muda',
    playerClass: playerClass.trim().toUpperCase() || '1 ZETA',
    avatarConfig: {
      ...DEFAULT_AVATAR_CONFIG,
      ...(baseProgress?.avatarConfig || {}),
      ...(avatarConfig || {}),
    },
  });
  return {
    ...normalized,
    id: generateProfileId(),
    createdAt: now,
    lastPlayedAt: now,
  };
}

export function loadStudentStore(): {
  store: StudentProfileStore;
  migratedLegacy: boolean;
  error: string | null;
} {
  try {
    const rawStore = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (rawStore) {
      const parsed = JSON.parse(rawStore) as Partial<StudentProfileStore>;
      const rawProfiles = Array.isArray(parsed.profiles) ? parsed.profiles : [];
      const profiles: StudentProfile[] = rawProfiles.map((item) => {
        const normalized = normalizePlayerProgress(item);
        return {
          ...normalized,
          id: typeof item.id === 'string' && item.id ? item.id : generateProfileId(),
          createdAt: item.createdAt || new Date().toISOString(),
          lastPlayedAt: item.lastPlayedAt || new Date().toISOString(),
        };
      });

      const activeId =
        parsed.activeProfileId &&
        profiles.some((p) => p.id === parsed.activeProfileId)
          ? parsed.activeProfileId
          : profiles[0]?.id || null;

      return {
        store: { activeProfileId: activeId, profiles },
        migratedLegacy: false,
        error: null,
      };
    }

    // Migrate existing single-player save without resetting progress!
    for (const key of LEGACY_STORAGE_KEYS) {
      const legacyRaw = localStorage.getItem(key);
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw) as Partial<PlayerProgress>;
        const normalized = normalizePlayerProgress(legacyParsed);
        if (hasMeaningfulProgress(normalized)) {
          const migratedProfile: StudentProfile = {
            ...normalized,
            id: generateProfileId(),
            playerClass: normalized.playerClass || '',
            createdAt: new Date().toISOString(),
            lastPlayedAt: new Date().toISOString(),
          };
          const store: StudentProfileStore = {
            activeProfileId: migratedProfile.id,
            profiles: [migratedProfile],
          };
          saveStudentStore(store);
          return { store, migratedLegacy: true, error: null };
        }
      }
    }

    return {
      store: { activeProfileId: null, profiles: [] },
      migratedLegacy: false,
      error: null,
    };
  } catch (err) {
    return {
      store: { activeProfileId: null, profiles: [] },
      migratedLegacy: false,
      error:
        err instanceof Error
          ? err.message
          : 'Gagal membaca simpanan tempatan pelayar.',
    };
  }
}

export function saveStudentStore(store: StudentProfileStore): {
  ok: boolean;
  error?: string;
} {
  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(store));
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : 'Gagal menyimpan kemajuan ke localStorage pelayar.',
    };
  }
}

function escapeCsvField(val: string | number): string {
  const str = String(val ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportProfilesToCsv(
  profiles: StudentProfile[],
  fileTag = 'semua-pelajar',
): {
  ok: boolean;
  error?: string;
} {
  try {
    if (profiles.length === 0) {
      return { ok: false, error: 'Tiada profil pelajar untuk dieksport.' };
    }

    const headers = [
      'Nama Pelajar',
      'Kelas',
      'Mata Ilmu',
      'Syiling',
      'Jumlah Bintang (/24)',
      'Kristal Ilmu (/8)',
      'Misi Selesai (/8)',
      'Kemajuan (%)',
      'Lencana Dibuka',
      'Senarai Lencana',
      'Misi 1 (Bintang)',
      'Misi 2 (Bintang)',
      'Misi 3 (Bintang)',
      'Misi 4 (Bintang)',
      'Misi 5 (Bintang)',
      'Misi 6 (Bintang)',
      'Misi 7 (Bintang)',
      'Misi 8 (Bintang)',
      'Terakhir Dimainkan',
    ];

    const badgeTitleMap = new Map(ACHIEVEMENTS.map((a) => [a.id, a.title]));

    const rows = profiles.map((p) => {
      const stars = countTotalStars(p);
      const crystals = p.knowledgeCrystals?.length || 0;
      const completed = countCompletedMissions(p);
      const pct = calculateProgressPercent(p);
      const badgeTitles = (p.achievements || [])
        .map((id) => badgeTitleMap.get(id) || id)
        .join('; ');

      const missionStars = ([1, 2, 3, 4, 5, 6, 7, 8] as PortalId[]).map(
        (id) => p.missions[id]?.stars || 0,
      );

      return [
        p.playerName,
        p.playerClass || '-',
        p.points || 0,
        p.coins,
        stars,
        crystals,
        completed,
        pct,
        p.achievements?.length || 0,
        badgeTitles || 'Tiada lagi',
        ...missionStars,
        new Date(p.lastPlayedAt).toLocaleString('ms-MY'),
      ]
        .map(escapeCsvField)
        .join(',');
    });

    const csvContent = `\uFEFF${headers.map(escapeCsvField).join(',')}\n${rows.join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateTag = new Date().toISOString().slice(0, 10);
    const safeTag =
      fileTag
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'pelajar';
    link.href = url;
    link.download = `misi-sejarah-${safeTag}-${dateTag}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : 'Gagal menjana fail CSV kemajuan pelajar.',
    };
  }
}
