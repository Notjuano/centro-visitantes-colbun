"use client";

import { useRef, useState } from "react";
import { Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

type AudioPlayerProps = {
  src: string;
  titulo: string;
  duracion: string;
  transcripcion: string;
};

/**
 * Reproductor de audio descriptivo.
 * Cumple WCAG 2.1 (1.2.1 Audio y video solo grabado) al ofrecer
 * transcripción textual alternativa junto al control de reproducción.
 */
export function AudioPlayer({ src, titulo, duracion, transcripcion }: AudioPlayerProps) {
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
    <div className="border border-basalt-700/20 bg-white p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={alternarReproduccion}
          aria-pressed={reproduciendo}
          aria-label={reproduciendo ? `Pausar audio: ${titulo}` : `Reproducir audio descriptivo: ${titulo}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center bg-basalt-950 text-mist-50 transition-colors hover:bg-cauce-600"
        >
          {reproduciendo ? <Pause className="h-5 w-5" aria-hidden="true" /> : <Play className="h-5 w-5" aria-hidden="true" />}
        </button>

        <button
          type="button"
          onClick={reiniciar}
          aria-label="Reiniciar audio"
          className="flex h-9 w-9 shrink-0 items-center justify-center border border-basalt-700/30 text-basalt-700 transition-colors hover:border-cauce-500 hover:text-cauce-600"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-medium text-basalt-900">
            <Volume2 className="h-4 w-4 shrink-0 text-cauce-600" aria-hidden="true" />
            Audio descriptivo
          </p>
          <p className="truncate text-xs text-basalt-700">{titulo} · {duracion}</p>
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
        className="mt-3 text-sm font-medium text-cauce-600 underline decoration-dotted underline-offset-4 hover:text-cauce-500"
      >
        {mostrarTranscripcion ? "Ocultar transcripción" : "Ver transcripción de texto"}
      </button>

      {mostrarTranscripcion && (
        <p className={cn("mt-2 border-l-2 border-cauce-500 pl-3 text-sm text-basalt-700")}>
          {transcripcion}
        </p>
      )}
    </div>
  );
}
