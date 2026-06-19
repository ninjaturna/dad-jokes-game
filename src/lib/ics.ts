import type { EventRow } from '../types/events'

function toICSDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

export function buildICS(event: EventRow): string {
  const start = event.starts_at ? toICSDate(event.starts_at) : ''
  const end = event.ends_at ? toICSDate(event.ends_at) : start
  const loc = [event.location_name, event.location_address].filter(Boolean).join(', ')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Black Cafe @ Marly’s Yard//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@blackcafe.miami`,
    `DTSTAMP:${toICSDate(new Date().toISOString())}`,
    start && `DTSTART:${start}`,
    end && `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    loc && `LOCATION:${loc}`,
    event.description && `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean)
  return lines.join('\r\n')
}

export function downloadICS(event: EventRow) {
  const blob = new Blob([buildICS(event)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${event.slug}.ics`
  a.click()
  URL.revokeObjectURL(url)
}
