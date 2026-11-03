/**
 * Capa de dominio territorial.
 * Convierte hitos a GeoJSON (Guía 2.2 / ficha de stack: JavaScript + GeoJSON)
 * y entrega el encuadre geográfico real del visor satelital del Bío Bío.
 */

import { CAPAS, PUNTOS_INTERES, type CapaId, type PuntoInteres } from "@/lib/mapa";

/** Centro del visor satelital sobre la Región del Bío Bío. */
export const CENTRO_BIOBIO = { latitud: -37.1, longitud: -72.45 };

/** Nivel de acercamiento inicial del visor regional. */
export const ZOOM_BIOBIO = 10;

/** Encuadre aproximado de la Región del Bío Bío (cordillera a costa). */
export const BOUNDS_BIOBIO = {
  norte: -36.4,
  sur: -38.95,
  oeste: -73.75,
  este: -70.85
};

/** Encuadre del corredor del cauce del Bío Bío, del origen cordillerano a la desembocadura. */
export const BOUNDS_CAUCE = {
  norte: -36.78,
  sur: -38.78,
  oeste: -73.19,
  este: -71.08
};

/** Centro del corredor del cauce. */
export const CENTRO_CAUCE = { latitud: -37.78, longitud: -72.13 };

/** Esquinas del corredor listas para encuadrar el visor con Leaflet. */
export const ESQUINAS_CAUCE: [number, number][] = [
  [BOUNDS_CAUCE.sur, BOUNDS_CAUCE.oeste],
  [BOUNDS_CAUCE.norte, BOUNDS_CAUCE.este]
];

/**
 * Trazado real del cauce del río Bío Bío en formato [latitud, longitud].
 * Fuente: Natural Earth 1:10m river centerlines (geometría geográfica real,
 * desde Lago Icalma hasta la desembocadura en Hualpén).
 */
export const CAUCE_BIOBIO: [number, number][] = [
  [-38.7695, -71.2405], [-38.7446, -71.211], [-38.7333, -71.1919], [-38.7241, -71.1485],
  [-38.7134, -71.1238], [-38.7, -71.1019], [-38.6875, -71.0902], [-38.6649, -71.0895],
  [-38.6512, -71.1031], [-38.641, -71.1233], [-38.6289, -71.1415], [-38.6196, -71.1438],
  [-38.5966, -71.1387], [-38.5895, -71.1527], [-38.5837, -71.1633], [-38.571, -71.1791],
  [-38.564, -71.1852], [-38.5257, -71.2072], [-38.4989, -71.2306], [-38.4806, -71.239],
  [-38.4133, -71.2405], [-38.3901, -71.2436], [-38.3805, -71.2476], [-38.3716, -71.255],
  [-38.3641, -71.2654], [-38.3422, -71.3168], [-38.3333, -71.3255], [-38.3215, -71.3292],
  [-38.3057, -71.3281], [-38.2563, -71.3135], [-38.2409, -71.3052], [-38.2099, -71.3002],
  [-38.1896, -71.3041], [-38.1319, -71.3298], [-38.1187, -71.339], [-38.1069, -71.3501],
  [-38.0972, -71.3625], [-38.093, -71.3771], [-38.0923, -71.4398], [-38.0886, -71.4542],
  [-38.082, -71.4655], [-38.0728, -71.4753], [-38.0658, -71.4808], [-38.0475, -71.4876],
  [-38.0248, -71.5034], [-38.0075, -71.5243], [-37.9819, -71.5719], [-37.9694, -71.5879],
  [-37.952, -71.599], [-37.9135, -71.6147], [-37.8798, -71.6341], [-37.849, -71.6583],
  [-37.8242, -71.6865], [-37.8148, -71.6938], [-37.8065, -71.6969], [-37.7896, -71.7005],
  [-37.7814, -71.7042], [-37.77, -71.7164], [-37.7555, -71.7635], [-37.751, -71.7705],
  [-37.735, -71.7856], [-37.7298, -71.7949], [-37.7197, -71.8258], [-37.7103, -71.8452],
  [-37.7064, -71.856], [-37.7048, -71.8673], [-37.7083, -71.8902], [-37.7346, -71.9566],
  [-37.7446, -72.0072], [-37.7461, -72.0332], [-37.7446, -72.0589], [-37.7416, -72.071],
  [-37.7367, -72.0809], [-37.7292, -72.0895], [-37.7186, -72.0973], [-37.6812, -72.1188],
  [-37.6638, -72.132], [-37.6515, -72.1481], [-37.6489, -72.1559], [-37.6459, -72.1724],
  [-37.6426, -72.1805], [-37.6358, -72.1899], [-37.6113, -72.2137], [-37.6076, -72.2215],
  [-37.6005, -72.2427], [-37.5824, -72.2688], [-37.5741, -72.2919], [-37.5453, -72.4103],
  [-37.543, -72.4332], [-37.5453, -72.4587], [-37.555, -72.5018], [-37.5561, -72.5222],
  [-37.5518, -72.5459], [-37.5436, -72.5667], [-37.468, -72.6662], [-37.454, -72.6778],
  [-37.439, -72.6864], [-37.4206, -72.6917], [-37.3715, -72.6949], [-37.3525, -72.699],
  [-37.2471, -72.7445], [-37.2184, -72.7657], [-37.2004, -72.7965], [-37.1807, -72.8923],
  [-37.1646, -72.9318], [-37.1322, -72.9604], [-37.0951, -72.9747], [-37.0502, -72.9836],
  [-37.0049, -72.9827], [-36.9671, -72.9673], [-36.9517, -73.0033], [-36.9272, -73.022],
  [-36.8647, -73.043], [-36.835, -73.0622], [-36.805, -73.0935], [-36.7876, -73.1304],
  [-36.7963, -73.1665]
];

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
