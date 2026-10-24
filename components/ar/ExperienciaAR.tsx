"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Box, ScanLine } from "lucide-react";
import { useUrlAR } from "@/components/ar/TarjetaModeloAR";
import { VisorModeloAR } from "@/components/ar/VisorModeloAR";
import type { RecursoAR } from "@/lib/ar";

export function ExperienciaAR({ recurso }: { recurso: RecursoAR }) {
  const url = useUrlAR(recurso.ruta);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-basalt-950 text-mist-50">
      <header className="flex items-center justify-between px-4 py-3">
        <Link href="/catalogo" className="inline-flex items-center gap-2 text-sm text-mist-200 hover:text-cauce-400">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver
        </Link>
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-cauce-400">
          <Box className="h-4 w-4" aria-hidden="true" />
          Realidad aumentada
        </p>
      </header>

      <main id="contenido-principal" className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pb-8">
        <h1 className="font-display text-2xl">{recurso.titulo}</h1>
        <p className="mt-2 text-sm text-mist-200">
          Gira el modelo y pulsa el ícono de AR para colocarlo en tu espacio. En Android se abre Scene
          Viewer; en iPhone usa Quick Look cuando el dispositivo lo permite.
        </p>

        <div className="mt-4 h-[min(62vh,420px)] overflow-hidden border border-white/10 bg-black/30">
          <VisorModeloAR
            src={recurso.modeloUrl}
            poster={recurso.posterUrl}
            alt={`Modelo 3D de ${recurso.titulo}`}
            className="h-full w-full"
          />
        </div>

        <section className="mt-6 flex items-center gap-4 border border-white/10 bg-white/5 p-4">
          {url ? (
            <QRCodeSVG
              value={url}
              size={108}
              bgColor="#F4F7F6"
              fgColor="#0F232A"
              title="Código QR de esta experiencia AR"
            />
          ) : null}
          <div>
            <p className="flex items-center gap-2 text-sm font-medium">
              <ScanLine className="h-4 w-4 text-cauce-400" aria-hidden="true" />
              Comparte este modelo
            </p>
            <p className="mt-1 text-xs text-mist-200">
              Otro celular puede escanear este código para abrir la misma experiencia. El teléfono y el
              tótem deben estar en la misma red si usas una IP local.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
