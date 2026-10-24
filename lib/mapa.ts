export type CapaId =
  | "agua"
  | "aves"
  | "bosque"
  | "patrimonio"
  | "flora"
  | "energia"
  | "senderos";

export type IconoMapa =
  | "droplets"
  | "bird"
  | "trees"
  | "landmark"
  | "leaf"
  | "wind"
  | "footprints"
  | "binoculars"
  | "camera";

export type Capa = {
  id: CapaId;
  nombre: string;
  descripcion: string;
  icono: IconoMapa;
  color: string;
  miniatura: string;
};

export const CAPAS: Capa[] = [
  {
    id: "agua",
    nombre: "Agua y cauce",
    descripcion: "Río, cascadas y humedales del Bío Bío.",
    icono: "droplets",
    color: "#2BB3E6",
    miniatura: "/images/mapa/poi-humedal.jpg"
  },
  {
    id: "aves",
    nombre: "Aves",
    descripcion: "Especies observadas en riberas y humedales.",
    icono: "bird",
    color: "#5BA8FF",
    miniatura: "/images/mapa/poi-martin-pescador.jpg"
  },
  {
    id: "bosque",
    nombre: "Bosque nativo",
    descripcion: "Cobertura vegetal del valle y laderas.",
    icono: "trees",
    color: "#2F9E6B",
    miniatura: "/images/mapa/territorio-vivo.jpg"
  },
  {
    id: "patrimonio",
    nombre: "Patrimonio",
    descripcion: "Memoria, oficios y comunidades del territorio.",
    icono: "landmark",
    color: "#C4A574",
    miniatura: "/images/estacion-comunidad.svg"
  },
  {
    id: "flora",
    nombre: "Flora",
    descripcion: "Especies vegetales representativas del entorno.",
    icono: "leaf",
    color: "#3DDC84",
    miniatura: "/images/estacion-biodiversidad.svg"
  },
  {
    id: "energia",
    nombre: "Energía",
    descripcion: "Generación hidroeléctrica y matriz renovable.",
    icono: "wind",
    color: "#1ECAD3",
    miniatura: "/images/estacion-central.svg"
  },
  {
    id: "senderos",
    nombre: "Senderos",
    descripcion: "Recorridos peatonales y miradores del centro.",
    icono: "footprints",
    color: "#F08A3A",
    miniatura: "/images/mapa/territorio-vivo.jpg"
  }
];

export type PuntoInteres = {
  id: string;
  titulo: string;
  resumen: string;
  contenido: string;
  capa: CapaId;
  x: number;
  y: number;
  icono: IconoMapa;
  color: string;
  imagen: string;
  galeria: string[];
  audioUrl: string;
  duracionAudio: string;
};

export const PUNTOS_INTERES: PuntoInteres[] = [
  {
    id: "bosque-nativo",
    titulo: "Bosque nativo del valle",
    resumen: "Cobertura vegetal que envuelve las laderas del Bío Bío.",
    contenido:
      "El bosque nativo del valle sostiene humedad, sombra y refugio para fauna local. Desde este punto se observa cómo la vegetación acompaña el cauce y protege las laderas.",
    capa: "bosque",
    x: 36,
    y: 38,
    icono: "leaf",
    color: "#3DDC84",
    imagen: "/images/mapa/territorio-vivo.jpg",
    galeria: ["/images/mapa/territorio-vivo.jpg", "/images/estacion-biodiversidad.svg"],
    audioUrl: "/audio/biodiversidad-local.mp3",
    duracionAudio: "1:58"
  },
  {
    id: "cascada-angostura",
    titulo: "Cascada de Angostura",
    resumen: "Salto de agua en el tramo angosto del cauce.",
    contenido:
      "El estrechamiento del valle acelera el agua y forma saltos visibles desde el mirador. Esta estación explica el relieve, el caudal y el sonido del río como parte de la experiencia del centro.",
    capa: "agua",
    x: 58,
    y: 30,
    icono: "droplets",
    color: "#2EE0C0",
    imagen: "/images/mapa/poi-cascada.jpg",
    galeria: [
      "/images/mapa/poi-cascada.jpg",
      "/images/mapa/poi-humedal.jpg",
      "/images/mapa/poi-martin-pescador.jpg"
    ],
    audioUrl: "/audio/cuenca-biobio.mp3",
    duracionAudio: "1:45"
  },
  {
    id: "humedal-cauce",
    titulo: "Humedal del cauce",
    resumen: "Aguas calmas donde se concentra biodiversidad.",
    contenido:
      "En las orillas más lentas el río forma humedales. Son zonas de alimentación para aves y un indicador de la salud del ecosistema ribereño.",
    capa: "agua",
    x: 51,
    y: 49,
    icono: "droplets",
    color: "#3B82F6",
    imagen: "/images/mapa/poi-humedal.jpg",
    galeria: ["/images/mapa/poi-humedal.jpg", "/images/mapa/poi-garza.jpg"],
    audioUrl: "/audio/cuenca-biobio.mp3",
    duracionAudio: "1:45"
  },
  {
    id: "sendero-ribereno",
    titulo: "Sendero ribereño",
    resumen: "Recorrido peatonal junto al agua.",
    contenido:
      "El sendero conecta miradores y estaciones educativas. Está pensado para familias, estudiantes y visitas guiadas, con pausas de interpretación en cada tramo.",
    capa: "senderos",
    x: 45,
    y: 59,
    icono: "footprints",
    color: "#F08A3A",
    imagen: "/images/mapa/territorio-vivo.jpg",
    galeria: ["/images/mapa/territorio-vivo.jpg", "/images/mapa/poi-cascada.jpg"],
    audioUrl: "/audio/comunidades-vecinas.mp3",
    duracionAudio: "2:32"
  },
  {
    id: "observatorio-aves",
    titulo: "Observatorio de aves",
    resumen: "Punto de avistamiento en la ribera.",
    contenido:
      "Desde este mirador se registran especies como el martín pescador y garzas. El audio descriptivo ayuda a identificar cantos y hábitos sin interrumpir el entorno.",
    capa: "aves",
    x: 28,
    y: 54,
    icono: "binoculars",
    color: "#9AA3AD",
    imagen: "/images/mapa/poi-martin-pescador.jpg",
    galeria: ["/images/mapa/poi-martin-pescador.jpg", "/images/mapa/poi-garza.jpg"],
    audioUrl: "/audio/biodiversidad-local.mp3",
    duracionAudio: "1:58"
  },
  {
    id: "mirador-fotografico",
    titulo: "Mirador fotográfico",
    resumen: "Vista abierta del meandro y las montañas.",
    contenido:
      "El mirador ofrece una panorámica del cauce para comprender la forma del territorio. Es un punto frecuente en visitas educativas y registros visuales del paisaje.",
    capa: "flora",
    x: 74,
    y: 41,
    icono: "camera",
    color: "#8B6CFF",
    imagen: "/images/mapa/territorio-vivo.jpg",
    galeria: ["/images/mapa/territorio-vivo.jpg", "/images/mapa/poi-cascada.jpg"],
    audioUrl: "/audio/biodiversidad-local.mp3",
    duracionAudio: "1:58"
  },
  {
    id: "central-energia",
    titulo: "Energía del agua",
    resumen: "El salto hídrico y la generación eléctrica.",
    contenido:
      "El desnivel del valle permite transformar el movimiento del agua en electricidad. Esta capa muestra la relación entre el cauce, la infraestructura y la matriz renovable.",
    capa: "energia",
    x: 63,
    y: 66,
    icono: "wind",
    color: "#1ECAD3",
    imagen: "/images/estacion-central.svg",
    galeria: ["/images/estacion-central.svg", "/images/estacion-matriz.svg"],
    audioUrl: "/audio/central-hidroelectrica.mp3",
    duracionAudio: "2:10"
  },
  {
    id: "memoria-territorio",
    titulo: "Memoria del territorio",
    resumen: "Comunidades, oficios y vida junto al río.",
    contenido:
      "Las localidades vecinas mantienen una relación histórica con el Bío Bío. Esta estación recoge testimonios sobre tradiciones, oficios y la vida cotidiana junto al agua.",
    capa: "patrimonio",
    x: 68,
    y: 74,
    icono: "landmark",
    color: "#C4A574",
    imagen: "/images/estacion-comunidad.svg",
    galeria: ["/images/estacion-comunidad.svg"],
    audioUrl: "/audio/comunidades-vecinas.mp3",
    duracionAudio: "2:32"
  }
];

export const getPuntoPorId = (id: string) => PUNTOS_INTERES.find((punto) => punto.id === id);

export const METRICAS_TERRITORIO = [
  { id: "caudal", etiqueta: "Caudal relativo", unidad: "m³/s", valores: [42, 48, 45, 61, 58, 72, 68, 74, 70, 66] },
  { id: "aves", etiqueta: "Avistamientos", unidad: "registros", valores: [8, 12, 9, 18, 22, 16, 28, 24, 31, 27] },
  { id: "cobertura", etiqueta: "Cobertura vegetal", unidad: "%", valores: [62, 63, 64, 66, 65, 68, 70, 69, 71, 73] }
];
