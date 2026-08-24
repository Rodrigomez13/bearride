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
- Mapa MapLibre con estilo OpenFreeMap, geocodificación limitada a Formosa y
  cálculo de rutas mediante OSRM. La búsqueda se ejecuta desde el servidor y
  no usa el Nominatim público para autocompletado.
- El pasajero obtiene una cotización desde la función SQL autorizada y confirma
  la solicitud mediante `create_ride_request`; el conductor aprobado puede
  activar/desactivar disponibilidad con ubicación del dispositivo.
- Contratos para proveedor de pagos y proveedor de notificaciones, manifiesto
  PWA y pruebas unitarias de tarifas y estados.

## Aún bloqueado por configuración externa

No se aplicaron migraciones ni se creó un usuario de prueba desde este
repositorio. La verificación de punta a punta requiere que las migraciones y
reglas de tarifa estén aplicadas en el proyecto Supabase configurado.

Para continuar con verificación funcional se debe:

1. Aplicar `supabase/migrations/` en un proyecto Supabase de desarrollo.
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
