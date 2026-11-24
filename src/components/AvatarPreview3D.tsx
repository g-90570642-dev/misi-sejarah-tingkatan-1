import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  animatePlayerAvatar,
  createPlayerAvatar,
  PlayerRig,
} from '../three/playerAvatar';
import { AvatarAnimState, AvatarConfig } from '../types/game';

interface AvatarPreview3DProps {
  avatarConfig: AvatarConfig;
  animState?: AvatarAnimState;
  className?: string;
}

function disposeObjectTree(root: THREE.Object3D) {
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

export const AvatarPreview3D: React.FC<AvatarPreview3DProps> = ({
  avatarConfig,
  animState = 'idle',
  className = 'w-full h-56',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rigRef = useRef<PlayerRig | null>(null);
  const animRef = useRef<AvatarAnimState>(animState);
  animRef.current = animState;
  const yawRef = useRef(0.3);

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
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    renderer.setSize(container.clientWidth, Math.max(container.clientHeight, 1));
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    sceneRef.current = scene;

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTex = pmrem.fromScene(roomEnv, 0.04).texture;
    scene.environment = envTex;
    roomEnv.dispose();
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      30,
    );
    camera.position.set(0, 1.55, 4.55);
    camera.lookAt(0, 1.24, 0);

    const hemi = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 0.95);
    scene.add(hemi);
    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.55);
    keyLight.position.set(4, 7, 6);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.55);
    rimLight.position.set(-4, 3, -5);
    scene.add(rimLight);

    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 1.28, 0.24, 24),
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.45,
        metalness: 0.3,
      }),
    );
    ped.position.y = -0.12;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.16, 0.035, 8, 28),
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.35,
        metalness: 0.7,
        roughness: 0.25,
      }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.01;
    scene.add(ped, ring);

    let dragging = false;
    let lastX = 0;
    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      yawRef.current += dx * 0.014;
    };
    const onPointerUp = () => {
      dragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / Math.max(container.clientHeight, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, Math.max(container.clientHeight, 1));
    };
    window.addEventListener('resize', onResize);

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
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      const rig = rigRef.current;
      if (rig) {
        if (!dragging && animRef.current === 'idle') {
          yawRef.current = 0.25 + Math.sin(elapsed * 0.65) * 0.22;
        }
        rig.root.rotation.y = yawRef.current;
        animatePlayerAvatar(rig, elapsed, animRef.current, 0, 0, delta);
      }

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
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);

      if (rigRef.current) {
        scene.remove(rigRef.current.root);
        disposeObjectTree(rigRef.current.root);
        rigRef.current = null;
      }
      scene.remove(ped, ring);
      disposeObjectTree(ped);
      disposeObjectTree(ring);
      envTex.dispose();
      renderer.dispose();
      if (domEl.parentNode === container) {
        container.removeChild(domEl);
      }
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (rigRef.current) {
      scene.remove(rigRef.current.root);
      disposeObjectTree(rigRef.current.root);
      rigRef.current = null;
    }
    const nextRig = createPlayerAvatar(avatarConfig);
    nextRig.root.rotation.y = yawRef.current;
    scene.add(nextRig.root);
    rigRef.current = nextRig;
  }, [avatarConfig]);

  return (
    <div
      ref={mountRef}
      className={`rounded-2xl overflow-hidden border border-white/15 bg-slate-950 cursor-grab active:cursor-grabbing ${className}`}
    />
  );
};
