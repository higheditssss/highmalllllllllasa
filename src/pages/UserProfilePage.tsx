import { useParams, Link } from 'react-router-dom';
import { getAnimeListForUser } from '@/lib/anime-storage';
import { getCurrentProfile } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { AnimeListEntry, WatchStatus, STATUS_LABELS } from '@/types/anime';
import { Star, Tv, CheckCircle, PauseCircle, XCircle, BookOpen, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { FriendButton } from '@/components/FriendButton';
import { FriendsPanel } from '@/components/FriendsPanel';
import { PremiumAvatar } from '@/components/PremiumAvatar';

const HAT_TESTERS = ['highedits', 'ovi'];

function StrawHat({ size = 96 }: { size?: number }) {
  return (
    <div className="absolute pointer-events-none z-20" style={{
      top: `-${size * 0.38}px`,
      left: `${-size * 0.18}px`,
      width: `${size * 1.35}px`,
      height: `${size * 0.7}px`,
    }}>
      <svg viewBox="0 0 280 130" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <ellipse cx="148" cy="114" rx="126" ry="26" fill="#b8924a" opacity="0.4"/>
        <ellipse cx="140" cy="112" rx="128" ry="26" fill="#e8b84b" stroke="#c08830" strokeWidth="2"/>
        <line x1="30" y1="110" x2="50" y2="105" stroke="#c08830" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
        <line x1="55" y1="106" x2="72" y2="102" stroke="#c08830" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
        <line x1="200" y1="106" x2="218" y2="102" stroke="#c08830" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
        <line x1="228" y1="108" x2="248" y2="106" stroke="#c08830" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
        <ellipse cx="140" cy="75" rx="68" ry="10" fill="#e8b84b"/>
        <path d="M72,75 C72,38 208,38 208,75" fill="#e8b84b" stroke="#c08830" strokeWidth="2"/>
        <ellipse cx="140" cy="75" rx="68" ry="10" fill="#e8b84b" stroke="#c08830" strokeWidth="1.5"/>
        <path d="M175,42 C195,50 208,62 208,75 L190,75 C190,62 180,50 165,44Z" fill="#c08830" opacity="0.3"/>
        <line x1="118" y1="42" x2="122" y2="65" stroke="#c08830" strokeWidth="0.9" strokeLinecap="round" opacity="0.5"/>
        <line x1="133" y1="38" x2="135" y2="63" stroke="#c08830" strokeWidth="0.9" strokeLinecap="round" opacity="0.5"/>
        <line x1="148" y1="38" x2="146" y2="63" stroke="#c08830" strokeWidth="0.9" strokeLinecap="round" opacity="0.5"/>
        <line x1="162" y1="41" x2="158" y2="64" stroke="#c08830" strokeWidth="0.9" strokeLinecap="round" opacity="0.5"/>
        <line x1="175" y1="47" x2="169" y2="67" stroke="#c08830" strokeWidth="0.9" strokeLinecap="round" opacity="0.4"/>
        <line x1="105" y1="48" x2="111" y2="67" stroke="#c08830" strokeWidth="0.9" strokeLinecap="round" opacity="0.4"/>
        <path d="M72,80 Q140,70 208,80 Q208,98 140,100 Q72,98 72,80Z" fill="#cc1111" stroke="#880000" strokeWidth="1.5"/>
        <path d="M72,80 Q140,72 208,80 Q140,76 72,80Z" fill="#ee2222" opacity="0.5"/>
        <path d="M72,80 L58,74 L62,84 L72,88Z" fill="#bb0000" stroke="#880000" strokeWidth="1"/>
        <path d="M72,80 L56,90 L62,96 L72,90Z" fill="#aa0000" stroke="#880000" strokeWidth="1"/>
        <path d="M72,88 Q140,100 208,88" fill="none" stroke="#c08830" strokeWidth="1.5"/>
      </svg>
    </div>
  );
}

const STATUS_ICONS: Record<WatchStatus, React.ReactNode> = {
  watching: <Tv className="h-4 w-4" />,
  completed: <CheckCircle className="h-4 w-4" />,
  plan_to_watch: <BookOpen className="h-4 w-4" />,
  on_hold: <PauseCircle className="h-4 w-4" />,
  dropped: <XCircle className="h-4 w-4" />,
};

const STATUS_ACCENT: Record<WatchStatus, string> = {
  watching: 'text-foreground/70',
  completed: 'text-foreground/70',
  plan_to_watch: 'text-foreground/70',
  on_hold: 'text-foreground/70',
  dropped: 'text-foreground/70',
};

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [activeTab, setActiveTab] = useState<WatchStatus | 'all'>('all');
  const [list, setList] = useState<AnimeListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [hat, setHat] = useState<string>('none');

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (!username) return;

      // Așteaptă sesiunea Supabase să fie gata
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id || null;

      const [entries, profileRes, profileOwner] = await Promise.all([
        getAnimeListForUser(username),
        supabase.from('profiles').select('avatar_url, banner_url, hat').eq('username', username).maybeSingle(),
        currentUserId
          ? supabase.from('profiles').select('username').eq('id', currentUserId).single()
          : Promise.resolve({ data: null }),
      ]);

      setList(entries);
      setAvatarUrl(profileRes.data?.avatar_url || null);
      setBannerUrl(profileRes.data?.banner_url || null);
      setHat(profileRes.data?.hat || 'none');
      // is_premium fetch separat ca să nu cadă dacă coloana nu există
      try {
        const { data: premiumData } = await supabase.from('profiles').select('is_premium').eq('username', username).maybeSingle();
        setIsPremium(premiumData?.is_premium ?? false);
      } catch { setIsPremium(false); }
      setIsOwnProfile(profileOwner.data?.username === username);
      setIsLoggedIn(!!currentUserId);
      setLoading(false);
    }
    load();
  }, [username]);

  const filtered = activeTab === 'all' ? list : list.filter(e => e.status === activeTab);
  const counts: Record<string, number> = { all: list.length };
  for (const entry of list) counts[entry.status] = (counts[entry.status] || 0) + 1;

  const avgScore = list.filter(e => e.score > 0).length > 0
    ? (list.filter(e => e.score > 0).reduce((sum, e) => sum + e.score, 0) / list.filter(e => e.score > 0).length).toFixed(1)
    : '—';

  const tabs = [
    { key: 'all' as const, label: 'Toate', icon: null },
    ...Object.entries(STATUS_LABELS).map(([key, label]) => ({
      key: key as WatchStatus, label, icon: STATUS_ICONS[key as WatchStatus],
    })),
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-16 bg-background">

      {/* Banner */}
      <div className="h-36 md:h-48 bg-secondary relative overflow-hidden">
        {bannerUrl
          ? <img src={bannerUrl} alt="banner" className="w-full h-full object-cover" />
          : <div className="absolute inset-0 opacity-30"
              style={{ backgroundImage: 'radial-gradient(ellipse at 60% 50%, hsl(var(--primary)) 0%, transparent 70%)' }} />
        }
      </div>

      <div className="container px-4">
        {/* Profile header - FIX: avatar + nume nu se mai suprapun cu bannerul */}
        <div className="flex items-end gap-5 -mt-10 mb-6">

          {/* Avatar */}
          <div className="relative flex-shrink-0 z-10">
            {HAT_TESTERS.includes(username || '') && hat === 'luffy' && (
              <StrawHat size={96} />
            )}
            <PremiumAvatar
              avatarUrl={avatarUrl}
              username={username || ''}
              isPremium={isPremium}
              size="lg"
              rounded="xl"
            />
          </div>

          {/* Nume + info — pe fundal semi-transparent ca să fie vizibil peste banner */}
          <div className="flex-1 min-w-0 pb-1 z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold truncate drop-shadow-sm">{username}</h1>
              {isPremium && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)', color: '#1a0a00' }}>
                  👑 Premium
                </span>
              )}
              {isOwnProfile && (
                <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">Tu</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5"></p>
          </div>

          {!isOwnProfile && isLoggedIn && (
            <FriendButton targetUsername={username!} />
          )}
          {isOwnProfile && (
            <Link to="/settings/profile"
              className="pb-1 flex items-center gap-2 px-3 py-2 rounded-lg glass-card text-sm text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 z-10">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Setări profil</span>
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total', value: list.length },
            { label: 'Completate', value: counts['completed'] || 0 },
            { label: 'În vizionare', value: counts['watching'] || 0 },
            { label: 'Score mediu', value: avgScore },
            { label: 'Abandonat', value: counts['dropped'] || 0 },
          ].map(stat => (
            <div key={stat.label} className="glass-card p-3 text-center">
              <div className="text-xl font-bold">{loading ? '—' : stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Friends */}
        <FriendsPanel username={username!} isOwnProfile={isOwnProfile} />

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={cn('flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                  activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>
                {tab.icon}
                {tab.label}
                {counts[tab.key] ? <span className="text-xs text-muted-foreground ml-0.5">({counts[tab.key]})</span> : null}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 glass-card animate-pulse" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Tv className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>{isOwnProfile ? 'Lista ta este goală' : `${username} nu are anime în listă`}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>Niciun anime în această categorie</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((entry, i) => (
              <Link key={entry.anime.mal_id} to={`/anime/${entry.anime.mal_id}`}
                className="flex items-center gap-4 glass-card hover:bg-card/80 p-3 transition-colors group">
                <span className="text-xs text-muted-foreground w-5 text-right flex-shrink-0">{i + 1}</span>
                <img src={entry.anime.images.jpg.image_url} alt={entry.anime.title}
                  className="w-10 h-14 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {entry.anime.title_english || entry.anime.title}
                  </p>
                  <div className={cn('flex items-center gap-1 mt-1 text-xs', STATUS_ACCENT[entry.status])}>
                    {STATUS_ICONS[entry.status]}
                    <span>{STATUS_LABELS[entry.status]}</span>
                  </div>
                </div>
                {entry.score > 0 && (
                  <div className="flex items-center gap-1 text-sm font-semibold text-muted-foreground flex-shrink-0">
                    <Star className="h-3.5 w-3.5 fill-muted-foreground" />
                    {entry.score}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}