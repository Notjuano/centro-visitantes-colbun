"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Camera,
  Compass,
  Footprints,
  Layers,
  Search,
  SplitSquareHorizontal,
  UserRound
} from "lucide-react";
import { ComparadorHistorico } from "@/components/mapa/ComparadorHistorico";
import { FichaPunto } from "@/components/mapa/FichaPunto";
import { MarcadorPunto } from "@/components/mapa/MarcadorPunto";
import { PanelCapas } from "@/components/mapa/PanelCapas";
import { PanelGuia } from "@/components/mapa/PanelGuia";
import { PanelTiempoReal } from "@/components/mapa/PanelTiempoReal";
import { useCentinelaInactividad } from "@/hooks/useCentinelaInactividad";
import { featuresAPuntos, obtenerGeoJsonSala } from "@/lib/cliente-api";
import { CAPAS, PUNTOS_INTERES, type CapaId, type PuntoInteres } from "@/lib/mapa";
import { cn } from "@/lib/utils";

type PanelActivo = "capas" | "tiempo" | "comparar" | null;

const CAPAS_INICIALES = new Set<CapaId>(CAPAS.map((capa) => capa.id));

/**
 * Kiosk UI SPA del tótem (CU-01, CU-03, CU-06).
 * Lienzo a pantalla completa, capas temáticas, fichas multimedia y reset de sala.
 */
export function MapaVivo() {
  const [puntos, setPuntos] = useState<PuntoInteres[]>(PUNTOS_INTERES);
  const [busqueda, setBusqueda] = useState("");
  const [capasAbiertas, setCapasAbiertas] = useState<Set<CapaId>>(CAPAS_INICIALES);
  const [panel, setPanel] = useState<PanelActivo>(null);
  const [puntoId, setPuntoId] = useState<string | null>(null);
  const [comparacion, setComparacion] = useState(52);
  const [rutaActiva, setRutaActiva] = useState("panorama");

  useEffect(() => {
    obtenerGeoJsonSala().then((coleccion) => {
      if (coleccion) setPuntos(featuresAPuntos(coleccion));
    });
  }, []);

  const restablecerSala = useCallback(() => {
    setBusqueda("");
    setCapasAbiertas(new Set(CAPAS.map((capa) => capa.id)));
    setPanel(null);
    setPuntoId(null);
    setComparacion(52);
    setRutaActiva("panorama");
  }, []);

  useCentinelaInactividad(restablecerSala);

  const puntoActivo = puntoId ? puntos.find((punto) => punto.id === puntoId) : undefined;
  const termino = busqueda.trim().toLowerCase();

  const puntosVisibles = useMemo(
    () =>
      puntos.filter((punto) => {
        if (!capasAbiertas.has(punto.capa)) return false;
        if (!termino) return true;
        return `${punto.titulo} ${punto.resumen} ${punto.contenido}`.toLowerCase().includes(termino);
      }),
    [capasAbiertas, puntos, termino]
  );

  const aplicarRuta = (id: string, capas: CapaId[]) => {
    setRutaActiva(id);
    setCapasAbiertas(new Set(capas));
    setPuntoId(null);
    setPanel(null);
  };

  const alternarCapa = (id: CapaId) => {
    setCapasAbiertas((previas) => {
      const siguiente = new Set(previas);
      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);
      return siguiente;
    });
  };

  const alternarPanel = (siguiente: PanelActivo) => {
    setPanel((actual) => (actual === siguiente ? null : siguiente));
    if (siguiente !== null) setPuntoId(null);
  };

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-basalt-950 text-white">
      {panel === "comparar" ? (
        <ComparadorHistorico
          porcentaje={comparacion}
          onCambiar={setComparacion}
          onCerrar={() => setPanel(null)}
        />
      ) : (
        <Image
          src="/images/mapa/territorio-vivo.jpg"
          alt="Vista aérea del territorio del Bío Bío"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      )}

      {panel !== "comparar" &&
        puntosVisibles.map((punto) => (
          <MarcadorPunto
            key={punto.id}
            punto={punto}
            seleccionado={punto.id === puntoId}
            onSeleccionar={(id) => {
              setPuntoId(id);
              setPanel(null);
            }}
          />
        ))}

      <header className="pointer-events-none absolute inset-x-0 top-0 z-50 flex items-start justify-between gap-4 p-4">
        <div className="pointer-events-auto flex items-start gap-3">
        <nav
            aria-label="Herramientas del mapa"
            className="flex flex-col items-center gap-2 rounded-full border border-white/10 bg-black/55 p-2 backdrop-blur-xl"
          >
            <BotonHerramienta
              etiqueta="Capas del territorio"
              activo={panel === "capas"}
              onClick={() => alternarPanel("capas")}
            >
              <Layers className="h-5 w-5" aria-hidden="true" />
            </BotonHerramienta>
            <BotonHerramienta etiqueta="Cuenta de visitante" onClick={() => undefined}>
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </BotonHerramienta>
            <BotonHerramienta
              etiqueta="Enfocar búsqueda"
              onClick={() => document.getElementById("busqueda-mapa")?.focus()}
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </BotonHerramienta>
            <BotonHerramienta etiqueta="Galería del territorio" onClick={() => setPuntoId("mirador-fotografico")}>
              <Camera className="h-5 w-5" aria-hidden="true" />
            </BotonHerramienta>
            <BotonHerramienta
              etiqueta="Información en tiempo real"
              activo={panel === "tiempo"}
              onClick={() => alternarPanel("tiempo")}
            >
              <BarChart3 className="h-5 w-5" aria-hidden="true" />
            </BotonHerramienta>
            <BotonHerramienta
              etiqueta="Comparación histórica"
              activo={panel === "comparar"}
              onClick={() => alternarPanel("comparar")}
            >
              <SplitSquareHorizontal className="h-5 w-5" aria-hidden="true" />
            </BotonHerramienta>
            <BotonHerramienta
              etiqueta="Mostrar u ocultar senderos"
              activo={capasAbiertas.has("senderos")}
              onClick={() => alternarCapa("senderos")}
            >
              <Footprints className="h-5 w-5" aria-hidden="true" />
            </BotonHerramienta>
          </nav>

          <form
            className="mt-1 flex h-12 w-[min(100vw-7rem,22rem)] items-center gap-2 rounded-full border border-white/10 bg-black/55 px-4 backdrop-blur-xl"
            onSubmit={(evento) => evento.preventDefault()}
            role="search"
          >
            <Search className="h-4 w-4 shrink-0 text-white/70" aria-hidden="true" />
            <label htmlFor="busqueda-mapa" className="sr-only">
              Buscar un punto del territorio
            </label>
            <input
              id="busqueda-mapa"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar en el territorio"
              className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-white/50"
            />
          </form>
        </div>

        <div className="pointer-events-auto flex flex-col items-end gap-3">
          <Link
            href="/"
            className="rounded-full border border-white/10 bg-black/55 px-4 py-2 text-xs uppercase tracking-[0.16em] text-white/80 backdrop-blur-xl hover:text-white"
          >
            Mapa vivo del Bío Bío
          </Link>
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-black/55 backdrop-blur-xl">
            <span className="absolute top-1 text-[10px] font-semibold tracking-widest">N</span>
            <Compass className="h-6 w-6 text-white" aria-hidden="true" />
            <span className="sr-only">Norte</span>
          </div>
        </div>
      </header>

      {panel === "capas" && (
        <PanelCapas
          abiertas={capasAbiertas}
          onCerrar={() => setPanel(null)}
          onAlternar={alternarCapa}
        />
      )}
      {panel === "tiempo" && <PanelTiempoReal onCerrar={() => setPanel(null)} />}
      {puntoActivo && <FichaPunto key={puntoActivo.id} punto={puntoActivo} onCerrar={() => setPuntoId(null)} />}

      {panel !== "comparar" && (
        <PanelGuia rutaActiva={rutaActiva} onSeleccionarRuta={aplicarRuta} onResetearSala={restablecerSala} />
      )}

      {panel !== "comparar" && (
        <aside className="absolute bottom-4 right-4 z-20 hidden overflow-hidden rounded-2xl border border-white/15 shadow-2xl sm:block">
          <Image
            src="/images/mapa/minimap-chile.jpg"
            alt="Ubicación del territorio en Chile"
            width={176}
            height={176}
            className="h-36 w-36 object-cover"
          />
        </aside>
      )}
    </div>
  );
}

function BotonHerramienta({
  etiqueta,
  activo,
  onClick,
  children
}: {
  etiqueta: string;
  activo?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      aria-pressed={activo}
      onClick={onClick}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full text-white/85 transition-colors",
        activo ? "bg-white text-basalt-950" : "hover:bg-white/10 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}
