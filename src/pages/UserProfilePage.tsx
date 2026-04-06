import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAnimeListForUser } from '@/lib/anime-storage';
import { getCurrentProfile } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { AnimeListEntry, WatchStatus, STATUS_LABELS } from '@/types/anime';
import { Star, Tv, CheckCircle, PauseCircle, XCircle, BookOpen, Copy, Check, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

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
  const [copied, setCopied] = useState(false);
  const [list, setList] = useState<AnimeListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (!username) return;
      const [entries, profileRes, currentProfile] = await Promise.all([
        getAnimeListForUser(username),
        supabase.from('profiles').select('avatar_url, banner_url').eq('username', username).single(),
        getCurrentProfile(),
      ]);
      setList(entries);
      setAvatarUrl(profileRes.data?.avatar_url || null);
      setBannerUrl(profileRes.data?.banner_url || null);
      setIsOwnProfile(currentProfile?.username === username);
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copiat!');
    setTimeout(() => setCopied(false), 2000);
  };

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
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-card overflow-hidden ring-4 ring-background shadow-lg">
              {avatarUrl
                ? <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <span className="text-3xl md:text-4xl font-bold text-muted-foreground select-none">
                      {username?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
              }
            </div>
          </div>

          {/* Nume + info — pe fundal semi-transparent ca să fie vizibil peste banner */}
          <div className="flex-1 min-w-0 pb-1 z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold truncate drop-shadow-sm">{username}</h1>
              {isOwnProfile && (
                <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">Tu</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">Profil public HIGHMAL</p>
          </div>

          <button onClick={handleCopyLink}
            className="pb-1 flex items-center gap-2 px-3 py-2 rounded-lg glass-card text-sm text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 z-10">
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            <span className="hidden sm:inline">{copied ? 'Copiat!' : 'Copiază link'}</span>
          </button>
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
