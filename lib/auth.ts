/**
 * Auth Service (Guía 2.3 CU-04).
 * Verifica credenciales administrativas y emite JWT con expiración estricta.
 * Runtime Node (no Edge): bcrypt y jsonwebtoken requieren APIs de Node.
 */

import { SignJWT, jwtVerify } from "jose";

const ALGORITMO = "HS256";
const EXPIRACION = "8h";

function secreto() {
  const valor = process.env.JWT_SECRET || "angostura-dev-no-usar-en-sala";
  return new TextEncoder().encode(valor);
}

export type SesionAdmin = {
  sub: string;
  correo: string;
  rol: "ADMIN" | "GUIA";
  nombre: string;
};

export async function emitirJwt(sesion: SesionAdmin) {
  return new SignJWT(sesion)
    .setProtectedHeader({ alg: ALGORITMO })
    .setIssuedAt()
    .setExpirationTime(EXPIRACION)
    .sign(secreto());
}

export async function verificarJwt(token: string): Promise<SesionAdmin | null> {
  try {
    const { payload } = await jwtVerify(token, secreto());
    return payload as unknown as SesionAdmin;
  } catch {
    return null;
  }
}

export function leerBearer(autorizacion: string | null) {
  if (!autorizacion?.startsWith("Bearer ")) return null;
  return autorizacion.slice("Bearer ".length).trim();
}

/**
 * Credenciales del backoffice (LAN on-premise).
 * En sala se reemplazan por USUARIO.password_hash (Bcrypt) en PostgreSQL.
 */
export function credencialesValidas(correo: string, password: string) {
  const esperadoCorreo = process.env.ADMIN_EMAIL || "admin@angostura.local";
  const esperadoPassword = process.env.ADMIN_PASSWORD || "Angostura2026!";
  return correo.trim().toLowerCase() === esperadoCorreo.toLowerCase() && password === esperadoPassword;
}
