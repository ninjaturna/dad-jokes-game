import { supabase } from './supabase'

export interface Contact { id: string; name: string; email: string | null; phone: string | null }
export interface ListWithMembers { id: string; name: string; members: Contact[] }
export interface PendingRsvp { id: string; name: string; response: string; plus_ones: number; event_id: string; event_title: string }

export async function getContacts(hostId: string): Promise<Contact[]> {
  const { data } = await supabase.from('guests').select('id,name,email,phone').eq('host_id', hostId).order('name')
  return (data as Contact[]) ?? []
}

export async function addContact(hostId: string, c: { name: string; email?: string; phone?: string }) {
  const { error } = await supabase.from('guests').insert({ host_id: hostId, name: c.name.trim(), email: c.email?.trim() || null, phone: c.phone?.trim() || null })
  if (error) throw error
}

export async function getLists(hostId: string): Promise<ListWithMembers[]> {
  const { data: lists } = await supabase.from('lists').select('id,name').eq('host_id', hostId).order('name')
  const { data: rawMembers } = await supabase.from('list_members').select('list_id, guests(id,name,email,phone)')
  type MemberRow = { list_id: string; guests: Contact }
  const byList = ((rawMembers ?? []) as unknown as MemberRow[]).reduce<Record<string, Contact[]>>((m, row) => {
    if (row.guests) (m[row.list_id] ??= []).push(row.guests)
    return m
  }, {})
  return (lists ?? []).map((l) => ({ id: l.id, name: l.name, members: byList[l.id] ?? [] }))
}

export async function createList(hostId: string, name: string): Promise<string> {
  const { data, error } = await supabase.from('lists').insert({ host_id: hostId, name: name.trim() || 'New list' }).select('id').single()
  if (error) throw error
  return data.id as string
}

export async function toggleListMember(listId: string, guestId: string, isMember: boolean) {
  if (isMember) await supabase.from('list_members').delete().eq('list_id', listId).eq('guest_id', guestId)
  else await supabase.from('list_members').insert({ list_id: listId, guest_id: guestId })
}

export async function getPendingRsvps(hostId: string): Promise<PendingRsvp[]> {
  const { data: events } = await supabase.from('events').select('id,title').eq('host_id', hostId)
  const ids = (events ?? []).map((e) => e.id)
  if (!ids.length) return []
  const titles = Object.fromEntries((events ?? []).map((e) => [e.id, e.title]))
  const { data } = await supabase.from('rsvps').select('id,name,response,plus_ones,event_id').in('event_id', ids).eq('status', 'pending')
  return (data ?? []).map((r) => ({ ...r, event_title: titles[r.event_id] })) as PendingRsvp[]
}

export async function setRsvpStatus(id: string, status: 'confirmed' | 'declined') {
  await supabase.from('rsvps').update({ status }).eq('id', id)
}
