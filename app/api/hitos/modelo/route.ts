/**
 * Media & 3D Validator (Guía 2.3).
 * Solo admite .glb y rechaza archivos > 10 MB antes de escribir a disco.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { leerBearer, verificarJwt } from "@/lib/auth";
import { GLB_MAX_BYTES, GLB_MIME } from "@/lib/territorio";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const token = leerBearer(request.headers.get("authorization"));
  const sesion = token ? await verificarJwt(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const formulario = await request.formData();
  const archivo = formulario.get("modelo");
  if (!(archivo instanceof File)) {
    return NextResponse.json({ error: "Adjunte un archivo .glb" }, { status: 400 });
  }

  const nombre = archivo.name.toLowerCase();
  if (!nombre.endsWith(".glb")) {
    return NextResponse.json({ error: "Formato no permitido. Solo .glb." }, { status: 400 });
  }

  if (archivo.size > GLB_MAX_BYTES) {
    return NextResponse.json(
      { error: "El modelo supera 10 MB. Optimícelo antes de subirlo." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await archivo.arrayBuffer());
  const destinoDir = path.join(process.cwd(), "public", "uploads", "modelos");
  await mkdir(destinoDir, { recursive: true });
  const seguro = nombre.replace(/[^a-z0-9._-]/g, "-");
  const archivoFinal = `${Date.now()}-${seguro}`;
  await writeFile(path.join(destinoDir, archivoFinal), buffer);

  const tamanoMb = Number((archivo.size / (1024 * 1024)).toFixed(2));
  return NextResponse.json({
    url_asset: `/uploads/modelos/${archivoFinal}`,
    tamano_mb: tamanoMb,
    formato_mime: GLB_MIME,
    tipo_recurso: "MODELO_3D"
  });
}
