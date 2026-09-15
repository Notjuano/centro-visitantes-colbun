import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Station } from "@/lib/data";

const ETIQUETA_CATEGORIA: Record<Station["categoria"], string> = {
  energia: "Energía",
  agua: "Agua",
  sustentabilidad: "Sustentabilidad",
  comunidad: "Comunidad"
};

type StationCardProps = {
  estacion: Station;
  activa: boolean;
  onSeleccionar: (id: string) => void;
};

export function StationCard({ estacion, activa, onSeleccionar }: StationCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSeleccionar(estacion.id)}
      aria-current={activa ? "true" : undefined}
      className={`group flex w-full items-center gap-4 border-l-4 p-4 text-left transition-colors ${
        activa
          ? "border-cauce-500 bg-basalt-950 text-mist-50"
          : "border-transparent bg-white text-basalt-900 hover:border-cauce-500/50 hover:bg-mist-100"
      }`}
    >
      <span
        aria-hidden="true"
        className={`font-display text-2xl ${activa ? "text-cauce-400" : "text-basalt-700/40"}`}
      >
        {String(estacion.numero).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs uppercase tracking-wide text-cauce-500">
          {ETIQUETA_CATEGORIA[estacion.categoria]}
        </span>
        <span className="block truncate font-medium">{estacion.titulo}</span>
        <span className={`block truncate text-sm ${activa ? "text-mist-200" : "text-basalt-700"}`}>
          {estacion.resumen}
        </span>
      </span>
      <ArrowRight
        className={`h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 ${
          activa ? "text-cauce-400" : "text-basalt-700/50"
        }`}
        aria-hidden="true"
      />
    </button>
  );
}

export function StationImage({ estacion }: { estacion: Station }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden border border-basalt-700/20 bg-mist-100">
      <Image
        src={estacion.imagenUrl}
        alt={`Ilustración de la estación: ${estacion.titulo}`}
        fill
        className="object-cover"
        sizes="(min-width: 1024px) 640px, 100vw"
        priority={false}
      />
    </div>
  );
}
