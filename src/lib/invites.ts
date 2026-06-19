import { supabase } from './supabase'
import { getLists } from './guests'
import type { EventRow } from '../types/events'

export async function getEvent(eventId: string): Promise<EventRow | null> {
  const { data } = await supabase.from('events').select('*').eq('id', eventId).maybeSingle()
  return (data as EventRow) ?? null
}

export { getLists }

export interface SendResult { configured: boolean; delivered: number }

export async function sendEmailInvites(input: {
  eventId: string; listIds: string[]; note: string; template: string
}): Promise<SendResult> {
  try {
    const { data, error } = await supabase.functions.invoke('send-invites', { body: input })
    if (error) return { configured: false, delivered: 0 }
    return data as SendResult
  } catch {
    return { configured: false, delivered: 0 }
  }
}

export async function sendSmsInvites(input: {
  eventId: string; listIds: string[]; note: string
}): Promise<SendResult> {
  try {
    const { data, error } = await supabase.functions.invoke('send-sms', { body: input })
    if (error) return { configured: false, delivered: 0 }
    return data as SendResult
  } catch {
    return { configured: false, delivered: 0 }
  }
}
