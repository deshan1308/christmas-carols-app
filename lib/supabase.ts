import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rkyzvcaqnfsmeblztytx.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJreXp2Y2FxbmZzbWVibHp0eXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTkxMjIsImV4cCI6MjA3ODA3NTEyMn0.IOuO7F535TrAswI3Xa93oaC8Fx-tNng6BfmuxtcX0JU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

