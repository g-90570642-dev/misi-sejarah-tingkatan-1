import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  Check,
  Palette,
  RotateCw,
  Shirt,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import {
  AVATAR_COLORS,
  HAIR_COLORS,
  PANTS_COLORS,
  SHOE_COLORS,
  SKIN_TONES,
} from '../data/sejarahBab1';
import { createPlayerAvatar, animatePlayerAvatar, PlayerRig } from '../three/playerAvatar';
import {
  AccessoryId,
  AvatarAnimState,
  AvatarConfig,
  BackpackId,
  HairStyleId,
  ShirtStyleId,
  ShoeStyleId,
} from '../types/game';
import { soundEngine } from '../utils/audio';

interface AvatarCustomizerModalProps {
  initialName: string;
  initialConfig: AvatarConfig;
  onSave: (name: string, config: AvatarConfig) => void;
  onClose: () => void;
}

const HAIR_OPTIONS: Array<{ id: HairStyleId; label: string }> = [
  { id: 'spiky', label: 'Pacak' },
  { id: 'side-part', label: 'Belah Tepi' },
  { id: 'bob', label: 'Bob Kemas' },
  { id: 'ponytail', label: 'Ekor Kuda' },
  { id: 'curly', label: 'Keriting' },
  { id: 'hijab', label: 'Tudung' },
];

const SHIRT_OPTIONS: Array<{ id: ShirtStyleId; label: string }> = [
  { id: 'explorer', label: 'Penjelajah' },
  { id: 'jacket', label: 'Jaket' },
  { id: 'kurung', label: 'Baju Tradisi' },
  { id: 'hoodie', label: 'Hoodie' },
  { id: 'royal', label: 'Diraja' },
];

const SHOE_OPTIONS: Array<{ id: ShoeStyleId; label: string }> = [
  { id: 'sneakers', label: 'Kasut Sukan' },
  { id: 'boots', label: 'But Kembara' },
  { id: 'sandals', label: 'Sandal Purba' },
  { id: 'royal', label: 'But Emas' },
];

const ACCESSORY_OPTIONS: Array<{ id: AccessoryId; label: string }> = [
  { id: 'safari-hat', label: 'Topi Kembara' },
  { id: 'glasses', label: 'Cermin Mata' },
  { id: 'headband', label: 'Ikat Kepala' },
  { id: 'crown', label: 'Mahkota' },
  { id: 'none', label: 'Tiada' },
];

const BACKPACK_OPTIONS: Array<{ id: BackpackId; label: string }> = [
  { id: 'explorer-pack', label: 'Beg Kembara' },
  { id: 'jet-scroll', label: 'Skrol Ilmu' },
  { id: 'satchel', label: 'Beg Silang' },
  { id: 'none', label: 'Tiada' },
];

const PREVIEW_EMOTES: Array<{ id: AvatarAnimState; label: string }> = [
  { id: 'idle', label: 'Diam' },
  { id: 'walk', label: 'Jalan' },
  { id: 'run', label: 'Lari' },
  { id: 'wave', label: 'Lambai' },
  { id: 'dance', label: 'Tarian' },
  { id: 'celebrate', label: 'Raikan' },
];

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

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({
  initialName,
  initialConfig,
  onSave,
  onClose,
}) => {
  const [draftName, setDraftName] = useState(initialName);
  const [draftConfig, setDraftConfig] = useState<AvatarConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<'asas' | 'rambut' | 'pakaian' | 'aksesori'>('asas');
  const [previewAnim, setPreviewAnim] = useState<AvatarAnimState>('idle');

  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const avatarRigRef = useRef<PlayerRig | null>(null);
  const previewAnimRef = useRef<AvatarAnimState>(previewAnim);
  previewAnimRef.current = previewAnim;
  const yawRef = useRef(0.32);

  // Initialize persistent 3D Studio WebGL preview scene once
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
    renderer.setSize(container.clientWidth, container.clientHeight);
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
      40,
    );
    camera.position.set(0, 1.55, 4.65);
    camera.lookAt(0, 1.25, 0);

    const hemi = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 0.95);
    scene.add(hemi);
    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.55);
    keyLight.position.set(4, 7, 6);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.65);
    rimLight.position.set(-4, 3, -5);
    scene.add(rimLight);

    // Pedestal Turntable
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(1.25, 1.4, 0.28, 24),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45, metalness: 0.3 }),
    );
    pedestal.position.y = -0.14;
    const pedRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.26, 0.04, 8, 32),
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.4,
        metalness: 0.7,
        roughness: 0.25,
      }),
    );
    pedRing.rotation.x = Math.PI / 2;
    pedRing.position.y = 0.01;
    scene.add(pedestal, pedRing);

    // Drag to rotate 3D avatar
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
      renderer.setSize(container.clientWidth, container.clientHeight);
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

      const rig = avatarRigRef.current;
      if (rig) {
        rig.root.rotation.y = yawRef.current;
        const st = previewAnimRef.current;
        animatePlayerAvatar(rig, elapsed, st, st === 'walk' || st === 'run' ? 1 : 0, 0, delta);
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

      if (avatarRigRef.current) {
        scene.remove(avatarRigRef.current.root);
        disposeObjectTree(avatarRigRef.current.root);
        avatarRigRef.current = null;
      }
      scene.remove(pedestal, pedRing);
      disposeObjectTree(pedestal);
      disposeObjectTree(pedRing);
      envTex.dispose();
      renderer.dispose();
      if (domEl.parentNode === container) {
        container.removeChild(domEl);
      }
      sceneRef.current = null;
    };
  }, []);

  // Rebuild avatar cleanly inside the preview scene whenever draftConfig changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (avatarRigRef.current) {
      scene.remove(avatarRigRef.current.root);
      disposeObjectTree(avatarRigRef.current.root);
      avatarRigRef.current = null;
    }
    const nextRig = createPlayerAvatar(draftConfig);
    nextRig.root.position.set(0, 0, 0);
    nextRig.root.rotation.y = yawRef.current;
    scene.add(nextRig.root);
    avatarRigRef.current = nextRig;
  }, [draftConfig]);

  const updateField = <K extends keyof AvatarConfig>(key: K, val: AvatarConfig[K]) => {
    soundEngine.playClick();
    setDraftConfig((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-2.5 sm:p-5">
      <div className="w-full max-w-4xl max-h-[94vh] bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base sm:text-xl text-white">
                Studio Avatar Penjelajah 3D
              </h2>
              <p className="text-xs text-slate-400">
                Ubah rupa bentuk watak 3D anda dan seret pratonton untuk memusingkan avatar.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup studio avatar"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto custom-scroll p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Column: Live 3D Preview + Emotes + Name */}
          <div className="md:col-span-5 flex flex-col gap-3">
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-slate-950 h-64 sm:h-72">
              <div
                ref={mountRef}
                className="w-full h-full cursor-grab active:cursor-grabbing"
              />
              <button
                type="button"
                onClick={() => {
                  yawRef.current += Math.PI / 2;
                }}
                title="Pusingkan 90 darjah"
                className="absolute top-2.5 right-2.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-white/15 text-xs text-slate-200 flex items-center gap-1 hover:bg-slate-800 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Pusing</span>
              </button>
              <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-white/10 text-[11px] text-slate-300 pointer-events-none">
                Seret untuk pusing 360°
              </div>
            </div>

            {/* Animation / Emote Preview Buttons */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                Uji Animasi 3D
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {PREVIEW_EMOTES.map((em) => (
                  <button
                    key={em.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setPreviewAnim(em.id);
                    }}
                    className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      previewAnim === em.id
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-800 text-slate-200 border-white/10 hover:bg-slate-700'
                    }`}
                  >
                    {em.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Player Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Penjelajah
              </label>
              <input
                type="text"
                maxLength={22}
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Penjelajah Muda"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/15 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Right Column: Customization Tabs */}
          <div className="md:col-span-7 flex flex-col gap-4">
            <div className="grid grid-cols-4 gap-1.5 bg-slate-800/70 p-1 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('asas')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  activeTab === 'asas'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Asas</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rambut')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  activeTab === 'rambut'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Rambut</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pakaian')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  activeTab === 'pakaian'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>Pakaian</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('aksesori')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  activeTab === 'aksesori'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Aksesori</span>
              </button>
            </div>

            {/* Tab 1: Asas (Gender & Skin Tone) */}
            {activeTab === 'asas' && (
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-2">
                    Jantina Avatar
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(
                      [
                        { id: 'boy', label: 'Avatar Lelaki' },
                        { id: 'girl', label: 'Avatar Perempuan' },
                      ] as const
                    ).map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          soundEngine.playClick();
                          setDraftConfig((prev) => ({
                            ...prev,
                            gender: g.id,
                            hairStyle:
                              g.id === 'girl' && prev.hairStyle === 'spiky'
                                ? 'ponytail'
                                : g.id === 'boy' && prev.hairStyle === 'hijab'
                                  ? 'spiky'
                                  : prev.hairStyle,
                          }));
                        }}
                        className={`p-3 rounded-xl border-2 text-sm font-bold cursor-pointer transition-all ${
                          draftConfig.gender === g.id
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                            : 'bg-slate-800/70 border-white/10 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-2">
                    Warna Kulit
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {SKIN_TONES.map((tone) => (
                      <button
                        key={tone.hex}
                        type="button"
                        onClick={() => updateField('skinTone', tone.hex)}
                        className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1.5 cursor-pointer transition-transform hover:scale-105 ${
                          draftConfig.skinTone === tone.hex
                            ? 'border-amber-400 bg-slate-800'
                            : 'border-white/10 bg-slate-800/50'
                        }`}
                      >
                        <span
                          className="w-8 h-8 rounded-full border border-white/30"
                          style={{ backgroundColor: tone.hex }}
                        />
                        <span className="text-[11px] text-slate-200 truncate w-full text-center">
                          {tone.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Rambut */}
            {activeTab === 'rambut' && (
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-2">
                    Gaya Rambut / Tudung 3D
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {HAIR_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateField('hairStyle', opt.id)}
                        className={`px-3 py-2.5 rounded-xl border-2 text-xs sm:text-sm font-semibold cursor-pointer transition-colors ${
                          draftConfig.hairStyle === opt.id
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                            : 'bg-slate-800/70 border-white/10 text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-2">
                    Warna Rambut / Tudung
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {HAIR_COLORS.map((hc) => (
                      <button
                        key={hc.hex}
                        type="button"
                        onClick={() => updateField('hairColor', hc.hex)}
                        className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1.5 cursor-pointer ${
                          draftConfig.hairColor === hc.hex
                            ? 'border-amber-400 bg-slate-800'
                            : 'border-white/10 bg-slate-800/50'
                        }`}
                      >
                        <span
                          className="w-7 h-7 rounded-lg border border-white/25"
                          style={{ backgroundColor: hc.hex }}
                        />
                        <span className="text-[10px] text-slate-300 truncate w-full text-center">
                          {hc.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Pakaian & Kasut */}
            {activeTab === 'pakaian' && (
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-1.5">
                    Rekaan Baju
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    {SHIRT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateField('shirtStyle', opt.id)}
                        className={`px-2 py-2 rounded-xl border-2 text-xs font-semibold cursor-pointer ${
                          draftConfig.shirtStyle === opt.id
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                            : 'bg-slate-800/70 border-white/10 text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-300 mb-1.5">
                      Warna Baju
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          title={c.name}
                          onClick={() => updateField('shirtColor', c.hex)}
                          className={`w-8 h-8 rounded-lg border-2 cursor-pointer transition-transform hover:scale-110 ${
                            draftConfig.shirtColor === c.hex
                              ? 'border-white scale-110'
                              : 'border-white/20'
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-300 mb-1.5">
                      Warna Seluar / Kain
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {PANTS_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          title={c.name}
                          onClick={() => updateField('pantsColor', c.hex)}
                          className={`w-8 h-8 rounded-lg border-2 cursor-pointer transition-transform hover:scale-110 ${
                            draftConfig.pantsColor === c.hex
                              ? 'border-white scale-110'
                              : 'border-white/20'
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-1.5">
                    Gaya & Warna Kasut
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2.5">
                    {SHOE_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateField('shoeStyle', opt.id)}
                        className={`px-2 py-2 rounded-xl border-2 text-xs font-semibold cursor-pointer ${
                          draftConfig.shoeStyle === opt.id
                            ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                            : 'bg-slate-800/70 border-white/10 text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SHOE_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        title={c.name}
                        onClick={() => updateField('shoeColor', c.hex)}
                        className={`w-7 h-7 rounded-lg border-2 cursor-pointer ${
                          draftConfig.shoeColor === c.hex
                            ? 'border-white scale-110'
                            : 'border-white/20'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Aksesori & Beg Galas */}
            {activeTab === 'aksesori' && (
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-2">
                    Aksesori Kepala & Muka
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ACCESSORY_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateField('accessory', opt.id)}
                        className={`px-3 py-2.5 rounded-xl border-2 text-xs sm:text-sm font-semibold cursor-pointer ${
                          draftConfig.accessory === opt.id
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                            : 'bg-slate-800/70 border-white/10 text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-2">
                    Beg Galas Pengembaraan
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {BACKPACK_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateField('backpack', opt.id)}
                        className={`px-3 py-2.5 rounded-xl border-2 text-xs sm:text-sm font-semibold cursor-pointer ${
                          draftConfig.backpack === opt.id
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                            : 'bg-slate-800/70 border-white/10 text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-white/10 bg-slate-900 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playVictory();
              onSave(draftName.trim() || 'Penjelajah Muda', draftConfig);
            }}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Avatar 3D</span>
          </button>
        </div>
      </div>
    </div>
  );
};
