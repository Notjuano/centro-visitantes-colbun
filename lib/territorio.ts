/**
 * Capa de dominio territorial.
 * Convierte hitos a GeoJSON (Guía 2.2 / ficha de stack: JavaScript + GeoJSON)
 * y entrega el encuadre geográfico real del visor satelital del Bío Bío.
 */

import { CAPAS, PUNTOS_INTERES, type CapaId, type PuntoInteres } from "@/lib/mapa";

/** Centro del visor satelital sobre la Región del Bío Bío. */
export const CENTRO_BIOBIO = { latitud: -37.1, longitud: -72.45 };

/** Nivel de acercamiento inicial del visor regional. */
export const ZOOM_BIOBIO = 9;

/** Encuadre aproximado de la Región del Bío Bío (cordillera a costa). */
export const BOUNDS_BIOBIO = {
  norte: -36.55,
  sur: -38.05,
  oeste: -73.6,
  este: -71.1
};

export type FeatureHito = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: PuntoInteres;
};

export type ColeccionHitos = {
  type: "FeatureCollection";
  features: FeatureHito[];
};

/** Proyecta un punto del catálogo a una geometría GeoJSON con coordenadas reales. */
export function puntoAFeature(punto: PuntoInteres): FeatureHito {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [punto.longitud, punto.latitud] },
    properties: punto
  };
}

/** CU-01: catálogo GeoJSON servido al visor cartográfico de sala. */
export function coleccionHitosSala(puntos: PuntoInteres[] = PUNTOS_INTERES): ColeccionHitos {
  return {
    type: "FeatureCollection",
    features: puntos.map(puntoAFeature)
  };
}

/** Coordenadas [latitud, longitud] listas para encuadrar el visor en Leaflet. */
export function coordenadasDePuntos(puntos: PuntoInteres[]): [number, number][] {
  return puntos.map((punto) => [punto.latitud, punto.longitud]);
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
