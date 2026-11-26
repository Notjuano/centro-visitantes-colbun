/**
 * Siembra los hitos de la sala: `npm run db:sembrar`
 * Pasa por la API (login + POST /api/hitos) para escribir exactamente el mismo
 * camino que usaría el backoffice, en vez de duplicar el SQL en el script.
 * Requiere el servidor levantado: npm run dev o npm start.
 */

import { PUNTOS_INTERES } from "../lib/mapa.ts";

const base = (process.env.SEED_API_URL || "http://localhost:3000").replace(/\/$/, "");
const correo = process.env.ADMIN_EMAIL || "admin@angostura.local";
const password = process.env.ADMIN_PASSWORD || "Angostura2026!";

const ingreso = await fetch(`${base}/api/auth/login`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ correo, password })
});

if (!ingreso.ok) {
  console.error(
    `No se pudo iniciar sesión (${ingreso.status}) en ${base}. ` +
      "Verifica que el servidor esté corriendo y que ADMIN_EMAIL/ADMIN_PASSWORD coincidan."
  );
  process.exit(1);
}

const { token } = await ingreso.json();
console.log(`Sesión abierta como ${correo} → ${base}/api/hitos\n`);

let enviados = 0;
for (const punto of PUNTOS_INTERES) {
  const respuesta = await fetch(`${base}/api/hitos`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(punto)
  });

  if (respuesta.ok) {
    enviados += 1;
    console.log(`  ok    ${punto.id}`);
  } else {
    process.exitCode = 1;
    console.error(`  error ${punto.id}: ${respuesta.status} ${await respuesta.text()}`);
  }
}

console.log(`\nHitos enviados: ${enviados}/${PUNTOS_INTERES.length}`);
if (process.exitCode) console.error("Revisa DATABASE_URL y server/sql/002_contrato_api.sql.");
