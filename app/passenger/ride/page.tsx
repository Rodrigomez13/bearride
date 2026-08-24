import { requireProfile } from '@/lib/auth/session'
import { MapboxMap } from '@/components/map/mapbox-map'
export const dynamic = 'force-dynamic'
export default async function RequestRidePage() { await requireProfile(); return <main className="mx-auto max-w-2xl p-5 lg:p-10"><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Nuevo viaje</p><h1 className="mt-2 font-serif text-4xl">Elegí tu destino</h1><div className="mt-6"><MapboxMap /></div><p className="mt-4 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">El mapa se carga solo en esta pantalla. La búsqueda, geocoding, rutas y cotización se habilitan cuando exista un token de Mapbox y una zona de servicio activa. No se muestra una tarifa ni un conductor simulados.</p></main> }
