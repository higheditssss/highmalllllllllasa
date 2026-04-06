import { Anime, AnimeListEntry, WatchStatus } from '@/types/anime';

interface MALExportEntry {
  series_animedb_id: string;
  series_title: string;
  my_watched_episodes: string;
  my_score: string;
  my_status: string;
}

const MAL_STATUS_MAP: Record<string, WatchStatus> = {
  'Watching': 'watching',
  'Completed': 'completed',
  'Plan to Watch': 'plan_to_watch',
  'On-Hold': 'on_hold',
  'Dropped': 'dropped',
};

export async function parseMALExport(xmlText: string): Promise<AnimeListEntry[]> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  const animeNodes = doc.querySelectorAll('anime');
  
  const entries: AnimeListEntry[] = [];
  
  for (const node of Array.from(animeNodes)) {
    const malId = parseInt(node.querySelector('series_animedb_id')?.textContent || '0');
    const title = node.querySelector('series_title')?.textContent || 'Unknown';
    const episodes = parseInt(node.querySelector('series_episodes')?.textContent || '0');
    const watchedEps = parseInt(node.querySelector('my_watched_episodes')?.textContent || '0');
    const score = parseInt(node.querySelector('my_score')?.textContent || '0');
    const statusText = node.querySelector('my_status')?.textContent || 'Plan to Watch';
    const imageUrl = node.querySelector('series_image')?.textContent || '';
    
    if (malId === 0) continue;
    
    const anime: Anime = {
      mal_id: malId,
      title,
      images: {
        jpg: {
          image_url: imageUrl || `https://cdn.myanimelist.net/images/anime/${malId}.jpg`,
        },
      },
      episodes: episodes || undefined,
    };
    
    entries.push({
      anime,
      status: MAL_STATUS_MAP[statusText] || 'plan_to_watch',
      score,
      episodesWatched: watchedEps,
      addedAt: new Date().toISOString(),
    });
  }
  
  return entries;
}

export async function fetchAnimeDetails(malId: number): Promise<Anime | null> {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${malId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}
