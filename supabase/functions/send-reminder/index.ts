// Supabase Edge Function — manual "Send reminder" for a single event.
// Texts opted-in guests on the event's invited lists. Requires Twilio secrets.
// Invoked by the authenticated host from the Manage event page (verify_jwt = true).
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

interface TwilioCreds { accountSid: string; auth: string; msid: string }
function twilioCreds(): TwilioCreds | null {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const apiKeySid = Deno.env.get('TWILIO_API_KEY_SID')
  const apiKeySecret = Deno.env.get('TWILIO_API_KEY_SECRET')
  const msid = Deno.env.get('TWILIO_MESSAGING_SERVICE_SID')
  if (!accountSid || !apiKeySid || !apiKeySecret || !msid) return null
  return { accountSid, auth: 'Basic ' + btoa(`${apiKeySid}:${apiKeySecret}`), msid }
}

interface EventReminder {
  id: string; title: string; slug: string; starts_at: string | null
  timezone: string | null; location_name: string | null; location_address: string | null
  invited_list_ids: string[] | null
}

function reminderBody(event: EventReminder, link: string): string {
  const when = event.starts_at
    ? new Intl.DateTimeFormat('en-US', {
        weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
        timeZone: event.timezone || 'America/New_York',
      }).format(new Date(event.starts_at))
    : 'soon'
  const loc = [event.location_name, event.location_address].filter(Boolean).join(', ')
  return `Reminder — ${event.title} is ${when}${loc ? ` at ${loc}` : ''}. Details: ${link}`
}

// Texts opted-in guests on the event's invited lists; stamps reminder_sent_at. Returns count delivered.
export async function sendReminderForEvent(
  supabase: SupabaseClient, creds: TwilioCreds, event: EventReminder, origin: string,
): Promise<number> {
  const lists = event.invited_list_ids ?? []
  if (!lists.length) return 0
  const link = `${origin}/e/${event.slug}`
  const body = reminderBody(event, link)

  const { data: members } = await supabase
    .from('list_members').select('guests(phone,sms_consent)').in('list_id', lists)
  type G = { phone: string | null; sms_consent: boolean }
  const phones = [
    ...new Set(
      ((members ?? []) as unknown as Array<{ guests: G }>)
        .map((m) => m.guests)
        .filter((g): g is G & { phone: string } => Boolean(g?.phone && g?.sms_consent))
        .map((g) => g.phone),
    ),
  ]

  let delivered = 0
  for (const phone of phones) {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${creds.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: { Authorization: creds.auth, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ To: phone, MessagingServiceSid: creds.msid, Body: body }),
      },
    )
    if (res.ok) delivered++
  }
  await supabase.from('events').update({ reminder_sent_at: new Date().toISOString() }).eq('id', event.id)
  return delivered
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const creds = twilioCreds()
    if (!creds) return json({ configured: false, delivered: 0 })

    const { eventId } = await req.json()
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const { data: event } = await supabase
      .from('events')
      .select('id,title,slug,starts_at,timezone,location_name,location_address,invited_list_ids')
      .eq('id', eventId).single()
    if (!event) return json({ configured: true, delivered: 0, error: 'event not found' })

    const origin = Deno.env.get('PUBLIC_SITE_URL') ?? 'https://blackcafe.miami'
    const delivered = await sendReminderForEvent(supabase, creds, event as EventReminder, origin)
    return json({ configured: true, delivered })
  } catch (e) {
    return json({ configured: true, delivered: 0, error: String(e) })
  }
})
