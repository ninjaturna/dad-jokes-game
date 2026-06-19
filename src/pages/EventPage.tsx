import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import Crest from '../components/brand/Crest'
import ThemeToggle from '../components/ThemeToggle'
import { downloadICS } from '../lib/ics'
import { getEventBySlug, getRsvps, getMyRsvp, submitRsvp, countGoing, subscribeRsvps } from '../lib/events'
import type { EventRow, RsvpRow, RsvpResponse } from '../types/events'

function fmtDate(iso: string, tz: string): string {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: tz }).format(new Date(iso))
}
function fmtTime(iso: string, tz: string): string {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz }).format(new Date(iso))
}

export default function EventPage() {
  const { slug } = useParams<{ slug: string }>()
  const [event, setEvent] = useState<EventRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [rsvps, setRsvps] = useState<RsvpRow[]>([])
  const [name, setName] = useState('')
  const [choice, setChoice] = useState<RsvpResponse | null>(null)
  const [plus, setPlus] = useState(0)
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const refresh = useCallback((id: string) => { getRsvps(id).then(setRsvps) }, [])

  useEffect(() => {
    let unsub = () => {}
    ;(async () => {
      if (!slug) return
      const ev = await getEventBySlug(slug)
      setEvent(ev)
      setLoading(false)
      if (ev) {
        refresh(ev.id)
        const mine = await getMyRsvp(ev.id)
        if (mine) { setName(mine.name); setChoice(mine.response); setPlus(mine.plus_ones); setSent(true) }
        unsub = subscribeRsvps(ev.id, () => refresh(ev.id))
      }
    })()
    return () => unsub()
  }, [slug, refresh])

  if (loading) return <div className="min-h-screen bg-bg-page" />
  if (!event) return (
    <div className="min-h-screen bg-bg-page text-text-primary flex flex-col items-center justify-center gap-4 px-6 text-center">
      <Crest size={84} showWord={false} double={false} />
      <p className="font-display text-2xl">This invitation isn’t available.</p>
      <Link to="/" className="text-accent-2 font-sans">Back to the Yard</Link>
    </div>
  )

  const going = countGoing(rsvps)
  const seatsLeft = event.capacity != null ? Math.max(0, event.capacity - going) : null

  async function onSubmit() {
    if (!choice || !name.trim() || !event) return
    setSubmitting(true)
    try { await submitRsvp({ eventId: event.id, name, response: choice, plusOnes: plus }); setSent(true) }
    finally { setSubmitting(false) }
  }

  const whenTime = event.starts_at
    ? `${fmtTime(event.starts_at, event.timezone)}${event.ends_at ? ` – ${fmtTime(event.ends_at, event.timezone)}` : ' – late'}`
    : null

  return (
    <div className="min-h-screen bg-bg-page text-text-primary relative overflow-x-hidden">
      {/* ambient grain + candle glow */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.05]" style={{ mixBlendMode: 'overlay', backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")" }} />
      <div className="pointer-events-none absolute z-0" style={{ top: -220, left: '50%', transform: 'translateX(-50%)', width: 820, height: 560, background: 'radial-gradient(ellipse at center, color-mix(in srgb, var(--candle) 34%, transparent), transparent 70%)', filter: 'blur(24px)' }} />

      {/* top bar */}
      <div className="relative z-[2] mx-auto flex max-w-[1100px] items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-1.5 font-sans text-[13px] tracking-[0.04em] text-text-secondary no-underline">
          <span className="text-base">‹</span> the Yard
        </Link>
        <ThemeToggle />
      </div>

      {/* invitation column */}
      <div className="relative z-[1] mx-auto max-w-[600px] px-6 pb-24 pt-6">

        {/* crest + eyebrow */}
        <div className="mb-7 text-center">
          <div className="flex justify-center"><Crest size={76} showWord={false} double={false} ringWidth={1.25} /></div>
          <div className="mt-3.5 font-sans text-[11px] font-semibold tracking-[0.34em] text-text-muted">
            YOU’RE INVITED · BLACK CAFE @ MARLY’S YARD
          </div>
        </div>

        {/* event image */}
        <div className="relative mb-7 overflow-hidden rounded-card shadow-card" style={{ aspectRatio: '16 / 10' }}>
          {event.image_url ? (
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${event.image_url})` }} />
          ) : (
            <>
              <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(135deg,#3A0A12,#3A0A12 12px,#451320 12px,#451320 24px)' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-[11px] tracking-[0.18em]" style={{ color: 'rgba(242,228,214,.6)' }}>[ EVENT PHOTO ]</span>
              </div>
            </>
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--scrim), transparent 55%)' }} />
          {seatsLeft != null && (
            <div className="absolute left-4 top-4 whitespace-nowrap rounded-pill bg-accent px-3 py-1.5 text-[11px] font-bold tracking-[0.14em] text-white tabular">
              {seatsLeft} {seatsLeft === 1 ? 'SEAT' : 'SEATS'} LEFT
            </div>
          )}
        </div>

        {/* title block */}
        <div className="mb-7 text-center">
          {event.description && (
            <div className="mb-4 font-display text-[12px] font-bold tracking-[0.28em] text-accent">{event.description}</div>
          )}
          <h1 className="m-0 font-display font-extrabold leading-[1.02] tracking-[-0.02em]" style={{ fontSize: 'clamp(38px,8vw,58px)' }}>
            {event.title}
          </h1>
        </div>

        {/* when / where */}
        <div className="mb-7 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border" style={{ background: 'var(--border)' }}>
          <div className="bg-bg-surface px-5 py-[18px]">
            <div className="mb-1.5 font-sans text-[11px] font-semibold tracking-[0.18em] text-text-muted">WHEN</div>
            <div className="text-base font-semibold tabular">{event.starts_at ? fmtDate(event.starts_at, event.timezone) : 'TBA'}</div>
            {whenTime && <div className="font-sans text-sm text-text-secondary tabular">{whenTime}</div>}
          </div>
          <div className="bg-bg-surface px-5 py-[18px]">
            <div className="mb-1.5 font-sans text-[11px] font-semibold tracking-[0.18em] text-text-muted">WHERE</div>
            <div className="text-base font-semibold">{event.location_name ?? 'TBA'}</div>
            {event.location_address && <div className="font-sans text-sm text-text-secondary">{event.location_address}</div>}
          </div>
        </div>

        {/* host note */}
        {event.host_note && (
          <div className="mb-7 flex items-start gap-4 rounded-card p-6 shadow-card" style={{ background: 'var(--bg-surface-2)' }}>
            <span className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-full font-display text-lg font-bold text-white" style={{ background: 'linear-gradient(135deg,#D96B43,#A62F24)' }}>
              {event.title.trim().charAt(0).toUpperCase()}
            </span>
            <div>
              <div className="mb-2 font-sans text-[12px] font-semibold tracking-[0.12em]" style={{ color: 'var(--candle)' }}>A NOTE FROM THE HOST</div>
              <p className="m-0 text-[15.5px] leading-[1.62] text-text-primary">{event.host_note}</p>
            </div>
          </div>
        )}

        {/* RSVP MODULE */}
        <div className="rounded-card border border-border bg-bg-surface p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
          {sent ? (
            <div className="py-3 text-center">
              <div className="flex justify-center"><Crest size={84} showWord={false} double={false} ring="#5DCAA5" vine="#5DCAA5" leaf="#E0A867" /></div>
              <h3 className="mb-1 mt-3 font-display text-3xl font-extrabold">You’re in.</h3>
              <p className="mb-5 text-text-secondary">See you in the yard{name.trim() ? `, ${name.trim()}` : ''}.</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button onClick={() => downloadICS(event)} className="rounded-control border border-text-muted px-4 py-2.5 text-sm font-semibold text-text-primary">Add to calendar</button>
                <button onClick={() => setSent(false)} className="px-3 py-2.5 text-sm font-semibold text-accent-2">Change response</button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-1 font-display text-lg font-bold">Will you be there?</div>
              <div className="mb-4 text-sm text-text-muted">No account needed</div>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                className="mb-3.5 w-full rounded-control border border-border px-4 py-3.5 text-[15px] text-text-primary outline-none"
                style={{ background: 'var(--field)' }} />
              <div className="mb-4 grid grid-cols-3 gap-2.5">
                {(['yes','maybe','no'] as RsvpResponse[]).map((k) => {
                  const c = { yes: '#5DCAA5', maybe: '#E0A867', no: '#E0705F' }[k]
                  const on = choice === k
                  const label = k === 'yes' ? 'Yes' : k === 'maybe' ? 'Maybe' : 'Can’t'
                  return (
                    <button key={k} onClick={() => setChoice(k)} className="rounded-control py-4 text-[15px] font-semibold"
                      style={{ border: `1.5px solid ${on ? c : 'var(--border)'}`, background: on ? c : 'var(--field)', color: on ? '#260306' : 'var(--text-primary)' }}>
                      {label}
                    </button>
                  )
                })}
              </div>
              {event.allow_plus_ones && (
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Bringing anyone?</span>
                  <div className="flex items-center gap-3.5">
                    <button onClick={() => setPlus((p) => Math.max(0, p - 1))} className="h-9 w-9 rounded-control border border-border text-lg text-text-primary" style={{ background: 'var(--field)' }}>–</button>
                    <span className="min-w-[40px] text-center font-display text-lg font-bold tabular">+{plus}</span>
                    <button onClick={() => setPlus((p) => Math.min(event.plus_one_max, p + 1))} className="h-9 w-9 rounded-control border border-border text-lg text-text-primary" style={{ background: 'var(--field)' }}>+</button>
                  </div>
                </div>
              )}
              <button onClick={onSubmit} disabled={!choice || !name.trim() || submitting}
                className="w-full rounded-control bg-accent py-4 text-base font-bold text-white disabled:opacity-60">
                {submitting ? 'Sending…' : choice ? 'I’m in' : 'Pick a response'}
              </button>
            </div>
          )}
        </div>

        {/* avatar stack + guest count */}
        {(() => {
          const yes = rsvps.filter((r) => r.response === 'yes')
          const colors = ['#D96B43', '#5DCAA5', '#A67244', '#315955', '#590242']
          const shown = yes.slice(0, 5)
          const extra = yes.length - shown.length
          return (
            <div className="mt-6 flex items-center justify-center gap-3.5">
              {shown.length > 0 && (
                <div className="flex">
                  {shown.map((r, i) => (
                    <span key={r.id} className="flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 text-[11px] font-bold text-white"
                      style={{ background: colors[i % colors.length], borderColor: 'var(--bg-page)', marginLeft: i ? -9 : 0 }}>
                      {r.name.trim().charAt(0).toUpperCase()}
                    </span>
                  ))}
                  {extra > 0 && (
                    <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 text-[11px] font-bold tabular"
                      style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--bg-page)', color: 'var(--text-secondary)', marginLeft: -9 }}>+{extra}</span>
                  )}
                </div>
              )}
              <span className="font-sans text-sm text-text-secondary tabular">{going} going{seatsLeft != null ? ` · ${seatsLeft} seats left` : ''}</span>
            </div>
          )
        })()}

        {/* bring / wear */}
        {(event.bring_note || event.wear_note) && (
          <div className="mt-7 grid grid-cols-2 gap-3.5">
            {event.bring_note && (
              <div className="rounded-card border border-border px-5 py-[18px]">
                <div className="mb-1.5 font-sans text-[11px] font-semibold tracking-[0.16em] text-text-muted">BRING</div>
                <div className="text-[14.5px] leading-[1.5] text-text-primary">{event.bring_note}</div>
              </div>
            )}
            {event.wear_note && (
              <div className="rounded-card border border-border px-5 py-[18px]">
                <div className="mb-1.5 font-sans text-[11px] font-semibold tracking-[0.16em] text-text-muted">WEAR</div>
                <div className="text-[14.5px] leading-[1.5] text-text-primary">{event.wear_note}</div>
              </div>
            )}
          </div>
        )}

        {/* footer actions */}
        <div className="mt-7 flex justify-center gap-4">
          <button onClick={() => downloadICS(event)} className="font-sans text-sm font-semibold text-accent-2">Add to calendar</button>
          {event.location_url && (
            <>
              <span style={{ color: 'var(--border)' }}>·</span>
              <a href={event.location_url} target="_blank" rel="noreferrer" className="font-sans text-sm font-semibold text-accent-2 no-underline">View map</a>
            </>
          )}
          <span style={{ color: 'var(--border)' }}>·</span>
          <button onClick={async () => {
            const url = window.location.href
            if (navigator.share) { try { await navigator.share({ title: event.title, url }) } catch { /* cancelled */ } }
            else { await navigator.clipboard.writeText(url) }
          }} className="font-sans text-sm font-semibold text-accent-2">Share</button>
        </div>
      </div>
    </div>
  )
}
