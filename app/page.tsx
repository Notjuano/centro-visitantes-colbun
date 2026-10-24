"use client";

import Link from "next/link";
import { useState } from "react";
import { MonitorSmartphone, Smartphone, Waves } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { cn } from "@/lib/utils";

type Modo = "movil" | "totem";

export default function InicioPage() {
  const [modo, setModo] = useState<Modo>("movil");

  return (
    <div className="flex min-h-screen flex-col bg-mist-50">
      <Navbar />

      <main id="contenido-principal" className="flex flex-1 flex-col">
        <section className="relative overflow-hidden bg-basalt-950 text-mist-50">
          <svg
            aria-hidden="true"
            viewBox="0 0 1200 200"
            className="absolute bottom-0 left-0 w-full text-basalt-900"
            preserveAspectRatio="none"
          >
            <path
              d="M0,120 C300,200 900,40 1200,120 L1200,200 L0,200 Z"
              fill="currentColor"
            />
          </svg>

          <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
            <p className="flex items-center gap-2 text-sm uppercase tracking-wide text-cauce-400">
              <Waves className="h-4 w-4" aria-hidden="true" />
              Centro de Visitantes Colbún
            </p>
            <h1 className="mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
              Mapa vivo del Bío Bío, para explorar el territorio.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-mist-200">
              Recorre el cauce en una mesa táctil o desde el celular: activa capas, abre puntos de
              interés, consulta datos del territorio y compara el paisaje en el tiempo.
            </p>
          </div>
        </section>

        <section className="mx-auto -mt-10 w-full max-w-6xl px-6 pb-20">
          <div className="border border-basalt-700/20 bg-white p-6 sm:p-10">
            <h2 className="font-display text-2xl text-basalt-900">Elige cómo quieres explorar</h2>
            <p className="mt-2 text-basalt-700">
              Selecciona el modo de visualización según el dispositivo desde el que accedes.
            </p>

            <div role="radiogroup" aria-label="Modo de visualización" className="mt-6 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                role="radio"
                aria-checked={modo === "movil"}
                onClick={() => setModo("movil")}
                className={cn(
                  "flex flex-col items-start gap-3 border p-6 text-left transition-colors",
                  modo === "movil"
                    ? "border-cauce-500 bg-mist-100"
                    : "border-basalt-700/20 hover:border-cauce-500/50"
                )}
              >
                <Smartphone className="h-8 w-8 text-cauce-600" aria-hidden="true" />
                <span className="font-display text-lg text-basalt-900">Modo Móvil</span>
                <span className="text-sm text-basalt-700">
                  Recorrido personal desde tu celular, con audio y navegación por estaciones.
                </span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={modo === "totem"}
                onClick={() => setModo("totem")}
                className={cn(
                  "flex flex-col items-start gap-3 border p-6 text-left transition-colors",
                  modo === "totem"
                    ? "border-cauce-500 bg-mist-100"
                    : "border-basalt-700/20 hover:border-cauce-500/50"
                )}
              >
                <MonitorSmartphone className="h-8 w-8 text-cauce-600" aria-hidden="true" />
                <span className="font-display text-lg text-basalt-900">Modo Tótem</span>
                <span className="text-sm text-basalt-700">
                  Pantalla compartida del centro, con textos e imágenes de mayor tamaño.
                </span>
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/mapa?modo=${modo}`}
                className="inline-flex items-center justify-center bg-ember-500 px-8 py-3 font-medium text-basalt-950 transition-colors hover:bg-ember-400"
              >
                Abrir mapa interactivo
              </Link>
              <Link
                href={`/catalogo?modo=${modo}`}
                className="inline-flex items-center justify-center border border-basalt-700/20 px-8 py-3 font-medium text-basalt-900 transition-colors hover:border-cauce-500"
              >
                Ver catálogo
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
