import { User } from 'lucide-react';

export type AvatarFrame = 'none' | 'gold' | 'purple' | 'blue' | 'red' | 'rainbow';

export const FRAMES: { id: AvatarFrame; label: string; colors: string; speed: string; glow: string; c1: string; c2: string }[] = [
  { id: 'none',    label: 'Niciunul', colors: '', speed: '3s', glow: '',        c1: '',        c2: '' },
  { id: 'gold',    label: 'Auriu',    colors: '#ffd700, #ff8c00, #ffec6e, #ffd700', speed: '2.5s', glow: '#ffd700', c1: '#ffd700', c2: '#ff8c00' },
  { id: 'purple',  label: 'Violet',   colors: '#a855f7, #6366f1, #ec4899, #a855f7', speed: '3s',   glow: '#a855f7', c1: '#a855f7', c2: '#6366f1' },
  { id: 'blue',    label: 'Albastru', colors: '#3b82f6, #06b6d4, #22d3ee, #3b82f6', speed: '2.8s', glow: '#3b82f6', c1: '#3b82f6', c2: '#06b6d4' },
  { id: 'red',     label: 'Roșu',     colors: '#ef4444, #f97316, #fca5a5, #ef4444', speed: '2s',   glow: '#ef4444', c1: '#ef4444', c2: '#f97316' },
  { id: 'rainbow', label: 'Curcubeu', colors: '#ff0000, #ff7700, #ffff00, #00ff00, #0000ff, #8b00ff, #ff0000', speed: '3s', glow: '#a855f7', c1: '#ff7700', c2: '#00ff00' },
];

// Lightning bolt SVG paths (varied shapes for natural look)
const BOLT_PATHS = [
  'M8,0 L4,9 L7,9 L2,20 L10,8 L6,8 Z',
  'M7,0 L3,10 L6,10 L1,22 L9,9 L5,9 Z',
  'M6,0 L2,8 L5,8 L0,18 L8,7 L4,7 Z',
  'M9,0 L5,11 L8,11 L3,24 L11,10 L7,10 Z',
];

// Fixed positions around the avatar (angles in degrees)
const BOLT_POSITIONS = [
  { angle: -45,  dist: 1.18, pathIdx: 0, delay: '0s',    dur: '1.6s' },
  { angle: 135,  dist: 1.18, pathIdx: 1, delay: '0.55s', dur: '1.4s' },
  { angle: 30,   dist: 1.22, pathIdx: 2, delay: '0.9s',  dur: '1.8s' },
  { angle: 210,  dist: 1.22, pathIdx: 3, delay: '0.3s',  dur: '1.5s' },
  { angle: -120, dist: 1.20, pathIdx: 0, delay: '1.1s',  dur: '1.7s' },
  { angle: 80,   dist: 1.19, pathIdx: 2, delay: '0.7s',  dur: '1.3s' },
];

interface PremiumAvatarProps {
  avatarUrl: string | null;
  username: string;
  isPremium?: boolean;
  frame?: AvatarFrame;
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'full' | 'xl';
}

const SIZE_MAP = {
  sm: { outer: 40, border: 3 },
  md: { outer: 64, border: 4 },
  lg: { outer: 96, border: 6 },
};

export function PremiumAvatar({
  avatarUrl,
  username,
  frame = 'none',
  size = 'md',
  rounded = 'xl',
}: PremiumAvatarProps) {
  const { outer, border } = SIZE_MAP[size];
  const borderRadius = rounded === 'full' ? '50%' : size === 'lg' ? '16px' : '10px';
  const innerRadius  = rounded === 'full' ? '50%' : size === 'lg' ? '12px' : '8px';

  const frameData = FRAMES.find(f => f.id === frame) ?? FRAMES[0];
  const hasFrame = frame !== 'none';

  // Lightning only on md/lg, and fewer on sm
  const bolts = hasFrame
    ? (size === 'sm' ? BOLT_POSITIONS.slice(0, 2) : BOLT_POSITIONS)
    : [];

  // Canvas size: leave room for bolts around the avatar
  const boltRoom = size === 'lg' ? 22 : size === 'md' ? 16 : 10;
  const canvas = outer + boltRoom * 2;
  const center = canvas / 2;
  const avatarR = outer / 2; // radius of avatar circle/square (approx)

  const keyframes = hasFrame ? `
    @keyframes pa-glow-${frame} {
      0%,100% { box-shadow: 0 0 8px 3px ${frameData.glow}90, 0 0 20px 6px ${frameData.glow}45; }
      50%      { box-shadow: 0 0 22px 8px ${frameData.glow}ee, 0 0 40px 16px ${frameData.glow}70; }
    }
    @keyframes pa-bolt-${frame} {
      0%,100% { opacity: 0; }
      5%       { opacity: 0.15; }
      10%      { opacity: 1; }
      18%      { opacity: 0.6; }
      25%      { opacity: 1; }
      35%      { opacity: 0; }
    }
  ` : '';

  return (
    <div style={{ width: canvas, height: canvas, position: 'relative', flexShrink: 0, marginLeft: -boltRoom, marginTop: -boltRoom }}>
      {hasFrame && (
        <>
          <style>{keyframes}</style>

          {/* Lightning bolts rendered as SVG absolutely around avatar */}
          <svg
            width={canvas}
            height={canvas}
            style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none', overflow: 'visible' }}
          >
            <defs>
              <filter id={`bolt-glow-${frame}`} x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {bolts.map((b, i) => {
              const rad = (b.angle * Math.PI) / 180;
              const bx = center + Math.cos(rad) * avatarR * b.dist;
              const by = center + Math.sin(rad) * avatarR * b.dist;
              // rotate bolt to point outward
              const rot = b.angle + 90;
              const path = BOLT_PATHS[b.pathIdx];
              return (
                <g key={i} transform={`translate(${bx},${by}) rotate(${rot}) translate(-5,-10)`}>
                  {/* Glow copy */}
                  <path
                    d={path}
                    fill={frameData.glow}
                    opacity={0.6}
                    filter={`url(#bolt-glow-${frame})`}
                    style={{ animation: `pa-bolt-${frame} ${b.dur} ${b.delay} ease-in-out infinite` }}
                  />
                  {/* Sharp bolt */}
                  <path
                    d={path}
                    fill="white"
                    style={{ animation: `pa-bolt-${frame} ${b.dur} ${b.delay} ease-in-out infinite` }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Static gradient border + glow */}
          <div
            style={{
              position: 'absolute',
              top: boltRoom,
              left: boltRoom,
              width: outer,
              height: outer,
              borderRadius: borderRadius,
              padding: border,
              background: `linear-gradient(135deg, ${frameData.c1}, ${frameData.c2}, ${frameData.c1})`,
              zIndex: 1,
              animation: `pa-glow-${frame} 2s ease-in-out infinite`,
            }}
          >
            <div style={{ width: '100%', height: '100%', borderRadius: innerRadius, background: 'var(--background, #0f0f13)' }} />
          </div>
        </>
      )}

      {/* Avatar image */}
      <div
        style={{
          position: 'absolute',
          top:  boltRoom + (hasFrame ? border : 0),
          left: boltRoom + (hasFrame ? border : 0),
          width:  outer - (hasFrame ? border * 2 : 0),
          height: outer - (hasFrame ? border * 2 : 0),
          borderRadius: innerRadius,
          overflow: 'hidden',
          zIndex: 2,
          background: 'var(--secondary, #1e1e2e)',
        }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={username} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: size === 'lg' ? 32 : size === 'md' ? 20 : 14, fontWeight: 700, color: 'var(--muted-foreground, #888)' }}>
              {username?.charAt(0).toUpperCase() || <User />}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
