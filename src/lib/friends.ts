import { supabase } from './supabase';
import { sendNotification } from './notifications';

export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted';

export interface FriendProfile {
  id: string;
  username: string;
  avatar_url: string | null;
}

// Obține statusul prieteniei între userul curent și altul (după username)
export async function getFriendshipStatus(targetUsername: string): Promise<{ status: FriendshipStatus; friendshipId?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: 'none' };

  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', targetUsername)
    .single();

  if (!targetProfile) return { status: 'none' };

  const { data } = await supabase
    .from('friendships')
    .select('id, status, requester_id')
    .or(`and(requester_id.eq.${user.id},addressee_id.eq.${targetProfile.id}),and(requester_id.eq.${targetProfile.id},addressee_id.eq.${user.id})`)
    .maybeSingle();

  if (!data) return { status: 'none' };

  if (data.status === 'accepted') return { status: 'accepted', friendshipId: data.id };
  if (data.status === 'pending') {
    if (data.requester_id === user.id) return { status: 'pending_sent', friendshipId: data.id };
    return { status: 'pending_received', friendshipId: data.id };
  }

  return { status: 'none' };
}

// Trimite cerere de prietenie
export async function sendFriendRequest(targetUsername: string): Promise<{ success: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Nu ești autentificat' };

  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', targetUsername)
    .single();

  if (!targetProfile) return { success: false, error: 'Utilizatorul nu există' };
  if (targetProfile.id === user.id) return { success: false, error: 'Nu poți adăuga propriul profil' };

  const { error } = await supabase
    .from('friendships')
    .insert({ requester_id: user.id, addressee_id: targetProfile.id });

  if (error) return { success: false, error: error.message };

  // Trimite notificare
  await sendNotification(targetProfile.id, 'friend_request');

  return { success: true };
}

// Acceptă cerere de prietenie
export async function acceptFriendRequest(friendshipId: string): Promise<{ success: boolean }> {
  const { data: friendship } = await supabase
    .from('friendships')
    .select('requester_id')
    .eq('id', friendshipId)
    .single();

  const { error } = await supabase
    .from('friendships')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', friendshipId);

  if (!error && friendship) {
    await sendNotification(friendship.requester_id, 'friend_accepted');
  }

  return { success: !error };
}

// Respinge / anulează / șterge prietenie
export async function removeFriendship(friendshipId: string): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId);

  return { success: !error };
}

// Obține lista de prieteni ai unui user (după username)
export async function getFriendsForUser(username: string): Promise<FriendProfile[]> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (!profile) return [];

  const { data } = await supabase
    .from('friendships')
    .select(`
      id,
      requester_id,
      addressee_id,
      requester:profiles!friendships_requester_id_fkey(id, username, avatar_url),
      addressee:profiles!friendships_addressee_id_fkey(id, username, avatar_url)
    `)
    .eq('status', 'accepted')
    .or(`requester_id.eq.${profile.id},addressee_id.eq.${profile.id}`);

  if (!data) return [];

  return data.map((f: any) => {
    const friend = f.requester_id === profile.id ? f.addressee : f.requester;
    return { id: friend.id, username: friend.username, avatar_url: friend.avatar_url };
  });
}

// Obține cererile de prietenie primite (pentru userul curent)
export async function getPendingRequests(): Promise<Array<{ id: string; profile: FriendProfile }>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('friendships')
    .select(`
      id,
      requester:profiles!friendships_requester_id_fkey(id, username, avatar_url)
    `)
    .eq('addressee_id', user.id)
    .eq('status', 'pending');

  if (!data) return [];

  return data.map((f: any) => ({
    id: f.id,
    profile: { id: f.requester.id, username: f.requester.username, avatar_url: f.requester.avatar_url },
  }));
}
