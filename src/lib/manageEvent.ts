import { supabase } from './supabase'
import type { EventRow } from '../types/events'

export async function getEventById(id: string): Promise<EventRow | null> {
  const { data } = await supabase.from('events').select('*').eq('id', id).maybeSingle()
  return (data as EventRow) ?? null
}

export async function updateEventDetails(id: string, fields: {
  title?: string
  starts_at?: string | null
  location_name?: string | null
  visibility?: 'private' | 'unlisted' | 'public'
  status?: 'draft' | 'published' | 'passed' | 'cancelled'
  ends_at?: string | null
  allow_plus_ones?: boolean
  plus_one_max?: number
  audience?: 'all' | 'kid_friendly' | 'adults'
  hosted_by?: string | null
  rsvp_by?: string | null
}) {
  const { error } = await supabase.from('events').update(fields).eq('id', id)
  if (error) throw error
}

export async function confirmedCount(eventId: string): Promise<number> {
  const { count } = await supabase.from('rsvps').select('id', { count: 'exact', head: true }).eq('event_id', eventId).eq('response', 'yes')
  return count ?? 0
}

export interface DateOption { id: string; label: string; votes: number }
export interface DatePoll { id: string; status: 'open' | 'locked'; locked_option_id: string | null; options: DateOption[] }

export async function getDatePoll(eventId: string): Promise<DatePoll | null> {
  const { data: poll } = await supabase.from('polls').select('id,status,locked_option_id').eq('event_id', eventId).eq('type', 'date').maybeSingle()
  if (!poll) return null
  const { data: opts } = await supabase.from('poll_options').select('id,label').eq('poll_id', poll.id).order('sort')
  const { data: votes } = await supabase.from('poll_votes').select('option_id').eq('poll_id', poll.id)
  const tally = (votes ?? []).reduce<Record<string, number>>((m, v) => { m[v.option_id] = (m[v.option_id] ?? 0) + 1; return m }, {})
  return {
    id: poll.id, status: poll.status as 'open' | 'locked', locked_option_id: poll.locked_option_id,
    options: (opts ?? []).map((o) => ({ id: o.id, label: o.label, votes: tally[o.id] ?? 0 })),
  }
}

export async function createDatePoll(eventId: string): Promise<string> {
  const { data, error } = await supabase.from('polls').insert({ event_id: eventId, type: 'date', status: 'open' }).select('id').single()
  if (error) throw error
  return data.id as string
}

export async function addDateOption(pollId: string, label: string, sort: number) {
  await supabase.from('poll_options').insert({ poll_id: pollId, label, sort })
}

export async function lockDatePoll(pollId: string, optionId: string) {
  await supabase.from('polls').update({ status: 'locked', locked_option_id: optionId }).eq('id', pollId)
}

export interface Slot { id: string; title: string; claimed_by_name: string | null }

export async function getPotluckSlots(eventId: string): Promise<Slot[]> {
  const { data } = await supabase.from('potluck_slots').select('id,title,claimed_by_name').eq('event_id', eventId).order('created_at')
  return (data as Slot[]) ?? []
}

export async function addPotluckSlot(eventId: string, title: string) {
  await supabase.from('potluck_slots').insert({ event_id: eventId, title })
}

export async function toggleClaim(slot: Slot, name: string) {
  await supabase.from('potluck_slots').update({ claimed_by_name: slot.claimed_by_name ? null : name }).eq('id', slot.id)
}

export async function updatePotluckEnabled(eventId: string, enabled: boolean) {
  const { error } = await supabase.from('events').update({ potluck_enabled: enabled }).eq('id', eventId)
  if (error) throw error
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
}

export async function uploadEventImage(eventId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'png'
  const path = `${eventId}/${Date.now()}.${ext}`
  const { error: upErr } = await supabase.storage.from('event-images').upload(path, file, { upsert: true })
  if (upErr) throw upErr
  const { data } = supabase.storage.from('event-images').getPublicUrl(path)
  const { error: updErr } = await supabase.from('events').update({ image_url: data.publicUrl }).eq('id', eventId)
  if (updErr) throw updErr
  return data.publicUrl
}
