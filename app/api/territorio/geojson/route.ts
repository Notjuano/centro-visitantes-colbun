/**
 * Interfaz cartográfica (Map Viewer Engine -> API Gateway).
 * Entrega FeatureCollection para el tótem. CU-01.
 */
import { NextResponse } from "next/server";
import { listarHitos } from "@/lib/persistencia";
import { coleccionHitosSala } from "@/lib/territorio";

export const runtime = "nodejs";

export async function GET() {
  const hitos = await listarHitos();
  return NextResponse.json(coleccionHitosSala(hitos), {
    headers: { "Cache-Control": "no-store" }
  });
}
