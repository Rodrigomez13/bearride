import Link from 'next/link'
import { LogOut } from 'lucide-react'
import type { CurrentProfile } from '@/lib/auth/session'
export function AppHeader({ profile }: { profile: CurrentProfile }) { return <header className="flex items-center justify-between border-b border-border bg-card px-5 py-4"><Link href="/" className="font-serif text-2xl font-bold">Bear<span className="text-primary">Ride</span></Link><div className="flex items-center gap-3 text-sm"><span className="hidden text-muted-foreground sm:inline">{profile.fullName}</span><form action="/auth/signout" method="post"><button className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 font-semibold"><LogOut className="size-4" />Salir</button></form></div></header> }
