import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import Crest from '../../components/brand/Crest'
import ThemeToggle from '../../components/ThemeToggle'
import { useAuth } from '../../hooks/useAuth'
import { getEvent, getLists, sendEmailInvites } from '../../lib/invites'
import type { EventRow } from '../../types/events'
import type { ListWithMembers } from '../../lib/guests'

interface TemplateConfig {
  id: string; name: string; swatch: string; swatchInk: string; swatchTrack: string
  cardBg: string; crest: string; vine: string; leaf: string
  muted: string; ink: string; sub: string; cta: string
  eyebrow: string; weight: number; track: string
}

const TEMPLATES: TemplateConfig[] = [
  { id: 'candlelit', name: 'Candlelit',
    swatch: 'linear-gradient(150deg,#590242,#2B0A18)', swatchInk: '#F2E4D6', swatchTrack: '-.01em',
    cardBg: 'linear-gradient(160deg,#3A0A12,#260306)', crest: '#E0A867', vine: '#5DCAA5', leaf: '#E0A867',
    muted: '#C98A4E', ink: '#F2E4D6', sub: '#D8C7B6', cta: '#D96B43', eyebrow: "YOU'RE INVITED", weight: 800, track: '-.01em' },
  { id: 'mural', name: 'Mural',
    swatch: 'linear-gradient(135deg,#D96B43,#A62F24 60%,#315955)', swatchInk: '#FBEFE6', swatchTrack: '-.02em',
    cardBg: '#590242', crest: '#5DCAA5', vine: '#E0A867', leaf: '#5DCAA5',
    muted: '#F0A878', ink: '#FBEFE6', sub: '#F3D9C8', cta: '#D96B43', eyebrow: 'WHERE THE NIGHT GETS LOUD', weight: 900, track: '-.02em' },
  { id: 'garden', name: 'Garden',
    swatch: 'linear-gradient(150deg,#315955,#5DCAA5)', swatchInk: '#08231C', swatchTrack: '.04em',
    cardBg: 'linear-gradient(160deg,#2E0810,#3A0A12)', crest: '#5DCAA5', vine: '#5DCAA5', leaf: '#E0A867',
    muted: '#7FD3B4', ink: '#EAF6F0', sub: '#C9E6DA', cta: '#5DCAA5', eyebrow: 'PULL UP A CHAIR', weight: 300, track: '.12em' },
]

const LIST_COLORS = ['#D96B43', '#A62F24', '#5DCAA5', '#A67244', '#315955', '#590242', '#E0A867']

function fmtChip(iso: string | null, tz: string): string {
  if (!iso) return 'TBA'
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', timeZone: tz,
  }).format(new Date(iso)).toUpperCase().replace(/,/g, ' ·')
}

export default function SendInvites() {
  const { eventId } = useParams<{ eventId: string }>()
  const { user } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [event, setEvent] = useState<EventRow | null>(null)
  const [lists, setLists] = useState<ListWithMembers[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [channel, setChannel] = useState<'email' | 'sms'>('email')
  const [templateId, setTemplateId] = useState('candlelit')
  const [note, setNote] = useState("Pull up a chair — slow dinner under the vines. Doors at eight, we eat at nine.")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ configured: boolean; delivered: number } | null>(null)

  useEffect(() => {
    if (!eventId || !user) return
    getEvent(eventId).then(setEvent)
    getLists(user.id).then((ls) => { setLists(ls); setSelected(new Set(ls.map((l) => l.id))) })
  }, [eventId, user])

  const drawQR = useCallback(() => {
    if (!event || !canvasRef.current) return
    void QRCode.toCanvas(canvasRef.current, `${window.location.origin}/e/${event.slug}`, {
      width: 116, margin: 1, color: { dark: '#260306', light: '#FAFBF5' },
    })
  }, [event])
  useEffect(() => { drawQR() }, [drawQR])

  if (!event) return <div className="min-h-screen bg-bg-page" />

  const tpl = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0]

  const recipientEmails = new Set<string>()
  lists.filter((l) => selected.has(l.id)).forEach((l) => {
    l.members.forEach((m) => { if (m.email) recipientEmails.add(m.email) })
  })
  const recipientCount = recipientEmails.size

  function toggleList(id: string) {
    setSelected((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }

  async function handleSend() {
    if (!eventId) return
    setSending(true)
    try {
      const res = await sendEmailInvites({ eventId, listIds: Array.from(selected), note, template: templateId })
      setResult(res)
    } finally { setSending(false) }
  }

  function downloadQR() {
    if (!canvasRef.current || !event) return
    const a = document.createElement('a')
    a.href = canvasRef.current.toDataURL('image/png')
    a.download = `${event.slug}-qr.png`
    a.click()
  }

  const fld: React.CSSProperties = { background: 'var(--field)' }

  return (
    <div className="min-h-screen text-text-primary" style={{ background: 'var(--bg-page)' }}>
      {/* Top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border px-7 py-[14px]"
        style={{ background: 'color-mix(in srgb, var(--bg-page) 84%, transparent)', backdropFilter: 'blur(14px)' }}>
        <div className="flex items-center gap-3.5">
          <Link to="/host" className="flex items-center gap-1.5 text-text-secondary text-[13px] no-underline">
            <span className="text-base">‹</span> Dashboard
          </Link>
          <span style={{ color: 'var(--border)' }}>/</span>
          <span className="text-[13px] font-semibold truncate max-w-[240px]">Send invites · {event.title}</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-[1180px] px-7 pt-8 pb-20"
        style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 36, alignItems: 'start' }}>

        {/* LEFT CONTROLS */}
        <div className="flex flex-col gap-6 min-w-0">
          <div>
            <div className="text-[12px] tracking-[.2em] font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>SEND INVITES</div>
            <h1 className="font-display font-extrabold text-[32px] tracking-[-0.02em] m-0">Get the word out.</h1>
          </div>

          {/* Channel */}
          <section className="border border-border rounded-[14px] p-[22px]" style={{ background: 'var(--bg-surface)' }}>
            <div className="font-display font-bold text-base mb-4">Channel</div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setChannel('email')} className="text-left p-4 rounded-[12px] cursor-pointer"
                style={{ border: `1.5px solid ${channel === 'email' ? 'var(--accent)' : 'var(--border)'}`, background: channel === 'email' ? 'color-mix(in srgb,var(--accent) 16%, transparent)' : 'transparent' }}>
                <div className="font-bold text-[15px] mb-0.5 text-text-primary">✉ Email</div>
                <div className="text-[12.5px]" style={{ color: 'var(--text-muted)' }}>Rich invitation card</div>
              </button>
              <button disabled className="text-left p-4 rounded-[12px] opacity-40 cursor-not-allowed"
                style={{ border: '1.5px solid var(--border)', background: 'transparent' }}>
                <div className="font-bold text-[15px] mb-0.5 text-text-primary">✆ Text (SMS)</div>
                <div className="text-[12.5px]" style={{ color: 'var(--text-muted)' }}>Connect SMS (coming soon)</div>
              </button>
            </div>
          </section>

          {/* Design picker */}
          <section className="border border-border rounded-[14px] p-[22px]" style={{ background: 'var(--bg-surface)' }}>
            <div className="font-display font-bold text-base mb-1.5">Invitation design</div>
            <p className="text-[13px] m-0 mb-4" style={{ color: 'var(--text-muted)' }}>
              Pick the look — all on-brand, all from the system.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => setTemplateId(t.id)}
                  className="p-0 rounded-[12px] overflow-hidden cursor-pointer"
                  style={{ border: `2px solid ${templateId === t.id ? 'var(--accent)' : 'var(--border)'}`, background: 'transparent' }}>
                  <div className="h-[74px] flex items-center justify-center" style={{ background: t.swatch }}>
                    <span className="font-display font-extrabold text-[15px]"
                      style={{ color: t.swatchInk, letterSpacing: t.swatchTrack }}>Aa</span>
                  </div>
                  <div className="py-2 px-1.5 text-[12px] font-semibold text-center text-text-primary"
                    style={{ background: 'var(--bg-surface-2)' }}>{t.name}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Recipients */}
          <section className="border border-border rounded-[14px] p-[22px]" style={{ background: 'var(--bg-surface)' }}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="font-display font-bold text-base">Recipients</div>
              <span className="text-[13px] font-bold tabular" style={{ color: 'var(--accent-2)' }}>{recipientCount} people</span>
            </div>
            <p className="text-[13px] m-0 mb-4" style={{ color: 'var(--text-muted)' }}>
              Pick lists from your guest book, or add individuals.
            </p>
            {lists.length === 0 ? (
              <p className="text-[13px] italic m-0" style={{ color: 'var(--text-muted)' }}>
                No lists yet. <Link to="/host/guests" className="no-underline" style={{ color: 'var(--accent-2)' }}>Add contacts →</Link>
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {lists.map((l, i) => {
                  const on = selected.has(l.id)
                  return (
                    <button key={l.id} onClick={() => toggleList(l.id)} className="flex items-center gap-3 text-left px-[14px] py-3 rounded-[10px] cursor-pointer"
                      style={{ border: `1px solid ${on ? 'var(--accent-2)' : 'var(--border)'}`, background: on ? 'color-mix(in srgb,var(--accent-2) 12%, transparent)' : 'transparent' }}>
                      <span className="flex-none w-[11px] h-[11px] rounded-[3px]" style={{ background: LIST_COLORS[i % LIST_COLORS.length] }} />
                      <span className="flex-1 text-[14.5px] font-semibold text-text-primary">{l.name}</span>
                      <span className="text-[12.5px] tabular" style={{ color: 'var(--text-muted)' }}>{l.members.length}</span>
                      <span className="flex-none w-[22px] h-[22px] rounded-[6px] flex items-center justify-center text-[13px] font-bold"
                        style={{ border: `1.5px solid ${on ? 'var(--accent-2)' : 'var(--border)'}`, background: on ? 'var(--accent-2)' : 'transparent', color: '#260306' }}>
                        {on ? '✓' : ''}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* Note */}
          <section className="border border-border rounded-[14px] p-[22px]" style={{ background: 'var(--bg-surface)' }}>
            <div className="font-display font-bold text-base mb-[14px]">Your note</div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
              className="w-full rounded-[10px] border border-border text-text-primary font-sans text-[15px] leading-[1.55] px-4 py-3.5 outline-none resize-none"
              style={fld} />
            <div className="mt-2 text-[12px]" style={{ color: 'var(--text-muted)' }}>{note.length} characters</div>
          </section>
        </div>

        {/* RIGHT PREVIEW */}
        <div className="flex flex-col gap-4" style={{ position: 'sticky', top: 84 }}>
          <div className="text-[11px] tracking-[.22em] font-bold" style={{ color: 'var(--text-muted)' }}>
            {channel === 'email' ? 'EMAIL PREVIEW' : 'TEXT PREVIEW'}
          </div>

          {/* Email preview card */}
          {channel === 'email' && (
            <div className="overflow-hidden rounded-[14px] border border-border"
              style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-card)' }}>
              <div className="px-4 py-3 border-b border-border text-[12px]" style={{ color: 'var(--text-muted)' }}>
                <span className="font-semibold text-text-secondary">From</span> Black Cafe @ Marly's Yard
                {' · '}<span className="font-semibold text-text-secondary">Subj</span> You're invited to the yard
              </div>
              <div className="p-6 text-center" style={{ background: tpl.cardBg }}>
                <div className="flex justify-center mb-3">
                  <Crest size={64} showWord={false} double={false} ring={tpl.crest} vine={tpl.vine} leaf={tpl.leaf} />
                </div>
                <div className="text-[10.5px] tracking-[.3em] font-semibold mb-3.5" style={{ color: tpl.muted }}>
                  {tpl.eyebrow}
                </div>
                <div className="font-display leading-[1.05] mb-2.5"
                  style={{ fontWeight: tpl.weight, fontSize: 26, letterSpacing: tpl.track, color: tpl.ink }}>
                  {event.title}
                </div>
                <div className="text-[13px] mb-[18px] tabular" style={{ color: tpl.sub }}>
                  {fmtChip(event.starts_at, event.timezone)} · {event.location_name ?? 'TBA'}
                </div>
                {note && (
                  <div className="text-[13.5px] leading-[1.6] max-w-[280px] mx-auto mb-5" style={{ color: tpl.sub }}>
                    {note}
                  </div>
                )}
                <span className="inline-block font-bold text-[14px] px-7 py-3 rounded-[8px] text-white"
                  style={{ background: tpl.cta }}>
                  RSVP
                </span>
              </div>
            </div>
          )}

          {/* QR */}
          <div className="rounded-[14px] border border-border p-[18px] flex items-center gap-4"
            style={{ background: 'var(--bg-surface)' }}>
            <div className="flex-none rounded-[10px] p-[9px] leading-none" style={{ background: '#FAFBF5' }}>
              <canvas ref={canvasRef} width={116} height={116} style={{ display: 'block', width: 96, height: 96 }} />
            </div>
            <div>
              <div className="font-display font-bold text-[15px] mb-1">Event QR</div>
              <div className="text-[12.5px] leading-[1.5] mb-2" style={{ color: 'var(--text-muted)' }}>
                Print it, post it, drop it in a story.
              </div>
              <button onClick={downloadQR}
                className="border border-border text-text-primary font-sans text-[12.5px] font-semibold px-[14px] py-2 rounded-[8px] cursor-pointer"
                style={{ background: 'transparent' }}>
                Download PNG
              </button>
            </div>
          </div>

          {/* Send button */}
          <button onClick={handleSend} disabled={sending || recipientCount === 0}
            className="w-full text-white font-sans text-base font-bold py-4 rounded-[10px] cursor-pointer disabled:opacity-50"
            style={{ background: result?.configured ? 'var(--accent-2)' : 'var(--accent)', border: 'none', boxShadow: 'var(--shadow-card)' }}>
            {sending ? 'Sending…' : result?.configured ? `Sent to ${result.delivered} guests ✓` : `Send to ${recipientCount} guests`}
          </button>

          {/* Not configured notice */}
          {result && !result.configured && (
            <div className="rounded-[10px] px-4 py-[14px] text-[13.5px] leading-[1.55]"
              style={{ background: 'color-mix(in srgb,var(--candle) 14%, transparent)', border: '1px solid var(--candle)' }}>
              <strong style={{ color: 'var(--candle)' }}>Email isn't connected yet</strong> — set{' '}
              <code className="text-[12px]">SENDGRID_API_KEY</code> to start sending. Your invite is saved as a draft.
            </div>
          )}

          {/* Delivered stats */}
          {result?.configured && (
            <div className="grid grid-cols-2 gap-2.5 text-center">
              <div className="rounded-[10px] border border-border px-3 py-3" style={{ background: 'var(--bg-surface)' }}>
                <div className="font-display font-extrabold text-[20px] tabular" style={{ color: 'var(--accent-2)' }}>{result.delivered}</div>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Delivered</div>
              </div>
              <div className="rounded-[10px] border border-border px-3 py-3" style={{ background: 'var(--bg-surface)' }}>
                <div className="font-display font-extrabold text-[20px] tabular">68%</div>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Est. open rate</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
