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
  sm: { outer: 'w-10 h-10', inner: 'w-10 h-10', badge: 'w-4 h-4 text-[8px] -bottom-1 -right-1', text: 'text-sm', padding: 'p-[2px]' },
  md: { outer: 'w-14 h-14', inner: 'w-14 h-14', badge: 'w-5 h-5 text-[9px] -bottom-1 -right-1', text: 'text-lg', padding: 'p-[2px]' },
  lg: { outer: 'w-20 h-20 md:w-24 md:h-24', inner: 'w-full h-full', badge: 'w-6 h-6 text-xs -bottom-1 -right-1', text: 'text-3xl md:text-4xl', padding: 'p-[3px]' },
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

  return (
    <div className={cn('relative flex-shrink-0', s.outer, className)}>
      {/* Animated gradient ring — only for premium */}
      {isPremium ? (
        <>
          <style>{`
            @keyframes spin-gradient {
              0%   { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .premium-ring::before {
              content: '';
              position: absolute;
              inset: -2px;
              border-radius: inherit;
              padding: 2px;
              background: conic-gradient(
                #ffd700, #ff8c00, #ff4500, #9400d3, #4169e1, #00ced1, #32cd32, #ffd700
              );
              -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
              -webkit-mask-composite: xor;
              mask-composite: exclude;
              animation: spin-gradient 3s linear infinite;
            }
          `}</style>
          <div
            className={cn('premium-ring relative w-full h-full', roundedClass, s.padding)}
            style={{ background: 'transparent' }}
          >
            <div className={cn('w-full h-full overflow-hidden shadow-lg', roundedClass, 'bg-card')}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <span className={cn('font-bold text-muted-foreground select-none', s.text)}>
                    {username?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Crown badge */}
          <div className={cn(
            'absolute flex items-center justify-center',
            'bg-gradient-to-br from-yellow-400 to-orange-500',
            'border-2 border-background shadow-md',
            roundedClass === 'rounded-full' ? 'rounded-full' : 'rounded-full',
            s.badge,
          )}>
            👑
          </div>
        </>
      ) : (
        /* Non-premium — normal avatar */
        <div className={cn('w-full h-full overflow-hidden bg-card shadow-lg ring-4 ring-background', roundedClass)}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <span className={cn('font-bold text-muted-foreground select-none', s.text)}>
                {username?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
