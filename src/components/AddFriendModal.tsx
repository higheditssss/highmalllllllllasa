import { useState } from 'react';
import { X, Search, UserPlus, Loader2 } from 'lucide-react';
import { sendFriendRequest, getFriendshipStatus } from '@/lib/friends';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface AddFriendModalProps {
  onClose: () => void;
}

interface UserResult {
  username: string;
  avatar_url: string | null;
}

export function AddFriendModal({ onClose }: AddFriendModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.trim().length < 2) { setResults([]); return; }

    setSearching(true);
    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .ilike('username', `%${value.trim()}%`)
      .limit(8);

    setResults(data || []);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md glass-card rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Adaugă prieten</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            type="text"
            placeholder="Caută după username..."
            value={query}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-primary transition-colors"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
          )}
        </div>

        {/* Results */}
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {results.length === 0 && query.length >= 2 && !searching && (
            <p className="text-sm text-muted-foreground text-center py-6">Niciun user găsit</p>
          )}
          {query.length < 2 && (
            <p className="text-sm text-muted-foreground text-center py-6">Scrie minim 2 caractere</p>
          )}
          {results.map(user => (
            <div key={user.username} className="flex items-center justify-between gap-3 p-2.5 rounded-lg hover:bg-secondary transition-colors">
              <Link to={`/user/${user.username}`} onClick={onClose} className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity">
                {user.avatar_url
                  ? <img src={user.avatar_url} alt={user.username} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  : <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                }
                <span className="text-sm font-medium truncate">{user.username}</span>
              </Link>

              <button
                onClick={() => handleSend(user.username)}
                disabled={!!sending || sent.has(user.username)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 disabled:opacity-50
                  bg-primary/10 text-primary hover:bg-primary/20 disabled:cursor-not-allowed">
                {sending === user.username
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : sent.has(user.username)
                    ? '✓ Trimis'
                    : <><UserPlus className="h-3.5 w-3.5" /> Adaugă</>
                }
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
