import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { TarjetaModeloAR } from "@/components/ar/TarjetaModeloAR";
import { getRecursoAR } from "@/lib/ar";
import type { Station } from "@/lib/data";
import { cn } from "@/lib/utils";

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
  const recursoAR = getRecursoAR(estacion.id);

  return (
    <article
      className={cn(
        "flex w-full items-stretch border-l-4 transition-colors",
        activa
          ? "border-cauce-500 bg-basalt-950 text-mist-50"
          : "border-transparent bg-white text-basalt-900 hover:border-cauce-500/50 hover:bg-mist-100"
      )}
    >
      <button
        type="button"
        onClick={() => onSeleccionar(estacion.id)}
        aria-current={activa ? "true" : undefined}
        className="group flex min-w-0 flex-1 items-center gap-4 p-4 text-left"
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

      {recursoAR ? (
        <div className="flex shrink-0 items-center py-2 pr-3">
          <TarjetaModeloAR recurso={recursoAR} compacta oscura={activa} />
        </div>
      ) : null}
    </article>
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
