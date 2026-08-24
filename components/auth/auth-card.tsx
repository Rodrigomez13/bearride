'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSupabaseRedirectUrl } from '@/lib/env'
import { validateAuthInput } from '@/lib/validation/auth'

type Mode = 'login' | 'register' | 'reset'

export function AuthCard({ mode }: { mode: Mode }) {
  const [message, setMessage] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  async function signInWithGoogle() {
    setSubmitting(true)
    setMessage(undefined)
    const { error } = await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getSupabaseRedirectUrl(window.location.origin) },
    })
    if (error) {
      setMessage('No fue posible iniciar sesión con Google. Revisá la configuración del proveedor.')
      setSubmitting(false)
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(undefined)
    const fields = new FormData(event.currentTarget)
    const email = String(fields.get('email') ?? '')
    const password = String(fields.get('password') ?? '')
    const fullName = String(fields.get('fullName') ?? '')
    const validationError = validateAuthInput({ email, password, fullName }, mode)
    if (validationError) return setMessage(validationError)
    setSubmitting(true)
    const supabase = createClient()
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) setMessage('No fue posible iniciar sesión. Verificá tus credenciales.')
      else window.location.assign('/passenger')
    } else if (mode === 'register') {
      const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: fullName.trim() }, emailRedirectTo: `${window.location.origin}/auth/callback` } })
      setMessage(error ? 'No fue posible crear la cuenta.' : 'Revisá tu email para verificar tu cuenta antes de ingresar.')
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/auth/callback` })
      setMessage(error ? 'No fue posible enviar el email de recuperación.' : 'Si existe una cuenta, recibirás instrucciones para recuperar el acceso.')
    }
    setSubmitting(false)
  }

  const title = mode === 'login' ? 'Ingresá a BearRide' : mode === 'register' ? 'Creá tu cuenta' : 'Recuperá tu acceso'
  return <section className="w-full max-w-md rounded-[2rem] border border-white bg-card p-6 shadow-2xl shadow-foreground/10 sm:p-9"><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{mode === 'register' ? 'Empezá en minutos' : 'Bienvenido a BearRide'}</p><h1 className="mt-3 font-serif text-4xl tracking-tight">{title}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{mode === 'login' ? 'Ingresá para pedir un viaje o gestionar tu actividad como conductor.' : mode === 'register' ? 'Creá tu cuenta para empezar a moverte de otra forma.' : 'Te enviaremos un enlace seguro para recuperar tu cuenta.'}</p>{mode !== 'reset' && <><button type="button" onClick={signInWithGoogle} disabled={submitting} className="mt-7 flex min-h-12 w-full items-center justify-center rounded-xl border border-border bg-background px-4 py-3 text-sm font-bold text-foreground transition hover:border-primary hover:bg-secondary disabled:opacity-60">Continuar con Google</button><div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" /><span>o ingresá con tu email</span><span className="h-px flex-1 bg-border" /></div></>}<form className={mode === 'reset' ? 'mt-7 space-y-4' : 'space-y-4'} onSubmit={onSubmit}>{mode === 'register' && <Field name="fullName" label="Nombre completo" autoComplete="name" />}<Field name="email" label="Email" type="email" autoComplete="email" />{mode !== 'reset' && <Field name="password" label="Contraseña" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />}{message && <p aria-live="polite" className="rounded-xl bg-secondary px-3 py-3 text-sm text-foreground">{message}</p>}<button disabled={submitting} className="mt-2 min-h-12 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 disabled:opacity-60">{submitting ? 'Procesando…' : mode === 'login' ? 'Ingresar a mi cuenta' : mode === 'register' ? 'Crear mi cuenta' : 'Enviar instrucciones'}</button></form><nav className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-primary">{mode !== 'login' && <Link href="/login">Ingresar</Link>}{mode !== 'register' && <Link href="/register">Crear cuenta</Link>}{mode !== 'reset' && <Link href="/reset-password">Olvidé mi contraseña</Link>}</nav></section>
}
function Field({ name, label, type = 'text', autoComplete }: { name: string; label: string; type?: string; autoComplete?: string }) { return <label className="grid gap-2 text-sm font-semibold"><span>{label}</span><input required name={name} type={type} autoComplete={autoComplete} className="rounded-xl border border-border bg-background px-3 py-3 outline-none ring-primary focus:ring-2" /></label> }
