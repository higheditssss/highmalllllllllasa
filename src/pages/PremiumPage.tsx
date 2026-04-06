export default function PremiumPage() {
  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-16 bg-background flex items-center justify-center">
      <div className="container px-4 max-w-lg text-center">

        {/* Icon */}
        <div className="text-7xl mb-6">👑</div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-2"
          style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Highmal Premium
        </h1>
        <p className="text-muted-foreground mb-8">
          Susține site-ul și deblochează funcții exclusive.
        </p>

        {/* Benefits */}
        <div className="glass-card p-6 text-left mb-6 space-y-4">
          {[
            { icon: '✨', title: 'Border animat pe avatar', desc: 'Inel gradient rotativ vizibil pe profilul tău și în lista de prieteni.' },
            { icon: '👑', title: 'Badge Premium', desc: 'Insignă aurie lângă username-ul tău pe profil.' },
            { icon: '🎨', title: 'Mai multe funcții în curând', desc: 'Statistici avansate, culori personalizate și altele.' },
          ].map(b => (
            <div key={b.title} className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{b.icon}</span>
              <div>
                <p className="font-semibold text-sm">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="glass-card p-4 text-center text-sm text-muted-foreground">
          🚧 <span className="font-medium">În testare</span> — Plățile vor fi disponibile în curând.
        </div>

      </div>
    </div>
  );
}
