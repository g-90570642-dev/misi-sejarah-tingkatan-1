import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { AvatarAnimState, AvatarConfig } from '../types/game';

export interface PlayerRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  upperTorso: THREE.Group;
  head: THREE.Group;
  leftEye: THREE.Group;
  rightEye: THREE.Group;
  leftBrow: THREE.Mesh;
  rightBrow: THREE.Mesh;
  mouthOpen: THREE.Mesh;
  leftArm: THREE.Group;
  leftForearm: THREE.Group;
  rightArm: THREE.Group;
  rightForearm: THREE.Group;
  leftLeg: THREE.Group;
  leftCalf: THREE.Group;
  rightLeg: THREE.Group;
  rightCalf: THREE.Group;
  auraRing: THREE.Mesh;
  contactShadow?: THREE.Mesh;
}

function makeRoundedBox(w: number, h: number, d: number, r = 0.06): RoundedBoxGeometry {
  return new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w * 0.24, h * 0.24, d * 0.24));
}

function buildHairGroup(config: AvatarConfig): THREE.Group {
  const hairGroup = new THREE.Group();
  const hairMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.hairColor),
    roughness: 0.62,
    metalness: 0.06,
  });

  if (config.hairStyle === 'hijab') {
    // Graceful draped modern tudung / hijab
    const cap = new THREE.Mesh(makeRoundedBox(0.84, 0.44, 0.84, 0.14), hairMat);
    cap.position.set(0, 0.22, -0.02);
    cap.castShadow = true;
    const backDrape = new THREE.Mesh(makeRoundedBox(0.84, 0.72, 0.46, 0.12), hairMat);
    backDrape.position.set(0, -0.1, -0.22);
    backDrape.castShadow = true;
    const sideL = new THREE.Mesh(makeRoundedBox(0.16, 0.56, 0.54, 0.06), hairMat);
    sideL.position.set(-0.37, -0.04, 0.02);
    const sideR = new THREE.Mesh(makeRoundedBox(0.16, 0.56, 0.54, 0.06), hairMat);
    sideR.position.set(0.37, -0.04, 0.02);
    const neckWrap = new THREE.Mesh(makeRoundedBox(0.76, 0.2, 0.58, 0.07), hairMat);
    neckWrap.position.set(0, -0.35, -0.02);
    const brooch = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.07, 0),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.85, roughness: 0.2 }),
    );
    brooch.position.set(0, -0.34, 0.29);
    hairGroup.add(cap, backDrape, sideL, sideR, neckWrap, brooch);
    return hairGroup;
  }

  // Base hair cap common to non-hijab styles
  const topCap = new THREE.Mesh(makeRoundedBox(0.8, 0.24, 0.78, 0.09), hairMat);
  topCap.position.set(0, 0.34, -0.02);
  topCap.castShadow = true;
  const backHair = new THREE.Mesh(makeRoundedBox(0.78, 0.52, 0.22, 0.07), hairMat);
  backHair.position.set(0, 0.08, -0.32);
  backHair.castShadow = true;
  hairGroup.add(topCap, backHair);

  if (config.hairStyle === 'spiky') {
    const spikeOffsets = [
      [-0.22, 0.48, 0.18, -0.3, 0.2],
      [0.0, 0.52, 0.2, -0.35, 0],
      [0.22, 0.48, 0.18, -0.3, -0.2],
      [-0.15, 0.51, -0.05, 0.2, 0.2],
      [0.15, 0.51, -0.05, 0.2, -0.2],
    ];
    spikeOffsets.forEach(([sx, sy, sz, rx, rz]) => {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.32, 5), hairMat);
      spike.position.set(sx, sy, sz);
      spike.rotation.set(rx, 0, rz);
      spike.castShadow = true;
      hairGroup.add(spike);
    });
  } else if (config.hairStyle === 'side-part') {
    const sweep = new THREE.Mesh(makeRoundedBox(0.72, 0.2, 0.46, 0.08), hairMat);
    sweep.position.set(0.06, 0.35, 0.16);
    sweep.rotation.z = -0.15;
    const sideL = new THREE.Mesh(makeRoundedBox(0.12, 0.34, 0.42, 0.04), hairMat);
    sideL.position.set(-0.37, 0.15, -0.05);
    const sideR = new THREE.Mesh(makeRoundedBox(0.12, 0.34, 0.42, 0.04), hairMat);
    sideR.position.set(0.37, 0.15, -0.05);
    hairGroup.add(sweep, sideL, sideR);
  } else if (config.hairStyle === 'bob') {
    const sideL = new THREE.Mesh(makeRoundedBox(0.16, 0.62, 0.58, 0.06), hairMat);
    sideL.position.set(-0.38, 0.02, -0.02);
    const sideR = new THREE.Mesh(makeRoundedBox(0.16, 0.62, 0.58, 0.06), hairMat);
    sideR.position.set(0.38, 0.02, -0.02);
    const bangs = new THREE.Mesh(makeRoundedBox(0.68, 0.14, 0.14, 0.04), hairMat);
    bangs.position.set(0, 0.28, 0.34);
    hairGroup.add(sideL, sideR, bangs);
  } else if (config.hairStyle === 'ponytail') {
    const bangs = new THREE.Mesh(makeRoundedBox(0.66, 0.14, 0.16, 0.05), hairMat);
    bangs.position.set(0, 0.29, 0.33);
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(0.11, 0.035, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.4 }),
    );
    band.position.set(0, 0.22, -0.44);
    const tailTop = new THREE.Mesh(makeRoundedBox(0.24, 0.42, 0.22, 0.09), hairMat);
    tailTop.position.set(0, 0.05, -0.52);
    tailTop.rotation.x = 0.25;
    const tailTip = new THREE.Mesh(makeRoundedBox(0.18, 0.3, 0.18, 0.07), hairMat);
    tailTip.position.set(0, -0.22, -0.58);
    hairGroup.add(bangs, band, tailTop, tailTip);
  } else if (config.hairStyle === 'curly') {
    const curls = [
      [-0.25, 0.42, 0.12],
      [0, 0.46, 0.14],
      [0.25, 0.42, 0.12],
      [-0.32, 0.32, -0.12],
      [0.32, 0.32, -0.12],
      [0, 0.42, -0.2],
    ];
    curls.forEach(([cx, cy, cz]) => {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.21, 10, 10), hairMat);
      puff.position.set(cx, cy, cz);
      puff.castShadow = true;
      hairGroup.add(puff);
    });
  }

  return hairGroup;
}

function buildAccessoryGroup(config: AvatarConfig): THREE.Group {
  const accGroup = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.24,
    metalness: 0.85,
  });

  if (config.accessory === 'safari-hat') {
    const hatMat = new THREE.MeshStandardMaterial({ color: 0xd9a05b, roughness: 0.7 });
    const bandMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.shirtColor),
      roughness: 0.45,
    });
    const brim = new THREE.Mesh(makeRoundedBox(1.12, 0.09, 1.08, 0.04), hatMat);
    brim.position.y = 0.42;
    brim.castShadow = true;
    const crown = new THREE.Mesh(makeRoundedBox(0.76, 0.3, 0.76, 0.08), hatMat);
    crown.position.y = 0.58;
    crown.castShadow = true;
    const band = new THREE.Mesh(makeRoundedBox(0.79, 0.09, 0.79, 0.03), bandMat);
    band.position.y = 0.49;
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), goldMat);
    gem.position.set(0, 0.52, 0.41);
    accGroup.add(brim, crown, band, gem);
  } else if (config.accessory === 'glasses') {
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.7,
    });
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
    });
    [-0.17, 0.17].forEach((gx) => {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.022, 8, 18), frameMat);
      rim.position.set(gx, 0.05, 0.4);
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.095, 14), lensMat);
      lens.position.set(gx, 0.05, 0.395);
      accGroup.add(rim, lens);
    });
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.03), frameMat);
    bridge.position.set(0, 0.06, 0.4);
    accGroup.add(bridge);
  } else if (config.accessory === 'headband') {
    const band = new THREE.Mesh(
      makeRoundedBox(0.84, 0.11, 0.8, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.5 }),
    );
    band.position.set(0, 0.24, 0);
    const knot = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), goldMat);
    knot.position.set(0, 0.24, 0.42);
    accGroup.add(band, knot);
  } else if (config.accessory === 'crown') {
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.28, 0.16, 8),
      goldMat,
    );
    base.position.y = 0.46;
    accGroup.add(base);
    for (let i = 0; i < 4; i++) {
      const ang = (i * Math.PI) / 2;
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 4), goldMat);
      tip.position.set(Math.cos(ang) * 0.24, 0.62, Math.sin(ang) * 0.24);
      accGroup.add(tip);
    }
  }

  return accGroup;
}

function buildBackpackGroup(config: AvatarConfig): THREE.Group {
  const packGroup = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.25,
    metalness: 0.85,
  });

  if (config.backpack === 'explorer-pack') {
    const packMat = new THREE.MeshStandardMaterial({ color: 0x7c4a2d, roughness: 0.72 });
    const main = new THREE.Mesh(makeRoundedBox(0.62, 0.66, 0.28, 0.07), packMat);
    main.position.set(0, 0.02, -0.37);
    main.castShadow = true;
    const flap = new THREE.Mesh(makeRoundedBox(0.64, 0.2, 0.3, 0.05), packMat);
    flap.position.set(0, 0.28, -0.37);
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.05), goldMat);
    buckle.position.set(0, 0.17, -0.52);
    const mapTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.68, 10),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 }),
    );
    mapTube.rotation.z = Math.PI / 2;
    mapTube.position.set(0, 0.44, -0.36);
    packGroup.add(main, flap, buckle, mapTube);
  } else if (config.backpack === 'jet-scroll') {
    const scrollMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.25,
      roughness: 0.45,
    });
    [-0.18, 0.18].forEach((sx) => {
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.78, 10), scrollMat);
      cyl.position.set(sx, 0.08, -0.34);
      cyl.castShadow = true;
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 10), goldMat);
      cap.position.set(sx, 0.48, -0.34);
      packGroup.add(cyl, cap);
    });
  } else if (config.backpack === 'satchel') {
    const strap = new THREE.Mesh(
      new THREE.BoxGeometry(0.86, 0.12, 0.54),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 }),
    );
    strap.rotation.z = 0.65;
    strap.position.set(0, 0.05, 0);
    const pouch = new THREE.Mesh(
      makeRoundedBox(0.28, 0.34, 0.22, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 }),
    );
    pouch.position.set(0.46, -0.26, -0.06);
    const compass = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 10), goldMat);
    compass.rotation.x = Math.PI / 2;
    compass.position.set(0.46, -0.24, 0.06);
    packGroup.add(strap, pouch, compass);
  }

  return packGroup;
}

export function createPlayerAvatar(
  config: AvatarConfig,
  shadowTexture?: THREE.Texture,
): PlayerRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const skinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.skinTone),
    roughness: 0.58,
    metalness: 0.04,
  });
  const shirtMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.shirtColor),
    roughness: 0.52,
    metalness: 0.08,
  });
  const shirtAccentMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.shirtColor).lerp(new THREE.Color(0xffffff), 0.35),
    roughness: 0.45,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.pantsColor),
    roughness: 0.76,
    metalness: 0.05,
  });
  const shoeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.shoeColor),
    roughness: 0.65,
    metalness: 0.12,
  });
  const soleMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.8,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.22,
    metalness: 0.85,
  });

  const isGirl = config.gender === 'girl';
  const shoulderW = isGirl ? 0.78 : 0.86;
  const armOffset = isGirl ? 0.54 : 0.58;

  // Hips / Lower Torso
  const hipsMesh = new THREE.Mesh(
    makeRoundedBox(0.76, 0.24, 0.46, 0.07),
    config.shirtStyle === 'kurung' ? shirtMat : pantsMat,
  );
  hipsMesh.position.y = 0.82;
  hipsMesh.castShadow = true;
  bodyGroup.add(hipsMesh);

  // Upper Torso Pivot (allows realistic lean & twist)
  const upperTorso = new THREE.Group();
  upperTorso.position.set(0, 0.92, 0);
  bodyGroup.add(upperTorso);

  const chestMesh = new THREE.Mesh(
    makeRoundedBox(shoulderW, 0.68, 0.48, 0.09),
    shirtMat,
  );
  chestMesh.position.y = 0.34;
  chestMesh.castShadow = true;
  chestMesh.receiveShadow = true;
  upperTorso.add(chestMesh);

  // Shirt Style Details
  if (config.shirtStyle === 'explorer') {
    const belt = new THREE.Mesh(
      makeRoundedBox(shoulderW + 0.04, 0.12, 0.52, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.75 }),
    );
    belt.position.y = 0.02;
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.06), goldMat);
    buckle.position.set(0, 0.02, 0.26);
    const scarf = new THREE.Mesh(makeRoundedBox(0.56, 0.12, 0.5, 0.05), goldMat);
    scarf.position.y = 0.68;
    upperTorso.add(belt, buckle, scarf);
  } else if (config.shirtStyle === 'jacket') {
    const innerTee = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.64, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 }),
    );
    innerTee.position.set(0, 0.34, 0.23);
    const collar = new THREE.Mesh(makeRoundedBox(0.54, 0.13, 0.48, 0.04), shirtAccentMat);
    collar.position.y = 0.68;
    upperTorso.add(innerTee, collar);
  } else if (config.shirtStyle === 'kurung') {
    const songket = new THREE.Mesh(
      makeRoundedBox(0.8, 0.24, 0.5, 0.05),
      goldMat,
    );
    songket.position.y = -0.05;
    const tunicSkirt = new THREE.Mesh(
      makeRoundedBox(0.82, 0.26, 0.5, 0.06),
      shirtMat,
    );
    tunicSkirt.position.y = -0.22;
    const buttons = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.05), goldMat);
    buttons.position.set(0, 0.48, 0.24);
    upperTorso.add(songket, tunicSkirt, buttons);
  } else if (config.shirtStyle === 'hoodie') {
    const pocket = new THREE.Mesh(makeRoundedBox(0.46, 0.24, 0.08, 0.04), shirtAccentMat);
    pocket.position.set(0, 0.16, 0.24);
    const hoodRim = new THREE.Mesh(makeRoundedBox(0.64, 0.16, 0.46, 0.06), shirtAccentMat);
    hoodRim.position.set(0, 0.68, -0.06);
    upperTorso.add(pocket, hoodRim);
  } else if (config.shirtStyle === 'royal') {
    const sash = new THREE.Mesh(makeRoundedBox(0.86, 0.12, 0.52, 0.04), goldMat);
    sash.position.set(0, 0.34, 0);
    sash.rotation.z = 0.52;
    const trim = new THREE.Mesh(makeRoundedBox(shoulderW + 0.04, 0.1, 0.5, 0.03), goldMat);
    trim.position.y = 0.04;
    upperTorso.add(sash, trim);
  }

  // Backpack attached to UpperTorso
  const packGroup = buildBackpackGroup(config);
  packGroup.position.y = 0.34;
  upperTorso.add(packGroup);

  // Articulated R15 Arms (UpperArm + Forearm + Hand)
  const buildArm = (side: -1 | 1) => {
    const armRoot = new THREE.Group();
    armRoot.position.set(side * armOffset, 0.58, 0);

    const upperArm = new THREE.Mesh(
      makeRoundedBox(0.28, 0.36, 0.3, 0.07),
      shirtMat,
    );
    upperArm.position.y = -0.16;
    upperArm.castShadow = true;
    armRoot.add(upperArm);

    const forearmPivot = new THREE.Group();
    forearmPivot.position.set(0, -0.34, 0);
    const sleeveMat = config.shirtStyle === 'explorer' ? skinMat : shirtAccentMat;
    const forearmMesh = new THREE.Mesh(
      makeRoundedBox(0.25, 0.3, 0.27, 0.06),
      sleeveMat,
    );
    forearmMesh.position.y = -0.14;
    forearmMesh.castShadow = true;
    forearmPivot.add(forearmMesh);

    const hand = new THREE.Mesh(
      makeRoundedBox(0.24, 0.18, 0.24, 0.07),
      skinMat,
    );
    hand.position.y = -0.34;
    hand.castShadow = true;
    forearmPivot.add(hand);

    armRoot.add(forearmPivot);
    upperTorso.add(armRoot);
    return { armRoot, forearmPivot };
  };

  const leftArmSet = buildArm(-1);
  const rightArmSet = buildArm(1);

  // Articulated R15 Legs (Thigh + Calf + Detailed Shoes)
  const buildLeg = (side: -1 | 1) => {
    const legRoot = new THREE.Group();
    legRoot.position.set(side * 0.2, 0.72, 0);

    const thigh = new THREE.Mesh(
      makeRoundedBox(0.32, 0.34, 0.34, 0.07),
      pantsMat,
    );
    thigh.position.y = -0.16;
    thigh.castShadow = true;
    legRoot.add(thigh);

    const calfPivot = new THREE.Group();
    calfPivot.position.set(0, -0.34, 0);
    const calf = new THREE.Mesh(
      makeRoundedBox(0.3, 0.26, 0.32, 0.06),
      config.shoeStyle === 'sandals' ? skinMat : pantsMat,
    );
    calf.position.y = -0.12;
    calf.castShadow = true;
    calfPivot.add(calf);

    // Detailed Shoe
    const shoeY = -0.29;
    if (config.shoeStyle === 'sneakers') {
      const upper = new THREE.Mesh(makeRoundedBox(0.34, 0.15, 0.42, 0.05), shoeMat);
      upper.position.set(0, shoeY + 0.02, 0.04);
      upper.castShadow = true;
      const sole = new THREE.Mesh(makeRoundedBox(0.36, 0.06, 0.44, 0.02), soleMat);
      sole.position.set(0, shoeY - 0.06, 0.04);
      calfPivot.add(upper, sole);
    } else if (config.shoeStyle === 'sandals') {
      const sole = new THREE.Mesh(makeRoundedBox(0.34, 0.06, 0.42, 0.02), shoeMat);
      sole.position.set(0, shoeY - 0.06, 0.04);
      const strap = new THREE.Mesh(makeRoundedBox(0.35, 0.06, 0.14, 0.02), shoeMat);
      strap.position.set(0, shoeY - 0.01, 0.1);
      calfPivot.add(sole, strap);
    } else {
      // Boots or Royal boots
      const boot = new THREE.Mesh(makeRoundedBox(0.34, 0.22, 0.42, 0.05), shoeMat);
      boot.position.set(0, shoeY, 0.04);
      boot.castShadow = true;
      calfPivot.add(boot);
      if (config.shoeStyle === 'royal') {
        const cuff = new THREE.Mesh(makeRoundedBox(0.36, 0.07, 0.36, 0.03), goldMat);
        cuff.position.set(0, shoeY + 0.1, 0.01);
        calfPivot.add(cuff);
      }
    }

    legRoot.add(calfPivot);
    bodyGroup.add(legRoot);
    return { legRoot, calfPivot };
  };

  const leftLegSet = buildLeg(-1);
  const rightLegSet = buildLeg(1);

  // Expressive Roblox-Style Head
  const head = new THREE.Group();
  head.position.set(0, 1.08, 0);
  upperTorso.add(head);

  const headMesh = new THREE.Mesh(
    makeRoundedBox(0.76, 0.72, 0.74, 0.14),
    skinMat,
  );
  headMesh.castShadow = true;
  head.add(headMesh);

  // Expressive Eyes (sclera + pupil + catchlight)
  const scleraMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.15 });
  const browMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.hairColor),
    roughness: 0.6,
  });

  const buildEye = (ex: number) => {
    const eg = new THREE.Group();
    eg.position.set(ex, 0.04, 0.365);
    const sclera = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.15, 0.03), scleraMat);
    const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.04), pupilMat);
    pupil.position.set(0, -0.01, 0.005);
    const glint = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.045), scleraMat);
    glint.position.set(0.025, 0.03, 0.01);
    eg.add(sclera, pupil, glint);
    if (isGirl) {
      const lash = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.04), pupilMat);
      lash.position.set(0, 0.08, 0.01);
      eg.add(lash);
    }
    head.add(eg);
    return eg;
  };

  const leftEye = buildEye(-0.17);
  const rightEye = buildEye(0.17);

  // Expressive Eyebrows
  const leftBrow = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.04), browMat);
  leftBrow.position.set(-0.17, 0.17, 0.37);
  leftBrow.rotation.z = 0.06;
  const rightBrow = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.04), browMat);
  rightBrow.position.set(0.17, 0.17, 0.37);
  rightBrow.rotation.z = -0.06;
  head.add(leftBrow, rightBrow);

  // Rosy Cheeks
  const blushMat = new THREE.MeshStandardMaterial({
    color: 0xfb7185,
    roughness: 0.8,
    transparent: true,
    opacity: 0.55,
  });
  [-0.25, 0.25].forEach((bx) => {
    const blush = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.02), blushMat);
    blush.position.set(bx, -0.07, 0.372);
    head.add(blush);
  });

  // Cute Smile + Animated Happy Open Mouth
  const smileBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.045, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x9f1239, roughness: 0.5 }),
  );
  smileBase.position.set(0, -0.15, 0.37);
  head.add(smileBase);

  const mouthOpen = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.09, 0.035),
    new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.4 }),
  );
  mouthOpen.position.set(0, -0.17, 0.372);
  mouthOpen.scale.y = 0.01;
  head.add(mouthOpen);

  // Hair & Head Accessory
  head.add(buildHairGroup(config));
  head.add(buildAccessoryGroup(config));

  // Golden Celebration Aura Ring (hidden unless celebrating/dancing)
  const auraRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.95, 0.06, 8, 28),
    new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.85,
      transparent: true,
      opacity: 0,
    }),
  );
  auraRing.rotation.x = Math.PI / 2;
  auraRing.position.y = 0.15;
  root.add(auraRing);

  // Contact Shadow
  let contactShadow: THREE.Mesh | undefined;
  if (shadowTexture) {
    contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.55, 1.55),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
        opacity: 0.52,
      }),
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.03;
    root.add(contactShadow);
  }

  return {
    root,
    bodyGroup,
    upperTorso,
    head,
    leftEye,
    rightEye,
    leftBrow,
    rightBrow,
    mouthOpen,
    leftArm: leftArmSet.armRoot,
    leftForearm: leftArmSet.forearmPivot,
    rightArm: rightArmSet.armRoot,
    rightForearm: rightArmSet.forearmPivot,
    leftLeg: leftLegSet.legRoot,
    leftCalf: leftLegSet.calfPivot,
    rightLeg: rightLegSet.legRoot,
    rightCalf: rightLegSet.calfPivot,
    auraRing,
    contactShadow,
  };
}

export function animatePlayerAvatar(
  rig: PlayerRig,
  time: number,
  animState: AvatarAnimState,
  speedRatio: number,
  verticalVelocity: number,
  delta: number,
): void {
  // Natural periodic eye blinking every ~3.4s
  const blinkPhase = time % 3.4;
  const eyeScaleY = blinkPhase > 3.24 ? 0.12 : 1.0;
  rig.leftEye.scale.y = THREE.MathUtils.damp(rig.leftEye.scale.y, eyeScaleY, 24, delta);
  rig.rightEye.scale.y = THREE.MathUtils.damp(rig.rightEye.scale.y, eyeScaleY, 24, delta);

  const auraMat = rig.auraRing.material as THREE.MeshStandardMaterial;

  if (animState === 'jump') {
    const targetArm = THREE.MathUtils.clamp(-verticalVelocity * 0.1 - 0.95, -1.7, 0.35);
    rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, targetArm, 12, delta);
    rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, targetArm, 12, delta);
    rig.leftArm.rotation.z = THREE.MathUtils.damp(rig.leftArm.rotation.z, -0.22, 12, delta);
    rig.rightArm.rotation.z = THREE.MathUtils.damp(rig.rightArm.rotation.z, 0.22, 12, delta);
    rig.leftForearm.rotation.x = THREE.MathUtils.damp(rig.leftForearm.rotation.x, -0.45, 12, delta);
    rig.rightForearm.rotation.x = THREE.MathUtils.damp(rig.rightForearm.rotation.x, -0.45, 12, delta);
    rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, 0.42, 12, delta);
    rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, -0.35, 12, delta);
    rig.leftCalf.rotation.x = THREE.MathUtils.damp(rig.leftCalf.rotation.x, 0.5, 12, delta);
    rig.rightCalf.rotation.x = THREE.MathUtils.damp(rig.rightCalf.rotation.x, 0.2, 12, delta);
    rig.upperTorso.rotation.x = THREE.MathUtils.damp(rig.upperTorso.rotation.x, 0.08, 10, delta);
    rig.leftBrow.position.y = THREE.MathUtils.damp(rig.leftBrow.position.y, 0.21, 14, delta);
    rig.rightBrow.position.y = THREE.MathUtils.damp(rig.rightBrow.position.y, 0.21, 14, delta);
    rig.mouthOpen.scale.y = THREE.MathUtils.damp(rig.mouthOpen.scale.y, 0.9, 14, delta);
    auraMat.opacity = THREE.MathUtils.damp(auraMat.opacity, 0, 10, delta);
  } else if (animState === 'run' || animState === 'walk') {
    const isRun = animState === 'run';
    const freq = isRun ? 15.0 : 10.5;
    const amp = (isRun ? 0.92 : 0.65) * Math.min(speedRatio, 1);
    const cycle = time * freq;
    const swing = Math.sin(cycle) * amp;

    rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, swing, 18, delta);
    rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, -swing, 18, delta);
    rig.leftCalf.rotation.x = THREE.MathUtils.damp(
      rig.leftCalf.rotation.x,
      Math.max(0, -Math.cos(cycle)) * (isRun ? 0.85 : 0.45),
      16,
      delta,
    );
    rig.rightCalf.rotation.x = THREE.MathUtils.damp(
      rig.rightCalf.rotation.x,
      Math.max(0, Math.cos(cycle)) * (isRun ? 0.85 : 0.45),
      16,
      delta,
    );

    rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, -swing * 0.9, 18, delta);
    rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, swing * 0.9, 18, delta);
    rig.leftArm.rotation.z = THREE.MathUtils.damp(rig.leftArm.rotation.z, -0.08, 12, delta);
    rig.rightArm.rotation.z = THREE.MathUtils.damp(rig.rightArm.rotation.z, 0.08, 12, delta);
    rig.leftForearm.rotation.x = THREE.MathUtils.damp(
      rig.leftForearm.rotation.x,
      isRun ? -0.85 : -0.35,
      14,
      delta,
    );
    rig.rightForearm.rotation.x = THREE.MathUtils.damp(
      rig.rightForearm.rotation.x,
      isRun ? -0.85 : -0.35,
      14,
      delta,
    );

    rig.upperTorso.rotation.x = THREE.MathUtils.damp(
      rig.upperTorso.rotation.x,
      isRun ? 0.18 : 0.06,
      12,
      delta,
    );
    rig.upperTorso.rotation.y = Math.sin(cycle) * (isRun ? 0.12 : 0.06);
    rig.bodyGroup.position.y = Math.abs(Math.sin(cycle)) * (isRun ? 0.14 : 0.08);
    rig.bodyGroup.rotation.y = THREE.MathUtils.damp(rig.bodyGroup.rotation.y, 0, 12, delta);
    rig.head.rotation.z = Math.sin(cycle) * 0.04;
    rig.leftBrow.position.y = THREE.MathUtils.damp(rig.leftBrow.position.y, 0.17, 12, delta);
    rig.rightBrow.position.y = THREE.MathUtils.damp(rig.rightBrow.position.y, 0.17, 12, delta);
    rig.mouthOpen.scale.y = THREE.MathUtils.damp(rig.mouthOpen.scale.y, isRun ? 0.7 : 0.05, 12, delta);
    auraMat.opacity = THREE.MathUtils.damp(auraMat.opacity, 0, 10, delta);
  } else if (animState === 'wave') {
    rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, 0.08, 10, delta);
    rig.leftArm.rotation.z = THREE.MathUtils.damp(rig.leftArm.rotation.z, -0.1, 10, delta);
    rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, -2.55, 14, delta);
    rig.rightArm.rotation.z = THREE.MathUtils.damp(
      rig.rightArm.rotation.z,
      0.35 + Math.sin(time * 9) * 0.38,
      16,
      delta,
    );
    rig.rightForearm.rotation.x = THREE.MathUtils.damp(rig.rightForearm.rotation.x, -0.3, 12, delta);
    rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, 0, 10, delta);
    rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, 0, 10, delta);
    rig.leftCalf.rotation.x = THREE.MathUtils.damp(rig.leftCalf.rotation.x, 0, 10, delta);
    rig.rightCalf.rotation.x = THREE.MathUtils.damp(rig.rightCalf.rotation.x, 0, 10, delta);
    rig.upperTorso.rotation.x = THREE.MathUtils.damp(rig.upperTorso.rotation.x, 0, 10, delta);
    rig.head.rotation.z = Math.sin(time * 4) * 0.09;
    rig.mouthOpen.scale.y = THREE.MathUtils.damp(rig.mouthOpen.scale.y, 1.0, 14, delta);
    rig.leftBrow.position.y = THREE.MathUtils.damp(rig.leftBrow.position.y, 0.2, 14, delta);
    rig.rightBrow.position.y = THREE.MathUtils.damp(rig.rightBrow.position.y, 0.2, 14, delta);
    auraMat.opacity = THREE.MathUtils.damp(auraMat.opacity, 0, 10, delta);
  } else if (animState === 'dance' || animState === 'celebrate') {
    const beat = time * 8.5;
    rig.bodyGroup.position.y = Math.abs(Math.sin(beat)) * 0.24;
    rig.bodyGroup.rotation.y =
      animState === 'celebrate' ? time * 5.2 : Math.sin(beat * 0.5) * 0.4;
    rig.upperTorso.rotation.z = Math.sin(beat) * 0.12;
    rig.leftArm.rotation.x = -2.1 + Math.sin(beat) * 0.55;
    rig.rightArm.rotation.x = -2.1 - Math.sin(beat) * 0.55;
    rig.leftArm.rotation.z = -0.45;
    rig.rightArm.rotation.z = 0.45;
    rig.leftForearm.rotation.x = -0.5;
    rig.rightForearm.rotation.x = -0.5;
    rig.leftLeg.rotation.x = Math.sin(beat) * 0.35;
    rig.rightLeg.rotation.x = -Math.sin(beat) * 0.35;
    rig.leftCalf.rotation.x = Math.abs(Math.cos(beat)) * 0.45;
    rig.rightCalf.rotation.x = Math.abs(Math.sin(beat)) * 0.45;
    rig.mouthOpen.scale.y = THREE.MathUtils.damp(rig.mouthOpen.scale.y, 1.15, 14, delta);
    rig.leftBrow.position.y = THREE.MathUtils.damp(rig.leftBrow.position.y, 0.21, 14, delta);
    rig.rightBrow.position.y = THREE.MathUtils.damp(rig.rightBrow.position.y, 0.21, 14, delta);
    auraMat.opacity = THREE.MathUtils.damp(
      auraMat.opacity,
      animState === 'celebrate' ? 0.9 : 0.45,
      10,
      delta,
    );
    rig.auraRing.position.y = 0.15 + Math.abs(Math.sin(beat)) * 0.25;
  } else {
    // Cheerful Idle
    rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, 0, 10, delta);
    rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, 0, 10, delta);
    rig.leftCalf.rotation.x = THREE.MathUtils.damp(rig.leftCalf.rotation.x, 0, 10, delta);
    rig.rightCalf.rotation.x = THREE.MathUtils.damp(rig.rightCalf.rotation.x, 0, 10, delta);
    rig.leftArm.rotation.x = THREE.MathUtils.damp(
      rig.leftArm.rotation.x,
      Math.sin(time * 2) * 0.06,
      8,
      delta,
    );
    rig.rightArm.rotation.x = THREE.MathUtils.damp(
      rig.rightArm.rotation.x,
      -Math.sin(time * 2) * 0.06,
      8,
      delta,
    );
    rig.leftArm.rotation.z = THREE.MathUtils.damp(rig.leftArm.rotation.z, -0.08, 10, delta);
    rig.rightArm.rotation.z = THREE.MathUtils.damp(rig.rightArm.rotation.z, 0.08, 10, delta);
    rig.leftForearm.rotation.x = THREE.MathUtils.damp(rig.leftForearm.rotation.x, -0.18, 10, delta);
    rig.rightForearm.rotation.x = THREE.MathUtils.damp(rig.rightForearm.rotation.x, -0.18, 10, delta);
    rig.upperTorso.rotation.x = THREE.MathUtils.damp(rig.upperTorso.rotation.x, 0, 10, delta);
    rig.upperTorso.rotation.y = THREE.MathUtils.damp(rig.upperTorso.rotation.y, 0, 10, delta);
    rig.upperTorso.rotation.z = THREE.MathUtils.damp(rig.upperTorso.rotation.z, 0, 10, delta);
    rig.bodyGroup.position.y = Math.sin(time * 2.4) * 0.03;
    rig.bodyGroup.rotation.y = THREE.MathUtils.damp(rig.bodyGroup.rotation.y, 0, 10, delta);
    rig.head.rotation.z = Math.sin(time * 1.3) * 0.035;
    rig.leftBrow.position.y = THREE.MathUtils.damp(rig.leftBrow.position.y, 0.17, 10, delta);
    rig.rightBrow.position.y = THREE.MathUtils.damp(rig.rightBrow.position.y, 0.17, 10, delta);
    rig.mouthOpen.scale.y = THREE.MathUtils.damp(rig.mouthOpen.scale.y, 0.05, 10, delta);
    auraMat.opacity = THREE.MathUtils.damp(auraMat.opacity, 0, 10, delta);
  }
}
