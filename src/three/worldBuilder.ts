import * as THREE from 'three';
import { MISSION_TOPICS } from '../data/sejarahBab1';
import { PortalId } from '../types/game';
import { WorldTextures } from './textures';
import { createGuideCharacter, GuideRig } from './historicalCharacters';

export interface CircleCollider {
  x: number;
  z: number;
  radius: number;
}

export interface PortalObject {
  id: PortalId;
  group: THREE.Group;
  position: THREE.Vector3;
  vortexMat: THREE.ShaderMaterial;
  iconGroup: THREE.Group;
  ringGroup: THREE.Group;
  completionBeacon: THREE.Mesh;
  color: string;
}

export interface ChestObject {
  id: string;
  group: THREE.Group;
  lidGroup: THREE.Group;
  glowMesh: THREE.Mesh;
  position: THREE.Vector3;
  opened: boolean;
  openAnim: number;
}

export interface CrystalObject {
  id: string;
  group: THREE.Group;
  shardGroup: THREE.Group;
  position: THREE.Vector3;
  collected: boolean;
  baseY: number;
}

export interface CoinObject {
  id: string;
  mesh: THREE.Group;
  position: THREE.Vector3;
  collected: boolean;
  baseY: number;
}

export interface TreeSway {
  canopy: THREE.Group;
  phase: number;
  speed: number;
}

export interface WaterfallPiece {
  mesh: THREE.Mesh;
  baseY: number;
  speed: number;
  phase: number;
}

export interface FloatingIsland {
  group: THREE.Group;
  baseY: number;
  phase: number;
}

export interface BuiltWorld {
  colliders: CircleCollider[];
  portals: PortalObject[];
  chests: ChestObject[];
  crystals: CrystalObject[];
  coins: CoinObject[];
  guide: GuideRig;
  guidePosition: THREE.Vector3;
  trees: TreeSway[];
  waterfallPieces: WaterfallPiece[];
  waterfallFoam: THREE.Mesh[];
  floatingIslands: FloatingIsland[];
  waterMesh: THREE.Mesh;
  clouds: THREE.Group[];
  update: (elapsed: number, delta: number, guideTalking?: boolean) => void;
}

export function groundHeightAt(x: number, z: number): number {
  const r = Math.hypot(x, z);
  // Central Stone Plaza stepped elevation
  if (r <= 8.5) return 0.28;
  if (r <= 9.6) return 0.14;

  // Slightly raised pads under each of the 8 portals
  for (const topic of MISSION_TOPICS) {
    const dx = x - topic.position.x;
    const dz = z - topic.position.z;
    const d = Math.hypot(dx, dz);
    if (d <= 3.1) return 0.25;
    if (d <= 4.1) return 0.12;
  }

  // Wooden bridge over the lagoon stream near (20.5, -9.5)
  if (x >= 17.5 && x <= 23.5 && z >= -11.5 && z <= -7.5) {
    return 0.45;
  }

  // Main island terrain radius
  if (r <= 34.5) return 0;
  // Gentle sandy shore slope into water
  if (r <= 37.5) {
    const t = (r - 34.5) / 3.0;
    return -t * 1.1;
  }
  return -1.4;
}

function createVortexShader(colorHex: string): THREE.ShaderMaterial {
  const c = new THREE.Color(colorHex);
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: c },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform vec3 uColor;

      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float r = length(p);
        float angle = atan(p.y, p.x);
        float swirl = sin(angle * 5.0 - r * 12.0 + uTime * 3.8) * 0.5 + 0.5;
        float ring = sin(r * 16.0 - uTime * 4.5) * 0.5 + 0.5;
        float core = smoothstep(0.95, 0.15, r);
        vec3 bright = mix(uColor, vec3(1.0, 1.0, 1.0), 0.35 * swirl + 0.35 * (1.0 - r));
        float alpha = clamp((0.55 + 0.4 * swirl * ring) * smoothstep(1.0, 0.72, r), 0.0, 0.95);
        gl_FragColor = vec4(bright * (0.85 + 0.45 * core), alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

function createPortalIcon(
  iconName: string,
  colorHex: string,
): THREE.Group {
  const group = new THREE.Group();
  const mainMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    emissive: new THREE.Color(colorHex),
    emissiveIntensity: 0.35,
    roughness: 0.25,
    metalness: 0.55,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.25,
    metalness: 0.85,
  });
  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.4,
  });

  switch (iconName) {
    case 'book': {
      // Open ancient book
      const leftPage = new THREE.Mesh(
        new THREE.BoxGeometry(0.62, 0.72, 0.12),
        whiteMat,
      );
      leftPage.position.set(-0.28, 0, 0.08);
      leftPage.rotation.y = 0.35;
      const rightPage = new THREE.Mesh(
        new THREE.BoxGeometry(0.62, 0.72, 0.12),
        whiteMat,
      );
      rightPage.position.set(0.28, 0, 0.08);
      rightPage.rotation.y = -0.35;
      const spine = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.78, 0.16),
        mainMat,
      );
      group.add(leftPage, rightPage, spine);
      break;
    }
    case 'users': {
      // Three scholar bust silhouettes
      [-0.36, 0, 0.36].forEach((offsetX, idx) => {
        const h = idx === 1 ? 0.5 : 0.4;
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(0.26, h, 0.22),
          idx === 1 ? goldMat : mainMat,
        );
        body.position.set(offsetX, -0.1, idx === 1 ? 0.08 : -0.05);
        const head = new THREE.Mesh(
          new THREE.BoxGeometry(0.22, 0.22, 0.22),
          whiteMat,
        );
        head.position.set(offsetX, h * 0.5 + 0.05, idx === 1 ? 0.08 : -0.05);
        group.add(body, head);
      });
      break;
    }
    case 'clock': {
      // Hourglass / Chronometer
      const topCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.36, 0.45, 6),
        mainMat,
      );
      topCone.rotation.x = Math.PI;
      topCone.position.y = 0.24;
      const botCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.36, 0.45, 6),
        mainMat,
      );
      botCone.position.y = -0.24;
      const topCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, 0.08, 8),
        goldMat,
      );
      topCap.position.y = 0.48;
      const botCap = topCap.clone();
      botCap.position.y = -0.48;
      group.add(topCone, botCone, topCap, botCap);
      break;
    }
    case 'scroll': {
      // Batu Bersurat / Ancient Scroll
      const slab = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.86, 0.18),
        mainMat,
      );
      const topRod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 0.9, 10),
        goldMat,
      );
      topRod.rotation.z = Math.PI / 2;
      topRod.position.y = 0.44;
      const botRod = topRod.clone();
      botRod.position.y = -0.44;
      group.add(slab, topRod, botRod);
      break;
    }
    case 'search': {
      // Golden Magnifying Glass
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.34, 0.08, 10, 20),
        goldMat,
      );
      ring.position.set(-0.08, 0.14, 0);
      const lens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16),
        mainMat,
      );
      lens.rotation.x = Math.PI / 2;
      lens.position.copy(ring.position);
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.09, 0.5, 8),
        mainMat,
      );
      handle.position.set(0.24, -0.22, 0);
      handle.rotation.z = Math.PI / 4;
      group.add(ring, lens, handle);
      break;
    }
    case 'git-branch': {
      // Cause & Effect interlocking rings
      const r1 = new THREE.Mesh(
        new THREE.TorusGeometry(0.3, 0.09, 10, 18),
        mainMat,
      );
      r1.position.set(-0.18, 0.1, 0);
      const r2 = new THREE.Mesh(
        new THREE.TorusGeometry(0.3, 0.09, 10, 18),
        goldMat,
      );
      r2.position.set(0.18, -0.1, 0);
      r2.rotation.y = Math.PI / 2;
      group.add(r1, r2);
      break;
    }
    case 'eye': {
      // Prism of Interpretation
      const prism = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.45, 0),
        mainMat,
      );
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.05, 8, 24),
        goldMat,
      );
      ring.rotation.x = Math.PI / 3;
      group.add(prism, ring);
      break;
    }
    default: {
      // Crown of Heritage
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.36, 0.28, 8),
        goldMat,
      );
      base.position.y = -0.12;
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2;
        const spike = new THREE.Mesh(
          new THREE.ConeGeometry(0.13, 0.36, 4),
          i % 2 === 0 ? goldMat : mainMat,
        );
        spike.position.set(Math.cos(ang) * 0.3, 0.16, Math.sin(ang) * 0.3);
        group.add(spike);
      }
      const orb = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.2, 0),
        mainMat,
      );
      orb.position.y = 0.26;
      group.add(base, orb);
      break;
    }
  }

  return group;
}

function buildAncientPavilion(
  textures: WorldTextures,
  roofColor: number,
  width = 5.4,
  depth = 5.4,
): THREE.Group {
  const group = new THREE.Group();

  const stoneMat = new THREE.MeshStandardMaterial({
    map: textures.ancientStone,
    roughness: 0.85,
    metalness: 0.06,
  });
  const woodMat = new THREE.MeshStandardMaterial({
    map: textures.wood,
    roughness: 0.78,
    metalness: 0.05,
  });
  const roofMat = new THREE.MeshStandardMaterial({
    map: textures.thatch,
    color: roofColor,
    roughness: 0.85,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.25,
    metalness: 0.85,
  });

  // Stepped stone foundation
  const base1 = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.8, 0.35, depth + 0.8),
    stoneMat,
  );
  base1.position.y = 0.175;
  base1.receiveShadow = true;
  base1.castShadow = true;
  group.add(base1);

  const base2 = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.3, depth),
    stoneMat,
  );
  base2.position.y = 0.5;
  base2.receiveShadow = true;
  group.add(base2);

  // 4 Timber corner pillars
  const px = width * 0.42;
  const pz = depth * 0.42;
  const corners = [
    [-px, -pz],
    [px, -pz],
    [-px, pz],
    [px, pz],
  ];
  corners.forEach(([cx, cz]) => {
    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 2.7, 0.45),
      woodMat,
    );
    pillar.position.set(cx, 1.95, cz);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    group.add(pillar);

    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.26, 0.62),
      stoneMat,
    );
    plinth.position.set(cx, 0.78, cz);
    group.add(plinth);
  });

  // Tiered Nusantara Roof
  const roof1 = new THREE.Mesh(
    new THREE.ConeGeometry(width * 0.82, 1.65, 4),
    roofMat,
  );
  roof1.rotation.y = Math.PI / 4;
  roof1.position.y = 4.05;
  roof1.castShadow = true;
  group.add(roof1);

  const roof2 = new THREE.Mesh(
    new THREE.ConeGeometry(width * 0.52, 1.25, 4),
    roofMat,
  );
  roof2.rotation.y = Math.PI / 4;
  roof2.position.y = 5.1;
  roof2.castShadow = true;
  group.add(roof2);

  // Golden finial
  const finial = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.26, 0),
    goldMat,
  );
  finial.position.y = 5.88;
  group.add(finial);

  // Hanging lantern inside pavilion
  const lantern = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.52, 0.42),
    new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.75,
      roughness: 0.3,
    }),
  );
  lantern.position.y = 2.85;
  group.add(lantern);

  return group;
}

function buildBlockyTree(
  style: 'banyan' | 'palm',
  textures: WorldTextures,
  scale = 1,
): { group: THREE.Group; canopy: THREE.Group } {
  const group = new THREE.Group();
  const canopy = new THREE.Group();

  const trunkMat = new THREE.MeshStandardMaterial({
    map: textures.wood,
    color: style === 'palm' ? 0xb47b48 : 0x855326,
    roughness: 0.9,
  });

  if (style === 'palm') {
    // Segmented curved blocky palm trunk
    for (let i = 0; i < 5; i++) {
      const seg = new THREE.Mesh(
        new THREE.BoxGeometry(0.48 - i * 0.03, 0.85, 0.48 - i * 0.03),
        trunkMat,
      );
      seg.position.set(i * 0.14, 0.42 + i * 0.78, 0);
      seg.rotation.z = -0.07 * i;
      seg.castShadow = true;
      group.add(seg);
    }
    canopy.position.set(0.6, 4.2, 0);
    const frondMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.7,
    });
    for (let i = 0; i < 6; i++) {
      const ang = (i * Math.PI * 2) / 6;
      const frond = new THREE.Mesh(
        new THREE.BoxGeometry(1.75, 0.16, 0.55),
        frondMat,
      );
      frond.position.set(Math.cos(ang) * 0.8, 0.05, Math.sin(ang) * 0.8);
      frond.rotation.y = -ang;
      frond.rotation.z = -0.22;
      frond.castShadow = true;
      canopy.add(frond);
    }
    // Coconuts
    const cocoMat = new THREE.MeshStandardMaterial({
      color: 0x713f12,
      roughness: 0.8,
    });
    for (let c = 0; c < 3; c++) {
      const coco = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.24), cocoMat);
      coco.position.set(Math.cos(c * 2.1) * 0.25, -0.18, Math.sin(c * 2.1) * 0.25);
      canopy.add(coco);
    }
  } else {
    // Lush Minecraft/Roblox style layered canopy tree
    const trunk = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 2.5, 0.7),
      trunkMat,
    );
    trunk.position.y = 1.25;
    trunk.castShadow = true;
    group.add(trunk);

    const rootFlare = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.4, 1.05),
      trunkMat,
    );
    rootFlare.position.y = 0.2;
    group.add(rootFlare);

    canopy.position.y = 2.6;
    const leafColors = [0x16a34a, 0x22c55e, 0x4ade80];
    const layer1 = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 1.15, 2.6),
      new THREE.MeshStandardMaterial({ color: leafColors[0], roughness: 0.75 }),
    );
    layer1.position.y = 0.45;
    layer1.castShadow = true;
    layer1.receiveShadow = true;

    const layer2 = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.95, 1.9),
      new THREE.MeshStandardMaterial({ color: leafColors[1], roughness: 0.72 }),
    );
    layer2.position.y = 1.35;
    layer2.castShadow = true;

    const layer3 = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.7, 1.1),
      new THREE.MeshStandardMaterial({ color: leafColors[2], roughness: 0.68 }),
    );
    layer3.position.y = 2.05;
    layer3.castShadow = true;

    // Tropical fruit / blossom accents
    const blossom = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.25, 0.25),
      new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.5 }),
    );
    blossom.position.set(1.28, 0.4, 0.5);
    const blossom2 = blossom.clone();
    blossom2.position.set(-1.1, 0.6, -0.7);

    canopy.add(layer1, layer2, layer3, blossom, blossom2);
  }

  group.add(canopy);
  group.scale.setScalar(scale);
  return { group, canopy };
}

function buildTreasureChest(
  id: string,
  x: number,
  z: number,
  rotY: number,
  textures: WorldTextures,
  initiallyOpened: boolean,
): ChestObject {
  const group = new THREE.Group();
  const gy = groundHeightAt(x, z);
  group.position.set(x, gy, z);
  group.rotation.y = rotY;

  const woodMat = new THREE.MeshStandardMaterial({
    map: textures.wood,
    color: 0xb45309,
    roughness: 0.7,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.22,
    metalness: 0.88,
  });

  // Lower box
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.65, 0.9), woodMat);
  body.position.y = 0.325;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Gold straps
  [-0.48, 0.48].forEach((sx) => {
    const strap = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.68, 0.94),
      goldMat,
    );
    strap.position.set(sx, 0.34, 0);
    group.add(strap);
  });

  // Gold pile inside
  const goldPile = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 0.16, 0.7),
    new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.35,
      metalness: 0.9,
      roughness: 0.2,
    }),
  );
  goldPile.position.y = 0.62;
  group.add(goldPile);

  // Hinged Lid
  const lidGroup = new THREE.Group();
  lidGroup.position.set(0, 0.65, -0.45);
  const lidMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.32, 0.34, 0.92),
    woodMat,
  );
  lidMesh.position.set(0, 0.17, 0.45);
  lidMesh.castShadow = true;
  lidGroup.add(lidMesh);

  const lock = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.28, 0.12),
    goldMat,
  );
  lock.position.set(0, 0.04, 0.92);
  lidGroup.add(lock);

  if (initiallyOpened) {
    lidGroup.rotation.x = -1.15;
  }
  group.add(lidGroup);

  // Floating subtle glow crystal marker above unopened chests
  const glowMesh = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.18, 0),
    new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    }),
  );
  glowMesh.position.y = 1.45;
  glowMesh.visible = !initiallyOpened;
  group.add(glowMesh);

  return {
    id,
    group,
    lidGroup,
    glowMesh,
    position: new THREE.Vector3(x, gy, z),
    opened: initiallyOpened,
    openAnim: initiallyOpened ? 1 : 0,
  };
}

export function buildAncientWorld(
  scene: THREE.Scene,
  textures: WorldTextures,
  isSoftwareGl: boolean,
  openedChestIds: string[],
  collectedCrystalIds: string[],
  completedMissionIds: PortalId[],
): BuiltWorld {
  const colliders: CircleCollider[] = [];
  const portals: PortalObject[] = [];
  const chests: ChestObject[] = [];
  const crystals: CrystalObject[] = [];
  const coins: CoinObject[] = [];
  const trees: TreeSway[] = [];
  const waterfallPieces: WaterfallPiece[] = [];
  const waterfallFoam: THREE.Mesh[] = [];
  const floatingIslands: FloatingIsland[] = [];
  const clouds: THREE.Group[] = [];

  // 1. Surrounding Sparkling Ocean
  const waterMat = new THREE.MeshStandardMaterial({
    map: textures.water,
    color: 0x38bdf8,
    roughness: 0.25,
    metalness: 0.15,
  });
  const waterMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(170, 170, 0.4, 48),
    waterMat,
  );
  waterMesh.position.y = -1.35;
  waterMesh.receiveShadow = true;
  scene.add(waterMesh);

  // 2. Main Village Island Base (Sandy Beach + Lush Grass Plateau)
  const sandMat = new THREE.MeshStandardMaterial({
    color: 0xfde68a,
    roughness: 0.9,
  });
  const beachDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(36.2, 38.5, 1.5, 48),
    sandMat,
  );
  beachDisc.position.y = -0.82;
  beachDisc.receiveShadow = true;
  scene.add(beachDisc);

  const grassMat = new THREE.MeshStandardMaterial({
    map: textures.grass,
    roughness: 0.88,
    metalness: 0.02,
  });
  const islandTop = new THREE.Mesh(
    new THREE.CylinderGeometry(34.5, 35.6, 1.4, 48),
    grassMat,
  );
  islandTop.position.y = -0.7;
  islandTop.receiveShadow = true;
  scene.add(islandTop);

  // 3. Central Ancient Stone Plaza (Stepped)
  const cobbleMat = new THREE.MeshStandardMaterial({
    map: textures.cobble,
    roughness: 0.8,
    metalness: 0.06,
  });
  const plazaStep1 = new THREE.Mesh(
    new THREE.CylinderGeometry(9.6, 10.0, 0.28, 32),
    cobbleMat,
  );
  plazaStep1.position.y = 0.0;
  plazaStep1.receiveShadow = true;
  scene.add(plazaStep1);

  const plazaStep2 = new THREE.Mesh(
    new THREE.CylinderGeometry(8.5, 8.8, 0.28, 32),
    cobbleMat,
  );
  plazaStep2.position.y = 0.14;
  plazaStep2.receiveShadow = true;
  scene.add(plazaStep2);

  // Central Compass Sun Medallion on Plaza floor
  const medallion = new THREE.Mesh(
    new THREE.RingGeometry(2.0, 2.8, 8),
    new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.35,
      metalness: 0.65,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
  );
  medallion.rotation.x = -Math.PI / 2;
  medallion.position.y = 0.295;
  scene.add(medallion);

  // 4. Cobblestone Radiating Pathways to all 8 Portals
  MISSION_TOPICS.forEach((topic) => {
    const angle = Math.atan2(topic.position.x, topic.position.z);
    const pathLen = 14.5;
    const pathMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.08, pathLen),
      cobbleMat,
    );
    pathMesh.position.set(
      Math.sin(angle) * 16.2,
      0.02,
      Math.cos(angle) * 16.2,
    );
    pathMesh.rotation.y = angle;
    pathMesh.receiveShadow = true;
    scene.add(pathMesh);
  });

  // 5. Ancient Village Buildings (4 distinct Nusantara heritage structures)
  const buildings = [
    { x: 11.2, z: -10.5, rot: -Math.PI / 4, color: 0xb45309, w: 5.2, d: 5.2 },
    { x: -11.5, z: -10.5, rot: Math.PI / 4, color: 0x0f766e, w: 4.8, d: 4.8 },
    { x: -11.5, z: 11.2, rot: (Math.PI * 3) / 4, color: 0x9f1239, w: 5.0, d: 4.6 },
    { x: 11.5, z: 11.2, rot: (-Math.PI * 3) / 4, color: 0x4338ca, w: 4.6, d: 4.6 },
  ];
  buildings.forEach((b) => {
    const pav = buildAncientPavilion(textures, b.color, b.w, b.d);
    pav.position.set(b.x, 0, b.z);
    pav.rotation.y = b.rot;
    scene.add(pav);
    // Corner pillar colliders so player doesn't walk through pillars (can walk inside center!)
    const px = b.w * 0.42;
    const pz = b.d * 0.42;
    const cos = Math.cos(b.rot);
    const sin = Math.sin(b.rot);
    [
      [-px, -pz],
      [px, -pz],
      [-px, pz],
      [px, pz],
    ].forEach(([lx, lz]) => {
      const wx = b.x + lx * cos + lz * sin;
      const wz = b.z - lx * sin + lz * cos;
      colliders.push({ x: wx, z: wz, radius: 0.65 });
    });
  });

  // Central Relic Pedestal inside Muzium Batu Bersurat (-11.5, -10.5)
  const batuSlab = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 1.6, 0.35),
    new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.7,
      emissive: 0x14b8a6,
      emissiveIntensity: 0.18,
    }),
  );
  batuSlab.position.set(-11.5, 1.4, -10.5);
  batuSlab.rotation.y = Math.PI / 4;
  batuSlab.castShadow = true;
  scene.add(batuSlab);
  colliders.push({ x: -11.5, z: -10.5, radius: 0.9 });

  // 6. Animated Waterfall Cliff, Lagoon Pool & Wooden Bridge
  const cliffGroup = new THREE.Group();
  cliffGroup.position.set(28.5, 0, -10.5);
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.9,
  });
  const darkRockMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.92,
  });

  // Tiered blocky cliff
  const cBlock1 = new THREE.Mesh(new THREE.BoxGeometry(6.5, 4.5, 7.5), rockMat);
  cBlock1.position.set(2.2, 2.25, 0);
  cBlock1.castShadow = true;
  cBlock1.receiveShadow = true;
  const cBlock2 = new THREE.Mesh(new THREE.BoxGeometry(5.0, 7.2, 5.8), darkRockMat);
  cBlock2.position.set(3.2, 3.6, -0.4);
  cBlock2.castShadow = true;
  const cGrass = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.6, 6.0), grassMat);
  cGrass.position.set(3.2, 7.4, -0.4);
  cliffGroup.add(cBlock1, cBlock2, cGrass);

  // Waterfall cascading strips
  const wfMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.35,
    roughness: 0.15,
    transparent: true,
    opacity: 0.88,
  });
  for (let i = 0; i < 6; i++) {
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 1.8, 0.45),
      wfMat,
    );
    const by = 1.2 + (i % 3) * 2.1;
    strip.position.set(-1.1, by, -1.0 + Math.floor(i / 2) * 1.0);
    cliffGroup.add(strip);
    waterfallPieces.push({
      mesh: strip,
      baseY: by,
      speed: 3.4 + (i % 2) * 0.6,
      phase: i * 1.1,
    });
  }
  // Top stream lip
  const topStream = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.3, 2.8),
    wfMat,
  );
  topStream.position.set(0.1, 7.25, 0);
  cliffGroup.add(topStream);

  // Foam blocks at splash base
  const foamMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    emissive: 0xbae6fd,
    emissiveIntensity: 0.3,
    roughness: 0.4,
  });
  for (let f = 0; f < 5; f++) {
    const foam = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.45, 0.65),
      foamMat,
    );
    foam.position.set(-1.6 - (f % 2) * 0.5, 0.2, -1.2 + f * 0.65);
    cliffGroup.add(foam);
    waterfallFoam.push(foam);
  }
  scene.add(cliffGroup);
  colliders.push({ x: 30.2, z: -10.5, radius: 4.0 });

  // Lagoon Pool & Wooden Bridge
  const lagoonPool = new THREE.Mesh(
    new THREE.CylinderGeometry(5.6, 5.6, 0.16, 24),
    new THREE.MeshStandardMaterial({
      map: textures.water,
      color: 0x22d3ee,
      roughness: 0.2,
      metalness: 0.15,
    }),
  );
  lagoonPool.position.set(22.5, 0.02, -9.8);
  lagoonPool.receiveShadow = true;
  scene.add(lagoonPool);

  // Wooden Bridge over the lagoon at (20.5, -9.5)
  const bridgeGroup = new THREE.Group();
  bridgeGroup.position.set(20.5, 0.35, -9.5);
  const bridgeMat = new THREE.MeshStandardMaterial({
    map: textures.wood,
    roughness: 0.78,
  });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.2, 3.6), bridgeMat);
  deck.castShadow = true;
  deck.receiveShadow = true;
  bridgeGroup.add(deck);
  [-1.65, 1.65].forEach((rz) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.16, 0.16), bridgeMat);
    rail.position.set(0, 0.55, rz);
    bridgeGroup.add(rail);
    [-2.5, 0, 2.5].forEach((px) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.7, 0.22), bridgeMat);
      post.position.set(px, 0.35, rz);
      bridgeGroup.add(post);
    });
  });
  scene.add(bridgeGroup);

  // 7. Eight Towering Colourful Mission Portals
  MISSION_TOPICS.forEach((topic) => {
    const portalGroup = new THREE.Group();
    const gy = groundHeightAt(topic.position.x, topic.position.z);
    portalGroup.position.set(topic.position.x, gy, topic.position.z);
    // Face toward the center of the village plaza!
    const lookAngle = Math.atan2(-topic.position.x, -topic.position.z);
    portalGroup.rotation.y = lookAngle;

    const stoneMat = new THREE.MeshStandardMaterial({
      map: textures.ancientStone,
      roughness: 0.82,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(topic.colorHex),
      emissive: new THREE.Color(topic.colorHex),
      emissiveIntensity: 0.35,
      roughness: 0.3,
      metalness: 0.5,
    });

    // Stepped stone platform base
    const basePlat = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.6, 0.35, 8),
      stoneMat,
    );
    basePlat.position.y = -0.1;
    basePlat.receiveShadow = true;
    portalGroup.add(basePlat);

    // Left & Right Pillars
    [-2.0, 2.0].forEach((px) => {
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 4.4, 0.9),
        stoneMat,
      );
      pillar.position.set(px, 2.2, 0);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      portalGroup.add(pillar);

      const runeBand = new THREE.Mesh(
        new THREE.BoxGeometry(0.98, 0.35, 0.98),
        accentMat,
      );
      runeBand.position.set(px, 2.4, 0);
      portalGroup.add(runeBand);

      const cap = new THREE.Mesh(
        new THREE.BoxGeometry(1.15, 0.4, 1.15),
        stoneMat,
      );
      cap.position.set(px, 4.45, 0);
      portalGroup.add(cap);
    });

    // Lintel Arch Top
    const lintel = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.8, 1.05),
      stoneMat,
    );
    lintel.position.y = 4.9;
    lintel.castShadow = true;
    portalGroup.add(lintel);

    // Swirling Portal Energy Core
    const vortexMat = createVortexShader(topic.colorHex);
    const vortexMesh = new THREE.Mesh(
      new THREE.CircleGeometry(1.65, 32),
      vortexMat,
    );
    vortexMesh.position.y = 2.45;
    portalGroup.add(vortexMesh);

    // Orbiting Rune Ring
    const ringGroup = new THREE.Group();
    ringGroup.position.y = 2.45;
    for (let r = 0; r < 6; r++) {
      const ang = (r * Math.PI * 2) / 6;
      const runeShard = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.18, 0),
        accentMat,
      );
      runeShard.position.set(Math.cos(ang) * 1.95, Math.sin(ang) * 1.95, 0);
      ringGroup.add(runeShard);
    }
    portalGroup.add(ringGroup);

    // Floating 3D Icon Sculpture above the Arch
    const iconGroup = createPortalIcon(topic.iconName, topic.colorHex);
    iconGroup.position.y = 6.2;
    portalGroup.add(iconGroup);

    // Completion Golden Beacon Crystal (lights up brightly when completed)
    const isCompleted = completedMissionIds.includes(topic.id);
    const completionBeacon = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.32, 0),
      new THREE.MeshStandardMaterial({
        color: isCompleted ? 0xfacc15 : 0x475569,
        emissive: isCompleted ? 0xf59e0b : 0x000000,
        emissiveIntensity: isCompleted ? 0.9 : 0,
        roughness: 0.2,
        metalness: 0.8,
      }),
    );
    completionBeacon.position.set(0, 5.45, 0.55);
    portalGroup.add(completionBeacon);

    scene.add(portalGroup);

    // Colliders for left & right portal pillars only (player can walk right into the vortex!)
    const cos = Math.cos(lookAngle);
    const sin = Math.sin(lookAngle);
    [-2.0, 2.0].forEach((lx) => {
      colliders.push({
        x: topic.position.x + lx * cos,
        z: topic.position.z - lx * sin,
        radius: 0.72,
      });
    });

    portals.push({
      id: topic.id,
      group: portalGroup,
      position: new THREE.Vector3(topic.position.x, gy, topic.position.z),
      vortexMat,
      iconGroup,
      ringGroup,
      completionBeacon,
      color: topic.colorHex,
    });
  });

  // 8. Friendly Historical Guide Character (Tok Guru Sejarah) near Central Plaza
  const guidePos = new THREE.Vector3(-4.2, groundHeightAt(-4.2, -4.5), -4.5);
  const guide = createGuideCharacter(textures.contactShadow);
  guide.root.position.copy(guidePos);
  guide.root.rotation.y = Math.atan2(4.2, 4.5);
  scene.add(guide.root);
  colliders.push({ x: guidePos.x, z: guidePos.z, radius: 0.75 });

  // 9. Animated Lush Trees & Tropical Palms around the Village Perimeter
  const treeSpecs: Array<{
    x: number;
    z: number;
    style: 'banyan' | 'palm';
    scale: number;
  }> = [
    { x: -16, z: -22, style: 'banyan', scale: 1.15 },
    { x: -24, z: -12, style: 'palm', scale: 1.05 },
    { x: -24, z: 12, style: 'banyan', scale: 1.1 },
    { x: -14, z: 24, style: 'palm', scale: 1.1 },
    { x: 14, z: 24, style: 'banyan', scale: 1.15 },
    { x: 24, z: 12, style: 'palm', scale: 1.05 },
    { x: 16, z: -24, style: 'palm', scale: 1.1 },
    { x: -8, z: -28, style: 'banyan', scale: 1.0 },
    { x: 8, z: -28, style: 'palm', scale: 0.95 },
    { x: -29, z: -5, style: 'banyan', scale: 1.2 },
    { x: -28, z: 6, style: 'palm', scale: 1.05 },
    { x: 29, z: 6, style: 'banyan', scale: 1.15 },
    { x: 8, z: 29, style: 'palm', scale: 1.0 },
    { x: -8, z: 29, style: 'banyan', scale: 1.08 },
    { x: 22, z: -22, style: 'palm', scale: 1.1 },
    { x: -22, z: 22, style: 'palm', scale: 1.0 },
  ];

  treeSpecs.forEach((spec, idx) => {
    const { group, canopy } = buildBlockyTree(spec.style, textures, spec.scale);
    group.position.set(spec.x, groundHeightAt(spec.x, spec.z), spec.z);
    group.rotation.y = (idx * 1.37) % (Math.PI * 2);
    scene.add(group);
    trees.push({
      canopy,
      phase: idx * 0.8,
      speed: 1.4 + (idx % 3) * 0.3,
    });
    colliders.push({ x: spec.x, z: spec.z, radius: 0.65 * spec.scale });
  });

  // 10. Interactive Treasure Chests (6 hidden around village landmarks)
  const chestSpots = [
    { id: 'chest-1', x: 11.2, z: -10.5, rot: -Math.PI / 4 }, // Inside Balai Ilmu
    { id: 'chest-2', x: -11.5, z: 11.2, rot: (Math.PI * 3) / 4 }, // Inside Pondok Pengembara
    { id: 'chest-3', x: 25.0, z: -14.2, rot: -1.1 }, // Near Waterfall
    { id: 'chest-4', x: -24.5, z: -15.5, rot: 0.9 }, // West grove
    { id: 'chest-5', x: 15.0, z: 22.0, rot: -2.2 }, // South-east palm grove
    { id: 'chest-6', x: 6.5, z: 6.2, rot: -2.4 }, // Plaza edge
  ];
  chestSpots.forEach((c) => {
    const chest = buildTreasureChest(
      c.id,
      c.x,
      c.z,
      c.rot,
      textures,
      openedChestIds.includes(c.id),
    );
    scene.add(chest.group);
    chests.push(chest);
    colliders.push({ x: c.x, z: c.z, radius: 0.72 });
  });

  // 11. Glowing Crystals (8 collectible magical crystals + decorative plaza crystals)
  const crystalSpots = [
    { id: 'crys-1', x: 24.5, z: -7.5, color: 0x22d3ee },
    { id: 'crys-2', x: -14.5, z: -14.5, color: 0x34d399 },
    { id: 'crys-3', x: 14.5, z: 14.5, color: 0xa78bfa },
    { id: 'crys-4', x: -14.5, z: 14.5, color: 0xfb7185 },
    { id: 'crys-5', x: 14.5, z: -14.5, color: 0xfbbf24 },
    { id: 'crys-6', x: -29.0, z: 0, color: 0x2dd4bf },
    { id: 'crys-7', x: 0, z: 29.5, color: 0xf43f5e },
    { id: 'crys-8', x: 0, z: -29.5, color: 0xf59e0b },
  ];
  crystalSpots.forEach((cr) => {
    const collected = collectedCrystalIds.includes(cr.id);
    const group = new THREE.Group();
    const gy = groundHeightAt(cr.x, cr.z);
    group.position.set(cr.x, gy, cr.z);

    const shardGroup = new THREE.Group();
    const crysMat = new THREE.MeshPhysicalMaterial({
      color: cr.color,
      emissive: cr.color,
      emissiveIntensity: 0.55,
      roughness: 0.12,
      metalness: 0.1,
      clearcoat: 1.0,
      transmission: isSoftwareGl ? 0 : 0.45,
      transparent: true,
      opacity: isSoftwareGl ? 0.85 : 0.95,
    });
    const mainShard = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.45, 0),
      crysMat,
    );
    mainShard.scale.set(0.75, 1.45, 0.75);
    mainShard.castShadow = true;
    shardGroup.add(mainShard);

    for (let s = 0; s < 3; s++) {
      const ang = (s * Math.PI * 2) / 3;
      const mini = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.16, 0),
        crysMat,
      );
      mini.position.set(Math.cos(ang) * 0.58, -0.1, Math.sin(ang) * 0.58);
      shardGroup.add(mini);
    }

    shardGroup.position.y = 0.9;
    group.add(shardGroup);
    group.visible = !collected;
    scene.add(group);

    crystals.push({
      id: cr.id,
      group,
      shardGroup,
      position: new THREE.Vector3(cr.x, gy, cr.z),
      collected,
      baseY: 0.9,
    });
  });

  // 12. Collectible Spinning Gold Coins along pathways
  const coinMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xd97706,
    emissiveIntensity: 0.25,
    metalness: 0.88,
    roughness: 0.2,
  });
  for (let i = 0; i < 8; i++) {
    const topic = MISSION_TOPICS[i];
    const angle = Math.atan2(topic.position.x, topic.position.z);
    [12.5, 18.0].forEach((dist, stepIdx) => {
      const cx = Math.sin(angle) * dist;
      const cz = Math.cos(angle) * dist;
      const gy = groundHeightAt(cx, cz);
      const coinGroup = new THREE.Group();
      coinGroup.position.set(cx, gy + 0.75, cz);
      const disc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.32, 0.1, 14),
        coinMat,
      );
      disc.rotation.x = Math.PI / 2;
      disc.castShadow = true;
      coinGroup.add(disc);
      scene.add(coinGroup);

      coins.push({
        id: `coin-${i}-${stepIdx}`,
        mesh: coinGroup,
        position: new THREE.Vector3(cx, gy + 0.75, cz),
        collected: false,
        baseY: gy + 0.75,
      });
    });
  }

  // 13. Eight Mysterious Floating Islands on the Horizon (matching the 8 portals!)
  MISSION_TOPICS.forEach((topic, idx) => {
    const angle = Math.atan2(topic.position.x, topic.position.z);
    const dist = 62 + (idx % 2) * 7;
    const ix = Math.sin(angle) * dist;
    const iz = Math.cos(angle) * dist;
    const baseY = 7 + (idx % 3) * 2.5;

    const islGroup = new THREE.Group();
    islGroup.position.set(ix, baseY, iz);

    const earthCone = new THREE.Mesh(
      new THREE.ConeGeometry(5.5, 6.8, 6),
      darkRockMat,
    );
    earthCone.rotation.x = Math.PI;
    earthCone.position.y = -3.4;
    islGroup.add(earthCone);

    const topMeadow = new THREE.Mesh(
      new THREE.CylinderGeometry(5.8, 5.5, 1.1, 6),
      grassMat,
    );
    topMeadow.position.y = 0.2;
    islGroup.add(topMeadow);

    // Glowing island beacon pillar matching portal color
    const beacon = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.1, 0),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(topic.colorHex),
        emissive: new THREE.Color(topic.colorHex),
        emissiveIntensity: 0.7,
        roughness: 0.2,
      }),
    );
    beacon.position.y = 2.6;
    islGroup.add(beacon);

    // Mini blocky tree on floating island
    const miniTree = buildBlockyTree(idx % 2 === 0 ? 'banyan' : 'palm', textures, 0.85);
    miniTree.group.position.set(2.0, 0.75, -1.2);
    islGroup.add(miniTree.group);

    scene.add(islGroup);
    floatingIslands.push({
      group: islGroup,
      baseY,
      phase: idx * 0.9,
    });
  });

  // 14. Cheerful Blocky Clouds in the Sky
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.95,
    emissive: 0xe2e8f0,
    emissiveIntensity: 0.15,
  });
  for (let c = 0; c < 10; c++) {
    const cg = new THREE.Group();
    const ang = (c * Math.PI * 2) / 10;
    const dist = 42 + (c % 3) * 14;
    cg.position.set(
      Math.cos(ang) * dist,
      24 + (c % 3) * 3.5,
      Math.sin(ang) * dist,
    );
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.4, 3.2), cloudMat);
    const p2 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.8, 2.6), cloudMat);
    p2.position.set(0.8, 0.6, 0.2);
    cg.add(p1, p2);
    scene.add(cg);
    clouds.push(cg);
  }

  // Per-frame World Animation Update (Zero GC allocations)
  const update = (elapsed: number, delta: number, guideTalking = false) => {
    // Animate ocean water UV scroll
    textures.water.offset.x = (elapsed * 0.03) % 1;
    textures.water.offset.y = (elapsed * 0.02) % 1;

    // Animate 8 portals
    for (let i = 0; i < portals.length; i++) {
      const p = portals[i];
      p.vortexMat.uniforms.uTime.value = elapsed;
      p.ringGroup.rotation.z = elapsed * 0.85 + i;
      p.iconGroup.rotation.y = elapsed * 1.1 + i * 0.5;
      p.iconGroup.position.y = 6.2 + Math.sin(elapsed * 2.2 + i) * 0.18;
      p.completionBeacon.rotation.y = elapsed * 1.6;
    }

    // Animate Tok Guru Sejarah: friendly wave + expressive talking gestures when nearby
    if (guideTalking) {
      guide.rightArm.rotation.x = -0.75 + Math.sin(elapsed * 6.5) * 0.42;
      guide.rightArm.rotation.z = 0.25 + Math.cos(elapsed * 5.0) * 0.16;
      guide.leftArm.rotation.x = -0.65 + Math.cos(elapsed * 5.5) * 0.22;
      guide.head.rotation.y = Math.sin(elapsed * 2.6) * 0.16;
      guide.head.rotation.x = Math.sin(elapsed * 5.0) * 0.06;
      guide.mouthOpen.scale.y = 0.2 + Math.abs(Math.sin(elapsed * 12.0)) * 0.9;
    } else {
      guide.rightArm.rotation.x = -2.1 + Math.sin(elapsed * 5.0) * 0.35;
      guide.rightArm.rotation.z = 0.3 + Math.cos(elapsed * 4.5) * 0.22;
      guide.leftArm.rotation.x = -0.5;
      guide.head.rotation.y = Math.sin(elapsed * 0.9) * 0.22;
      guide.head.rotation.x = 0;
      guide.mouthOpen.scale.y = 0.05;
    }
    guide.markerMesh.position.y = 3.25 + Math.sin(elapsed * 2.8) * 0.14;
    guide.markerMesh.rotation.y = elapsed * 1.8;

    // Animate trees gently swaying
    for (let i = 0; i < trees.length; i++) {
      const t = trees[i];
      t.canopy.rotation.z = Math.sin(elapsed * t.speed + t.phase) * 0.045;
      t.canopy.rotation.x = Math.cos(elapsed * t.speed * 0.8 + t.phase) * 0.03;
    }

    // Animate waterfall cascade & foam
    for (let i = 0; i < waterfallPieces.length; i++) {
      const wf = waterfallPieces[i];
      const drop = ((elapsed * wf.speed + wf.phase) % 6.2);
      wf.mesh.position.y = 7.0 - drop;
    }
    for (let i = 0; i < waterfallFoam.length; i++) {
      const fm = waterfallFoam[i];
      const s = 0.85 + Math.sin(elapsed * 5.0 + i * 1.3) * 0.25;
      fm.scale.set(s, s, s);
    }

    // Animate chests smoothly opening when triggered
    for (let i = 0; i < chests.length; i++) {
      const ch = chests[i];
      if (ch.opened && ch.openAnim < 1) {
        ch.openAnim = Math.min(1, ch.openAnim + delta * 3.5);
        ch.lidGroup.rotation.x = -1.15 * ch.openAnim;
      }
      if (!ch.opened) {
        ch.glowMesh.rotation.y = elapsed * 2.0;
        ch.glowMesh.position.y = 1.45 + Math.sin(elapsed * 3.0 + i) * 0.12;
      }
    }

    // Animate glowing crystals
    for (let i = 0; i < crystals.length; i++) {
      const cr = crystals[i];
      if (!cr.collected) {
        cr.shardGroup.rotation.y = elapsed * 1.4 + i;
        cr.shardGroup.position.y = cr.baseY + Math.sin(elapsed * 2.4 + i) * 0.16;
      }
    }

    // Animate coins
    for (let i = 0; i < coins.length; i++) {
      const cn = coins[i];
      if (!cn.collected) {
        cn.mesh.rotation.y = elapsed * 2.6 + i * 0.4;
        cn.mesh.position.y = cn.baseY + Math.sin(elapsed * 3.0 + i) * 0.12;
      }
    }

    // Animate distant floating islands & clouds
    for (let i = 0; i < floatingIslands.length; i++) {
      const isl = floatingIslands[i];
      isl.group.position.y = isl.baseY + Math.sin(elapsed * 0.8 + isl.phase) * 0.75;
    }
    for (let i = 0; i < clouds.length; i++) {
      clouds[i].rotation.y = elapsed * 0.02;
      clouds[i].position.x += Math.sin(elapsed * 0.15 + i) * 0.008;
    }
  };

  return {
    colliders,
    portals,
    chests,
    crystals,
    coins,
    guide,
    guidePosition: guidePos,
    trees,
    waterfallPieces,
    waterfallFoam,
    floatingIslands,
    waterMesh,
    clouds,
    update,
  };
}
