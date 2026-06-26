// Supabase Edge Function — serves a single event as a downloadable .ics file.
// Served from a real URL (not a client blob) so iOS Safari and macOS Calendar can
// open it. Public (verify_jwt = false). Usage: /event-ics?slug=<event-slug>
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// RFC 5545 text escaping: backslash, semicolon, comma, newline.
function esc(v: string): string {
  return v.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

function toICSDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

interface EventRow {
  id: string; title: string; slug: string
  starts_at: string | null; ends_at: string | null
  location_name: string | null; location_address: string | null; description: string | null
}

function buildICS(event: EventRow): string {
  const start = event.starts_at ? toICSDate(event.starts_at) : ''
  const end = event.ends_at ? toICSDate(event.ends_at) : start
  const loc = [event.location_name, event.location_address].filter(Boolean).join(', ')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'PRODID:-//Black Cafe//Events//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@blackcafe.miami`,
    `DTSTAMP:${toICSDate(new Date().toISOString())}`,
    start && `DTSTART:${start}`,
    end && `DTEND:${end}`,
    `SUMMARY:${esc(event.title)}`,
    loc && `LOCATION:${esc(loc)}`,
    event.description && `DESCRIPTION:${esc(event.description)}`,
    start && 'BEGIN:VALARM',
    start && 'ACTION:DISPLAY',
    start && `DESCRIPTION:${esc(event.title)} is in 2 days`,
    start && 'TRIGGER:-P2D',
    start && 'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean)
  return lines.join('\r\n')
}

serve(async (req) => {
  const url = new URL(req.url)
  const slug = url.searchParams.get('slug')
  const id = url.searchParams.get('id')
  if (!slug && !id) return new Response('Missing slug or id', { status: 400 })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
  const query = supabase
    .from('events')
    .select('id,title,slug,starts_at,ends_at,location_name,location_address,description')
  const { data: event } = slug
    ? await query.eq('slug', slug).maybeSingle()
    : await query.eq('id', id!).maybeSingle()

  if (!event) return new Response('Event not found', { status: 404 })

  const ics = buildICS(event as EventRow)
  return new Response(ics, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${(event as EventRow).slug}.ics"`,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    },
  })
})
