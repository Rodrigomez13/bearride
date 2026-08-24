type SupabaseEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string
}

export function hasSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  return typeof url === 'string' && URL.canParse(url) && typeof key === 'string' && key.length > 0
}

export function getSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (typeof url !== 'string' || !URL.canParse(url) || typeof key !== 'string' || key.length === 0) {
    throw new Error('Supabase environment variables are not configured.')
  }
  return { NEXT_PUBLIC_SUPABASE_URL: url, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key }
}

export function getSupabaseRedirectUrl(origin: string) {
  const configuredOrigin = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
  const base = configuredOrigin && URL.canParse(configuredOrigin) ? configuredOrigin.replace(/\/$/, '') : origin
  return `${base}/auth/callback?next=%2Fpassenger`
}
