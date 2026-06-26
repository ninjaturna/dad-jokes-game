import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'
import type { EventRow } from '../types/events'

export interface EventWithCounts extends EventRow {
  going: number
  maybe: number
  declined: number
}
export interface HostDashboardData {
  upcoming: EventWithCounts[]
  passed: EventWithCounts[]
  stats: { upcoming: number; goingThisWeek: number; responses: number; onTheList: number }
}

export async function ensureProfile(user: User) {
  await supabase.from('profiles').upsert(
    { id: user.id, email: user.email, display_name: (user.user_metadata?.name as string) ?? user.email?.split('@')[0] ?? 'Host' },
    { onConflict: 'id' },
  )
}

export async function loadHostDashboard(hostId: string): Promise<HostDashboardData> {
  const { data: eventsData } = await supabase.from('events').select('*').eq('host_id', hostId).order('starts_at', { ascending: true })
  const events = (eventsData as EventRow[]) ?? []
  const ids = events.map((e) => e.id)
  const { data: rsvpData } = ids.length
    ? await supabase.from('rsvps').select('event_id,response,plus_ones').in('event_id', ids)
    : { data: [] as { event_id: string; response: string; plus_ones: number }[] }
  const rsvps = rsvpData ?? []

  const withCounts: EventWithCounts[] = events.map((e) => {
    const rs = rsvps.filter((r) => r.event_id === e.id)
    return {
      ...e,
      going: rs.filter((r) => r.response === 'yes').length,
      maybe: rs.filter((r) => r.response === 'maybe').length,
      declined: rs.filter((r) => r.response === 'no').length,
    }
  })

  const now = Date.now()
  const weekAhead = now + 7 * 864e5
  const upcoming = withCounts.filter((e) => e.starts_at && new Date(e.starts_at).getTime() >= now)
  const passed = withCounts.filter((e) => e.starts_at && new Date(e.starts_at).getTime() < now).reverse()
  const goingThisWeek = upcoming
    .filter((e) => e.starts_at && new Date(e.starts_at).getTime() <= weekAhead)
    .reduce((n, e) => n + e.going, 0)

  const { count: guestCount } = await supabase.from('guests').select('id', { count: 'exact', head: true }).eq('host_id', hostId)

  return {
    upcoming,
    passed,
    stats: {
      upcoming: upcoming.filter((e) => e.status === 'published').length,
      goingThisWeek,
      responses: rsvps.length,
      onTheList: guestCount ?? 0,
    },
  }
}

export async function getHostLocations(hostId: string): Promise<string[]> {
  const { data } = await supabase.from('events').select('location_name').eq('host_id', hostId).not('location_name', 'is', null)
  return [...new Set((data ?? []).map((e) => e.location_name as string).filter(Boolean))]
}

export interface Venue { id: string; name: string; address: string | null }

export async function getVenues(hostId: string): Promise<Venue[]> {
  const { data } = await supabase.from('venues').select('id,name,address').eq('host_id', hostId).order('name')
  return (data as Venue[]) ?? []
}

export async function createVenue(hostId: string, name: string, address?: string): Promise<Venue> {
  const { data, error } = await supabase.from('venues').insert({ host_id: hostId, name: name.trim(), address: address?.trim() || null }).select('id,name,address').single()
  if (error) throw error
  return data as Venue
}

export async function signOut() { await supabase.auth.signOut() }
