import { supabase } from './supabase'
import { getDeviceId } from './device'
import type { EventRow, RsvpRow, RsvpResponse } from '../types/events'

export async function getEventBySlug(slug: string): Promise<EventRow | null> {
  const { data } = await supabase.from('events').select('*').eq('slug', slug).eq('status', 'published').maybeSingle()
  return (data as EventRow) ?? null
}

export async function getRsvps(eventId: string): Promise<RsvpRow[]> {
  const { data } = await supabase.from('rsvps').select('*').eq('event_id', eventId).order('created_at')
  return (data as RsvpRow[]) ?? []
}

export async function getMyRsvp(eventId: string): Promise<RsvpRow | null> {
  const { data } = await supabase.from('rsvps').select('*').eq('event_id', eventId).eq('device_id', getDeviceId()).maybeSingle()
  return (data as RsvpRow) ?? null
}

export async function submitRsvp(input: {
  eventId: string
  name: string
  response: RsvpResponse
  plusOnes?: number
  email?: string
}): Promise<RsvpRow> {
  const device_id = getDeviceId()
  const existing = await getMyRsvp(input.eventId)
  const row = {
    event_id: input.eventId,
    name: input.name.trim(),
    response: input.response,
    plus_ones: input.plusOnes ?? 0,
    email: input.email ?? null,
    device_id,
  }
  if (existing) {
    const { data, error } = await supabase.from('rsvps').update(row).eq('id', existing.id).select().single()
    if (error) throw error
    return data as RsvpRow
  }
  const { data, error } = await supabase.from('rsvps').insert(row).select().single()
  if (error) throw error
  return data as RsvpRow
}

export function countGoing(rsvps: RsvpRow[]): number {
  return rsvps.filter((r) => r.response === 'yes').reduce((n, r) => n + 1 + (r.plus_ones || 0), 0)
}

export function subscribeRsvps(eventId: string, onChange: () => void) {
  const ch = supabase
    .channel(`rsvps:${eventId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rsvps', filter: `event_id=eq.${eventId}` }, onChange)
    .subscribe()
  return () => { supabase.removeChannel(ch) }
}
