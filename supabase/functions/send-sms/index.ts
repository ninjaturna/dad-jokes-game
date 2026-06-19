// Supabase Edge Function — deferred: deploy with `supabase functions deploy send-sms`
// and set TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, TWILIO_MESSAGING_SERVICE_SID.
// Until then the client treats it as "not configured".
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const apiKeySid = Deno.env.get('TWILIO_API_KEY_SID')
  const apiKeySecret = Deno.env.get('TWILIO_API_KEY_SECRET')
  const msid = Deno.env.get('TWILIO_MESSAGING_SERVICE_SID')

  if (!accountSid || !apiKeySid || !apiKeySecret || !msid) {
    return new Response(JSON.stringify({ configured: false, delivered: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const auth = 'Basic ' + btoa(`${apiKeySid}:${apiKeySecret}`)

  const { eventId, listIds, note } = await req.json()
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: event } = await supabase
    .from('events').select('title,slug').eq('id', eventId).single()

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
  let delivered = 0

  for (const r of recipients) {
    const body = new URLSearchParams({
      To: r.phone,
      MessagingServiceSid: msid,
      Body: `Black Cafe @ Marly's Yard: ${note} RSVP: ${link}`,
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

  return new Response(JSON.stringify({ configured: true, delivered }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
