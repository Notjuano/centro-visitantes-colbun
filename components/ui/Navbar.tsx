"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Droplets, LayoutDashboard, MessageSquareHeart, Waves } from "lucide-react";
import { cn } from "@/lib/utils";

const ENLACES = [
  { href: "/", etiqueta: "Inicio", icono: Waves },
  { href: "/catalogo", etiqueta: "Catálogo", icono: Droplets },
  { href: "/encuesta", etiqueta: "Encuesta", icono: MessageSquareHeart },
  { href: "/admin/dashboard", etiqueta: "Panel admin", icono: LayoutDashboard }
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-basalt-700/20 bg-basalt-950 text-mist-50">
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
      >
        <Link href="/" className="flex items-center gap-2 font-display text-lg tracking-tight">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center bg-cauce-500 text-basalt-950"
          >
            CV
          </span>
          Centro de Visitantes Colbún
        </Link>
        <ul className="flex items-center gap-1">
          {ENLACES.map(({ href, etiqueta, icono: Icono }) => {
            const activo = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={activo ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 border border-transparent px-3 py-2 text-sm transition-colors",
                    activo
                      ? "border-cauce-500 text-cauce-400"
                      : "text-mist-100 hover:border-basalt-700 hover:text-cauce-400"
                  )}
                >
                  <Icono className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{etiqueta}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
