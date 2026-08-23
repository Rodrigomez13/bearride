'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowUpDown, Bell, CarFront, ChevronRight, Clock3, Crosshair, Home, MapPin, Menu, Navigation, Search, ShieldCheck, Star, UserRound, X } from 'lucide-react'

const rides = [
  { id: 'beargo', name: 'Beargo', detail: 'Viaje cómodo', time: '3 min', price: '$8.40', icon: CarFront },
  { id: 'beargo-plus', name: 'Beargo Plus', detail: 'Más espacio', time: '5 min', price: '$11.20', icon: Navigation },
  { id: 'beargo-green', name: 'Beargo Green', detail: '100% eléctrico', time: '7 min', price: '$9.80', icon: ShieldCheck },
]

export default function BeargoApp() {
  const [selectedRide, setSelectedRide] = useState('beargo')
  const [menuOpen, setMenuOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const [destination, setDestination] = useState('')

  return (
    <main className="min-h-screen bg-background text-foreground lg:flex">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-sidebar p-7 lg:flex">
        <Brand />
        <nav className="mt-16 flex flex-col gap-2" aria-label="Navegación principal">
          <NavItem icon={Home} label="Inicio" active />
          <NavItem icon={Clock3} label="Tus viajes" />
          <NavItem icon={Star} label="Favoritos" />
        </nav>
        <div className="mt-auto rounded-2xl bg-primary p-5 text-primary-foreground">
          <ShieldCheck className="mb-8 size-6" />
          <p className="font-serif text-xl leading-tight">Viaja tranquilo.<br />Nosotros cuidamos el camino.</p>
          <p className="mt-3 text-xs leading-5 text-primary-foreground/65">Conductores verificados y soporte 24/7.</p>
        </div>
        <div className="mt-7 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-secondary"><UserRound className="size-4" /></div>
          <div><p className="text-sm font-semibold">Alex Morgan</p><p className="text-xs text-muted-foreground">Cuenta personal</p></div>
          <ChevronRight className="ml-auto size-4 text-muted-foreground" />
        </div>
      </aside>

      <section className="relative min-h-screen flex-1 overflow-hidden">
        <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 lg:px-10 lg:py-8">
          <div className="lg:hidden"><Brand /></div>
          <div className="ml-auto flex items-center gap-3">
            <button className="flex size-10 items-center justify-center rounded-full border border-border/70 bg-background/90" aria-label="Notificaciones"><Bell className="size-4" /></button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex size-10 items-center justify-center rounded-full border border-border/70 bg-background/90 lg:hidden" aria-label="Abrir menú">{menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}</button>
          </div>
        </header>

        <div className="map-grid absolute inset-0 bg-[#dfe9e5]">
          <div className="road road-one" /><div className="road road-two" /><div className="road road-three" />
          <div className="map-label label-one">Riverside Ave</div><div className="map-label label-two">Market Street</div>
          <div className="park park-one" /><div className="park park-two" />
          <div className="pin pin-start"><div className="pin-dot" /></div><div className="pin pin-end"><MapPin className="size-5 fill-primary text-primary-foreground" /></div>
          <div className="route-line" />
          <button className="absolute bottom-[42%] right-6 flex size-11 items-center justify-center rounded-full border border-border bg-background/90 shadow-sm" aria-label="Centrar mapa"><Crosshair className="size-4" /></button>
        </div>

        <div className="relative z-10 flex min-h-screen items-end p-4 pt-28 lg:items-start lg:p-10 lg:pt-32">
          <div className="w-full max-w-[430px] rounded-[26px] border border-border/80 bg-card/95 p-5 shadow-2xl shadow-primary/10 backdrop-blur-md lg:p-7">
            <div className="mb-7 flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Buenos días, Alex</p><h1 className="mt-2 font-serif text-3xl tracking-tight">¿A dónde vamos?</h1></div><div className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">● En línea</div></div>
            <div className="relative flex flex-col gap-2">
              <div className="absolute left-[15px] top-8 h-7 border-l border-dashed border-muted-foreground/50" />
              <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/45 px-3 py-3"><div className="size-2 rounded-full bg-primary" /><input aria-label="Punto de partida" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" defaultValue="Mi ubicación actual" /></div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/45 px-3 py-3"><MapPin className="size-4 text-primary" /><input aria-label="Destino" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="¿Cuál es tu destino?" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" /><Search className="size-4 text-muted-foreground" /></div>
              <button className="absolute -right-2 top-1/2 flex size-8 -translate-y-1/2 translate-x-full items-center justify-center rounded-full border border-border bg-card shadow-sm lg:right-0 lg:translate-x-[calc(100%+8px)]" aria-label="Intercambiar ubicaciones"><ArrowUpDown className="size-3.5" /></button>
            </div>

            <div className="mt-7 flex items-center justify-between"><h2 className="font-semibold">Elige tu viaje</h2><button className="text-xs font-medium text-primary">Ver opciones</button></div>
            <div className="mt-3 flex flex-col gap-2">{rides.map((ride) => { const Icon = ride.icon; return <button key={ride.id} onClick={() => setSelectedRide(ride.id)} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${selectedRide === ride.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-card hover:bg-secondary/50'}`}><div className="flex size-10 items-center justify-center rounded-lg bg-secondary"><Icon className="size-5 text-primary" /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{ride.name}</p><p className="text-xs text-muted-foreground">{ride.detail} · {ride.time}</p></div><p className="text-sm font-bold">{ride.price}</p></button> })}</div>
            <button onClick={() => { setSearching(true); setTimeout(() => setSearching(false), 2200) }} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground transition hover:opacity-90">{searching ? 'Buscando conductor...' : 'Confirmar Beargo'}<ChevronRight className="size-4" /></button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">Precio estimado · Sin cargos sorpresa</p>
          </div>
        </div>
      </section>
    </main>
  )
}

function Brand() { return <div className="flex items-center gap-3"><Image src="/beargo-logo.png" alt="Beargo" width={38} height={38} className="rounded-xl" /><span className="font-serif text-2xl font-semibold tracking-tight">beargo<span className="text-amber-600">.</span></span></div> }
function NavItem({ icon: Icon, label, active = false }: { icon: typeof Home; label: string; active?: boolean }) { return <button className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}><Icon className="size-4" />{label}</button> }

