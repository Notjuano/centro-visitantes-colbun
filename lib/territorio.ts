/**
 * Capa de dominio territorial.
 * Convierte hitos a GeoJSON (Guía 2.2 / ficha de stack: JavaScript + GeoJSON)
 * para que el visor de sala pinte marcadores sin APIs de mapas en la nube.
 */

import { CAPAS, PUNTOS_INTERES, type CapaId, type PuntoInteres } from "@/lib/mapa";

/** Encuadre aproximado del lienzo aéreo del Bío Bío (sin Mapbox/Google). */
const BOUNDS = {
  oeste: -71.48,
  este: -71.26,
  norte: -35.58,
  sur: -35.74
};

export type FeatureHito = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: PuntoInteres & { latitud: number; longitud: number };
};

export type ColeccionHitos = {
  type: "FeatureCollection";
  features: FeatureHito[];
};

/** Proyecta x/y del plano (0–100) a latitud/longitud para HITO_TERRITORIAL. */
export function proyectarCoordenadas(x: number, y: number) {
  const longitud = BOUNDS.oeste + (x / 100) * (BOUNDS.este - BOUNDS.oeste);
  const latitud = BOUNDS.norte + (y / 100) * (BOUNDS.sur - BOUNDS.norte);
  return {
    latitud: Number(latitud.toFixed(6)),
    longitud: Number(longitud.toFixed(6))
  };
}

export function puntoAFeature(punto: PuntoInteres): FeatureHito {
  const { latitud, longitud } = proyectarCoordenadas(punto.x, punto.y);
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [longitud, latitud] },
    properties: { ...punto, latitud, longitud }
  };
}

/** CU-01: catálogo GeoJSON servido al visor cartográfico de sala. */
export function coleccionHitosSala(puntos: PuntoInteres[] = PUNTOS_INTERES): ColeccionHitos {
  return {
    type: "FeatureCollection",
    features: puntos.map(puntoAFeature)
  };
}

/**
 * CU-03: rutas didácticas del guía.
 * Cada ruta activa un conjunto de capas temáticas de forma sincronizada.
 */
export const RUTAS_DIDACTICAS: { id: string; nombre: string; capas: CapaId[] }[] = [
  { id: "panorama", nombre: "Vista panorámica", capas: CAPAS.map((capa) => capa.id) },
  { id: "energia", nombre: "Ruta energética", capas: ["energia", "agua"] },
  { id: "biodiversidad", nombre: "Biodiversidad del Bío Bío", capas: ["bosque", "aves", "flora", "agua"] },
  { id: "patrimonio", nombre: "Memoria y territorio", capas: ["patrimonio", "senderos"] }
];

/** Umbral CU-06: 3 minutos sin toques en el tótem. */
export const INACTIVIDAD_MS = 3 * 60 * 1000;

/** Regla CU-05: modelos .glb ≤ 10 MB. */
export const GLB_MAX_BYTES = 10 * 1024 * 1024;
export const GLB_MIME = "model/gltf-binary";
