import * as THREE from 'three';

export interface WorldTextures {
  grass: THREE.CanvasTexture;
  cobble: THREE.CanvasTexture;
  ancientStone: THREE.CanvasTexture;
  wood: THREE.CanvasTexture;
  water: THREE.CanvasTexture;
  thatch: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  dispose: () => void;
}

function makeCanvas(size = 256): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

function finalizeTexture(
  canvas: HTMLCanvasElement,
  anisotropy: number,
  repeatX = 1,
  repeatY = 1,
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = anisotropy;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.needsUpdate = true;
  return tex;
}

export function createWorldTextures(maxAnisotropy: number): WorldTextures {
  // 1. Voxel Grass Texture (cheerful vibrant emerald & lime pixels)
  const [grassC, gCtx] = makeCanvas(128);
  gCtx.fillStyle = '#43b659';
  gCtx.fillRect(0, 0, 128, 128);
  const grassPalette = ['#3ca850', '#4fc464', '#5bd170', '#389e4b'];
  for (let y = 0; y < 128; y += 8) {
    for (let x = 0; x < 128; x += 8) {
      const idx = ((x * 7 + y * 13) % 17) % grassPalette.length;
      gCtx.fillStyle = grassPalette[idx];
      gCtx.fillRect(x, y, 8, 8);
    }
  }
  // Tiny clover/flower pixels
  gCtx.fillStyle = '#fde047';
  gCtx.fillRect(24, 32, 4, 4);
  gCtx.fillRect(88, 96, 4, 4);
  gCtx.fillStyle = '#f8fafc';
  gCtx.fillRect(56, 72, 4, 4);
  const grass = finalizeTexture(grassC, maxAnisotropy, 16, 16);

  // 2. Cobblestone Plaza Texture
  const [cobC, cCtx] = makeCanvas(256);
  cCtx.fillStyle = '#94a3b8';
  cCtx.fillRect(0, 0, 256, 256);
  const stoneColors = ['#cbd5e1', '#b4c0ce', '#dce4ee', '#a3b1c2'];
  for (let row = 0; row < 8; row++) {
    const offset = (row % 2) * 16;
    for (let col = -1; col < 8; col++) {
      const bx = col * 32 + offset;
      const by = row * 32;
      cCtx.fillStyle = stoneColors[(row * 5 + col + 8) % stoneColors.length];
      cCtx.fillRect(bx + 2, by + 2, 28, 28);
      cCtx.fillStyle = 'rgba(255,255,255,0.28)';
      cCtx.fillRect(bx + 2, by + 2, 28, 3);
      cCtx.fillStyle = 'rgba(15,23,42,0.18)';
      cCtx.fillRect(bx + 2, by + 27, 28, 3);
    }
  }
  const cobble = finalizeTexture(cobC, maxAnisotropy, 6, 6);

  // 3. Ancient Carved Temple Stone
  const [ancC, aCtx] = makeCanvas(256);
  aCtx.fillStyle = '#a89076';
  aCtx.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 8; row++) {
    const shift = (row % 2) * 32;
    for (let col = -1; col < 4; col++) {
      const bx = col * 64 + shift;
      const by = row * 32;
      aCtx.fillStyle = (row + col) % 2 === 0 ? '#c2ab90' : '#b29b7f';
      aCtx.fillRect(bx + 2, by + 2, 60, 28);
      // Carved Nusantara motif border
      aCtx.strokeStyle = '#8b7359';
      aCtx.lineWidth = 2;
      aCtx.strokeRect(bx + 7, by + 6, 50, 20);
    }
  }
  const ancientStone = finalizeTexture(ancC, maxAnisotropy, 2, 2);

  // 4. Warm Timber Wood Planks
  const [woodC, wCtx] = makeCanvas(128);
  wCtx.fillStyle = '#8b5a2b';
  wCtx.fillRect(0, 0, 128, 128);
  const plankColors = ['#9c6633', '#855326', '#a9713b', '#7d4d21'];
  for (let i = 0; i < 4; i++) {
    wCtx.fillStyle = plankColors[i];
    wCtx.fillRect(0, i * 32 + 1, 128, 30);
    wCtx.fillStyle = '#5c3818';
    wCtx.fillRect(0, i * 32, 128, 2);
    // Plank grain
    wCtx.fillStyle = 'rgba(60, 32, 10, 0.25)';
    wCtx.fillRect(16 + i * 18, i * 32 + 10, 42, 3);
    wCtx.fillRect(74 - i * 10, i * 32 + 20, 36, 3);
  }
  const wood = finalizeTexture(woodC, maxAnisotropy, 2, 2);

  // 5. Sparkling Stylized Water Texture
  const [watC, watCtx] = makeCanvas(256);
  watCtx.fillStyle = '#0ea5e9';
  watCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 16) {
    for (let x = 0; x < 256; x += 16) {
      const v = (x * 3 + y * 5) % 32;
      watCtx.fillStyle = v < 10 ? '#38bdf8' : v < 20 ? '#0284c7' : '#22d3ee';
      watCtx.fillRect(x, y, 16, 16);
    }
  }
  watCtx.fillStyle = 'rgba(255,255,255,0.45)';
  watCtx.fillRect(24, 40, 24, 4);
  watCtx.fillRect(140, 120, 28, 4);
  watCtx.fillRect(80, 200, 20, 4);
  const water = finalizeTexture(watC, maxAnisotropy, 12, 12);
  water.magFilter = THREE.LinearFilter;

  // 6. Tropical Thatch / Nipah Roof Texture
  const [thC, thCtx] = makeCanvas(128);
  thCtx.fillStyle = '#b45309';
  thCtx.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 8) {
    thCtx.fillStyle = y % 16 === 0 ? '#d97706' : '#92400e';
    thCtx.fillRect(0, y, 128, 6);
    for (let x = 0; x < 128; x += 12) {
      thCtx.fillStyle = 'rgba(254, 243, 199, 0.16)';
      thCtx.fillRect(x + (y % 16 === 0 ? 2 : 6), y, 3, 6);
    }
  }
  const thatch = finalizeTexture(thC, maxAnisotropy, 3, 3);

  // 7. Radial Contact Shadow Texture
  const [shC, shCtx] = makeCanvas(128);
  const grad = shCtx.createRadialGradient(64, 64, 6, 64, 64, 62);
  grad.addColorStop(0, 'rgba(10, 18, 32, 0.65)');
  grad.addColorStop(0.55, 'rgba(10, 18, 32, 0.28)');
  grad.addColorStop(1, 'rgba(10, 18, 32, 0)');
  shCtx.fillStyle = grad;
  shCtx.fillRect(0, 0, 128, 128);
  const contactShadow = new THREE.CanvasTexture(shC);
  contactShadow.colorSpace = THREE.SRGBColorSpace;
  contactShadow.needsUpdate = true;

  return {
    grass,
    cobble,
    ancientStone,
    wood,
    water,
    thatch,
    contactShadow,
    dispose: () => {
      grass.dispose();
      cobble.dispose();
      ancientStone.dispose();
      wood.dispose();
      water.dispose();
      thatch.dispose();
      contactShadow.dispose();
    },
  };
}
