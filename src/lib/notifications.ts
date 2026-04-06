import { supabase } from './supabase';

export type NotificationType = 'friend_request' | 'friend_accepted';

export interface Notification {
  id: string;
  type: NotificationType;
  from_user_id: string;
  from_username: string;
  from_avatar: string | null;
  read: boolean;
  created_at: string;
}

// Obține notificările userului curent
export async function getNotifications(): Promise<Notification[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('notifications')
    .select(`
      id, type, read, created_at, from_user_id,
      from_profile:profiles!notifications_from_user_id_fkey(username, avatar_url)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (!data) return [];

  return data.map((n: any) => ({
    id: n.id,
    type: n.type,
    from_user_id: n.from_user_id,
    from_username: n.from_profile?.username || 'unknown',
    from_avatar: n.from_profile?.avatar_url || null,
    read: n.read,
    created_at: n.created_at,
  }));
}

// Număr notificări necitite
export async function getUnreadCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false);

  return count || 0;
}

// Trimite notificare
export async function sendNotification(toUserId: string, type: NotificationType) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('notifications').insert({
    user_id: toUserId,
    type,
    from_user_id: user.id,
  });
}

// Marchează toate ca citite
export async function markAllAsRead() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false);
}

// Șterge o notificare
export async function deleteNotification(id: string) {
  await supabase.from('notifications').delete().eq('id', id);
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'acum';
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}z`;
}
