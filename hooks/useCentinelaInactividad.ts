"use client";

import { useEffect } from "react";
import { INACTIVIDAD_MS } from "@/lib/territorio";

/**
 * CU-06 — Centinela (Watchdog) del tótem de sala.
 * Escucha toques/clics/teclado y, a los 3 minutos sin interacción,
 * dispara el restablecimiento panorámico de la vista.
 */
export function useCentinelaInactividad(alVencer: () => void, activo = true) {
  useEffect(() => {
    if (!activo) return;

    let temporizador: ReturnType<typeof setTimeout>;

    const reiniciarReloj = () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(alVencer, INACTIVIDAD_MS);
    };

    const eventos: (keyof WindowEventMap)[] = ["pointerdown", "touchstart", "keydown", "wheel"];
    eventos.forEach((evento) => window.addEventListener(evento, reiniciarReloj, { passive: true }));
    reiniciarReloj();

    return () => {
      clearTimeout(temporizador);
      eventos.forEach((evento) => window.removeEventListener(evento, reiniciarReloj));
    };
  }, [alVencer, activo]);
}
