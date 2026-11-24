import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MISSION_TOPICS } from '../data/sejarahBab1';
import {
  AvatarAnimState,
  AvatarConfig,
  NearbyTarget,
  PortalId,
} from '../types/game';
import {
  createPlayerAvatar,
  animatePlayerAvatar,
  PlayerRig,
} from '../three/playerAvatar';
import { createWorldTextures } from '../three/textures';
import { buildAncientWorld, groundHeightAt } from '../three/worldBuilder';
import { soundEngine } from '../utils/audio';

export interface TouchInputState {
  moveX: number; // -1 to 1
  moveY: number; // -1 to 1 (up = -1, down = +1)
  jumpPressed: boolean;
}

export interface PortalScreenLabel {
  id: PortalId;
  title: string;
  color: string;
  x: number;
  y: number;
  visible: boolean;
  distance: number;
  completed: boolean;
}

interface GameCanvasProps {
  avatarConfig: AvatarConfig;
  completedMissions: PortalId[];
  openedChests: string[];
  collectedCrystals: string[];
  isPaused: boolean;
  sprintToggle: boolean;
  emoteTrigger: { state: 'wave' | 'dance' | 'celebrate'; nonce: number } | null;
  teleportTarget: { x: number; z: number; yaw: number; nonce: number } | null;
  touchInputRef: React.MutableRefObject<TouchInputState>;
  interactSignal: number;
  cameraResetSignal: number;
  onNearbyChange: (target: NearbyTarget) => void;
  onEnterPortal: (id: PortalId) => void;
  onOpenChest: (chestId: string) => void;
  onCollectCrystal: (crystalId: string) => void;
  onCollectCoin: () => void;
  onTalkToGuide: () => void;
  onShowToast: (text: string) => void;
}

// Pre-allocated math helpers (zero GC inside animation loop)
const _camDesired = new THREE.Vector3();
const _camLookAt = new THREE.Vector3();
const _projVec = new THREE.Vector3();

function disposeAvatarTree(root: THREE.Object3D) {
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const m = obj as THREE.Mesh;
      m.geometry.dispose();
      if (Array.isArray(m.material)) {
        m.material.forEach((mat) => mat.dispose());
      } else {
        m.material.dispose();
      }
    }
  });
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  avatarConfig,
  completedMissions,
  openedChests,
  collectedCrystals,
  isPaused,
  sprintToggle,
  emoteTrigger,
  teleportTarget,
  touchInputRef,
  interactSignal,
  cameraResetSignal,
  onNearbyChange,
  onEnterPortal,
  onOpenChest,
  onCollectCrystal,
  onCollectCoin,
  onTalkToGuide,
  onShowToast,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const labelRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  // Mutable refs for React -> Three.js synchronization without tearing down WebGL
  const pausedRef = useRef(isPaused);
  pausedRef.current = isPaused;

  const callbacksRef = useRef({
    onNearbyChange,
    onEnterPortal,
    onOpenChest,
    onCollectCrystal,
    onCollectCoin,
    onTalkToGuide,
    onShowToast,
  });
  callbacksRef.current = {
    onNearbyChange,
    onEnterPortal,
    onOpenChest,
    onCollectCrystal,
    onCollectCoin,
    onTalkToGuide,
    onShowToast,
  };

  const completedRef = useRef<PortalId[]>(completedMissions);
  completedRef.current = completedMissions;

  const avatarConfigRef = useRef<AvatarConfig>(avatarConfig);
  avatarConfigRef.current = avatarConfig;

  const sprintToggleRef = useRef(sprintToggle);
  sprintToggleRef.current = sprintToggle;

  const emoteRef = useRef<{ state: AvatarAnimState; until: number } | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const shadowTexRef = useRef<THREE.Texture | undefined>(undefined);
  const playerRigRef = useRef<PlayerRig | null>(null);
  const worldRef = useRef<ReturnType<typeof buildAncientWorld> | null>(null);
  const playerStateRef = useRef({
    x: 0,
    y: groundHeightAt(0, 2.5),
    z: 2.5,
    vy: 0,
    yaw: Math.PI, // facing Tok Guru & Portal 1 initially
    camYaw: Math.PI,
    camPitch: 0.36,
    camDist: 10.5,
    grounded: true,
    nearby: null as NearbyTarget,
  });

  // Trigger external emote animations (wave, dance, celebrate)
  useEffect(() => {
    if (!emoteTrigger) return;
    emoteRef.current = {
      state: emoteTrigger.state,
      until: performance.now() + (emoteTrigger.state === 'celebrate' ? 3200 : 2600),
    };
  }, [emoteTrigger]);

  // Rebuild 3D Player Avatar cleanly when customized in Avatar Studio
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (playerRigRef.current) {
      scene.remove(playerRigRef.current.root);
      disposeAvatarTree(playerRigRef.current.root);
    }
    const nextRig = createPlayerAvatar(avatarConfig, shadowTexRef.current);
    const ps = playerStateRef.current;
    nextRig.root.position.set(ps.x, ps.y, ps.z);
    nextRig.root.rotation.y = ps.yaw;
    scene.add(nextRig.root);
    playerRigRef.current = nextRig;
  }, [avatarConfig]);

  // Update portal completion beacons when missions are finished
  useEffect(() => {
    const world = worldRef.current;
    if (!world) return;
    world.portals.forEach((p) => {
      const done = completedMissions.includes(p.id);
      const mat = p.completionBeacon.material as THREE.MeshStandardMaterial;
      mat.color.setHex(done ? 0xfacc15 : 0x475569);
      mat.emissive.setHex(done ? 0xf59e0b : 0x000000);
      mat.emissiveIntensity = done ? 0.9 : 0;
    });
  }, [completedMissions]);

  // Handle teleportation from Adventure Map
  useEffect(() => {
    if (!teleportTarget) return;
    const ps = playerStateRef.current;
    ps.x = teleportTarget.x;
    ps.z = teleportTarget.z;
    ps.y = groundHeightAt(teleportTarget.x, teleportTarget.z) + 0.4;
    ps.vy = 0;
    ps.yaw = teleportTarget.yaw;
    ps.camYaw = teleportTarget.yaw;
    ps.grounded = false;
  }, [teleportTarget]);

  // Handle external camera reset trigger
  useEffect(() => {
    if (cameraResetSignal === 0) return;
    const ps = playerStateRef.current;
    ps.camYaw = ps.yaw;
    ps.camPitch = 0.36;
    ps.camDist = 10.5;
  }, [cameraResetSignal]);

  // Trigger interaction handler shared by keyboard E and HUD/touch button
  const triggerInteract = useRef<() => void>(() => {});
  useEffect(() => {
    if (interactSignal > 0) {
      triggerInteract.current();
    }
  }, [interactSignal]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL probe
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    // 3. Scene, Sky & Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x7dd3fc);
    scene.fog = new THREE.Fog(0x7dd3fc, 52, 130);

    // Studio Environment Reflections for metals & crystals
    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTex = pmrem.fromScene(roomEnv, 0.04).texture;
    scene.environment = envTex;
    roomEnv.dispose();
    pmrem.dispose();

    // 4. Camera
    const camera = new THREE.PerspectiveCamera(
      56,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      220,
    );

    // 5. Three-Point Warm/Cool Outdoor Daylight Rig (<= 3 shadow casters)
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x3f6212, 0.72);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.55);
    sunLight.position.set(28, 42, 24);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    const d = 38;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.camera.near = 2;
    sunLight.shadow.camera.far = 110;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xbae6fd, 0.45);
    rimLight.position.set(-28, 18, -26);
    scene.add(rimLight);

    // 6. Textures, World & Player Avatar
    sceneRef.current = scene;
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const textures = createWorldTextures(maxAnisotropy);
    shadowTexRef.current = textures.contactShadow;
    const world = buildAncientWorld(
      scene,
      textures,
      isSoftwareGl,
      openedChests,
      collectedCrystals,
      completedRef.current,
    );
    worldRef.current = world;

    const initialRig = createPlayerAvatar(
      avatarConfigRef.current,
      textures.contactShadow,
    );
    const ps = playerStateRef.current;
    initialRig.root.position.set(ps.x, ps.y, ps.z);
    initialRig.root.rotation.y = ps.yaw;
    scene.add(initialRig.root);
    playerRigRef.current = initialRig;

    // 7. Sparkle Burst Particle Pool (reusable, zero GC)
    const burstParticles: Array<{
      mesh: THREE.Mesh;
      vx: number;
      vy: number;
      vz: number;
      life: number;
    }> = [];
    const burstGeo = new THREE.BoxGeometry(0.16, 0.16, 0.16);
    const burstMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    for (let i = 0; i < 18; i++) {
      const m = new THREE.Mesh(burstGeo, burstMat);
      m.visible = false;
      scene.add(m);
      burstParticles.push({ mesh: m, vx: 0, vy: 0, vz: 0, life: 0 });
    }
    const spawnBurst = (bx: number, by: number, bz: number, hexColor: number) => {
      burstMat.color.setHex(hexColor);
      for (let i = 0; i < burstParticles.length; i++) {
        const bp = burstParticles[i];
        bp.mesh.visible = true;
        bp.mesh.position.set(bx, by, bz);
        const ang = (i / burstParticles.length) * Math.PI * 2;
        const spd = 2.2 + (i % 3) * 1.1;
        bp.vx = Math.cos(ang) * spd;
        bp.vy = 2.8 + (i % 4) * 0.9;
        bp.vz = Math.sin(ang) * spd;
        bp.life = 0.65;
      }
    };

    // Pre-warm shaders on GPU
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 8. Input Handling (Keyboard + Mouse Drag Orbit + Wheel Zoom + Click Raycast)
    const keys: Record<string, boolean> = {};
    let jumpQueued = false;

    const handleInteract = () => {
      const target = playerStateRef.current.nearby;
      if (!target) return;
      if (target.type === 'portal') {
        soundEngine.playPortal();
        callbacksRef.current.onEnterPortal(target.id);
      } else if (target.type === 'chest') {
        const chest = world.chests.find((c) => c.id === target.id);
        if (chest && !chest.opened) {
          chest.opened = true;
          chest.glowMesh.visible = false;
          soundEngine.playChest();
          spawnBurst(chest.position.x, chest.position.y + 1.0, chest.position.z, 0xfacc15);
          emoteRef.current = { state: 'celebrate', until: performance.now() + 2600 };
          callbacksRef.current.onOpenChest(chest.id);
          callbacksRef.current.onShowToast('Peti Harta Karun dibuka! +30 Syiling Sejarah');
        }
      } else if (target.type === 'guide') {
        callbacksRef.current.onTalkToGuide();
      }
    };
    triggerInteract.current = handleInteract;

    const onKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

      keys[e.code] = true;
      if (e.code === 'Space') {
        if (!pausedRef.current) e.preventDefault();
        jumpQueued = true;
      }
      if (e.code === 'KeyE' || e.code === 'Enter') {
        if (!pausedRef.current) {
          handleInteract();
        }
      }
      if (e.code === 'KeyF' && !pausedRef.current) {
        soundEngine.playClick();
        emoteRef.current = { state: 'wave', until: performance.now() + 2400 };
      }
      if (e.code === 'KeyG' && !pausedRef.current) {
        soundEngine.playCoin();
        emoteRef.current = { state: 'dance', until: performance.now() + 2800 };
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };

    // Camera drag orbit on canvas
    let isDragging = false;
    let dragDistance = 0;
    let lastPtrX = 0;
    let lastPtrY = 0;
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      dragDistance = 0;
      lastPtrX = e.clientX;
      lastPtrY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || pausedRef.current) return;
      const dx = e.clientX - lastPtrX;
      const dy = e.clientY - lastPtrY;
      dragDistance += Math.hypot(dx, dy);
      lastPtrX = e.clientX;
      lastPtrY = e.clientY;

      ps.camYaw -= dx * 0.0065;
      ps.camPitch = THREE.MathUtils.clamp(ps.camPitch + dy * 0.005, 0.14, 1.05);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      // Treat crisp tap/click (< 6px drag) as 3D object click check
      if (dragDistance < 6 && !pausedRef.current) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointerNdc, camera);

        // Check portals
        for (const p of world.portals) {
          if (raycaster.intersectObject(p.group, true).length > 0) {
            if (Math.hypot(ps.x - p.position.x, ps.z - p.position.z) <= 8.5) {
              soundEngine.playPortal();
              callbacksRef.current.onEnterPortal(p.id);
              return;
            }
          }
        }
        // Check chests
        for (const ch of world.chests) {
          if (!ch.opened && raycaster.intersectObject(ch.group, true).length > 0) {
            if (Math.hypot(ps.x - ch.position.x, ps.z - ch.position.z) <= 6.5) {
              ch.opened = true;
              ch.glowMesh.visible = false;
              soundEngine.playChest();
              spawnBurst(ch.position.x, ch.position.y + 1.0, ch.position.z, 0xfacc15);
              emoteRef.current = { state: 'celebrate', until: performance.now() + 2600 };
              callbacksRef.current.onOpenChest(ch.id);
              callbacksRef.current.onShowToast('Peti Harta Karun dibuka! +30 Syiling Sejarah');
              return;
            }
          }
        }
        // Check Tok Guru
        if (raycaster.intersectObject(world.guide.root, true).length > 0) {
          if (
            Math.hypot(ps.x - world.guidePosition.x, ps.z - world.guidePosition.z) <=
            7.5
          ) {
            callbacksRef.current.onTalkToGuide();
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (pausedRef.current) return;
      ps.camDist = THREE.MathUtils.clamp(ps.camDist + e.deltaY * 0.008, 6.0, 18.0);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    domEl.addEventListener('wheel', onWheel, { passive: true });

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = Math.max(container.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 9. Game Loop (Clock + Software-WebGL Pacing)
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const updatePhysicsAndControls = (delta: number, elapsed: number) => {
      if (!pausedRef.current) {
        // Gather keyboard + virtual joystick vector
        let ix = 0;
        let iz = 0;
        if (keys['KeyW'] || keys['ArrowUp']) iz -= 1;
        if (keys['KeyS'] || keys['ArrowDown']) iz += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) ix -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) ix += 1;

        const touch = touchInputRef.current;
        if (Math.abs(touch.moveX) > 0.08 || Math.abs(touch.moveY) > 0.08) {
          ix += touch.moveX;
          iz += touch.moveY;
        }
        if (touch.jumpPressed) {
          jumpQueued = true;
          touch.jumpPressed = false;
        }

        const inputLen = Math.hypot(ix, iz);
        let speedRatio = 0;
        const isSprinting =
          Boolean(keys['ShiftLeft'] || keys['ShiftRight'] || sprintToggleRef.current);

        if (inputLen > 0.05) {
          const nx = ix / Math.max(inputLen, 1);
          const nz = iz / Math.max(inputLen, 1);

          // Rotate input relative to camera yaw
          const sinY = Math.sin(ps.camYaw);
          const cosY = Math.cos(ps.camYaw);
          const worldX = nx * cosY + nz * sinY;
          const worldZ = -nx * sinY + nz * cosY;

          const moveSpeed = isSprinting ? 13.0 : 8.8;
          ps.x += worldX * moveSpeed * delta;
          ps.z += worldZ * moveSpeed * delta;

          // Smoothly rotate character toward movement direction
          const targetYaw = Math.atan2(worldX, worldZ);
          let diff = targetYaw - ps.yaw;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          ps.yaw += diff * Math.min(1, delta * 12);

          speedRatio = Math.min(inputLen, 1);
        }

        // Jump & Gravity
        if (jumpQueued && ps.grounded) {
          ps.vy = 10.6;
          ps.grounded = false;
          soundEngine.playJump();
        }
        jumpQueued = false;

        ps.vy -= 26.0 * delta;
        ps.y += ps.vy * delta;

        // Island radial boundary keep inside village shore
        const distFromCenter = Math.hypot(ps.x, ps.z);
        if (distFromCenter > 33.6) {
          const scale = 33.6 / distFromCenter;
          ps.x *= scale;
          ps.z *= scale;
        }

        // Resolve circle colliders (pillars, trees, cliff, chests, Tok Guru)
        const playerRadius = 0.55;
        for (let i = 0; i < world.colliders.length; i++) {
          const col = world.colliders[i];
          const dx = ps.x - col.x;
          const dz = ps.z - col.z;
          const dist = Math.hypot(dx, dz);
          const minDist = col.radius + playerRadius;
          if (dist < minDist && dist > 0.0001) {
            const push = (minDist - dist) / dist;
            ps.x += dx * push;
            ps.z += dz * push;
          }
        }

        // Ground snap
        const groundY = groundHeightAt(ps.x, ps.z);
        if (ps.y <= groundY) {
          ps.y = groundY;
          ps.vy = 0;
          ps.grounded = true;
        } else {
          ps.grounded = false;
        }

        // Update avatar transform & articulated R15 animation state
        const activeRig = playerRigRef.current;
        if (activeRig) {
          activeRig.root.position.set(ps.x, ps.y, ps.z);
          activeRig.root.rotation.y = ps.yaw;

          let animState: AvatarAnimState = 'idle';
          if (!ps.grounded) {
            animState = 'jump';
          } else if (speedRatio > 0.05) {
            animState = isSprinting ? 'run' : 'walk';
          } else if (
            emoteRef.current &&
            performance.now() < emoteRef.current.until
          ) {
            animState = emoteRef.current.state;
          }

          animatePlayerAvatar(
            activeRig,
            elapsed,
            animState,
            speedRatio,
            ps.vy,
            delta,
          );
        }

        // Auto-collect Coins
        for (let i = 0; i < world.coins.length; i++) {
          const cn = world.coins[i];
          if (!cn.collected) {
            const dCoin = Math.hypot(ps.x - cn.position.x, ps.z - cn.position.z);
            if (dCoin < 1.35 && Math.abs(ps.y - cn.position.y) < 2.2) {
              cn.collected = true;
              cn.mesh.visible = false;
              soundEngine.playCoin();
              spawnBurst(cn.position.x, cn.position.y, cn.position.z, 0xfacc15);
              callbacksRef.current.onCollectCoin();
            }
          }
        }

        // Auto-collect Glowing Crystals
        for (let i = 0; i < world.crystals.length; i++) {
          const cr = world.crystals[i];
          if (!cr.collected) {
            const dCrys = Math.hypot(ps.x - cr.position.x, ps.z - cr.position.z);
            if (dCrys < 1.55) {
              cr.collected = true;
              cr.group.visible = false;
              soundEngine.playCrystal();
              spawnBurst(cr.position.x, cr.position.y + 1.0, cr.position.z, 0x38bdf8);
              emoteRef.current = { state: 'celebrate', until: performance.now() + 2800 };
              callbacksRef.current.onCollectCrystal(cr.id);
              callbacksRef.current.onShowToast('Kristal Purba ditemui! +20 Syiling Sejarah');
            }
          }
        }

        // Proximity Detection (Portals, Chests, Tok Guru)
        let nextNearby: NearbyTarget = null;
        let bestDist = 4.2;

        // Check Tok Guru
        const dGuide = Math.hypot(
          ps.x - world.guidePosition.x,
          ps.z - world.guidePosition.z,
        );
        if (dGuide < 3.4) {
          bestDist = dGuide;
          nextNearby = {
            type: 'guide',
            id: 'tok-guru',
            label: 'Bicara dengan Tok Guru Sejarah',
          };
        }

        // Check Unopened Chests
        for (let i = 0; i < world.chests.length; i++) {
          const ch = world.chests[i];
          if (!ch.opened) {
            const dChest = Math.hypot(ps.x - ch.position.x, ps.z - ch.position.z);
            if (dChest < 3.0 && dChest < bestDist) {
              bestDist = dChest;
              nextNearby = {
                type: 'chest',
                id: ch.id,
                label: 'Buka Peti Harta Karun (+30 Syiling)',
              };
            }
          }
        }

        // Check 8 Mission Portals
        for (let i = 0; i < world.portals.length; i++) {
          const p = world.portals[i];
          const dPortal = Math.hypot(ps.x - p.position.x, ps.z - p.position.z);
          if (dPortal < 4.0) {
            const topic = MISSION_TOPICS.find((t) => t.id === p.id)!;
            nextNearby = {
              type: 'portal',
              id: p.id,
              label: `Masuk Portal ${p.id}: ${topic.title}`,
              color: topic.colorHex,
            };
            break;
          }
        }

        // Emit nearby change only when target identity changes
        const prev = ps.nearby;
        const changed =
          prev?.type !== nextNearby?.type || prev?.id !== nextNearby?.id;
        if (changed) {
          ps.nearby = nextNearby;
          callbacksRef.current.onNearbyChange(nextNearby);
        }
      } else {
        // Still animate idle or celebratory dance while modal open
        const activeRig = playerRigRef.current;
        if (activeRig) {
          const modalEmote =
            emoteRef.current && performance.now() < emoteRef.current.until
              ? emoteRef.current.state
              : 'idle';
          animatePlayerAvatar(activeRig, elapsed, modalEmote, 0, 0, delta);
        }
      }

      // Update Burst Sparkles
      for (let i = 0; i < burstParticles.length; i++) {
        const bp = burstParticles[i];
        if (bp.life > 0) {
          bp.life -= delta;
          bp.vy -= 12 * delta;
          bp.mesh.position.x += bp.vx * delta;
          bp.mesh.position.y += bp.vy * delta;
          bp.mesh.position.z += bp.vz * delta;
          bp.mesh.rotation.x += delta * 6;
          bp.mesh.rotation.y += delta * 6;
          if (bp.life <= 0) bp.mesh.visible = false;
        }
      }

      // Smooth Damped Third-Person Camera Follow
      const horizDist = Math.cos(ps.camPitch) * ps.camDist;
      const vertDist = Math.sin(ps.camPitch) * ps.camDist;
      _camDesired.set(
        ps.x + Math.sin(ps.camYaw) * horizDist,
        Math.max(
          groundHeightAt(
            ps.x + Math.sin(ps.camYaw) * horizDist,
            ps.z + Math.cos(ps.camYaw) * horizDist,
          ) + 1.2,
          ps.y + 1.8 + vertDist,
        ),
        ps.z + Math.cos(ps.camYaw) * horizDist,
      );
      camera.position.x = THREE.MathUtils.damp(
        camera.position.x,
        _camDesired.x,
        9,
        delta,
      );
      camera.position.y = THREE.MathUtils.damp(
        camera.position.y,
        _camDesired.y,
        9,
        delta,
      );
      camera.position.z = THREE.MathUtils.damp(
        camera.position.z,
        _camDesired.z,
        9,
        delta,
      );

      _camLookAt.set(ps.x, ps.y + 1.65, ps.z);
      camera.lookAt(_camLookAt);
    };

    const updatePortalDomLabels = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      for (let i = 0; i < world.portals.length; i++) {
        const p = world.portals[i];
        const btn = labelRefs.current[p.id];
        if (!btn) continue;

        const dist = Math.hypot(
          playerStateRef.current.x - p.position.x,
          playerStateRef.current.z - p.position.z,
        );
        _projVec.set(p.position.x, p.position.y + 7.45, p.position.z);
        _projVec.project(camera);

        const inFront = _projVec.z > 0 && _projVec.z < 1;
        const sx = ((_projVec.x + 1) / 2) * w;
        const sy = ((-_projVec.y + 1) / 2) * h;
        const onScreen =
          inFront && sx > 60 && sx < w - 60 && sy > 75 && sy < h - 85 && dist < 44;

        if (onScreen && !pausedRef.current) {
          btn.style.opacity = dist < 24 ? '1' : '0.82';
          btn.style.pointerEvents = 'auto';
          btn.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -100%)`;
        } else {
          btn.style.opacity = '0';
          btn.style.pointerEvents = 'none';
        }
      }
    };

    // Set initial camera placement immediately
    camera.position.set(ps.x, ps.y + 5.2, ps.z - 9.5);
    camera.lookAt(ps.x, ps.y + 1.6, ps.z);

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      const dGuide = Math.hypot(
        playerStateRef.current.x - world.guidePosition.x,
        playerStateRef.current.z - world.guidePosition.z,
      );
      world.update(elapsed, delta, dGuide < 4.2);
      updatePhysicsAndControls(delta, elapsed);
      updatePortalDomLabels();

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domEl.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);

      if (playerRigRef.current) {
        scene.remove(playerRigRef.current.root);
        disposeAvatarTree(playerRigRef.current.root);
        playerRigRef.current = null;
      }
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry.dispose();
          if (Array.isArray(m.material)) {
            m.material.forEach((mat) => mat.dispose());
          } else {
            m.material.dispose();
          }
        }
      });
      sceneRef.current = null;
      textures.dispose();
      envTex.dispose();
      burstGeo.dispose();
      burstMat.dispose();
      renderer.dispose();
      if (domEl.parentNode === container) {
        container.removeChild(domEl);
      }
    };
    // Intentionally mounted once; dynamic updates handled via refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Dedicated WebGL Mount Container */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Projected 3D Portal Floating Labels */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-[5]">
        {MISSION_TOPICS.map((topic) => {
          const isDone = completedMissions.includes(topic.id);
          return (
            <button
              key={topic.id}
              ref={(el) => {
                labelRefs.current[topic.id] = el;
              }}
              type="button"
              onClick={() => {
                soundEngine.playPortal();
                onEnterPortal(topic.id);
              }}
              style={{
                opacity: 0,
                borderColor: topic.colorHex,
              }}
              className="absolute top-0 left-0 px-3 py-1.5 rounded-xl bg-slate-900/90 border-2 text-white shadow-lg transition-opacity duration-150 flex items-center gap-2 whitespace-nowrap hover:scale-105 focus-visible:outline-2 focus-visible:outline-amber-400"
            >
              <span
                className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold text-slate-950 font-mono-num shrink-0"
                style={{ backgroundColor: topic.colorHex }}
              >
                {topic.id}
              </span>
              <span className="text-xs font-semibold tracking-tight">
                {topic.title}
              </span>
              {isDone && (
                <span className="text-amber-300 text-xs font-bold">★</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
