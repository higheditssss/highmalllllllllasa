export interface Anime {
  mal_id: number;
  title: string;
  title_english?: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url?: string;
    };
  };
  score?: number;
  episodes?: number;
  status?: string;
  synopsis?: string;
  genres?: { mal_id: number; name: string }[];
  year?: number;
  type?: string;
}

export type WatchStatus = 'watching' | 'completed' | 'plan_to_watch' | 'dropped' | 'on_hold';

export interface AnimeListEntry {
  anime: Anime;
  status: WatchStatus;
  score: number;
  episodesWatched: number;
  addedAt: string;
}

export const STATUS_LABELS: Record<WatchStatus, string> = {
  watching: 'În vizionare',
  completed: 'Completat',
  plan_to_watch: 'De vizionat',
  on_hold: 'În pauză',
  dropped: 'Abandonat',
};

export const STATUS_COLORS: Record<WatchStatus, string> = {
  watching: 'bg-blue-500',
  completed: 'bg-emerald-500',
  plan_to_watch: 'bg-amber-500',
  on_hold: 'bg-orange-500',
  dropped: 'bg-red-500',
};
