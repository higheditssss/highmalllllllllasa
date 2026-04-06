import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimeListEntry, WatchStatus, STATUS_LABELS } from '@/types/anime';
import { getAnimeList, removeFromList, updateEntry } from '@/lib/anime-storage';
import { getCurrentProfile } from '@/lib/auth';
import { List, Trash2, Star, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function MyListPage() {
  const [list, setList] = useState<AnimeListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<WatchStatus | 'all'>('all');
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [entries, profile] = await Promise.all([getAnimeList(), getCurrentProfile()]);
      setList(entries);
      setUsername(profile?.username || null);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = activeTab === 'all' ? list : list.filter(e => e.status === activeTab);
  const counts: Record<string, number> = { all: list.length };
  for (const entry of list) counts[entry.status] = (counts[entry.status] || 0) + 1;

  const handleRemove = async (malId: number) => {
    await removeFromList(malId);
    setList(prev => prev.filter(e => e.anime.mal_id !== malId));
    toast.success('Anime eliminat din listă');
  };

  const handleStatusChange = async (malId: number, status: WatchStatus) => {
    await updateEntry(malId, { status });
    setList(prev => prev.map(e => e.anime.mal_id === malId ? { ...e, status } : e));
  };

  const handleScoreChange = async (malId: number, score: number) => {
    await updateEntry(malId, { score });
    setList(prev => prev.map(e => e.anime.mal_id === malId ? { ...e, score } : e));
  };

  const tabs = [
    { key: 'all' as const, label: 'Toate' },
    ...Object.entries(STATUS_LABELS).map(([key, label]) => ({ key: key as WatchStatus, label })),
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20">
      <div className="container px-4 pt-8">
        <div className="flex items-center gap-2 mb-6">
          <List className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-bold">Lista mea</h1>
          <span className="ml-auto text-sm text-muted-foreground">{list.length} anime</span>
          {username && (
            <button onClick={() => navigate(`/user/${username}`)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
              <User className="h-4 w-4" />
              Profil public
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={cn('flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground')}>
              {tab.label}{counts[tab.key] ? ` (${counts[tab.key]})` : ''}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card h-28 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <List className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Lista ta este goală</p>
            <p className="text-sm mt-1">Caută anime și adaugă-le în listă</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(entry => (
              <div key={entry.anime.mal_id} className="glass-card p-4 flex items-center gap-4 animate-fade-in">
                <Link to={`/anime/${entry.anime.mal_id}`}>
                  <img src={entry.anime.images.jpg.image_url} alt={entry.anime.title}
                    className="w-14 h-20 rounded-lg object-cover flex-shrink-0 hover:opacity-80 transition-opacity" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/anime/${entry.anime.mal_id}`}
                    className="font-semibold text-sm truncate block hover:text-primary transition-colors">
                    {entry.anime.title_english || entry.anime.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1.5">
                    <select value={entry.status}
                      onChange={e => handleStatusChange(entry.anime.mal_id, e.target.value as WatchStatus)}
                      className="text-xs bg-secondary border border-border rounded-md px-2 py-1 text-foreground">
                      {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-primary" />
                      <select value={entry.score}
                        onChange={e => handleScoreChange(entry.anime.mal_id, parseInt(e.target.value))}
                        className="text-xs bg-secondary border border-border rounded-md px-1 py-1 text-foreground">
                        <option value="0">-</option>
                        {Array.from({ length: 10 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleRemove(entry.anime.mal_id)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}