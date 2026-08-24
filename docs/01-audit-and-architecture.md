# Beargo: auditoria y arquitectura inicial

Fecha de auditoria: 2026-08-24.

## Estado actual

El repositorio es un prototipo visual de Next.js 16 con una unica ruta (`/`) y
un componente cliente principal (`components/beargo-app.tsx`). No existe aun
persistencia, autenticacion, rutas por rol, endpoints, pruebas ni configuracion
de variables de entorno.

La pantalla actual es una buena base estetica para el flujo de pasajero. Se
conservaran su paleta, marca y patrones de tarjeta; se reemplazaran sus datos y
acciones simulados por flujos reales de forma incremental.

## Hallazgos prioritarios

1. `components/beargo-app.tsx` concentra interfaz, datos de viaje simulados y
   estado transitorio. Sus precios, ETA, usuario, disponibilidad, mapa y
   busqueda de conductor son valores locales que no representan estado real.
2. El mapa es CSS decorativo. Aunque `mapbox-gl` esta en las dependencias, no
   hay token, carga diferida, geocoding ni ruta.
3. `next.config.mjs` desactiva los errores de TypeScript durante el build y
   fuerza imagenes sin optimizar. Ambas opciones impiden una garantia de
   produccion y se retiraran al incorporar una validacion estable.
4. No hay scripts de `lint`, `typecheck` ni `test`; tampoco hay configuracion
   de ESLint, pruebas, migraciones, CI o manejo documentado de secretos.
5. No existen limites de confianza: cualquier futura mutacion hecha desde el
   cliente seria vulnerable hasta que se creen RLS, autorizacion de servidor y
   validacion de entrada.
6. Los assets entregados estan en `public/assets/bearrider/` y aun no estan
   versionados. Su README sugiere otra ruta (`public/assets/beargo/`), por lo
   que se debe elegir una unica ruta antes de referenciarlos en codigo. Para no
   romper la copia suministrada, la primera integracion usara la ruta existente
   y una migracion posterior, atomica, podra renombrarla.

## Arquitectura objetivo incremental

```text
app/
  (auth)/login | register | verify | reset-password
  passenger/ride | history | favorites | profile
  driver/ride | earnings | profile
  admin/dashboard | users | drivers | rides | pricing | settings
  api/                         # solo adaptadores HTTP necesarios
components/
  map/ ride/ passenger/ driver/ admin/ navigation/ ui/
lib/
  auth/ database/ maps/ rides/ pricing/ notifications/ payments/
  validation/ utils/
supabase/
  migrations/ seed.sql
tests/
  unit/ integration/ e2e/
```

Las paginas seran componentes de servidor por defecto. Solo mapas, captura de
GPS y controles interactivos seran componentes cliente. El acceso a Supabase
se separara en clientes de navegador y servidor; las mutaciones de negocio se
haran por funciones/RPC o acciones de servidor validadas, nunca actualizando
tablas desde estado local.

## Limites de confianza

- El servidor calcula tarifas, decide transiciones de viaje y valida el rol.
- El cliente puede solicitar una accion, pero no aportar un precio, rol,
  identidad, asignacion ni estado autoritativo.
- RLS sera la segunda barrera: pasajero, conductor y personal solo podran leer
  y modificar sus filas permitidas. Las operaciones privilegiadas usaran una
  funcion SQL con comprobacion explicita de rol.
- La ubicacion activa viaja por Realtime/presence; la tabla historica recibe
  puntos muestreados de un viaje, no cada ping de GPS.

## Modelo inicial de datos

| Dominio | Tablas y responsabilidad |
| --- | --- |
| Identidad | `profiles`, con rol de aplicacion validado; `drivers`, `vehicles` y documentos de conductor separados. |
| Viajes | `ride_requests`, `rides`, `ride_locations`, `ratings`, `favorites`. |
| Operacion | `pricing_rules`, `service_zones`, `notifications`, `support_tickets`, `payments`. |

Se usaran UUID, claves foraneas, `created_at`/`updated_at`, restricciones de
unicidad para ratings por viaje e indices compuestos para consultas por estado,
conductor, pasajero y tiempo. La seleccion geografica se diseniara con PostGIS
y un indice espacial sobre la ultima ubicacion persistida del conductor, sin
consultar a todos los conductores.

## Maquina de estados propuesta

`IDLE -> REQUESTING -> SEARCHING_DRIVER -> DRIVER_ASSIGNED ->
DRIVER_ARRIVING -> DRIVER_ARRIVED -> TRIP_STARTED -> TRIP_COMPLETED ->
PAYMENT_PENDING -> COMPLETED`

`CANCELLED` solo sera alcanzable desde los estados habilitados por politica. La
transicion se aplicara en servidor con comprobacion de actor y version/estado
actual para impedir carreras o saltos arbitrarios.

## Secuencia de entrega

1. **Etapa 1 (actual):** auditoria, decisiones de arquitectura y preservacion
   de la linea visual actual.
2. **Etapa 2:** proyecto Supabase, migracion inicial, Auth, clientes SSR y RLS.
3. **Etapa 3:** separar la vista monolitica en rutas y componentes, sin
   sustituir la identidad visual.
4. **Etapas 4 a 6:** Mapbox diferido, geocoding, pricing de servidor y maquina
   de estados con pruebas unitarias.
5. **Etapas 7 a 10:** MVP de pasajero, conductor, ubicacion realtime y consola
   administrativa protegida.
6. **Etapas 11 a 14:** notificaciones, pruebas de integracion/E2E y seguridad,
   optimizacion y PWA/lanzamiento.

## Condiciones para iniciar la etapa 2

Se necesita un proyecto Supabase controlado por el titular (URL y anon key para
desarrollo; la service role nunca se expone al navegador), la politica de altas
de conductores y una decision sobre el entorno de despliegue. Mientras tanto se
puede preparar codigo no secreto, pero no es seguro inventar credenciales ni
marcar la autenticacion como funcional.

## Verificacion de esta etapa

- Se inspeccionaron todos los archivos de aplicacion, configuracion y assets
  presentes en el repositorio.
- No se modificaron componentes ni assets del prototipo.
- `pnpm exec tsc --noEmit` y `pnpm build` no pudieron completarse porque no hay
  dependencias instaladas en el directorio de trabajo; la instalacion no
  finalizo dentro del limite de ejecucion. Debe repetirse tras una instalacion
  completa antes de aprobar cualquier cambio de codigo.
