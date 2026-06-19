export type RsvpResponse = 'yes' | 'maybe' | 'no'

export interface EventRow {
  id: string
  slug: string
  title: string
  description: string | null
  host_note: string | null
  starts_at: string | null
  ends_at: string | null
  timezone: string
  location_name: string | null
  location_address: string | null
  location_url: string | null
  image_url: string | null
  audience: 'all' | 'kid_friendly' | 'adults'
  allow_plus_ones: boolean
  plus_one_max: number
  capacity: number | null
  visibility: 'private' | 'unlisted' | 'public'
  status: 'draft' | 'published' | 'passed' | 'cancelled'
}

export interface RsvpRow {
  id: string
  event_id: string
  name: string
  email: string | null
  response: RsvpResponse
  plus_ones: number
  kids: number
  status: 'confirmed' | 'pending' | 'declined'
  device_id: string | null
  created_at: string
}
