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
  catalogo/page.tsx          Catálogo digital interactivo (estaciones + audio descriptivo)
  encuesta/page.tsx          Encuesta de satisfacción (< 60s)
  admin/dashboard/page.tsx   Panel administrativo (CMS + métricas)
  layout.tsx, globals.css
components/ui/
  Navbar.tsx, Footer.tsx, AudioPlayer.tsx, StationCard.tsx, FeedbackForm.tsx
lib/
  data.ts   Datos mock de estaciones y métricas (punto de integración con API/CMS real)
  utils.ts  Utilidad cn() para clases Tailwind
public/
  images/   Ilustraciones SVG placeholder de cada estación
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

## Pendientes de integración (siguientes iteraciones)

- Conectar `lib/data.ts` a una API real o headless CMS (Sanity, Strapi, etc.).
- Reemplazar los SVG de `public/images` por fotografías reales de las estaciones.
- Agregar archivos `.mp3` reales en `public/audio` (audio descriptivo grabado).
- Autenticación del panel `/admin/dashboard` (NextAuth o similar) — actualmente sin protección.
- Persistencia real de las respuestas de `FeedbackForm` (API Route / base de datos).
- Generar íconos PWA reales en `public/icons/` (192x192 y 512x512).
