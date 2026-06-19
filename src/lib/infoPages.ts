import { supabase } from './supabase'

export type InfoType = 'itinerary' | 'menu' | 'tracklist' | 'games' | 'custom'
export interface InfoItem { a: string; b: string }
export interface InfoPageRow {
  id: string; event_id: string; type: InfoType; title: string
  body: { items: InfoItem[] }; sort: number
}

export const INFO_TYPES: Record<InfoType, {
  name: string; icon: string; aLabel: string; bLabel: string; aPh: string; bPh: string
}> = {
  itinerary: { name: 'Itinerary', icon: '◷', aLabel: 'Time', bLabel: "What's happening", aPh: '9:00 AM', bPh: 'Coffee on the porch' },
  menu: { name: 'Menu', icon: '🍽', aLabel: 'Course', bLabel: 'Dish', aPh: 'First', bPh: 'Charred corn, lime, cotija' },
  tracklist: { name: 'Track list', icon: '♫', aLabel: 'Title', bLabel: 'Artist', aPh: "Didn't Cha Know", bPh: 'Erykah Badu' },
  games: { name: 'Games', icon: '◆', aLabel: 'Game', bLabel: 'Note', aPh: 'Spades', bPh: 'Partners, cutthroat rules' },
  custom: { name: 'Custom', icon: '✎', aLabel: 'Heading', bLabel: 'Details', aPh: 'Getting there', bPh: 'Park on NE 2nd…' },
}

export async function getInfoPages(eventId: string): Promise<InfoPageRow[]> {
  const { data } = await supabase
    .from('info_pages').select('id,event_id,type,title,body,sort')
    .eq('event_id', eventId).order('sort')
  return ((data as InfoPageRow[]) ?? []).map((p) => ({
    ...p, body: p.body?.items ? p.body : { items: [] },
  }))
}

export async function addInfoPage(
  eventId: string, type: InfoType, title: string, sort: number,
): Promise<string> {
  const { data, error } = await supabase
    .from('info_pages')
    .insert({ event_id: eventId, type, title, body: { items: [{ a: '', b: '' }] }, sort })
    .select('id').single()
  if (error) throw error
  return data.id as string
}

export async function updateInfoPage(
  id: string, fields: { title?: string; body?: { items: InfoItem[] } },
) {
  await supabase.from('info_pages').update(fields).eq('id', id)
}

export async function deleteInfoPage(id: string) {
  await supabase.from('info_pages').delete().eq('id', id)
}
