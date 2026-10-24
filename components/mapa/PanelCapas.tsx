"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { ICONOS_MAPA } from "@/components/mapa/iconos";
import { CAPAS, type CapaId } from "@/lib/mapa";
import { cn } from "@/lib/utils";

type PanelCapasProps = {
  abiertas: Set<CapaId>;
  onCerrar: () => void;
  onAlternar: (id: CapaId) => void;
};

export function PanelCapas({ abiertas, onCerrar, onAlternar }: PanelCapasProps) {
  return (
    <section
      aria-label="Selección de capas"
      className="absolute left-[5.5rem] top-20 z-30 w-[min(100%-6rem,22rem)] rounded-[28px] border border-white/10 bg-[#101820]/92 p-3 shadow-2xl backdrop-blur-xl"
    >
      <div className="mb-2 flex items-center justify-end">
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar capas"
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <ul className="space-y-2">
        {CAPAS.map((capa) => {
          const Icono = ICONOS_MAPA[capa.icono];
          const activa = abiertas.has(capa.id);
          return (
            <li key={capa.id}>
              <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-2 pr-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: `${capa.color}33` }}
                >
                  <Icono className="h-5 w-5" style={{ color: capa.color }} aria-hidden="true" />
                </span>
                <div className="relative h-12 flex-1 overflow-hidden rounded-xl">
                  <Image src={capa.miniatura} alt="" fill className="object-cover" sizes="180px" />
                  <span className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-white">
                    {capa.nombre}
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={activa}
                  aria-label={`${activa ? "Ocultar" : "Mostrar"} capa ${capa.nombre}`}
                  onClick={() => onAlternar(capa.id)}
                  className={cn(
                    "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                    activa ? "bg-emerald-400" : "bg-white/20"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform",
                      activa ? "left-5" : "left-0.5"
                    )}
                  />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
