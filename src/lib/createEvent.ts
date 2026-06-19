import { supabase } from './supabase'
import type { EventRow } from '../types/events'

export interface GuestRow { id: string; name: string; email: string | null; phone: string | null }

export async function getHostGuests(hostId: string): Promise<GuestRow[]> {
  const { data } = await supabase.from('guests').select('id,name,email,phone').eq('host_id', hostId).order('name')
  return (data as GuestRow[]) ?? []
}

export interface NewEventInput {
  title: string
  date: string        // yyyy-mm-dd
  time: string        // HH:mm
  timezone: string
  place: string
  tag: string
  allowPlusOnes: boolean
  plusMax: number
  audience: 'all' | 'kid_friendly' | 'adults'
  bringNote: string
  wearNote: string
  parkingNote: string
  links: { label: string; url: string }[]
  polls: { dietary: boolean; date: boolean; potluck: boolean }
  infoPages: { type: string; title: string }[]
}

function slugify(t: string): string {
  return t.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) || 'gathering'
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base
  let n = 2
  for (;;) {
    const { data } = await supabase.from('events').select('id').eq('slug', slug).maybeSingle()
    if (!data) return slug
    slug = `${base}-${n++}`
  }
}

export async function createEvent(hostId: string, input: NewEventInput, publish: boolean): Promise<EventRow> {
  const starts_at = input.date && input.time ? new Date(`${input.date}T${input.time}`).toISOString() : null
  const slug = await uniqueSlug(slugify(input.title))
  const { data: event, error } = await supabase.from('events').insert({
    host_id: hostId,
    slug,
    title: input.title.trim() || 'Untitled gathering',
    starts_at,
    timezone: input.timezone,
    location_name: input.place.trim() || null,
    tag: input.tag || null,
    audience: input.audience,
    allow_plus_ones: input.allowPlusOnes,
    plus_one_max: input.plusMax,
    bring_note: input.bringNote.trim() || null,
    wear_note: input.wearNote.trim() || null,
    parking_note: input.parkingNote.trim() || null,
    links: input.links.filter((l) => l.label.trim() && l.url.trim()),
    potluck_enabled: input.polls.potluck,
    visibility: 'unlisted',
    status: publish ? 'published' : 'draft',
  }).select().single()
  if (error) throw error
  const ev = event as EventRow

  const polls: { event_id: string; type: string; question: string }[] = []
  if (input.polls.dietary) polls.push({ event_id: ev.id, type: 'dietary', question: 'Any dietary needs?' })
  if (input.polls.date) polls.push({ event_id: ev.id, type: 'date', question: 'Which night works best?' })
  if (polls.length) await supabase.from('polls').insert(polls)

  if (input.infoPages.length) {
    await supabase.from('info_pages').insert(
      input.infoPages.map((p, i) => ({ event_id: ev.id, type: p.type, title: p.title, sort: i })),
    )
  }
  return ev
}
