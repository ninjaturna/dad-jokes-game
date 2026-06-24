-- CC-12: hosted_by field + event-images storage bucket
-- Apply via: supabase db push  (or paste in Supabase SQL editor)

ALTER TABLE events ADD COLUMN IF NOT EXISTS hosted_by text;

-- Public bucket for event images (10 MB limit, image types only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  10485760,
  ARRAY['image/png','image/webp','image/gif','image/jpeg']
)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "event_images_public_read" ON storage.objects
    FOR SELECT USING (bucket_id = 'event-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "event_images_auth_insert" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'event-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "event_images_auth_update" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'event-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "event_images_auth_delete" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'event-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
