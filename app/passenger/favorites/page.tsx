import Link from 'next/link'
import { requireProfile } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function FavoritesPage() {
  const profile = await requireProfile()
  const supabase = await createClient()
  const { data: favorites } = await supabase.from('favorites').select('id, label, address').eq('profile_id', profile.id).order('created_at', { ascending: false })
  return <main className="mx-auto max-w-3xl p-5 lg:p-10"><Link href="/passenger" className="text-sm font-semibold text-primary">← Volver</Link><h1 className="mt-4 font-serif text-4xl">Destinos favoritos</h1><div className="mt-7 grid gap-3">{favorites?.length ? favorites.map((favorite) => <article key={favorite.id} className="rounded-2xl border border-border bg-card p-5"><p className="font-semibold">{favorite.label}</p><p className="mt-1 text-sm text-muted-foreground">{favorite.address}</p></article>) : <p className="rounded-2xl border border-border bg-card p-5 text-muted-foreground">Guardá tus destinos frecuentes para pedir más rápido.</p>}</div></main>
}
