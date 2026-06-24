-- CC-CR: RSVP deadline field
-- Apply via: supabase db push  (or paste in Supabase SQL editor)

ALTER TABLE events ADD COLUMN IF NOT EXISTS rsvp_by date;
