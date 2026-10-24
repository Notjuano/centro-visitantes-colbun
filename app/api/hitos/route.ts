/**
 * CU-05: listado y alta de hitos territoriales (CRUD).
 * Requiere JWT en Authorization: Bearer.
 */
import { NextResponse } from "next/server";
import { leerBearer, verificarJwt } from "@/lib/auth";
import { listarHitos, upsertHito } from "@/lib/persistencia";
import type { PuntoInteres } from "@/lib/mapa";

export const runtime = "nodejs";

async function exigirAdmin(request: Request) {
  const token = leerBearer(request.headers.get("authorization"));
  if (!token) return null;
  return verificarJwt(token);
}

export async function GET(request: Request) {
  const sesion = await exigirAdmin(request);
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json(await listarHitos());
}

export async function POST(request: Request) {
  const sesion = await exigirAdmin(request);
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const hito = (await request.json()) as PuntoInteres;
  if (!hito?.id || !hito.titulo || !hito.capa) {
    return NextResponse.json({ error: "Faltan campos obligatorios del hito." }, { status: 400 });
  }

  const guardado = await upsertHito(hito);
  return NextResponse.json(guardado, { status: 201 });
}
