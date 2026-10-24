"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ScanLine } from "lucide-react";
import { VisorModeloAR } from "@/components/ar/VisorModeloAR";
import type { RecursoAR } from "@/lib/ar";
import { cn } from "@/lib/utils";

type TarjetaModeloARProps = {
  recurso: RecursoAR;
  compacta?: boolean;
  oscura?: boolean;
};

export function useUrlAR(ruta: string) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_AR_BASE_URL?.replace(/\/$/, "") || window.location.origin;
    setUrl(`${base}${ruta}`);
  }, [ruta]);

  return url;
}

export function TarjetaModeloAR({ recurso, compacta = false, oscura = false }: TarjetaModeloARProps) {
  const url = useUrlAR(recurso.ruta);

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        compacta ? "min-w-[9.5rem]" : "w-full border border-basalt-700/20 bg-white p-3",
        oscura && !compacta && "border-white/10 bg-white/5"
      )}
    >
      <div
        className={cn(
          "overflow-hidden",
          compacta ? "h-16 w-16" : "h-28 w-28",
          oscura ? "bg-black/40" : "bg-mist-100"
        )}
      >
        <VisorModeloAR
          src={recurso.modeloUrl}
          poster={recurso.posterUrl}
          alt={`Modelo 3D de ${recurso.titulo}`}
          className="h-full w-full"
        />
      </div>

      <div className={cn("flex flex-col items-center gap-1", compacta ? "w-[4.25rem]" : "w-24")}>
        {url ? (
          <QRCodeSVG
            value={url}
            size={compacta ? 64 : 88}
            bgColor={oscura ? "#0B1A1F" : "#F4F7F6"}
            fgColor={oscura ? "#F4F7F6" : "#0F232A"}
            title={`Código QR para ver ${recurso.titulo} en realidad aumentada`}
          />
        ) : (
          <div className={cn(compacta ? "h-16 w-16" : "h-[88px] w-[88px]", "bg-mist-100")} />
        )}
        <p
          className={cn(
            "flex items-center gap-1 text-center leading-tight",
            compacta ? "text-[9px]" : "text-[11px]",
            oscura ? "text-white/70" : "text-basalt-700"
          )}
        >
          <ScanLine className="h-3 w-3 shrink-0" aria-hidden="true" />
          Escanea en el celular
        </p>
        {!compacta ? (
          <Link
            href={recurso.ruta}
            className={cn(
              "text-[11px] font-medium underline decoration-dotted underline-offset-2",
              oscura ? "text-cauce-400" : "text-cauce-600"
            )}
          >
            Abrir experiencia AR
          </Link>
        ) : null}
      </div>
    </div>
  );
}
