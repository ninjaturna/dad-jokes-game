import { Link } from 'react-router-dom'
import Wordmark from '../components/brand/Wordmark'
import ThemeToggle from '../components/ThemeToggle'
import { GAME_BASE } from '../lib/gameRoutes'

const groups = [
  {
    label: 'Guest',
    links: [
      { to: '/', label: 'Landing', note: '/' },
      { to: '/e/supper-on-the-patio', label: 'Event page', note: '/e/:slug — needs a real slug' },
      { to: '/e/supper-on-the-patio/rsvp', label: 'RSVP flow', note: '/e/:slug/rsvp' },
    ],
  },
  {
    label: 'Host',
    links: [
      { to: '/host', label: 'Dashboard', note: '/host — sign-in gate' },
      { to: '/host/create', label: 'Create event', note: '/host/create' },
      { to: '/host/event/REPLACE_WITH_ID', label: 'Manage event', note: '/host/event/:id — replace ID' },
    ],
  },
  {
    label: 'Games',
    links: [
      { to: '/games', label: 'Games hub', note: '/games' },
      { to: GAME_BASE, label: 'Can You Keep a Straight Face', note: GAME_BASE },
    ],
  },
]

export default function Index() {
  return (
    <div className="min-h-screen bg-bg-page text-text-primary">
      <div className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border px-8 py-4"
        style={{ background: 'color-mix(in srgb, var(--bg-page) 84%, transparent)', backdropFilter: 'blur(14px)' }}>
        <Wordmark variant="stacked" />
        <ThemeToggle />
      </div>
      <div className="mx-auto max-w-[780px] px-8 py-12">
        <div className="mb-2 text-xs font-bold tracking-[0.24em] text-text-muted">DEV INDEX</div>
        <h1 className="m-0 mb-10 font-display text-3xl font-extrabold tracking-[-0.02em]">All routes</h1>
        <div className="flex flex-col gap-8">
          {groups.map((g) => (
            <div key={g.label}>
              <div className="mb-3 text-[11px] font-bold tracking-[0.22em]" style={{ color: 'var(--candle)' }}>
                {g.label.toUpperCase()}
              </div>
              <div className="flex flex-col gap-2">
                {g.links.map((l) => (
                  <Link key={l.to} to={l.to}
                    className="flex items-center justify-between gap-4 rounded-[10px] border border-border px-5 py-4 no-underline text-inherit"
                    style={{ background: 'var(--bg-surface)' }}>
                    <span className="font-semibold">{l.label}</span>
                    <span className="font-mono text-[12px]" style={{ color: 'var(--text-muted)' }}>{l.note}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
