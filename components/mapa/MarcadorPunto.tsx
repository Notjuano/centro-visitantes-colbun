"use client";

import { ICONOS_MAPA } from "@/components/mapa/iconos";
import type { PuntoInteres } from "@/lib/mapa";
import { cn } from "@/lib/utils";

type MarcadorPuntoProps = {
  punto: PuntoInteres;
  /** Posición horizontal en píxeles dentro del visor. */
  x: number;
  /** Posición vertical en píxeles dentro del visor. */
  y: number;
  seleccionado: boolean;
  onSeleccionar: (id: string) => void;
};

/**
 * Marcador geográfico del punto de interés.
 * Se posiciona sobre las coordenadas proyectadas por el visor satelital y
 * reacciona al toque con animación de entrada, anillo de pulso y etiqueta.
 */
export function MarcadorPunto({ punto, x, y, seleccionado, onSeleccionar }: MarcadorPuntoProps) {
  const Icono = ICONOS_MAPA[punto.icono];

  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ left: x, top: y }}
    >
      <button
        type="button"
        aria-pressed={seleccionado}
        aria-label={`${punto.titulo}. ${punto.lugar}. ${punto.resumen}`}
        onClick={() => onSeleccionar(punto.id)}
        className="group pointer-events-auto relative block outline-none"
      >
        {seleccionado && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2"
          >
            <span
              className="anillo-pulso block h-full w-full rounded-full"
              style={{ backgroundColor: punto.color }}
            />
          </span>
        )}

        <span className="animar-entrada-marcador block">
          <span
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full text-white ring-2 ring-white/60 transition-transform duration-300 ease-out group-hover:scale-110",
              seleccionado && "scale-[1.18] ring-white"
            )}
            style={{
              backgroundColor: punto.color,
              boxShadow: `0 12px 28px ${punto.color}66, 0 4px 10px rgba(0, 0, 0, 0.45)`
            }}
          >
            <Icono className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />
          </span>
        </span>

        <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max max-w-[13rem] origin-top -translate-x-1/2 scale-95 rounded-xl border border-white/15 bg-basalt-950/90 px-3 py-1.5 text-left opacity-0 shadow-2xl backdrop-blur-md transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100">
          <span className="block text-xs font-semibold text-white">{punto.titulo}</span>
          <span className="block text-[11px] leading-snug text-cauce-400">{punto.lugar}</span>
        </span>
      </button>
    </div>
  );
}
