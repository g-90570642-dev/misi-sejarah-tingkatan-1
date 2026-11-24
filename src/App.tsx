import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, X } from 'lucide-react';
import { AdventureMapModal } from './components/AdventureMapModal';
import { AvatarCustomizerModal } from './components/AvatarCustomizerModal';
import { GameCanvas, TouchInputState } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { GuideModal } from './components/GuideModal';
import { MissionModal } from './components/MissionModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { StudentSwitchModal } from './components/StudentSwitchModal';
import { TeacherDashboardModal } from './components/TeacherDashboardModal';
import { evaluateAchievements } from './data/achievements';
import {
  DEFAULT_AVATAR_CONFIG,
  INITIAL_PROGRESS,
  MISSION_TOPICS,
} from './data/sejarahBab1';
import {
  AchievementDefinition,
  AvatarConfig,
  MissionTopic,
  NearbyTarget,
  PortalId,
  StudentProfile,
  StudentProfileStore,
} from './types/game';
import { soundEngine } from './utils/audio';
import {
  createStudentProfile,
  loadStudentStore,
  saveStudentStore,
} from './utils/studentStorage';

export default function App() {
  const [initialBoot] = useState(() => loadStudentStore());
  const [store, setStore] = useState<StudentProfileStore>(initialBoot.store);
  const [storageWarning, setStorageWarning] = useState<string | null>(
    initialBoot.error,
  );
  const [isInitialWelcome, setIsInitialWelcome] = useState(true);
  const [showStudentModal, setShowStudentModal] = useState(true);
  const [showTeacherDashboard, setShowTeacherDashboard] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showAvatarStudio, setShowAvatarStudio] = useState(false);
  const [activePortalId, setActivePortalId] = useState<PortalId | null>(null);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [nearbyTarget, setNearbyTarget] = useState<NearbyTarget>(null);
  const [toastText, setToastText] = useState<string | null>(null);
  const [achievementToast, setAchievementToast] =
    useState<AchievementDefinition | null>(null);
  const [muted, setMuted] = useState(false);
  const [sprintToggle, setSprintToggle] = useState(false);
  const [emoteTrigger, setEmoteTrigger] = useState<{
    state: 'wave' | 'dance' | 'celebrate';
    nonce: number;
  } | null>(null);
  const [showTouchPad, setShowTouchPad] = useState(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });
  const [interactSignal, setInteractSignal] = useState(0);
  const [cameraResetSignal, setCameraResetSignal] = useState(0);
  const [teleportTarget, setTeleportTarget] = useState<{
    x: number;
    z: number;
    yaw: number;
    nonce: number;
  } | null>(null);

  const touchInputRef = useRef<TouchInputState>({
    moveX: 0,
    moveY: 0,
    jumpPressed: false,
  });

  const toastTimerRef = useRef<number | null>(null);
  const badgeTimerRef = useRef<number | null>(null);

  const activeProfile: StudentProfile | null = useMemo(
    () =>
      store.profiles.find((p) => p.id === store.activeProfileId) ||
      store.profiles[0] ||
      null,
    [store],
  );

  const progress = activeProfile || INITIAL_PROGRESS;
  const needsClassCompletion = Boolean(
    activeProfile && !activeProfile.playerClass.trim(),
  );

  const showToast = useCallback((msg: string) => {
    setToastText(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastText(null);
    }, 3400);
  }, []);

  const triggerBadgeBanner = useCallback((badge: AchievementDefinition) => {
    soundEngine.playVictory();
    setAchievementToast(badge);
    setEmoteTrigger({ state: 'celebrate', nonce: Date.now() });
    if (badgeTimerRef.current) {
      window.clearTimeout(badgeTimerRef.current);
    }
    badgeTimerRef.current = window.setTimeout(() => {
      setAchievementToast(null);
    }, 4200);
  }, []);

  // Persist every store change to localStorage with error handling
  const persistStore = useCallback((nextStore: StudentProfileStore) => {
    const res = saveStudentStore(nextStore);
    if (!res.ok) {
      setStorageWarning(res.error || 'Gagal menyimpan data pelajar secara tempatan.');
    } else {
      setStorageWarning(null);
    }
  }, []);

  const updateActiveProfile = useCallback(
    (updater: (current: StudentProfile) => StudentProfile) => {
      let newlyUnlockedBadge: AchievementDefinition | null = null;

      setStore((prevStore) => {
        const targetId = prevStore.activeProfileId || prevStore.profiles[0]?.id;
        if (!targetId) return prevStore;

        const nextProfiles = prevStore.profiles.map((prof) => {
          if (prof.id !== targetId) return prof;
          const draft = updater(prof);
          const { updatedAchievements, newlyUnlocked } =
            evaluateAchievements(draft);
          if (newlyUnlocked.length > 0) {
            newlyUnlockedBadge = newlyUnlocked[0];
          }
          return {
            ...draft,
            achievements: updatedAchievements,
            lastPlayedAt: new Date().toISOString(),
          };
        });

        const nextStore: StudentProfileStore = {
          ...prevStore,
          activeProfileId: targetId,
          profiles: nextProfiles,
        };
        persistStore(nextStore);
        return nextStore;
      });

      if (newlyUnlockedBadge) {
        triggerBadgeBanner(newlyUnlockedBadge);
      }
    },
    [persistStore, triggerBadgeBanner],
  );

  // Keyboard shortcuts for Map (M), Camera Reset (R), Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.code === 'KeyM' && !showStudentModal && !showTeacherDashboard) {
        setActivePortalId(null);
        setShowGuide(false);
        setShowAvatarStudio(false);
        setShowProfileModal(false);
        setShowMap((v) => !v);
      } else if (e.code === 'KeyR' && !showStudentModal && !showTeacherDashboard) {
        setCameraResetSignal((n) => n + 1);
      } else if (e.code === 'Escape') {
        if (showTeacherDashboard) {
          setShowTeacherDashboard(false);
          return;
        }
        setShowMap(false);
        setShowGuide(false);
        setShowAvatarStudio(false);
        setShowProfileModal(false);
        setActivePortalId(null);
        if (activeProfile && !needsClassCompletion) {
          setShowStudentModal(false);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeProfile, needsClassCompletion, showStudentModal, showTeacherDashboard]);

  const completedMissions = useMemo(
    () =>
      (Object.keys(progress.missions) as unknown as PortalId[])
        .map((k) => Number(k) as PortalId)
        .filter((id) => progress.missions[id]?.completed),
    [progress.missions],
  );

  const isPaused =
    activePortalId !== null ||
    showMap ||
    showGuide ||
    showAvatarStudio ||
    showProfileModal ||
    showStudentModal ||
    showTeacherDashboard;

  const handleRegisterStudent = useCallback(
    (name: string, playerClass: string, avatarConfig: AvatarConfig) => {
      const newProfile = createStudentProfile(name, playerClass, avatarConfig);
      setStore((prev) => {
        const nextStore: StudentProfileStore = {
          activeProfileId: newProfile.id,
          profiles: [newProfile, ...prev.profiles],
        };
        persistStore(nextStore);
        return nextStore;
      });
      setNearbyTarget(null);
      setActivePortalId(null);
      setShowMap(false);
      setShowGuide(false);
      setShowProfileModal(false);
      setShowAvatarStudio(false);
      setShowStudentModal(false);
      setIsInitialWelcome(false);
      setShowWelcomeBanner(true);
      setEmoteTrigger({ state: 'wave', nonce: Date.now() });
      showToast(`Selamat datang, ${newProfile.playerName} (${newProfile.playerClass})!`);
    },
    [persistStore, showToast],
  );

  const handleUpdateMigratedIdentity = useCallback(
    (name: string, playerClass: string) => {
      updateActiveProfile((prev) => ({
        ...prev,
        playerName: name,
        playerClass,
      }));
      setShowStudentModal(false);
      setIsInitialWelcome(false);
      setEmoteTrigger({ state: 'wave', nonce: Date.now() });
      showToast(`Profil ${name} (${playerClass}) dikemas kini!`);
    },
    [showToast, updateActiveProfile],
  );

  const handleSelectStudent = useCallback(
    (profileId: string) => {
      const chosen = store.profiles.find((p) => p.id === profileId);
      if (!chosen) return;
      const nextStore: StudentProfileStore = {
        activeProfileId: profileId,
        profiles: store.profiles.map((p) =>
          p.id === profileId
            ? { ...p, lastPlayedAt: new Date().toISOString() }
            : p,
        ),
      };
      setStore(nextStore);
      persistStore(nextStore);
      setNearbyTarget(null);
      setActivePortalId(null);
      setShowMap(false);
      setShowGuide(false);
      setShowProfileModal(false);
      setShowAvatarStudio(false);
      setShowStudentModal(false);
      setIsInitialWelcome(false);
      setEmoteTrigger({ state: 'wave', nonce: Date.now() });
      showToast(
        `Selamat kembali, ${chosen.playerName} (${chosen.playerClass || '-'})!`,
      );
    },
    [persistStore, showToast, store.profiles],
  );

  const handleDeleteStudent = useCallback(
    (profileId: string) => {
      setStore((prev) => {
        const remaining = prev.profiles.filter((p) => p.id !== profileId);
        const nextActive =
          prev.activeProfileId === profileId
            ? remaining[0]?.id || null
            : prev.activeProfileId;
        const nextStore: StudentProfileStore = {
          activeProfileId: nextActive,
          profiles: remaining,
        };
        persistStore(nextStore);
        return nextStore;
      });
      showToast('Profil pelajar telah dipadam daripada pelayar ini.');
    },
    [persistStore, showToast],
  );

  const handleEnterPortal = useCallback((id: PortalId) => {
    setShowWelcomeBanner(false);
    setShowMap(false);
    setShowGuide(false);
    setActivePortalId(id);
  }, []);

  const handleOpenChest = useCallback(
    (chestId: string) => {
      updateActiveProfile((prev) => {
        if (prev.openedChests.includes(chestId)) return prev;
        return {
          ...prev,
          points: (prev.points || 0) + 10,
          coins: prev.coins + 30,
          openedChests: [...prev.openedChests, chestId],
        };
      });
    },
    [updateActiveProfile],
  );

  const handleCollectCrystal = useCallback(
    (crystalId: string) => {
      updateActiveProfile((prev) => {
        if (prev.collectedCrystals.includes(crystalId)) return prev;
        return {
          ...prev,
          points: (prev.points || 0) + 10,
          coins: prev.coins + 20,
          collectedCrystals: [...prev.collectedCrystals, crystalId],
        };
      });
    },
    [updateActiveProfile],
  );

  const handleCollectCoin = useCallback(() => {
    updateActiveProfile((prev) => ({
      ...prev,
      coins: prev.coins + 10,
    }));
  }, [updateActiveProfile]);

  const handleCompleteMission = useCallback(
    (
      portalId: PortalId,
      stars: number,
      pointsEarned: number,
      coinsEarned: number,
      bestQuizScore: number,
    ) => {
      updateActiveProfile((prev) => {
        const existing = prev.missions[portalId] || {
          completed: false,
          stars: 0,
          bestScore: 0,
        };
        const updatedMissions = {
          ...prev.missions,
          [portalId]: {
            completed: true,
            stars: Math.max(existing.stars, stars),
            bestScore: Math.max(existing.bestScore, bestQuizScore),
          },
        };
        const crystals = prev.knowledgeCrystals?.includes(portalId)
          ? prev.knowledgeCrystals
          : [...(prev.knowledgeCrystals || []), portalId];

        return {
          ...prev,
          points: (prev.points || 0) + pointsEarned,
          coins: prev.coins + coinsEarned,
          knowledgeCrystals: crystals,
          missions: updatedMissions,
        };
      });

      const topic = MISSION_TOPICS.find((t) => t.id === portalId);
      if (topic) {
        showToast(
          `Misi ${portalId} selesai! +${pointsEarned} Mata · +${coinsEarned} Syiling · ${topic.crystalName}`,
        );
      }
      setEmoteTrigger({ state: 'celebrate', nonce: Date.now() });
    },
    [showToast, updateActiveProfile],
  );

  const handleTeleportToPortal = useCallback(
    (topic: MissionTopic) => {
      const angleToCenter = Math.atan2(-topic.position.x, -topic.position.z);
      const spawnX = topic.position.x + Math.sin(angleToCenter) * 4.8;
      const spawnZ = topic.position.z + Math.cos(angleToCenter) * 4.8;
      const facePortalYaw = Math.atan2(
        topic.position.x - spawnX,
        topic.position.z - spawnZ,
      );

      setTeleportTarget({
        x: spawnX,
        z: spawnZ,
        yaw: facePortalYaw,
        nonce: Date.now(),
      });
      setShowMap(false);
      setShowGuide(false);
      setShowWelcomeBanner(false);
      showToast(`Tiba di hadapan Portal ${topic.id}: ${topic.title}`);
    },
    [showToast],
  );

  const handleSaveAvatar = useCallback(
    (name: string, config: AvatarConfig) => {
      updateActiveProfile((prev) => ({
        ...prev,
        playerName: name,
        avatarColor: config.shirtColor,
        avatarConfig: config,
      }));
      setShowAvatarStudio(false);
      setEmoteTrigger({ state: 'wave', nonce: Date.now() });
      showToast('Avatar 3D baharu berjaya disimpan!');
    },
    [showToast, updateActiveProfile],
  );

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      soundEngine.muted = next;
      return next;
    });
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0c1a2e]">
      {/* Full-Viewport 3D Village & 8 Portals (keyed by active student ID so switching students loads their exact world state) */}
      <GameCanvas
        key={activeProfile?.id || 'guest-village'}
        avatarConfig={progress.avatarConfig || DEFAULT_AVATAR_CONFIG}
        completedMissions={completedMissions}
        openedChests={progress.openedChests}
        collectedCrystals={progress.collectedCrystals}
        isPaused={isPaused}
        sprintToggle={sprintToggle}
        emoteTrigger={emoteTrigger}
        teleportTarget={teleportTarget}
        touchInputRef={touchInputRef}
        interactSignal={interactSignal}
        cameraResetSignal={cameraResetSignal}
        onNearbyChange={setNearbyTarget}
        onEnterPortal={handleEnterPortal}
        onOpenChest={handleOpenChest}
        onCollectCrystal={handleCollectCrystal}
        onCollectCoin={handleCollectCoin}
        onTalkToGuide={() => {
          setShowWelcomeBanner(false);
          setShowGuide(true);
        }}
        onShowToast={showToast}
      />

      {/* Game HUD */}
      <GameHUD
        progress={progress}
        nearbyTarget={nearbyTarget}
        toastText={toastText}
        achievementToast={achievementToast}
        muted={muted}
        showTouchPad={showTouchPad}
        sprintToggle={sprintToggle}
        touchInputRef={touchInputRef}
        onOpenMap={() => {
          setShowWelcomeBanner(false);
          setShowMap(true);
        }}
        onOpenGuide={() => {
          setShowWelcomeBanner(false);
          setShowGuide(true);
        }}
        onOpenAvatarStudio={() => {
          setShowWelcomeBanner(false);
          setShowAvatarStudio(true);
        }}
        onOpenProfile={() => {
          setShowWelcomeBanner(false);
          setShowProfileModal(true);
        }}
        onOpenStudentSwitcher={() => {
          setShowWelcomeBanner(false);
          setIsInitialWelcome(false);
          setShowStudentModal(true);
        }}
        onInteract={() => setInteractSignal((n) => n + 1)}
        onResetCamera={() => setCameraResetSignal((n) => n + 1)}
        onToggleMute={handleToggleMute}
        onToggleTouchPad={() => setShowTouchPad((v) => !v)}
        onToggleSprint={() => setSprintToggle((v) => !v)}
        onTriggerEmote={(state) => {
          soundEngine.playClick();
          setEmoteTrigger({ state, nonce: Date.now() });
        }}
      />

      {/* Friendly Tok Guru Welcome Card */}
      {showWelcomeBanner && !isPaused && (
        <div className="fixed bottom-24 left-3 sm:left-5 z-20 max-w-sm bg-slate-900/95 border border-teal-400/40 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 text-teal-300 font-display font-bold text-sm">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Tok Guru Sejarah</span>
            </div>
            <button
              type="button"
              onClick={() => setShowWelcomeBanner(false)}
              aria-label="Tutup ucapan"
              className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 mt-1.5 leading-relaxed">
            Selamat datang, <strong className="text-amber-300">{progress.playerName}</strong>! Terokai kampung purba dan selesaikan{' '}
            <strong className="text-white">8 Portal Misi</strong> untuk mengumpul semua 8 Kristal Ilmu Bab 1.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowWelcomeBanner(false);
                setShowMap(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-xs cursor-pointer"
            >
              Lihat Peta 8 Pulau
            </button>
            <button
              type="button"
              onClick={() => setShowWelcomeBanner(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Mula Berjalan
            </button>
          </div>
        </div>
      )}

      {/* 8-Island Adventure Map Modal */}
      {showMap && (
        <AdventureMapModal
          progress={progress}
          onClose={() => setShowMap(false)}
          onTeleportToPortal={handleTeleportToPortal}
          onStartMissionDirect={(id) => {
            setShowMap(false);
            setActivePortalId(id);
          }}
        />
      )}

      {/* Playable 8-World Mission Modal */}
      {activePortalId !== null && (
        <MissionModal
          portalId={activePortalId}
          bestStars={progress.missions[activePortalId]?.stars || 0}
          hasCrystal={progress.knowledgeCrystals?.includes(activePortalId) || false}
          onClose={() => setActivePortalId(null)}
          onCompleteMission={handleCompleteMission}
        />
      )}

      {/* Tok Guru Sejarah Modal */}
      {showGuide && (
        <GuideModal
          progress={progress}
          onClose={() => setShowGuide(false)}
          onOpenMap={() => {
            setShowGuide(false);
            setShowMap(true);
          }}
          onTeleportToPortal={handleTeleportToPortal}
        />
      )}

      {/* 3D Avatar Customizer Studio */}
      {showAvatarStudio && (
        <AvatarCustomizerModal
          initialName={progress.playerName}
          initialConfig={progress.avatarConfig || DEFAULT_AVATAR_CONFIG}
          onSave={handleSaveAvatar}
          onClose={() => setShowAvatarStudio(false)}
        />
      )}

      {/* Personal Student Profile & Achievements Modal */}
      {showProfileModal && activeProfile && (
        <StudentProfileModal
          profile={activeProfile}
          allProfiles={store.profiles}
          onClose={() => setShowProfileModal(false)}
          onOpenAvatarStudio={() => {
            setShowProfileModal(false);
            setShowAvatarStudio(true);
          }}
          onOpenStudentSwitcher={() => {
            setShowProfileModal(false);
            setIsInitialWelcome(false);
            setShowStudentModal(true);
          }}
        />
      )}

      {/* Welcome Screen, Student Registration & Multi-Student Switcher */}
      {showStudentModal && (
        <StudentSwitchModal
          profiles={store.profiles}
          activeProfileId={store.activeProfileId}
          isInitialWelcome={isInitialWelcome}
          needsClassCompletion={needsClassCompletion}
          storageWarning={storageWarning}
          onRegisterStudent={handleRegisterStudent}
          onUpdateMigratedIdentity={handleUpdateMigratedIdentity}
          onSelectStudent={handleSelectStudent}
          onDeleteStudent={handleDeleteStudent}
          onOpenTeacherDashboard={() => setShowTeacherDashboard(true)}
          onClose={
            activeProfile && !needsClassCompletion
              ? () => {
                  setShowStudentModal(false);
                  setIsInitialWelcome(false);
                }
              : undefined
          }
        />
      )}

      {/* Teacher Dashboard (PIN Protected Prototype) */}
      {showTeacherDashboard && (
        <TeacherDashboardModal
          profiles={store.profiles}
          onClose={() => setShowTeacherDashboard(false)}
        />
      )}
    </div>
  );
}
