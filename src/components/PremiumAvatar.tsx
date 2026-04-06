import { cn } from '@/lib/utils';

interface PremiumAvatarProps {
  avatarUrl: string | null;
  username: string;
  isPremium?: boolean;
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'full' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  sm:  { outer: 'w-10 h-10',              badge: 'w-4 h-4 text-[8px] -bottom-1 -right-1', text: 'text-sm',            padding: 'p-[2px]' },
  md:  { outer: 'w-14 h-14',              badge: 'w-5 h-5 text-[9px] -bottom-1 -right-1', text: 'text-lg',            padding: 'p-[2px]' },
  lg:  { outer: 'w-20 h-20 md:w-24 md:h-24', badge: 'w-6 h-6 text-xs -bottom-1 -right-1',  text: 'text-3xl md:text-4xl', padding: 'p-[3px]' },
};

export function PremiumAvatar({
  avatarUrl,
  username,
  isPremium = false,
  size = 'md',
  rounded = 'full',
  className,
}: PremiumAvatarProps) {
  const s = SIZE_MAP[size];
  const roundedClass = rounded === 'full' ? 'rounded-full' : 'rounded-xl';

  const avatarContent = avatarUrl ? (
    <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-secondary">
      <span className={cn('font-bold text-muted-foreground select-none', s.text)}>
        {username?.charAt(0).toUpperCase() || '?'}
      </span>
    </div>
  );

  if (!isPremium) {
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
      <style>{`
        @keyframes hm-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .hm-premium-ring {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .hm-premium-ring::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: inherit;
          background: conic-gradient(
            #ffd700, #ff8c00, #ff4500, #9400d3, #4169e1, #00ced1, #32cd32, #ffd700
          );
          animation: hm-spin 3s linear infinite;
          z-index: 0;
        }
        .hm-premium-inner {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
        }
      `}</style>

      <div className={cn('hm-premium-ring', roundedClass)}>
        <div className={cn('hm-premium-inner bg-card', roundedClass)}>
          {avatarContent}
        </div>
      </div>

      {/* Crown badge */}
      <div className={cn(
        'absolute flex items-center justify-center rounded-full z-10',
        'bg-gradient-to-br from-yellow-400 to-orange-500',
        'border-2 border-background shadow-md',
        s.badge,
      )}>
        👑
      </div>
    </div>
  );
}
