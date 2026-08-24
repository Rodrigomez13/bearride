# BearRide

Plataforma de movilidad urbana construida con Next.js y Supabase.

## Configuración local

1. Copiá `.env.example` como `.env.local` y completá las credenciales de Supabase.
2. Aplicá las migraciones de `supabase/migrations/` en tu proyecto Supabase.
3. Ejecutá `pnpm dev`.

Para validar la base de código:

```bash
pnpm test
pnpm typecheck
pnpm build
```

El estado de los límites externos y las verificaciones está en `docs/02-implementation-status.md`.

## Mapa y geolocalización

El entorno de desarrollo usa MapLibre con OpenFreeMap para visualizar el mapa,
Photon para buscar direcciones y OSRM para calcular rutas. Los tres servicios
son públicos y se consultan desde rutas del servidor con límites y caché; son
adecuados para el piloto, no para una operación comercial de alto volumen.
Antes de producción se debe contratar o autoalojar el proveedor elegido.
