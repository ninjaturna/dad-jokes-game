import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Crest from '../../components/brand/Crest'
import ThemeToggle from '../../components/ThemeToggle'
import { useAuth } from '../../hooks/useAuth'
import { ensureProfile, loadHostDashboard, signOut, type HostDashboardData, type EventWithCounts } from '../../lib/host'

const fmt = (iso: string | null, tz: string, opts: Intl.DateTimeFormatOptions) =>
  iso ? new Intl.DateTimeFormat('en-US', { timeZone: tz, ...opts }).format(new Date(iso)) : ''

function EventRow({ ev }: { ev: EventWithCounts }) {
  const tot = ev.going + ev.maybe + ev.declined || 1
  const pct = (n: number) => `${((n / tot) * 100).toFixed(1)}%`
  const seatsLeft = ev.capacity != null ? Math.max(0, ev.capacity - ev.going) : null
  const tag = seatsLeft != null ? `${seatsLeft} seats left` : 'Open'
  return (
    <div className="flex items-center gap-5 bg-bg-surface border border-border rounded-card px-5 py-4" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="flex-none w-[62px] text-center border-r border-border pr-4">
        <div className="text-[11px] tracking-widest text-accent font-bold uppercase">{fmt(ev.starts_at, ev.timezone, { month: 'short' })}</div>
        <div className="font-display font-extrabold text-2xl leading-none tabular">{fmt(ev.starts_at, ev.timezone, { day: 'numeric' })}</div>
        <div className="text-[11px] text-text-muted">{fmt(ev.starts_at, ev.timezone, { weekday: 'short' })}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-2 flex-wrap">
          <span className="font-display font-bold text-lg">{ev.title}</span>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-pill" style={{ background: 'var(--bg-surface-2)', color: 'var(--text-muted)' }}>{tag}</span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="flex-1 max-w-[280px] h-[7px] rounded-pill overflow-hidden flex" style={{ background: 'var(--field)' }}>
            <span style={{ width: pct(ev.going), background: 'var(--going)' }} />
            <span style={{ width: pct(ev.maybe), background: 'var(--maybe)' }} />
            <span style={{ width: pct(ev.declined), background: 'var(--no)' }} />
          </div>
          <span className="text-[12.5px] text-text-secondary tabular whitespace-nowrap">{ev.going} going · {ev.maybe} maybe · {ev.declined} declined</span>
        </div>
      </div>
      <div className="flex-none flex gap-2">
        <Link to={`/host/invites/${ev.id}`} className="border border-border text-text-primary text-sm font-semibold px-3.5 py-2 rounded-control whitespace-nowrap no-underline">Message</Link>
        <Link to={`/host/event/${ev.id}`} className="border border-border text-text-secondary text-sm font-semibold px-3.5 py-2 rounded-control whitespace-nowrap no-underline">Edit</Link>
      </div>
    </div>
  )
}

export default function HostDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<HostDashboardData | null>(null)
  useEffect(() => {
    if (!user) return
    ;(async () => { await ensureProfile(user); setData(await loadHostDashboard(user.id)) })()
  }, [user])

  const name = (user?.user_metadata?.name as string) ?? user?.email?.split('@')[0] ?? 'there'
  const s = data?.stats
  const stat = (label: string, value: string | number, color?: string) => (
    <div className="bg-bg-surface border border-border rounded-card px-5 py-4">
      <div className="text-xs text-text-muted mb-2.5">{label}</div>
      <div className="font-display font-extrabold text-3xl tabular" style={color ? { color } : undefined}>{value}</div>
    </div>
  )

  return (
    <div className="min-h-screen flex text-text-primary" style={{ background: 'var(--bg-page)' }}>
      <aside className="w-[248px] flex-none border-r border-border px-4 py-5 flex flex-col gap-2 sticky top-0 h-screen" style={{ background: 'var(--rail)' }}>
        <div className="flex items-center gap-3 px-2 pb-4">
          <Crest size={38} showWord={false} double={false} ringWidth={1.25} />
          <div className="leading-tight">
            <div className="font-display font-bold text-[13px] tracking-[0.14em] whitespace-nowrap">BLACK CAFE <span className="text-text-muted">@ MARLY'S YARD</span></div>
            <div className="text-[11px] text-text-muted mt-0.5">Host</div>
          </div>
        </div>
        <span className="flex items-center gap-3 px-3 py-2.5 rounded-control text-sm font-semibold" style={{ background: 'var(--bg-surface-2)' }}><span className="w-[7px] h-[7px] rounded-[2px] bg-accent" />Gatherings</span>
        <Link to="/host/guests" className="flex items-center gap-3 px-3 py-2.5 rounded-control text-sm text-text-secondary no-underline"><span className="w-[7px] h-[7px] rounded-[2px] border border-border" />Guests</Link>
        <span className="flex items-center gap-3 px-3 py-2.5 rounded-control text-sm text-text-secondary"><span className="w-[7px] h-[7px] rounded-[2px] border border-border" />Messages</span>
        <span className="flex items-center gap-3 px-3 py-2.5 rounded-control text-sm text-text-secondary"><span className="w-[7px] h-[7px] rounded-[2px] border border-border" />The list</span>
        <div className="mt-auto flex flex-col gap-2.5">
          <ThemeToggle />
          <button onClick={signOut} className="text-left text-[13px] text-text-muted px-2 py-1">Sign out</button>
          <div className="flex items-center gap-2.5 px-1.5 py-2">
            <span className="w-[30px] h-[30px] rounded-full flex items-center justify-center font-display font-bold text-white text-[13px]" style={{ background: 'linear-gradient(135deg,#D96B43,#A62F24)' }}>{name[0]?.toUpperCase()}</span>
            <div className="leading-tight"><div className="text-[13px] font-semibold">{name}</div><div className="text-[11px] text-text-muted">Black Cafe</div></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 px-10 py-8 pb-16">
        <div className="flex items-start justify-between gap-5 flex-wrap mb-7">
          <div>
            <div className="text-xs tracking-[0.2em] text-text-muted font-semibold mb-2 uppercase">Welcome back, {name}</div>
            <h1 className="font-display font-bold text-3xl">Your gatherings</h1>
          </div>
          <Link to="/host/create" className="bg-accent text-white font-bold text-sm px-5 py-3 rounded-control flex items-center gap-2 no-underline" style={{ boxShadow: 'var(--shadow-card)' }}><span className="text-lg leading-none">+</span>New gathering</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stat('Upcoming', s?.upcoming ?? 0)}
          {stat('Going this week', s?.goingThisWeek ?? 0, 'var(--going)')}
          {stat('Responses', s?.responses ?? 0)}
          {stat('On the list', s?.onTheList ?? 0)}
        </div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="font-display font-semibold text-[15px] tracking-wide uppercase text-text-secondary">Upcoming</h2>
          <div className="flex gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[2px]" style={{ background: 'var(--going)' }} />Going</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[2px]" style={{ background: 'var(--maybe)' }} />Maybe</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[2px]" style={{ background: 'var(--no)' }} />Declined</span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {data?.upcoming.length ? data.upcoming.map((ev) => <EventRow key={ev.id} ev={ev} />)
            : <p className="text-text-secondary font-sans py-6">No upcoming gatherings yet. <Link to="/host/create" className="text-accent-2">Create one</Link>.</p>}
        </div>
        {data?.passed.length ? (
          <>
            <h2 className="font-display font-semibold text-[15px] tracking-wide uppercase text-text-secondary mt-9 mb-3.5">Recently passed</h2>
            <div className="flex flex-col gap-2.5">
              {data.passed.slice(0, 5).map((ev) => (
                <div key={ev.id} className="flex items-center gap-4 px-5 py-3.5 border border-border rounded-card opacity-70">
                  <div className="flex-none w-[62px] text-center border-r border-border pr-4"><div className="text-[11px] text-text-muted font-bold uppercase">{fmt(ev.starts_at, ev.timezone, { month: 'short' })}</div><div className="font-display font-extrabold text-xl tabular">{fmt(ev.starts_at, ev.timezone, { day: 'numeric' })}</div></div>
                  <div className="flex-1"><div className="font-display font-bold text-base">{ev.title}</div><div className="text-[12.5px] text-text-muted tabular">{ev.going} came · {ev.going + ev.maybe} said yes/maybe</div></div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </main>
    </div>
  )
}
