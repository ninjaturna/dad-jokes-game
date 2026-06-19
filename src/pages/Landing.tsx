import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Crest from '../components/brand/Crest'
import Wordmark from '../components/brand/Wordmark'
import ThemeToggle from '../components/ThemeToggle'
import { getUpcomingPublicEvents, joinList } from '../lib/landing'
import type { EventRow } from '../types/events'

function chip(iso: string | null, tz: string) {
  if (!iso) return 'DATE TBA'
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', timeZone: tz })
    .format(new Date(iso)).toUpperCase().replace(/,/g, ' ·')
}

export default function Landing() {
  const [events, setEvents] = useState<EventRow[]>([])
  const [contact, setContact] = useState('')
  const [smsConsent, setSmsConsent] = useState(false)
  const [joined, setJoined] = useState(false)
  useEffect(() => { getUpcomingPublicEvents().then(setEvents) }, [])

  async function submit() {
    if (!contact.trim()) return
    try { await joinList(contact, smsConsent); setJoined(true) } catch { /* ignore */ }
  }

  const accents = ['var(--candle)', 'var(--accent-2)', '#A67244']

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bg-page text-text-primary">
      {/* NAV */}
      <nav className="sticky top-0 z-40 flex items-center justify-between gap-5 border-b border-border px-8 py-4"
        style={{ background: 'color-mix(in srgb, var(--bg-page) 80%, transparent)', backdropFilter: 'blur(14px)' }}>
        <Wordmark variant="stacked" />
        <div className="flex items-center gap-6">
          <div className="hidden gap-6 text-[13px] text-text-secondary sm:flex">
            <a href="#gatherings" className="no-underline" style={{ color: 'inherit' }}>Gatherings</a>
            <a href="#about" className="no-underline" style={{ color: 'inherit' }}>About</a>
            <a href="#invite" className="no-underline" style={{ color: 'inherit' }}>Get invited</a>
            <Link to="/host" className="no-underline font-semibold" style={{ color: 'var(--text-muted)' }}>Host</Link>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* HERO — hardcoded dark in both themes (prototype intent) */}
      <header className="relative flex items-center justify-center overflow-hidden text-center"
        style={{ minHeight: '78vh', padding: '80px 24px' }}>
        <div className="absolute inset-0 z-0"
          style={{ background: 'repeating-linear-gradient(125deg,#2B0610,#2B0610 16px,#330a16 16px,#330a16 32px)' }} />
        <div className="absolute inset-0 z-0"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, color-mix(in srgb,#E0A867 30%, transparent), transparent 60%), rgba(38,3,6,.82)' }} />
        <div className="relative z-[1] max-w-[840px]">
          <div className="mb-6 flex justify-center"><Crest size={96} showWord={false} /></div>
          <div className="mb-6 text-xs font-semibold tracking-[0.36em]" style={{ color: '#E0A867' }}>
            AN INTIMATE GATHERING HOUSE · MIAMI
          </div>
          <h1 className="m-0 font-display font-light leading-[1.02] tracking-[-0.01em]"
            style={{ fontSize: 'clamp(40px,7vw,76px)', color: '#F2E4D6', textWrap: 'balance' }}>
            Where the night<br />gets <span className="font-extrabold tracking-[-0.02em]">loud</span>, and the<br />
            table stays <span className="font-extrabold tracking-[-0.02em]" style={{ color: '#D96B43' }}>close</span>.
          </h1>
          <p className="mx-auto mt-7 max-w-[520px] text-lg leading-[1.6]" style={{ color: '#D8C7B6' }}>
            Recurring suppers, sessions, and slow nights under the vines. By invitation — get on the list.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3.5">
            <a href="#invite" className="rounded-control px-7 py-4 text-base font-semibold text-white no-underline"
              style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-card)' }}>
              Get on the list
            </a>
            <a href="#gatherings" className="rounded-control border px-7 py-4 text-base font-semibold no-underline"
              style={{ color: '#F2E4D6', borderColor: '#C98A4E', background: 'transparent' }}>
              See what's coming
            </a>
          </div>
        </div>
      </header>

      {/* GATHERINGS */}
      <section id="gatherings" className="mx-auto max-w-[1100px] px-8 pb-16 pt-[88px]">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="mb-3 text-xs font-bold tracking-[0.28em] text-accent">WHAT'S COMING</div>
            <h2 className="m-0 font-display font-bold tracking-[-0.01em]"
              style={{ fontSize: 'clamp(30px,4vw,42px)' }}>Upcoming gatherings</h2>
          </div>
        </div>
        {events.length ? (
          <div className="grid gap-[22px]" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
            {events.map((ev, i) => (
              <Link key={ev.id} to={`/e/${ev.slug}`}
                className="block overflow-hidden rounded-card border border-border bg-bg-surface no-underline text-inherit"
                style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="h-1" style={{ background: accents[i % accents.length] }} />
                <div className="relative h-40"
                  style={{ background: 'repeating-linear-gradient(135deg,#3A0A12,#3A0A12 11px,#451320 11px,#451320 22px)' }}>
                  {ev.image_url && (
                    <div className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${ev.image_url})` }} />
                  )}
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, var(--scrim), transparent 60%)' }} />
                </div>
                <div className="px-[22px] py-5">
                  <div className="mb-2 text-[11px] font-bold tracking-[0.18em] text-accent tabular">
                    {chip(ev.starts_at, ev.timezone)}
                  </div>
                  <h3 className="m-0 mb-2 font-display text-[22px] font-bold tracking-[-0.01em]">{ev.title}</h3>
                  <p className="m-0 text-sm leading-[1.5] text-text-secondary">
                    {ev.description ?? ev.location_name ?? ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary">
            No public gatherings on the calendar right now — check back soon.
          </p>
        )}
      </section>

      {/* ABOUT */}
      <section id="about" className="border-y border-border" style={{ background: 'var(--bg-surface-2)' }}>
        <div className="mx-auto grid max-w-[1100px] items-center gap-14 px-8 py-[88px]"
          style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
          <div>
            <div className="mb-4 text-[12px] font-bold tracking-[0.28em]" style={{ color: 'var(--candle)' }}>
              WHAT THIS IS
            </div>
            <h2 className="m-0 mb-5 font-display font-light leading-[1.12] tracking-[-0.01em] text-text-primary"
              style={{ fontSize: 'clamp(28px,3.6vw,40px)' }}>
              Not a venue. A <span className="font-extrabold">room</span> that keeps inviting you back.
            </h2>
            <p className="m-0 mb-[18px] text-base leading-[1.7] text-text-secondary">
              Marly's Yard is Tam's room for recurring gatherings — the home of{' '}
              <strong className="font-semibold text-text-primary">Black Cafe</strong> in Miami: terracotta walls,
              a pergola dripping with vines, and a long table that's always being set.
            </p>
            <p className="m-0 text-base leading-[1.7] text-text-secondary">
              Weekly sessions, monthly suppers. Small by design. You don't buy a ticket — you get an invitation.
            </p>
          </div>
          <div className="flex flex-col gap-3.5">
            {([
              { n: '01', c: 'var(--accent)', title: 'Recurring, not one-off', body: 'The same room, a new reason, most weeks.' },
              { n: '02', c: 'var(--accent-2)', title: 'Small on purpose', body: 'A dozen seats, so the night stays close.' },
              { n: '03', c: '#A67244', title: 'By invitation', body: 'RSVP in a tap. No account, no fuss.' },
            ] as const).map(({ n, c, title, body }) => (
              <div key={n} className="flex items-start gap-4 rounded-card px-[22px] py-5"
                style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-card)' }}>
                <span className="w-[30px] flex-none font-display text-xl font-extrabold" style={{ color: c }}>{n}</span>
                <div>
                  <div className="mb-1 text-base font-semibold">{title}</div>
                  <div className="text-sm leading-[1.55] text-text-secondary">{body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INVITE */}
      <section id="invite" className="mx-auto max-w-[680px] px-8 py-24 text-center">
        <div className="mb-5 flex justify-center">
          <Crest size={80} showWord={false} double={false} ring="#5DCAA5" vine="#5DCAA5" leaf="#E0A867" />
        </div>
        <div className="mb-4 text-xs font-semibold tracking-[0.3em]" style={{ color: 'var(--candle)' }}>
          HOW TO GET INVITED
        </div>
        <h2 className="m-0 mb-4 font-display font-extrabold tracking-[-0.02em]"
          style={{ fontSize: 'clamp(30px,5vw,46px)' }}>
          Get on the list.
        </h2>
        {joined ? (
          <p className="text-lg text-text-secondary">
            You're on the list. We'll reach out when the next one's open.
          </p>
        ) : (
          <>
            <p className="m-0 mb-7 text-[17px] leading-[1.6] text-text-secondary">
              Drop your number or email and we'll reach out when the next one's open.
            </p>
            <div className="mx-auto flex max-w-[460px] flex-wrap gap-2.5">
              <input value={contact} onChange={(e) => setContact(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="Phone or email"
                className="min-w-[200px] flex-1 rounded-control border border-border bg-bg-surface px-4 py-3.5 text-[15px] text-text-primary outline-none" />
              <button onClick={submit}
                className="rounded-control px-6 py-3.5 text-[15px] font-bold text-white"
                style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-card)' }}>
                Join
              </button>
            </div>
            <label className="mx-auto mt-4 flex max-w-[460px] cursor-pointer items-start gap-2.5 text-left">
              <input type="checkbox" checked={smsConsent} onChange={(e) => setSmsConsent(e.target.checked)}
                className="mt-0.5 flex-none accent-[var(--accent)]" />
              <span className="text-[12.5px] leading-[1.5]" style={{ color: 'var(--text-muted)' }}>
                {"Text me about Black Cafe @ Marly's Yard gatherings — invitations, reminders & updates (about 1–4 msgs/month). Msg & data rates may apply. Reply HELP for help, STOP to opt out. See our "}
                <Link to="/terms" className="text-accent-2 no-underline">Terms</Link>
                {" & "}
                <Link to="/privacy" className="text-accent-2 no-underline">Privacy Policy</Link>
                {"."}
              </span>
            </label>
            <p className="mt-3 text-[12.5px]" style={{ color: 'var(--text-muted)' }}>
              No spam. Just the next gathering.
            </p>
          </>
        )}
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-5 px-8 py-10">
          <Wordmark variant="inline" iconSize={40} />
          <div className="flex flex-wrap items-center gap-4 text-[12.5px] tracking-[0.04em]" style={{ color: 'var(--text-muted)' }}>
            <span>blackcafe.miami · est. 2026</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <Link to="/privacy" className="no-underline" style={{ color: 'var(--text-muted)' }}>Privacy</Link>
            <Link to="/terms" className="no-underline" style={{ color: 'var(--text-muted)' }}>Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
