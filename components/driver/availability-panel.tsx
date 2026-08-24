'use client'

import { useState } from 'react'
import { LocateFixed, Power, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function AvailabilityPanel({ approved, initiallyOnline }: { approved: boolean; initiallyOnline: boolean }) {
  const [online, setOnline] = useState(initiallyOnline)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const updateAvailability = () => {
    if (!approved) return
    setLoading(true); setMessage('')
    const submit = async (latitude?: number, longitude?: number) => {
      const { error } = await createClient().rpc('update_driver_availability', { p_is_online: !online, p_latitude: latitude ?? null, p_longitude: longitude ?? null })
      if (error) setMessage(error.message); else { setOnline(!online); setMessage(!online ? 'Estás online y disponible para recibir solicitudes.' : 'Quedaste offline. No recibirás nuevas solicitudes.') }
      setLoading(false)
    }
    if (!online && navigator.geolocation) navigator.geolocation.getCurrentPosition((position) => { void submit(position.coords.latitude, position.coords.longitude) }, () => { void submit() }, { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 })
    else void submit()
  }

  return <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Estado de conducción</p><h2 className="mt-1 font-serif text-3xl">{online ? 'Estás disponible' : 'Estás fuera de línea'}</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{approved ? 'Cuando estés online, compartimos tu última ubicación solo para asignar viajes de forma segura.' : 'Tu cuenta todavía está en revisión. Te avisaremos cuando puedas recibir viajes.'}</p></div><span className={`rounded-full px-3 py-2 text-sm font-bold ${online ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>{online ? '● Online' : '● Offline'}</span></div><button type="button" disabled={!approved || loading} onClick={updateAvailability} className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"><Power className="size-4" />{loading ? 'Actualizando…' : online ? 'Dejar de recibir viajes' : 'Conectarme y recibir viajes'}</button>{message && <p role="status" className="mt-4 flex items-start gap-2 rounded-xl bg-secondary p-3 text-sm text-muted-foreground"><LocateFixed className="mt-0.5 size-4 shrink-0 text-primary" />{message}</p>}<p className="mt-5 flex gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-4 shrink-0 text-primary" />Tu ubicación se solicita al conectarte; el servidor verifica que tu cuenta esté aprobada.</p></section>
}
