"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CategoriaHub = {
  etiqueta: string;
  color: string;
};

type BarraCategoriasProps = {
  categorias: CategoriaHub[];
  /** Filtro de categoría única (mapa 3D). */
  activa?: string;
  /** Filtro de selección múltiple (capas del mapa geográfico). */
  estaActiva?: (etiqueta: string) => boolean;
  onSeleccionar: (etiqueta: string) => void;
  /** Botones de sala (vista general, pantalla completa, portada). */
  children?: ReactNode;
  ariaLabel?: string;
  className?: string;
};

/**
 * Filtro temático táctil del hub.
 * En el mapa 3D son categorías de hito; en el mapa geográfico, capas temáticas.
 */
export function BarraCategorias({
  categorias,
  activa,
  estaActiva,
  onSeleccionar,
  children,
  ariaLabel = "Filtro temático del territorio",
  className
}: BarraCategoriasProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "pointer-events-auto flex max-w-[min(100%,56rem)] flex-wrap items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/90 p-2 shadow-2xl backdrop-blur-md",
        className
      )}
    >
      {categorias.map((categoria) => {
        const activo = estaActiva
          ? estaActiva(categoria.etiqueta)
          : activa === categoria.etiqueta;
        return (
          <button
            key={categoria.etiqueta}
            type="button"
            aria-pressed={activo}
            onClick={() => onSeleccionar(categoria.etiqueta)}
            className={cn(
              "rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all",
              activo
                ? "scale-105 text-white shadow-lg"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
            style={{ backgroundColor: activo ? categoria.color : "transparent" }}
          >
            {categoria.etiqueta}
          </button>
        );
      })}

      {children && (
        <>
          <div aria-hidden="true" className="mx-1 h-6 w-px bg-slate-700" />
          {children}
        </>
      )}
    </nav>
  );
}

type BotonesSalaProps = {
  onVistaGeneral: () => void;
  onPantallaCompleta?: () => void;
  onPortada?: () => void;
  className?: string;
};

/** Controles de conducción de sala compartidos por ambos visores. */
export function BotonesSala({
  onVistaGeneral,
  onPantallaCompleta,
  onPortada,
  className
}: BotonesSalaProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <button
        type="button"
        onClick={onVistaGeneral}
        className="rounded-xl border border-amber-500/30 bg-slate-800 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-amber-300 transition hover:bg-slate-700"
      >
        {"↺"} Vista General
      </button>

      {onPantallaCompleta && (
        <button
          type="button"
          onClick={onPantallaCompleta}
          title="Pantalla Completa"
          className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 transition hover:text-white"
        >
          {"⛶"} Pantalla Completa
        </button>
      )}

      {onPortada && (
        <button
          type="button"
          onClick={onPortada}
          title="Volver a la portada de reposo"
          className="rounded-xl border border-slate-700 bg-slate-950/90 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-300 transition hover:text-amber-300"
        >
          {"🌙"} Portada
        </button>
      )}
    </div>
  );
}
