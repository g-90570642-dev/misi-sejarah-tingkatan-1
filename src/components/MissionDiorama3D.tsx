import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PortalId } from '../types/game';
import {
  createHistorianNpc,
  HistorianId,
  HistorianRig,
} from '../three/historicalCharacters';

interface MissionDiorama3DProps {
  portalId: PortalId;
  stageIndex: number; // advances subtle diorama animations
  colorHex: string;
  activeHistorianId?: HistorianId;
}

export const MissionDiorama3D: React.FC<MissionDiorama3DProps> = ({
  portalId,
  stageIndex,
  colorHex,
  activeHistorianId,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef(stageIndex);
  stageRef.current = stageIndex;
  const activeHistorianRef = useRef<HistorianId | undefined>(activeHistorianId);
  activeHistorianRef.current = activeHistorianId;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const probe = document.createElement('canvas');
      const gl = probe.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bgColor = new THREE.Color(colorHex).lerp(new THREE.Color(0x0f172a), 0.72);
    scene.background = bgColor;
    scene.fog = new THREE.Fog(bgColor, 14, 34);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTex = pmrem.fromScene(roomEnv, 0.04).texture;
    scene.environment = envTex;
    roomEnv.dispose();
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      60,
    );
    camera.position.set(0, 4.6, 10.2);
    camera.lookAt(0, 1.4, 0);

    const hemi = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 0.9);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xfffbeb, 1.5);
    key.position.set(6, 10, 8);
    scene.add(key);

    // Base themed platform
    const diorama = new THREE.Group();
    scene.add(diorama);

    const accentColor = new THREE.Color(colorHex);
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(5.8, 6.2, 0.6, 12),
      new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.78,
        metalness: 0.1,
      }),
    );
    floor.position.y = -0.3;
    diorama.add(floor);

    const floorTrim = new THREE.Mesh(
      new THREE.TorusGeometry(5.75, 0.12, 8, 36),
      new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: 0.35,
        metalness: 0.5,
        roughness: 0.3,
      }),
    );
    floorTrim.rotation.x = Math.PI / 2;
    floorTrim.position.y = 0.02;
    diorama.add(floorTrim);

    const animatedParts: Array<{
      obj: THREE.Object3D;
      mode: 'spin' | 'bob' | 'domino';
      baseY: number;
      idx: number;
    }> = [];
    const historianRigs: Array<{ rig: HistorianRig; baseZ: number; idx: number }> = [];

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.85,
      roughness: 0.22,
    });
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.8,
    });
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x92400e,
      roughness: 0.78,
    });

    if (portalId === 1) {
      // Ancient Magical Library: Bookshelves + floating books + chest
      [-3.2, 0, 3.2].forEach((bx, idx) => {
        const shelf = new THREE.Mesh(
          new THREE.BoxGeometry(2.1, 3.2, 0.65),
          woodMat,
        );
        shelf.position.set(bx, 1.6, -2.0 + Math.abs(bx) * 0.25);
        shelf.rotation.y = -bx * 0.12;
        diorama.add(shelf);
        for (let r = 0; r < 3; r++) {
          const row = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 0.36, 0.7),
            new THREE.MeshStandardMaterial({
              color: [0xf59e0b, 0x38bdf8, 0x10b981][(idx + r) % 3],
              roughness: 0.5,
            }),
          );
          row.position.set(bx, 0.8 + r * 0.9, -1.96 + Math.abs(bx) * 0.25);
          row.rotation.y = -bx * 0.12;
          diorama.add(row);
        }
      });
      // Floating glowing magic books
      [-1.8, 1.8].forEach((fx, i) => {
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(0.85, 0.18, 0.65),
          goldMat,
        );
        book.position.set(fx, 2.2, 1.4);
        diorama.add(book);
        animatedParts.push({ obj: book, mode: 'bob', baseY: 2.2, idx: i });
      });
      // Center treasure chest
      const chest = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.95, 1.0),
        woodMat,
      );
      chest.position.set(0, 0.48, 0.9);
      const lid = new THREE.Mesh(
        new THREE.BoxGeometry(1.56, 0.26, 1.04),
        goldMat,
      );
      lid.position.set(0, 1.05, 0.9);
      diorama.add(chest, lid);
    } else if (portalId === 2) {
      // Ancient Historians' City: 5 Detailed 3D Historical NPC Characters on Marble Plazas
      const historianIds: HistorianId[] = [
        'herodotus',
        'eh-carr',
        'ibn-khaldun',
        'muhd-yusof',
        'khoo-kay-kim',
      ];
      historianIds.forEach((hId, idx) => {
        const ang = (idx - 2) * 0.48;
        const x = Math.sin(ang) * 3.8;
        const baseZ = -Math.cos(ang) * 2.1 + 1.2;
        const rig = createHistorianNpc(hId);
        rig.root.position.set(x, 0.22, baseZ);
        rig.root.rotation.y = -ang * 0.45;
        rig.root.scale.setScalar(0.9);
        diorama.add(rig.root);

        // Marble pedestal beneath each historian
        const ped = new THREE.Mesh(
          new THREE.CylinderGeometry(0.68, 0.78, 0.22, 8),
          stoneMat,
        );
        ped.position.set(x, 0.11, baseZ);
        diorama.add(ped);

        historianRigs.push({ rig, baseZ, idx });
      });

      // Ancient Historian Arch Pillar in background
      const obelisk = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 2.7, 0.95),
        stoneMat,
      );
      obelisk.position.set(0, 1.35, -2.5);
      const obeliskCap = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.55, 0),
        goldMat,
      );
      obeliskCap.position.set(0, 3.0, -2.5);
      diorama.add(obelisk, obeliskCap);
      animatedParts.push({ obj: obeliskCap, mode: 'bob', baseY: 3.0, idx: 0 });
    } else if (portalId === 3) {
      // Magical Time-Travel World: Rotating clock rings & hourglass
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(1.5 + i * 0.75, 0.09, 10, 32),
          i % 2 === 0 ? goldMat : new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x0284c7,
            emissiveIntensity: 0.5,
          }),
        );
        ring.position.set(0, 2.1, 0);
        diorama.add(ring);
        animatedParts.push({ obj: ring, mode: 'spin', baseY: 2.1, idx: i });
      }
      const core = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.65, 0),
        goldMat,
      );
      core.position.set(0, 2.1, 0);
      diorama.add(core);
      animatedParts.push({ obj: core, mode: 'bob', baseY: 2.1, idx: 4 });
    } else if (portalId === 4) {
      // Archaeological Museum: Pedestals, Batu Bersurat & chests
      [-2.8, 0, 2.8].forEach((px, idx) => {
        const ped = new THREE.Mesh(
          new THREE.BoxGeometry(1.3, 1.1, 1.3),
          stoneMat,
        );
        ped.position.set(px, 0.55, idx === 1 ? -0.8 : 0.4);
        diorama.add(ped);
        const item = new THREE.Mesh(
          idx === 1
            ? new THREE.BoxGeometry(0.85, 1.35, 0.28)
            : new THREE.OctahedronGeometry(0.45, 0),
          idx === 1
            ? new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 })
            : goldMat,
        );
        item.position.set(px, 1.75, idx === 1 ? -0.8 : 0.4);
        diorama.add(item);
        animatedParts.push({ obj: item, mode: 'bob', baseY: 1.75, idx });
      });
    } else if (portalId === 5) {
      // Archaeological Excavation Site: Grid pit, tent & ship mast
      for (let gx = -1; gx <= 1; gx++) {
        for (let gz = -1; gz <= 1; gz++) {
          const tile = new THREE.Mesh(
            new THREE.BoxGeometry(1.15, 0.25, 1.15),
            new THREE.MeshStandardMaterial({
              color: (gx + gz) % 2 === 0 ? 0xb45309 : 0x92400e,
              roughness: 0.9,
            }),
          );
          tile.position.set(gx * 1.3, 0.14, gz * 1.3);
          diorama.add(tile);
        }
      }
      const tent = new THREE.Mesh(
        new THREE.ConeGeometry(1.4, 1.8, 4),
        new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.75 }),
      );
      tent.position.set(-3.1, 0.9, -1.2);
      tent.rotation.y = Math.PI / 4;
      diorama.add(tent);
      const relic = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.22, 0.75, 10),
        goldMat,
      );
      relic.position.set(0, 0.85, 0);
      diorama.add(relic);
      animatedParts.push({ obj: relic, mode: 'bob', baseY: 0.85, idx: 0 });
    } else if (portalId === 6) {
      // Fantasy Kingdom Dominoes: 5 giant colorful dominoes & bridge
      const domColors = [0xf97316, 0xf59e0b, 0x10b981, 0x0ea5e9, 0x8b5cf6];
      domColors.forEach((col, idx) => {
        const dom = new THREE.Mesh(
          new THREE.BoxGeometry(0.38, 2.2, 1.25),
          new THREE.MeshStandardMaterial({
            color: col,
            roughness: 0.4,
            metalness: 0.2,
          }),
        );
        dom.position.set(-2.6 + idx * 1.3, 1.1, 0);
        diorama.add(dom);
        animatedParts.push({ obj: dom, mode: 'domino', baseY: 1.1, idx });
      });
    } else if (portalId === 7) {
      // Historical Detective City: Lamps, evidence pillars & magnifying crystal
      [-2.8, 2.8].forEach((lx) => {
        const pole = new THREE.Mesh(
          new THREE.BoxGeometry(0.26, 2.8, 0.26),
          stoneMat,
        );
        pole.position.set(lx, 1.4, -1.2);
        const lamp = new THREE.Mesh(
          new THREE.BoxGeometry(0.55, 0.55, 0.55),
          new THREE.MeshStandardMaterial({
            color: 0xfef08a,
            emissive: 0x14b8a6,
            emissiveIntensity: 0.8,
          }),
        );
        lamp.position.set(lx, 2.9, -1.2);
        diorama.add(pole, lamp);
      });
      const lensRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.15, 0.16, 10, 24),
        goldMat,
      );
      lensRing.position.set(0, 2.1, 0);
      diorama.add(lensRing);
      animatedParts.push({ obj: lensRing, mode: 'spin', baseY: 2.1, idx: 0 });
    } else {
      // Heritage Kingdom (Mission 8): Royal palace towers & 5 glowing treasures
      const spireMat = new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        roughness: 0.5,
      });
      [-2.6, 0, 2.6].forEach((tx, idx) => {
        const h = idx === 1 ? 2.8 : 2.0;
        const tower = new THREE.Mesh(
          new THREE.BoxGeometry(1.3, h, 1.3),
          stoneMat,
        );
        tower.position.set(tx, h / 2, -1.5);
        const roof = new THREE.Mesh(
          new THREE.ConeGeometry(1.1, 1.2, 4),
          idx === 1 ? goldMat : spireMat,
        );
        roof.rotation.y = Math.PI / 4;
        roof.position.set(tx, h + 0.6, -1.5);
        diorama.add(tower, roof);
      });
      for (let t = 0; t < 5; t++) {
        const gem = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.32, 0),
          goldMat,
        );
        gem.position.set(-2.4 + t * 1.2, 0.9, 1.4);
        diorama.add(gem);
        animatedParts.push({ obj: gem, mode: 'bob', baseY: 0.9, idx: t });
      }
    }

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

    function tick() {
      if (disposed) return;
      const elapsed = clock.getElapsedTime();
      diorama.rotation.y = Math.sin(elapsed * 0.35) * 0.18;

      for (let i = 0; i < animatedParts.length; i++) {
        const p = animatedParts[i];
        if (p.mode === 'bob') {
          p.obj.position.y = p.baseY + Math.sin(elapsed * 2.2 + p.idx) * 0.16;
          p.obj.rotation.y = elapsed * 0.9 + p.idx;
        } else if (p.mode === 'spin') {
          p.obj.rotation.y = elapsed * (0.6 + p.idx * 0.25);
          p.obj.rotation.x = Math.sin(elapsed * 0.8 + p.idx) * 0.45;
        } else if (p.mode === 'domino') {
          const tipped = p.idx < stageRef.current + 1;
          const targetZ = tipped ? -0.45 : 0;
          p.obj.rotation.z += (targetZ - p.obj.rotation.z) * 0.08;
        }
      }

      // Animate 5 3D Historian NPCs in Mission 2
      for (let i = 0; i < historianRigs.length; i++) {
        const item = historianRigs[i];
        const { rig, baseZ, idx } = item;
        const isActive = activeHistorianRef.current === rig.id;
        if (isActive) {
          rig.root.position.y = 0.22 + Math.abs(Math.sin(elapsed * 4.5)) * 0.09;
          rig.root.position.z = THREE.MathUtils.lerp(rig.root.position.z, baseZ + 0.55, 0.12);
          rig.rightArm.rotation.x = -2.1 + Math.sin(elapsed * 6.5) * 0.45;
          rig.rightArm.rotation.z = 0.35 + Math.cos(elapsed * 5.0) * 0.2;
          rig.leftArm.rotation.x = -0.5 + Math.sin(elapsed * 4.5) * 0.15;
          rig.head.rotation.y = Math.sin(elapsed * 2.5) * 0.14;
          rig.mouthOpen.scale.y = 0.15 + Math.abs(Math.sin(elapsed * 12.0)) * 0.85;
        } else {
          rig.root.position.y = 0.22 + Math.sin(elapsed * 2.0 + idx) * 0.03;
          rig.root.position.z = THREE.MathUtils.lerp(rig.root.position.z, baseZ, 0.1);
          rig.rightArm.rotation.x = -0.25 + Math.sin(elapsed * 2.2 + idx) * 0.14;
          rig.rightArm.rotation.z = 0.12;
          rig.leftArm.rotation.x = -0.4;
          rig.head.rotation.y = Math.sin(elapsed * 1.1 + idx) * 0.12;
          rig.mouthOpen.scale.y = 0.05;
        }
      }

      renderer.render(scene, camera);
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / Math.max(container.clientHeight, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', onResize);
      envTex.dispose();
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
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [portalId, colorHex]);

  return (
    <div
      ref={mountRef}
      className="w-full h-40 sm:h-48 rounded-2xl overflow-hidden border border-white/15 bg-slate-950"
    />
  );
};
