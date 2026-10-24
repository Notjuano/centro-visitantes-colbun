"use client";

import { useRef, useState } from "react";
import { Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

type AudioPlayerProps = {
  src: string;
  titulo: string;
  duracion: string;
  transcripcion: string;
  variante?: "claro" | "oscuro";
};

/**
 * Reproductor de audio descriptivo.
 * Cumple WCAG 2.1 (1.2.1 Audio y video solo grabado) al ofrecer
 * transcripción textual alternativa junto al control de reproducción.
 */
export function AudioPlayer({ src, titulo, duracion, transcripcion, variante = "claro" }: AudioPlayerProps) {
  const oscuro = variante === "oscuro";
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [mostrarTranscripcion, setMostrarTranscripcion] = useState(false);

  const alternarReproduccion = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (reproduciendo) {
      audio.pause();
    } else {
      audio.play().catch(() => {
        // Silencia errores de reproducción en entornos sin el archivo de audio real (demo).
      });
    }
    setReproduciendo(!reproduciendo);
  };

  const reiniciar = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setReproduciendo(false);
  };

  return (
    <div className={cn("p-4", oscuro ? "rounded-2xl border border-white/10 bg-white/5" : "border border-basalt-700/20 bg-white")}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={alternarReproduccion}
          aria-pressed={reproduciendo}
          aria-label={reproduciendo ? `Pausar audio: ${titulo}` : `Reproducir audio descriptivo: ${titulo}`}
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center transition-colors",
            oscuro
              ? "rounded-full bg-cauce-500 text-basalt-950 hover:bg-cauce-400"
              : "bg-basalt-950 text-mist-50 hover:bg-cauce-600"
          )}
        >
          {reproduciendo ? <Pause className="h-5 w-5" aria-hidden="true" /> : <Play className="h-5 w-5" aria-hidden="true" />}
        </button>

        <button
          type="button"
          onClick={reiniciar}
          aria-label="Reiniciar audio"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center transition-colors",
            oscuro
              ? "rounded-full border border-white/20 text-white/80 hover:border-cauce-400 hover:text-cauce-400"
              : "border border-basalt-700/30 text-basalt-700 hover:border-cauce-500 hover:text-cauce-600"
          )}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <p className={cn("flex items-center gap-2 text-sm font-medium", oscuro ? "text-white" : "text-basalt-900")}>
            <Volume2 className="h-4 w-4 shrink-0 text-cauce-600" aria-hidden="true" />
            Audio descriptivo
          </p>
          <p className={cn("truncate text-xs", oscuro ? "text-white/70" : "text-basalt-700")}>{titulo} · {duracion}</p>
        </div>
      </div>

      {/* Elemento audio nativo oculto: expone controles del sistema operativo y subtítulos si existieran */}
      <audio
        ref={audioRef}
        src={src}
        onEnded={() => setReproduciendo(false)}
        onPause={() => setReproduciendo(false)}
        onPlay={() => setReproduciendo(true)}
        className="mt-3 w-full"
        controls
        preload="none"
      >
        Tu navegador no soporta la reproducción de audio. Puedes leer la transcripción a continuación.
      </audio>

      <button
        type="button"
        onClick={() => setMostrarTranscripcion((prev) => !prev)}
        aria-expanded={mostrarTranscripcion}
        className={cn(
          "mt-3 text-sm font-medium underline decoration-dotted underline-offset-4",
          oscuro ? "text-cauce-400 hover:text-cauce-300" : "text-cauce-600 hover:text-cauce-500"
        )}
      >
        {mostrarTranscripcion ? "Ocultar transcripción" : "Ver transcripción de texto"}
      </button>

      {mostrarTranscripcion && (
        <p className={cn("mt-2 border-l-2 border-cauce-500 pl-3 text-sm", oscuro ? "text-white/75" : "text-basalt-700")}>
          {transcripcion}
        </p>
      )}
    </div>
  );
}
