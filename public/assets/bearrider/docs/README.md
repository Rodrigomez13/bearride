# Beargo Asset Pack

Este paquete reúne los assets visuales de referencia entregados para Beargo/BearRide y derivados preparados para una implementación web/PWA.

## Uso recomendado

- `branding/`: identidad principal.
- `app-icons/`: favicon, Apple Touch Icon y tamaños PWA.
- `roles/`: selección de pasajero/conductor.
- `banners/`: secciones de seguridad y descarga de la app.
- `map/`: marcadores SVG editables para Mapbox.
- `docs/asset-manifest.json`: rutas sugeridas para integrar los assets.

## Criterio de implementación

No reemplazar estos assets por placeholders durante el desarrollo. Mantenerlos centralizados en `public/assets/beargo/` dentro del proyecto y reutilizarlos desde componentes.

Para producción, preferir WebP/AVIF para imágenes fotográficas o banners cuando el pipeline de Next.js pueda optimizarlas; conservar PNG/SVG como fuentes cuando corresponda.
