import { requireProfile } from '@/lib/auth/session'
import { RideRequest } from '@/components/passenger/ride-request'

export const dynamic = 'force-dynamic'

export default async function RequestRidePage() {
  await requireProfile()
  return <main className="min-h-screen bg-[#f8f6ef]"><div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-10"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Nuevo viaje · Formosa</p><h1 className="mt-2 font-serif text-4xl text-balance sm:text-5xl">Tu próximo destino empieza acá.</h1><p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">Elegí origen y destino, revisá tu recorrido y confirmá solamente cuando tengas una tarifa válida.</p></div><RideRequest /></div></main>
}
