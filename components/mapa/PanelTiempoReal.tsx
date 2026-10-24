"use client";

import Image from "next/image";
import { Bird, Droplets, Leaf, Sun, Trees, X } from "lucide-react";
import { METRICAS_TERRITORIO } from "@/lib/mapa";

type PanelTiempoRealProps = {
  onCerrar: () => void;
};

function Sparkline({ valores, color }: { valores: number[]; color: string }) {
  const max = Math.max(...valores);
  const min = Math.min(...valores);
  const puntos = valores
    .map((valor, indice) => {
      const x = (indice / (valores.length - 1)) * 220;
      const y = 48 - ((valor - min) / (max - min || 1)) * 40;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 220 56" className="h-16 w-full" aria-hidden="true">
      <polyline fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" points={puntos} />
    </svg>
  );
}

export function PanelTiempoReal({ onCerrar }: PanelTiempoRealProps) {
  return (
    <section
      aria-label="Información en tiempo real"
      className="absolute right-4 top-20 z-30 w-[min(100%-2rem,26rem)] overflow-hidden rounded-[28px] border border-white/10 bg-[#101820]/94 p-4 text-white shadow-2xl backdrop-blur-xl"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg">Territorio en vivo</h2>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar información en tiempo real"
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mb-3 flex gap-2 text-cauce-400">
        <Droplets className="h-4 w-4" aria-hidden="true" />
        <Trees className="h-4 w-4" aria-hidden="true" />
        <Bird className="h-4 w-4" aria-hidden="true" />
        <Leaf className="h-4 w-4" aria-hidden="true" />
        <Sun className="h-4 w-4" aria-hidden="true" />
      </div>

      <ul className="space-y-3">
        {METRICAS_TERRITORIO.map((metrica, indice) => (
          <li key={metrica.id} className="rounded-2xl bg-white/5 p-3">
            <div className="flex items-baseline justify-between text-sm">
              <span>{metrica.etiqueta}</span>
              <span className="text-cauce-400">
                {metrica.valores[metrica.valores.length - 1]} {metrica.unidad}
              </span>
            </div>
            <Sparkline
              valores={metrica.valores}
              color={indice === 1 ? "#5BA8FF" : indice === 2 ? "#3DDC84" : "#2EE0C0"}
            />
          </li>
        ))}
      </ul>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="relative h-24 overflow-hidden rounded-2xl">
          <Image src="/images/mapa/poi-humedal.jpg" alt="Humedal del cauce" fill className="object-cover" sizes="200px" />
        </div>
        <div className="relative h-24 overflow-hidden rounded-2xl">
          <Image src="/images/mapa/poi-garza.jpg" alt="Garza en el humedal" fill className="object-cover" sizes="200px" />
        </div>
      </div>
      <div className="relative mt-2 h-28 overflow-hidden rounded-2xl">
        <Image
          src="/images/mapa/poi-martin-pescador.jpg"
          alt="Martín pescador en la ribera"
          fill
          className="object-cover"
          sizes="400px"
        />
      </div>
    </section>
  );
}
