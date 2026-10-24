import { NextResponse } from "next/server";
import { leerBearer, verificarJwt } from "@/lib/auth";
import { deshabilitarHito, listarHitos, upsertHito } from "@/lib/persistencia";
import type { PuntoInteres } from "@/lib/mapa";

export const runtime = "nodejs";

async function exigirAdmin(request: Request) {
  const token = leerBearer(request.headers.get("authorization"));
  if (!token) return null;
  return verificarJwt(token);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const sesion = await exigirAdmin(request);
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const hito = (await request.json()) as PuntoInteres;
  const guardado = await upsertHito({ ...hito, id: params.id });
  return NextResponse.json(guardado);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const sesion = await exigirAdmin(request);
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const ok = await deshabilitarHito(params.id);
  if (!ok) return NextResponse.json({ error: "Hito no encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true, restantes: (await listarHitos()).length });
}
