import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export interface GuideRig {
  root: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  mouthOpen: THREE.Mesh;
  scrollMesh: THREE.Mesh;
  markerMesh: THREE.Group;
}

export type HistorianId =
  | 'herodotus'
  | 'eh-carr'
  | 'ibn-khaldun'
  | 'muhd-yusof'
  | 'khoo-kay-kim';

export interface HistorianRig {
  id: HistorianId;
  root: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  mouthOpen: THREE.Mesh;
}

function rBox(w: number, h: number, d: number, r = 0.06): RoundedBoxGeometry {
  return new RoundedBoxGeometry(
    w,
    h,
    d,
    2,
    Math.min(r, w * 0.24, h * 0.24, d * 0.24),
  );
}

function createSongketTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#0f766e';
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = '#fbbf24';
  for (let y = 0; y < 128; y += 16) {
    for (let x = 0; x < 128; x += 16) {
      ctx.fillRect(x + 6, y + 2, 4, 12);
      ctx.fillRect(x + 2, y + 6, 12, 4);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

function addExpressiveFace(
  head: THREE.Group,
  browColor: number,
  options?: { glasses?: boolean; beardColor?: number; mustache?: boolean },
): THREE.Mesh {
  const scleraMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
  const browMat = new THREE.MeshStandardMaterial({ color: browColor, roughness: 0.65 });

  [-0.17, 0.17].forEach((ex) => {
    const sclera = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.03), scleraMat);
    sclera.position.set(ex, 0.04, 0.365);
    const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.04), pupilMat);
    pupil.position.set(ex, 0.035, 0.37);
    const glint = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.045), scleraMat);
    glint.position.set(ex + 0.02, 0.065, 0.375);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.04), browMat);
    brow.position.set(ex, 0.16, 0.37);
    head.add(sclera, pupil, glint, brow);
  });

  if (options?.glasses) {
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.85,
      roughness: 0.2,
    });
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.32,
      roughness: 0.1,
    });
    [-0.17, 0.17].forEach((gx) => {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.02, 8, 16), frameMat);
      rim.position.set(gx, 0.04, 0.395);
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.09, 12), lensMat);
      lens.position.set(gx, 0.04, 0.39);
      head.add(rim, lens);
    });
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.025, 0.025), frameMat);
    bridge.position.set(0, 0.05, 0.395);
    head.add(bridge);
  }

  if (options?.beardColor !== undefined) {
    const bMat = new THREE.MeshStandardMaterial({
      color: options.beardColor,
      roughness: 0.8,
    });
    const beard = new THREE.Mesh(rBox(0.54, 0.34, 0.24, 0.07), bMat);
    beard.position.set(0, -0.25, 0.28);
    head.add(beard);
  } else if (options?.mustache) {
    const mMat = new THREE.MeshStandardMaterial({ color: browColor, roughness: 0.75 });
    const stache = new THREE.Mesh(rBox(0.32, 0.06, 0.06, 0.02), mMat);
    stache.position.set(0, -0.09, 0.38);
    head.add(stache);
  }

  const smile = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.04, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x9f1239, roughness: 0.5 }),
  );
  smile.position.set(0, -0.14, 0.375);
  head.add(smile);

  const mouthOpen = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.08, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.45 }),
  );
  mouthOpen.position.set(0, -0.16, 0.38);
  mouthOpen.scale.y = 0.05;
  head.add(mouthOpen);

  return mouthOpen;
}

export function createGuideCharacter(shadowTexture?: THREE.Texture): GuideRig {
  const root = new THREE.Group();
  const songketTex = createSongketTexture();

  const robeMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.55 });
  const songketMat = new THREE.MeshStandardMaterial({
    map: songketTex,
    roughness: 0.5,
    metalness: 0.18,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.25,
    metalness: 0.85,
  });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf3c19d, roughness: 0.62 });
  const songkokMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 });

  // Baju Melayu + Samping Songket
  const lowerSamping = new THREE.Mesh(rBox(0.9, 0.72, 0.54, 0.08), songketMat);
  lowerSamping.position.y = 0.46;
  lowerSamping.castShadow = true;
  root.add(lowerSamping);

  // Shoes
  [-0.2, 0.2].forEach((sx) => {
    const shoe = new THREE.Mesh(
      rBox(0.32, 0.18, 0.4, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 }),
    );
    shoe.position.set(sx, 0.09, 0.04);
    root.add(shoe);
  });

  const torso = new THREE.Mesh(rBox(0.86, 0.86, 0.5, 0.09), robeMat);
  torso.position.y = 1.24;
  torso.castShadow = true;
  root.add(torso);

  const sash = new THREE.Mesh(rBox(0.92, 0.16, 0.54, 0.05), goldMat);
  sash.position.y = 0.86;
  root.add(sash);

  const collar = new THREE.Mesh(rBox(0.56, 0.14, 0.52, 0.04), goldMat);
  collar.position.y = 1.66;
  root.add(collar);

  // Left Arm + Glowing Scroll
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.58, 1.56, 0);
  const lSleeve = new THREE.Mesh(rBox(0.28, 0.58, 0.3, 0.07), robeMat);
  lSleeve.position.y = -0.26;
  lSleeve.castShadow = true;
  const lHand = new THREE.Mesh(rBox(0.24, 0.2, 0.24, 0.06), skinMat);
  lHand.position.y = -0.62;
  leftArm.add(lSleeve, lHand);
  leftArm.rotation.x = -0.5;
  root.add(leftArm);

  const scrollMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.65, 10),
    new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.3,
      roughness: 0.45,
    }),
  );
  scrollMesh.position.set(-0.58, 1.15, 0.4);
  scrollMesh.rotation.z = Math.PI / 5;
  root.add(scrollMesh);

  // Right Arm (waves & gestures!)
  const rightArm = new THREE.Group();
  rightArm.position.set(0.58, 1.56, 0);
  const rSleeve = new THREE.Mesh(rBox(0.28, 0.58, 0.3, 0.07), robeMat);
  rSleeve.position.y = -0.26;
  rSleeve.castShadow = true;
  const rHand = new THREE.Mesh(rBox(0.24, 0.2, 0.24, 0.06), skinMat);
  rHand.position.y = -0.62;
  rightArm.add(rSleeve, rHand);
  root.add(rightArm);

  // Head with Songkok / Tengkolok, Spectacles, Friendly Beard
  const head = new THREE.Group();
  head.position.set(0, 2.08, 0);
  const headBox = new THREE.Mesh(rBox(0.76, 0.72, 0.72, 0.13), skinMat);
  headBox.castShadow = true;
  head.add(headBox);

  const mouthOpen = addExpressiveFace(head, 0xe2e8f0, {
    glasses: true,
    beardColor: 0xf1f5f9,
  });

  const songkok = new THREE.Mesh(rBox(0.8, 0.36, 0.8, 0.08), songkokMat);
  songkok.position.y = 0.44;
  songkok.castShadow = true;
  const band = new THREE.Mesh(rBox(0.82, 0.09, 0.82, 0.03), goldMat);
  band.position.y = 0.32;
  const crest = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), goldMat);
  crest.position.set(0, 0.46, 0.42);
  head.add(songkok, band, crest);

  root.add(head);

  // Floating Golden Guide Marker
  const markerMesh = new THREE.Group();
  markerMesh.position.y = 3.3;
  const diamond = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.24, 0),
    new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.65,
      roughness: 0.2,
      metalness: 0.6,
    }),
  );
  markerMesh.add(diamond);
  root.add(markerMesh);

  if (shadowTexture) {
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1.6),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
        opacity: 0.5,
      }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.03;
    root.add(shadow);
  }

  return {
    root,
    head,
    leftArm,
    rightArm,
    mouthOpen,
    scrollMesh,
    markerMesh,
  };
}

export function createHistorianNpc(id: HistorianId): HistorianRig {
  const root = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.85,
    roughness: 0.24,
  });

  // Palette & outfit parameters per historian
  const specs: Record<
    HistorianId,
    {
      skin: number;
      robe: number;
      accent: number;
      hair: number;
      glasses?: boolean;
      beard?: number;
      mustache?: boolean;
    }
  > = {
    herodotus: {
      skin: 0xf3c19d,
      robe: 0xf8fafc,
      accent: 0x10b981,
      hair: 0x451a03,
      beard: 0x451a03,
    },
    'eh-carr': {
      skin: 0xfde2c8,
      robe: 0x1e3a8a,
      accent: 0x0ea5e9,
      hair: 0x78350f,
      glasses: true,
      mustache: true,
    },
    'ibn-khaldun': {
      skin: 0xe5a97c,
      robe: 0x92400e,
      accent: 0xf59e0b,
      hair: 0x334155,
      beard: 0x475569,
    },
    'muhd-yusof': {
      skin: 0xc68642,
      robe: 0x4c1d95,
      accent: 0xa78bfa,
      hair: 0x1e293b,
      glasses: true,
    },
    'khoo-kay-kim': {
      skin: 0xf7c59f,
      robe: 0x9f1239,
      accent: 0xf43f5e,
      hair: 0xcbd5e1,
      glasses: true,
    },
  };

  const s = specs[id];
  const skinMat = new THREE.MeshStandardMaterial({ color: s.skin, roughness: 0.6 });
  const robeMat = new THREE.MeshStandardMaterial({ color: s.robe, roughness: 0.58 });
  const accentMat = new THREE.MeshStandardMaterial({ color: s.accent, roughness: 0.45 });
  const hairMat = new THREE.MeshStandardMaterial({ color: s.hair, roughness: 0.68 });

  // Lower body (robe or trousers)
  if (id === 'herodotus' || id === 'ibn-khaldun') {
    const skirt = new THREE.Mesh(rBox(0.84, 0.76, 0.5, 0.08), robeMat);
    skirt.position.y = 0.44;
    root.add(skirt);
    const hem = new THREE.Mesh(rBox(0.86, 0.14, 0.52, 0.04), accentMat);
    hem.position.y = 0.16;
    root.add(hem);
  } else {
    [-0.19, 0.19].forEach((lx) => {
      const leg = new THREE.Mesh(
        rBox(0.32, 0.66, 0.34, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.78 }),
      );
      leg.position.set(lx, 0.42, 0);
      const shoe = new THREE.Mesh(
        rBox(0.34, 0.16, 0.4, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x3f2e21, roughness: 0.7 }),
      );
      shoe.position.set(lx, 0.08, 0.04);
      root.add(leg, shoe);
    });
  }

  // Torso
  const torso = new THREE.Mesh(rBox(0.82, 0.84, 0.48, 0.09), robeMat);
  torso.position.y = 1.22;
  root.add(torso);

  if (id === 'herodotus') {
    // Diagonal Greek chiton drape
    const drape = new THREE.Mesh(rBox(0.86, 0.18, 0.52, 0.05), accentMat);
    drape.position.y = 1.28;
    drape.rotation.z = 0.55;
    root.add(drape);
  } else if (id === 'eh-carr') {
    // Shirt & tie
    const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.6, 0.06), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    shirt.position.set(0, 1.32, 0.23);
    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.08), accentMat);
    tie.position.set(0, 1.24, 0.24);
    root.add(shirt, tie);
  } else if (id === 'ibn-khaldun') {
    const trim = new THREE.Mesh(rBox(0.22, 0.82, 0.5, 0.04), goldMat);
    trim.position.set(0, 1.22, 0.01);
    root.add(trim);
  } else {
    const collar = new THREE.Mesh(rBox(0.46, 0.12, 0.5, 0.04), accentMat);
    collar.position.set(0, 1.62, 0);
    root.add(collar);
  }

  // Arms
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.56, 1.54, 0);
  const lMesh = new THREE.Mesh(rBox(0.26, 0.62, 0.28, 0.07), robeMat);
  lMesh.position.y = -0.28;
  const lHand = new THREE.Mesh(rBox(0.22, 0.18, 0.22, 0.06), skinMat);
  lHand.position.y = -0.62;
  leftArm.add(lMesh, lHand);
  root.add(leftArm);

  // Prop in left hand (scroll or book)
  const prop = new THREE.Mesh(
    id === 'eh-carr' || id === 'muhd-yusof'
      ? rBox(0.32, 0.42, 0.12, 0.03)
      : new THREE.CylinderGeometry(0.08, 0.08, 0.52, 10),
    id === 'herodotus'
      ? new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 })
      : goldMat,
  );
  prop.position.set(0, -0.62, 0.22);
  leftArm.add(prop);
  leftArm.rotation.x = -0.4;

  const rightArm = new THREE.Group();
  rightArm.position.set(0.56, 1.54, 0);
  const rMesh = new THREE.Mesh(rBox(0.26, 0.62, 0.28, 0.07), robeMat);
  rMesh.position.y = -0.28;
  const rHand = new THREE.Mesh(rBox(0.22, 0.18, 0.22, 0.06), skinMat);
  rHand.position.y = -0.62;
  rightArm.add(rMesh, rHand);
  root.add(rightArm);

  // Expressive Head + Unique Historical Headwear / Hair
  const head = new THREE.Group();
  head.position.set(0, 2.04, 0);
  const headBox = new THREE.Mesh(rBox(0.74, 0.7, 0.72, 0.13), skinMat);
  head.add(headBox);

  const mouthOpen = addExpressiveFace(head, s.hair, {
    glasses: s.glasses,
    beardColor: s.beard,
    mustache: s.mustache,
  });

  if (id === 'herodotus') {
    // Curly hair + Golden Laurel Wreath
    for (let i = -2; i <= 2; i++) {
      const curl = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), hairMat);
      curl.position.set(i * 0.16, 0.36, -0.04);
      head.add(curl);
    }
    const wreath = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.05, 8, 20), goldMat);
    wreath.rotation.x = Math.PI / 2 - 0.15;
    wreath.position.set(0, 0.28, 0);
    head.add(wreath);
  } else if (id === 'ibn-khaldun') {
    // Respectful scholar turban (Serban)
    const turban = new THREE.Mesh(
      rBox(0.84, 0.34, 0.84, 0.15),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.7 }),
    );
    turban.position.y = 0.38;
    const band = new THREE.Mesh(rBox(0.86, 0.1, 0.86, 0.04), goldMat);
    band.position.y = 0.28;
    head.add(turban, band);
  } else if (id === 'muhd-yusof') {
    // Malaysian Songkok
    const songkok = new THREE.Mesh(
      rBox(0.78, 0.32, 0.78, 0.07),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.65 }),
    );
    songkok.position.y = 0.42;
    head.add(songkok);
  } else {
    // Neat parted scholar hair
    const topHair = new THREE.Mesh(rBox(0.78, 0.22, 0.76, 0.08), hairMat);
    topHair.position.set(0, 0.34, -0.02);
    const backHair = new THREE.Mesh(rBox(0.76, 0.42, 0.2, 0.06), hairMat);
    backHair.position.set(0, 0.12, -0.31);
    head.add(topHair, backHair);
  }

  root.add(head);

  return {
    id,
    root,
    head,
    leftArm,
    rightArm,
    mouthOpen,
  };
}
