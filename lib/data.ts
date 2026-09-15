export type Station = {
  id: string;
  numero: number;
  titulo: string;
  resumen: string;
  contenido: string;
  imagenUrl: string;
  audioUrl: string;
  duracionAudio: string;
  categoria: "energia" | "agua" | "sustentabilidad" | "comunidad";
};

export const ESTACIONES: Station[] = [
  {
    id: "cuenca-biobio",
    numero: 1,
    titulo: "La cuenca del Bío Bío",
    resumen: "El recorrido del río desde la cordillera hasta el embalse.",
    contenido:
      "El río Bío Bío nace en la cordillera de los Andes y recorre cientos de kilómetros antes de alcanzar el embalse. Esta estación explica cómo el relieve, las lluvias y los deshielos alimentan el caudal que hace posible la generación de energía.",
    imagenUrl: "/images/estacion-cuenca.svg",
    audioUrl: "/audio/cuenca-biobio.mp3",
    duracionAudio: "1:45",
    categoria: "agua"
  },
  {
    id: "central-hidroelectrica",
    numero: 2,
    titulo: "¿Cómo se genera la energía?",
    resumen: "El viaje del agua desde el embalse hasta la turbina.",
    contenido:
      "El agua embalsada cae por una tubería a presión y hace girar una turbina conectada a un generador. Ese movimiento se transforma en electricidad, que luego viaja por las líneas de transmisión hasta los hogares.",
    imagenUrl: "/images/estacion-central.svg",
    audioUrl: "/audio/central-hidroelectrica.mp3",
    duracionAudio: "2:10",
    categoria: "energia"
  },
  {
    id: "biodiversidad-local",
    numero: 3,
    titulo: "Biodiversidad del entorno",
    resumen: "Especies nativas que conviven con el embalse.",
    contenido:
      "El entorno del embalse alberga bosque nativo, aves y fauna propia del centro-sur de Chile. Esta estación presenta un registro fotográfico y sonoro de las especies más representativas del área de influencia.",
    imagenUrl: "/images/estacion-biodiversidad.svg",
    audioUrl: "/audio/biodiversidad-local.mp3",
    duracionAudio: "1:58",
    categoria: "sustentabilidad"
  },
  {
    id: "comunidades-vecinas",
    numero: 4,
    titulo: "Comunidades vecinas",
    resumen: "La relación entre la central y los pueblos aledaños.",
    contenido:
      "Las localidades cercanas al embalse mantienen una relación histórica con el territorio. Esta estación recoge testimonios sobre tradiciones, oficios y la vida cotidiana junto al río.",
    imagenUrl: "/images/estacion-comunidad.svg",
    audioUrl: "/audio/comunidades-vecinas.mp3",
    duracionAudio: "2:32",
    categoria: "comunidad"
  },
  {
    id: "energias-renovables",
    numero: 5,
    titulo: "Matriz energética renovable",
    resumen: "El aporte de la hidroelectricidad a la matriz nacional.",
    contenido:
      "La energía hidroeléctrica es una fuente renovable clave en la matriz energética chilena. Esta estación compara distintas fuentes de generación y su huella ambiental relativa.",
    imagenUrl: "/images/estacion-matriz.svg",
    audioUrl: "/audio/energias-renovables.mp3",
    duracionAudio: "2:05",
    categoria: "energia"
  }
];

export const getEstacionPorId = (id: string) =>
  ESTACIONES.find((estacion) => estacion.id === id);

export type MetricaResumen = {
  totalVisitas: number;
  visitasHoy: number;
  satisfaccionPromedio: number;
  tiempoPromedioRecorrido: string;
  estacionMasVisitada: string;
};

export const METRICAS_DEMO: MetricaResumen = {
  totalVisitas: 8420,
  visitasHoy: 132,
  satisfaccionPromedio: 4.6,
  tiempoPromedioRecorrido: "24 min",
  estacionMasVisitada: "¿Cómo se genera la energía?"
};
