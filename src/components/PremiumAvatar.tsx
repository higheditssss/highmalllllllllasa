import React from "react";
import { cn } from '@/lib/utils';

export type AvatarFrame = 'none' | 'gold' | 'fire' | 'ice' | 'galaxy' | 'nature' | 'demon';

interface PremiumAvatarProps {
  avatarUrl: string | null;
  username: string;
  isPremium?: boolean;
  frame?: AvatarFrame;
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'full' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  sm:  { outer: 'w-10 h-10',                  badge: 'w-4 h-4 text-[8px] -bottom-1 -right-1', text: 'text-sm' },
  md:  { outer: 'w-14 h-14',                  badge: 'w-5 h-5 text-[9px] -bottom-1 -right-1', text: 'text-lg' },
  lg:  { outer: 'w-20 h-20 md:w-24 md:h-24',  badge: 'w-6 h-6 text-xs -bottom-1 -right-1',   text: 'text-3xl md:text-4xl' },
};

export const FRAMES: { id: AvatarFrame; label: string; colors: string; speed: string }[] = [
  { id: 'none',   label: 'Niciunul', colors: '',                                              speed: '' },
  { id: 'gold',   label: 'Auriu',    colors: '#ffd700, #ffec6e, #ff8c00, #ffd700',           speed: '3s' },
  { id: 'fire',   label: 'Foc',      colors: '#ff4500, #ff6a00, #ff0000, #ff8c00, #ff4500', speed: '2s' },
  { id: 'ice',    label: 'Gheata',   colors: '#00cfff, #a8edff, #0077ff, #00cfff',           speed: '3s' },
  { id: 'galaxy', label: 'Galaxie',  colors: '#9400d3, #4169e1, #00ced1, #ff69b4, #9400d3', speed: '4s' },
  { id: 'nature', label: 'Natura',   colors: '#32cd32, #7fff00, #228b22, #32cd32',           speed: '3s' },
  { id: 'demon',  label: 'Demon',    colors: '#8b0000, #cc0000, #ff0044, #4a0000, #8b0000', speed: '2.5s' },
];

// kept for backward compat
export function getAvatarFrameCSS(_frame: AvatarFrame, _br: string) { return ''; }

function FrameWrapper({
  frame,
  br,
  children,
}: {
  frame: AvatarFrame;
  br: string;
  children: React.ReactNode;
}) {
  const f = FRAMES.find(f => f.id === frame);
  if (!f || f.id === 'none') return <>{children}</>;

  return (
    <>
      <style>{`@keyframes hm-spin-${frame}{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: '100%', height: '100%', borderRadius: br, overflow: 'hidden' }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            padding: '3px',
            background: `conic-gradient(${f.colors})`,
            animation: `hm-spin-${frame} ${f.speed} linear infinite`,
          }}
        >
          <div style={{ width: '100%', height: '100%', borderRadius: `calc(${br} - 3px)`, overflow: 'hidden' }}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

export function PremiumAvatar({
  avatarUrl,
  username,
  isPremium = false,
  frame = 'none',
  size = 'md',
  rounded = 'full',
  className,
}: PremiumAvatarProps) {
  const s = SIZE_MAP[size];
  const roundedClass = rounded === 'full' ? 'rounded-full' : 'rounded-xl';
  const br = rounded === 'full' ? '9999px' : '12px';

  const avatarContent = avatarUrl ? (
    <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-secondary">
      <span className={cn('font-bold text-muted-foreground select-none', s.text)}>
        {username?.charAt(0).toUpperCase() || '?'}
      </span>
    </div>
  );

  const activeFrame = isPremium && frame && frame !== 'none' ? frame : null;

  if (!activeFrame) {
    if (isPremium) {
      return (
        <div className={cn('relative flex-shrink-0', s.outer, className)}>
          <FrameWrapper frame="gold" br={br}>
            <div className={cn('w-full h-full bg-card', roundedClass)}>{avatarContent}</div>
          </FrameWrapper>
          <div className={cn('absolute flex items-center justify-center rounded-full z-10 bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-background shadow-md', s.badge)}>👑</div>
        </div>
      );
    }
    return (
      <div className={cn('relative flex-shrink-0', s.outer, className)}>
        <div className={cn('w-full h-full overflow-hidden bg-card shadow-lg ring-4 ring-background', roundedClass)}>
          {avatarContent}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative flex-shrink-0', s.outer, className)}>
      <FrameWrapper frame={activeFrame} br={br}>
        <div className={cn('w-full h-full bg-card', roundedClass)}>{avatarContent}</div>
      </FrameWrapper>
      <div className={cn('absolute flex items-center justify-center rounded-full z-10 bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-background shadow-md', s.badge)}>👑</div>
    </div>
  );
}