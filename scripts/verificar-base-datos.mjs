/**
 * Chequeo de la base de datos de sala: `npm run db:check`
 * Dice en qué estado está el esquema frente a lo que espera lib/persistencia.ts.
 */

import pg from "pg";
import { PUNTOS_INTERES } from "../lib/mapa.ts";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Falta DATABASE_URL. Copia .env.example a .env.local y vuelve a intentarlo.");
  process.exit(1);
}

const CONTRATO_PUNTO = Object.keys(PUNTOS_INTERES[0]);
const TABLAS = ["rol", "usuario", "capa_tematica", "hito_territorial", "recurso_multimedia"];
const COLUMNAS_HITO = ["id_slug", "lugar", "icono", "color_hex", "duracion_audio", "visible_en_sala"];

const cliente = new pg.Client({ connectionString: url });
await cliente.connect();

const consultar = async (sql, parametros = []) => (await cliente.query(sql, parametros)).rows;
const marca = (ok) => (ok ? "ok   " : "FALTA");

const [informacion] = await consultar(
  "SELECT current_database() AS base, split_part(version(), ',', 1) AS servidor"
);
console.log(`\nBase: ${informacion.base}\nServidor: ${informacion.servidor}\n`);

const tablas = new Set(
  (await consultar("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")).map((r) => r.tablename)
);
const columnas = new Set(
  (
    await consultar(
      "SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'"
    )
  ).map((r) => `${r.table_name}.${r.column_name}`)
);
const vistas = new Set(
  (await consultar("SELECT viewname FROM pg_views WHERE schemaname = 'public'")).map((r) => r.viewname)
);

for (const tabla of TABLAS) console.log(`${marca(tablas.has(tabla))}  tabla ${tabla}`);
for (const columna of COLUMNAS_HITO)
  console.log(`${marca(columnas.has(`hito_territorial.${columna}`))}  hito_territorial.${columna}`);
console.log(`${marca(columnas.has("recurso_multimedia.orden"))}  recurso_multimedia.orden`);

const vistasFaltantes = ["v_punto_interes"].filter((vista) => !vistas.has(vista));
console.log(`\n${marca(vistasFaltantes.length === 0)}  vista v_punto_interes`);

if (vistas.has("v_punto_interes")) {
  const [conteo] = await consultar("SELECT count(*)::int AS hitos FROM v_punto_interes");
  console.log(`       hitos servidos: ${conteo.hitos}${conteo.hitos === 0 ? "  → ejecuta npm run db:sembrar" : ""}`);

  const [muestra] = await consultar("SELECT * FROM v_punto_interes LIMIT 1");
  if (muestra) {
    const claves = Object.keys(muestra);
    const faltantes = CONTRATO_PUNTO.filter((clave) => !claves.includes(clave));
    const extra = claves.filter((clave) => !CONTRATO_PUNTO.includes(clave));
    console.log(`       contrato PuntoInteres: ${faltantes.length === 0 ? "todas las claves presentes" : `faltan ${faltantes.join(", ")}`}`);
    if (extra.length) console.log(`       claves extra en la vista: ${extra.join(", ")}`);
    console.log(`       tipos: latitud=${typeof muestra.latitud}, galeria=${Array.isArray(muestra.galeria) ? "array" : typeof muestra.galeria}`);
  }
}

const [capas] = await consultar("SELECT count(*)::int AS total FROM capa_tematica");
console.log(`\ncapa_tematica: ${capas.total} filas (se esperan 7)`);

const [recursos] = await consultar(
  "SELECT count(*)::int AS total FROM recurso_multimedia WHERE tipo_recurso = 'IMAGEN'"
);
console.log(`recurso_multimedia IMAGEN: ${recursos.total} filas`);

await cliente.end();
