import { useState, useEffect } from 'react';
import { UserPlus, UserCheck, UserX, Clock } from 'lucide-react';
import { getFriendshipStatus, sendFriendRequest, acceptFriendRequest, removeFriendship, FriendshipStatus } from '@/lib/friends';
import { toast } from 'sonner';

interface FriendButtonProps {
  targetUsername: string;
}

export function FriendButton({ targetUsername }: FriendButtonProps) {
  const [status, setStatus] = useState<FriendshipStatus>('none');
  const [friendshipId, setFriendshipId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    async function load() {
      const result = await getFriendshipStatus(targetUsername);
      setStatus(result.status);
      setFriendshipId(result.friendshipId);
      setLoading(false);
    }
    load();
  }, [targetUsername]);

  const handleSend = async () => {
    setActing(true);
    const result = await sendFriendRequest(targetUsername);
    if (result.success) {
      toast.success('Cerere de prietenie trimisă!');
      const updated = await getFriendshipStatus(targetUsername);
      setStatus(updated.status);
      setFriendshipId(updated.friendshipId);
    } else {
      toast.error(result.error || 'Eroare');
    }
    setActing(false);
  };

  const handleAccept = async () => {
    if (!friendshipId) return;
    setActing(true);
    const result = await acceptFriendRequest(friendshipId);
    if (result.success) {
      toast.success('Cerere acceptată!');
      setStatus('accepted');
    }
    setActing(false);
  };

  const handleRemove = async () => {
    if (!friendshipId) return;
    setActing(true);
    const result = await removeFriendship(friendshipId);
    if (result.success) {
      const label = status === 'accepted' ? 'Prieten eliminat' : 'Cerere anulată';
      toast.success(label);
      setStatus('none');
      setFriendshipId(undefined);
    }
    setActing(false);
  };

  if (loading) return null;

  if (status === 'none') return (
    <button onClick={handleSend} disabled={acting}
      className="flex items-center gap-2 px-3 py-2 rounded-lg glass-card text-sm text-muted-foreground hover:text-foreground hover:bg-primary/10 hover:text-primary transition-colors flex-shrink-0 z-10 disabled:opacity-50">
      <UserPlus className="h-4 w-4" />
      <span className="hidden sm:inline">Adaugă prieten</span>
    </button>
  );

  if (status === 'pending_sent') return (
    <button onClick={handleRemove} disabled={acting}
      className="flex items-center gap-2 px-3 py-2 rounded-lg glass-card text-sm text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0 z-10 disabled:opacity-50">
      <Clock className="h-4 w-4" />
      <span className="hidden sm:inline">Cerere trimisă</span>
    </button>
  );

  if (status === 'pending_received') return (
    <div className="flex items-center gap-1 flex-shrink-0 z-10">
      <button onClick={handleAccept} disabled={acting}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50">
        <UserCheck className="h-4 w-4" />
        <span className="hidden sm:inline">Acceptă</span>
      </button>
      <button onClick={handleRemove} disabled={acting}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm glass-card text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-50">
        <UserX className="h-4 w-4" />
        <span className="hidden sm:inline">Refuză</span>
      </button>
    </div>
  );

  if (status === 'accepted') return (
    <button onClick={handleRemove} disabled={acting}
      className="flex items-center gap-2 px-3 py-2 rounded-lg glass-card text-sm text-primary hover:text-red-400 transition-colors flex-shrink-0 z-10 disabled:opacity-50">
      <UserCheck className="h-4 w-4" />
      <span className="hidden sm:inline">Prieteni</span>
    </button>
  );

  return null;
}
