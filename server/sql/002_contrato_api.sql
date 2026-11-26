-- =============================================================================
-- 002 · Contrato de la API de sala sobre el esquema de 001_schema.sql
-- Idempotente: se puede ejecutar varias veces y sobre una base ya poblada.
-- Aporta lo que necesita lib/persistencia.ts para leer y escribir PuntoInteres.
-- =============================================================================

-- Identidad y presentación que el frontend envía pero 001 no guardaba.
ALTER TABLE hito_territorial ADD COLUMN IF NOT EXISTS id_slug        VARCHAR(60);
ALTER TABLE hito_territorial ADD COLUMN IF NOT EXISTS lugar          VARCHAR(150);
ALTER TABLE hito_territorial ADD COLUMN IF NOT EXISTS icono          VARCHAR(30);
ALTER TABLE hito_territorial ADD COLUMN IF NOT EXISTS color_hex      VARCHAR(7);
ALTER TABLE hito_territorial ADD COLUMN IF NOT EXISTS duracion_audio VARCHAR(10);

-- El `id` del frontend es un slug estable, no el UUID interno.
CREATE UNIQUE INDEX IF NOT EXISTS uq_hito_territorial_slug ON hito_territorial (id_slug);

-- Orden declarativo de la galería: sin él, el agregado del retrato sería inestable.
ALTER TABLE recurso_multimedia ADD COLUMN IF NOT EXISTS orden SMALLINT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_recurso_hito_tipo ON recurso_multimedia (id_hito, tipo_recurso, orden);

-- Capas temáticas que usa el catálogo de puntos (mismos códigos y colores que lib/mapa.ts).
INSERT INTO capa_tematica (nombre_capa, codigo_identificador, color_hex, orden_visualizacion)
VALUES
  ('Agua y cauce',   'agua',       '#2BB3E6', 1),
  ('Aves',           'aves',       '#5BA8FF', 2),
  ('Bosque nativo',  'bosque',     '#2F9E6B', 3),
  ('Patrimonio',     'patrimonio', '#C4A574', 4),
  ('Flora',          'flora',      '#3DDC84', 5),
  ('Energía',        'energia',    '#1ECAD3', 6),
  ('Senderos',       'senderos',   '#F08A3A', 7)
ON CONFLICT (codigo_identificador) DO NOTHING;

-- Retrato del hito: una fila por punto, con las mismas claves que PuntoInteres.
-- Los DECIMALES se proyectan a DOUBLE PRECISION porque los drivers de Node
-- devuelven NUMERIC como texto y el visor necesita números.
CREATE OR REPLACE VIEW v_punto_interes AS
SELECT
  h.id_slug                                  AS id,
  h.titulo,
  h.descripcion_corta                        AS resumen,
  h.contenido_didactico                      AS contenido,
  c.codigo_identificador                     AS capa,
  h.lugar,
  h.latitud::DOUBLE PRECISION                AS latitud,
  h.longitud::DOUBLE PRECISION               AS longitud,
  h.icono,
  h.color_hex                                AS color,
  COALESCE(imagen.url_asset, '')             AS imagen,
  COALESCE(galeria.urls, '[]'::jsonb)        AS galeria,
  COALESCE(audio.url_asset, '')              AS "audioUrl",
  COALESCE(h.duracion_audio, '')             AS "duracionAudio"
FROM hito_territorial h
JOIN capa_tematica c ON c.id_capa = h.id_capa
LEFT JOIN LATERAL (
  SELECT r.url_asset
  FROM recurso_multimedia r
  WHERE r.id_hito = h.id_hito AND r.tipo_recurso = 'IMAGEN'
  ORDER BY r.es_principal DESC, r.orden, r.id_recurso
  LIMIT 1
) imagen ON TRUE
LEFT JOIN LATERAL (
  SELECT jsonb_agg(r.url_asset ORDER BY r.es_principal DESC, r.orden, r.id_recurso) AS urls
  FROM recurso_multimedia r
  WHERE r.id_hito = h.id_hito AND r.tipo_recurso = 'IMAGEN'
) galeria ON TRUE
LEFT JOIN LATERAL (
  SELECT r.url_asset
  FROM recurso_multimedia r
  WHERE r.id_hito = h.id_hito AND r.tipo_recurso = 'AUDIO'
  ORDER BY r.es_principal DESC, r.orden, r.id_recurso
  LIMIT 1
) audio ON TRUE
WHERE h.visible_en_sala;
