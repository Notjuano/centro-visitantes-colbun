import { notFound } from "next/navigation";
import { ExperienciaAR } from "@/components/ar/ExperienciaAR";
import { getRecursoAR, recursosAR } from "@/lib/ar";

export function generateStaticParams() {
  return recursosAR.map((recurso) => ({ id: recurso.id }));
}

export default function PaginaAR({ params }: { params: { id: string } }) {
  const recurso = getRecursoAR(params.id);
  if (!recurso) notFound();
  return <ExperienciaAR recurso={recurso} />;
}
