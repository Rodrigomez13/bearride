import { AppHeader } from '@/components/navigation/app-header'
import { requireProfile } from '@/lib/auth/session'
export const dynamic = 'force-dynamic'
export default async function DriverPage() { const profile = await requireProfile(); return <main><AppHeader profile={profile} /><section className="mx-auto max-w-3xl p-5 lg:p-10"><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Panel de conductor</p><h1 className="mt-2 font-serif text-4xl">Disponibilidad y viajes</h1><p className="mt-4 rounded-2xl border border-border bg-card p-5 text-muted-foreground">El estado online solo se habilitará para conductores aprobados por el equipo administrativo. Las solicitudes se asignarán mediante una transición validada en servidor.</p></section></main> }
