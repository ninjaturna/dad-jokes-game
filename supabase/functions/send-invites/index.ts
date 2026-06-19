// Supabase Edge Function — deferred: deploy with `supabase functions deploy send-invites`
// and set SENDGRID_API_KEY. Until then the client treats it as "not configured".
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const key = Deno.env.get('SENDGRID_API_KEY')
  if (!key) {
    return new Response(JSON.stringify({ configured: false, delivered: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { eventId, listIds, note } = await req.json()
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: event } = await supabase
    .from('events').select('title,slug,starts_at,location_name').eq('id', eventId).single()
  const { data: members } = await supabase
    .from('list_members').select('guests(email,name)').in('list_id', listIds)

  type Recipient = { email: string; name: string }
  const recipients: Recipient[] = [
    ...new Map(
      ((members ?? []) as unknown as Array<{ guests: Recipient }>)
        .map((m) => m.guests)
        .filter((g) => g?.email)
        .map((g) => [g.email, g]),
    ).values(),
  ]

  const origin = Deno.env.get('PUBLIC_SITE_URL') ?? 'https://blackcafe.miami'
  const link = `${origin}/e/${event.slug}`
  let delivered = 0

  for (const r of recipients) {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: r.email, name: r.name }] }],
        from: { email: 'invites@blackcafe.miami', name: "Black Cafe @ Marly's Yard" },
        subject: `You're invited — ${event.title}`,
        content: [{ type: 'text/html', value: `<p>${note}</p><p><a href="${link}">RSVP — ${event.title}</a></p>` }],
      }),
    })
    if (res.ok) delivered++
  }

  return new Response(JSON.stringify({ configured: true, delivered }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
