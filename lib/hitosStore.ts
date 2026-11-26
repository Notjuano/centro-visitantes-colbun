import {
  HITOS_ANGOSTURA_MOCK,
  type HitoFeature,
  type CategoriaHito,
} from "@/data/hitosAngostura";

const STORAGE_KEY = "angostura_hitos_v1";

export const CATEGORIA_CONFIG: Record<
  CategoriaHito,
  { color_hex: string; iconoDefault: string }
> = {
  Energética: { color_hex: "#3B82F6", iconoDefault: "⚡" },
  Turística: { color_hex: "#F59E0B", iconoDefault: "🏛️" },
  Ecológica: { color_hex: "#10B981", iconoDefault: "🌿" },
  Histórica: { color_hex: "#A855F7", iconoDefault: "⛩️" },
};

export function obtenerHitos(): HitoFeature[] {
  if (typeof window === "undefined") {
    return HITOS_ANGOSTURA_MOCK.features;
  }
  try {
    const guardado = window.localStorage.getItem(STORAGE_KEY);
    if (!guardado) return HITOS_ANGOSTURA_MOCK.features;
    const parsed = JSON.parse(guardado) as HitoFeature[];
    return Array.isArray(parsed) ? parsed : HITOS_ANGOSTURA_MOCK.features;
  } catch {
    return HITOS_ANGOSTURA_MOCK.features;
  }
}

export function guardarHitos(hitos: HitoFeature[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(hitos));
  window.dispatchEvent(new Event("hitos-actualizados"));
}

export function restaurarHitosOriginales(): HitoFeature[] {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("hitos-actualizados"));
  }
  return HITOS_ANGOSTURA_MOCK.features;
}