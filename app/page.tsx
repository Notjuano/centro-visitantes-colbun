"use client";

import Link from "next/link";
import { useState } from "react";
import { MonitorSmartphone, Satellite, Smartphone, Waves } from "lucide-react";
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
          <div
            aria-hidden="true"
            className="aurora absolute inset-0 opacity-90"
            style={{
              backgroundImage:
                "radial-gradient(60% 60% at 18% 22%, rgba(31, 182, 166, 0.45) 0%, transparent 62%), radial-gradient(50% 50% at 86% 16%, rgba(242, 164, 100, 0.34) 0%, transparent 66%), radial-gradient(65% 65% at 62% 104%, rgba(43, 179, 230, 0.34) 0%, transparent 62%)"
            }}
          />
          <div
            aria-hidden="true"
            className="rejilla-territorio absolute inset-0 opacity-40 [mask-image:radial-gradient(circle_at_50%_38%,black,transparent_74%)]"
          />
          <div
            aria-hidden="true"
            className="animar-flotar absolute -left-12 top-24 h-44 w-44 rounded-full bg-cauce-500/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="animar-flotar absolute right-6 top-8 h-56 w-56 rounded-full bg-ember-500/20 blur-3xl [animation-delay:1.8s]"
          />

          <svg
            aria-hidden="true"
            viewBox="0 0 1200 200"
            className="absolute bottom-0 left-0 w-full text-basalt-900"
            preserveAspectRatio="none"
          >
            <path d="M0,120 C300,200 900,40 1200,120 L1200,200 L0,200 Z" fill="currentColor" />
          </svg>

          <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
            <p className="animar-aparecer flex items-center gap-2 text-sm uppercase tracking-wide text-cauce-400">
              <Waves className="h-4 w-4" aria-hidden="true" />
              Centro de Visitantes Colbún
            </p>
            <h1 className="animar-aparecer-lento mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
              Mapa vivo del Bío Bío, para explorar el territorio.
            </h1>
            <p className="animar-aparecer-lento mt-6 max-w-xl text-lg text-mist-200 [animation-delay:140ms]">
              Recorre el cauce en una mesa táctil o desde el celular: activa capas, abre puntos de
              interés, consulta datos del territorio y compara el paisaje en el tiempo.
            </p>
            <p className="animar-aparecer mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.16em] text-mist-100 backdrop-blur-md [animation-delay:260ms]">
              <Satellite className="h-3.5 w-3.5 text-cauce-400" aria-hidden="true" />
              Imagen satelital real sobre coordenadas del Bío Bío
            </p>
          </div>
        </section>

        <section className="mx-auto -mt-10 w-full max-w-6xl px-6 pb-20">
          <div className="border border-basalt-700/20 bg-white p-6 shadow-[0_24px_60px_rgba(15,35,42,0.12)] sm:p-10">
            <h2 className="font-display text-2xl text-basalt-900">Elige cómo quieres explorar</h2>
            <p className="mt-2 text-basalt-700">
              Selecciona el modo de visualización según el dispositivo desde el que accedes.
            </p>

            <div
              role="radiogroup"
              aria-label="Modo de visualización"
              className="mt-6 grid gap-4 sm:grid-cols-2"
            >
              <button
                type="button"
                role="radio"
                aria-checked={modo === "movil"}
                onClick={() => setModo("movil")}
                className={cn(
                  "group flex flex-col items-start gap-3 border p-6 text-left transition-all duration-300",
                  modo === "movil"
                    ? "border-cauce-500 bg-mist-100 shadow-[0_18px_40px_rgba(31,182,166,0.18)] -translate-y-0.5"
                    : "border-basalt-700/20 hover:-translate-y-0.5 hover:border-cauce-500/50"
                )}
              >
                <Smartphone
                  className="h-8 w-8 text-cauce-600 transition-transform duration-300 group-hover:scale-110"
                  aria-hidden="true"
                />
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
                  "group flex flex-col items-start gap-3 border p-6 text-left transition-all duration-300",
                  modo === "totem"
                    ? "border-cauce-500 bg-mist-100 shadow-[0_18px_40px_rgba(31,182,166,0.18)] -translate-y-0.5"
                    : "border-basalt-700/20 hover:-translate-y-0.5 hover:border-cauce-500/50"
                )}
              >
                <MonitorSmartphone
                  className="h-8 w-8 text-cauce-600 transition-transform duration-300 group-hover:scale-110"
                  aria-hidden="true"
                />
                <span className="font-display text-lg text-basalt-900">Modo Tótem</span>
                <span className="text-sm text-basalt-700">
                  Pantalla compartida del centro, con textos e imágenes de mayor tamaño.
                </span>
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/mapa?modo=${modo}`}
                className="inline-flex items-center justify-center bg-ember-500 px-8 py-3 font-medium text-basalt-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-ember-400"
              >
                Abrir mapa satelital
              </Link>
              <Link
                href={`/catalogo?modo=${modo}`}
                className="inline-flex items-center justify-center border border-basalt-700/20 px-8 py-3 font-medium text-basalt-900 transition-all duration-300 hover:-translate-y-0.5 hover:border-cauce-500"
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
