'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { signInSchema, signUpSchema } from '@/lib/validation/auth'

type Mode = 'login' | 'register' | 'reset'

export function AuthCard({ mode }: { mode: Mode }) {
  const [message, setMessage] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(undefined)
    const fields = new FormData(event.currentTarget)
    const email = String(fields.get('email') ?? ''), password = String(fields.get('password') ?? ''), fullName = String(fields.get('fullName') ?? '')
    const parsed = mode === 'register' ? signUpSchema.safeParse({ email, password, fullName }) : signInSchema.safeParse({ email, password })
    if (!parsed.success) return setMessage(parsed.error.issues[0]?.message ?? 'Revisá los datos ingresados.')
    setSubmitting(true)
    const supabase = createClient()
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage('No fue posible iniciar sesión. Verificá tus credenciales.'); else window.location.assign('/passenger')
    } else if (mode === 'register') {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/verify` } })
      setMessage(error ? 'No fue posible crear la cuenta.' : 'Revisá tu email para verificar tu cuenta antes de ingresar.')
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/verify` })
      setMessage(error ? 'No fue posible enviar el email de recuperación.' : 'Si existe una cuenta, recibirás instrucciones para recuperar el acceso.')
    }
    setSubmitting(false)
  }
  const title = mode === 'login' ? 'Ingresá a BearRide' : mode === 'register' ? 'Creá tu cuenta' : 'Recuperá tu acceso'
  return <section className="w-full max-w-md rounded-[28px] border border-border bg-card p-6 shadow-xl shadow-foreground/5 sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Movilidad segura</p><h1 className="mt-2 font-serif text-3xl tracking-tight">{title}</h1><form className="mt-7 space-y-4" onSubmit={onSubmit}>{mode === 'register' && <Field name="fullName" label="Nombre completo" autoComplete="name" />}<Field name="email" label="Email" type="email" autoComplete="email" />{mode !== 'reset' && <Field name="password" label="Contraseña" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />}{message && <p aria-live="polite" className="rounded-xl bg-secondary px-3 py-3 text-sm text-foreground">{message}</p>}<button disabled={submitting} className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60">{submitting ? 'Procesando…' : mode === 'login' ? 'Ingresar' : mode === 'register' ? 'Crear cuenta' : 'Enviar instrucciones'}</button></form><nav className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-primary">{mode !== 'login' && <Link href="/login">Ingresar</Link>}{mode !== 'register' && <Link href="/register">Crear cuenta</Link>}{mode !== 'reset' && <Link href="/reset-password">Olvidé mi contraseña</Link>}</nav></section>
}
function Field({ name, label, type = 'text', autoComplete }: { name: string; label: string; type?: string; autoComplete?: string }) { return <label className="grid gap-2 text-sm font-semibold"><span>{label}</span><input required name={name} type={type} autoComplete={autoComplete} className="rounded-xl border border-border bg-background px-3 py-3 outline-none ring-primary focus:ring-2" /></label> }
