"use client";

type ControlesCamaraProps = {
  onAcercar: () => void;
  onAlejar: () => void;
  onGirarIzquierda?: () => void;
  onGirarDerecha?: () => void;
  /** Solo en visores con perspectiva regulable (mapa 3D). */
  vista3D?: { activa: boolean; onAlternar: () => void };
  className?: string;
};

const BOTON_CUADRADO =
  "flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/90 p-3 text-2xl font-bold text-slate-100 shadow-xl transition hover:bg-slate-800";

/** Mando táctil de cámara: zoom, giro y perspectiva 3D/2D. */
export function ControlesCamara({
  onAcercar,
  onAlejar,
  onGirarIzquierda,
  onGirarDerecha,
  vista3D,
  className
}: ControlesCamaraProps) {
  const giro = Boolean(onGirarIzquierda && onGirarDerecha);

  return (
    <div className={className ?? "flex items-end gap-2"}>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          aria-label="Acercar"
          onClick={onAcercar}
          className={`${BOTON_CUADRADO} h-[3.25rem] w-[3.25rem]`}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Alejar"
          onClick={onAlejar}
          className={`${BOTON_CUADRADO} h-[3.25rem] w-[3.25rem]`}
        >
          {"−"}
        </button>
      </div>

      {(giro || vista3D) && (
        <div className="flex gap-2 rounded-2xl border border-slate-700 bg-slate-900/90 p-2 shadow-xl">
          {giro && (
            <button
              type="button"
              aria-label="Girar a la izquierda"
              onClick={onGirarIzquierda}
              className="rounded-xl bg-slate-800 px-3.5 py-3 text-xs font-bold text-amber-300 transition hover:bg-slate-700"
            >
              {"⟲"} Girar
            </button>
          )}

          {vista3D && (
            <button
              type="button"
              aria-pressed={vista3D.activa}
              onClick={vista3D.onAlternar}
              className="rounded-xl border border-amber-500/40 bg-amber-500/20 px-4 py-3 text-xs font-bold text-amber-300 transition hover:bg-amber-500/30"
            >
              {vista3D.activa ? "Vista 3D Activa" : "Vista 2D Plana"}
            </button>
          )}

          {giro && (
            <button
              type="button"
              aria-label="Girar a la derecha"
              onClick={onGirarDerecha}
              className="rounded-xl bg-slate-800 px-3.5 py-3 text-xs font-bold text-amber-300 transition hover:bg-slate-700"
            >
              Girar {"⟳"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
