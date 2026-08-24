import { redirect } from 'next/navigation'
import { AppHeader } from '@/components/navigation/app-header'
import { requireProfile } from '@/lib/auth/session'
import { canAccessAdmin } from '@/lib/auth/roles'
export const dynamic = 'force-dynamic'
export default async function AdminPage() { const profile = await requireProfile(); if (!canAccessAdmin(profile.role)) redirect('/passenger'); return <main><AppHeader profile={profile} /><section className="mx-auto max-w-4xl p-5 lg:p-10"><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Administración</p><h1 className="mt-2 font-serif text-4xl">Operación BearRide</h1><p className="mt-4 text-muted-foreground">La consola se irá habilitando por dominio: conductores, tarifas, viajes, incidencias y zonas. El acceso depende del rol registrado en servidor y de RLS.</p></section></main> }
