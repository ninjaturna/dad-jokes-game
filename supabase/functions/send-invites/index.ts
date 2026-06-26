// Supabase Edge Function — deferred: deploy with `supabase functions deploy send-invites`
// and set SENDGRID_API_KEY. Until then the client treats it as "not configured".
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
    const key = Deno.env.get('SENDGRID_API_KEY')
    if (!key) {
      return json({ configured: false, delivered: 0 })
    }

    const { eventId, listIds, note } = await req.json()
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: event } = await supabase
      .from('events').select('title,slug,starts_at,location_name,invited_list_ids').eq('id', eventId).single()

    // Record which lists were invited, so reminders know the audience (union with prior sends)
    const mergedLists = [...new Set([...(event?.invited_list_ids ?? []), ...listIds])]
    await supabase.from('events').update({ invited_list_ids: mergedLists }).eq('id', eventId)

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

    return json({ configured: true, delivered })
  } catch (e) {
    return json({ configured: true, delivered: 0, error: String(e) })
  }
})
