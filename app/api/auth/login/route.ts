/**
 * CU-04: POST /api/auth/login
 * Verifica correo/contraseña, emite JWT y deja trazabilidad de sesión.
 */
import { NextResponse } from "next/server";
import { credencialesValidas, emitirJwt } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const cuerpo = (await request.json().catch(() => null)) as { correo?: string; password?: string } | null;
  const correo = cuerpo?.correo?.trim() ?? "";
  const password = cuerpo?.password ?? "";

  if (!credencialesValidas(correo, password)) {
    return NextResponse.json(
      { error: "Datos incorrectos o cuenta desactivada." },
      { status: 401 }
    );
  }

  const token = await emitirJwt({
    sub: "admin-local",
    correo,
    rol: "ADMIN",
    nombre: "Administrador Angostura"
  });

  const expira = new Date(Date.now() + 8 * 60 * 60 * 1000);

  return NextResponse.json({
    token,
    nombre: "Administrador Angostura",
    rol: "ADMIN",
    fecha_expiracion: expira.toISOString(),
    ip_origen: request.headers.get("x-forwarded-for") || "lan"
  });
}
