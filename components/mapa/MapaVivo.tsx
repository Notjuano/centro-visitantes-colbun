"use client";

import dynamic from "next/dynamic";
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
import { PanelCapas } from "@/components/mapa/PanelCapas";
import { PanelGuia } from "@/components/mapa/PanelGuia";
import { PanelTiempoReal } from "@/components/mapa/PanelTiempoReal";
import type { CapaBaseId, FocoMapa } from "@/components/mapa/MapaSatelital";
import { useCentinelaInactividad } from "@/hooks/useCentinelaInactividad";
import { featuresAPuntos, obtenerGeoJsonSala } from "@/lib/cliente-api";
import { CAPAS, PUNTOS_INTERES, type CapaId, type PuntoInteres } from "@/lib/mapa";
import { CENTRO_BIOBIO, ZOOM_BIOBIO } from "@/lib/territorio";
import { cn } from "@/lib/utils";

const MapaSatelital = dynamic(
  () => import("@/components/mapa/MapaSatelital").then((modulo) => modulo.MapaSatelital),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 z-0 flex items-center justify-center bg-basalt-950">
        <p className="animar-latir text-xs uppercase tracking-[0.32em] text-cauce-400">
          Preparando visor satelital
        </p>
      </div>
    )
  }
);

type PanelActivo = "capas" | "tiempo" | "comparar" | null;

const CAPAS_INICIALES = new Set<CapaId>(CAPAS.map((capa) => capa.id));

/**
 * Kiosk UI SPA del tótem (CU-01, CU-03, CU-06).
 * Visor satelital a pantalla completa, capas temáticas, fichas multimedia y reset de sala.
 */
export function MapaVivo() {
  const [puntos, setPuntos] = useState<PuntoInteres[]>(PUNTOS_INTERES);
  const [busqueda, setBusqueda] = useState("");
  const [capasAbiertas, setCapasAbiertas] = useState<Set<CapaId>>(CAPAS_INICIALES);
  const [panel, setPanel] = useState<PanelActivo>(null);
  const [puntoId, setPuntoId] = useState<string | null>(null);
  const [comparacion, setComparacion] = useState(52);
  const [rutaActiva, setRutaActiva] = useState("panorama");
  const [capaBase, setCapaBase] = useState<CapaBaseId>("satelite");
  const [foco, setFoco] = useState<FocoMapa | null>(null);
  const [limites, setLimites] = useState<[number, number][] | null>(null);

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
    setCapaBase("satelite");
    setLimites(null);
    setFoco({ latitud: CENTRO_BIOBIO.latitud, longitud: CENTRO_BIOBIO.longitud, zoom: ZOOM_BIOBIO });
  }, []);

  useCentinelaInactividad(restablecerSala);

  const puntoActivo = puntoId ? puntos.find((punto) => punto.id === puntoId) : undefined;
  const termino = busqueda.trim().toLowerCase();

  const puntosVisibles = useMemo(
    () =>
      puntos.filter((punto) => {
        if (!capasAbiertas.has(punto.capa)) return false;
        if (!termino) return true;
        return `${punto.titulo} ${punto.lugar} ${punto.resumen} ${punto.contenido}`
          .toLowerCase()
          .includes(termino);
      }),
    [capasAbiertas, puntos, termino]
  );

  const seleccionarPunto = useCallback(
    (id: string) => {
      const punto = puntos.find((item) => item.id === id);
      setPuntoId(id);
      setPanel(null);
      if (punto) setFoco({ latitud: punto.latitud, longitud: punto.longitud, zoom: 13 });
    },
    [puntos]
  );

  const buscarEnTerritorio = () => {
    if (puntosVisibles.length === 0) return;
    if (puntosVisibles.length === 1) {
      seleccionarPunto(puntosVisibles[0].id);
      return;
    }
    setPuntoId(null);
    setPanel(null);
    setLimites(puntosVisibles.map((punto) => [punto.latitud, punto.longitud] as [number, number]));
  };

  const aplicarRuta = (id: string, capas: CapaId[]) => {
    setRutaActiva(id);
    setCapasAbiertas(new Set(capas));
    setPuntoId(null);
    setPanel(null);
    setFoco(null);
    setLimites(
      puntos
        .filter((punto) => capas.includes(punto.capa))
        .map((punto) => [punto.latitud, punto.longitud] as [number, number])
    );
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
      <MapaSatelital
        puntos={puntosVisibles}
        puntoActivoId={puntoId}
        onSeleccionar={seleccionarPunto}
        capaBase={capaBase}
        onCambiarCapaBase={setCapaBase}
        foco={foco}
        limites={limites}
      />

      {panel === "comparar" && (
        <ComparadorHistorico
          porcentaje={comparacion}
          onCambiar={setComparacion}
          onCerrar={() => setPanel(null)}
        />
      )}

      <header className="pointer-events-none absolute inset-x-0 top-0 z-50 flex items-start justify-between gap-4 p-4">
        <div className="pointer-events-auto flex items-start gap-3">
          <nav
            aria-label="Herramientas del mapa"
            className="glass animar-aparecer flex flex-col items-center gap-2 rounded-full p-2"
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
            className="glass animar-aparecer mt-1 flex h-12 w-[min(100vw-7rem,22rem)] items-center gap-2 rounded-full px-4"
            onSubmit={(evento) => {
              evento.preventDefault();
              buscarEnTerritorio();
            }}
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
            <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/60">
              {puntosVisibles.length} puntos
            </span>
          </form>
        </div>

        <div className="pointer-events-auto flex flex-col items-end gap-3">
          <Link
            href="/"
            className="glass animar-aparecer rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] text-white/80 transition-colors hover:text-white"
          >
            Mapa vivo del Bío Bío
          </Link>
          <div className="glass animar-aparecer relative flex h-14 w-14 items-center justify-center rounded-full">
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
        "flex h-11 w-11 items-center justify-center rounded-full text-white/85 transition-all duration-200",
        activo ? "bg-white text-basalt-950" : "hover:bg-white/10 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}
