"use client";

import { useState } from "react";
import { BarChart3, Clock, Pencil, Star, Trash2, Users } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { ESTACIONES, METRICAS_DEMO, type Station } from "@/lib/data";

const TARJETAS_METRICA = [
  { etiqueta: "Visitas totales", valor: METRICAS_DEMO.totalVisitas.toLocaleString("es-CL"), icono: Users },
  { etiqueta: "Visitas hoy", valor: METRICAS_DEMO.visitasHoy.toLocaleString("es-CL"), icono: BarChart3 },
  { etiqueta: "Satisfacción promedio", valor: `${METRICAS_DEMO.satisfaccionPromedio} / 5`, icono: Star },
  { etiqueta: "Tiempo promedio", valor: METRICAS_DEMO.tiempoPromedioRecorrido, icono: Clock }
];

export default function AdminDashboardPage() {
  const [estaciones, setEstaciones] = useState<Station[]>(ESTACIONES);

  const eliminarEstacion = (id: string) => {
    setEstaciones((prev) => prev.filter((estacion) => estacion.id !== id));
  };

  return (
    <div className="flex min-h-screen flex-col bg-mist-50">
      <Navbar />

      <main id="contenido-principal" className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-wide text-cauce-600">Panel administrativo</p>
          <h1 className="mt-1 font-display text-3xl text-basalt-900">Gestión del Centro de Visitantes</h1>
        </header>

        <section aria-label="Métricas consolidadas" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {TARJETAS_METRICA.map(({ etiqueta, valor, icono: Icono }) => (
            <div key={etiqueta} className="border border-basalt-700/20 bg-white p-5">
              <Icono className="h-5 w-5 text-cauce-600" aria-hidden="true" />
              <p className="mt-3 font-display text-2xl text-basalt-900">{valor}</p>
              <p className="text-sm text-basalt-700">{etiqueta}</p>
            </div>
          ))}
        </section>

        <section aria-label="Estación más visitada" className="mt-4 border border-cauce-500/40 bg-mist-100 p-4 text-sm text-basalt-800">
          Estación más visitada del mes: <strong>{METRICAS_DEMO.estacionMasVisitada}</strong>
        </section>

        <section aria-labelledby="titulo-gestion-estaciones" className="mt-10">
          <div className="flex items-center justify-between">
            <h2 id="titulo-gestion-estaciones" className="font-display text-2xl text-basalt-900">
              Estaciones educativas
            </h2>
            <button
              type="button"
              className="bg-basalt-950 px-4 py-2 text-sm font-medium text-mist-50 transition-colors hover:bg-basalt-900"
            >
              + Nueva estación
            </button>
          </div>

          <div className="mt-4 overflow-x-auto border border-basalt-700/20 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">Listado de estaciones educativas administrables</caption>
              <thead className="bg-basalt-950 text-mist-50">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">#</th>
                  <th scope="col" className="px-4 py-3 font-medium">Título</th>
                  <th scope="col" className="px-4 py-3 font-medium">Categoría</th>
                  <th scope="col" className="px-4 py-3 font-medium">Duración audio</th>
                  <th scope="col" className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estaciones.map((estacion) => (
                  <tr key={estacion.id} className="border-t border-basalt-700/10">
                    <td className="px-4 py-3 text-basalt-700">{String(estacion.numero).padStart(2, "0")}</td>
                    <td className="px-4 py-3 font-medium text-basalt-900">{estacion.titulo}</td>
                    <td className="px-4 py-3 capitalize text-basalt-700">{estacion.categoria}</td>
                    <td className="px-4 py-3 text-basalt-700">{estacion.duracionAudio}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          aria-label={`Editar estación ${estacion.titulo}`}
                          className="flex h-8 w-8 items-center justify-center border border-basalt-700/20 text-basalt-700 hover:border-cauce-500 hover:text-cauce-600"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminarEstacion(estacion.id)}
                          aria-label={`Eliminar estación ${estacion.titulo}`}
                          className="flex h-8 w-8 items-center justify-center border border-basalt-700/20 text-basalt-700 hover:border-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {estaciones.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-basalt-700">
                      No hay estaciones registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
