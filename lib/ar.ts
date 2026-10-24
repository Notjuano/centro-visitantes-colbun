
import type { CapaId } from "@/lib/mapa";
import { ESTACIONES } from "@/lib/data";
import { PUNTOS_INTERES } from "@/lib/mapa";

export type RecursoAR = {
  id: string;
  tipo: "estacion" | "punto";
  titulo: string;
  modeloUrl: string;
  posterUrl: string;
  ruta: string;
};

const MODELO_ESTACION: Record<string, string> = {
  "cuenca-biobio": "/models/gota-agua.glb",
  "central-hidroelectrica": "/models/turbina.glb",
  "biodiversidad-local": "/models/arbol.glb",
  "comunidades-vecinas": "/models/casa.glb",
  "energias-renovables": "/models/sol-energia.glb"
};

const MODELO_CAPA: Record<CapaId, string> = {
  agua: "/models/gota-agua.glb",
  aves: "/models/ave.glb",
  bosque: "/models/arbol.glb",
  patrimonio: "/models/casa.glb",
  flora: "/models/flora.glb",
  energia: "/models/turbina.glb",
  senderos: "/models/sendero.glb"
};

export const recursosAR: RecursoAR[] = [
  ...ESTACIONES.map((estacion) => ({
    id: estacion.id,
    tipo: "estacion" as const,
    titulo: estacion.titulo,
    modeloUrl: MODELO_ESTACION[estacion.id] ?? "/models/gota-agua.glb",
    posterUrl: estacion.imagenUrl,
    ruta: `/ar/${estacion.id}`
  })),
  ...PUNTOS_INTERES.map((punto) => ({
    id: punto.id,
    tipo: "punto" as const,
    titulo: punto.titulo,
    modeloUrl: MODELO_CAPA[punto.capa],
    posterUrl: punto.imagen,
    ruta: `/ar/${punto.id}`
  }))
];

export const getRecursoAR = (id: string) => recursosAR.find((recurso) => recurso.id === id);
