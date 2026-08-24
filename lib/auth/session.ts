import { redirect } from 'next/navigation'
import { hasSupabaseEnv } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import type { AppRole } from './roles'

export type CurrentProfile = { id: string; fullName: string; role: AppRole }

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  if (!hasSupabaseEnv()) return null
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('id, full_name, role').eq('id', user.id).maybeSingle()
  if (!profile) return null
  return { id: profile.id, fullName: profile.full_name, role: profile.role as AppRole }
}

export async function requireProfile() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')
  return profile
}
