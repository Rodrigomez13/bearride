import Link from 'next/link'
import { LogOut } from 'lucide-react'
import type { CurrentProfile } from '@/lib/auth/session'
export function AppHeader({ profile }: { profile: CurrentProfile }) {
  return <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/80 bg-background/90 px-5 py-4 backdrop-blur lg:px-10">
    <Link href="/" className="flex items-center gap-2 font-serif text-2xl font-bold tracking-tight">Bear<span className="text-primary">Ride</span><span className="ml-1 hidden rounded-full bg-secondary px-2 py-1 font-sans text-[10px] font-bold uppercase tracking-[.16em] text-secondary-foreground sm:inline">Formosa</span></Link>
    <div className="flex items-center gap-3 text-sm"><span className="hidden text-right sm:block"><strong className="block text-xs">{profile.fullName}</strong><span className="text-xs text-muted-foreground">{profile.role === 'DRIVER' ? 'Conductor verificado' : 'Pasajero'}</span></span><form action="/auth/signout" method="post"><button aria-label="Cerrar sesión" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-card px-3 py-2 font-semibold transition hover:border-primary"><LogOut className="size-4" />Salir</button></form></div>
  </header>
}
