// Supabase Edge Function — automated daily reminder sweep.
// Called by pg_cron once a day. Finds published events starting ~2 days out
// that haven't been reminded yet, and texts their opted-in invitees.
// Guarded by a shared token header (verify_jwt = false) since cron has no user JWT.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Shared token — must match the x-cron-token header sent by the pg_cron job.
const CRON_TOKEN = 'bc_rmd_9f3a7c2e8b1d4056af72e9c1d8b3f64a'

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { 'Content-Type': 'application/json' } })

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

async function sendReminderForEvent(
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
  if (req.headers.get('x-cron-token') !== CRON_TOKEN) return json({ error: 'forbidden' }, 403)
  try {
    const creds = twilioCreds()
    if (!creds) return json({ configured: false, processed: 0, delivered: 0 })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Window: events whose start falls on the calendar day 2 days from now (UTC boundaries).
    const base = new Date()
    base.setUTCHours(0, 0, 0, 0)
    const from = new Date(base); from.setUTCDate(from.getUTCDate() + 2)
    const to = new Date(from); to.setUTCDate(to.getUTCDate() + 1)

    const { data: events } = await supabase
      .from('events')
      .select('id,title,slug,starts_at,timezone,location_name,location_address,invited_list_ids')
      .eq('status', 'published')
      .is('reminder_sent_at', null)
      .gte('starts_at', from.toISOString())
      .lt('starts_at', to.toISOString())

    const origin = Deno.env.get('PUBLIC_SITE_URL') ?? 'https://blackcafe.miami'
    let delivered = 0
    for (const event of (events ?? []) as EventReminder[]) {
      delivered += await sendReminderForEvent(supabase, creds, event, origin)
    }
    return json({ configured: true, processed: (events ?? []).length, delivered })
  } catch (e) {
    return json({ configured: true, processed: 0, delivered: 0, error: String(e) })
  }
})
