"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type FeedbackFormValues = {
  calificacion: number;
  aspectoDestacado: string;
  comentario: string;
  recomendaria: "si" | "no" | null;
};

const ASPECTOS = [
  "Estaciones educativas",
  "Accesibilidad y audio",
  "Atención del equipo",
  "Infraestructura del centro"
];

const VALOR_INICIAL: FeedbackFormValues = {
  calificacion: 0,
  aspectoDestacado: "",
  comentario: "",
  recomendaria: null
};

/**
 * Encuesta de satisfacción de llenado rápido (< 60s):
 * 1 escala de calificación + 1 selección única + 1 campo opcional de texto.
 */
export function FeedbackForm() {
  const [valores, setValores] = useState<FeedbackFormValues>(VALOR_INICIAL);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const manejarEnvio = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    if (valores.calificacion === 0) {
      setError("Selecciona una calificación para continuar.");
      return;
    }

    setError(null);
    // Punto de integración: enviar `valores` a la API / CMS del centro de visitantes.
    console.info("Encuesta enviada:", valores);
    setEnviado(true);
  };

  if (enviado) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 border border-cauce-500 bg-white p-8 text-center"
      >
        <CheckCircle2 className="h-10 w-10 text-cauce-600" aria-hidden="true" />
        <h2 className="font-display text-xl text-basalt-900">¡Gracias por tu visita!</h2>
        <p className="text-basalt-700">Tu opinión nos ayuda a mejorar la experiencia del Centro de Visitantes Colbún.</p>
      </div>
    );
  }

  return (
    <form onSubmit={manejarEnvio} noValidate className="space-y-8 border border-basalt-700/20 bg-white p-6 sm:p-8">
      <fieldset>
        <legend className="font-display text-lg text-basalt-900">
          ¿Cómo calificarías tu visita?
        </legend>
        <div role="radiogroup" aria-label="Calificación de 1 a 5 estrellas" className="mt-3 flex gap-2">
          {[1, 2, 3, 4, 5].map((valor) => (
            <button
              key={valor}
              type="button"
              role="radio"
              aria-checked={valores.calificacion === valor}
              aria-label={`${valor} de 5 estrellas`}
              onClick={() => setValores((prev) => ({ ...prev, calificacion: valor }))}
              className="p-1"
            >
              <Star
                className={cn(
                  "h-8 w-8 transition-colors",
                  valor <= valores.calificacion
                    ? "fill-ember-500 text-ember-500"
                    : "fill-transparent text-basalt-700/30"
                )}
              />
            </button>
          ))}
        </div>
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </fieldset>

      <fieldset>
        <legend className="font-display text-lg text-basalt-900">
          ¿Qué destacarías de tu experiencia?
        </legend>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ASPECTOS.map((aspecto) => (
            <label
              key={aspecto}
              className={cn(
                "flex cursor-pointer items-center gap-2 border p-3 text-sm transition-colors",
                valores.aspectoDestacado === aspecto
                  ? "border-cauce-500 bg-mist-100"
                  : "border-basalt-700/20 hover:border-cauce-500/50"
              )}
            >
              <input
                type="radio"
                name="aspectoDestacado"
                value={aspecto}
                checked={valores.aspectoDestacado === aspecto}
                onChange={() => setValores((prev) => ({ ...prev, aspectoDestacado: aspecto }))}
                className="h-4 w-4 accent-cauce-600"
              />
              {aspecto}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-display text-lg text-basalt-900">
          ¿Recomendarías esta visita?
        </legend>
        <div className="mt-3 flex gap-3">
          {(["si", "no"] as const).map((opcion) => (
            <button
              key={opcion}
              type="button"
              aria-pressed={valores.recomendaria === opcion}
              onClick={() => setValores((prev) => ({ ...prev, recomendaria: opcion }))}
              className={cn(
                "flex-1 border px-4 py-2 text-sm font-medium capitalize transition-colors",
                valores.recomendaria === opcion
                  ? "border-cauce-500 bg-basalt-950 text-mist-50"
                  : "border-basalt-700/20 text-basalt-900 hover:border-cauce-500/50"
              )}
            >
              {opcion === "si" ? "Sí" : "No"}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="comentario" className="font-display text-lg text-basalt-900">
          Comentario (opcional)
        </label>
        <textarea
          id="comentario"
          name="comentario"
          rows={3}
          maxLength={280}
          value={valores.comentario}
          onChange={(evento) => setValores((prev) => ({ ...prev, comentario: evento.target.value }))}
          className="mt-3 w-full border border-basalt-700/20 p-3 text-sm focus:border-cauce-500"
          placeholder="Cuéntanos algo más sobre tu visita..."
        />
      </div>

      <button
        type="submit"
        className="w-full bg-cauce-600 px-6 py-3 font-medium text-mist-50 transition-colors hover:bg-cauce-500"
      >
        Enviar encuesta
      </button>
    </form>
  );
}
