import { Anime, WatchStatus, STATUS_LABELS } from '@/types/anime';
import { Star, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface AnimeCardProps {
  anime: Anime;
  onAdd?: (anime: Anime, status: WatchStatus) => void;
  score?: number;
  compact?: boolean;
}

export function AnimeCard({ anime, onAdd, score, compact }: AnimeCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Link to={`/anime/${anime.mal_id}`} className={cn(
      'group relative glass-card overflow-hidden transition-all duration-300 hover:glow-gold hover:scale-[1.02]',
      compact ? 'flex gap-3 p-3' : ''
    )}>
      <div className={cn(
        'relative overflow-hidden',
        compact ? 'w-16 h-24 rounded-lg flex-shrink-0' : 'aspect-[3/4]'
      )}>
        <img
          src={anime.images.jpg.large_image_url || anime.images.jpg.image_url}
          alt={anime.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {!compact && anime.score && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-semibold">
            <Star className="h-3 w-3 text-primary fill-primary" />
            {anime.score}
          </div>
        )}
        {!compact && onAdd && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={(e) => { e.preventDefault(); setShowMenu(!showMenu); }}
              className="p-3 rounded-full bg-primary text-primary-foreground hover:scale-110 transition-transform"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      
      <div className={compact ? 'flex-1 min-w-0' : 'p-3'}>
        <h3 className={cn(
          'font-semibold truncate',
          compact ? 'text-sm' : 'text-sm'
        )}>
          {anime.title_english || anime.title}
        </h3>
        {!compact && (
          <div className="flex items-center gap-2 mt-1">
            {anime.type && (
              <span className="text-xs text-muted-foreground">{anime.type}</span>
            )}
            {anime.episodes && (
              <span className="text-xs text-muted-foreground">• {anime.episodes} ep.</span>
            )}
          </div>
        )}
        {compact && score !== undefined && score > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-3 w-3 text-primary fill-primary" />
            <span className="text-xs text-muted-foreground">{score}/10</span>
          </div>
        )}
      </div>

      {showMenu && onAdd && (
        <div className="absolute inset-0 z-10 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center gap-2 p-4 animate-fade-in" onClick={(e) => e.preventDefault()}>
          <p className="text-xs text-muted-foreground mb-1">Adaugă în:</p>
          {(Object.entries(STATUS_LABELS) as [WatchStatus, string][]).map(([status, label]) => (
            <button
              key={status}
              onClick={() => { onAdd(anime, status); setShowMenu(false); }}
              className="w-full py-2 px-3 rounded-lg text-sm font-medium bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => setShowMenu(false)}
            className="mt-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Anulează
          </button>
        </div>
      )}
    </Link>
  );
}
