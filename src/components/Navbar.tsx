import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, List, Search, Upload, LogIn, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCurrentProfile, logout } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import highmalLogo from '@/assets/highmal-logo.png';

const navItems = [
  { to: '/', label: 'Acasă', icon: Home },
  { to: '/search', label: 'Caută', icon: Search },
  { to: '/list', label: 'Lista mea', icon: List },
  { to: '/import', label: 'Import', icon: Upload },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const profile = await getCurrentProfile();
      setUsername(profile?.username || null);
      setAvatarUrl(profile?.avatar_url || null);
    }
    loadProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logout();
    setUsername(null);
    setAvatarUrl(null);
    navigate('/login');
  };

  return (
    <>
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50 px-6 py-3">
        <div className="container flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={highmalLogo} alt="HIGHMAL" className="h-8" />
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map(item => (
              <Link key={item.to} to={item.to}
                className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  location.pathname === item.to ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary')}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {username ? (
              <>
                <Link to={`/user/${username}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                  {avatarUrl
                    ? <img src={avatarUrl} alt={username} className="w-6 h-6 rounded-full object-cover" />
                    : <User className="h-4 w-4" />}
                  {username}
                </Link>
                <button onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                  <LogOut className="h-4 w-4" />
                  Ieși
                </button>
              </>
            ) : (
              <Link to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                <LogIn className="h-4 w-4" />
                Intră în cont
              </Link>
            )}
          </div>
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50 px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map(item => (
            <Link key={item.to} to={item.to}
              className={cn('flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                location.pathname === item.to ? 'text-primary' : 'text-muted-foreground')}>
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
          {username ? (
            <Link to={`/user/${username}`}
              className={cn('flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                location.pathname.startsWith('/user') ? 'text-primary' : 'text-muted-foreground')}>
              {avatarUrl
                ? <img src={avatarUrl} alt={username} className="w-5 h-5 rounded-full object-cover" />
                : <User className="h-5 w-5" />}
              Profil
            </Link>
          ) : (
            <Link to="/login"
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground">
              <LogIn className="h-5 w-5" />
              Login
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}