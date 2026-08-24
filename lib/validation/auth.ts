export type AuthInput = { email: string; password: string; fullName?: string }

export function validateAuthInput(input: AuthInput, mode: 'login' | 'register' | 'reset') {
  const email = input.email.trim()
  if (!email || !email.includes('@') || email.length > 254) return 'Ingresá un email válido.'
  if (mode !== 'reset' && input.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
  if (mode === 'register' && (!input.fullName || input.fullName.trim().length < 2 || input.fullName.trim().length > 120)) return 'Ingresá tu nombre completo.'
  return null
}
