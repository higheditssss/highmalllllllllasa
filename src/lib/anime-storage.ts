import { Anime, AnimeListEntry, WatchStatus } from '@/types/anime';
import { supabase } from './supabase';

export async function getAnimeList(): Promise<AnimeListEntry[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('anime_list')
    .select('*')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false });

  return (data || []).map(row => ({
    anime: row.anime_data,
    status: row.status,
    score: row.score,
    episodesWatched: row.episodes_watched,
    addedAt: row.added_at,
  }));
}

export async function getAnimeListForUser(username: string): Promise<AnimeListEntry[]> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (!profile) return [];

  const { data } = await supabase
    .from('anime_list')
    .select('*')
    .eq('user_id', profile.id)
    .order('added_at', { ascending: false });

  return (data || []).map(row => ({
    anime: row.anime_data,
    status: row.status,
    score: row.score,
    episodesWatched: row.episodes_watched,
    addedAt: row.added_at,
  }));
}

export async function addAnimeToList(anime: Anime, status: WatchStatus): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('anime_list').upsert({
    user_id: user.id,
    mal_id: anime.mal_id,
    anime_data: anime,
    status,
    score: 0,
    episodes_watched: 0,
  }, { onConflict: 'user_id,mal_id' });
}

export async function removeFromList(malId: number): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('anime_list').delete()
    .eq('user_id', user.id)
    .eq('mal_id', malId);
}

export async function updateEntry(malId: number, updates: Partial<Pick<AnimeListEntry, 'status' | 'score' | 'episodesWatched'>>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const dbUpdates: Record<string, unknown> = {};
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.score !== undefined) dbUpdates.score = updates.score;
  if (updates.episodesWatched !== undefined) dbUpdates.episodes_watched = updates.episodesWatched;

  await supabase.from('anime_list')
    .update(dbUpdates)
    .eq('user_id', user.id)
    .eq('mal_id', malId);
}