import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { FeedbackForm } from "@/components/ui/FeedbackForm";

export const metadata = {
  title: "Encuesta de satisfacción | Centro de Visitantes Colbún"
};

export default function EncuestaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-mist-50">
      <Navbar />

      <main id="contenido-principal" className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <header className="mb-8 text-center">
          <p className="text-xs uppercase tracking-wide text-cauce-600">Menos de 60 segundos</p>
          <h1 className="mt-1 font-display text-3xl text-basalt-900">Cuéntanos tu experiencia</h1>
          <p className="mt-2 text-basalt-700">
            Tu respuesta es anónima y nos ayuda a mejorar el Centro de Visitantes.
          </p>
        </header>

        <FeedbackForm />
      </main>

      <Footer />
    </div>
  );
}
