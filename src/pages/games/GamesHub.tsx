import { Link } from 'react-router-dom'
import { GAME_BASE } from '../../lib/gameRoutes'

export default function GamesHub() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="font-display text-xs uppercase tracking-[0.28em] text-text-muted">Event assets</p>
      <h1 className="mt-2 font-display text-4xl font-light text-text-primary">Games</h1>
      <p className="mt-3 max-w-xl font-sans text-text-secondary">
        Pull these up at a gathering. More coming.
      </p>
      <div className="mt-10 grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(232px, 1fr))' }}>
        <Link
          to={GAME_BASE}
          className="block rounded-card border border-border bg-bg-surface p-6 shadow-card transition-colors hover:border-accent"
        >
          <span className="font-display text-xs uppercase tracking-[0.22em] text-accent">Party game</span>
          <h2 className="mt-2 font-display text-xl text-text-primary">Can You Keep a Straight Face</h2>
          <p className="mt-2 font-sans text-sm text-text-secondary">
            Dad jokes vs. your poker face. Phones-as-buzzers, QR to join.
          </p>
        </Link>
      </div>
    </main>
  )
}
