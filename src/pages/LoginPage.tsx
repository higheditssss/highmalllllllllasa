import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '@/lib/auth';
import { LogIn, UserPlus, Eye, EyeOff, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError('');
    setInfo('');
    if (!email.trim() || !password) { setError('Completează toate câmpurile'); return; }
    if (mode === 'register' && !username.trim()) { setError('Alege un username'); return; }

    setLoading(true);
    const result = mode === 'login'
      ? await login(email, password)
      : await register(email, password, username);

    setLoading(false);

    if (result.success) {
      if (mode === 'register') {
        setInfo('Cont creat! Verifică emailul pentru confirmare, apoi intră în cont.');
        setMode('login');
      } else {
        navigate('/list');
      }
    } else {
      setError(result.error || 'Eroare necunoscută');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 md:pt-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-display tracking-tight">HIGHMAL</h1>
          <p className="text-muted-foreground text-sm mt-2">Colecția ta de anime, în română</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex rounded-lg bg-secondary p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); setInfo(''); }}
              className={cn('flex-1 py-2 rounded-md text-sm font-medium transition-all',
                mode === 'login' ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground')}
            >
              <LogIn className="h-4 w-4 inline mr-1.5 -mt-0.5" />
              Intră în cont
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setInfo(''); }}
              className={cn('flex-1 py-2 rounded-md text-sm font-medium transition-all',
                mode === 'register' ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground')}
            >
              <UserPlus className="h-4 w-4 inline mr-1.5 -mt-0.5" />
              Cont nou
            </button>
          </div>

          <div className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Username</label>
                <input
                  type="text"
                  placeholder="ex: higheditsss"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-ring transition-colors"
                />
                <p className="text-xs text-muted-foreground mt-1">Va fi URL-ul profilului tău public</p>
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  autoFocus
                  placeholder="email@exemplu.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="w-full bg-secondary border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-ring transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Parolă</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:border-ring transition-colors"
                />
                <button onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {error && <p className="text-destructive text-xs mt-3">{error}</p>}
          {info && <p className="text-emerald-400 text-xs mt-3">{info}</p>}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full mt-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'Se procesează...' : mode === 'login' ? 'Intră în cont' : 'Creează cont'}
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Date stocate securizat prin Supabase
        </p>
      </div>
    </div>
  );
}