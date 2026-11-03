"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Compass, Layers3, Minus, Plus, Waves } from "lucide-react";
import { MarcadorPunto } from "@/components/mapa/MarcadorPunto";
import type { PuntoInteres } from "@/lib/mapa";
import {
  BOUNDS_BIOBIO,
  CAUCE_BIOBIO,
  CENTRO_BIOBIO,
  ESQUINAS_CAUCE,
  ZOOM_BIOBIO,
  suavizarTrazado
} from "@/lib/territorio";
import { cn } from "@/lib/utils";

/** Capa de referencia oficial de límites y localidades sobre la imagen satelital. */
const ETIQUETAS_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

/**
 * Trazado del cauce suavizado con spline Catmull-Rom: los meandros quedan
 * curvos y nítidos en vez de mostrarse como segmentos rectos al acercar.
 */
const CAUCE_SUAVE = suavizarTrazado(CAUCE_BIOBIO, 6);

export type CapaBaseId = "satelite" | "relieve" | "oscuro";

export type FocoMapa = { latitud: number; longitud: number; zoom: number };

/** Capa del cauce con su peso base y su sensibilidad al nivel de zoom. */
type CapaCauce = { nombre: string; capa: L.Polyline; peso: number; exponente: number };

type DefinicionCapaBase = {
  id: CapaBaseId;
  nombre: string;
  url: string;
  clase: string;
  atribucion: string;
};

/**
 * Servicios de teselas ArcGIS World (sin API key) centrados en la Región del Bío Bío:
 * imagen satelital real, relieve sombreado y una variante nocturna.
 */
export const CAPAS_BASE: DefinicionCapaBase[] = [
  {
    id: "satelite",
    nombre: "Satélite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    clase: "mapa-tiles-satelite",
    atribucion: "Imágenes © Esri, Maxar, Earthstar Geographics · Límites © Esri"
  },
  {
    id: "relieve",
    nombre: "Relieve",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}",
    clase: "mapa-tiles-relieve",
    atribucion: "Relieve sombreado © Esri · Límites © Esri"
  },
  {
    id: "oscuro",
    nombre: "Nocturno",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    clase: "mapa-tiles-oscuro",
    atribucion: "Imágenes © Esri, Maxar · Límites © Esri"
  }
];

type MapaSatelitalProps = {
  puntos: PuntoInteres[];
  puntoActivoId: string | null;
  onSeleccionar: (id: string) => void;
  capaBase: CapaBaseId;
  onCambiarCapaBase: (id: CapaBaseId) => void;
  foco: FocoMapa | null;
  limites: [number, number][] | null;
};

/**
 * Visor satelital interactivo del Bío Bío.
 * Leaflet dibuja las teselas satelitales y la capa de etiquetas; los marcadores
 * se proyectan a píxeles en cada movimiento para poder animarlos con React.
 */
export function MapaSatelital({
  puntos,
  puntoActivoId,
  onSeleccionar,
  capaBase,
  onCambiarCapaBase,
  foco,
  limites
}: MapaSatelitalProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const capaBaseRef = useRef<L.TileLayer | null>(null);
  const capaCauceRef = useRef<L.LayerGroup | null>(null);
  const cauceCapasRef = useRef<CapaCauce[]>([]);
  const puntosRef = useRef<PuntoInteres[]>(puntos);
  const [posiciones, setPosiciones] = useState<Record<string, { x: number; y: number }>>({});
  const [listo, setListo] = useState(false);
  const [cauceVisible, setCauceVisible] = useState(true);

  puntosRef.current = puntos;

  const recalcular = useCallback(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;

    const siguiente: Record<string, { x: number; y: number }> = {};
    puntosRef.current.forEach((punto) => {
      const proyeccion = mapa.latLngToContainerPoint([punto.latitud, punto.longitud]);
      siguiente[punto.id] = { x: proyeccion.x, y: proyeccion.y };
    });
    setPosiciones(siguiente);
  }, []);

  /**
   * Escala el grosor del cauce según el nivel de zoom para que acompañe el
   * ancho real del río: fino en la vista regional y definido al acercar.
   */
  const ajustarCauce = useCallback(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;
    const relativo = mapa.getZoom() - ZOOM_BIOBIO;
    const factor = Math.max(0.7, Math.min(3, 1 + relativo * 0.26));
    cauceCapasRef.current.forEach(({ capa, peso, exponente }) => {
      capa.setStyle({ weight: Number((peso * Math.pow(factor, exponente)).toFixed(2)) });
    });
  }, []);

  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor || mapaRef.current) return;

    const mapa = L.map(contenedor, {
      center: [CENTRO_BIOBIO.latitud, CENTRO_BIOBIO.longitud],
      zoom: ZOOM_BIOBIO,
      zoomControl: false,
      attributionControl: false,
      minZoom: 8,
      maxZoom: 18,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 90,
      maxBounds: L.latLngBounds(
        [BOUNDS_BIOBIO.sur, BOUNDS_BIOBIO.oeste],
        [BOUNDS_BIOBIO.norte, BOUNDS_BIOBIO.este]
      ),
      maxBoundsViscosity: 0.5,
      worldCopyJump: false
    });

    const base = CAPAS_BASE[0];
    const capaImagen = L.tileLayer(base.url, {
      maxNativeZoom: 17,
      maxZoom: 18,
      className: base.clase,
      attribution: base.atribucion
    }).addTo(mapa);

    L.tileLayer(ETIQUETAS_URL, {
      maxNativeZoom: 17,
      maxZoom: 18,
      pane: "overlayPane",
      className: "mapa-tiles-etiquetas"
    }).addTo(mapa);

    mapa.createPane("cauce");
    const paneCauce = mapa.getPane("cauce");
    if (paneCauce) paneCauce.style.zIndex = "455";

    // El cauce se compone de varias capas superpuestas: halo, lecho, línea base
    // y dos trenes de destellos que circulan a distinta velocidad (más movimiento).
    const definiciones: {
      nombre: string;
      color: string;
      peso: number;
      opacidad: number;
      clase: string;
      exponente: number;
    }[] = [
      { nombre: "aura", color: "#2ad3bd", peso: 22, opacidad: 0.3, clase: "cauce-aura", exponente: 0.55 },
      { nombre: "lecho", color: "#0b5a60", peso: 7, opacidad: 0.5, clase: "cauce-lecho", exponente: 0.85 },
      { nombre: "base", color: "#63f2df", peso: 2.8, opacidad: 0.92, clase: "cauce-base", exponente: 1 },
      { nombre: "flujo", color: "#eafffb", peso: 3.4, opacidad: 0.95, clase: "cauce-flujo", exponente: 1 },
      { nombre: "brillo", color: "#ffffff", peso: 1.6, opacidad: 0.9, clase: "cauce-brillo", exponente: 1 }
    ];

    cauceCapasRef.current = definiciones.map(({ nombre, color, peso, opacidad, clase, exponente }) => ({
      nombre,
      peso,
      exponente,
      capa: L.polyline(CAUCE_SUAVE, {
        pane: "cauce",
        color,
        weight: peso,
        opacity: opacidad,
        lineCap: "round",
        lineJoin: "round",
        interactive: false,
        className: clase
      })
    }));

    capaCauceRef.current = L.layerGroup(cauceCapasRef.current.map(({ capa }) => capa)).addTo(mapa);

    capaBaseRef.current = capaImagen;
    mapaRef.current = mapa;

    mapa.on("move zoom viewreset resize", recalcular);
    mapa.on("zoomend", ajustarCauce);

    const temporizador = window.setTimeout(() => {
      mapa.invalidateSize();
      mapa.fitBounds(L.latLngBounds(ESQUINAS_CAUCE), { padding: [40, 40], maxZoom: 10 });
      recalcular();
      ajustarCauce();
      setListo(true);
    }, 160);

    return () => {
      window.clearTimeout(temporizador);
      mapa.off("move zoom viewreset resize", recalcular);
      mapa.off("zoomend", ajustarCauce);
      mapa.remove();
      mapaRef.current = null;
      capaBaseRef.current = null;
      capaCauceRef.current = null;
      cauceCapasRef.current = [];
    };
  }, [recalcular, ajustarCauce]);

  useEffect(() => {
    const mapa = mapaRef.current;
    const cauce = capaCauceRef.current;
    if (!mapa || !cauce) return;
    if (cauceVisible && !mapa.hasLayer(cauce)) cauce.addTo(mapa);
    if (!cauceVisible && mapa.hasLayer(cauce)) mapa.removeLayer(cauce);
  }, [cauceVisible]);

  useEffect(() => {
    if (listo) recalcular();
  }, [puntos, listo, recalcular]);

  useEffect(() => {
    const mapa = mapaRef.current;
    const anterior = capaBaseRef.current;
    if (!mapa || !anterior) return;

    const definicion = CAPAS_BASE.find((capa) => capa.id === capaBase) ?? CAPAS_BASE[0];
    if (anterior.options.className === definicion.clase) return;

    mapa.removeLayer(anterior);
    const nueva = L.tileLayer(definicion.url, {
      maxNativeZoom: 17,
      maxZoom: 18,
      className: definicion.clase,
      attribution: definicion.atribucion
    }).addTo(mapa);
    nueva.bringToBack();
    capaBaseRef.current = nueva;
  }, [capaBase]);

  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa || !foco) return;
    mapa.flyTo([foco.latitud, foco.longitud], foco.zoom, { duration: 1.1, easeLinearity: 0.25 });
  }, [foco]);

  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa || !limites || limites.length === 0) return;

    if (limites.length === 1) {
      mapa.flyTo(limites[0], 12, { duration: 1.1 });
      return;
    }
    mapa.flyToBounds(L.latLngBounds(limites), {
      padding: [90, 90],
      maxZoom: 13,
      duration: 1.1,
      easeLinearity: 0.25
    });
  }, [limites]);

  const verCauceCompleto = () =>
    mapaRef.current?.flyToBounds(L.latLngBounds(ESQUINAS_CAUCE), {
      padding: [40, 40],
      maxZoom: 10,
      duration: 1.1
    });

  const capaActiva = CAPAS_BASE.find((capa) => capa.id === capaBase) ?? CAPAS_BASE[0];

  return (
    <div className="absolute inset-0">
      <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id="mapa-realce-satelite" colorInterpolationFilters="sRGB">
            <feConvolveMatrix
              order="3"
              preserveAlpha="true"
              kernelMatrix="0 -0.16 0 -0.16 1.64 -0.16 0 -0.16 0"
            />
          </filter>
        </defs>
      </svg>
      <div ref={contenedorRef} className="absolute inset-0 z-0" />

      <div
        className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(circle_at_50%_42%,transparent_38%,rgba(4,14,19,0.55)_100%)]"
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        {listo &&
          puntos.map((punto) => {
            const posicion = posiciones[punto.id];
            if (!posicion) return null;
            return (
              <MarcadorPunto
                key={punto.id}
                punto={punto}
                x={posicion.x}
                y={posicion.y}
                seleccionado={punto.id === puntoActivoId}
                onSeleccionar={onSeleccionar}
              />
            );
          })}
      </div>

      <div className="absolute bottom-6 right-4 z-20 flex flex-col items-end gap-3">
        <div className="glass animar-aparecer flex flex-col overflow-hidden rounded-2xl">
          <BotonControl etiqueta="Acercar" onClick={() => mapaRef.current?.zoomIn(1)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
          </BotonControl>
          <span className="mx-2 h-px bg-white/15" aria-hidden="true" />
          <BotonControl etiqueta="Alejar" onClick={() => mapaRef.current?.zoomOut(1)}>
            <Minus className="h-4 w-4" aria-hidden="true" />
          </BotonControl>
        </div>

        <div className="glass animar-aparecer flex flex-col gap-1 rounded-2xl p-1.5">
          <p className="flex items-center gap-1.5 px-2 pb-1 pt-0.5 text-[10px] uppercase tracking-[0.18em] text-white/60">
            <Layers3 className="h-3 w-3" aria-hidden="true" />
            Base
          </p>
          {CAPAS_BASE.map((capa) => {
            const activa = capa.id === capaBase;
            return (
              <button
                key={capa.id}
                type="button"
                aria-pressed={activa}
                onClick={() => onCambiarCapaBase(capa.id)}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-left text-xs transition-colors",
                  activa ? "bg-white text-basalt-950" : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                {capa.nombre}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={verCauceCompleto}
          className="glass animar-aparecer flex items-center gap-2 rounded-full px-3 py-2 text-xs text-white/85 transition-colors hover:text-white"
        >
          <Compass className="h-3.5 w-3.5" aria-hidden="true" />
          Ver todo el cauce
        </button>

        <button
          type="button"
          aria-pressed={cauceVisible}
          onClick={() => setCauceVisible((visible) => !visible)}
          className={cn(
            "glass animar-aparecer flex items-center gap-2 rounded-full px-3 py-2 text-xs transition-colors",
            cauceVisible ? "text-cauce-400" : "text-white/60 hover:text-white"
          )}
        >
          <Waves className="h-3.5 w-3.5" aria-hidden="true" />
          Cauce Bío Bío
        </button>

        <p className="pointer-events-auto max-w-[15rem] text-right text-[10px] leading-tight text-white/55">
          {capaActiva.atribucion}
        </p>
      </div>

      {!listo && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-basalt-950">
          <p className="animar-latir text-xs uppercase tracking-[0.32em] text-cauce-400">
            Cargando imagen satelital
          </p>
        </div>
      )}
    </div>
  );
}

function BotonControl({
  etiqueta,
  onClick,
  children
}: {
  etiqueta: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center text-white/85 transition-colors hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  );
}
