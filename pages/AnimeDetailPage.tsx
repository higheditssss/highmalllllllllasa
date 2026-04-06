import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Anime, WatchStatus, STATUS_LABELS } from '@/types/anime';
import { addAnimeToList, getAnimeList } from '@/lib/anime-storage';
import { AnimeCard } from '@/components/AnimeCard';
import { Star, ArrowLeft, Calendar, Tv, Clock, Plus, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface AnimeFullData extends Anime {
  synopsis?: string;
  trailer?: {
    youtube_id?: string;
    url?: string;
  };
  aired?: {
    string?: string;
  };
  duration?: string;
  rating?: string;
  studios?: { mal_id: number; name: string }[];
  source?: string;
  rank?: number;
  popularity?: number;
  members?: number;
  season?: string;
}

interface Recommendation {
  entry: Anime;
}

async function fetchAnimeDetail(id: string): Promise<AnimeFullData> {
  const res = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`);
  if (!res.ok) throw new Error('Anime negăsit');
  const data = await res.json();
  return data.data;
}

async function fetchRecommendations(id: string): Promise<Recommendation[]> {
  const res = await fetch(`https://api.jikan.moe/v4/anime/${id}/recommendations`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.data || []).slice(0, 8);
}

export default function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const { data: anime, isLoading, error } = useQuery({
    queryKey: ['anime-detail', id],
    queryFn: () => fetchAnimeDetail(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 30,
  });

  const { data: recommendations } = useQuery({
    queryKey: ['anime-recs', id],
    queryFn: () => fetchRecommendations(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 30,
  });

  // FIX: getAnimeList e acum async, folosim useQuery în loc de apel sincron
  const { data: animeList } = useQuery({
    queryKey: ['anime-list'],
    queryFn: getAnimeList,
    staleTime: 1000 * 60 * 5,
  });

  const listEntry = animeList?.find(e => e.anime.mal_id === Number(id));

  const handleAdd = async (status: WatchStatus) => {
    if (!anime) return;
    await addAnimeToList(anime, status);
    setShowStatusMenu(false);
    toast.success(`${anime.title_english || anime.title} adăugat ca "${STATUS_LABELS[status]}"!`);
  };

  const handleAddRec = async (a: Anime, status: WatchStatus) => {
    await addAnimeToList(a, status);
    toast.success(`${a.title_english || a.title} adăugat!`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 md:pb-8 pt-16 md:pt-20">
        <div className="container px-4 pt-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-32 bg-secondary rounded-lg" />
            <div className="flex gap-4">
              <div className="w-36 h-52 bg-secondary rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-secondary rounded w-3/4" />
                <div className="h-4 bg-secondary rounded w-1/2" />
                <div className="h-4 bg-secondary rounded w-1/3" />
              </div>
            </div>
            <div className="h-40 bg-secondary rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen pb-24 md:pb-8 pt-16 md:pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Anime-ul nu a fost găsit</p>
          <Link to="/" className="text-primary hover:underline">Înapoi acasă</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-16 md:pt-20">
      <div className="container px-4 pt-2">
        <button onClick={() => window.history.back()} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          Înapoi
        </button>
      </div>

      <div className="container px-4">
        <div className="flex gap-4 md:gap-6">
          <div className="w-32 md:w-44 flex-shrink-0">
            <div className="relative rounded-xl overflow-hidden glow-gold">
              <img
                src={anime.images.jpg.large_image_url || anime.images.jpg.image_url}
                alt={anime.title}
                className="w-full aspect-[3/4] object-cover"
              />
              {anime.score && (
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-bold">
                  <Star className="h-3 w-3 text-primary fill-primary" />
                  {anime.score}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl md:text-2xl font-bold leading-tight">
              {anime.title_english || anime.title}
            </h1>
            {anime.title_english && anime.title !== anime.title_english && (
              <p className="text-sm text-muted-foreground mt-0.5">{anime.title}</p>
            )}

            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {anime.genres.map(g => (
                  <span key={g.mal_id} className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/15 text-primary">
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {anime.type && (
                <div className="flex items-center gap-2">
                  <Tv className="h-3.5 w-3.5" />
                  <span>{anime.type}{anime.episodes ? ` • ${anime.episodes} episoade` : ''}</span>
                </div>
              )}
              {anime.aired?.string && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{anime.aired.string}</span>
                </div>
              )}
              {anime.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{anime.duration}</span>
                </div>
              )}
            </div>

            <div className="mt-4 relative">
              {listEntry ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                    {STATUS_LABELS[listEntry.status]}
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Adaugă în listă
                </button>
              )}
              {showStatusMenu && (
                <div className="absolute top-full left-0 mt-2 z-20 glass-card p-2 min-w-[180px] animate-fade-in">
                  {(Object.entries(STATUS_LABELS) as [WatchStatus, string][]).map(([status, label]) => (
                    <button
                      key={status}
                      onClick={() => handleAdd(status)}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {(anime.rank || anime.popularity || anime.studios?.length) && (
        <div className="container px-4 mt-6">
          <div className="grid grid-cols-3 gap-3">
            {anime.rank && (
              <div className="glass-card p-3 text-center">
                <p className="text-lg font-bold text-gradient-gold">#{anime.rank}</p>
                <p className="text-xs text-muted-foreground">Rang</p>
              </div>
            )}
            {anime.popularity && (
              <div className="glass-card p-3 text-center">
                <p className="text-lg font-bold">#{anime.popularity}</p>
                <p className="text-xs text-muted-foreground">Popularitate</p>
              </div>
            )}
            {anime.studios && anime.studios.length > 0 && (
              <div className="glass-card p-3 text-center">
                <p className="text-sm font-semibold truncate">{anime.studios[0].name}</p>
                <p className="text-xs text-muted-foreground">Studio</p>
              </div>
            )}
          </div>
        </div>
      )}

      {anime.synopsis && (
        <div className="container px-4 mt-6">
          <h2 className="font-display text-lg font-bold mb-3">Sinopsis</h2>
          <div className="glass-card p-4">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {anime.synopsis}
            </p>
          </div>
        </div>
      )}

      {anime.trailer?.youtube_id && (
        <div className="container px-4 mt-6">
          <h2 className="font-display text-lg font-bold mb-3">Trailer</h2>
          <div className="glass-card overflow-hidden rounded-xl">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${anime.trailer.youtube_id}`}
                title={`${anime.title} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      <div className="container px-4 mt-6">
        <a
          href={`https://myanimelist.net/anime/${anime.mal_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Vezi pe MyAnimeList
        </a>
      </div>

      {recommendations && recommendations.length > 0 && (
        <div className="container px-4 mt-8 mb-8">
          <h2 className="font-display text-lg font-bold mb-4">Recomandări similare</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {recommendations.map(rec => (
              <Link key={rec.entry.mal_id} to={`/anime/${rec.entry.mal_id}`}>
                <AnimeCard anime={rec.entry} onAdd={handleAddRec} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}