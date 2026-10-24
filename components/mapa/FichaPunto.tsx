"use client";

import Image from "next/image";
import { useState } from "react";
import { Bookmark, Info, Share2, Volume2, X } from "lucide-react";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import { TarjetaModeloAR } from "@/components/ar/TarjetaModeloAR";
import { getRecursoAR } from "@/lib/ar";
import type { PuntoInteres } from "@/lib/mapa";
import { cn } from "@/lib/utils";

type FichaPuntoProps = {
  punto: PuntoInteres;
  onCerrar: () => void;
};

/** CU-01 / CU-02: ficha modal con texto, galería, audioguía y QR de WebAR. */
export function FichaPunto({ punto, onCerrar }: FichaPuntoProps) {
  const [imagenActiva, setImagenActiva] = useState(punto.imagen);
  const recursoAR = getRecursoAR(punto.id);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-ficha-punto"
        className="grid max-h-[90dvh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-white/10 bg-[#101820]/95 shadow-2xl md:grid-cols-[1.4fr_1fr]"
      >
        <div className="relative min-h-[280px]">
          <Image
            src={imagenActiva}
            alt={`Vista de ${punto.titulo}`}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 55vw, 100vw"
          />
          <div className="absolute bottom-3 left-3 flex gap-2">
            {punto.galeria.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setImagenActiva(src)}
                aria-label="Cambiar imagen de la galería"
                className={cn(
                  "relative h-14 w-20 overflow-hidden rounded-lg border-2",
                  imagenActiva === src ? "border-white" : "border-transparent opacity-80"
                )}
              >
                <Image src={src} alt="" fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 p-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-cauce-400">{punto.capa}</p>
              <h2 id="titulo-ficha-punto" className="mt-1 font-display text-2xl">
                {punto.titulo}
              </h2>
            </div>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar ficha"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <p className="text-sm leading-relaxed text-white/80">{punto.contenido}</p>

          <div className="flex gap-2" aria-label="Acciones del punto">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <Info className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <Bookmark className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <Share2 className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>

          {recursoAR ? <TarjetaModeloAR recurso={recursoAR} oscura /> : null}

          <AudioPlayer
            variante="oscuro"
            src={punto.audioUrl}
            titulo={punto.titulo}
            duracion={punto.duracionAudio}
            transcripcion={punto.contenido}
          />
        </div>
      </article>
    </div>
  );
}
