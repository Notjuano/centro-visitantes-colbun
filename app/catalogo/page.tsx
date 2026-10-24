"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import { StationCard, StationImage } from "@/components/ui/StationCard";
import { TarjetaModeloAR } from "@/components/ar/TarjetaModeloAR";
import { getRecursoAR } from "@/lib/ar";
import { ESTACIONES, getEstacionPorId } from "@/lib/data";

function CatalogoContenido() {
  const searchParams = useSearchParams();
  const modo = searchParams.get("modo") === "totem" ? "totem" : "movil";
  const estacionInicial = searchParams.get("estacion");
  const [estacionActivaId, setEstacionActivaId] = useState(
    estacionInicial && getEstacionPorId(estacionInicial) ? estacionInicial : ESTACIONES[0].id
  );

  const estacionActiva = getEstacionPorId(estacionActivaId) ?? ESTACIONES[0];
  const recursoAR = getRecursoAR(estacionActiva.id);

  return (
    <div className="flex min-h-screen flex-col bg-mist-50">
      <Navbar />

      <main id="contenido-principal" className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-wide text-cauce-600">
            Catálogo digital · Modo {modo === "totem" ? "Tótem" : "Móvil"}
          </p>
          <h1 className="mt-1 font-display text-3xl text-basalt-900">Estaciones educativas</h1>
          <p className="mt-2 max-w-2xl text-basalt-700">
            Elige una estación para ver su contenido, el modelo 3D y el código QR de realidad
            aumentada, o abre el mapa vivo para explorar el territorio por capas.
          </p>
        </header>

        <div className={`grid gap-8 ${modo === "totem" ? "lg:grid-cols-[1.4fr_1fr]" : "lg:grid-cols-[1fr_1.2fr]"}`}>
          <section aria-label="Listado de estaciones" className="space-y-2">
            {ESTACIONES.map((estacion) => (
              <StationCard
                key={estacion.id}
                estacion={estacion}
                activa={estacion.id === estacionActivaId}
                onSeleccionar={setEstacionActivaId}
              />
            ))}
          </section>

          <section aria-label="Detalle de la estación seleccionada" className="space-y-4">
            <StationImage estacion={estacionActiva} />

            {recursoAR ? <TarjetaModeloAR recurso={recursoAR} /> : null}

            <div>
              <span className="text-xs uppercase tracking-wide text-cauce-600">
                Estación {String(estacionActiva.numero).padStart(2, "0")}
              </span>
              <h2 className={`mt-1 font-display text-basalt-900 ${modo === "totem" ? "text-3xl" : "text-2xl"}`}>
                {estacionActiva.titulo}
              </h2>
              <p className={`mt-3 leading-relaxed text-basalt-700 ${modo === "totem" ? "text-lg" : "text-base"}`}>
                {estacionActiva.contenido}
              </p>
            </div>

            <AudioPlayer
              src={estacionActiva.audioUrl}
              titulo={estacionActiva.titulo}
              duracion={estacionActiva.duracionAudio}
              transcripcion={estacionActiva.contenido}
            />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={null}>
      <CatalogoContenido />
    </Suspense>
  );
}
