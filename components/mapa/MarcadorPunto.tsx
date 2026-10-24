"use client";

import { ICONOS_MAPA } from "@/components/mapa/iconos";
import type { PuntoInteres } from "@/lib/mapa";
import { cn } from "@/lib/utils";

type MarcadorPuntoProps = {
  punto: PuntoInteres;
  seleccionado: boolean;
  onSeleccionar: (id: string) => void;
};

export function MarcadorPunto({ punto, seleccionado, onSeleccionar }: MarcadorPuntoProps) {
  const Icono = ICONOS_MAPA[punto.icono];

  return (
    <button
      type="button"
      aria-pressed={seleccionado}
      aria-label={`${punto.titulo}. ${punto.resumen}`}
      onClick={() => onSeleccionar(punto.id)}
      className="absolute z-10 -translate-x-1/2 -translate-y-full"
      style={{ left: `${punto.x}%`, top: `${punto.y}%` }}
    >
      <span
        className={cn(
          "relative flex h-12 w-12 items-center justify-center rounded-full text-white shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition-transform",
          seleccionado ? "scale-110 mapa-marcador-pulso" : "hover:scale-105"
        )}
        style={{ backgroundColor: punto.color }}
      >
        <Icono className="h-5 w-5" aria-hidden="true" strokeWidth={2.2} />
      </span>
      <span
        className="absolute left-1/2 top-[42px] h-3 w-3 -translate-x-1/2 rotate-45 rounded-sm"
        style={{ backgroundColor: punto.color }}
        aria-hidden="true"
      />
    </button>
  );
}
