"use client";

import type { ReactNode } from "react";

type CapaReposoProps = {
  /** Línea de marca superior, en mayúsculas espaciadas. */
  marca: string;
  /** Invitación breve sobre el título. */
  pretitulo: string;
  titulo: string;
  onIniciar: () => void;
  etiquetaBoton?: string;
  /** Piezas extras (por ejemplo el QR de la sala) antes del botón. */
  children?: ReactNode;
};

/**
 * Portada de reposo del tótem (attract mode).
 * Se reactiva sola al vencer el centinela de inactividad.
 */
export function CapaReposo({
  marca,
  pretitulo,
  titulo,
  onIniciar,
  etiquetaBoton = "Comienza a explorar",
  children
}: CapaReposoProps) {
  return (
    <div className="animar-aparecer pointer-events-auto absolute inset-0 z-30 flex flex-col items-center justify-between px-6 py-16">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_45%,rgba(4,16,10,0.72),rgba(2,5,12,0.94))]"
      />
      <div className="text-center opacity-80">
        <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#c8aa6e]">
          {marca}
        </span>
      </div>

      <div className="my-auto flex flex-col items-center text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.38em] text-[#cdbe91] drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] md:text-sm">
          {pretitulo}
        </p>
        <h1 className="max-w-5xl bg-gradient-to-b from-[#fffdf7] via-[#f0e6d2] to-[#c8aa6e] bg-clip-text font-serif text-4xl font-bold uppercase tracking-[0.14em] text-transparent drop-shadow-[0_10px_28px_rgba(0,0,0,0.95)] sm:text-6xl md:text-7xl">
          {titulo}
        </h1>
        <div className="mt-5 flex w-64 items-center justify-center md:w-96">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c8aa6e]/80 to-[#c8aa6e]" />
          <span className="mx-3 h-2.5 w-2.5 rotate-45 border border-[#c8aa6e] bg-[#091322] shadow-[0_0_10px_#c8aa6e]" />
          <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#c8aa6e]/80 to-[#c8aa6e]" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">{children}
        <button
          type="button"
          onClick={onIniciar}
          className="cursor-pointer rounded-lg border-2 border-[#c8aa6e] bg-[#0a111a]/95 px-10 py-4 text-sm font-bold uppercase tracking-[0.22em] text-[#f0e6d2] shadow-[0_0_35px_rgba(0,0,0,0.95)] transition-all duration-300 hover:bg-[#162231] hover:shadow-[0_0_30px_rgba(200,170,110,0.5)] active:scale-95 md:text-base"
        >
          {etiquetaBoton}
        </button>
      </div>
    </div>
  );
}
