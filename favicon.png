import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentProfile, uploadAvatar, uploadBanner, updateProfile } from '@/lib/auth';
import { Camera, User, Image, Save, ArrowLeft, Info, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import palariePaie from '@/assets/palariepaie.png';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { FRAMES, type AvatarFrame } from '@/components/PremiumAvatar';
import { BADGES, USERNAME_COLORS, PROFILE_BACKGROUNDS, getUsernameStyle, type PremiumBadge, type UsernameColor, type ProfileBg } from '@/components/PremiumEffects';

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
      <img src={palariePaie} alt="Pălărie de paie" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
  const [selectedFrame, setSelectedFrame] = useState<AvatarFrame>('none');
  const [selectedBadge, setSelectedBadge] = useState<PremiumBadge>('none');
  const [selectedUsernameColor, setSelectedUsernameColor] = useState<UsernameColor>('none');
  const [selectedProfileBg, setSelectedProfileBg] = useState<ProfileBg>('none');
  const [isPremium, setIsPremium] = useState(false);
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
      setSelectedFrame((profile.avatar_frame as AvatarFrame) || 'none');
      const p = profile as any;
      setSelectedBadge((p.badge as PremiumBadge) || 'none');
      setSelectedUsernameColor((p.username_color as UsernameColor) || 'none');
      setSelectedProfileBg((p.profile_bg as ProfileBg) || 'none');
      setIsPremium(profile.is_premium === true);
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

    const result = await updateProfile({ bio, hat: selectedHat, avatar_frame: selectedFrame, badge: selectedBadge, username_color: selectedUsernameColor, profile_bg: selectedProfileBg } as any);
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
              {(() => {
                const activeF = isPremium && selectedFrame !== 'none' ? FRAMES.find(f => f.id === selectedFrame) : null;
                const avatarInner = avatarSrc
                  ? <img src={avatarSrc} alt={username} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center bg-secondary">
                      <span className="text-2xl font-bold text-muted-foreground select-none">{username?.charAt(0).toUpperCase() || '?'}</span>
                    </div>;
                if (activeF) {
                  return (
                    <div className="w-16 h-16 relative cursor-pointer group z-10" onClick={() => avatarInputRef.current?.click()}>
                      <style>{`@keyframes prof-spin-${activeF.id}{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                      <div style={{ width:'64px', height:'64px', borderRadius:'12px', padding:'3px', background:`conic-gradient(${activeF.colors})`, animation:`prof-spin-${activeF.id} ${activeF.speed} linear infinite` }}>
                        <div style={{ width:'100%', height:'100%', borderRadius:'9px', overflow:'hidden' }}>
                          {avatarInner}
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center" style={{borderRadius:'12px',zIndex:2}}>
                        <Camera className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="w-16 h-16 rounded-xl bg-card overflow-hidden ring-4 ring-background shadow-lg cursor-pointer group relative z-10"
                    onClick={() => avatarInputRef.current?.click()}>
                    {avatarInner}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-xl flex items-center justify-center">
                      <Camera className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                );
              })()}
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

        {/* Frame-uri avatar — doar pentru Premium */}
        {(isPremium || isHatTester) && (
          <div className="glass-card rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-primary"><Sparkles className="h-4 w-4" /></span>
              <h2 className="text-sm font-semibold">Frame avatar</h2>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'linear-gradient(135deg,#ffd700,#ff8c00)', color: '#1a0a00' }}>
                👑 Premium
              </span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {FRAMES.map(frame => (
                <button
                  key={frame.id}
                  onClick={() => setSelectedFrame(frame.id)}
                  className={cn(
                    'flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                    selectedFrame === frame.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-secondary/50 hover:border-primary/50'
                  )}
                  style={{ minWidth: '80px' }}
                >
                  {/* Preview frame */}
                  <div style={{ width:'48px', height:'48px', borderRadius:'12px', overflow:'hidden', flexShrink:0 }}>
                    {frame.id !== 'none' ? (
                      <>
                        <style>{`@keyframes pf-spin-${frame.id}{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                        <div style={{ width:'100%', height:'100%', padding:'3px', background:`conic-gradient(${frame.colors})`, animation:`pf-spin-${frame.id} ${frame.speed} linear infinite` }}>
                          <div style={{ width:'100%', height:'100%', borderRadius:'9px', overflow:'hidden', background:'var(--secondary)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <span className="text-lg font-bold text-muted-foreground">{username?.charAt(0).toUpperCase() || '?'}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div style={{ width:'100%', height:'100%', background:'var(--secondary)', border:'2px solid var(--border)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span className="text-lg font-bold text-muted-foreground">{username?.charAt(0).toUpperCase() || '?'}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">{frame.label}</span>
                  {selectedFrame === frame.id && (
                    <span className="w-2 h-2 rounded-full bg-primary block" />
                  )}
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              Frame-ul apare ca border animat în jurul avatarului tău pe profil.
            </p>
          </div>
        )}

        {/* Badge, Culoare Username, Background — doar Premium */}
        {isPremium && (
          <>
            {/* Badge */}
            <div className="glass-card rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-primary"><Sparkles className="h-4 w-4" /></span>
                <h2 className="text-sm font-semibold">Badge username</h2>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: 'linear-gradient(135deg,#ffd700,#ff8c00)', color: '#1a0a00' }}>👑 Premium</span>
              </div>
              <div className="flex gap-3 flex-wrap">
                {BADGES.map(badge => (
                  <button key={badge.id} onClick={() => setSelectedBadge(badge.id)}
                    className={cn('flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all', selectedBadge === badge.id ? 'border-primary bg-primary/10' : 'border-border bg-secondary/50 hover:border-primary/50')}
                    style={{ minWidth: '64px' }}>
                    <span className="text-2xl">{badge.render || '∅'}</span>
                    <span className="text-xs font-medium">{badge.label}</span>
                    {selectedBadge === badge.id && <span className="w-2 h-2 rounded-full bg-primary block" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Culoare username */}
            <div className="glass-card rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-primary"><Sparkles className="h-4 w-4" /></span>
                <h2 className="text-sm font-semibold">Culoare username</h2>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: 'linear-gradient(135deg,#ffd700,#ff8c00)', color: '#1a0a00' }}>👑 Premium</span>
              </div>
              <div className="flex gap-3 flex-wrap">
                {USERNAME_COLORS.map(uc => (
                  <button key={uc.id} onClick={() => setSelectedUsernameColor(uc.id)}
                    className={cn('flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all', selectedUsernameColor === uc.id ? 'border-primary bg-primary/10' : 'border-border bg-secondary/50 hover:border-primary/50')}
                    style={{ minWidth: '72px' }}>
                    {uc.id === 'none'
                      ? <span className="text-sm font-bold text-muted-foreground">Aa</span>
                      : <span className="text-sm font-bold" style={getUsernameStyle(uc.id)}>{username || 'Aa'}</span>
                    }
                    <span className="text-xs font-medium">{uc.label}</span>
                    {selectedUsernameColor === uc.id && <span className="w-2 h-2 rounded-full bg-primary block" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Background profil animat */}
            <div className="glass-card rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-primary"><Sparkles className="h-4 w-4" /></span>
                <h2 className="text-sm font-semibold">Background profil</h2>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: 'linear-gradient(135deg,#ffd700,#ff8c00)', color: '#1a0a00' }}>👑 Premium</span>
              </div>
              <div className="flex gap-3 flex-wrap">
                {PROFILE_BACKGROUNDS.map(bg => (
                  <button key={bg.id} onClick={() => setSelectedProfileBg(bg.id)}
                    className={cn('flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all', selectedProfileBg === bg.id ? 'border-primary bg-primary/10' : 'border-border bg-secondary/50 hover:border-primary/50')}
                    style={{ minWidth: '72px' }}>
                    <span className="text-xl">{bg.id === 'none' ? '✕' : bg.id === 'stars' ? '✨' : bg.id === 'particles' ? '🔵' : bg.id === 'rain' ? '🌧️' : '🌌'}</span>
                    <span className="text-xs font-medium">{bg.label}</span>
                    {selectedProfileBg === bg.id && <span className="w-2 h-2 rounded-full bg-primary block" />}
                  </button>
                ))}
              </div>
            </div>
          </>
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