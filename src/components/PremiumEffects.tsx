import React from 'react';

// ─── BADGE-URI ────────────────────────────────────────────────────────────────
export type PremiumBadge = 'none' | 'crown' | 'flame' | 'crystal' | 'star' | 'demon';

export const BADGES: { id: PremiumBadge; label: string; render: string }[] = [
  { id: 'none',    label: 'Niciunul', render: '' },
  { id: 'crown',   label: 'Coroană',  render: '👑' },
  { id: 'flame',   label: 'Flacără',  render: '🔥' },
  { id: 'crystal', label: 'Cristal',  render: '💎' },
  { id: 'star',    label: 'Stea',     render: '⭐' },
  { id: 'demon',   label: 'Demon',    render: '😈' },
];

// ─── CULORI USERNAME ─────────────────────────────────────────────────────────
export type UsernameColor = 'none' | 'gold' | 'fire' | 'ice' | 'galaxy' | 'nature' | 'demon' | 'white';

export const USERNAME_COLORS: { id: UsernameColor; label: string; gradient: string }[] = [
  { id: 'none',    label: 'Default',  gradient: '' },
  { id: 'white',   label: 'Alb',      gradient: '#ffffff, #cccccc' },
  { id: 'gold',    label: 'Auriu',    gradient: '#ffd700, #ff8c00' },
  { id: 'fire',    label: 'Foc',      gradient: '#ff4500, #ff8c00' },
  { id: 'ice',     label: 'Gheață',   gradient: '#00cfff, #0077ff' },
  { id: 'galaxy',  label: 'Galaxie',  gradient: '#9400d3, #4169e1, #ff69b4' },
  { id: 'nature',  label: 'Natură',   gradient: '#32cd32, #228b22' },
  { id: 'demon',   label: 'Demon',    gradient: '#cc0000, #ff0044' },
];

export function getUsernameStyle(color: UsernameColor): React.CSSProperties {
  const c = USERNAME_COLORS.find(c => c.id === color);
  if (!c || c.id === 'none') return {};
  return {
    background: `linear-gradient(135deg, ${c.gradient})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };
}

// ─── BACKGROUND ANIMAT ───────────────────────────────────────────────────────
export type ProfileBg = 'none' | 'particles' | 'stars' | 'rain' | 'aurora';

export const PROFILE_BACKGROUNDS: { id: ProfileBg; label: string }[] = [
  { id: 'none',      label: 'Niciunul' },
  { id: 'stars',     label: 'Stele' },
  { id: 'particles', label: 'Particule' },
  { id: 'rain',      label: 'Ploaie' },
  { id: 'aurora',    label: 'Aurora' },
];

export function AnimatedBackground({ type }: { type: ProfileBg }) {
  if (type === 'none') return null;

  if (type === 'stars') return (
    <canvas
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
      ref={el => { if (!el) return; runStars(el); }}
    />
  );

  if (type === 'particles') return (
    <canvas
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
      ref={el => { if (!el) return; runParticles(el); }}
    />
  );

  if (type === 'rain') return (
    <canvas
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
      ref={el => { if (!el) return; runRain(el); }}
    />
  );

  if (type === 'aurora') return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
      <style>{`
        @keyframes aurora1 { 0%,100%{transform:translateX(-20%) scaleY(1)} 50%{transform:translateX(10%) scaleY(1.3)} }
        @keyframes aurora2 { 0%,100%{transform:translateX(10%) scaleY(1)} 50%{transform:translateX(-15%) scaleY(0.8)} }
        @keyframes aurora3 { 0%,100%{transform:translateX(0%) scaleY(1)} 50%{transform:translateX(20%) scaleY(1.2)} }
      `}</style>
      <div style={{ position:'absolute', width:'120%', height:'60%', top:'10%', left:'-10%', background:'linear-gradient(180deg, rgba(0,206,255,0.25) 0%, transparent 100%)', filter:'blur(30px)', animation:'aurora1 8s ease-in-out infinite', borderRadius:'50%' }} />
      <div style={{ position:'absolute', width:'100%', height:'50%', top:'20%', left:'0%', background:'linear-gradient(180deg, rgba(148,0,211,0.2) 0%, transparent 100%)', filter:'blur(40px)', animation:'aurora2 11s ease-in-out infinite', borderRadius:'50%' }} />
      <div style={{ position:'absolute', width:'80%', height:'40%', top:'5%', left:'20%', background:'linear-gradient(180deg, rgba(0,255,128,0.15) 0%, transparent 100%)', filter:'blur(25px)', animation:'aurora3 7s ease-in-out infinite', borderRadius:'50%' }} />
    </div>
  );

  return null;
}

// ─── CANVAS HELPERS ──────────────────────────────────────────────────────────
function runStars(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  let raf: number;
  const stars: { x: number; y: number; r: number; alpha: number; speed: number }[] = [];

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();

  for (let i = 0; i < 80; i++) {
    stars.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.5 + 0.3, alpha: Math.random(), speed: Math.random() * 0.005 + 0.002 });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      s.alpha += s.speed;
      if (s.alpha > 1 || s.alpha < 0) s.speed *= -1;
      ctx.beginPath();
      ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.abs(s.alpha)})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }
  draw();

  const obs = new ResizeObserver(resize);
  obs.observe(canvas);
  canvas.addEventListener('remove', () => { cancelAnimationFrame(raf); obs.disconnect(); });
}

function runParticles(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  let raf: number;
  const pts: { x: number; y: number; vx: number; vy: number; r: number; hue: number }[] = [];

  function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
  resize();

  for (let i = 0; i < 40; i++) {
    pts.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, r: Math.random() * 2 + 1, hue: Math.random() * 360 });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy; p.hue += 0.5;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},100%,70%,0.7)`;
      ctx.fill();
    }
    // Draw lines between close particles
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(255,255,255,${0.15 * (1 - dist / 80)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(draw);
  }
  draw();
  const obs = new ResizeObserver(resize);
  obs.observe(canvas);
}

function runRain(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  let raf: number;
  const drops: { x: number; y: number; speed: number; len: number; alpha: number }[] = [];

  function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
  resize();

  for (let i = 0; i < 60; i++) {
    drops.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, speed: Math.random() * 4 + 3, len: Math.random() * 15 + 8, alpha: Math.random() * 0.4 + 0.1 });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const d of drops) {
      d.y += d.speed;
      if (d.y > canvas.height) { d.y = -d.len; d.x = Math.random() * canvas.width; }
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 1, d.y + d.len);
      ctx.strokeStyle = `rgba(150,210,255,${d.alpha})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    raf = requestAnimationFrame(draw);
  }
  draw();
  const obs = new ResizeObserver(resize);
  obs.observe(canvas);
}

// ─── FRIEND CARD GLOW ────────────────────────────────────────────────────────
export function FriendCardGlow({ isPremium, children, className }: { isPremium: boolean; children: React.ReactNode; className?: string }) {
  if (!isPremium) return <div className={className}>{children}</div>;
  return (
    <>
      <style>{`
        @keyframes fc-glow { 0%,100%{box-shadow:0 0 6px 1px rgba(255,215,0,0.3)} 50%{box-shadow:0 0 14px 3px rgba(255,140,0,0.5)} }
      `}</style>
      <div className={className} style={{ animation: 'fc-glow 2.5s ease-in-out infinite', borderRadius: '12px' }}>
        {children}
      </div>
    </>
  );
}
