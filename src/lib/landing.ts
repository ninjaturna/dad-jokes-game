import { supabase } from './supabase'
import type { EventRow } from '../types/events'

export async function getUpcomingPublicEvents(): Promise<EventRow[]> {
  const { data } = await supabase.from('events').select('*')
    .eq('status', 'published').eq('visibility', 'public')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true }).limit(6)
  return (data as EventRow[]) ?? []
}

export async function joinList(contact: string, smsConsent: boolean) {
  const { error } = await supabase.from('subscribers').insert({ contact: contact.trim(), sms_consent: smsConsent })
  if (error) throw error
}
