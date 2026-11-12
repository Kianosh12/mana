export interface ColorOption {
  name: string;
  hex: string;
}

export interface GarmentItem {
  n: string;
  p: number;
  g: [number, number];
  m: number;
  c: [string, string][];
}

export const ITEMS: GarmentItem[] = [
  {n:"Basic T-shirt", p:45,  g:[1.14,3.06],  m:.37,   c:[["White","#f4f2ee"],["Ash","#c9c7c2"],["Charcoal","#3b3c3f"],["Navy","#27324d"]]},
  {n:"Basic Sweater", p:105, g:[49.7,1.39],  m:25.0,  c:[["White","#f6f4ef"],["Oat","#ddd3c2"],["Sage","#b9c2ae"],["Black","#1f1f21"]]},
  {n:"Linen Shirt",   p:95,  g:[98.2,3.33],  m:49.86, c:[["White","#f7f6f1"],["Sand","#d9ccb4"],["Sky","#bcd0e2"],["Olive","#717556"]]},
  {n:"Grey Hoodie",   p:110, g:[1.14,93.3],  m:74.77, c:[["Heather","#a9a9a8"],["Bone","#e6e1d6"],["Forest","#33463a"],["Black","#1f1f21"]]},
  {n:"Ringer Tee",    p:55,  g:[49.7,95.3],  m:99.35, c:[["White / Black","#f4f2ee"],["Cream / Navy","#efe6d3"],["Grey / Red","#c9c7c2"],["White / Green","#e9efe8"]]},
];

export const DESKTOP_XS_RATIOS = [0, 0.215, 0.345, 0.432, 0.49, 0.52] as const;
export const PHONE_XS_RATIOS = [0, 0.36, 0.5, 0.56, 0.6, 0.62] as const;

export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function shortestArcOffset(cardIndex: number, pos: number, totalCards = 10): number {
  return mod(cardIndex - pos + totalCards / 2, totalCards) - totalCards / 2;
}

export function getXS(width: number): number[] {
  const ratios = width < 768 ? PHONE_XS_RATIOS : DESKTOP_XS_RATIOS;
  return ratios.map((r) => r * width);
}

export function xAt(a: number, xs: readonly number[]): number {
  const idx = Math.min(Math.max(a, 0), xs.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, xs.length - 1);
  const t = idx - lo;
  return xs[lo] + (xs[hi] - xs[lo]) * t;
}

export interface CardFrame {
  x: number;
  y: number;
  z: number;
  ry: number;
  rx: number;
  scale: number;
  opacity: number;
  blur: number;
  zIndex: number;
  visible: boolean;
}

export function computeCardFrame(params: {
  cardIndex: number;
  pos: number;
  width: number;
  height: number;
  intro: number;
  timeSec: number;
  seed: number;
  sx: number;
  sy: number;
  reducedMotion: boolean;
}): CardFrame {
  const { cardIndex, pos, width, height, intro, timeSec, seed, sx, sy, reducedMotion } = params;
  const u = shortestArcOffset(cardIndex, pos, 10);
  const a = Math.abs(u);
  const sg = u === 0 ? 0 : u > 0 ? 1 : -1;
  const xs = getXS(width);
  const clampedIntro = Math.max(0, Math.min(1, intro));
  const ie = reducedMotion ? 1 : 1 - Math.pow(1 - clampedIntro, 3);
  const x = sg * xAt(a, xs) * ie;

  let s: number;
  let z: number;
  let op: number;
  let ry: number;
  let blur = 0;

  if (a < 1) {
    s = 0.55 + 0.45 * a;
    z = -260 * (1 - a);
    op = a;
    ry = -sg * 16 * a;
  } else {
    s = 1 / (1 + 0.3 * Math.pow(a - 1, 1.15));
    z = -110 * (a - 1);
    op = 1;
    ry = -sg * (16 + 9 * Math.min(2, a - 1));
    blur = Math.max(0, a - 1.6) * 2.4;
  }

  if (a > 3.4) {
    op *= Math.max(0, 1 - (a - 3.4) / 0.8);
  }
  op *= ie;

  const bob = reducedMotion ? 0 : Math.sin(timeSec * 1.1 + seed) * height * 0.006 * Math.min(1, a);
  const y = bob - (1 - s) * height * 0.04;
  ry += sx * 10;
  const rx = -sy * 6;
  const scale = s * (0.6 + 0.4 * ie);
  const zIndex = a < 1 ? 1 : Math.round(100 - 10 * a);

  return {
    x,
    y,
    z,
    ry,
    rx,
    scale,
    opacity: op,
    blur,
    zIndex,
    visible: op >= 0.01,
  };
}
