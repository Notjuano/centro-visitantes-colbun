/**
 * Conexión a PostgreSQL del tótem en LAN (Guía 2.3 Parte E).
 * Un solo Pool por proceso; la URL se entrega por DATABASE_URL (.env.local).
 */

import { Pool, type PoolClient, type QueryResultRow } from "pg";

let pool: Pool | undefined;

export function obtenerPool(): Pool {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Falta DATABASE_URL. Copia .env.example a .env.local con la URL de PostgreSQL de la sala."
    );
  }

  pool = new Pool({
    connectionString,
    max: Number(process.env.DATABASE_POOL_MAX) || 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000
  });
  return pool;
}

export async function consultar<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  parametros: unknown[] = []
): Promise<T[]> {
  const resultado = await obtenerPool().query<T>(sql, parametros);
  return resultado.rows;
}

export async function filas<T extends QueryResultRow = QueryResultRow>(
  cliente: PoolClient,
  sql: string,
  parametros: unknown[] = []
): Promise<T[]> {
  const resultado = await cliente.query<T>(sql, parametros);
  return resultado.rows;
}

/** Todo lo que escribe más de una tabla corre en una sola transacción. */
export async function enTransaccion<T>(trabajo: (cliente: PoolClient) => Promise<T>): Promise<T> {
  const cliente = await obtenerPool().connect();
  try {
    await cliente.query("BEGIN");
    const valor = await trabajo(cliente);
    await cliente.query("COMMIT");
    return valor;
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release();
  }
}
