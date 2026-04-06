import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Anime, WatchStatus } from '@/types/anime';
import { addAnimeToList } from '@/lib/anime-storage';
import { AnimeCard } from '@/components/AnimeCard';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

async function searchAnime(query: string): Promise<Anime[]> {
  if (!query.trim()) return [];
  const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=20`);
  const data = await res.json();
  return data.data;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: results, isLoading } = useQuery({
    queryKey: ['search-anime', searchTerm],
    queryFn: () => searchAnime(searchTerm),
    enabled: searchTerm.length > 2,
    staleTime: 1000 * 60 * 5,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query);
  };

  const handleAdd = (anime: Anime, status: WatchStatus) => {
    addAnimeToList(anime, status);
    toast.success(`${anime.title_english || anime.title} adăugat!`);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20">
      <div className="container px-4 pt-8">
        <h1 className="font-display text-2xl font-bold mb-6">Caută anime</h1>
        
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Caută un anime..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </form>

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="glass-card aspect-[3/4] animate-pulse" />
            ))}
          </div>
        )}

        {results && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map(anime => (
              <AnimeCard key={anime.mal_id} anime={anime} onAdd={handleAdd} />
            ))}
          </div>
        )}

        {results && results.length === 0 && searchTerm && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Niciun rezultat pentru "{searchTerm}"</p>
          </div>
        )}

        {!searchTerm && (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Caută un anime după nume</p>
          </div>
        )}
      </div>
    </div>
  );
}
