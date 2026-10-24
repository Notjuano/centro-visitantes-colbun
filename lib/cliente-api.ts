/**
 * Cliente HTTP del visor y del backoffice hacia el API Gateway local.
 * Latencia objetivo < 200 ms en LAN (Guía 2.2). Sin nubes de mapas.
 */

import type { ColeccionHitos } from "@/lib/territorio";
import type { PuntoInteres } from "@/lib/mapa";

const BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export async function obtenerGeoJsonSala(): Promise<ColeccionHitos | null> {
  try {
    const respuesta = await fetch(`${BASE}/api/territorio/geojson`, { cache: "no-store" });
    if (!respuesta.ok) return null;
    return (await respuesta.json()) as ColeccionHitos;
  } catch {
    return null;
  }
}

export function featuresAPuntos(coleccion: ColeccionHitos): PuntoInteres[] {
  return coleccion.features.map((feature) => {
    const { latitud: _lat, longitud: _lon, ...punto } = feature.properties;
    return punto;
  });
}

export async function iniciarSesion(correo: string, password: string) {
  const respuesta = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, password })
  });
  const cuerpo = (await respuesta.json()) as { token?: string; error?: string; nombre?: string; rol?: string };
  if (!respuesta.ok) {
    throw new Error(cuerpo.error || "No autorizado");
  }
  return cuerpo;
}
