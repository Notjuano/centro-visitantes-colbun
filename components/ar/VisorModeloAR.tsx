"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type VisorModeloARProps = {
  src: string;
  poster?: string;
  alt: string;
  className?: string;
  ar?: boolean;
};

/**
 * CU-02 — Mobile WebXR Client.
 * Intenta WebXR / Scene Viewer / Quick Look; si no hay AR, queda el visor orbital 360°.
 */
export function VisorModeloAR({ src, poster, alt, className, ar = true }: VisorModeloARProps) {
  const [listo, setListo] = useState(false);

  useEffect(() => {
    let cancelado = false;
    import("@google/model-viewer").then(() => {
      if (!cancelado) setListo(true);
    });
    return () => {
      cancelado = true;
    };
  }, []);

  if (!listo) {
    return (
      <div
        className={cn("flex items-center justify-center bg-basalt-950/80 text-xs text-mist-100", className)}
        aria-hidden="true"
      >
        Cargando 3D…
      </div>
    );
  }

  return (
    <model-viewer
      src={src}
      poster={poster}
      alt={alt}
      ar={ar || undefined}
      ar-modes="webxr scene-viewer quick-look"
      ar-scale="auto"
      camera-controls
      auto-rotate
      shadow-intensity="1"
      touch-action="pan-y"
      className={cn("visor-modelo-ar", className)}
    />
  );
}
