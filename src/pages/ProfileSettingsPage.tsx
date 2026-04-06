import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentProfile, uploadAvatar, uploadBanner, updateProfile } from '@/lib/auth';
import { Camera, User, Image, Save, ArrowLeft, Info, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const AVATAR_MAX_MB = 2;
const BANNER_MAX_MB = 5;
const AVATAR_MAX_BYTES = AVATAR_MAX_MB * 1024 * 1024;
const BANNER_MAX_BYTES = BANNER_MAX_MB * 1024 * 1024;
const AVATAR_RECOMMENDED = '400×400 px';
const BANNER_RECOMMENDED = '1200×300 px';

const HAT_TESTERS = ['highedits', 'ovi'];

const HATS = [
  { id: 'none', label: 'Niciunul', preview: null },
  {
    id: 'luffy',
    label: 'Pălărie de paie',
    preview: (
      <svg viewBox="0 0 280 130" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <ellipse cx="148" cy="114" rx="126" ry="26" fill="#b8924a" opacity="0.4"/>
        <ellipse cx="140" cy="112" rx="128" ry="26" fill="#e8b84b" stroke="#c08830" strokeWidth="2"/>
        <line x1="30" y1="110" x2="50" y2="105" stroke="#c08830" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
        <line x1="55" y1="106" x2="72" y2="102" stroke="#c08830" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
        <line x1="200" y1="106" x2="218" y2="102" stroke="#c08830" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
        <line x1="228" y1="108" x2="248" y2="106" stroke="#c08830" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
        <ellipse cx="140" cy="75" rx="68" ry="10" fill="#e8b84b"/>
        <path d="M72,75 C72,38 208,38 208,75" fill="#e8b84b" stroke="#c08830" strokeWidth="2"/>
        <ellipse cx="140" cy="75" rx="68" ry="10" fill="#e8b84b" stroke="#c08830" strokeWidth="1.5"/>
        <path d="M175,42 C195,50 208,62 208,75 L190,75 C190,62 180,50 165,44Z" fill="#c08830" opacity="0.3"/>
        <line x1="118" y1="42" x2="122" y2="65" stroke="#c08830" strokeWidth="0.9" strokeLinecap="round" opacity="0.5"/>
        <line x1="133" y1="38" x2="135" y2="63" stroke="#c08830" strokeWidth="0.9" strokeLinecap="round" opacity="0.5"/>
        <line x1="148" y1="38" x2="146" y2="63" stroke="#c08830" strokeWidth="0.9" strokeLinecap="round" opacity="0.5"/>
        <line x1="162" y1="41" x2="158" y2="64" stroke="#c08830" strokeWidth="0.9" strokeLinecap="round" opacity="0.5"/>
        <line x1="175" y1="47" x2="169" y2="67" stroke="#c08830" strokeWidth="0.9" strokeLinecap="round" opacity="0.4"/>
        <line x1="105" y1="48" x2="111" y2="67" stroke="#c08830" strokeWidth="0.9" strokeLinecap="round" opacity="0.4"/>
        <path d="M72,80 Q140,70 208,80 Q208,98 140,100 Q72,98 72,80Z" fill="#cc1111" stroke="#880000" strokeWidth="1.5"/>
        <path d="M72,80 Q140,72 208,80 Q140,76 72,80Z" fill="#ee2222" opacity="0.5"/>
        <path d="M72,80 L58,74 L62,84 L72,88Z" fill="#bb0000" stroke="#880000" strokeWidth="1"/>
        <path d="M72,80 L56,90 L62,96 L72,90Z" fill="#aa0000" stroke="#880000" strokeWidth="1"/>
        <path d="M72,88 Q140,100 208,88" fill="none" stroke="#c08830" strokeWidth="1.5"/>
      </svg>
    ),
  },
];

export default function ProfileSettingsPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [selectedHat, setSelectedHat] = useState<string>('none');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const isHatTester = HAT_TESTERS.includes(username);

  useEffect(() => {
    async function loadProfile() {
      const profile = await getCurrentProfile();
      if (!profile) { navigate('/login'); return; }
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || null);
      setBannerUrl(profile.banner_url || null);
      setSelectedHat(profile.hat || 'none');
      setLoading(false);
    }
    loadProfile();
  }, [navigate]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > AVATAR_MAX_BYTES) { toast.error(`Poza de profil trebuie să fie sub ${AVATAR_MAX_MB} MB`); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > BANNER_MAX_BYTES) { toast.error(`Bannerul trebuie să fie sub ${BANNER_MAX_MB} MB`); return; }
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);

    if (avatarFile) {
      setUploadingAvatar(true);
      const url = await uploadAvatar(avatarFile);
      setUploadingAvatar(false);
      if (url) { setAvatarUrl(url + '?t=' + Date.now()); setAvatarFile(null); toast.success('Poza de profil actualizată!'); }
      else toast.error('Eroare la upload avatar');
    }

    if (bannerFile) {
      setUploadingBanner(true);
      const url = await uploadBanner(bannerFile);
      setUploadingBanner(false);
      if (url) { setBannerUrl(url + '?t=' + Date.now()); setBannerFile(null); toast.success('Banner actualizat!'); }
      else toast.error('Eroare la upload banner');
    }

    const result = await updateProfile({ bio, hat: selectedHat } as any);
    if (result.success) toast.success('Profilul a fost salvat!');
    else toast.error(result.error || 'Eroare la salvare');

    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const avatarSrc = avatarPreview || avatarUrl;
  const bannerSrc = bannerPreview || bannerUrl;
  const activeHat = HATS.find(h => h.id === selectedHat);

  return (
    <div className="min-h-screen pb-24 md:pb-12 md:pt-20 bg-background">
      <div className="container max-w-2xl px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(`/user/${username}`)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Setări profil</h1>
            <p className="text-sm text-muted-foreground">Personalizează cum arată profilul tău</p>
          </div>
        </div>

        {/* Previzualizare */}
        <div className="glass-card rounded-2xl overflow-hidden mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 pt-4 pb-2">
            Previzualizare profil
          </p>
          <div className="relative h-28 bg-secondary group cursor-pointer" onClick={() => bannerInputRef.current?.click()}>
            {bannerSrc
              ? <img src={bannerSrc} alt="banner" className="w-full h-full object-cover" />
              : <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(ellipse at 60% 50%, hsl(var(--primary)) 0%, transparent 70%)' }} />
            }
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg">
                <Camera className="h-3.5 w-3.5" /> Schimbă bannerul
              </div>
            </div>
          </div>
          <div className="px-5 pb-4">
            <div className="relative -mt-8 mb-3 w-16 h-16">
              {/* Hat preview on avatar */}
              {activeHat && activeHat.id !== 'none' && (
                <div className="absolute pointer-events-none z-20" style={{ top: '-28px', left: '-14px', width: '88px', height: '50px' }}>
                  {activeHat.preview}
                </div>
              )}
              <div className="w-16 h-16 rounded-xl bg-card overflow-hidden ring-4 ring-background shadow-lg cursor-pointer group relative z-10"
                onClick={() => avatarInputRef.current?.click()}>
                {avatarSrc
                  ? <img src={avatarSrc} alt={username} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center bg-secondary">
                      <span className="text-2xl font-bold text-muted-foreground select-none">{username?.charAt(0).toUpperCase() || '?'}</span>
                    </div>
                }
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-xl flex items-center justify-center">
                  <Camera className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
            <p className="font-bold text-base">{username}</p>
            <p className="text-sm text-muted-foreground">{bio || <span className="italic opacity-50">Fără bio</span>}</p>
          </div>
        </div>

        {/* Accesorii avatar — doar pentru hat testers */}
        {isHatTester && (
          <div className="glass-card rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-primary"><Sparkles className="h-4 w-4" /></span>
              <h2 className="text-sm font-semibold">Accesorii avatar</h2>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'linear-gradient(135deg,#ffd700,#ff8c00)', color: '#1a0a00' }}>
                👑 Exclusiv
              </span>
            </div>

            {/* Tabel orizontal pălării */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {HATS.map(hat => (
                <button
                  key={hat.id}
                  onClick={() => setSelectedHat(hat.id)}
                  className={cn(
                    'flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                    selectedHat === hat.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-secondary/50 hover:border-primary/50'
                  )}
                  style={{ minWidth: '90px' }}
                >
                  {/* Avatar preview cu pălăria */}
                  <div className="relative w-14 h-14">
                    {hat.id !== 'none' && (
                      <div className="absolute pointer-events-none z-10" style={{ top: '-22px', left: '-12px', width: '76px', height: '44px' }}>
                        {hat.preview}
                      </div>
                    )}
                    <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center overflow-hidden ring-2 ring-background relative z-0">
                      {avatarSrc
                        ? <img src={avatarSrc} alt={username} className="w-full h-full object-cover" />
                        : <span className="text-xl font-bold text-muted-foreground">{username?.charAt(0).toUpperCase() || '?'}</span>
                      }
                    </div>
                  </div>

                  <span className="text-xs font-medium text-center leading-tight">{hat.label}</span>

                  {selectedHat === hat.id && (
                    <span className="w-2 h-2 rounded-full bg-primary block" />
                  )}
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              Pălăria apare deasupra avatarului tău pe profil și în lista de prieteni.
            </p>
          </div>
        )}

        {/* Poză de profil */}
        <Section icon={<User className="h-4 w-4" />} title="Poză de profil">
          <div className="flex flex-col gap-3">
            <div className="relative w-24 h-24 rounded-xl bg-secondary overflow-hidden cursor-pointer group ring-2 ring-border hover:ring-primary transition-all"
              onClick={() => avatarInputRef.current?.click()}>
              {avatarSrc
                ? <img src={avatarSrc} alt={username} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-muted-foreground">{username?.charAt(0).toUpperCase() || '?'}</span>
                  </div>
              }
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center rounded-xl">
                <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <button onClick={() => avatarInputRef.current?.click()}
              className="w-fit px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors flex items-center gap-2">
              <Camera className="h-4 w-4" />
              {avatarFile ? 'Schimbă selecția' : 'Alege poză'}
            </button>
            {avatarFile && <p className="text-xs text-primary font-medium">✓ {avatarFile.name} ({(avatarFile.size / 1024 / 1024).toFixed(2)} MB)</p>}
            <div className="flex flex-col gap-0.5">
              <InfoRow label="Dimensiune recomandată" value={AVATAR_RECOMMENDED} />
              <InfoRow label="Maxim" value={`${AVATAR_MAX_MB} MB`} />
              <InfoRow label="Formate acceptate" value="JPG, PNG, WebP, GIF" />
            </div>
          </div>
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
        </Section>

        {/* Banner */}
        <Section icon={<Image className="h-4 w-4" />} title="Banner profil">
          <div className="relative h-24 rounded-xl bg-secondary overflow-hidden cursor-pointer group ring-2 ring-border hover:ring-primary transition-all mb-3"
            onClick={() => bannerInputRef.current?.click()}>
            {bannerSrc
              ? <img src={bannerSrc} alt="banner" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><span className="text-sm text-muted-foreground">Niciun banner</span></div>
            }
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg">
                <Camera className="h-3.5 w-3.5" /> Schimbă bannerul
              </div>
            </div>
          </div>
          <button onClick={() => bannerInputRef.current?.click()}
            className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors mb-2 flex items-center gap-2">
            <Camera className="h-4 w-4" />
            {bannerFile ? 'Schimbă selecția' : 'Alege banner'}
          </button>
          {bannerFile && <p className="text-xs text-primary font-medium mb-2">✓ {bannerFile.name} ({(bannerFile.size / 1024 / 1024).toFixed(2)} MB)</p>}
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            <InfoRow label="Dimensiune recomandată" value={BANNER_RECOMMENDED} />
            <InfoRow label="Maxim" value={`${BANNER_MAX_MB} MB`} />
            <InfoRow label="Raport de aspect" value="4:1" />
            <InfoRow label="Formate acceptate" value="JPG, PNG, WebP" />
          </div>
          <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerSelect} />
        </Section>

        {/* Bio */}
        <Section icon={<User className="h-4 w-4" />} title="Despre tine (bio)">
          <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={200} rows={3}
            placeholder="Scrie ceva despre tine..."
            className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50 transition-all" />
          <p className="text-xs text-muted-foreground text-right mt-1">{bio.length}/200 caractere</p>
        </Section>

        {/* Butoane */}
        <div className="flex gap-3 mt-2">
          <button onClick={() => navigate(`/user/${username}`)}
            className="flex-1 px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors">
            Anulează
          </button>
          <button onClick={handleSave} disabled={saving}
            className={cn('flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2',
              saving ? 'bg-primary/50 text-primary-foreground/50 cursor-not-allowed' : 'bg-primary text-primary-foreground hover:opacity-90')}>
            {saving
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Se salvează...</>
              : <><Save className="h-4 w-4" />Salvează modificările</>
            }
          </button>
        </div>

      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-5 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-primary">{icon}</span>
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-0.5">
      <Info className="h-3 w-3 flex-shrink-0 opacity-60" />
      <span className="opacity-70">{label}:</span>
      <span className="font-medium text-foreground/70">{value}</span>
    </div>
  );
}
