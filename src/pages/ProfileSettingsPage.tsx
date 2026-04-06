import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentProfile, uploadAvatar, uploadBanner, updateProfile } from '@/lib/auth';
import { Camera, User, Image, Save, ArrowLeft, Info } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Constante dimensiuni ───────────────────────────────────────────────────
const AVATAR_MAX_MB = 2;
const BANNER_MAX_MB = 5;
const AVATAR_MAX_BYTES = AVATAR_MAX_MB * 1024 * 1024;
const BANNER_MAX_BYTES = BANNER_MAX_MB * 1024 * 1024;
// Dimensiuni recomandate (informative, nu restricție hard)
const AVATAR_RECOMMENDED = '400×400 px';
const BANNER_RECOMMENDED = '1200×300 px';

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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      const profile = await getCurrentProfile();
      if (!profile) {
        navigate('/login');
        return;
      }
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || null);
      setBannerUrl(profile.banner_url || null);
      setLoading(false);
    }
    loadProfile();
  }, [navigate]);

  // ─── Avatar ────────────────────────────────────────────────────────────────
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > AVATAR_MAX_BYTES) {
      toast.error(`Poza de profil trebuie să fie sub ${AVATAR_MAX_MB} MB`);
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ─── Banner ────────────────────────────────────────────────────────────────
  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > BANNER_MAX_BYTES) {
      toast.error(`Bannerul trebuie să fie sub ${BANNER_MAX_MB} MB`);
      return;
    }
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  // ─── Salvare ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    let newAvatarUrl = avatarUrl;
    let newBannerUrl = bannerUrl;

    // Upload avatar dacă s-a selectat
    if (avatarFile) {
      setUploadingAvatar(true);
      const url = await uploadAvatar(avatarFile);
      setUploadingAvatar(false);
      if (url) {
        newAvatarUrl = url + '?t=' + Date.now();
        setAvatarUrl(newAvatarUrl);
        setAvatarFile(null);
        toast.success('Poza de profil actualizată!');
      } else {
        toast.error('Eroare la upload avatar');
      }
    }

    // Upload banner dacă s-a selectat
    if (bannerFile) {
      setUploadingBanner(true);
      const url = await uploadBanner(bannerFile);
      setUploadingBanner(false);
      if (url) {
        newBannerUrl = url + '?t=' + Date.now();
        setBannerUrl(newBannerUrl);
        setBannerFile(null);
        toast.success('Banner actualizat!');
      } else {
        toast.error('Eroare la upload banner');
      }
    }

    // Salvează bio
    const result = await updateProfile({ bio });
    if (result.success) {
      toast.success('Profilul a fost salvat!');
    } else {
      toast.error(result.error || 'Eroare la salvare');
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const avatarSrc = avatarPreview || avatarUrl;
  const bannerSrc = bannerPreview || bannerUrl;

  return (
    <div className="min-h-screen pb-24 md:pb-12 md:pt-20 bg-background">
      <div className="container max-w-2xl px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(`/user/${username}`)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Setări profil</h1>
            <p className="text-sm text-muted-foreground">Personalizează cum arată profilul tău</p>
          </div>
        </div>

        {/* ── PREVIZUALIZARE BANNER + AVATAR ─────────────────────────────── */}
        <div className="glass-card rounded-2xl overflow-hidden mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 pt-4 pb-2">
            Previzualizare profil
          </p>

          {/* Banner preview */}
          <div className="relative h-28 bg-secondary">
            {bannerSrc
              ? <img src={bannerSrc} alt="banner" className="w-full h-full object-cover" />
              : <div className="absolute inset-0 opacity-30"
                  style={{ backgroundImage: 'radial-gradient(ellipse at 60% 50%, hsl(var(--primary)) 0%, transparent 70%)' }} />
            }
          </div>

          {/* Avatar preview (overlapping banner) */}
          <div className="px-5 pb-4">
            <div className="relative -mt-8 mb-3 w-16 h-16">
              <div className="w-16 h-16 rounded-xl bg-card overflow-hidden ring-4 ring-background shadow-lg">
                {avatarSrc
                  ? <img src={avatarSrc} alt={username} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center bg-secondary">
                      <span className="text-2xl font-bold text-muted-foreground select-none">
                        {username?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                }
              </div>
            </div>
            <p className="font-bold text-base">{username}</p>
            <p className="text-sm text-muted-foreground">{bio || <span className="italic opacity-50">Fără bio</span>}</p>
          </div>
        </div>

        {/* ── SECȚIUNEA: POZĂ DE PROFIL ──────────────────────────────────── */}
        <Section icon={<User className="h-4 w-4" />} title="Poză de profil">
          <div className="flex flex-col gap-3">
            <div
              className="relative w-24 h-24 rounded-xl bg-secondary overflow-hidden cursor-pointer group ring-2 ring-border hover:ring-primary transition-all"
              onClick={() => avatarInputRef.current?.click()}
            >
              {avatarSrc
                ? <img src={avatarSrc} alt={username} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-muted-foreground">
                      {username?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
              }
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center rounded-xl">
                <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="w-fit px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              {avatarFile ? 'Schimbă selecția' : 'Alege poză'}
            </button>
            {avatarFile && (
              <p className="text-xs text-primary font-medium">
                ✓ {avatarFile.name} ({(avatarFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              <InfoRow label="Dimensiune recomandată" value={AVATAR_RECOMMENDED} />
              <InfoRow label="Maxim" value={`${AVATAR_MAX_MB} MB`} />
              <InfoRow label="Formate acceptate" value="JPG, PNG, WebP, GIF" />
            </div>
          </div>
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
        </Section>

        {/* ── SECȚIUNEA: BANNER ─────────────────────────────────────────── */}
        <Section icon={<Image className="h-4 w-4" />} title="Banner profil">
          <div
            className="relative h-24 rounded-xl bg-secondary overflow-hidden cursor-pointer group ring-2 ring-border hover:ring-primary transition-all mb-3"
            onClick={() => bannerInputRef.current?.click()}
          >
            {bannerSrc
              ? <img src={bannerSrc} alt="banner" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">Niciun banner</span>
                </div>
            }
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg">
                <Camera className="h-3.5 w-3.5" />
                Schimbă bannerul
              </div>
            </div>
          </div>

          <button
            onClick={() => bannerInputRef.current?.click()}
            className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors mb-2 flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            {bannerFile ? 'Schimbă selecția' : 'Alege banner'}
          </button>
          {bannerFile && (
            <p className="text-xs text-primary font-medium mb-2">
              ✓ {bannerFile.name} ({(bannerFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}

          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            <InfoRow label="Dimensiune recomandată" value={BANNER_RECOMMENDED} />
            <InfoRow label="Maxim" value={`${BANNER_MAX_MB} MB`} />
            <InfoRow label="Raport de aspect recomandat" value="4:1" />
            <InfoRow label="Formate acceptate" value="JPG, PNG, WebP" />
          </div>
          <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerSelect} />
        </Section>

        {/* ── SECȚIUNEA: BIO ────────────────────────────────────────────── */}
        <Section icon={<User className="h-4 w-4" />} title="Despre tine (bio)">
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="Scrie ceva despre tine..."
            className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50 transition-all"
          />
          <p className="text-xs text-muted-foreground text-right mt-1">{bio.length}/200 caractere</p>
        </Section>

        {/* ── BUTOANE ACȚIUNI ────────────────────────────────────────────── */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => navigate(`/user/${username}`)}
            className="flex-1 px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors"
          >
            Anulează
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              'flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2',
              saving
                ? 'bg-primary/50 text-primary-foreground/50 cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:opacity-90'
            )}
          >
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

// ─── Sub-componente ajutătoare ──────────────────────────────────────────────

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
}s
