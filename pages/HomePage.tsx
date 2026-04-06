import { useQuery } from '@tanstack/react-query';
import { Anime, WatchStatus } from '@/types/anime';
import { addAnimeToList } from '@/lib/anime-storage';
import { getCurrentProfile } from '@/lib/auth';
import { AnimeCard } from '@/components/AnimeCard';
import { TrendingUp, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

async function fetchTopAnime(): Promise<Anime[]> {
  const res = await fetch('https://api.jikan.moe/v4/top/anime?limit=12');
  const data = await res.json();
  return data.data;
}

async function fetchSeasonalAnime(): Promise<Anime[]> {
  const res = await fetch('https://api.jikan.moe/v4/seasons/now?limit=12');
  const data = await res.json();
  return data.data;
}

export default function HomePage() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    getCurrentProfile().then(p => setUsername(p?.username || null));
  }, []);

  const { data: topAnime, isLoading: loadingTop } = useQuery({
    queryKey: ['top-anime'], queryFn: fetchTopAnime, staleTime: 1000 * 60 * 10,
  });

  const { data: seasonalAnime, isLoading: loadingSeasonal } = useQuery({
    queryKey: ['seasonal-anime'], queryFn: fetchSeasonalAnime, staleTime: 1000 * 60 * 10,
  });

  const handleAdd = async (anime: Anime, status: WatchStatus) => {
    if (!username) { toast.error('Trebuie să fii autentificat'); return; }
    await addAnimeToList(anime, status);
    toast.success(`${anime.title_english || anime.title} adăugat în listă!`);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20 anime-bg">
      <section className="relative px-4 pt-8 pb-12 md:pt-6">
        <div className="container">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight">
              <span>HIGHMAL</span>
            </h1>
            <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
              Colecția ta de anime, în română. Urmărește ce vizionezi, descoperă titluri noi și importă lista din MyAnimeList.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 mb-12">
        <div className="container">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Sezonul actual</h2>
          </div>
          {loadingSeasonal ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="glass-card aspect-[3/4] animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {seasonalAnime?.map(anime => <AnimeCard key={anime.mal_id} anime={anime} onAdd={username ? handleAdd : undefined} />)}
            </div>
          )}
        </div>
      </section>

      <section className="px-4 mb-12">
        <div className="container">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Top anime</h2>
          </div>
          {loadingTop ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="glass-card aspect-[3/4] animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {topAnime?.map(anime => <AnimeCard key={anime.mal_id} anime={anime} onAdd={username ? handleAdd : undefined} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}