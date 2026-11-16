export type CategoriaHito = "Energética" | "Turística" | "Ecológica" | "Histórica";

export interface HitoFeature {
  type: "Feature";
  properties: {
    id_hito: string;
    titulo: string;
    sector: "Santa Bárbara" | "Quilaco" | "Confluencia Biobío";
    categoria: CategoriaHito;
    color_hex: string;
    icono: string;
    descripcion_corta: string;
    contenido_didactico: string;
    horario_acceso: string;
    modelo_3d?: string;
    audio_url?: string;
    duracion_audio?: string;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [longitud, latitud] RFC 7946
  };
}

export interface HitoGeoJSON {
  type: "FeatureCollection";
  features: HitoFeature[];
}

export const HITOS_ANGOSTURA_MOCK: HitoGeoJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id_hito: "hito-01",
        titulo: "Centro de Visitantes Colbún",
        sector: "Quilaco",
        categoria: "Turística",
        color_hex: "#F59E0B",
        icono: "🏛️",
        descripcion_corta: "Núcleo de recepción y mediación en la ribera suroriental del embalse.",
        contenido_didactico:
          "Ubicado junto al pretil curvo de la ribera suroriental (Ruta Q-61-R). Cuenta con salas de exhibición interactiva sobre la historia hidroeléctrica, biodiversidad de la cuenca del Biobío y atención a delegaciones estudiantiles.",
        horario_acceso: "Martes a Domingo • 09:30 a 18:00 hrs",
      },
      geometry: {
        type: "Point",
        coordinates: [-71.9679, -37.7602],
      },
    },
    {
      type: "Feature",
      properties: {
        id_hito: "hito-02",
        titulo: "Central y Muro de Presa Angostura",
        sector: "Confluencia Biobío",
        categoria: "Energética",
        color_hex: "#3B82F6",
        icono: "⚡",
        descripcion_corta: "Generación renovable (323 MW) en el vértice de confluencia Biobío-Huequecura.",
        contenido_didactico:
          "Operativa desde 2014, cierra el vértice sur donde se unen los ríos Biobío y Huequecura mediante un vertedero de 5 compuertas radiales y un pretil curvo de contención. Su embalse de mínima fluctuación preserva el paisaje todo el año.",
        horario_acceso: "Operación Continua 24/7 • Mirador habilitado",
        modelo_3d: "/uploads/modelos/central_angostura.glb",
      },
      geometry: {
        type: "Point",
        coordinates: [-71.9800, -37.7635],
      },
    },
    {
      type: "Feature",
      properties: {
        id_hito: "hito-03",
        titulo: "Mirador Huequecura",
        sector: "Santa Bárbara",
        categoria: "Ecológica",
        color_hex: "#10B981",
        icono: "🔭",
        descripcion_corta: "Balcón panorámico occidental frente a la confluencia y el muro de presa.",
        contenido_didactico:
          "Situado sobre el promontorio rocoso occidental junto a la desembocadura del río Huequecura. Ofrece una vista directa hacia el muro de la central, el espejo de agua del embalse y la península de San Sebastián.",
        horario_acceso: "Acceso Libre • 09:00 a 19:00 hrs",
      },
      geometry: {
        type: "Point",
        coordinates: [-71.9851, -37.7615],
      },
    },
    {
      type: "Feature",
      properties: {
        id_hito: "hito-04",
        titulo: "Santuario y Mirador San Sebastián",
        sector: "Santa Bárbara",
        categoria: "Histórica",
        color_hex: "#A855F7",
        icono: "⛩️",
        descripcion_corta: "Hito espiritual y mirador en la cima de la península central.",
        contenido_didactico:
          "Corona la punta sur de la gran península boscosa que separa el brazo del río Huequecura del brazo del río Biobío, entregando una vista panorámica en 360° de toda la horquilla del embalse.",
        horario_acceso: "Acceso por ruta interior • 09:00 a 18:30 hrs",
      },
      geometry: {
        type: "Point",
        coordinates: [-71.9764, -37.7535],
      },
    },
    {
      type: "Feature",
      properties: {
        id_hito: "hito-05",
        titulo: "Camping y Playa Los Notros",
        sector: "Santa Bárbara",
        categoria: "Turística",
        color_hex: "#F59E0B",
        icono: "⛺",
        descripcion_corta: "Balneario y zona de acampada en la ribera oriental de la península.",
        contenido_didactico:
          "Ubicado en una bahía abrigada frente al brazo principal del río Biobío. Dispone de sitios de camping bajo bosque nativo, playa de arena, embarcadero para kayaks y aguas sin oleaje.",
        horario_acceso: "Abierto en Temporada • 09:00 a 20:00 hrs",
      },
      geometry: {
        type: "Point",
        coordinates: [-71.9700, -37.7491],
      },
    },
    {
      type: "Feature",
      properties: {
        id_hito: "hito-06",
        titulo: "Puente Colgante Río Huequecura",
        sector: "Santa Bárbara",
        categoria: "Histórica",
        color_hex: "#A855F7",
        icono: "🌉",
        descripcion_corta: "Pasarela patrimonial suspendida sobre la garganta norte del Huequecura.",
        contenido_didactico:
          "Puente colgante tradicional emplazado en la entrada norte del meandro del río Huequecura. Conecta las riberas cordilleranas de Santa Bárbara y es uno de los puntos fotográficos emblemáticos del destino.",
        horario_acceso: "Acceso Libre todo el año",
      },
      geometry: {
        type: "Point",
        coordinates: [-71.9864, -37.7412],
      },
    },
    {
      type: "Feature",
      properties: {
        id_hito: "hito-07",
        titulo: "Espacio Arboretum",
        sector: "Santa Bárbara",
        categoria: "Ecológica",
        color_hex: "#10B981",
        icono: "🌳",
        descripcion_corta: "Santuario botánico de conservación de flora nativa precordillerana.",
        contenido_didactico:
          "Jardín botánico vivo en la meseta occidental que reúne ejemplares rotulados de araucaria, roble, raulí, coigüe, peumo, quillay y maitén, funcionando como aula abierta para delegaciones escolares.",
        horario_acceso: "Martes a Domingo • Guiado y Autoguiado",
        modelo_3d: "/uploads/modelos/flora_arboretum.glb",
      },
      geometry: {
        type: "Point",
        coordinates: [-71.9929, -37.7486],
      },
    },
    {
      type: "Feature",
      properties: {
        id_hito: "hito-08",
        titulo: "Sendero Huequecura (Los Copihues)",
        sector: "Santa Bárbara",
        categoria: "Ecológica",
        color_hex: "#10B981",
        icono: "🌺",
        descripcion_corta: "Ruta pedestre de 2,5 km bajo bosque nativo en la ribera oeste.",
        contenido_didactico:
          "Sendero interpretativo que recorre en tierra firme la meseta occidental del río Huequecura, conectando el Arboretum con el Mirador entre quebradas nativas y copihueras (Lapageria rosea).",
        horario_acceso: "Dificultad Baja-Media • 50 min recorrido",
        modelo_3d: "/uploads/modelos/copihue_3d.glb",
      },
      geometry: {
        type: "Point",
        coordinates: [-71.9912, -37.7549],
      },
    },
    {
      type: "Feature",
      properties: {
        id_hito: "hito-09",
        titulo: "Playa de Libre Acceso Quilaco",
        sector: "Quilaco",
        categoria: "Turística",
        color_hex: "#F59E0B",
        icono: "🏖️",
        descripcion_corta: "Balneario público gratuito con arena dorada, muelles, kayak y quitasoles.",
        contenido_didactico:
          "Situada en la ribera suroriental del embalse junto al corredor del Centro de Visitantes. Cuenta con solárium de arena, quitasoles, accesibilidad universal y zonas de navegación en kayak.",
        horario_acceso: "Temporada Estival • 10:00 a 20:00 hrs",
      },
      geometry: {
        type: "Point",
        coordinates: [-71.9627, -37.7562],
      },
    },
    {
      type: "Feature",
      properties: {
        id_hito: "hito-10",
        titulo: "Zona de Avistamiento de Aves y Puente Biobío",
        sector: "Confluencia Biobío",
        categoria: "Ecológica",
        color_hex: "#10B981",
        icono: "🦆",
        descripcion_corta: "Humedal ornitológico y viaducto sobre el brazo noreste del río Biobío.",
        contenido_didactico:
          "Sector de riberas calmas junto al cruce del puente carretero sobre el río Biobío. Sus totorales permiten observar taguas, hualas, garzas y patos nativos en su corredor biológico natural.",
        horario_acceso: "Acceso Libre • Recomendado horario matinal",
      },
      geometry: {
        type: "Point",
        coordinates: [-71.9585, -37.7485],
      },
    },
    {
      type: "Feature",
      properties: {
        id_hito: "hito-11",
        titulo: "Subestación S/E Los Notros",
        sector: "Quilaco",
        categoria: "Energética",
        color_hex: "#3B82F6",
        icono: "🔋",
        descripcion_corta: "Patio de alta tensión aguas abajo del muro de presa Angostura.",
        contenido_didactico:
          "Emplazada en la terraza oriental aguas abajo de la presa, junto al cañón natural del río Biobío. Transforma e inyecta la energía limpia generada por la central al Sistema Eléctrico Nacional.",
        horario_acceso: "Instalación Estratégica • Vista desde ruta",
      },
      geometry: {
        type: "Point",
        coordinates: [-71.9771, -37.7705],
      },
    },
    {
      type: "Feature",
      properties: {
        id_hito: "hito-12",
        titulo: "Artesanía, Mieles, Domos y Ruca Urkutun",
        sector: "Quilaco",
        categoria: "Histórica",
        color_hex: "#A855F7",
        icono: "🍯",
        descripcion_corta: "Emprendedores locales, Capital Nacional de la Miel y cultura Pehuenche.",
        contenido_didactico:
          "Circuito patrimonial en el corredor de Quilaco y Santa Bárbara que integra apicultura tradicional multifloral, domos turísticos de naturaleza y la cosmovisión ancestral en la Ruca Urkutun.",
        horario_acceso: "Red Emprendedores CEC • Todo el año",
        modelo_3d: "/uploads/modelos/patrimonio_miel_ruca.glb",
      },
      geometry: {
        type: "Point",
        coordinates: [-71.9604, -37.7648],
      },
    },
  ],
};