import { User } from 'lucide-react';

interface PremiumAvatarProps {
  avatarUrl: string | null;
  username: string;
  isPremium?: boolean;
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'full' | 'xl';
}

const SIZE_MAP = {
  sm: { outer: 40 },
  md: { outer: 64 },
  lg: { outer: 96 },
};

export function PremiumAvatar({
  avatarUrl,
  username,
  size = 'md',
  rounded = 'xl',
}: PremiumAvatarProps) {
  const { outer } = SIZE_MAP[size];
  const borderRadius = rounded === 'full' ? '50%' : size === 'lg' ? '16px' : '10px';

  return (
    <div style={{ width: outer, height: outer, position: 'relative', flexShrink: 0 }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: outer,
          height: outer,
          borderRadius,
          overflow: 'hidden',
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
