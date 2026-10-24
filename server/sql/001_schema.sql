-- =============================================================================
-- Modelo de datos on-premise (Guía 2.3 / Parte C)
-- Motor: PostgreSQL. Sin servicios externos: el tótem opera en LAN.
-- Relaciones:
--   ROL 1:N USUARIO
--   USUARIO 1:N SESION_AUDITORIA
--   USUARIO 1:N HITO_TERRITORIAL (autoría)
--   CAPA_TEMATICA 1:N HITO_TERRITORIAL
--   HITO_TERRITORIAL 1:N RECURSO_MULTIMEDIA
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS rol (
  id_rol SERIAL PRIMARY KEY,
  nombre_rol VARCHAR(50) NOT NULL,
  descripcion TEXT
);

CREATE TABLE IF NOT EXISTS usuario (
  id_usuario UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  estado_activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
  id_rol INT NOT NULL REFERENCES rol(id_rol)
);

CREATE TABLE IF NOT EXISTS sesion_auditoria (
  id_sesion UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_origen VARCHAR(45) NOT NULL,
  user_agent VARCHAR(255),
  fecha_ingreso TIMESTAMP NOT NULL DEFAULT NOW(),
  fecha_expiracion TIMESTAMP NOT NULL,
  id_usuario UUID NOT NULL REFERENCES usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS capa_tematica (
  id_capa SERIAL PRIMARY KEY,
  nombre_capa VARCHAR(60) NOT NULL,
  codigo_identificador VARCHAR(30) NOT NULL UNIQUE,
  color_hex VARCHAR(7) NOT NULL,
  orden_visualizacion INT NOT NULL DEFAULT 1,
  activa BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS hito_territorial (
  id_hito UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR(120) NOT NULL,
  descripcion_corta TEXT NOT NULL,
  contenido_didactico TEXT NOT NULL,
  latitud DECIMAL(10, 8) NOT NULL,
  longitud DECIMAL(11, 8) NOT NULL,
  visible_en_sala BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_registro TIMESTAMP NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
  id_capa INT NOT NULL REFERENCES capa_tematica(id_capa),
  id_usuario UUID REFERENCES usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS recurso_multimedia (
  id_recurso UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_recurso VARCHAR(30) NOT NULL CHECK (tipo_recurso IN ('MODELO_3D', 'AUDIO', 'IMAGEN')),
  url_asset VARCHAR(255) NOT NULL,
  tamano_mb DECIMAL(5, 2) NOT NULL,
  formato_mime VARCHAR(50) NOT NULL,
  es_principal BOOLEAN NOT NULL DEFAULT FALSE,
  id_hito UUID NOT NULL REFERENCES hito_territorial(id_hito) ON DELETE CASCADE,
  CONSTRAINT modelo_3d_peso_maximo CHECK (
    tipo_recurso <> 'MODELO_3D' OR tamano_mb <= 10.00
  )
);

CREATE INDEX IF NOT EXISTS idx_hito_capa ON hito_territorial(id_capa);
CREATE INDEX IF NOT EXISTS idx_hito_visible ON hito_territorial(visible_en_sala);
CREATE INDEX IF NOT EXISTS idx_recurso_hito ON recurso_multimedia(id_hito);

INSERT INTO rol (nombre_rol, descripcion) VALUES
  ('ADMIN', 'Administrador de contenidos del backoffice (CU-04 / CU-05)'),
  ('GUIA', 'Guía operativo de sala: rutas didácticas y reset (CU-03)')
ON CONFLICT DO NOTHING;
