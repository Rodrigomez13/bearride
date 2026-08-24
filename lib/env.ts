import { z } from 'zod'

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
})

export function hasSupabaseEnv() {
  return publicSchema.safeParse(process.env).success
}

export function getSupabaseEnv() {
  return publicSchema.parse(process.env)
}
