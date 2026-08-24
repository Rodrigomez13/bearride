# BearRide

Plataforma de movilidad urbana construida con Next.js, Supabase y Mapbox.

## Configuración local

1. Copiá `.env.example` como `.env.local` y completá las credenciales de Supabase y Mapbox.
2. Aplicá las migraciones de `supabase/migrations/` en tu proyecto Supabase.
3. Ejecutá `pnpm dev`.

Para validar la base de código:

```bash
pnpm test
pnpm typecheck
pnpm build
```

El estado de los límites externos y las verificaciones está en `docs/02-implementation-status.md`.
