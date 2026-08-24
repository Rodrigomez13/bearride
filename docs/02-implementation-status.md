# Estado de implementación — rama `bearride`

## Implementado en código

- Auth SSR de Supabase con clientes de navegador/servidor, refresh mediante
  `proxy.ts`, registro, inicio de sesión, recuperación y cierre de sesión.
- Rutas de pasajero, conductor y administración protegidas en servidor. La
  administración valida el rol de perfil, no un valor entregado por el cliente.
- Esquema PostgreSQL/Supabase con PostGIS, perfiles, conductores, vehículos,
  solicitudes, viajes, ubicaciones históricas, pagos, favoritos, ratings,
  notificaciones, reglas de tarifas, zonas, soporte y documentos.
- RLS con política restrictiva. La ubicación de conductores no es legible para
  usuarios ajenos; su disponibilidad solo se actualiza mediante una función
  SQL que exige conductor aprobado.
- Funciones SQL para cotizar, crear solicitudes y transicionar viajes. El
  precio y el estado se calculan/validan en base de datos.
- Carga diferida de Mapbox solo en la ruta de solicitud; no existe un mapa CSS
  que simule ser real.
- Contratos para proveedor de pagos y proveedor de notificaciones, manifiesto
  PWA y pruebas unitarias de tarifas y estados.

## Aún bloqueado por configuración externa

No se aplicó ninguna migración ni se creó un usuario de prueba porque no hay un
proyecto Supabase ni credenciales proporcionadas. Tampoco se puede activar
geocoding/rutas de Mapbox sin `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`.

Para continuar con verificación funcional se debe:

1. Copiar `.env.example` a `.env.local` y completar URL y publishable key de
   Supabase, más el token público de Mapbox.
2. Aplicar `supabase/migrations/` en un proyecto Supabase de desarrollo.
3. Configurar URLs de redirección de Auth para `/verify` y recuperación.
4. Cargar reglas de tarifa aprobadas para la zona Formosa inicial. Se dejó la
   zona, pero no se inventaron precios comerciales.
5. Conectar un proveedor de notificaciones y el proveedor de pagos elegido.

## Verificaciones locales

- `pnpm test`: 5 pruebas unitarias aprobadas.
- `pnpm typecheck`: aprobado.
- `next build`: aprobado.

Las pruebas de integración/RLS, E2E, geocoding y Realtime requieren los
servicios externos configurados y no se presentan como validadas todavía.
