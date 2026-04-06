import { useState, useRef } from 'react';
import { parseMALExport } from '@/lib/mal-import';
import { addAnimeToList } from '@/lib/anime-storage';
import { AnimeListEntry, WatchStatus, Anime } from '@/types/anime';
import { Upload, FileUp, CheckCircle, User } from 'lucide-react';
import { toast } from 'sonner';

const MAL_STATUS_MAP: Record<number, WatchStatus> = {
  1: 'watching',
  2: 'completed',
  3: 'on_hold',
  4: 'dropped',
  6: 'plan_to_watch',
};

async function fetchMALUserList(username: string): Promise<AnimeListEntry[]> {
  const allEntries: AnimeListEntry[] = [];
  let offset = 0;
  const limit = 300;

  while (true) {
    const malUrl = `https://myanimelist.net/animelist/${encodeURIComponent(username)}/load.json%3Foffset%3D${offset}%26status%3D7`;
    const proxyUrl = `https://api.codetabs.com/v1/proxy/?quest=${malUrl}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) {
      if (res.status === 404 || res.status === 400) throw new Error('Utilizatorul nu a fost găsit sau lista nu e publică');
      throw new Error(`Eroare: ${res.status}`);
    }
    const items = await res.json();
    if (!Array.isArray(items) || items.length === 0) break;

    for (const item of items) {
      const anime: Anime = {
        mal_id: item.anime_id,
        title: item.anime_title,
        title_english: item.anime_title_eng || undefined,
        images: {
          jpg: {
            image_url: item.anime_image_path || `https://cdn.myanimelist.net/images/anime/${item.anime_id}.jpg`,
            large_image_url: item.anime_image_path || undefined,
          },
        },
        episodes: item.anime_num_episodes || undefined,
        score: item.anime_score_val || undefined,
        genres: item.genres || [],
      };
      allEntries.push({
        anime,
        status: MAL_STATUS_MAP[item.status] || 'plan_to_watch',
        score: item.score || 0,
        episodesWatched: item.num_watched_episodes || 0,
        addedAt: new Date().toISOString(),
      });
    }

    if (items.length < limit) break;
    offset += items.length;
  }

  return allEntries;
}

async function importEntries(entries: AnimeListEntry[]): Promise<number> {
  let count = 0;
  for (const entry of entries) {
    await addAnimeToList(entry.anime, entry.status);
    count++;
  }
  return count;
}

export default function ImportPage() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ count: number } | null>(null);
  const [username, setUsername] = useState('');
  const [tab, setTab] = useState<'username' | 'file'>('username');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setImporting(true);
    setResult(null);
    try {
      const text = await file.text();
      const entries = await parseMALExport(text);
      if (entries.length === 0) {
        toast.error('Nu am găsit anime-uri în fișier');
        setImporting(false);
        return;
      }
      const count = await importEntries(entries);
      setResult({ count });
      toast.success(`${count} anime importate cu succes!`);
    } catch {
      toast.error('Eroare la importul fișierului. Asigură-te că e un XML valid.');
    }
    setImporting(false);
  };

  const handleUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setImporting(true);
    setResult(null);
    try {
      const entries = await fetchMALUserList(username.trim());
      if (entries.length === 0) {
        toast.error('Lista utilizatorului este goală');
        setImporting(false);
        return;
      }
      const count = await importEntries(entries);
      setResult({ count });
      toast.success(`${count} anime importate de la ${username}!`);
    } catch (err: any) {
      toast.error(err.message || 'Eroare la import');
    }
    setImporting(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20">
      <div className="container px-4 pt-8 max-w-xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Upload className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-bold">Import din MAL</h1>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => { setTab('username'); setResult(null); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'username' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
            <User className="h-4 w-4 inline mr-1.5" />Cu numele
          </button>
          <button onClick={() => { setTab('file'); setResult(null); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'file' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
            <FileUp className="h-4 w-4 inline mr-1.5" />Fișier XML
          </button>
        </div>

        {tab === 'username' ? (
          <div className="animate-fade-in">
            <div className="glass-card p-6 mb-6">
              <h2 className="font-semibold mb-2">Import rapid cu numele de utilizator</h2>
              <p className="text-sm text-muted-foreground">
                Introdu numele tău de utilizator de pe MyAnimeList și lista ta va fi importată automat. Lista trebuie să fie publică.
              </p>
            </div>
            <form onSubmit={handleUsername} className="space-y-4">
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Numele tău MAL (ex: Xinil)" disabled={importing}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              <button type="submit" disabled={importing || !username.trim()}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all">
                {importing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Se importă...
                  </span>
                ) : 'Importă lista'}
              </button>
            </form>
            {result && !importing && (
              <div className="mt-6 glass-card p-6 text-center animate-fade-in">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold">{result.count} anime importate!</p>
                <p className="text-sm text-muted-foreground mt-1">Verifică-ți lista</p>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="glass-card p-6 mb-6">
              <h2 className="font-semibold mb-3">Cum să exporti din MyAnimeList</h2>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">1</span>
                  <span>Intră pe <strong className="text-foreground">myanimelist.net</strong> și loghează-te</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">2</span>
                  <span>Accesează <strong className="text-foreground">Profile → Export</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">3</span>
                  <span>Click pe <strong className="text-foreground">Export My List</strong> și descarcă XML-ul</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">4</span>
                  <span>Încarcă fișierul mai jos</span>
                </li>
              </ol>
            </div>
            <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => fileRef.current?.click()}
              className="glass-card p-12 border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-all text-center group">
              <input ref={fileRef} type="file" accept=".xml,.gz" onChange={handleChange} className="hidden" />
              {importing ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Se importă...</p>
                </div>
              ) : result ? (
                <div className="flex flex-col items-center gap-3 animate-fade-in">
                  <CheckCircle className="h-12 w-12 text-emerald-500" />
                  <p className="font-semibold">{result.count} anime importate!</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <FileUp className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
                  <p className="font-semibold">Trage fișierul XML aici</p>
                  <p className="text-sm text-muted-foreground">sau click pentru a selecta</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
