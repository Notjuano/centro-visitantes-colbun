"use client";

import { ScanLine } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useUrlAR } from "@/components/ar/TarjetaModeloAR";
import { cn } from "@/lib/utils";

type QrSalaProps = {
  /** Ruta interna destino, por ejemplo `/mapa`. */
  ruta: string;
  rotulo: string;
  detalle?: string;
  /** Desplaza la tarjeta cuando la ficha lateral ocupa la esquina derecha. */
  apartado?: boolean;
  /** `esquina` para el HUD del visor, `flujo` para insertarla en otra pieza. */
  ubicacion?: "esquina" | "flujo";
  onClick?: () => void;
};

/**
 * QR de sala: pasa el recorrido del tótem al celular del visitante.
 * La URL se resuelve en cliente para respetar NEXT_PUBLIC_AR_BASE_URL en LAN.
 */
export function QrSala({
  ruta,
  rotulo,
  detalle = "Escanea con la cámara",
  apartado = false,
  ubicacion = "esquina",
  onClick
}: QrSalaProps) {
  const url = useUrlAR(ruta);
  if (!url) return null;

  const contenido = (
    <>
      <span className="flex rounded-lg bg-white p-1.5 shadow-lg">
        <QRCodeSVG value={url} size={64} level="M" bgColor="#ffffff" fgColor="#0f172a" />
      </span>
      <span className="flex flex-col items-start leading-tight">
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300">
          <ScanLine className="h-3 w-3" aria-hidden="true" />
          {rotulo}
        </span>
        <span className="text-[10px] text-slate-400">{detalle}</span>
      </span>
    </>
  );

  const clases = cn(
    "flex items-center gap-2.5 rounded-2xl border border-amber-500/30 bg-slate-900/90 p-2.5 shadow-2xl backdrop-blur-md",
    ubicacion === "esquina" &&
      cn(
        "animar-aparecer bottom-6 right-6 z-10 hidden lg:flex",
        // El QR es el puente tótem-celular: en un teléfono ya se está sobre el destino.
        apartado && "lg:right-[26rem]"
      )
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`${rotulo}: abre ${url}`}
        className={cn(clases, "cursor-pointer transition hover:border-amber-500/60", ubicacion === "esquina" && "absolute")}
      >
        {contenido}
      </button>
    );
  }

  return (
    <div
      className={cn(clases, ubicacion === "esquina" && "absolute")}
      title={url}
      aria-label={`${rotulo}: ${url}`}
    >
      {contenido}
    </div>
  );
}
