import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ThemeToggle from '../../components/ThemeToggle'
import { getEventById } from '../../lib/manageEvent'
import {
  getInfoPages, addInfoPage, updateInfoPage, deleteInfoPage,
  INFO_TYPES,
  type InfoItem, type InfoPageRow, type InfoType,
} from '../../lib/infoPages'

// ── type-specific preview renderers ──────────────────────────────────────────

function ItineraryPreview({ items }: { items: InfoItem[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map((r, i) => (
        <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: 18 }}>
          <div style={{ flex: 'none', width: 62, textAlign: 'right', fontFamily: 'Archivo', fontWeight: 700, fontSize: 12.5, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums', paddingTop: 1 }}>
            {r.a || '—'}
          </div>
          <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--accent-2)', marginTop: 3, flexShrink: 0, display: 'block' }} />
            {i < items.length - 1 && <span style={{ flex: 1, width: 1.5, background: 'var(--border)', marginTop: 3, display: 'block' }} />}
          </div>
          <div style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.4 }}>{r.b}</div>
        </div>
      ))}
    </div>
  )
}

function TracklistPreview({ items }: { items: InfoItem[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      {items.map((r, i) => (
        <div key={i} style={{ display: 'flex', gap: 13, alignItems: 'baseline' }}>
          <span style={{ flex: 'none', fontFamily: 'Archivo', fontWeight: 800, fontSize: 14, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', width: 22 }}>
            {String(i + 1).padStart(2, '0')}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>{r.a || '—'}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{r.b}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function MenuPreview({ items }: { items: InfoItem[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {items.map((r, i) => (
        <div key={i} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: 'var(--accent)', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>
            {r.a || '—'}
          </div>
          <div style={{ fontFamily: 'Archivo', fontWeight: 600, fontSize: 16 }}>{r.b}</div>
        </div>
      ))}
    </div>
  )
}

function GamesPreview({ items }: { items: InfoItem[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      {items.map((r, i) => (
        <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '11px 13px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <span style={{ flex: 'none', color: 'var(--accent-2)', fontSize: 14 }}>◆</span>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>{r.a || '—'}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{r.b}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function CustomPreview({ items }: { items: InfoItem[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {items.map((r, i) => (
        <div key={i}>
          <div style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: 15, marginBottom: 5 }}>{r.a || '—'}</div>
          <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{r.b}</div>
        </div>
      ))}
    </div>
  )
}

function renderPagePreview(page: InfoPageRow) {
  const items = page.body.items.filter((it) => it.a || it.b)
  if (items.length === 0) return null
  switch (page.type) {
    case 'itinerary': return <ItineraryPreview items={items} />
    case 'tracklist': return <TracklistPreview items={items} />
    case 'menu': return <MenuPreview items={items} />
    case 'games': return <GamesPreview items={items} />
    case 'custom': return <CustomPreview items={items} />
  }
}

// ── main component ────────────────────────────────────────────────────────────

const fld: React.CSSProperties = { background: 'var(--field)' }
const inp = 'border border-border text-text-primary font-sans text-[14px] px-[12px] py-[11px] rounded-[8px] outline-none'

export default function InfoPages() {
  const { eventId } = useParams<{ eventId: string }>()
  const [pages, setPages] = useState<InfoPageRow[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [eventTitle, setEventTitle] = useState('')

  const active = pages.find((p) => p.id === activeId) ?? null
  const tpl = active ? INFO_TYPES[active.type] : null

  useEffect(() => {
    if (!eventId) return
    getInfoPages(eventId).then((ps) => {
      setPages(ps)
      if (ps.length > 0) setActiveId(ps[0].id)
    })
    getEventById(eventId).then((ev) => { if (ev) setEventTitle(ev.title) })
  }, [eventId])

  // autosave: 600ms debounce on active page changes
  useEffect(() => {
    if (!active) return
    const t = setTimeout(() => {
      void updateInfoPage(active.id, { title: active.title, body: { items: active.body.items } })
    }, 600)
    return () => clearTimeout(t)
  }, [active])

  async function reload() {
    if (!eventId) return
    const ps = await getInfoPages(eventId)
    setPages(ps)
  }

  async function handleAdd(type: InfoType) {
    if (!eventId) return
    const id = await addInfoPage(eventId, type, INFO_TYPES[type].name, pages.length)
    await reload()
    setActiveId(id)
  }

  async function handleDelete(id: string) {
    await deleteInfoPage(id)
    const remaining = pages.filter((p) => p.id !== id)
    setActiveId(remaining[0]?.id ?? null)
    await reload()
  }

  // local state mutations — autosave picks them up
  function setTitle(val: string) {
    setPages((prev) => prev.map((p) => p.id !== activeId ? p : { ...p, title: val }))
  }
  function setA(idx: number, val: string) {
    setPages((prev) => prev.map((p) => p.id !== activeId ? p : {
      ...p, body: { items: p.body.items.map((it, i) => i === idx ? { ...it, a: val } : it) },
    }))
  }
  function setB(idx: number, val: string) {
    setPages((prev) => prev.map((p) => p.id !== activeId ? p : {
      ...p, body: { items: p.body.items.map((it, i) => i === idx ? { ...it, b: val } : it) },
    }))
  }
  function removeItem(idx: number) {
    setPages((prev) => prev.map((p) => p.id !== activeId ? p : {
      ...p, body: { items: p.body.items.filter((_, i) => i !== idx) },
    }))
  }
  function addItem() {
    setPages((prev) => prev.map((p) => p.id !== activeId ? p : {
      ...p, body: { items: [...p.body.items, { a: '', b: '' }] },
    }))
  }

  const tabChips = pages.map((p) => ({ id: p.id, title: p.title || INFO_TYPES[p.type].name }))

  return (
    <div className="min-h-screen text-text-primary" style={{ background: 'var(--bg-page)' }}>

      {/* top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border px-7 py-[14px]"
        style={{ background: 'color-mix(in srgb, var(--bg-page) 84%, transparent)', backdropFilter: 'blur(14px)' }}>
        <div className="flex items-center gap-3.5">
          <Link to={`/host/event/${eventId}`} className="flex items-center gap-1.5 text-text-secondary text-[13px] no-underline">
            <span className="text-base">‹</span> Manage
          </Link>
          <span style={{ color: 'var(--border)' }}>/</span>
          <span className="text-[13px] font-semibold">Info pages{eventTitle ? ` · ${eventTitle}` : ''}</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="mx-auto" style={{ maxWidth: 1180, padding: '30px 28px 80px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 28, alignItems: 'start' }}>

        {/* ── LEFT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* pages list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <div className="text-[12px] tracking-[.2em] font-semibold mb-[6px]" style={{ color: 'var(--text-muted)' }}>ATTACHED PAGES</div>
              <h1 className="font-display font-extrabold text-[24px] tracking-[-0.01em] m-0">Add a page</h1>
            </div>

            {pages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {pages.map((p) => {
                  const t = INFO_TYPES[p.type]
                  const isActive = p.id === activeId
                  return (
                    <button key={p.id} onClick={() => setActiveId(p.id)}
                      className="flex items-center gap-[12px] text-left px-[15px] py-[13px] rounded-[11px] cursor-pointer"
                      style={{
                        border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                        background: isActive ? 'color-mix(in srgb, var(--accent) 14%, transparent)' : 'var(--bg-surface)',
                        fontFamily: 'inherit',
                      }}>
                      <span className="flex-none w-[34px] h-[34px] rounded-[9px] flex items-center justify-center text-[16px]"
                        style={{ background: isActive ? 'color-mix(in srgb, var(--accent) 26%, transparent)' : 'var(--bg-surface-2)' }}>
                        {t.icon}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[14px] font-semibold text-text-primary overflow-hidden text-ellipsis whitespace-nowrap">
                          {p.title || t.name}
                        </span>
                        <span className="block text-[11.5px]" style={{ color: 'var(--text-muted)' }}>
                          {t.name} · {p.body.items.length} rows
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* new page type buttons */}
            <div className="border-t border-border pt-4">
              <div className="text-[11px] tracking-[.16em] font-semibold mb-[11px]" style={{ color: 'var(--text-muted)' }}>NEW PAGE</div>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(INFO_TYPES) as InfoType[]).map((type) => {
                  const t = INFO_TYPES[type]
                  return (
                    <button key={type} onClick={() => handleAdd(type)}
                      className="flex items-center gap-[9px] text-left px-[12px] py-[11px] rounded-[9px] text-text-primary font-sans text-[13px] font-semibold cursor-pointer"
                      style={{ border: '1px dashed var(--border)', background: 'transparent' }}>
                      <span className="text-[15px]">{t.icon}</span>{t.name}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* editor */}
          {active && tpl ? (
            <div className="border border-border rounded-[14px] p-6" style={{ background: 'var(--bg-surface)' }}>
              <div className="flex items-center justify-between gap-3 mb-[18px]">
                <div className="flex items-center gap-[10px]">
                  <span className="text-[18px]">{tpl.icon}</span>
                  <span className="text-[12px] tracking-[.16em] font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>{tpl.name}</span>
                </div>
                <button onClick={() => handleDelete(active.id)}
                  className="font-sans text-[13px] font-semibold cursor-pointer"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
                  Delete page
                </button>
              </div>

              <input value={active.title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Page title"
                className="w-full border border-border text-text-primary font-display font-bold text-[20px] px-[16px] py-[13px] rounded-[10px] outline-none mb-5"
                style={fld} />

              <div className="flex items-center gap-[10px] mb-[10px] text-[11px] tracking-[.12em] font-semibold" style={{ color: 'var(--text-muted)' }}>
                <span className="flex-none w-[118px]">{tpl.aLabel}</span>
                <span className="flex-1">{tpl.bLabel}</span>
                <span className="flex-none w-[38px]" />
              </div>

              <div className="flex flex-col gap-[9px] mb-[14px]">
                {active.body.items.map((it, i) => (
                  <div key={i} className="flex gap-[9px] items-center">
                    <input value={it.a} onChange={(e) => setA(i, e.target.value)}
                      placeholder={tpl.aPh}
                      className={`flex-none w-[118px] ${inp}`} style={fld} />
                    <input value={it.b} onChange={(e) => setB(i, e.target.value)}
                      placeholder={tpl.bPh}
                      className={`flex-1 min-w-0 ${inp}`} style={fld} />
                    <button onClick={() => removeItem(i)}
                      className="flex-none w-[38px] h-[38px] rounded-[8px] border border-border flex items-center justify-center text-[16px] cursor-pointer"
                      style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={addItem}
                className="w-full font-sans text-[13px] font-semibold px-3 py-[12px] rounded-[8px] cursor-pointer"
                style={{ background: 'transparent', border: '1px dashed var(--border)', color: 'var(--text-secondary)' }}>
                + Add row
              </button>
            </div>
          ) : (
            <div className="text-center px-6 py-[80px] rounded-[14px]" style={{ border: '1px dashed var(--border)' }}>
              <div className="font-display font-bold text-[22px] mb-2">Add a page to the invite.</div>
              <div className="text-[14px] max-w-[340px] mx-auto leading-[1.55]" style={{ color: 'var(--text-muted)' }}>
                Itinerary for a weekend trip, a menu for dinner, the track list for a listening session — pick a type to start.
              </div>
            </div>
          )}
        </div>

        {/* ── PHONE PREVIEW ── */}
        <div style={{ position: 'sticky', top: 84, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="text-[11px] tracking-[.22em] font-bold" style={{ color: 'var(--text-muted)' }}>ON THE INVITE</div>
          <div className="border border-border rounded-[26px] p-3" style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-card)' }}>
            <div className="rounded-[18px] overflow-hidden border border-border" style={{ background: 'var(--bg-page)' }}>
              {/* mini event header */}
              <div className="px-[18px] py-4 border-b border-border" style={{ background: 'var(--bg-surface-2)' }}>
                <div className="text-[10px] tracking-[.16px] font-bold tabular" style={{ color: 'var(--accent)' }}>
                  {eventTitle.toUpperCase() || 'THE EVENT'}
                </div>
              </div>

              {/* tab strip */}
              <div className="flex gap-[7px] px-[14px] py-3 overflow-hidden border-b border-border">
                <span className="text-[11px] font-bold px-[11px] py-[5px] rounded-pill text-white whitespace-nowrap" style={{ background: 'var(--accent)' }}>Details</span>
                {tabChips.map((tc) => (
                  <span key={tc.id} className="text-[11px] font-semibold px-[11px] py-[5px] rounded-pill border border-border whitespace-nowrap" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
                    {tc.title}
                  </span>
                ))}
              </div>

              {/* content */}
              <div className="px-[18px] py-5" style={{ minHeight: 300 }}>
                {active ? (
                  <>
                    <div className="font-display font-extrabold text-[21px] tracking-[-0.01em] mb-[18px]">
                      {active.title || tpl?.name}
                    </div>
                    {renderPagePreview(active) ?? (
                      <div className="text-center pt-[60px] text-[13px]" style={{ color: 'var(--text-muted)' }}>
                        Add rows to preview.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center pt-[90px] text-[13px]" style={{ color: 'var(--text-muted)' }}>
                    Your page will preview here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
