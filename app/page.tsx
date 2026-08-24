import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/session'
import { hasSupabaseEnv } from '@/lib/env'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const profile = await getCurrentProfile()
  if (profile) redirect(profile.role === 'DRIVER' ? '/driver' : '/passenger')
  if (!hasSupabaseEnv()) return <main className="grid min-h-screen place-items-center bg-background p-5"><section className="max-w-xl rounded-[28px] border border-border bg-card p-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Configuración requerida</p><h1 className="mt-2 font-serif text-4xl">BearRide está preparando su operación.</h1><p className="mt-4 leading-7 text-muted-foreground">Falta configurar Supabase para habilitar cuentas, perfiles y autorización real. La aplicación no simula viajes mientras esa conexión no exista.</p></section></main>
  return <main className="grid min-h-screen place-items-center bg-background p-5"><section className="max-w-xl text-center"><h1 className="font-serif text-5xl">Bear<span className="text-primary">Ride</span></h1><p className="mt-4 text-muted-foreground">Movilidad simple, segura y cercana.</p><Link href="/login" className="mt-7 inline-block rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">Ingresar</Link></section></main>
}
