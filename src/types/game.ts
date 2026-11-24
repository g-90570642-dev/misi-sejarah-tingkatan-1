export type PortalId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type AvatarGender = 'boy' | 'girl';
export type HairStyleId =
  | 'spiky'
  | 'side-part'
  | 'bob'
  | 'ponytail'
  | 'curly'
  | 'hijab';
export type ShirtStyleId = 'explorer' | 'jacket' | 'kurung' | 'hoodie' | 'royal';
export type ShoeStyleId = 'sneakers' | 'boots' | 'sandals' | 'royal';
export type AccessoryId = 'safari-hat' | 'glasses' | 'headband' | 'crown' | 'none';
export type BackpackId = 'explorer-pack' | 'jet-scroll' | 'satchel' | 'none';
export type AvatarAnimState =
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'wave'
  | 'talk'
  | 'dance'
  | 'celebrate';

export interface AvatarConfig {
  gender: AvatarGender;
  skinTone: string;
  hairStyle: HairStyleId;
  hairColor: string;
  shirtStyle: ShirtStyleId;
  shirtColor: string;
  pantsColor: string;
  shoeStyle: ShoeStyleId;
  shoeColor: string;
  accessory: AccessoryId;
  backpack: BackpackId;
}

export interface StudyFact {
  title: string;
  summary: string;
  keyPoints: string[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  illustrationLabel?: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
}

export interface HiddenObjectItem {
  id: string;
  label: string;
  badge: string;
  fact: string;
  xPct: number;
  yPct: number;
  colorHex: string;
}

export interface MatchPair {
  id: string;
  leftTitle: string;
  rightTitle: string;
  explanation: string;
}

export interface ClassifyBucket {
  id: string;
  title: string;
  subtitle: string;
  colorHex: string;
}

export interface ClassifyItem {
  id: string;
  label: string;
  bucketId: string;
  hint: string;
  explanation: string;
}

export interface NpcDialogueCard {
  id: string;
  name: string;
  era: string;
  colorHex: string;
  quote: string;
  definition: string;
}

export interface ChronoEventItem {
  id: string;
  title: string;
  timeLabel: string;
  detail: string;
  order: number;
}

export interface DigTile {
  id: string;
  zoneLabel: string;
  methodTag: 'Bertulis' | 'Lisan' | 'Arkeologi';
  discoveryTitle: string;
  discoveryText: string;
}

export interface DetectiveCaseItem {
  id: string;
  caseTitle: string;
  sourceA: { label: string; text: string };
  sourceB: { label: string; text: string };
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
}

export interface MissionTopic {
  id: PortalId;
  title: string;
  islandName: string;
  worldTitle: string;
  subtitle: string;
  colorHex: string;
  accentBg: string;
  crystalName: string;
  iconName:
    | 'book'
    | 'users'
    | 'clock'
    | 'scroll'
    | 'search'
    | 'git-branch'
    | 'eye'
    | 'award';
  position: { x: number; z: number };
  mapCoords: { x: number; y: number };
  facts: StudyFact[];
  questions: QuizQuestion[];
}

export interface MissionProgress {
  completed: boolean;
  stars: number; // 0 to 3
  bestScore: number;
}

export interface PlayerProgress {
  playerName: string;
  playerClass: string;
  avatarColor: string;
  avatarConfig: AvatarConfig;
  points: number;
  coins: number;
  knowledgeCrystals: PortalId[];
  openedChests: string[];
  collectedCrystals: string[];
  achievements: string[];
  missions: Record<PortalId, MissionProgress>;
}

export interface StudentProfile extends PlayerProgress {
  id: string;
  createdAt: string;
  lastPlayedAt: string;
}

export interface StudentProfileStore {
  activeProfileId: string | null;
  profiles: StudentProfile[];
}

export interface AchievementDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  colorHex: string;
  iconName:
    | 'compass'
    | 'award'
    | 'gem'
    | 'clock'
    | 'search'
    | 'trophy'
    | 'coins'
    | 'star';
  checkUnlocked: (progress: PlayerProgress) => boolean;
  getProgressLabel: (progress: PlayerProgress) => string;
}

export type NearbyTarget =
  | { type: 'portal'; id: PortalId; label: string; color: string }
  | { type: 'chest'; id: string; label: string }
  | { type: 'guide'; id: 'tok-guru'; label: string }
  | null;
