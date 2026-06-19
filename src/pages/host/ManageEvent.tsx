import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ThemeToggle from '../../components/ThemeToggle'
import { downloadICS, googleCalUrl } from '../../lib/ics'
import {
  getEventById, updateEventDetails, confirmedCount,
  getDatePoll, addDateOption, lockDatePoll,
  getPotluckSlots, addPotluckSlot, toggleClaim,
  type DatePoll, type Slot,
} from '../../lib/manageEvent'
import type { EventRow } from '../../types/events'

const pad = (n: number) => String(n).padStart(2, '0')

function toInputs(iso: string | null) {
  if (!iso) return { date: '', time: '' }
  const d = new Date(iso)
  return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` }
}

const field: React.CSSProperties = { background: 'var(--field)' }
const inputCls = 'w-full border border-border text-text-primary font-sans text-[14px] px-[13px] py-[12px] rounded-[8px] outline-none'

export default function ManageEvent() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<EventRow | null>(null)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [place, setPlace] = useState('')
  const [notify, setNotify] = useState(true)
  const [savedFlash, setSavedFlash] = useState(false)
  const [goingN, setGoingN] = useState(0)
  const [poll, setPoll] = useState<DatePoll | null>(null)
  const [newOption, setNewOption] = useState('')
  const [addingOption, setAddingOption] = useState(false)
  const [slots, setSlots] = useState<Slot[]>([])
  const [newSlot, setNewSlot] = useState('')
  const [addingSlot, setAddingSlot] = useState(false)

  async function reload(eid: string) {
    const ev = await getEventById(eid)
    if (!ev) return
    setEvent(ev)
    setTitle(ev.title)
    const t = toInputs(ev.starts_at)
    setDate(t.date)
    setTime(t.time)
    setPlace(ev.location_name ?? '')
    setGoingN(await confirmedCount(eid))
    setPoll(await getDatePoll(eid))
    setSlots(await getPotluckSlots(eid))
  }

  useEffect(() => { if (id) reload(id) }, [id])

  if (!event) return <div className="min-h-screen bg-bg-page" />

  const orig = toInputs(event.starts_at)
  const dirty = title !== event.title || date !== orig.date || time !== orig.time || place !== (event.location_name ?? '')

  async function save() {
    if (!id) return
    const starts_at = date && time ? new Date(`${date}T${time}`).toISOString() : event!.starts_at
    await updateEventDetails(id, { title, starts_at, location_name: place || null })
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2500)
    await reload(id)
  }

  async function handleAddOption() {
    if (!poll || !newOption.trim()) return
    setAddingOption(true)
    try { await addDateOption(poll.id, newOption.trim(), poll.options.length); setNewOption(''); await reload(id!) }
    finally { setAddingOption(false) }
  }

  async function handleLock(optionId: string) {
    if (!poll) return
    await lockDatePoll(poll.id, optionId)
    await reload(id!)
  }

  async function handleAddSlot() {
    if (!newSlot.trim() || !id) return
    setAddingSlot(true)
    try { await addPotluckSlot(id, newSlot.trim()); setNewSlot(''); await reload(id) }
    finally { setAddingSlot(false) }
  }

  async function handleToggleClaim(slot: Slot) {
    await toggleClaim(slot, 'Host')
    await reload(id!)
  }

  const total = poll ? (poll.options.reduce((a, o) => a + o.votes, 0) || 1) : 1
  const leader = poll ? poll.options.slice().sort((a, b) => b.votes - a.votes)[0] ?? null : null
  const lockedOption = poll?.locked_option_id ? poll.options.find((o) => o.id === poll.locked_option_id) : null

  const claimedCount = slots.filter((s) => s.claimed_by_name).length

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
          <span className="text-[13px] font-semibold truncate max-w-[260px]">Manage · {event.title}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link to={`/e/${event.slug}`}
            className="border border-border text-text-secondary font-sans text-[13px] font-semibold px-4 py-[9px] rounded-[8px] no-underline">
            View event page
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[760px] px-7 pt-8 pb-[90px] flex flex-col gap-6">
        <div>
          <div className="text-[12px] tracking-[.2em] font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>MANAGE GATHERING</div>
          <h1 className="font-display font-extrabold text-[32px] tracking-[-0.02em] m-0">{event.title}</h1>
        </div>

        {/* EDIT DETAILS */}
        <section className="border border-border rounded-[14px] p-6" style={{ background: 'var(--bg-surface)' }}>
          <div className="font-display font-bold text-base mb-[18px]">Edit details</div>
          <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">Event name</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-border text-text-primary font-display font-semibold text-[17px] px-[15px] py-[13px] rounded-[9px] outline-none mb-4"
            style={field} />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} style={field} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputCls} style={field} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">Location</label>
              <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Venue name"
                className={inputCls} style={field} />
            </div>
          </div>

          {dirty && (
            <div className="mt-[18px] flex items-center justify-between gap-4 flex-wrap rounded-[10px] px-4 py-[14px]"
              style={{ background: 'color-mix(in srgb, var(--candle) 14%, transparent)', border: '1px solid var(--candle)' }}>
              <label className="flex items-center gap-2.5 cursor-pointer text-[13.5px] text-text-primary">
                <span onClick={() => setNotify((n) => !n)}
                  className="flex-none w-5 h-5 rounded-[6px] flex items-center justify-center text-[12px] font-bold cursor-pointer"
                  style={{ border: `1.5px solid ${notify ? 'var(--candle)' : 'var(--text-muted)'}`, background: notify ? 'var(--candle)' : 'transparent', color: '#260306' }}>
                  {notify ? '✓' : ''}
                </span>
                <span onClick={() => setNotify((n) => !n)}>Notify {goingN} confirmed guests of changes</span>
              </label>
              <button onClick={save}
                className="border-none text-white font-sans text-[14px] font-bold px-[22px] py-[11px] rounded-[8px] whitespace-nowrap cursor-pointer"
                style={{ background: 'var(--accent)' }}>
                {notify ? 'Save & notify' : 'Save changes'}
              </button>
            </div>
          )}

          {savedFlash && !dirty && (
            <div className="mt-[18px] text-[13.5px] font-semibold" style={{ color: 'var(--accent-2)' }}>
              ✓ Saved{notify ? ` · ${goingN} guests notified` : ''}
            </div>
          )}
        </section>

        {/* DATE POLL */}
        <section className="border border-border rounded-[14px] p-6" style={{ background: 'var(--bg-surface)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="font-display font-bold text-base">Date poll</div>
            <span className="text-[12.5px] tabular" style={{ color: 'var(--text-muted)' }}>
              {poll ? `${poll.options.reduce((a, o) => a + o.votes, 0)} votes` : ''}
            </span>
          </div>
          <p className="text-[13px] m-0 mb-[18px]" style={{ color: 'var(--text-muted)' }}>
            {!poll ? 'No date poll on this event.' : poll.status === 'locked' ? 'Date is locked in.' : "Guests voted when they RSVP'd."}
          </p>

          {poll && (
            <>
              {poll.options.length > 0 && (
                <div className="flex flex-col gap-3 mb-4">
                  {poll.options.map((o) => {
                    const isLeader = leader?.id === o.id
                    const pct = Math.round((o.votes / total) * 100)
                    return (
                      <div key={o.id}>
                        <div className="flex items-center justify-between mb-[7px]">
                          <span className="text-[14.5px] font-semibold flex items-center gap-2.5 whitespace-nowrap">
                            {o.label}
                            {isLeader && (
                              <span className="text-[10.5px] font-bold tracking-[.06em] px-2.5 py-0.5 rounded-pill whitespace-nowrap"
                                style={{ background: 'var(--candle)', color: '#260306' }}>
                                {poll.status === 'locked' ? 'Locked' : 'Leading'}
                              </span>
                            )}
                          </span>
                          <span className="text-[13px] tabular text-text-secondary">{o.votes} · {pct}%</span>
                        </div>
                        <div className="h-[10px] rounded-pill overflow-hidden" style={{ background: 'var(--field)' }}>
                          <span className="block h-full rounded-pill"
                            style={{ width: `${pct}%`, background: isLeader ? 'var(--accent-2)' : 'var(--text-muted)' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Add option */}
              <div className="flex gap-2.5 mb-4">
                <input value={newOption} onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                  placeholder="Add a date option — e.g. Fri, Jul 11"
                  className="flex-1 min-w-0 border border-border text-text-primary font-sans text-[14px] px-[14px] py-[11px] rounded-[8px] outline-none"
                  style={field} />
                <button onClick={handleAddOption} disabled={addingOption || !newOption.trim()}
                  className="border border-border text-text-primary font-sans text-[13px] font-semibold px-[18px] py-[11px] rounded-[8px] whitespace-nowrap disabled:opacity-50 cursor-pointer"
                  style={{ background: 'var(--bg-surface-2)' }}>
                  Add
                </button>
              </div>

              {poll.status === 'open' && leader && poll.options.length > 0 && (
                <button onClick={() => handleLock(leader.id)}
                  className="w-full font-sans text-[14px] font-bold px-3 py-3 rounded-[9px] cursor-pointer"
                  style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                  Lock in {leader.label}
                </button>
              )}

              {poll.status === 'locked' && (
                <div className="rounded-[9px] px-4 py-[13px] text-[14px] font-semibold"
                  style={{ background: 'color-mix(in srgb, var(--accent-2) 14%, transparent)', border: '1px solid var(--accent-2)', color: 'var(--accent-2)' }}>
                  ✓ Locked — {lockedOption?.label ?? leader?.label}. Guests notified.
                </div>
              )}
            </>
          )}
        </section>

        {/* POTLUCK */}
        <section className="border border-border rounded-[14px] p-6" style={{ background: 'var(--bg-surface)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="font-display font-bold text-base">Potluck sign-up</div>
            <span className="text-[12.5px] tabular" style={{ color: 'var(--text-muted)' }}>{claimedCount}/{slots.length} claimed</span>
          </div>
          <p className="text-[13px] m-0 mb-4" style={{ color: 'var(--text-muted)' }}>
            {slots.length === 0 ? 'No slots yet — add one below.' : "Guests claim what they'll bring. No double dips."}
          </p>

          {slots.length > 0 && (
            <div className="flex flex-col gap-[9px] mb-4">
              {slots.map((sl) => {
                const claimed = !!sl.claimed_by_name
                return (
                  <div key={sl.id} className="flex items-center gap-[13px] px-4 py-[13px] rounded-[11px]"
                    style={{
                      border: `1px solid ${claimed ? 'color-mix(in srgb, var(--accent-2) 40%, var(--border))' : 'var(--border)'}`,
                      background: claimed ? 'color-mix(in srgb, var(--accent-2) 9%, transparent)' : 'transparent',
                    }}>
                    <span className="flex-none w-[9px] h-[9px] rounded-full"
                      style={{ background: claimed ? 'var(--accent-2)' : 'var(--text-muted)' }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[14.5px] font-semibold">{sl.title}</div>
                      <div className="text-[12.5px]" style={{ color: 'var(--text-muted)' }}>
                        {claimed ? `Bringing: ${sl.claimed_by_name}` : 'Open · tap to claim'}
                      </div>
                    </div>
                    <button onClick={() => handleToggleClaim(sl)}
                      className="flex-none font-sans text-[12.5px] font-bold px-[15px] py-2 rounded-[8px] whitespace-nowrap cursor-pointer"
                      style={claimed
                        ? { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }
                        : { background: 'var(--accent)', border: '1px solid var(--accent)', color: '#fff' }}>
                      {claimed ? 'Claimed' : 'Claim'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex gap-2.5">
            <input value={newSlot} onChange={(e) => setNewSlot(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSlot()}
              placeholder="Add a slot — e.g. Dessert"
              className="flex-1 min-w-0 border border-border text-text-primary font-sans text-[14px] px-[14px] py-[11px] rounded-[8px] outline-none"
              style={field} />
            <button onClick={handleAddSlot} disabled={addingSlot || !newSlot.trim()}
              className="border border-border text-text-primary font-sans text-[13px] font-semibold px-[18px] py-[11px] rounded-[8px] whitespace-nowrap disabled:opacity-50 cursor-pointer"
              style={{ background: 'var(--bg-surface-2)' }}>
              Add
            </button>
          </div>
        </section>

        {/* ADD TO CALENDAR */}
        <section className="border border-border rounded-[14px] p-6" style={{ background: 'var(--bg-surface)' }}>
          <div className="font-display font-bold text-base mb-1.5">Add to calendar</div>
          <p className="text-[13px] m-0 mb-4" style={{ color: 'var(--text-muted)' }}>
            Sent with every confirmation — guests get a real calendar hold.
          </p>
          <div className="flex gap-2.5 flex-wrap">
            <button onClick={() => downloadICS(event)}
              className="flex items-center gap-2.5 border border-border text-text-primary font-sans text-[13.5px] font-semibold px-[18px] py-[11px] rounded-[9px] cursor-pointer"
              style={{ background: 'transparent' }}>
              <span className="text-[15px]"></span> Apple · .ics
            </button>
            <button onClick={() => window.open(googleCalUrl(event), '_blank', 'noopener')}
              className="flex items-center gap-2.5 border border-border text-text-primary font-sans text-[13.5px] font-semibold px-[18px] py-[11px] rounded-[9px] cursor-pointer"
              style={{ background: 'transparent' }}>
              Google Calendar
            </button>
          </div>
          <div className="mt-4 flex items-center gap-3 border border-border rounded-[9px] px-[15px] py-3 font-display text-[12.5px] text-text-secondary"
            style={field}>
            {event.slug}.ics
            <span className="ml-auto font-sans text-[11px]" style={{ color: 'var(--text-muted)' }}>{event.timezone}</span>
          </div>
        </section>
      </div>
    </div>
  )
}
