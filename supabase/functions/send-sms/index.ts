// Supabase Edge Function — deferred: deploy with `supabase functions deploy send-sms`
// and set TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, TWILIO_MESSAGING_SERVICE_SID.
// Until then the client treats it as "not configured".
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const apiKeySid = Deno.env.get('TWILIO_API_KEY_SID')
    const apiKeySecret = Deno.env.get('TWILIO_API_KEY_SECRET')
    const msid = Deno.env.get('TWILIO_MESSAGING_SERVICE_SID')

    if (!accountSid || !apiKeySid || !apiKeySecret || !msid) {
      return json({ configured: false, delivered: 0 })
    }

    const auth = 'Basic ' + btoa(`${apiKeySid}:${apiKeySecret}`)

    const { eventId, listIds, note } = await req.json()
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: event } = await supabase
      .from('events').select('title,slug,location_name,invited_list_ids').eq('id', eventId).single()

    // Record which lists were invited, so reminders know the audience (union with prior sends)
    const mergedLists = [...new Set([...(event?.invited_list_ids ?? []), ...listIds])]
    await supabase.from('events').update({ invited_list_ids: mergedLists }).eq('id', eventId)

    const { data: members } = await supabase
      .from('list_members').select('guests(phone,name,sms_consent)').in('list_id', listIds)

    type GuestRow = { phone: string | null; name: string; sms_consent: boolean }
    type Recipient = { phone: string; name: string }

    const recipients: Recipient[] = [
      ...new Map(
        ((members ?? []) as unknown as Array<{ guests: GuestRow }>)
          .map((m) => m.guests)
          .filter((g): g is GuestRow & { phone: string } => Boolean(g?.phone && g?.sms_consent))
          .map((g) => [g.phone, { phone: g.phone, name: g.name }] as [string, Recipient]),
      ).values(),
    ]

    const origin = Deno.env.get('PUBLIC_SITE_URL') ?? 'https://blackcafe.miami'
    const link = `${origin}/e/${event.slug}`
    const from = `Black Cafe${event.location_name ? ` @ ${event.location_name}` : ''}`
    let delivered = 0

    for (const r of recipients) {
      const body = new URLSearchParams({
        To: r.phone,
        MessagingServiceSid: msid,
        Body: `${from}: ${note} RSVP: ${link}`,
      })
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: { Authorization: auth, 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        },
      )
      if (res.ok) delivered++
    }

    return json({ configured: true, delivered })
  } catch (e) {
    return json({ configured: true, delivered: 0, error: String(e) })
  }
})
