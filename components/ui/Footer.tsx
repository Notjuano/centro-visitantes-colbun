export function Footer() {
  return (
    <footer className="border-t border-basalt-700/20 bg-basalt-950 text-mist-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Centro de Visitantes Colbún. Todos los derechos reservados.</p>
        <p>
          Sistema de Catálogo Digital Interactivo — accesible según pauta{" "}
          <abbr title="Web Content Accessibility Guidelines">WCAG</abbr> 2.1 AA.
        </p>
      </div>
    </footer>
  );
}
