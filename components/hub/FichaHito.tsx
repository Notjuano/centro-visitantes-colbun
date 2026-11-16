"use client";

import type { ReactNode } from "react";

export type FichaHitoData = {
  titulo: string;
  categoria?: string;
  color?: string;
  sector?: string;
  icono?: string;
  resumen?: string;
  contenido: string;
  horario?: string;
  audioUrl?: string;
  duracionAudio?: string;
  modeloUrl?: string;
};

type FichaHitoProps = {
  hito: FichaHitoData;
  onCerrar: () => void;
  /** Bloques propios de cada visor (galería, audio, modelo AR). */
  children?: ReactNode;
  pie?: string;
};

/** Ficha territorial lateral, con la misma geometría en ambos visores. */
export function FichaHito({ hito, onCerrar, children, pie }: FichaHitoProps) {
  return (
    <aside className="animar-aparecer-lateral absolute bottom-6 right-6 top-28 z-20 flex w-96 max-w-[calc(100vw-3rem)] flex-col justify-between rounded-3xl border border-amber-500/40 bg-slate-900/95 p-6 text-slate-100 shadow-2xl backdrop-blur-xl">
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {hito.categoria && (
              <span
                className="rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-white"
                style={{ backgroundColor: hito.color ?? "#3B82F6" }}
              >
                {hito.categoria}
              </span>
            )}
            {hito.sector && (
              <span className="rounded-full border border-amber-500/20 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
                {"📍"} {hito.sector}
              </span>
            )}
          </div>
          <button
            type="button"
            aria-label="Cerrar ficha"
            onClick={onCerrar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-base font-bold text-slate-300 transition hover:bg-slate-700"
          >
            {"✕"}
          </button>
        </div>

        <div className="mb-2 flex items-center gap-3">
          {hito.icono && <span className="text-4xl leading-none">{hito.icono}</span>}
          <h2 className="text-xl font-bold leading-tight text-amber-300">{hito.titulo}</h2>
        </div>

        {hito.resumen && (
          <p className="mb-3 border-b border-slate-800 pb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {hito.resumen}
          </p>
        )}

        <p className="mb-4 text-sm leading-relaxed text-slate-200">{hito.contenido}</p>

        {hito.horario && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2.5 text-xs text-slate-300">
            <span className="font-semibold text-amber-400">{"🕒"} Horario:</span>
            <span>{hito.horario}</span>
          </div>
        )}

        {hito.audioUrl && (
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-800/80 p-3.5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 font-bold text-slate-950">
                {"▶"}
              </span>
              <div>
                <p className="text-xs font-bold text-slate-100">Audioguía de sala</p>
                <p className="text-[11px] text-slate-400">
                  Relato interactivo {"•"} Español{hito.duracionAudio ? ` • ${hito.duracionAudio}` : ""}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-amber-400">MP3</span>
          </div>
        )}

        {children}
      </div>

      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-800 to-slate-900 p-4">
        <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-amber-400">
          Ficha Territorial Validada
        </span>
        <p className="text-xs leading-snug text-slate-300">
          {pie ??
            "Punto georreferenciado de la cuenca del Biobío y Huequecura habilitado para mediación táctil en el Centro de Visitantes Angostura."}
        </p>
      </div>
    </aside>
  );
}
