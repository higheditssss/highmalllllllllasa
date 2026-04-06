import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, UserX } from 'lucide-react';
import { getFriendsForUser, getPendingRequests, acceptFriendRequest, removeFriendship, FriendProfile } from '@/lib/friends';
import { toast } from 'sonner';

interface FriendsPanelProps {
  username: string;
  isOwnProfile: boolean;
}

export function FriendsPanel({ username, isOwnProfile }: FriendsPanelProps) {
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Array<{ id: string; profile: FriendProfile }>>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [f, p] = await Promise.all([
      getFriendsForUser(username),
      isOwnProfile ? getPendingRequests() : Promise.resolve([]),
    ]);
    setFriends(f);
    setPendingRequests(p);
    setLoading(false);
  }

  useEffect(() => { load(); }, [username, isOwnProfile]);

  const handleAccept = async (id: string, profile: FriendProfile) => {
    await acceptFriendRequest(id);
    toast.success(`Acum ești prieten cu ${profile.username}!`);
    setPendingRequests(prev => prev.filter(r => r.id !== id));
    setFriends(prev => [...prev, profile]);
  };

  const handleReject = async (id: string) => {
    await removeFriendship(id);
    toast.success('Cerere refuzată');
    setPendingRequests(prev => prev.filter(r => r.id !== id));
  };

  if (loading) return (
    <div className="glass-card p-4 mb-6">
      <div className="h-4 w-24 bg-secondary rounded animate-pulse mb-3" />
      <div className="flex gap-3">
        {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-full bg-secondary animate-pulse" />)}
      </div>
    </div>
  );

  if (!isOwnProfile && friends.length === 0) return null;

  return (
    <div className="glass-card p-4 mb-6">
      {/* Cereri în așteptare — doar pe profilul propriu */}
      {isOwnProfile && pendingRequests.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Cereri de prietenie ({pendingRequests.length})
          </h3>
          <div className="space-y-2">
            {pendingRequests.map(({ id, profile }) => (
              <div key={id} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-secondary/50">
                <Link to={`/user/${profile.username}`} className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity">
                  {profile.avatar_url
                    ? <img src={profile.avatar_url} alt={profile.username} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    : <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {profile.username.charAt(0).toUpperCase()}
                      </div>
                  }
                  <span className="text-sm font-medium truncate">{profile.username}</span>
                </Link>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleAccept(id, profile)}
                    className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    <UserCheck className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleReject(id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors">
                    <UserX className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista prieteni */}
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
        <Users className="h-4 w-4" />
        Prieteni {friends.length > 0 && <span>({friends.length})</span>}
      </h3>

      {friends.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isOwnProfile ? 'Nu ai prieteni adăugați încă.' : `${username} nu are prieteni adăugați.`}
        </p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {friends.map(friend => (
            <Link key={friend.id} to={`/user/${friend.username}`}
              className="flex flex-col items-center gap-1 group">
              {friend.avatar_url
                ? <img src={friend.avatar_url} alt={friend.username}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary transition-all" />
                : <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold ring-2 ring-transparent group-hover:ring-primary transition-all">
                    {friend.username.charAt(0).toUpperCase()}
                  </div>
              }
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors max-w-[60px] truncate">
                {friend.username}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
