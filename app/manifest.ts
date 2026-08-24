import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BearRide',
    short_name: 'BearRide',
    description: 'Movilidad urbana segura para pasajeros y conductores.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7fbf7',
    theme_color: '#0f554f',
    lang: 'es-AR',
    icons: [
      { src: '/assets/bearrider/app-icons/android-icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/assets/bearrider/app-icons/android-icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
