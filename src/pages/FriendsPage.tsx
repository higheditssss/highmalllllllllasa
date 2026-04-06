import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, UserCheck, UserX, Search, Loader2, X } from 'lucide-react';
import {
  getFriendsForUser,
  getPendingRequests,
  acceptFriendRequest,
  removeFriendship,
  sendFriendRequest,
  getFriendshipStatus,
  FriendProfile,
} from '@/lib/friends';
import { getCurrentProfile } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function FriendsPage() {
  const [tab, setTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Array<{ id: string; profile: FriendProfile }>>([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      setLoading(true);
      const profile = await getCurrentProfile();
      if (!profile) { setLoading(false); return; }
      setCurrentUsername(profile.username);

      const [f, p] = await Promise.all([
        getFriendsForUser(profile.username),
        getPendingRequests(),
      ]);
      setFriends(f);
      setPendingRequests(p);
      setLoading(false);
    }
    load();
  }, []);

  const handleAccept = async (id: string, profile: FriendProfile) => {
    await acceptFriendRequest(id);
    toast.success(`Acum ești prieten cu ${profile.username}!`);
    setPendingRequests(prev => prev.filter(r => r.id !== id));
    setFriends(prev => [...prev, profile]);
  };

  const handleReject = async (id: string, username: string) => {
    await removeFriendship(id);
    toast.success('Cerere refuzată');
    setPendingRequests(prev => prev.filter(r => r.id !== id));
  };

  const handleRemoveFriend = async (friendId: string, username: string) => {
    const { status, friendshipId } = await getFriendshipStatus(username);
    if (friendshipId) {
      await removeFriendship(friendshipId);
      toast.success(`${username} eliminat din prieteni`);
      setFriends(prev => prev.filter(f => f.id !== friendId));
    }
  };

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .ilike('username', `%${value.trim()}%`)
      .neq('username', currentUsername || '')
      .limit(10);
    setSearchResults(data || []);
    setSearching(false);
  };

  const handleSend = async (targetUsername: string) => {
    setSending(targetUsername);
    const { status } = await getFriendshipStatus(targetUsername);
    if (status !== 'none') {
      toast.info('Ai deja o relație cu acest user');
      setSending(null);
      return;
    }
    const result = await sendFriendRequest(targetUsername);
    if (result.success) {
      toast.success(`Cerere trimisă către ${targetUsername}!`);
      setSent(prev => new Set(prev).add(targetUsername));
    } else {
      toast.error(result.error || 'Eroare');
    }
    setSending(null);
  };

  const tabs = [
    { key: 'friends' as const, label: 'Prieteni', count: friends.length },
    { key: 'requests' as const, label: 'Cereri', count: pendingRequests.length },
    { key: 'search' as const, label: 'Adaugă', count: null },
  ];

  if (!currentUsername && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground md:pt-16">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="mb-4">Trebuie să fii autentificat</p>
          <Link to="/login" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">
            Intră în cont
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20 bg-background">
      <div className="container max-w-2xl px-4">

        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" />
          Prieteni
        </h1>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn('flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>
              {t.label}
              {t.count !== null && t.count > 0 && (
                <span className={cn('text-xs px-1.5 py-0.5 rounded-full',
                  t.key === 'requests' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground')}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="glass-card p-4 flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-secondary" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 bg-secondary rounded" />
                  <div className="h-3 w-20 bg-secondary rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Tab: Prieteni */}
            {tab === 'friends' && (
              <div className="space-y-2">
                {friends.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="mb-2">Nu ai prieteni adăugați încă</p>
                    <button onClick={() => setTab('search')}
                      className="text-sm text-primary hover:underline">
                      Caută prieteni →
                    </button>
                  </div>
                ) : friends.map(friend => (
                  <div key={friend.id} className="glass-card p-4 flex items-center gap-3">
                    <Link to={`/user/${friend.username}`} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                      {friend.avatar_url
                        ? <img src={friend.avatar_url} alt={friend.username} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                        : <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold flex-shrink-0">
                            {friend.username.charAt(0).toUpperCase()}
                          </div>
                      }
                      <span className="font-medium truncate">{friend.username}</span>
                    </Link>
                    <button onClick={() => handleRemoveFriend(friend.id, friend.username)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Cereri */}
            {tab === 'requests' && (
              <div className="space-y-2">
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Nicio cerere de prietenie</p>
                  </div>
                ) : pendingRequests.map(({ id, profile }) => (
                  <div key={id} className="glass-card p-4 flex items-center gap-3">
                    <Link to={`/user/${profile.username}`} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                      {profile.avatar_url
                        ? <img src={profile.avatar_url} alt={profile.username} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                        : <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold flex-shrink-0">
                            {profile.username.charAt(0).toUpperCase()}
                          </div>
                      }
                      <div className="min-w-0">
                        <p className="font-medium truncate">{profile.username}</p>
                        <p className="text-xs text-muted-foreground">vrea să fie prieten cu tine</p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => handleAccept(id, profile)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        <UserCheck className="h-4 w-4" />
                        Acceptă
                      </button>
                      <button onClick={() => handleReject(id, profile.username)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors">
                        <UserX className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Adaugă */}
            {tab === 'search' && (
              <div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Caută după username..."
                    value={query}
                    onChange={e => handleSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-secondary border border-border text-sm outline-none focus:border-primary transition-colors"
                  />
                  {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />}
                </div>

                <div className="space-y-2">
                  {query.length < 2 && (
                    <p className="text-center text-sm text-muted-foreground py-10">Scrie minim 2 caractere</p>
                  )}
                  {query.length >= 2 && !searching && searchResults.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-10">Niciun user găsit</p>
                  )}
                  {searchResults.map(user => (
                    <div key={user.username} className="glass-card p-4 flex items-center gap-3">
                      <Link to={`/user/${user.username}`} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                        {user.avatar_url
                          ? <img src={user.avatar_url} alt={user.username} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                          : <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold flex-shrink-0">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                        }
                        <span className="font-medium truncate">{user.username}</span>
                      </Link>
                      <button
                        onClick={() => handleSend(user.username)}
                        disabled={!!sending || sent.has(user.username)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                        {sending === user.username
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : sent.has(user.username)
                            ? <><UserCheck className="h-4 w-4" /> Trimis</>
                            : <><UserPlus className="h-4 w-4" /> Adaugă</>
                        }
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
