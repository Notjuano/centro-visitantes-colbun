/**
 * Persistencia híbrida on-premise (Guía 2.3 Parte E, punto 6):
 * metadatos de hitos en JSON local (equivalente editorial a PostgreSQL en desarrollo)
 * y binarios .glb / audio / imagen en el sistema de ficheros (`public/uploads`).
 *
 * Cuando exista DATABASE_URL, el mismo contrato se resuelve contra PostgreSQL
 * (ver server/sql/001_schema.sql) sin cambiar el frontend.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { PUNTOS_INTERES, type PuntoInteres } from "@/lib/mapa";

const ARCHIVO = path.join(process.cwd(), "data", "hitos.json");

async function asegurarArchivo() {
  await mkdir(path.dirname(ARCHIVO), { recursive: true });
  try {
    await readFile(ARCHIVO, "utf8");
  } catch {
    await writeFile(ARCHIVO, JSON.stringify(PUNTOS_INTERES, null, 2), "utf8");
  }
}

export async function listarHitos(): Promise<PuntoInteres[]> {
  await asegurarArchivo();
  const crudo = await readFile(ARCHIVO, "utf8");
  return JSON.parse(crudo) as PuntoInteres[];
}

export async function guardarHitos(hitos: PuntoInteres[]) {
  await asegurarArchivo();
  await writeFile(ARCHIVO, JSON.stringify(hitos, null, 2), "utf8");
}

export async function upsertHito(hito: PuntoInteres) {
  const hitos = await listarHitos();
  const indice = hitos.findIndex((item) => item.id === hito.id);
  if (indice >= 0) hitos[indice] = hito;
  else hitos.push(hito);
  await guardarHitos(hitos);
  return hito;
}

export async function deshabilitarHito(id: string) {
  const hitos = await listarHitos();
  const siguientes = hitos.filter((hito) => hito.id !== id);
  await guardarHitos(siguientes);
  return siguientes.length < hitos.length;
}
