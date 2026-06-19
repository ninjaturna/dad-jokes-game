import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Crest from '../components/brand/Crest'
import Wordmark from '../components/brand/Wordmark'
import ThemeToggle from '../components/ThemeToggle'
import { downloadICS } from '../lib/ics'
import { getEventBySlug, submitRsvp } from '../lib/events'
import type { EventRow, RsvpResponse } from '../types/events'

const DONE: Record<RsvpResponse, { title: string; body: (n: string) => string; ring: string }> = {
  yes: { title: 'You’re in.', body: (n) => `See you in the yard${n ? `, ${n}` : ''}. We’ll text the details.`, ring: '#5DCAA5' },
  maybe: { title: 'Noted.', body: (n) => `We’ll hold a maybe${n ? ` for ${n}` : ''} and nudge you closer to the day.`, ring: '#E0A867' },
  no: { title: 'Next time.', body: (n) => `Thanks for letting us know${n ? `, ${n}` : ''}. We’ll catch you at the next one.`, ring: '#C98A4E' },
}
const STEP2_TITLE: Record<RsvpResponse, string> = { yes: 'You’re coming!', maybe: 'Tentatively in', no: 'Sorry to miss you' }
const DOT: Record<RsvpResponse, string> = { yes: '#5DCAA5', maybe: '#E0A867', no: '#E0705F' }

function fmtStrip(ev: EventRow): string {
  if (!ev.starts_at) return [ev.location_name].filter(Boolean).join(' · ').toUpperCase()
  const d = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', timeZone: ev.timezone }).format(new Date(ev.starts_at))
  return [d, ev.location_name].filter(Boolean).join(' · ').toUpperCase()
}

export default function RsvpFlow() {
  const { slug } = useParams<{ slug: string }>()
  const [event, setEvent] = useState<EventRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [rsvp, setRsvp] = useState<RsvpResponse | null>(null)
  const [name, setName] = useState('')
  const [plus, setPlus] = useState(0)
  const [smsConsent, setSmsConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!slug) return
    getEventBySlug(slug).then((ev) => { setEvent(ev); setLoading(false) })
  }, [slug])

  if (loading) return <div className="min-h-screen bg-bg-page" />
  if (!event) return (
    <div className="min-h-screen bg-bg-page text-text-primary flex flex-col items-center justify-center gap-4 px-6 text-center">
      <Crest size={84} showWord={false} double={false} />
      <p className="font-display text-2xl">This invitation isn’t available.</p>
      <Link to="/" className="text-accent-2 font-sans">Back to the Yard</Link>
    </div>
  )

  const showPlus = rsvp !== 'no' && event.allow_plus_ones
  const accent = 'var(--accent)'
  const off = 'var(--border)'

  function choose(v: RsvpResponse) { setRsvp(v); setStep(2) }

  async function finish() {
    if (!rsvp || !event) return
    setSubmitting(true)
    try { await submitRsvp({ eventId: event.id, name, response: rsvp, plusOnes: showPlus ? plus : 0, smsConsent }); setStep(3) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-x-hidden bg-bg-page p-6 text-text-primary">
      {/* candle glow */}
      <div className="pointer-events-none absolute z-0" style={{ top: -200, left: '50%', transform: 'translateX(-50%)', width: 700, height: 480, background: 'radial-gradient(ellipse at center, color-mix(in srgb, var(--candle) 32%, transparent), transparent 70%)', filter: 'blur(24px)' }} />

      {/* top bar */}
      <div className="relative z-[2] flex w-full max-w-[460px] items-center justify-between pt-1">
        <Wordmark variant="inline" iconSize={34} />
        <ThemeToggle />
      </div>

      {/* card */}
      <div className="relative z-[1] my-auto w-full max-w-[460px] overflow-hidden rounded-[18px] border border-border bg-bg-surface" style={{ boxShadow: 'var(--shadow-card)' }}>

        {/* event strip */}
        <div className="border-b border-border px-[26px] py-5" style={{ background: 'var(--bg-surface-2)' }}>
          <div className="mb-1.5 font-sans text-[10.5px] font-bold tracking-[0.2em] tabular" style={{ color: 'var(--candle)' }}>{fmtStrip(event)}</div>
          <div className="font-display text-[21px] font-bold tracking-[-0.01em]">{event.title}</div>
        </div>

        {/* progress */}
        <div className="flex gap-1.5 px-[26px] pt-[18px]">
          <span className="h-1 flex-1 rounded-pill" style={{ background: step >= 1 ? accent : off }} />
          <span className="h-1 flex-1 rounded-pill" style={{ background: step >= 2 ? accent : off }} />
          <span className="h-1 flex-1 rounded-pill" style={{ background: step >= 3 ? accent : off }} />
        </div>

        <div className="p-[26px]">
          {step === 1 && (
            <div>
              <div className="mb-2.5 font-sans text-[11px] font-semibold tracking-[0.24em] text-text-muted">STEP 1 OF 3</div>
              <h1 className="m-0 mb-1.5 font-display text-3xl font-extrabold tracking-[-0.01em]">Will you be there?</h1>
              <p className="m-0 mb-6 text-[14.5px] text-text-secondary">No account needed. One tap.</p>
              <div className="flex flex-col gap-3">
                {(['yes','maybe','no'] as RsvpResponse[]).map((k) => (
                  <button key={k} onClick={() => choose(k)}
                    className="flex min-h-[44px] items-center gap-3.5 rounded-card border border-border px-5 py-[18px] text-left"
                    style={{ background: 'var(--field)' }}>
                    <span className="h-3 w-3 flex-none rounded-full" style={{ background: DOT[k] }} />
                    <span className="whitespace-nowrap text-lg font-bold">{k === 'yes' ? 'Yes, I’m in' : k === 'maybe' ? 'Maybe' : 'Can’t make it'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && rsvp && (
            <div>
              <div className="mb-2.5 font-sans text-[11px] font-semibold tracking-[0.24em] text-text-muted">STEP 2 OF 3</div>
              <h1 className="m-0 mb-1.5 font-display text-3xl font-extrabold tracking-[-0.01em]">{STEP2_TITLE[rsvp]}</h1>
              <p className="m-0 mb-5 text-[14.5px] text-text-secondary">Just a name so we know to set a place.</p>
              <label className="mb-2 block text-xs font-semibold tracking-[0.04em] text-text-secondary">Your name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jordan"
                className="mb-5 w-full rounded-[10px] border border-border px-4 py-[15px] text-base text-text-primary outline-none"
                style={{ background: 'var(--field)' }} />
              {showPlus && (
                <div className="mb-5 flex items-center justify-between rounded-card border border-border px-[18px] py-4">
                  <div>
                    <div className="text-[15px] font-semibold">Bringing anyone?</div>
                    <div className="text-[13px] text-text-muted">Plus-ones welcome</div>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <button onClick={() => setPlus((p) => Math.max(0, p - 1))} className="h-11 w-11 rounded-[10px] border border-border text-xl text-text-primary" style={{ background: 'var(--field)' }}>–</button>
                    <span className="min-w-[42px] text-center font-display text-xl font-bold tabular">+{plus}</span>
                    <button onClick={() => setPlus((p) => Math.min(event.plus_one_max, p + 1))} className="h-11 w-11 rounded-[10px] border border-border text-xl text-text-primary" style={{ background: 'var(--field)' }}>+</button>
                  </div>
                </div>
              )}
              <label className="mb-4 flex cursor-pointer items-start gap-2.5">
                <input type="checkbox" checked={smsConsent} onChange={(e) => setSmsConsent(e.target.checked)}
                  className="mt-0.5 flex-none accent-[var(--accent)]" />
                <span className="text-[12.5px] leading-[1.5] text-text-muted">
                  Text me about this event. Msg &amp; data rates may apply, reply STOP to opt out. See our{' '}
                  <Link to="/privacy" className="text-accent-2 no-underline">Privacy Policy</Link>.
                </span>
              </label>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="min-h-[44px] rounded-[10px] border border-border px-5 py-[15px] text-[15px] font-semibold text-text-primary">Back</button>
                <button onClick={finish} disabled={submitting} className="min-h-[44px] flex-1 rounded-[10px] bg-accent px-5 py-[15px] text-base font-bold text-white disabled:opacity-60">
                  {submitting ? 'Confirming…' : name.trim() ? 'Confirm' : 'Confirm without a name'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && rsvp && (
            <div className="px-1 pb-1.5 pt-2 text-center">
              <div className="flex justify-center"><Crest size={96} showWord={false} double={false} ring={DONE[rsvp].ring} vine={DONE[rsvp].ring} leaf="#E0A867" /></div>
              <h1 className="mx-0 mb-2 mt-4 font-display text-[32px] font-extrabold tracking-[-0.01em]">{DONE[rsvp].title}</h1>
              <p className="mx-auto mb-6 max-w-[300px] text-base leading-[1.55] text-text-secondary">{DONE[rsvp].body(name.trim())}</p>
              <div className="flex flex-col gap-2.5">
                <button onClick={() => downloadICS(event)} className="rounded-[10px] bg-accent px-5 py-[15px] text-[15px] font-bold text-white">Add to calendar</button>
                <Link to={`/e/${event.slug}`} className="rounded-[10px] border border-border px-5 py-[15px] text-[15px] font-semibold text-text-primary no-underline">View the invitation</Link>
                <button onClick={() => { setStep(1); setRsvp(null) }} className="mt-0.5 px-3 py-2.5 text-[13px] font-semibold text-accent-2">Change my response</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-[1] mt-[18px] text-xs tracking-[0.04em] text-text-muted">Black Cafe @ Marly’s Yard · Miami</div>
    </div>
  )
}
