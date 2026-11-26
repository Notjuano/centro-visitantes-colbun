"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Box,
  Compass,
  ExternalLink,
  Layers,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import type { CategoriaHito, HitoFeature } from "@/data/hitosAngostura";
import {
  CATEGORIA_CONFIG,
  guardarHitos,
  obtenerHitos,
  restaurarHitosOriginales,
} from "@/lib/hitosStore";

type SectorHito = "Santa Bárbara" | "Quilaco" | "Confluencia Biobío";

interface FormularioHitoState {
  id_hito: string;
  titulo: string;
  sector: SectorHito;
  categoria: CategoriaHito;
  color_hex: string;
  icono: string;
  descripcion_corta: string;
  contenido_didactico: string;
  horario_acceso: string;
  modelo_3d: string;
  longitud: string;
  latitud: string;
}

const FORMULARIO_INICIAL: FormularioHitoState = {
  id_hito: "",
  titulo: "",
  sector: "Quilaco",
  categoria: "Turística",
  color_hex: CATEGORIA_CONFIG["Turística"].color_hex,
  icono: "📍",
  descripcion_corta: "",
  contenido_didactico: "",
  horario_acceso: "Martes a Domingo • 09:30 a 18:00 hrs",
  modelo_3d: "",
  longitud: "-71.9720",
  latitud: "-37.7580",
};

export default function AdminDashboardPage() {
  const [hitos, setHitos] = useState<HitoFeature[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaHito | "Todas">("Todas");
  const [filtroSector, setFiltroSector] = useState<SectorHito | "Todos">("Todos");

  // Estado del modal de creación / edición
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [form, setForm] = useState<FormularioHitoState>(FORMULARIO_INICIAL);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [mensajeToast, setMensajeToast] = useState<string | null>(null);

  useEffect(() => {
    setHitos(obtenerHitos());
  }, []);

  const mostrarNotificacion = (texto: string) => {
    setMensajeToast(texto);
    setTimeout(() => setMensajeToast(null), 3500);
  };

  // Métricas calculadas en tiempo real
  const metricas = useMemo(() => {
    const total = hitos.length;
    const conModelo3D = hitos.filter((h) => Boolean(h.properties.modelo_3d)).length;
    const porSector = {
      "Santa Bárbara": hitos.filter((h) => h.properties.sector === "Santa Bárbara").length,
      Quilaco: hitos.filter((h) => h.properties.sector === "Quilaco").length,
      "Confluencia Biobío": hitos.filter((h) => h.properties.sector === "Confluencia Biobío").length,
    };
    return { total, conModelo3D, porSector };
  }, [hitos]);

  // Filtrado de la tabla
  const hitosFiltrados = useMemo(() => {
    return hitos.filter((h) => {
      const p = h.properties;
      const coincideTexto =
        p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.id_hito.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion_corta.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCat = filtroCategoria === "Todas" || p.categoria === filtroCategoria;
      const coincideSec = filtroSector === "Todos" || p.sector === filtroSector;
      return coincideTexto && coincideCat && coincideSec;
    });
  }, [hitos, busqueda, filtroCategoria, filtroSector]);

  const abrirModalCrear = () => {
    const siguienteNumero = String(hitos.length + 1).padStart(2, "0");
    setForm({
      ...FORMULARIO_INICIAL,
      id_hito: `hito-${siguienteNumero}`,
    });
    setModoEdicion(false);
    setErrorForm(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (feature: HitoFeature) => {
    const p = feature.properties;
    setForm({
      id_hito: p.id_hito,
      titulo: p.titulo,
      sector: p.sector,
      categoria: p.categoria,
      color_hex: p.color_hex,
      icono: p.icono,
      descripcion_corta: p.descripcion_corta,
      contenido_didactico: p.contenido_didactico,
      horario_acceso: p.horario_acceso,
      modelo_3d: p.modelo_3d || "",
      longitud: String(feature.geometry.coordinates[0]),
      latitud: String(feature.geometry.coordinates[1]),
    });
    setModoEdicion(true);
    setErrorForm(null);
    setModalAbierto(true);
  };

  const handleCategoriaChange = (nuevaCat: CategoriaHito) => {
    setForm((prev) => ({
      ...prev,
      categoria: nuevaCat,
      color_hex: CATEGORIA_CONFIG[nuevaCat].color_hex,
      icono: modoEdicion ? prev.icono : CATEGORIA_CONFIG[nuevaCat].iconoDefault,
    }));
  };

  const handleGuardarHito = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm(null);

    const lon = parseFloat(form.longitud);
    const lat = parseFloat(form.latitud);

    if (!form.titulo.trim() || !form.descripcion_corta.trim() || !form.contenido_didactico.trim()) {
      setErrorForm("Completa el título, la descripción corta y el contenido didáctico.");
      return;
    }

    if (Number.isNaN(lon) || Number.isNaN(lat)) {
      setErrorForm("Las coordenadas deben ser números válidos (ej: -71.9720 y -37.7580).");
      return;
    }

    if (lon < -72.01 || lon > -71.94 || lat < -37.78 || lat > -37.73) {
      setErrorForm(
        "Coordenadas fuera del cuadrante visible del Parque Angostura (Lon: -72.00 a -71.95 | Lat: -37.772 a -37.740)."
      );
      return;
    }

    const nuevoFeature: HitoFeature = {
      type: "Feature",
      properties: {
        id_hito: form.id_hito.trim() || `hito-${Date.now()}`,
        titulo: form.titulo.trim(),
        sector: form.sector,
        categoria: form.categoria,
        color_hex: form.color_hex,
        icono: form.icono.trim() || "📍",
        descripcion_corta: form.descripcion_corta.trim(),
        contenido_didactico: form.contenido_didactico.trim(),
        horario_acceso: form.horario_acceso.trim() || "Acceso Libre",
        ...(form.modelo_3d.trim() ? { modelo_3d: form.modelo_3d.trim() } : {}),
      },
      geometry: {
        type: "Point",
        coordinates: [lon, lat],
      },
    };

    let listaActualizada: HitoFeature[];
    if (modoEdicion) {
      listaActualizada = hitos.map((h) =>
        h.properties.id_hito === nuevoFeature.properties.id_hito ? nuevoFeature : h
      );
      mostrarNotificacion(`Hito "${nuevoFeature.properties.titulo}" actualizado.`);
    } else {
      const existeId = hitos.some((h) => h.properties.id_hito === nuevoFeature.properties.id_hito);
      if (existeId) {
        setErrorForm(`Ya existe un hito con el ID "${nuevoFeature.properties.id_hito}". Cámbialo.`);
        return;
      }
      listaActualizada = [...hitos, nuevoFeature];
      mostrarNotificacion(`Hito "${nuevoFeature.properties.titulo}" creado y sincronizado con el mapa.`);
    }

    setHitos(listaActualizada);
    guardarHitos(listaActualizada);
    setModalAbierto(false);
  };

  const handleEliminar = (id: string, titulo: string) => {
    const confirmacion = window.confirm(`¿Seguro que deseas eliminar el hito "${titulo}"?`);
    if (!confirmacion) return;

    const listaActualizada = hitos.filter((h) => h.properties.id_hito !== id);
    setHitos(listaActualizada);
    guardarHitos(listaActualizada);
    mostrarNotificacion(`Hito "${titulo}" eliminado.`);
  };

  const handleRestaurar = () => {
    const confirmacion = window.confirm(
      "¿Restaurar los 12 hitos originales del Parque Angostura? Se perderán los cambios locales."
    );
    if (!confirmacion) return;

    const originales = restaurarHitosOriginales();
    setHitos(originales);
    mostrarNotificacion("Se restauraron los 12 hitos originales.");
  };

  return (
    <div className="min-h-screen bg-[#090e16] text-slate-100 font-sans">
      {/* Barra superior */}
      <header className="border-b border-[#c8aa6e]/30 bg-[#0a111a]/95 sticky top-0 z-20 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c8aa6e]">
              Colbún S.A. • Backoffice Territorial
            </p>
            <h1 className="font-serif text-xl md:text-2xl font-bold text-[#f0e6d2]">
              Gestión de Hitos — Parque Angostura
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRestaurar}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:border-[#c8aa6e]/50 hover:text-white transition cursor-pointer"
              title="Volver a los 12 hitos base"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restaurar Base
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-[#c8aa6e] bg-[#c8aa6e]/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#f0e6d2] hover:bg-[#c8aa6e] hover:text-[#090e16] transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver Mapa 3D
            </Link>
          </div>
        </div>
      </header>

      {/* Notificación flotante */}
      {mensajeToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-[#c8aa6e] bg-[#0a111a] px-5 py-3 text-sm font-medium text-[#f0e6d2] shadow-2xl">
          ✓ {mensajeToast}
        </div>
      )}

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Tarjetas KPI */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[#c8aa6e]/25 bg-[#0f1724] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400">Hitos Activos</span>
              <MapPin className="h-5 w-5 text-[#c8aa6e]" />
            </div>
            <p className="mt-3 font-serif text-3xl font-bold text-white">{metricas.total}</p>
            <p className="mt-1 text-xs text-slate-400">Puntos geolocalizados en mapa</p>
          </div>

          <div className="rounded-xl border border-[#c8aa6e]/25 bg-[#0f1724] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400">Con Modelo 3D / AR</span>
              <Box className="h-5 w-5 text-sky-400" />
            </div>
            <p className="mt-3 font-serif text-3xl font-bold text-white">{metricas.conModelo3D}</p>
            <p className="mt-1 text-xs text-slate-400">Archivos .glb vinculados</p>
          </div>

          <div className="rounded-xl border border-[#c8aa6e]/25 bg-[#0f1724] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400">Sector Santa Bárbara</span>
              <Compass className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="mt-3 font-serif text-3xl font-bold text-white">
              {metricas.porSector["Santa Bárbara"]}
            </p>
            <p className="mt-1 text-xs text-slate-400">Ribera oeste y península</p>
          </div>

          <div className="rounded-xl border border-[#c8aa6e]/25 bg-[#0f1724] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400">Quilaco / Confluencia</span>
              <Layers className="h-5 w-5 text-amber-400" />
            </div>
            <p className="mt-3 font-serif text-3xl font-bold text-white">
              {metricas.porSector.Quilaco + metricas.porSector["Confluencia Biobío"]}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {metricas.porSector.Quilaco} Quilaco • {metricas.porSector["Confluencia Biobío"]} Confluencia
            </p>
          </div>
        </section>

        {/* Barra de acciones y filtros */}
        <section className="mt-8 flex flex-col gap-4 rounded-xl border border-slate-800 bg-[#0f1724] p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar hito por nombre, ID o descripción..."
                className="w-full rounded-lg border border-slate-700 bg-[#090e16] py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:border-[#c8aa6e] focus:outline-none"
              />
            </div>

            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value as CategoriaHito | "Todas")}
              className="rounded-lg border border-slate-700 bg-[#090e16] px-3 py-2 text-sm text-slate-200 focus:border-[#c8aa6e] focus:outline-none"
            >
              <option value="Todas">Todas las categorías</option>
              <option value="Energética">⚡ Energética</option>
              <option value="Turística">🏛️ Turística</option>
              <option value="Ecológica">🌿 Ecológica</option>
              <option value="Histórica">⛩️ Histórica</option>
            </select>

            <select
              value={filtroSector}
              onChange={(e) => setFiltroSector(e.target.value as SectorHito | "Todos")}
              className="rounded-lg border border-slate-700 bg-[#090e16] px-3 py-2 text-sm text-slate-200 focus:border-[#c8aa6e] focus:outline-none"
            >
              <option value="Todos">Todos los sectores</option>
              <option value="Santa Bárbara">Santa Bárbara</option>
              <option value="Quilaco">Quilaco</option>
              <option value="Confluencia Biobío">Confluencia Biobío</option>
            </select>
          </div>

          <button
            type="button"
            onClick={abrirModalCrear}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#c8aa6e] px-5 py-2.5 text-sm font-bold text-[#090e16] hover:bg-[#d8bc82] transition cursor-pointer shadow-lg"
          >
            <Plus className="h-4 w-4" />
            Nuevo Hito Territorial
          </button>
        </section>

        {/* Tabla de Hitos */}
        <section className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-[#0f1724] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-slate-800 bg-[#0a111a] text-xs uppercase tracking-wider text-[#c8aa6e]">
                <tr>
                  <th className="px-4 py-3.5">ID</th>
                  <th className="px-4 py-3.5">Hito</th>
                  <th className="px-4 py-3.5">Categoría</th>
                  <th className="px-4 py-3.5">Sector</th>
                  <th className="px-4 py-3.5">Coordenadas (Lon, Lat)</th>
                  <th className="px-4 py-3.5">3D / AR</th>
                  <th className="px-4 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {hitosFiltrados.map((feature) => {
                  const p = feature.properties;
                  const [lon, lat] = feature.geometry.coordinates;
                  return (
                    <tr key={p.id_hito} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-400">{p.id_hito}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-base"
                            style={{
                              borderColor: p.color_hex,
                              backgroundColor: `${p.color_hex}22`,
                            }}
                          >
                            {p.icono}
                          </span>
                          <div>
                            <p className="font-semibold text-white">{p.titulo}</p>
                            <p className="line-clamp-1 text-xs text-slate-400">
                              {p.descripcion_corta}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                          style={{ backgroundColor: p.color_hex }}
                        >
                          {p.categoria}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">{p.sector}</td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-400">
                        {lon.toFixed(4)}, {lat.toFixed(4)}
                      </td>
                      <td className="px-4 py-3.5">
                        {p.modelo_3d ? (
                          <span className="inline-flex items-center gap-1 rounded bg-sky-500/15 px-2 py-0.5 text-xs font-medium text-sky-400 border border-sky-500/30">
                            <Box className="h-3 w-3" /> .GLB
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => abrirModalEditar(feature)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:border-[#c8aa6e] hover:text-[#c8aa6e] transition cursor-pointer"
                            title="Editar hito"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEliminar(p.id_hito, p.titulo)}
                            className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-slate-400 hover:border-red-500 hover:text-red-400 transition cursor-pointer"
                            title="Eliminar hito"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {hitosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                      No se encontraron hitos con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Modal Formulario Crear / Editar */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#c8aa6e]/50 bg-[#0a111a] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#c8aa6e]">
                  {modoEdicion ? "Modificar Punto Existente" : "Alta de Nuevo Punto"}
                </p>
                <h2 className="font-serif text-xl font-bold text-white">
                  {modoEdicion ? `Editar: ${form.titulo}` : "Crear Hito en Parque Angostura"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarHito} className="mt-5 space-y-4">
              {errorForm && (
                <div className="rounded-lg border border-red-500/50 bg-red-950/50 px-4 py-2.5 text-xs text-red-200">
                  {errorForm}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ID del Hito
                  </label>
                  <input
                    type="text"
                    value={form.id_hito}
                    disabled={modoEdicion}
                    onChange={(e) => setForm({ ...form, id_hito: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-[#090e16] px-3 py-2 text-sm text-white disabled:opacity-50"
                    placeholder="hito-13"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={form.categoria}
                    onChange={(e) => handleCategoriaChange(e.target.value as CategoriaHito)}
                    className="w-full rounded-lg border border-slate-700 bg-[#090e16] px-3 py-2 text-sm text-white"
                  >
                    <option value="Energética">Energética</option>
                    <option value="Turística">Turística</option>
                    <option value="Ecológica">Ecológica</option>
                    <option value="Histórica">Histórica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sector Territorial
                  </label>
                  <select
                    value={form.sector}
                    onChange={(e) => setForm({ ...form, sector: e.target.value as SectorHito })}
                    className="w-full rounded-lg border border-slate-700 bg-[#090e16] px-3 py-2 text-sm text-white"
                  >
                    <option value="Santa Bárbara">Santa Bárbara</option>
                    <option value="Quilaco">Quilaco</option>
                    <option value="Confluencia Biobío">Confluencia Biobío</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Título del Hito *
                  </label>
                  <input
                    type="text"
                    value={form.titulo}
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-[#090e16] px-3 py-2 text-sm text-white"
                    placeholder="Ej: Mirador Valle del Biobío"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ícono (Emoji)
                  </label>
                  <input
                    type="text"
                    value={form.icono}
                    onChange={(e) => setForm({ ...form, icono: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-[#090e16] px-3 py-2 text-center text-lg text-white"
                    maxLength={4}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descripción Corta (Bajada en ficha) *
                </label>
                <input
                  type="text"
                  value={form.descripcion_corta}
                  onChange={(e) => setForm({ ...form, descripcion_corta: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-[#090e16] px-3 py-2 text-sm text-white"
                  placeholder="Resumen breve de una línea sobre el hito"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contenido Didáctico (Relato principal) *
                </label>
                <textarea
                  rows={3}
                  value={form.contenido_didactico}
                  onChange={(e) => setForm({ ...form, contenido_didactico: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-[#090e16] px-3 py-2 text-sm text-white"
                  placeholder="Texto educativo que leerán los visitantes en la pantalla táctil..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Longitud (Ej: -71.9720)
                  </label>
                  <input
                    type="text"
                    value={form.longitud}
                    onChange={(e) => setForm({ ...form, longitud: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-[#090e16] px-3 py-2 font-mono text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Latitud (Ej: -37.7580)
                  </label>
                  <input
                    type="text"
                    value={form.latitud}
                    onChange={(e) => setForm({ ...form, latitud: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-[#090e16] px-3 py-2 font-mono text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Horario de Acceso
                  </label>
                  <input
                    type="text"
                    value={form.horario_acceso}
                    onChange={(e) => setForm({ ...form, horario_acceso: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-[#090e16] px-3 py-2 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Modelo 3D (.glb opcional)
                  </label>
                  <input
                    type="text"
                    value={form.modelo_3d}
                    onChange={(e) => setForm({ ...form, modelo_3d: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-[#090e16] px-3 py-2 font-mono text-xs text-white"
                    placeholder="/uploads/modelos/mi_modelo.glb"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#c8aa6e] px-5 py-2 text-sm font-bold text-[#090e16] hover:bg-[#d8bc82] cursor-pointer"
                >
                  {modoEdicion ? "Guardar Cambios" : "Crear Hito"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}