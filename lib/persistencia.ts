/**
 * Persistencia de hitos territoriales sobre PostgreSQL (CU-05).
 * La lectura sale de `v_punto_interes`, que reproduce campo a campo el contrato
 * `PuntoInteres` del frontend; la escritura reparte ese objeto entre
 * `hito_territorial` y `recurso_multimedia`.
 */

import { consultar, enTransaccion, filas } from "@/lib/conexion";
import type { PuntoInteres } from "@/lib/mapa";

const MIME_POR_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg"
};

function formatoMime(recurso: string): string {
  const extension = recurso.slice(recurso.lastIndexOf(".")).toLowerCase();
  return MIME_POR_EXTENSION[extension] ?? "application/octet-stream";
}

export async function listarHitos(): Promise<PuntoInteres[]> {
  return consultar<PuntoInteres>("SELECT * FROM v_punto_interes ORDER BY titulo");
}

export async function upsertHito(hito: PuntoInteres): Promise<PuntoInteres> {
  await enTransaccion(async (cliente) => {
    const [capa] = await filas<{ id_capa: number }>(
      cliente,
      "SELECT id_capa FROM capa_tematica WHERE codigo_identificador = $1",
      [hito.capa]
    );
    if (!capa) throw new Error(`La capa temática '${hito.capa}' no existe en capa_tematica.`);

    const [guardado] = await filas<{ id_hito: string }>(
      cliente,
      `INSERT INTO hito_territorial (
         id_slug, titulo, descripcion_corta, contenido_didactico,
         latitud, longitud, lugar, icono, color_hex, duracion_audio,
         visible_en_sala, id_capa
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE, $11)
       ON CONFLICT (id_slug) DO UPDATE SET
         titulo = EXCLUDED.titulo,
         descripcion_corta = EXCLUDED.descripcion_corta,
         contenido_didactico = EXCLUDED.contenido_didactico,
         latitud = EXCLUDED.latitud,
         longitud = EXCLUDED.longitud,
         lugar = EXCLUDED.lugar,
         icono = EXCLUDED.icono,
         color_hex = EXCLUDED.color_hex,
         duracion_audio = EXCLUDED.duracion_audio,
         visible_en_sala = TRUE,
         id_capa = EXCLUDED.id_capa,
         fecha_actualizacion = NOW()
       RETURNING id_hito`,
      [
        hito.id,
        hito.titulo,
        hito.resumen,
        hito.contenido,
        hito.latitud,
        hito.longitud,
        hito.lugar,
        hito.icono,
        hito.color,
        hito.duracionAudio,
        capa.id_capa
      ]
    );

    // Los modelos .glb los sube otra ruta y no forman parte del contrato del hito.
    await cliente.query(
      "DELETE FROM recurso_multimedia WHERE id_hito = $1 AND tipo_recurso IN ('IMAGEN', 'AUDIO')",
      [guardado.id_hito]
    );

    const imagenes = [hito.imagen, ...hito.galeria.filter((url) => url !== hito.imagen)];
    for (const [orden, url] of imagenes.entries()) {
      await cliente.query(
        `INSERT INTO recurso_multimedia (
           tipo_recurso, url_asset, tamano_mb, formato_mime, es_principal, orden, id_hito
         )
         VALUES ('IMAGEN', $1, 0, $2, $3, $4, $5)`,
        [url, formatoMime(url), orden === 0, orden, guardado.id_hito]
      );
    }

    if (hito.audioUrl) {
      await cliente.query(
        `INSERT INTO recurso_multimedia (
           tipo_recurso, url_asset, tamano_mb, formato_mime, es_principal, orden, id_hito
         )
         VALUES ('AUDIO', $1, 0, $2, TRUE, 0, $3)`,
        [hito.audioUrl, formatoMime(hito.audioUrl), guardado.id_hito]
      );
    }
  });

  return hito;
}

/** Deshabilitar conserva el historial: el hito deja de servirse en sala. */
export async function deshabilitarHito(id: string): Promise<boolean> {
  const afectados = await consultar<{ id_hito: string }>(
    `UPDATE hito_territorial
     SET visible_en_sala = FALSE, fecha_actualizacion = NOW()
     WHERE id_slug = $1
     RETURNING id_hito`,
    [id]
  );
  return afectados.length > 0;
}
