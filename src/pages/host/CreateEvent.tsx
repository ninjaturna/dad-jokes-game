import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ThemeToggle from '../../components/ThemeToggle'
import { useAuth } from '../../hooks/useAuth'
import { getHostGuests, createEvent, type GuestRow, type NewEventInput } from '../../lib/createEvent'

const TAGS = [
  { id: 'Black Cafe', dot: '#D96B43' },
  { id: 'Listening Session', dot: '#5DCAA5' },
  { id: 'Game Night', dot: '#E0A867' },
  { id: 'Supper Club', dot: '#A62F24' },
  { id: 'Garden Brunch', dot: '#A67244' },
]

const PAGE_TYPES = [
  { type: 'itinerary', title: 'Itinerary', icon: '◷' },
  { type: 'menu', title: 'Menu', icon: '🍽' },
  { type: 'tracklist', title: 'Track list', icon: '♫' },
  { type: 'games', title: 'Games', icon: '◆' },
  { type: 'custom', title: 'Custom', icon: '✎' },
]

const PAGE_ICONS: Record<string, string> = { itinerary: '◷', menu: '🍽', tracklist: '♫', games: '◆', custom: '✎' }
const GUEST_COLORS = ['#D96B43', '#5DCAA5', '#A67244', '#315955', '#A62F24', '#590242']
const AUD_MAP: Record<string, string> = { all: 'All ages', kid_friendly: 'Kid-friendly', adults: 'Adults only' }

function initials(name: string) { return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() }
function guestColor(i: number) { return GUEST_COLORS[i % GUEST_COLORS.length] }

const field: React.CSSProperties = { background: 'var(--field)' }
const inputCls = 'w-full border border-border text-text-primary font-sans text-[15px] px-4 py-[13px] rounded-[8px] outline-none'

export default function CreateEvent() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [guests, setGuests] = useState<GuestRow[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const [f, setF] = useState<NewEventInput>({
    title: '', date: '', time: '', timezone: 'America/New_York', place: '',
    tag: 'Supper Club', allowPlusOnes: true, plusMax: 1, audience: 'all',
    bringNote: '', wearNote: '', parkingNote: '',
    links: [{ label: '', url: '' }],
    polls: { dietary: true, date: false, potluck: false },
    infoPages: [],
  })

  function set<K extends keyof NewEventInput>(k: K, v: NewEventInput[K]) { setF((p) => ({ ...p, [k]: v })) }

  useEffect(() => { if (user) getHostGuests(user.id).then(setGuests) }, [user])

  const slugPreview = useMemo(() => {
    const base = f.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) || 'new'
    return `blackcafe.miami/e/${base}`
  }, [f.title])

  const whenLine = useMemo(() => {
    const parts: string[] = []
    if (f.date) {
      const d = new Date(f.date + 'T00:00:00')
      parts.push(new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(d))
    }
    if (f.time) {
      const [h, m] = f.time.split(':').map(Number)
      const d = new Date(); d.setHours(h, m, 0)
      parts.push(new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(d))
    }
    return parts.length ? parts.join(' · ') : 'Date & time'
  }, [f.date, f.time])

  function toggleGuest(id: string) {
    setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }
  function addInfoPage(pt: { type: string; title: string }) {
    setF((p) => p.infoPages.find((x) => x.type === pt.type) ? p : { ...p, infoPages: [...p.infoPages, pt] })
  }
  function setLink(i: number, k: 'label' | 'url', v: string) {
    setF((p) => ({ ...p, links: p.links.map((l, j) => j === i ? { ...l, [k]: v } : l) }))
  }

  async function save(publish: boolean) {
    if (!user) return
    setSaving(true)
    try {
      const ev = await createEvent(user.id, f, publish)
      navigate(publish ? `/e/${ev.slug}` : '/host')
    } finally { setSaving(false) }
  }

  const cat = TAGS.find((t) => t.id === f.tag) ?? TAGS[0]
  const pollsArr: string[] = []
  if (f.polls.dietary) pollsArr.push('dietary needs')
  if (f.polls.date) pollsArr.push('best date')
  if (f.polls.potluck) pollsArr.push("what they'll bring")
  const activeLinks = f.links.filter((l) => l.label.trim())

  const seg = (on: boolean): React.CSSProperties => ({
    border: `1.5px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
    background: on ? 'color-mix(in srgb, var(--accent) 18%, transparent)' : 'transparent',
  })
  const chk = (on: boolean): React.CSSProperties => ({
    border: `1.5px solid ${on ? 'var(--accent-2)' : 'var(--border)'}`,
    background: on ? 'var(--accent-2)' : 'transparent',
  })
  const pollRow = (on: boolean): React.CSSProperties => ({
    border: `1px solid ${on ? 'var(--accent-2)' : 'var(--border)'}`,
    background: on ? 'color-mix(in srgb, var(--accent-2) 12%, transparent)' : 'transparent',
  })

  return (
    <div className="min-h-screen text-text-primary" style={{ background: 'var(--bg-page)' }}>

      {/* Top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-4 px-7 py-[14px] border-b border-border"
        style={{ background: 'color-mix(in srgb, var(--bg-page) 84%, transparent)', backdropFilter: 'blur(14px)' }}>
        <div className="flex items-center gap-3.5">
          <Link to="/host" className="flex items-center gap-1.5 text-text-secondary text-[13px] no-underline">
            <span className="text-base">‹</span> Dashboard
          </Link>
          <span style={{ color: 'var(--border)' }}>/</span>
          <span className="text-[13px] font-semibold">New gathering</span>
        </div>
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <button onClick={() => save(false)} disabled={saving}
            className="border border-border text-text-secondary font-sans text-[13px] font-semibold px-4 py-[9px] rounded-[8px] disabled:opacity-60">
            Save draft
          </button>
          <button onClick={() => save(true)} disabled={saving}
            className="font-sans text-[13px] font-bold px-[18px] py-[9px] rounded-[8px] text-white border-none disabled:opacity-60"
            style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-card)' }}>
            Publish &amp; invite
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1180px] px-7 pt-8 pb-20"
        style={{ display: 'grid', gridTemplateColumns: '1fr 392px', gap: 36, alignItems: 'start' }}>

        {/* ─── FORM ─── */}
        <div className="flex flex-col gap-[26px] min-w-0">
          <div>
            <div className="text-[12px] tracking-[.2em] font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>CREATE A GATHERING</div>
            <h1 className="font-display font-extrabold text-[34px] tracking-[-0.02em] m-0">Set the table.</h1>
          </div>

          {/* BASICS */}
          <section className="border border-border rounded-[14px] p-6" style={{ background: 'var(--bg-surface)' }}>
            <div className="font-display font-bold text-base mb-[18px]">The basics</div>
            <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">Event name</label>
            <input value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Supper on the Patio"
              className="w-full border border-border text-text-primary font-display font-semibold text-[18px] px-4 py-[14px] rounded-[9px] outline-none mb-[18px]"
              style={field} />
            <div className="grid grid-cols-2 gap-[14px] mb-[18px]">
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">Date</label>
                <input type="date" value={f.date} onChange={(e) => set('date', e.target.value)} className={inputCls} style={field} />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">Time</label>
                <input type="time" value={f.time} onChange={(e) => set('time', e.target.value)} className={inputCls} style={field} />
              </div>
            </div>
            <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">Location</label>
            <input value={f.place} onChange={(e) => set('place', e.target.value)} placeholder="The Yard · Little Haiti, Miami"
              className={inputCls} style={field} />
          </section>

          {/* SERIES & TAGS */}
          <section className="border border-border rounded-[14px] p-6" style={{ background: 'var(--bg-surface)' }}>
            <div className="font-display font-bold text-base mb-1.5">Series &amp; tags</div>
            <p className="text-[13px] m-0 mb-4" style={{ color: 'var(--text-muted)' }}>Group it under a recurring series so guests know what they're walking into.</p>
            <div className="flex flex-wrap gap-2.5">
              {TAGS.map((t) => {
                const on = f.tag === t.id
                return (
                  <button key={t.id} onClick={() => set('tag', t.id)}
                    className="flex items-center gap-2 font-sans text-[14px] font-semibold px-4 py-2.5 rounded-pill cursor-pointer text-text-primary"
                    style={{ border: `1.5px solid ${on ? t.dot : 'var(--border)'}`, background: on ? `color-mix(in srgb, ${t.dot} 20%, transparent)` : 'transparent' }}>
                    <span className="w-[9px] h-[9px] rounded-full flex-none" style={{ background: t.dot }} />
                    {t.id}
                  </button>
                )
              })}
            </div>
          </section>

          {/* GUEST BOOK */}
          <section className="border border-border rounded-[14px] p-6" style={{ background: 'var(--bg-surface)' }}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="font-display font-bold text-base">Guest book</div>
              <span className="text-[13px] font-semibold tabular" style={{ color: 'var(--accent-2)' }}>{selected.size} selected</span>
            </div>
            <p className="text-[13px] m-0 mb-4" style={{ color: 'var(--text-muted)' }}>Tap to invite. New contacts from your phone are saved here automatically.</p>
            <div className="flex gap-2.5 mb-4 flex-wrap">
              <button disabled
                className="flex items-center gap-2 border border-border font-sans text-[13px] font-semibold px-[15px] py-2.5 rounded-[8px] opacity-40 cursor-not-allowed text-text-primary"
                style={{ background: 'var(--bg-surface-2)' }}>
                <span className="text-[15px]">↧</span> Import from Contacts
              </button>
              <button onClick={() => setSelected(new Set(guests.map((g) => g.id)))}
                className="border border-border text-text-secondary font-sans text-[13px] font-semibold px-[15px] py-2.5 rounded-[8px] cursor-pointer"
                style={{ background: 'transparent' }}>
                Select all
              </button>
            </div>
            <div className="flex flex-col gap-2 overflow-auto" style={{ maxHeight: 280 }}>
              {guests.length === 0 ? (
                <p className="text-[13px] py-2 m-0" style={{ color: 'var(--text-muted)' }}>No contacts yet — add them in Guests (coming soon).</p>
              ) : guests.map((g, i) => {
                const on = selected.has(g.id)
                return (
                  <button key={g.id} onClick={() => toggleGuest(g.id)}
                    className="flex items-center gap-[13px] text-left w-full px-[13px] py-2.5 rounded-[10px] font-sans cursor-pointer"
                    style={{ border: `1px solid ${on ? 'var(--accent-2)' : 'var(--border)'}`, background: on ? 'color-mix(in srgb, var(--accent-2) 12%, transparent)' : 'transparent' }}>
                    <span className="flex-none w-[34px] h-[34px] rounded-full flex items-center justify-center font-display font-bold text-white text-[13px]"
                      style={{ background: guestColor(i) }}>{initials(g.name)}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[14.5px] font-semibold text-text-primary">{g.name}</span>
                      <span className="block text-[12px]" style={{ color: 'var(--text-muted)' }}>{g.email ?? g.phone ?? ''}</span>
                    </span>
                    <span className="flex-none w-[22px] h-[22px] rounded-[6px] flex items-center justify-center text-[13px] font-bold"
                      style={{ ...chk(on), color: '#260306' }}>{on ? '✓' : ''}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* WHO CAN COME */}
          <section className="border border-border rounded-[14px] p-6" style={{ background: 'var(--bg-surface)' }}>
            <div className="font-display font-bold text-base mb-[18px]">Who can come</div>

            <div className="flex items-center justify-between py-[14px] border-b border-border">
              <div>
                <div className="font-semibold text-[15px]">Allow plus-ones</div>
                <div className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Guests can bring others</div>
              </div>
              <button onClick={() => set('allowPlusOnes', !f.allowPlusOnes)} className="relative flex-none cursor-pointer border-none"
                style={{ width: 52, height: 30, borderRadius: 999, background: f.allowPlusOnes ? 'var(--accent-2)' : 'var(--border)', transition: 'background .2s' }}>
                <span className="absolute top-[3px] rounded-full bg-white"
                  style={{ width: 24, height: 24, left: f.allowPlusOnes ? 25 : 3, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
              </button>
            </div>

            {f.allowPlusOnes && (
              <div className="flex items-center justify-between py-[14px] border-b border-border">
                <div>
                  <div className="font-semibold text-[15px]">Max per guest</div>
                  <div className="text-[13px]" style={{ color: 'var(--text-muted)' }}>How many extra they can add</div>
                </div>
                <div className="flex items-center gap-[14px]">
                  <button onClick={() => set('plusMax', Math.max(1, f.plusMax - 1))}
                    className="w-9 h-9 rounded-[9px] border border-border text-[18px] text-text-primary cursor-pointer" style={field}>–</button>
                  <span className="font-display font-bold text-[18px] min-w-[30px] text-center tabular">{f.plusMax}</span>
                  <button onClick={() => set('plusMax', Math.min(5, f.plusMax + 1))}
                    className="w-9 h-9 rounded-[9px] border border-border text-[18px] text-text-primary cursor-pointer" style={field}>+</button>
                </div>
              </div>
            )}

            <div className="pt-4 pb-1.5">
              <div className="font-semibold text-[15px] mb-3">Who's it for</div>
              <div className="grid grid-cols-3 gap-2.5">
                {(['all', 'kid_friendly', 'adults'] as const).map((a) => (
                  <button key={a} onClick={() => set('audience', a)}
                    className="font-sans font-semibold text-[14px] py-[14px] px-2 rounded-[10px] text-text-primary cursor-pointer"
                    style={seg(f.audience === a)}>
                    {AUD_MAP[a]}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ASK THE TABLE */}
          <section className="border border-border rounded-[14px] p-6" style={{ background: 'var(--bg-surface)' }}>
            <div className="font-display font-bold text-base mb-1.5">Ask the table</div>
            <p className="text-[13px] m-0 mb-4" style={{ color: 'var(--text-muted)' }}>Auto-polls run with every RSVP — no setup.</p>
            <div className="flex flex-col gap-2.5">
              {([
                { key: 'dietary', label: 'Dietary restrictions', sub: 'Allergies, veg, etc.' },
                { key: 'date', label: 'Date poll', sub: 'Let guests vote on the night' },
                { key: 'potluck', label: 'Potluck sign-up', sub: "Guests claim what they'll bring · manage slots after" },
              ] as const).map(({ key, label, sub }) => {
                const on = f.polls[key]
                return (
                  <button key={key} onClick={() => setF((p) => ({ ...p, polls: { ...p.polls, [key]: !p.polls[key] } }))}
                    className="text-left flex items-center gap-[13px] px-4 py-[14px] rounded-[10px] font-sans cursor-pointer"
                    style={pollRow(on)}>
                    <span className="flex-none w-[22px] h-[22px] rounded-[6px] flex items-center justify-center text-[13px] font-bold"
                      style={{ ...chk(on), color: '#260306' }}>{on ? '✓' : ''}</span>
                    <span>
                      <span className="block font-semibold text-[14.5px] text-text-primary">{label}</span>
                      <span className="block text-[12.5px]" style={{ color: 'var(--text-muted)' }}>{sub}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* INFO PAGES */}
          <section className="border border-border rounded-[14px] p-6" style={{ background: 'var(--bg-surface)' }}>
            <div className="font-display font-bold text-base mb-1.5">Info pages</div>
            <p className="text-[13px] m-0 mb-4" style={{ color: 'var(--text-muted)' }}>Add extra pages to the invite — itinerary, menu, track list, games.</p>
            {f.infoPages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3.5">
                {f.infoPages.map((p) => (
                  <span key={p.type} className="flex items-center gap-2 text-[13px] font-semibold px-3 py-2 rounded-pill text-text-primary"
                    style={{ background: 'color-mix(in srgb, var(--accent-2) 14%, transparent)' }}>
                    <span className="text-[14px]">{PAGE_ICONS[p.type]}</span>
                    {p.title}
                    <button onClick={() => setF((prev) => ({ ...prev, infoPages: prev.infoPages.filter((x) => x.type !== p.type) }))}
                      className="bg-transparent border-none text-[15px] p-0 leading-none cursor-pointer" style={{ color: 'var(--text-muted)' }}>×</button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {PAGE_TYPES.map((pt) => (
                <button key={pt.type} onClick={() => addInfoPage({ type: pt.type, title: pt.title })}
                  className="flex items-center gap-2 px-[14px] py-2.5 rounded-[9px] font-sans text-[13px] font-semibold text-text-primary cursor-pointer"
                  style={{ border: '1px dashed var(--border)', background: 'transparent' }}>
                  <span className="text-[14px]">{pt.icon}</span>{pt.title}
                </button>
              ))}
            </div>
          </section>

          {/* DETAILS & LINKS */}
          <section className="border border-border rounded-[14px] p-6" style={{ background: 'var(--bg-surface)' }}>
            <div className="font-display font-bold text-base mb-1.5">Details &amp; links</div>
            <p className="text-[13px] m-0 mb-4" style={{ color: 'var(--text-muted)' }}>Registry, playlist, menu — anything worth a tap.</p>
            <div className="flex flex-col gap-2.5 mb-3.5">
              {f.links.map((l, i) => (
                <div key={i} className="flex gap-2.5 items-center">
                  <input value={l.label} onChange={(e) => setLink(i, 'label', e.target.value)} placeholder="Label"
                    className="flex-none border border-border text-text-primary font-sans text-[14px] px-[13px] py-[11px] rounded-[8px] outline-none"
                    style={{ width: 130, ...field }} />
                  <input value={l.url} onChange={(e) => setLink(i, 'url', e.target.value)} placeholder="https://"
                    className="flex-1 min-w-0 border border-border text-text-primary font-sans text-[14px] px-[13px] py-[11px] rounded-[8px] outline-none"
                    style={field} />
                  <button onClick={() => setF((p) => ({ ...p, links: p.links.filter((_, j) => j !== i) }))}
                    className="flex-none w-[38px] h-[38px] rounded-[8px] border border-border text-[16px] cursor-pointer"
                    style={{ background: 'transparent', color: 'var(--text-muted)' }}>×</button>
                </div>
              ))}
            </div>
            <button onClick={() => setF((p) => ({ ...p, links: [...p.links, { label: '', url: '' }] }))}
              className="w-full font-sans text-[13px] font-semibold px-4 py-[11px] rounded-[8px] text-text-secondary cursor-pointer mb-5"
              style={{ border: '1px dashed var(--border)', background: 'transparent' }}>
              + Add a link
            </button>
            <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">Parking &amp; arrival</label>
            <textarea value={f.parkingNote} onChange={(e) => set('parkingNote', e.target.value)} rows={3}
              placeholder="Street parking on NE 2nd. Gate code 1948 — come round the back."
              className="w-full border border-border text-text-primary font-sans text-[14.5px] leading-[1.5] px-[15px] py-[13px] rounded-[8px] outline-none resize-none mb-4"
              style={field} />
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">What to bring</label>
                <input value={f.bringNote} onChange={(e) => set('bringNote', e.target.value)} placeholder="A bottle of wine"
                  className="w-full border border-border text-text-primary font-sans text-[14px] px-[13px] py-[11px] rounded-[8px] outline-none"
                  style={field} />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">What to wear</label>
                <input value={f.wearNote} onChange={(e) => set('wearNote', e.target.value)} placeholder="Cocktail attire"
                  className="w-full border border-border text-text-primary font-sans text-[14px] px-[13px] py-[11px] rounded-[8px] outline-none"
                  style={field} />
              </div>
            </div>
          </section>
        </div>

        {/* ─── PREVIEW ─── */}
        <div className="flex flex-col gap-4" style={{ position: 'sticky', top: 84 }}>
          <div className="text-[11px] tracking-[.22em] font-bold" style={{ color: 'var(--text-muted)' }}>LIVE PREVIEW</div>

          <div className="border border-border rounded-[16px] overflow-hidden" style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-card)' }}>
            {/* image strip with tag */}
            <div className="relative h-[118px]"
              style={{ background: 'repeating-linear-gradient(135deg, var(--bg-surface-2), var(--bg-surface-2) 11px, color-mix(in srgb, var(--bg-surface-2) 70%, #000) 11px, color-mix(in srgb, var(--bg-surface-2) 70%, #000) 22px)' }}>
              <div className="absolute top-3.5 left-3.5 flex items-center gap-2 text-[11px] font-bold tracking-[.06em] px-3 py-1.5 rounded-pill whitespace-nowrap text-text-primary"
                style={{ background: `color-mix(in srgb, ${cat.dot} 22%, transparent)` }}>
                <span className="w-2 h-2 rounded-full" style={{ background: cat.dot }} />
                {cat.id}
              </div>
            </div>

            <div className="px-[22px] pt-[22px] pb-6">
              <div className="text-[11px] tracking-[.16em] font-bold mb-2 tabular" style={{ color: 'var(--accent)' }}>{whenLine}</div>
              <h2 className="font-display font-extrabold text-2xl tracking-[-0.01em] m-0 mb-1 text-text-primary">
                {f.title.trim() || 'Untitled gathering'}
              </h2>
              <div className="text-[13.5px] mb-4 text-text-secondary">{f.place.trim() || 'Location TBD'}</div>

              <div className="flex gap-2 flex-wrap mb-4">
                {[AUD_MAP[f.audience], f.allowPlusOnes ? `+${f.plusMax} allowed` : 'No plus-ones', `${selected.size} invited`].map((badge) => (
                  <span key={badge} className="text-[11.5px] font-semibold px-[11px] py-[5px] rounded-pill whitespace-nowrap text-text-secondary"
                    style={{ background: 'var(--bg-surface-2)' }}>{badge}</span>
                ))}
              </div>

              {pollsArr.length > 0 && (
                <div className="text-[12px] border-t border-border pt-[13px] mb-2.5" style={{ color: 'var(--text-muted)' }}>
                  Will ask: {pollsArr.join(' · ')}
                </div>
              )}
              {f.infoPages.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mb-2.5">
                  {f.infoPages.map((p) => (
                    <span key={p.type} className="text-[11.5px] font-semibold px-2.5 py-1 rounded-pill whitespace-nowrap text-text-secondary"
                      style={{ background: 'var(--bg-surface-2)' }}>{PAGE_ICONS[p.type]} {p.title}</span>
                  ))}
                </div>
              )}
              {activeLinks.length > 0 && (
                <div className="flex flex-col gap-1.5 mb-2.5">
                  {activeLinks.map((l) => (
                    <span key={l.label} className="text-[13px] font-semibold" style={{ color: 'var(--accent-2)' }}>↗ {l.label}</span>
                  ))}
                </div>
              )}
              {f.parkingNote.trim() && (
                <div className="text-[12.5px] leading-[1.5] border-t border-border pt-[13px] text-text-secondary">
                  <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>Parking · </span>{f.parkingNote}
                </div>
              )}
            </div>
          </div>

          {/* Share card */}
          <div className="border border-border rounded-[14px] p-[18px]" style={{ background: 'var(--bg-surface)' }}>
            <div className="text-[12px] font-semibold text-text-secondary mb-2.5">Shareable link</div>
            <div className="flex gap-2">
              <div className="flex-1 min-w-0 border border-border rounded-[8px] px-[13px] py-[11px] font-display text-[13.5px] text-text-secondary overflow-hidden text-ellipsis whitespace-nowrap"
                style={field}>{slugPreview}</div>
              <button onClick={() => {
                navigator.clipboard.writeText(`https://${slugPreview}`)
                setCopied(true)
                setTimeout(() => setCopied(false), 1600)
              }} className="flex-none text-white font-sans text-[13px] font-bold px-4 py-[11px] rounded-[8px] border-none whitespace-nowrap cursor-pointer"
                style={{ background: 'var(--accent)' }}>
                {copied ? 'Copied ✓' : 'Copy'}
              </button>
            </div>
            <div className="text-[11.5px] mt-2.5" style={{ color: 'var(--text-muted)' }}>
              Opens the event page only — guests RSVP without an account.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
