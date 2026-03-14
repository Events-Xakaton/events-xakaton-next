import chroma from 'chroma-js';
import seedrandom from 'seedrandom';

const EVENT_GRADIENT_PALETTE = [
  '#f97316',
  '#fb7185',
  '#ef4444',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
];

const CLUB_GRADIENT_PALETTE = [
  '#1d4ed8',
  '#0f766e',
  '#4338ca',
  '#7c3aed',
  '#0f172a',
  '#334155',
  '#0369a1',
];

export function newSeed(prefix: 'event' | 'club'): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

export function buildGradient(seed: string, mode: 'event' | 'club'): string {
  const rng = seedrandom(seed);
  const palette =
    mode === 'event' ? EVENT_GRADIENT_PALETTE : CLUB_GRADIENT_PALETTE;
  const pick = () => palette[Math.floor(rng() * palette.length)] ?? palette[0];
  const c1 = chroma(pick())
    .saturate(mode === 'event' ? 1.2 : 0.9)
    .brighten(mode === 'event' ? 0.3 : 0.15);
  const c2 = chroma(pick())
    .saturate(mode === 'event' ? 1.0 : 0.75)
    .darken(mode === 'event' ? 0.1 : 0.35);
  const c3 = chroma(pick()).darken(mode === 'event' ? 1.0 : 1.2);
  const a1 = Math.floor(rng() * 360);
  const a2 = (a1 + 90 + Math.floor(rng() * 60)) % 360;
  const p1x = 12 + Math.floor(rng() * 30);
  const p1y = 14 + Math.floor(rng() * 32);
  const p2x = 64 + Math.floor(rng() * 28);
  const p2y = 12 + Math.floor(rng() * 34);
  const p3x = 16 + Math.floor(rng() * 66);
  const p3y = 62 + Math.floor(rng() * 30);
  const stop1 = 42 + Math.floor(rng() * 10);
  const stop2 = 48 + Math.floor(rng() * 12);
  const stop3 = 50 + Math.floor(rng() * 16);
  return `radial-gradient(circle at ${p1x}% ${p1y}%, ${c1.alpha(0.92).css()} 0%, transparent ${stop1}%),
          radial-gradient(circle at ${p2x}% ${p2y}%, ${c2.alpha(0.8).css()} 0%, transparent ${stop2}%),
          radial-gradient(circle at ${p3x}% ${p3y}%, ${c3.alpha(0.48).css()} 0%, transparent ${stop3}%),
          linear-gradient(${a1}deg, ${c1.css()} 0%, ${c2.css()} 48%, ${c3.css()} 100%),
          linear-gradient(${a2}deg, rgba(255,255,255,0.12), rgba(0,0,0,0.28))`;
}
