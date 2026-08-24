import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().email('Ingresá un email válido.'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
})

export const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(2, 'Ingresá tu nombre completo.').max(120),
})
