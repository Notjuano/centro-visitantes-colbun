# Centro de Visitantes Colbún — Catálogo Digital Interactivo

Sistema de Catálogo Digital Interactivo y Gestión de Experiencia para el Centro de Visitantes Colbún.

## Pila tecnológica

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — sistema de diseño propio ("Cauce": tonos basalto, cauce/turquesa y ember)
- **lucide-react** — iconografía
- **Arquitectura JAMstack / PWA-ready** (`public/manifest.json`)

## Estructura del proyecto

```
app/
  page.tsx                  Pantalla de inicio (selección de modo Móvil / Tótem)
  mapa/page.tsx             Mapa Vivo del Bío Bío (capas, puntos, tiempo real, comparación)
  ar/[id]/page.tsx           Experiencia AR del modelo 3D (escaneo por QR)
  catalogo/page.tsx          Catálogo digital interactivo (estaciones + audio + AR)
  encuesta/page.tsx          Encuesta de satisfacción (< 60s)
  admin/dashboard/page.tsx   Panel administrativo (CMS + métricas)
  layout.tsx, globals.css
components/
  mapa/MapaVivo.tsx          Interfaz táctil a pantalla completa del mapa
  ui/Navbar.tsx, Footer.tsx, AudioPlayer.tsx, StationCard.tsx, FeedbackForm.tsx
lib/
  data.ts   Datos mock de estaciones y métricas
  mapa.ts   Capas, puntos de interés y métricas del territorio
  utils.ts  Utilidad cn() para clases Tailwind
public/
  images/   Ilustraciones y fotografías del mapa vivo
  audio/    Carpeta destino de los archivos de audio descriptivo (.mp3)
  manifest.json  Manifest PWA
```

## Accesibilidad (WCAG 2.1)

- Navegación por teclado con foco visible (`:focus-visible`).
- `skip-link` para saltar al contenido principal.
- Reproductor de audio con transcripción textual alternativa (criterio 1.2.1).
- Roles ARIA (`radiogroup`, `role="alert"`, `aria-current`, `aria-pressed`) en componentes interactivos.
- Respeta `prefers-reduced-motion`.

## Puesta en marcha local

```bash
npm install
npm run dev
```

La app queda disponible en `http://localhost:3000`.

El recorrido in situ parte en `/mapa` (Mapa Vivo del Bío Bío). Ahí se pueden activar capas, abrir puntos de interés, ver información en vivo y comparar el territorio en el tiempo.

## Realidad aumentada

Cada tarjeta del catálogo y cada ficha del mapa incluye un modelo 3D y un código QR. Al escanearlo con el celular se abre `/ar/[id]`, donde se puede colocar el modelo en el espacio con WebXR / Scene Viewer (Android) o Quick Look (iOS, según el dispositivo).

Para que el QR funcione desde un tótem hacia el celular, ambos deben alcanzar la misma URL. En red local puedes definir `NEXT_PUBLIC_AR_BASE_URL` con la IP del equipo, por ejemplo `http://192.168.1.20:3000`.

Los modelos se regeneran con `npm run generate:models`.

## Docker

```bash
docker compose up --build
```

La imagen usa el modo `standalone` de Next.js y publica la app en el puerto 3000.

## Pendientes de integración (siguientes iteraciones)

- Conectar `lib/data.ts` a una API real o headless CMS (Sanity, Strapi, etc.).
- Reemplazar los SVG de `public/images` por fotografías reales de las estaciones.
- Agregar archivos `.mp3` reales en `public/audio` (audio descriptivo grabado).
- Autenticación del panel `/admin/dashboard` (NextAuth o similar) — actualmente sin protección.
- Persistencia real de las respuestas de `FeedbackForm` (API Route / base de datos).
- Generar íconos PWA reales en `public/icons/` (192x192 y 512x512).
