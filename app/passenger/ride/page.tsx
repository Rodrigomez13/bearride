import { requireProfile } from '@/lib/auth/session'
import { RideRequest } from '@/components/passenger/ride-request'

export const dynamic = 'force-dynamic'

export default async function RequestRidePage() {
  await requireProfile()
  return <main className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-5 lg:p-10"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Nuevo viaje · Formosa</p><h1 className="mt-2 font-serif text-4xl text-balance sm:text-5xl">Tu próximo destino empieza acá</h1><p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">Elegí tu punto de partida, consultá direcciones y confirmá una tarifa validada antes de pedir el viaje.</p></div><RideRequest /></main>
}
