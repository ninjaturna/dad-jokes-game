// Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local
// then this client will be wired up automatically.
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
