import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function EmailConfirmedPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase handles the token from URL hash automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setStatus('success');
        setTimeout(() => navigate('/list'), 3000);
      }
    });

    // Also check if already signed in
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setStatus('success');
        setTimeout(() => navigate('/list'), 3000);
      } else {
        // Give it a moment for the token to process
        setTimeout(() => {
          supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
              setStatus('success');
              setTimeout(() => navigate('/list'), 3000);
            } else {
              setStatus('error');
            }
          });
        }, 1500);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="glass-card p-8">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
              <h1 className="text-xl font-bold mb-2">Se verifică emailul...</h1>
              <p className="text-muted-foreground text-sm">Așteaptă un moment</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-emerald-400" />
              <h1 className="text-xl font-bold mb-2">Email confirmat!</h1>
              <p className="text-muted-foreground text-sm mb-4">
                Contul tău a fost activat. Ești redirecționat automat...
              </p>
              <Link to="/list"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                Mergi la lista mea
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
                <span className="text-destructive text-2xl">!</span>
              </div>
              <h1 className="text-xl font-bold mb-2">Link invalid</h1>
              <p className="text-muted-foreground text-sm mb-4">
                Linkul a expirat sau e invalid. Încearcă să te loghezi direct.
              </p>
              <Link to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                Intră în cont
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
