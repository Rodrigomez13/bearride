import Link from 'next/link'
import { requireProfile } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const profile = await requireProfile()
  const supabase = await createClient()
  const { data: rides } = await supabase.from('rides').select('id, status, fare_cents, created_at').eq('passenger_id', profile.id).order('created_at', { ascending: false }).limit(30)
  return <main className="mx-auto max-w-3xl p-5 lg:p-10"><Link href="/passenger" className="text-sm font-semibold text-primary">← Volver</Link><h1 className="mt-4 font-serif text-4xl">Tus viajes</h1><div className="mt-7 grid gap-3">{rides?.length ? rides.map((ride) => <article key={ride.id} className="rounded-2xl border border-border bg-card p-5"><p className="font-semibold">{ride.status}</p><p className="mt-1 text-sm text-muted-foreground">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(ride.fare_cents / 100)}</p></article>) : <p className="rounded-2xl border border-border bg-card p-5 text-muted-foreground">Todavía no tenés viajes registrados.</p>}</div></main>
}
