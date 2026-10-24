"use client";

import Image from "next/image";
import { X } from "lucide-react";

type ComparadorHistoricoProps = {
  porcentaje: number;
  onCambiar: (valor: number) => void;
  onCerrar: () => void;
};

export function ComparadorHistorico({ porcentaje, onCambiar, onCerrar }: ComparadorHistoricoProps) {
  return (
    <div className="absolute inset-0 z-20">
      <Image
        src="/images/mapa/territorio-historico.jpg"
        alt="Territorio en una imagen histórica"
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - porcentaje}% 0 0)` }}>
        <Image
          src="/images/mapa/territorio-vivo.jpg"
          alt="Territorio en la actualidad"
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <div
        className="absolute bottom-0 top-0 z-10 w-0.5 bg-white"
        style={{ left: `${porcentaje}%` }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-basalt-900 shadow-xl"
        style={{ left: `${porcentaje}%` }}
        aria-hidden="true"
      >
        <span className="text-lg font-semibold">{"<>"}</span>
      </div>

      <label className="absolute inset-0 z-20 cursor-ew-resize">
        <span className="sr-only">Comparar imagen histórica y actual del territorio</span>
        <input
          type="range"
          min={4}
          max={96}
          value={porcentaje}
          onChange={(evento) => onCambiar(Number(evento.target.value))}
          className="h-full w-full cursor-ew-resize opacity-0"
        />
      </label>

      <div className="pointer-events-none absolute left-6 top-6 rounded-full bg-black/55 px-4 py-2 text-sm text-white backdrop-blur-md">
        Histórico
      </div>
      <div className="pointer-events-none absolute right-6 top-6 rounded-full bg-black/55 px-4 py-2 text-sm text-white backdrop-blur-md">
        Actual
      </div>

      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar comparación histórica"
        className="absolute right-4 top-20 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md hover:bg-black/70"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
