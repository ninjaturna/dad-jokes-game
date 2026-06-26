import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ThemeToggle from '../../components/ThemeToggle'
import { downloadICS, googleCalUrl } from '../../lib/ics'
import {
  getEventById, updateEventDetails, confirmedCount,
  getDatePoll, addDateOption, lockDatePoll, createDatePoll,
  getPotluckSlots, addPotluckSlot, toggleClaim, updatePotluckEnabled,
  uploadEventImage,
  type DatePoll, type Slot,
} from '../../lib/manageEvent'
import { sendReminder } from '../../lib/invites'
import { useAuth } from '../../hooks/useAuth'
import { getHostLocations, getVenues, createVenue, type Venue } from '../../lib/host'
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
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [place, setPlace] = useState('')
  const [visibility, setVisibility] = useState<'private' | 'unlisted' | 'public'>('unlisted')
  const [notify, setNotify] = useState(true)
  const [notifyMessage, setNotifyMessage] = useState('')
  const [savedFlash, setSavedFlash] = useState(false)
  const [autoSaveState, setAutoSaveState] = useState<'idle' | 'pending' | 'saving' | 'saved'>('idle')
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const formRef = useRef({ title: '', description: '', date: '', startTime: '', endTime: '', place: '', visibility: 'unlisted' as 'private' | 'unlisted' | 'public', rsvpBy: '', allowPlusOnes: true, plusMax: 1, audience: 'adults' as 'all' | 'kid_friendly' | 'adults', hostedBy: '' })
  const dirtyRef = useRef(false)
  const eventRef = useRef<EventRow | null>(null)
  const [goingN, setGoingN] = useState(0)
  const [poll, setPoll] = useState<DatePoll | null>(null)
  const [newOption, setNewOption] = useState('')
  const [addingOption, setAddingOption] = useState(false)
  const [enablingPoll, setEnablingPoll] = useState(false)
  const [slots, setSlots] = useState<Slot[]>([])
  const [newSlot, setNewSlot] = useState('')
  const [addingSlot, setAddingSlot] = useState(false)
  const [enablingPotluck, setEnablingPotluck] = useState(false)
  const [publishSaving, setPublishSaving] = useState(false)
  const [_locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [rsvpBy, setRsvpBy] = useState('')
  const [allowPlusOnes, setAllowPlusOnes] = useState(true)
  const [plusMax, setPlusMax] = useState(1)
  const [audience, setAudience] = useState<'all' | 'kid_friendly' | 'adults'>('all')
  const [hostedBy, setHostedBy] = useState('')
  const [imageUploading, setImageUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const imgInputRef = useRef<HTMLInputElement>(null)
  const locationInputRef = useRef<HTMLInputElement>(null)
  const [venues, setVenues] = useState<Venue[]>([])
  const [venueId, setVenueId] = useState('__custom__')
  const [showAddVenue, setShowAddVenue] = useState(false)
  const [newVenueName, setNewVenueName] = useState('')
  const [newVenueAddress, setNewVenueAddress] = useState('')
  const [addingVenue, setAddingVenue] = useState(false)
  const [reminderState, setReminderState] = useState<'idle' | 'sending'>('idle')
  const [reminderResult, setReminderResult] = useState<{ configured: boolean; delivered: number } | null>(null)

  const { user } = useAuth()
  useEffect(() => {
    if (!user) return
    getHostLocations(user.id).then(setLocationSuggestions)
    getVenues(user.id).then(setVenues)
  }, [user])

  // Google Maps Places autocomplete on the location input
  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_KEY
    if (!key) return
    function init() {
      if (!locationInputRef.current) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ac = new (window as any).google.maps.places.Autocomplete(locationInputRef.current, {
        types: ['establishment', 'geocode'],
        fields: ['formatted_address', 'name'],
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ac.addListener('place_changed', () => { const p = ac.getPlace() as any; setPlace(p.name || p.formatted_address || '') })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).google?.maps?.places) { init(); return }
    if (document.getElementById('gm-places-script')) return
    const s = document.createElement('script')
    s.id = 'gm-places-script'
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`
    s.async = true
    s.onload = init
    document.head.appendChild(s)
  }, [])

  async function reload(eid: string) {
    const ev = await getEventById(eid)
    if (!ev) return
    setEvent(ev)
    setTitle(ev.title)
    setDescription(ev.description ?? '')
    const t = toInputs(ev.starts_at)
    setDate(t.date)
    setStartTime(t.time)
    setEndTime(toInputs(ev.ends_at).time)
    setPlace(ev.location_name ?? '')
    setVisibility(ev.visibility)
    setRsvpBy(ev.rsvp_by ?? '')
    setAllowPlusOnes(ev.allow_plus_ones)
    setPlusMax(ev.plus_one_max)
    setAudience(ev.audience)
    setHostedBy(ev.hosted_by ?? '')
    setGoingN(await confirmedCount(eid))
    setPoll(await getDatePoll(eid))
    setSlots(await getPotluckSlots(eid))
  }

  useEffect(() => { if (id) reload(id) }, [id])

  // Null-safe dirty check (needed before early return so auto-save useEffect can reference it)
  const dirty = !!event && (
    title !== event.title || description !== (event.description ?? '') ||
    date !== toInputs(event.starts_at).date || startTime !== toInputs(event.starts_at).time ||
    endTime !== toInputs(event.ends_at).time || place !== (event.location_name ?? '') ||
    visibility !== event.visibility || rsvpBy !== (event.rsvp_by ?? '') ||
    allowPlusOnes !== event.allow_plus_ones || plusMax !== event.plus_one_max ||
    audience !== event.audience || hostedBy !== (event.hosted_by ?? '')
  )

  // Keep refs current every render (safe to assign in render body)
  formRef.current = { title, description, date, startTime, endTime, place, visibility, rsvpBy, allowPlusOnes, plusMax, audience, hostedBy }
  dirtyRef.current = dirty
  eventRef.current = event

  // Auto-save: 800ms debounce. No cleanup → timer fires even if component unmounts during navigation.
  // (clearTimeout inside effect body still debounces rapid changes; cleanup was only ever harmful on unmount)
  useEffect(() => {
    if (!dirty || !id || !event) return
    setAutoSaveState('pending')
    clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => { void doSave() }, 800)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, date, startTime, endTime, place, visibility, rsvpBy, allowPlusOnes, plusMax, audience, hostedBy, dirty])

  // Belt-and-suspenders: also save immediately on unmount if still dirty
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (dirtyRef.current) { clearTimeout(autoSaveTimer.current); void doSave() } }, [])

  // Sync venueId when event and venues are both loaded
  useEffect(() => {
    if (!event || !venues.length) return
    const match = venues.find((v) => v.name === event.location_name)
    setVenueId(match?.id ?? '__custom__')
  }, [event, venues])

  function handleVenueChange(id: string) {
    if (id === '__add__') { setShowAddVenue(true); setNewVenueName(place); return }
    setVenueId(id); setShowAddVenue(false)
    if (id === '__custom__') return
    const v = venues.find((v) => v.id === id)
    if (v) setPlace(v.name)
  }

  async function handleAddVenue() {
    if (!user || !newVenueName.trim()) return
    setAddingVenue(true)
    try {
      const v = await createVenue(user.id, newVenueName, newVenueAddress)
      setVenues((prev) => [...prev, v].sort((a, b) => a.name.localeCompare(b.name)))
      setVenueId(v.id); setPlace(v.name)
      setShowAddVenue(false); setNewVenueName(''); setNewVenueAddress('')
    } finally { setAddingVenue(false) }
  }

  async function doSave() {
    const ev = eventRef.current
    if (!id || !ev) return
    const f = formRef.current
    setAutoSaveState('saving')
    try {
      const starts_at = f.date && f.startTime ? new Date(`${f.date}T${f.startTime}`).toISOString() : ev.starts_at
      const ends_at = f.date && f.endTime ? new Date(`${f.date}T${f.endTime}`).toISOString() : null
      const updates = { title: f.title || ev.title, description: f.description.trim() || null, starts_at, ends_at, location_name: f.place || null, visibility: f.visibility, rsvp_by: f.rsvpBy || null, allow_plus_ones: f.allowPlusOnes, plus_one_max: f.plusMax, audience: f.audience, hosted_by: f.hostedBy || null }
      await updateEventDetails(id, updates)
      setEvent((e) => e ? { ...e, ...updates } : e)
      setAutoSaveState('saved')
      setTimeout(() => setAutoSaveState('idle'), 2000)
    } catch (err) {
      console.error('Save failed:', err)
      setAutoSaveState('idle')
      setUploadError(err instanceof Error ? err.message : 'Save failed — please try again.')
    }
  }

  if (!event) return <div className="min-h-screen bg-bg-page" />

  async function handlePublish() {
    if (!id) return
    setPublishSaving(true)
    try { await updateEventDetails(id, { status: 'published', visibility }); await reload(id) }
    finally { setPublishSaving(false) }
  }

  async function handleUnpublish() {
    if (!id) return
    setPublishSaving(true)
    try { await updateEventDetails(id, { status: 'draft' }); await reload(id) }
    finally { setPublishSaving(false) }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !id) return
    e.target.value = ''
    setImageUploading(true)
    setUploadError('')
    try {
      await uploadEventImage(id, file)
      await reload(id)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed — try a smaller file.')
    } finally { setImageUploading(false) }
  }

  async function handleSendReminder() {
    if (!id) return
    setReminderState('sending')
    try {
      const res = await sendReminder(id)
      setReminderResult(res)
    } finally { setReminderState('idle') }
  }

  async function save() {
    if (!id) return
    clearTimeout(autoSaveTimer.current)
    await doSave()
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2500)
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

  async function handleEnablePoll() {
    if (!id) return
    setEnablingPoll(true)
    try { await createDatePoll(id); await reload(id) }
    finally { setEnablingPoll(false) }
  }

  async function handleEnablePotluck() {
    if (!id) return
    setEnablingPotluck(true)
    try { await updatePotluckEnabled(id, true); await reload(id) }
    finally { setEnablingPotluck(false) }
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
          <Link to={`/host/invites/${id}`}
            className="border border-border text-text-secondary font-sans text-[13px] font-semibold px-4 py-[9px] rounded-[8px] no-underline">
            Preview invite
          </Link>
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

        {/* PUBLISH CONTROL */}
        <section className="border border-border rounded-[14px] p-6" style={{ background: 'var(--bg-surface)' }}>
          {event.status === 'draft' ? (
            <>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-display font-bold text-base mb-1">Publish event</div>
                  <p className="text-[13px] m-0" style={{ color: 'var(--text-muted)' }}>
                    Make this event live so guests can view and RSVP.
                  </p>
                </div>
                <button onClick={handlePublish} disabled={publishSaving}
                  className="flex-none text-white font-sans text-[14px] font-bold px-[22px] py-[11px] rounded-[8px] border-none cursor-pointer disabled:opacity-50"
                  style={{ background: 'var(--accent)' }}>
                  {publishSaving ? 'Publishing…' : 'Publish event'}
                </button>
              </div>
              <div className="mt-4">
                <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">Visibility</label>
                <select value={visibility} onChange={(e) => setVisibility(e.target.value as 'private' | 'unlisted' | 'public')}
                  className={inputCls} style={field}>
                  <option value="unlisted">Unlisted (link-only)</option>
                  <option value="public">Public — shows on landing page</option>
                  <option value="private">Private</option>
                </select>
                <p className="mt-2 m-0 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                  Public shows on the landing page; unlisted is link-only.
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="font-display font-bold text-base">Published</div>
                  <span className="text-[11.5px] font-semibold px-2.5 py-0.5 rounded-pill"
                    style={{ background: 'color-mix(in srgb,var(--accent-2) 18%, transparent)', color: 'var(--accent-2)' }}>
                    {visibility === 'public' ? 'Public' : visibility === 'unlisted' ? 'Unlisted' : 'Private'}
                  </span>
                </div>
                <p className="text-[13px] m-0" style={{ color: 'var(--text-muted)' }}>
                  Live — guests can view and RSVP. Change visibility in Edit details below.
                </p>
              </div>
              <button onClick={handleUnpublish} disabled={publishSaving}
                className="flex-none border border-border font-sans text-[13px] font-semibold px-4 py-[9px] rounded-[8px] cursor-pointer disabled:opacity-50"
                style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
                {publishSaving ? 'Updating…' : 'Unpublish'}
              </button>
            </div>
          )}
        </section>

        {/* EVENT PHOTO */}
        <section className="border border-border rounded-[14px] overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
          <div className="relative" style={{ aspectRatio: '16/9' }}>
            {event.image_url ? (
              <img src={event.image_url} alt="Event" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center"
                style={{ background: 'repeating-linear-gradient(135deg,#3A0A12,#3A0A12 12px,#451320 12px,#451320 24px)' }}>
                <span className="font-display text-[11px] tracking-[0.18em]" style={{ color: 'rgba(242,228,214,.5)' }}>
                  [ EVENT PHOTO ]
                </span>
              </div>
            )}
            {imageUploading && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(15,1,3,.6)' }}>
                <span className="font-sans text-[13px] font-semibold text-white">Uploading…</span>
              </div>
            )}
          </div>
          <div className="p-[18px] flex items-center gap-3">
            <div className="flex-1">
              <div className="font-display font-bold text-[15px] mb-0.5">Event photo</div>
              <div className="text-[12.5px]" style={{ color: 'var(--text-muted)' }}>PNG, JPEG, WebP, or GIF — shown on the invite page.</div>
              {uploadError && <div className="text-[12px] mt-1" style={{ color: 'var(--no, #A62F24)' }}>{uploadError}</div>}
            </div>
            <input ref={imgInputRef} type="file" accept="image/png,image/webp,image/gif,image/jpeg" className="hidden"
              onChange={handleImageUpload} />
            <button onClick={() => imgInputRef.current?.click()} disabled={imageUploading}
              className="flex-none border border-border font-sans text-[13px] font-semibold px-4 py-[9px] rounded-[8px] cursor-pointer disabled:opacity-50"
              style={{ background: 'var(--bg-surface-2)', color: 'var(--text-secondary)' }}>
              {event.image_url ? 'Change photo' : 'Upload photo'}
            </button>
          </div>
        </section>

        {/* EDIT DETAILS */}
        <section className="border border-border rounded-[14px] p-6" style={{ background: 'var(--bg-surface)' }}>
          <div className="flex items-center justify-between mb-[18px]">
            <div className="font-display font-bold text-base">Edit details</div>
            <div className="flex items-center gap-3">
              {autoSaveState === 'pending' && <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Unsaved…</span>}
              {autoSaveState === 'saving' && <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Saving…</span>}
              {autoSaveState === 'saved' && <span className="text-[12px] font-semibold" style={{ color: 'var(--accent-2)' }}>✓ Saved</span>}
              <button onClick={save}
                className="border border-border font-sans text-[12.5px] font-semibold px-3 py-[7px] rounded-[7px] cursor-pointer whitespace-nowrap"
                style={{ background: 'var(--bg-surface-2)', color: 'var(--text-secondary)' }}>
                Save draft
              </button>
            </div>
          </div>
          <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">Event name</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-border text-text-primary font-display font-semibold text-[17px] px-[15px] py-[13px] rounded-[9px] outline-none mb-3"
            style={field} />
          <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">Description <span className="font-normal text-text-muted">(optional)</span></label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="A short line about the vibe — shown under the event title."
            rows={2}
            className="w-full border border-border text-text-primary text-[14px] px-[15px] py-[12px] rounded-[9px] outline-none resize-none mb-4"
            style={field} />
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} style={field} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">Start time</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputCls} style={field} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">End time</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputCls} style={field} />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">Location</label>
            <select value={showAddVenue ? '__add__' : venueId} onChange={(e) => handleVenueChange(e.target.value)}
              className={`${inputCls} mb-2`} style={field}>
              <option value="__custom__">Custom location…</option>
              {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              <option value="__add__">＋ Save new venue…</option>
            </select>
            {!showAddVenue && venueId === '__custom__' && (
              <input ref={locationInputRef} value={place} onChange={(e) => setPlace(e.target.value)}
                placeholder="Venue name or address" className={inputCls} style={field} />
            )}
            {!showAddVenue && venueId !== '__custom__' && venues.find((v) => v.id === venueId)?.address && (
              <p className="text-[12.5px] mt-1 mb-0" style={{ color: 'var(--text-muted)' }}>
                {venues.find((v) => v.id === venueId)?.address}
              </p>
            )}
            {showAddVenue && (
              <div className="mt-1 p-4 border border-border rounded-[10px]" style={{ background: 'var(--bg-surface-2)' }}>
                <div className="text-[12px] font-semibold text-text-secondary mb-2">New venue</div>
                <input value={newVenueName} onChange={(e) => setNewVenueName(e.target.value)}
                  placeholder="Venue name (e.g. Marly's Yard)" className={`${inputCls} mb-2`} style={field} />
                <input value={newVenueAddress} onChange={(e) => setNewVenueAddress(e.target.value)}
                  placeholder="Address (optional)" className={`${inputCls} mb-3`} style={field} />
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => { setShowAddVenue(false); setVenueId('__custom__') }}
                    className="border border-border text-text-secondary font-sans text-[13px] font-semibold px-4 py-2 rounded-[8px] cursor-pointer"
                    style={{ background: 'transparent' }}>Cancel</button>
                  <button type="button" onClick={handleAddVenue} disabled={!newVenueName.trim() || addingVenue}
                    className="font-sans text-[13px] font-bold px-5 py-2 rounded-[8px] disabled:opacity-50 cursor-pointer text-white"
                    style={{ background: 'var(--accent)', border: 'none' }}>
                    {addingVenue ? 'Saving…' : 'Save venue'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">RSVP deadline</label>
            <div className="flex items-center gap-3">
              <input type="date" value={rsvpBy} onChange={(e) => setRsvpBy(e.target.value)}
                className={inputCls + ' flex-1'} style={field} />
              {rsvpBy && (
                <button onClick={() => setRsvpBy('')}
                  className="flex-none text-[12px] font-semibold cursor-pointer border-none bg-transparent"
                  style={{ color: 'var(--text-muted)' }}>
                  Clear
                </button>
              )}
            </div>
            <p className="mt-2 m-0 text-[12px]" style={{ color: 'var(--text-muted)' }}>
              RSVPs lock after this date. Leave blank for no deadline.
            </p>
          </div>

          <div className="mt-4">
            <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">Visibility</label>
            <select value={visibility} onChange={(e) => setVisibility(e.target.value as 'private' | 'unlisted' | 'public')}
              className={inputCls} style={field}>
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
              <option value="public">Public</option>
            </select>
            <p className="mt-2 m-0 text-[12px]" style={{ color: 'var(--text-muted)' }}>
              Public events show on the landing page; unlisted are link-only.
            </p>
          </div>

          <div className="mt-4">
            <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">Hosted by</label>
            <input value={hostedBy} onChange={(e) => setHostedBy(e.target.value)} placeholder="e.g. Marcus & Julia"
              className={inputCls} style={field} />
          </div>

          <div className="mt-4">
            <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">Who's it for</label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['all', 'kid_friendly', 'adults'] as const).map((a) => {
                const label = { all: 'All ages', kid_friendly: 'Kid-friendly', adults: 'Adults only' }[a]
                const on = audience === a
                return (
                  <button key={a} onClick={() => setAudience(a)}
                    className="font-sans font-semibold text-[13px] py-[11px] px-2 rounded-[10px] text-text-primary cursor-pointer"
                    style={{ border: `1.5px solid ${on ? 'var(--accent)' : 'var(--border)'}`, background: on ? 'color-mix(in srgb,var(--accent) 18%, transparent)' : 'transparent' }}>
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between py-[14px] mt-4 border-t border-border">
            <div>
              <div className="font-semibold text-[15px]">Allow plus-ones</div>
              <div className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Guests can bring additional people</div>
            </div>
            <button onClick={() => setAllowPlusOnes((v) => !v)}
              className="relative flex-none cursor-pointer border-none p-0"
              style={{ width: 52, height: 30, borderRadius: 999, background: allowPlusOnes ? 'var(--accent-2)' : 'var(--border)', transition: 'background .2s' }}>
              <span className="absolute top-[3px] rounded-full bg-white"
                style={{ width: 24, height: 24, left: allowPlusOnes ? 25 : 3, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
            </button>
          </div>

          {allowPlusOnes && (
            <div className="flex items-center justify-between py-[14px] border-t border-border">
              <div>
                <div className="font-semibold text-[15px]">Max per guest</div>
                <div className="text-[13px]" style={{ color: 'var(--text-muted)' }}>How many extra they can bring</div>
              </div>
              <div className="flex items-center gap-[14px]">
                <button onClick={() => setPlusMax((n) => Math.max(1, n - 1))}
                  className="w-9 h-9 rounded-[9px] border border-border text-[18px] text-text-primary cursor-pointer"
                  style={field}>–</button>
                <span className="font-display font-bold text-[18px] min-w-[30px] text-center tabular-nums">{plusMax}</span>
                <button onClick={() => setPlusMax((n) => Math.min(10, n + 1))}
                  className="w-9 h-9 rounded-[9px] border border-border text-[18px] text-text-primary cursor-pointer"
                  style={field}>+</button>
              </div>
            </div>
          )}

          {dirty && (
            <div className="mt-[18px] rounded-[10px] px-4 py-[14px]"
              style={{ background: 'color-mix(in srgb, var(--candle) 14%, transparent)', border: '1px solid var(--candle)' }}>
              <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
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
              {notify && (
                <textarea
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  placeholder="Optional message to guests — e.g. Updated start time, see you Saturday!"
                  rows={2}
                  className="w-full border border-border text-text-primary font-sans text-[13px] px-[13px] py-[10px] rounded-[8px] outline-none resize-none"
                  style={{ background: 'color-mix(in srgb, var(--field) 80%, transparent)' }}
                />
              )}
            </div>
          )}

          {savedFlash && !dirty && (
            <div className="mt-[18px] text-[13.5px] font-semibold" style={{ color: 'var(--accent-2)' }}>
              ✓ Saved{notify ? ` · ${goingN} guests notified` : ''}
            </div>
          )}
        </section>

        {/* DATE POLL */}
        {poll ? (
          <section className="border border-border rounded-[14px] p-6" style={{ background: 'var(--bg-surface)' }}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="font-display font-bold text-base">Date poll</div>
              <span className="text-[12.5px] tabular" style={{ color: 'var(--text-muted)' }}>
                {poll.options.reduce((a, o) => a + o.votes, 0)} votes
              </span>
            </div>
            <p className="text-[13px] m-0 mb-[18px]" style={{ color: 'var(--text-muted)' }}>
              {poll.status === 'locked' ? 'Date is locked in.' : "Guests voted when they RSVP'd."}
            </p>

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
          </section>
        ) : (
          <section className="border border-border rounded-[14px] p-5 flex items-center justify-between gap-4"
            style={{ background: 'var(--bg-surface)' }}>
            <div>
              <div className="font-display font-bold text-base mb-0.5">Date poll</div>
              <p className="text-[13px] m-0" style={{ color: 'var(--text-muted)' }}>Let guests vote on the best date when they RSVP.</p>
            </div>
            <button onClick={handleEnablePoll} disabled={enablingPoll}
              className="flex-none border border-border font-sans text-[13px] font-semibold px-4 py-[9px] rounded-[8px] cursor-pointer whitespace-nowrap disabled:opacity-50"
              style={{ background: 'var(--bg-surface-2)', color: 'var(--text-secondary)' }}>
              {enablingPoll ? 'Enabling…' : '+ Enable'}
            </button>
          </section>
        )}

        {/* POTLUCK */}
        {event.potluck_enabled ? (
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
        ) : (
          <section className="border border-border rounded-[14px] p-5 flex items-center justify-between gap-4"
            style={{ background: 'var(--bg-surface)' }}>
            <div>
              <div className="font-display font-bold text-base mb-0.5">Potluck sign-up</div>
              <p className="text-[13px] m-0" style={{ color: 'var(--text-muted)' }}>Add sign-up slots so guests can claim what they'll bring.</p>
            </div>
            <button onClick={handleEnablePotluck} disabled={enablingPotluck}
              className="flex-none border border-border font-sans text-[13px] font-semibold px-4 py-[9px] rounded-[8px] cursor-pointer whitespace-nowrap disabled:opacity-50"
              style={{ background: 'var(--bg-surface-2)', color: 'var(--text-secondary)' }}>
              {enablingPotluck ? 'Enabling…' : '+ Enable'}
            </button>
          </section>
        )}

        {/* INFO PAGES */}
        <section className="border border-border rounded-[14px] p-6" style={{ background: 'var(--bg-surface)' }}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="font-display font-bold text-base mb-1.5">Info pages</div>
              <p className="text-[13px] m-0" style={{ color: 'var(--text-muted)' }}>
                Itinerary, menu, track list, and more — attached to this event's invite.
              </p>
            </div>
            <Link to={`/host/event/${id}/info`} className="no-underline font-semibold text-[13.5px]" style={{ color: 'var(--accent-2)' }}>
              Edit info pages →
            </Link>
          </div>
        </section>

        {/* INVITE MORE GUESTS */}
        <section className="border border-border rounded-[14px] p-6" style={{ background: 'var(--bg-surface)' }}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="font-display font-bold text-base mb-1.5">Invite guests</div>
              <p className="text-[13px] m-0" style={{ color: 'var(--text-muted)' }}>
                Send invites to your guest lists or add new contacts.
              </p>
            </div>
            <div className="flex gap-2.5">
              <Link to="/host/guests"
                className="border border-border text-text-secondary font-sans text-[13px] font-semibold px-4 py-[9px] rounded-[8px] no-underline whitespace-nowrap"
                style={{ background: 'transparent' }}>
                + Add guests
              </Link>
              <Link to={`/host/invites/${id}`}
                className="font-sans text-[13px] font-bold px-4 py-[9px] rounded-[8px] no-underline whitespace-nowrap text-white"
                style={{ background: 'var(--accent)' }}>
                Send invites →
              </Link>
            </div>
          </div>
        </section>

        {/* REMINDER TEXT */}
        <section className="border border-border rounded-[14px] p-6" style={{ background: 'var(--bg-surface)' }}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="font-display font-bold text-base mb-1.5">Reminder text</div>
              <p className="text-[13px] m-0" style={{ color: 'var(--text-muted)' }}>
                A reminder with the date, time and location goes out automatically 2 days before — to
                everyone invited who opted in to texts. Send one now if you'd like.
              </p>
            </div>
            <button onClick={handleSendReminder} disabled={reminderState === 'sending'}
              className="border border-border text-text-primary font-sans text-[13px] font-semibold px-4 py-[9px] rounded-[8px] cursor-pointer whitespace-nowrap disabled:opacity-50"
              style={{ background: 'transparent' }}>
              {reminderState === 'sending' ? 'Sending…' : 'Send reminder now'}
            </button>
          </div>
          {reminderResult && (
            <div className="mt-3 text-[13px]" style={{ color: reminderResult.configured ? 'var(--accent-2)' : 'var(--candle)' }}>
              {reminderResult.configured
                ? `Reminder sent to ${reminderResult.delivered} ${reminderResult.delivered === 1 ? 'guest' : 'guests'} ✓`
                : "Text isn't connected yet — check the Twilio secrets in Supabase."}
            </div>
          )}
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
