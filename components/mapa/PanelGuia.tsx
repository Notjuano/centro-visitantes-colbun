"use client";

import { RotateCcw, Route } from "lucide-react";
import { RUTAS_DIDACTICAS } from "@/lib/territorio";
import type { CapaId } from "@/lib/mapa";
import { cn } from "@/lib/utils";

/**
 * CU-03 — Selector de rutas didácticas y reset manual de sala.
 * El guía destaca hitos de una temática y, al cerrar la charla,
 * restablece el encuadre panorámico con un toque.
 */
type PanelGuiaProps = {
  rutaActiva: string;
  onSeleccionarRuta: (id: string, capas: CapaId[]) => void;
  onResetearSala: () => void;
};

export function PanelGuia({ rutaActiva, onSeleccionarRuta, onResetearSala }: PanelGuiaProps) {
  return (
    <aside
      aria-label="Conducción de sala"
      className="absolute bottom-4 left-4 z-30 max-w-[min(100%-2rem,22rem)] rounded-2xl border border-white/10 bg-black/60 p-3 text-white backdrop-blur-xl"
    >
      <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-cauce-400">
        <Route className="h-3.5 w-3.5" aria-hidden="true" />
        Guía de sala
      </p>
      <div className="flex flex-wrap gap-2">
        {RUTAS_DIDACTICAS.map((ruta) => (
          <button
            key={ruta.id}
            type="button"
            aria-pressed={rutaActiva === ruta.id}
            onClick={() => onSeleccionarRuta(ruta.id, ruta.capas)}
            className={cn(
              "rounded-full px-3 py-1 text-xs transition-colors",
              rutaActiva === ruta.id ? "bg-cauce-500 text-basalt-950" : "bg-white/10 hover:bg-white/20"
            )}
          >
            {ruta.nombre}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onResetearSala}
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-ember-500 px-3 py-1.5 text-xs font-medium text-basalt-950 hover:bg-ember-400"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        Restablecer sala
      </button>
    </aside>
  );
}
