"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  HITOS_ANGOSTURA_MOCK,
  HitoFeature,
  CategoriaHito,
} from "@/data/hitosAngostura";

const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 1600;
const INACTIVITY_LIMIT_MS = 180000; // 3 minutos (180 s) para retorno a portada

// Dimensiones del lienzo base pre-renderizado en memoria (Offscreen Canvas)
const BAKE_MIN_X = -1100;
const BAKE_MIN_Y = -900;
const BAKE_WIDTH = 4600;
const BAKE_HEIGHT = 3400;
const BAKE_SCALE = 0.55;

// Etiquetas cortas para evitar colisiones visuales en pantallas táctiles
const TOUCH_SHORT_LABELS: Record<string, string> = {
  "hito-01": "Centro Visitantes",
  "hito-02": "Central Angostura",
  "hito-03": "Mirador Huequecura",
  "hito-04": "San Sebastián",
  "hito-05": "Camping Los Notros",
  "hito-06": "Puente Colgante",
  "hito-07": "Espacio Arboretum",
  "hito-08": "Los Copihues",
  "hito-09": "Playa Quilaco",
  "hito-10": "Puente Biobío",
  "hito-11": "S/E Los Notros",
  "hito-12": "Artesanía y Ruca",
};

interface DestacadoItem {
  numero: string;
  titulo: string;
  subtitulo: string;
  relato: string;
  gradient: string;
  accent: string;
  imageUrl: string;
}

function obtenerDestacadosPorHito(
  hito: HitoFeature["properties"]
): DestacadoItem[] {
  return [
    {
      numero: "01 / 03",
      titulo: "ARQUITECTURA Y ENTORNO",
      subtitulo: `INFRAESTRUCTURA • ${hito.sector.toUpperCase()}`,
      relato: `${hito.contenido_didactico} Este punto forma parte de la red de infraestructura diseñada para integrarse armónicamente con el relieve montañoso de la precordillera del Biobío, permitiendo recibir visitantes y delegaciones durante todo el año.`,
      gradient:
        "linear-gradient(135deg, rgba(15,23,42,0.15) 0%, rgba(10,17,26,0.92) 100%), radial-gradient(circle at 30% 35%, rgba(200,170,110,0.42), rgba(15,23,42,0.95) 75%)",
      accent: "#c8aa6e",
      imageUrl: `/imagenes/${hito.id_hito}-01.jpg`,
    },
    {
      numero: "02 / 03",
      titulo: "ECOSISTEMA DEL BIOBÍO",
      subtitulo: `BIODIVERSIDAD • CUENCA FLUVIAL`,
      relato: `El entorno inmediato de ${hito.titulo} alberga corredores biológicos de bosque nativo con presencia de coigües, robles, notros, peumos y araucarias en las cotas altas, además de avifauna acuática que habita las riberas de los ríos Biobío y Huequecura.`,
      gradient:
        "linear-gradient(135deg, rgba(6,78,59,0.35) 0%, rgba(10,17,26,0.95) 100%), radial-gradient(circle at 70% 30%, rgba(16,185,129,0.38), rgba(9,19,34,0.96) 75%)",
      accent: "#10b981",
      imageUrl: `/imagenes/${hito.id_hito}-02.jpg`,
    },
    {
      numero: "03 / 03",
      titulo: "IDENTIDAD Y PATRIMONIO",
      subtitulo: `HISTORIA LOCAL • ${hito.categoria.toUpperCase()}`,
      relato: `La confluencia entre las comunas de Quilaco y Santa Bárbara reúne décadas de tradición energética, turismo comunitario y cultura pewenche. Horario de visita recomendado: ${hito.horario_acceso}.`,
      gradient:
        "linear-gradient(135deg, rgba(30,58,138,0.38) 0%, rgba(10,17,26,0.95) 100%), radial-gradient(circle at 40% 60%, rgba(56,189,248,0.35), rgba(9,19,34,0.96) 75%)",
      accent: "#38bdf8",
      imageUrl: `/imagenes/${hito.id_hito}-03.jpg`,
    },
  ];
}

const GEO_BOUNDS = {
  minLon: -72.0,
  maxLon: -71.95,
  minLat: -37.772,
  maxLat: -37.74,
};

export function projectGeoToCanvas(lon: number, lat: number) {
  const x =
    ((lon - GEO_BOUNDS.minLon) / (GEO_BOUNDS.maxLon - GEO_BOUNDS.minLon)) *
      (WORLD_WIDTH * 0.65) +
    WORLD_WIDTH * 0.175;
  const y =
    ((GEO_BOUNDS.maxLat - lat) / (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat)) *
      (WORLD_HEIGHT * 0.65) +
    WORLD_HEIGHT * 0.175;
  return { x, y };
}

function distToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
) {
  const dx = bx - ax;
  const dy = by - ay;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

const MOUNTAINS_3D: Array<{
  x: number;
  y: number;
  r: number;
  h: number;
  label?: string;
}> = [
  { x: -120, y: 120, r: 300, h: 260 },
  { x: 220, y: -110, r: 280, h: 245 },
  { x: 1180, y: -130, r: 300, h: 275 },
  { x: 1620, y: -100, r: 280, h: 255 },
  { x: 2420, y: 180, r: 310, h: 270 },
  { x: 2520, y: 680, r: 300, h: 250 },
  { x: 2460, y: 1180, r: 290, h: 235 },
  { x: 2180, y: 1580, r: 280, h: 220 },
  { x: 1580, y: 1680, r: 270, h: 205 },
  { x: 320, y: 1620, r: 280, h: 210 },
  { x: -140, y: 1180, r: 290, h: 225 },
  { x: -180, y: 640, r: 280, h: 230 },

  { x: 390, y: 275, r: 185, h: 195, label: "QUILLAILEO" },
  { x: 545, y: 135, r: 160, h: 215 },
  { x: 1155, y: 165, r: 205, h: 235, label: "LAS QUINIENTAS" },
  { x: 1435, y: 175, r: 220, h: 250 },
  { x: 1690, y: 190, r: 185, h: 215, label: "SALTOS DE NEWENKO" },
  { x: 2075, y: 495, r: 235, h: 245, label: "CERRO VAQUECHA" },
  { x: 2085, y: 835, r: 235, h: 230, label: "CERRO EL TREN" },
  { x: 1955, y: 1265, r: 220, h: 200 },
  { x: 1560, y: 1395, r: 215, h: 175, label: "CERRO EL PADRE" },
  { x: 520, y: 1330, r: 215, h: 170 },
  { x: 295, y: 720, r: 215, h: 185 },
];

function isInsideWaterOrStructures(x: number, y: number): boolean {
  if (distToSegment(x, y, 680, -500, 845, 200) < 92) return true;
  if (distToSegment(x, y, 845, 200, 790, 440) < 98) return true;
  if (distToSegment(x, y, 790, 440, 895, 710) < 108) return true;
  if (distToSegment(x, y, 895, 710, 1045, 1040) < 138) return true;

  if (distToSegment(x, y, 2550, -350, 1950, 240) < 142) return true;
  if (distToSegment(x, y, 1950, 240, 1790, 430) < 148) return true;
  if (distToSegment(x, y, 1790, 430, 1690, 535) < 115) return true;
  if (distToSegment(x, y, 1690, 535, 1390, 775) < 178) return true;
  if (distToSegment(x, y, 1390, 775, 1045, 1040) < 172) return true;

  if (distToSegment(x, y, 1045, 1040, 915, 1395) < 118) return true;
  if (distToSegment(x, y, 915, 1395, 760, 2100) < 118) return true;

  if (distToSegment(x, y, 2450, 720, 1890, 1060) < 55) return true;
  if (distToSegment(x, y, 1890, 1060, 1220, 1950) < 55) return true;

  const clearZones = [
    { x: 1420, y: 935, r: 75 },
    { x: 1045, y: 1045, r: 100 },
    { x: 1155, y: 720, r: 60 },
    { x: 1385, y: 585, r: 85 },
    { x: 1585, y: 805, r: 95 },
    { x: 1135, y: 1270, r: 80 },
    { x: 1655, y: 1085, r: 70 },
    { x: 1855, y: 455, r: 70 },
    { x: 885, y: 980, r: 55 },
    { x: 640, y: 560, r: 55 },
    { x: 840, y: 320, r: 75 },
    { x: 1365, y: 1135, r: 70 },
    { x: 650, y: 1140, r: 70 },
    { x: 1215, y: 480, r: 65 },
  ];
  for (const cz of clearZones) {
    if (Math.hypot(x - cz.x, y - cz.y) < cz.r) return true;
  }

  for (const m of MOUNTAINS_3D) {
    if (Math.hypot(x - m.x, y - m.y) < m.r * 0.88) return true;
  }

  return false;
}

function getTerrainBaseZ(x: number, y: number): number {
  if (x >= 910 && x <= 1580 && y >= 240 && y <= 775) {
    const dHueq = distToSegment(x, y, 845, 220, 1020, 950);
    const dBio = distToSegment(x, y, 1880, 290, 1060, 980);
    if (dHueq > 75 && dBio > 105) return 24;
  }
  if (x >= 420 && x <= 920 && y >= 390 && y <= 1020) {
    const dHueq = distToSegment(x, y, 790, 420, 1045, 1040);
    if (dHueq > 80) return 18;
  }
  return 0;
}

function treeHash(seed: number): number {
  const n = Math.sin(seed * 12.9898 + 78.233) * 43758.5453123;
  return n - Math.floor(n);
}

const SORTED_TREES_3D = Array.from({ length: 340 }, (_, i) => {
  const rx = treeHash(i * 3.17 + 1.23);
  const ry = treeHash(i * 7.91 + 4.56);
  const rVar = treeHash(i * 13.37 + 9.81);

  const x = -50 + Math.floor(rx * 2550);
  const y = -50 + Math.floor(ry * 1750);

  return {
    x,
    y,
    baseZ: getTerrainBaseZ(x, y),
    radius: 11 + Math.floor(rVar * 7),
    height: 26 + Math.floor(rx * 16),
    type: i % 4 === 0 ? "araucaria" : "nativo",
    colorTop: i % 3 === 0 ? "#22c55e" : i % 2 === 0 ? "#16a34a" : "#15803d",
    colorSide: "#14532d",
  };
})
  .filter((t) => !isInsideWaterOrStructures(t.x, t.y))
  .sort((a, b) => a.y - b.y);

const CLOUDS_3D = [
  { x: 550, y: 460, w: 320, h: 105, speed: 0.22 },
  { x: 1520, y: 390, w: 360, h: 120, speed: 0.16 },
  { x: 1120, y: 1080, w: 340, h: 105, speed: 0.2 },
];

function buildStaticGroundCanvas(): HTMLCanvasElement {
  const offscreen = document.createElement("canvas");
  offscreen.width = Math.round(BAKE_WIDTH * BAKE_SCALE);
  offscreen.height = Math.round(BAKE_HEIGHT * BAKE_SCALE);
  const ctx = offscreen.getContext("2d")!;

  ctx.save();
  ctx.scale(BAKE_SCALE, BAKE_SCALE);
  ctx.translate(-BAKE_MIN_X, -BAKE_MIN_Y);

  ctx.fillStyle = "#132d21";
  ctx.fillRect(BAKE_MIN_X, BAKE_MIN_Y, BAKE_WIDTH, BAKE_HEIGHT);

  const cols = 18;
  const rows = 14;
  const stepX = BAKE_WIDTH / cols;
  const stepY = BAKE_HEIGHT / rows;
  const palette = ["#183b2b", "#1c4331", "#153325", "#1f4935", "#132d21", "#22503a"];

  const grid: Array<Array<{ x: number; y: number }>> = [];
  for (let r = 0; r <= rows; r++) {
    const rowPts: Array<{ x: number; y: number }> = [];
    for (let c = 0; c <= cols; c++) {
      const jx = Math.sin(r * 7.3 + c * 13.1) * 48;
      const jy = Math.cos(r * 11.7 + c * 5.9) * 42;
      rowPts.push({
        x: BAKE_MIN_X + c * stepX + jx,
        y: BAKE_MIN_Y + r * stepY + jy,
      });
    }
    grid.push(rowPts);
  }

  ctx.strokeStyle = "rgba(110, 231, 183, 0.06)";
  ctx.lineWidth = 1.5;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const p00 = grid[r][c];
      const p10 = grid[r][c + 1];
      const p01 = grid[r + 1][c];
      const p11 = grid[r + 1][c + 1];

      ctx.fillStyle = palette[(r * 3 + c * 5) % palette.length];
      ctx.beginPath();
      ctx.moveTo(p00.x, p00.y);
      ctx.lineTo(p10.x, p10.y);
      ctx.lineTo(p11.x, p11.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = palette[(r * 7 + c * 2 + 1) % palette.length];
      ctx.beginPath();
      ctx.moveTo(p00.x, p00.y);
      ctx.lineTo(p11.x, p11.y);
      ctx.lineTo(p01.x, p01.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  const valleyGlow = ctx.createRadialGradient(1220, 780, 120, 1220, 780, 1350);
  valleyGlow.addColorStop(0, "rgba(40, 94, 68, 0.85)");
  valleyGlow.addColorStop(0.6, "rgba(28, 67, 49, 0.45)");
  valleyGlow.addColorStop(1, "rgba(17, 41, 30, 0)");
  ctx.fillStyle = valleyGlow;
  ctx.fillRect(BAKE_MIN_X, BAKE_MIN_Y, BAKE_WIDTH, BAKE_HEIGHT);

  const lowPolyFields = [
    {
      pts: [
        { x: 1180, y: 1060 },
        { x: 1410, y: 970 },
        { x: 1490, y: 1130 },
        { x: 1240, y: 1210 },
      ],
      color: "rgba(132, 169, 92, 0.26)",
    },
    {
      pts: [
        { x: 1425, y: 965 },
        { x: 1620, y: 890 },
        { x: 1710, y: 1030 },
        { x: 1510, y: 1120 },
      ],
      color: "rgba(180, 154, 90, 0.22)",
    },
    {
      pts: [
        { x: 540, y: 1050 },
        { x: 820, y: 990 },
        { x: 855, y: 1170 },
        { x: 590, y: 1220 },
      ],
      color: "rgba(168, 146, 88, 0.24)",
    },
    {
      pts: [
        { x: 1790, y: 420 },
        { x: 1940, y: 375 },
        { x: 1965, y: 515 },
        { x: 1810, y: 555 },
      ],
      color: "rgba(176, 152, 94, 0.25)",
    },
  ];
  lowPolyFields.forEach((field) => {
    ctx.fillStyle = field.color;
    ctx.strokeStyle = "rgba(167, 243, 208, 0.15)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    field.pts.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  const beachQuilacoGrad = ctx.createLinearGradient(1480, 740, 1680, 880);
  beachQuilacoGrad.addColorStop(0, "#fde047");
  beachQuilacoGrad.addColorStop(0.6, "#facc15");
  beachQuilacoGrad.addColorStop(1, "#ca8a04");
  ctx.fillStyle = beachQuilacoGrad;
  ctx.beginPath();
  ctx.moveTo(1465, 845);
  ctx.quadraticCurveTo(1545, 730, 1665, 715);
  ctx.quadraticCurveTo(1685, 825, 1605, 885);
  ctx.quadraticCurveTo(1525, 905, 1465, 845);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(254, 240, 138, 0.65)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.moveTo(1315, 640);
  ctx.bezierCurveTo(1345, 590, 1395, 545, 1450, 530);
  ctx.bezierCurveTo(1475, 565, 1460, 620, 1410, 655);
  ctx.bezierCurveTo(1370, 675, 1330, 665, 1315, 640);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#334155";
  ctx.beginPath();
  ctx.moveTo(980, 1045);
  ctx.lineTo(1100, 1045);
  ctx.lineTo(840, 2100);
  ctx.lineTo(680, 2100);
  ctx.closePath();
  ctx.fill();

  const waterGrad = ctx.createLinearGradient(600, 0, 1900, 1600);
  waterGrad.addColorStop(0, "#0369a1");
  waterGrad.addColorStop(0.4, "#0284c7");
  waterGrad.addColorStop(0.75, "#0ea5e9");
  waterGrad.addColorStop(1, "#0284c7");

  ctx.save();
  ctx.shadowColor = "rgba(14, 165, 233, 0.45)";
  ctx.shadowBlur = 20;
  ctx.fillStyle = waterGrad;

  ctx.beginPath();
  ctx.moveTo(640, -600);
  ctx.bezierCurveTo(710, -250, 825, 40, 805, 205);
  ctx.bezierCurveTo(785, 310, 710, 390, 735, 495);
  ctx.bezierCurveTo(765, 615, 845, 725, 905, 865);
  ctx.bezierCurveTo(945, 955, 975, 1015, 995, 1050);
  ctx.lineTo(1105, 1050);
  ctx.bezierCurveTo(1085, 965, 1025, 855, 965, 715);
  ctx.bezierCurveTo(905, 585, 825, 475, 825, 385);
  ctx.bezierCurveTo(825, 315, 875, 265, 890, 205);
  ctx.bezierCurveTo(910, 40, 790, -250, 730, -600);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(2580, -450);
  ctx.bezierCurveTo(2280, -140, 2040, 95, 1885, 235);
  ctx.bezierCurveTo(1755, 295, 1685, 375, 1655, 465);
  ctx.bezierCurveTo(1635, 515, 1585, 555, 1515, 605);
  ctx.bezierCurveTo(1385, 705, 1245, 765, 1145, 815);
  ctx.bezierCurveTo(1065, 865, 1015, 955, 995, 1050);
  ctx.lineTo(1105, 1050);
  ctx.bezierCurveTo(1235, 985, 1365, 945, 1485, 865);
  ctx.bezierCurveTo(1615, 775, 1715, 645, 1785, 545);
  ctx.bezierCurveTo(1865, 465, 1935, 395, 1995, 285);
  ctx.bezierCurveTo(2160, 140, 2410, -110, 2710, -410);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(995, 1055);
  ctx.bezierCurveTo(945, 1220, 825, 1580, 700, 2100);
  ctx.lineTo(835, 2100);
  ctx.bezierCurveTo(965, 1580, 1055, 1220, 1090, 1055);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(2550, 680);
  ctx.quadraticCurveTo(1850, 1120, 1180, 1950);
  ctx.lineTo(1240, 1950);
  ctx.quadraticCurveTo(1900, 1150, 2590, 720);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(186, 230, 253, 0.48)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#fde68a";
  ctx.beginPath();
  ctx.ellipse(968, 1235, 20, 58, 0.26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1f4e37";
  ctx.beginPath();
  ctx.ellipse(968, 1235, 13, 44, 0.26, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(1525, 795);
  ctx.rotate(-0.55);
  ctx.fillStyle = "#78350f";
  ctx.strokeStyle = "#fcd34d";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-9, -36, 18, 72, 3);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(1455, 615);
  ctx.rotate(0.65);
  ctx.fillStyle = "#78350f";
  ctx.strokeStyle = "#fcd34d";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-8, -28, 16, 56, 3);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore();
  return offscreen;
}

export default function MapaTerritorial() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const groundCacheRef = useRef<HTMLCanvasElement | null>(null);

  const [modoReposo, setModoReposo] = useState<boolean>(true);
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaHito | "Todas">("Todas");
  const [hitoSeleccionado, setHitoSeleccionado] = useState<HitoFeature["properties"] | null>(null);
  const [vista3DActiva, setVista3DActiva] = useState<boolean>(true);

  const [galeriaAbierta, setGaleriaAbierta] = useState<boolean>(false);
  const [indiceDestacado, setIndiceDestacado] = useState<number>(0);
  const [imagenExpandida, setImagenExpandida] = useState<boolean>(false);

  const lastInteractionRef = useRef<number>(0);
  const pinchDistRef = useRef<number | null>(null);

  const camRef = useRef({
    x: 1220,
    y: 790,
    zoom: 1.0,
    pitch: 0.64,
    yaw: -0.1,
    targetX: 1220,
    targetY: 790,
    targetZoom: 1.0,
    targetPitch: 0.64,
    targetYaw: -0.1,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    pointerMoved: false,
  });

  const obtenerZoomBase = useCallback((esPortada: boolean) => {
    if (typeof window === "undefined") return 1.0;
    const esMovil = window.innerWidth < 768;
    if (esMovil) {
      return esPortada ? 0.64 : 0.78;
    }
    return esPortada ? 1.05 : 1.22;
  }, []);

  const registrarActividad = useCallback(() => {
    lastInteractionRef.current = Date.now();
  }, []);

  const activarModoReposo = useCallback(() => {
    setModoReposo(true);
    setHitoSeleccionado(null);
    setGaleriaAbierta(false);
    setImagenExpandida(false);
    setCategoriaActiva("Todas");
    camRef.current.targetX = 1220;
    camRef.current.targetY = 790;
    camRef.current.targetZoom = obtenerZoomBase(true);
    camRef.current.targetPitch = 0.64;
    camRef.current.targetYaw = -0.1;
    setVista3DActiva(true);
  }, [obtenerZoomBase]);

  const iniciarExploracion = useCallback(() => {
    registrarActividad();
    setModoReposo(false);
    camRef.current.targetX = 1220;
    camRef.current.targetY = 800;
    camRef.current.targetZoom = obtenerZoomBase(false);
    camRef.current.targetPitch = 0.62;
    camRef.current.targetYaw = -0.1;
  }, [registrarActividad, obtenerZoomBase]);

  const enfocarCamara = useCallback(
    (x: number, y: number, zoom?: number, pitch = 0.56) => {
      registrarActividad();
      const esMovil = typeof window !== "undefined" && window.innerWidth < 768;
      camRef.current.targetX = esMovil ? x : x + 130;
      camRef.current.targetY = esMovil ? y + 110 : y;
      camRef.current.targetZoom = zoom ?? (esMovil ? 1.05 : 1.48);
      camRef.current.targetPitch = pitch;
    },
    [registrarActividad]
  );

  const cerrarFichaHito = useCallback(() => {
    registrarActividad();
    setHitoSeleccionado(null);
    setGaleriaAbierta(false);
    setImagenExpandida(false);
    camRef.current.targetX = 1220;
    camRef.current.targetY = 800;
    camRef.current.targetZoom = obtenerZoomBase(false);
    camRef.current.targetPitch = 0.62;
  }, [registrarActividad, obtenerZoomBase]);

  const restablecerVista = useCallback(() => {
    registrarActividad();
    setHitoSeleccionado(null);
    setGaleriaAbierta(false);
    setImagenExpandida(false);
    setCategoriaActiva("Todas");
    camRef.current.targetX = 1220;
    camRef.current.targetY = 800;
    camRef.current.targetZoom = obtenerZoomBase(false);
    camRef.current.targetPitch = 0.62;
    camRef.current.targetYaw = -0.1;
    setVista3DActiva(true);
  }, [registrarActividad, obtenerZoomBase]);

  const alternarPantallaCompleta = () => {
    registrarActividad();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    lastInteractionRef.current = Date.now();
    const zInicial = obtenerZoomBase(true);
    camRef.current.zoom = zInicial;
    camRef.current.targetZoom = zInicial;
  }, [obtenerZoomBase]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        !modoReposo &&
        lastInteractionRef.current > 0 &&
        Date.now() - lastInteractionRef.current >= INACTIVITY_LIMIT_MS
      ) {
        activarModoReposo();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [modoReposo, activarModoReposo]);

  const alternarPerspectiva3D = () => {
    registrarActividad();
    const nuevoEstado = !vista3DActiva;
    setVista3DActiva(nuevoEstado);
    camRef.current.targetPitch = nuevoEstado ? 0.62 : 0.96;
    camRef.current.targetYaw = nuevoEstado ? -0.1 : 0;
  };

  useEffect(() => {
    if (!groundCacheRef.current) {
      groundCacheRef.current = buildStaticGroundCanvas();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const render = () => {
      time += 0.025;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const cam = camRef.current;

      if (modoReposo) {
        cam.targetYaw = -0.1 + Math.sin(time * 0.12) * 0.06;
      }

      cam.x += (cam.targetX - cam.x) * 0.1;
      cam.y += (cam.targetY - cam.y) * 0.1;
      cam.zoom += (cam.targetZoom - cam.zoom) * 0.1;
      cam.pitch += (cam.targetPitch - cam.pitch) * 0.1;
      cam.yaw += (cam.targetYaw - cam.yaw) * 0.1;

      const minAllowedZoom = width < 768 ? 0.52 : Math.max(0.88, width / 2200);
      cam.targetZoom = Math.max(minAllowedZoom, Math.min(2.3, cam.targetZoom));
      cam.targetX = Math.max(580, Math.min(1860, cam.targetX));
      cam.targetY = Math.max(420, Math.min(1240, cam.targetY));

      const sinYaw = Math.sin(cam.yaw);
      const cosYaw = Math.cos(cam.yaw);
      const zFactorBase = (1 - cam.pitch * 0.45) / cam.pitch;

      const elevate = (x: number, y: number, z: number) => {
        const fz = z * zFactorBase;
        return {
          x: x - sinYaw * fz,
          y: y - cosYaw * fz,
        };
      };

      const drawMapLabel = (
        text: string,
        wx: number,
        wy: number,
        wz = 0,
        font = "bold 14px serif",
        color = "rgba(253, 230, 138, 0.48)",
        withBadge = false
      ) => {
        const pt = elevate(wx, wy, wz);
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(-cam.yaw);
        ctx.scale(1, 1 / cam.pitch);
        ctx.font = font;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (withBadge) {
          const tw = ctx.measureText(text).width;
          ctx.fillStyle = "rgba(15, 29, 22, 0.78)";
          ctx.strokeStyle = "rgba(226, 232, 240, 0.28)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(-tw / 2 - 7, -9, tw + 14, 18, 5);
          ctx.fill();
          ctx.stroke();
        }

        ctx.fillStyle = color;
        ctx.fillText(text, 0, 0);
        ctx.restore();
      };

      const drawExtrudedBox = (
        cx: number,
        cy: number,
        w: number,
        d: number,
        zBase: number,
        zTop: number,
        colorTop: string,
        colorFront: string,
        colorSide: string
      ) => {
        const hw = w / 2;
        const hd = d / 2;
        const b1 = elevate(cx - hw, cy - hd, zBase);
        const b2 = elevate(cx + hw, cy - hd, zBase);
        const b3 = elevate(cx + hw, cy + hd, zBase);
        const b4 = elevate(cx - hw, cy + hd, zBase);

        const t1 = elevate(cx - hw, cy - hd, zTop);
        const t2 = elevate(cx + hw, cy - hd, zTop);
        const t3 = elevate(cx + hw, cy + hd, zTop);
        const t4 = elevate(cx - hw, cy + hd, zTop);

        const faces = [
          {
            depth: cosYaw,
            color: colorFront,
            pts: [b4, b3, t3, t4],
          },
          {
            depth: -cosYaw,
            color: colorFront,
            pts: [b1, b2, t2, t1],
          },
          {
            depth: -sinYaw,
            color: colorSide,
            pts: [b2, b3, t3, t2],
          },
          {
            depth: sinYaw,
            color: colorSide,
            pts: [b1, b4, t4, t1],
          },
        ];

        faces
          .sort((a, b) => a.depth - b.depth)
          .forEach((f) => {
            if (f.depth < -0.15) return;
            ctx.fillStyle = f.color;
            ctx.beginPath();
            ctx.moveTo(f.pts[0].x, f.pts[0].y);
            ctx.lineTo(f.pts[1].x, f.pts[1].y);
            ctx.lineTo(f.pts[2].x, f.pts[2].y);
            ctx.lineTo(f.pts[3].x, f.pts[3].y);
            ctx.closePath();
            ctx.fill();
          });

        ctx.fillStyle = colorTop;
        ctx.beginPath();
        ctx.moveTo(t1.x, t1.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.lineTo(t3.x, t3.y);
        ctx.lineTo(t4.x, t4.y);
        ctx.closePath();
        ctx.fill();
      };

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.translate(width / 2, height / 2);
      ctx.scale(cam.zoom, cam.zoom * cam.pitch);
      ctx.rotate(cam.yaw);
      ctx.translate(-cam.x, -cam.y);

      if (groundCacheRef.current) {
        ctx.drawImage(
          groundCacheRef.current,
          BAKE_MIN_X,
          BAKE_MIN_Y,
          BAKE_WIDTH,
          BAKE_HEIGHT
        );
      }

      const centralPeninsula = [
        { x: 935, y: 215 },
        { x: 1590, y: 225 },
        { x: 1540, y: 455 },
        { x: 1340, y: 635 },
        { x: 1155, y: 780 },
        { x: 985, y: 690 },
        { x: 880, y: 465 },
      ];
      ctx.fillStyle = "#273746";
      ctx.beginPath();
      centralPeninsula.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#2b6649";
      ctx.beginPath();
      centralPeninsula.forEach((p, i) => {
        const top = elevate(p.x, p.y, 24);
        if (i === 0) ctx.moveTo(top.x, top.y);
        else ctx.lineTo(top.x, top.y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(167, 243, 208, 0.32)";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      const westMeseta = [
        { x: 420, y: 410 },
        { x: 715, y: 410 },
        { x: 805, y: 680 },
        { x: 925, y: 965 },
        { x: 755, y: 1020 },
        { x: 410, y: 880 },
      ];
      ctx.fillStyle = "#1e3a2f";
      ctx.beginPath();
      westMeseta.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#265940";
      ctx.beginPath();
      westMeseta.forEach((p, i) => {
        const top = elevate(p.x, p.y, 18);
        if (i === 0) ctx.moveTo(top.x, top.y);
        else ctx.lineTo(top.x, top.y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(167, 243, 208, 0.26)";
      ctx.lineWidth = 2;
      ctx.stroke();

      if (!modoReposo) {
        drawMapLabel("EMBALSE ANGOSTURA", 1255, 825, 0, "bold 19px serif");
        drawMapLabel("RÍO HUEQUECURA", 825, 595, 0, "bold 13.5px serif");
        drawMapLabel("RÍO BIOBÍO", 1685, 595, 0, "bold 13.5px serif");
        drawMapLabel("LONCOPANGUE", 1910, 398, 0, "bold 13.5px serif");
        drawMapLabel("PENÍNSULA SAN SEBASTIÁN", 1215, 480, 24, "bold 13.5px serif");
        drawMapLabel("COMUNA DE SANTA BÁRBARA", 650, 1140, 0, "bold 13.5px serif");
        drawMapLabel("COMUNA DE QUILACO", 1365, 1135, 0, "bold 13.5px serif");
      }

      const waveSpots = [
        { x: 810, y: 540 },
        { x: 930, y: 780 },
        { x: 1030, y: 940 },
        { x: 1210, y: 880 },
        { x: 1340, y: 780 },
        { x: 1480, y: 690 },
        { x: 1640, y: 570 },
        { x: 1810, y: 380 },
        { x: 935, y: 1310 },
      ];
      ctx.strokeStyle = "rgba(224, 242, 254, 0.34)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      waveSpots.forEach((ws, i) => {
        const wx = ws.x + Math.sin(time * 1.5 + i) * 14;
        const wy = ws.y + Math.cos(time * 1.1 + i) * 6;
        ctx.moveTo(wx - 22, wy);
        ctx.quadraticCurveTo(wx, wy - 6, wx + 22, wy);
      });
      ctx.stroke();

      const umbrellas = [
        { x: 1555, y: 835 },
        { x: 1595, y: 805 },
        { x: 1625, y: 765 },
        { x: 1370, y: 590 },
      ];
      umbrellas.forEach((u) => {
        const topU = elevate(u.x, u.y, 18);
        ctx.strokeStyle = "#f8fafc";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(u.x, u.y);
        ctx.lineTo(topU.x, topU.y);
        ctx.stroke();

        ctx.save();
        ctx.translate(topU.x, topU.y);
        ctx.rotate(-cam.yaw);
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 11, 0, Math.PI / 2);
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 11, Math.PI, Math.PI * 1.5);
        ctx.fill();
        ctx.restore();
      });

      const kayaks = [
        { baseX: 1245, baseY: 845, phase: 0 },
        { baseX: 1445, baseY: 715, phase: 2.1 },
        { baseX: 965, baseY: 855, phase: 4.2 },
        { baseX: 1795, baseY: 395, phase: 1.4 },
      ];
      kayaks.forEach((k) => {
        const kx = k.baseX + Math.sin(time * 0.8 + k.phase) * 24;
        const ky = k.baseY + Math.cos(time * 0.6 + k.phase) * 10;
        ctx.save();
        ctx.translate(kx, ky);
        ctx.rotate(-0.35 + Math.sin(time + k.phase) * 0.08);
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.ellipse(0, 0, 17, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(0, 0, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      const dikeSegments = [
        { x: 1115, y: 1035 },
        { x: 1175, y: 1002 },
        { x: 1235, y: 974 },
        { x: 1295, y: 952 },
        { x: 1355, y: 936 },
      ];
      dikeSegments.forEach((seg) => {
        drawExtrudedBox(seg.x, seg.y, 64, 24, 0, 34, "#cbd5e1", "#64748b", "#475569");
      });

      const damX = 1045;
      const damY = 1045;

      const drawDamSpillways = () => {
        [-30, 0, 30].forEach((spillX, idx) => {
          const topSpill1 = elevate(damX + spillX - 10, damY + 18, 42);
          const topSpill2 = elevate(damX + spillX + 10, damY + 18, 42);

          ctx.fillStyle = "#7dd3fc";
          ctx.beginPath();
          ctx.moveTo(topSpill1.x, topSpill1.y);
          ctx.lineTo(topSpill2.x, topSpill2.y);
          ctx.lineTo(damX + spillX + 12, damY + 52);
          ctx.lineTo(damX + spillX - 12, damY + 52);
          ctx.closePath();
          ctx.fill();

          const foamR = 13 + Math.sin(time * 3.8 + idx) * 4;
          ctx.fillStyle = "rgba(240, 249, 255, 0.85)";
          ctx.beginPath();
          ctx.arc(damX + spillX, damY + 50, foamR, 0, Math.PI * 2);
          ctx.fill();
        });
      };

      if (cosYaw < 0) drawDamSpillways();

      drawExtrudedBox(damX - 74, damY, 34, 48, 0, 62, "#f1f5f9", "#94a3b8", "#64748b");
      drawExtrudedBox(damX + 74, damY, 34, 48, 0, 62, "#f1f5f9", "#94a3b8", "#64748b");
      drawExtrudedBox(damX, damY, 136, 44, 0, 54, "#e2e8f0", "#94a3b8", "#475569");

      [-45, -15, 15, 45].forEach((offsetX) => {
        drawExtrudedBox(damX + offsetX, damY + 8, 12, 32, 0, 60, "#f8fafc", "#cbd5e1", "#475569");
      });

      if (cosYaw >= 0) drawDamSpillways();

      const bridgeStart = elevate(damX - 85, damY, 61);
      const bridgeEnd = elevate(damX + 85, damY, 61);
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(bridgeStart.x, bridgeStart.y);
      ctx.lineTo(bridgeEnd.x, bridgeEnd.y);
      ctx.stroke();

      drawExtrudedBox(785, 320, 14, 14, 0, 42, "#f59e0b", "#d97706", "#92400e");
      drawExtrudedBox(895, 320, 14, 14, 0, 42, "#f59e0b", "#d97706", "#92400e");
      const suspLeft = elevate(785, 320, 22);
      const suspRight = elevate(895, 320, 22);
      const towerLeft = elevate(785, 320, 42);
      const towerRight = elevate(895, 320, 42);
      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(suspLeft.x, suspLeft.y);
      ctx.lineTo(suspRight.x, suspRight.y);
      ctx.stroke();
      ctx.strokeStyle = "#fef08a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(towerLeft.x, towerLeft.y);
      ctx.quadraticCurveTo(
        (suspLeft.x + suspRight.x) / 2,
        (suspLeft.y + suspRight.y) / 2 + 6 * cosYaw,
        towerRight.x,
        towerRight.y
      );
      ctx.stroke();

      drawExtrudedBox(1665, 515, 16, 16, 0, 32, "#cbd5e1", "#64748b", "#334155");
      drawExtrudedBox(1765, 585, 16, 16, 0, 32, "#cbd5e1", "#64748b", "#334155");
      const bioBridge1 = elevate(1625, 485, 32);
      const bioBridge2 = elevate(1815, 615, 32);
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(bioBridge1.x, bioBridge1.y);
      ctx.lineTo(bioBridge2.x, bioBridge2.y);
      ctx.stroke();

      ctx.save();
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 4.5;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      const sArb = elevate(640, 560, 18);
      const sCop = elevate(695, 765, 18);
      const sMir = elevate(885, 980, 18);
      ctx.moveTo(sArb.x, sArb.y);
      ctx.quadraticCurveTo(650, 670, sCop.x, sCop.y);
      ctx.quadraticCurveTo(775, 890, sMir.x, sMir.y);
      ctx.stroke();
      ctx.restore();

      drawExtrudedBox(1420, 935, 54, 36, 0, 32, "#f59e0b", "#d97706", "#92400e");
      drawExtrudedBox(885, 980, 44, 32, 18, 38, "#b45309", "#78350f", "#451a03");
      drawExtrudedBox(1155, 720, 42, 42, 24, 44, "#f8fafc", "#cbd5e1", "#64748b");
      drawExtrudedBox(1155, 720, 16, 16, 44, 62, "#fbbf24", "#d97706", "#92400e");
      drawExtrudedBox(640, 560, 48, 32, 18, 42, "#7dd3fc", "#38bdf8", "#0284c7");
      drawExtrudedBox(1135, 1270, 62, 42, 0, 18, "#94a3b8", "#64748b", "#334155");
      drawExtrudedBox(1118, 1270, 18, 22, 18, 36, "#38bdf8", "#0284c7", "#0369a1");
      drawExtrudedBox(1152, 1270, 18, 22, 18, 36, "#38bdf8", "#0284c7", "#0369a1");
      drawExtrudedBox(1855, 445, 28, 22, 0, 22, "#ef4444", "#cbd5e1", "#94a3b8");
      drawExtrudedBox(1655, 1085, 48, 34, 0, 30, "#a16207", "#713f12", "#422006");

      const cullRadiusX = (width / cam.zoom) * 0.85 + 280;
      const cullRadiusY = (height / (cam.zoom * cam.pitch)) * 0.85 + 280;

      const rightX = cosYaw;
      const rightY = -sinYaw;

      type RenderQueueItem =
        | { kind: "mountain"; depth: number; m: (typeof MOUNTAINS_3D)[number] }
        | { kind: "tree"; depth: number; t: (typeof SORTED_TREES_3D)[number] };

      const depthQueue: RenderQueueItem[] = [];

      for (let i = 0; i < MOUNTAINS_3D.length; i++) {
        const m = MOUNTAINS_3D[i];
        if (
          Math.abs(m.x - cam.x) > cullRadiusX + m.r ||
          Math.abs(m.y - cam.y) > cullRadiusY + m.r
        ) {
          continue;
        }
        depthQueue.push({
          kind: "mountain",
          depth: m.x * sinYaw + m.y * cosYaw,
          m,
        });
      }

      for (let i = 0; i < SORTED_TREES_3D.length; i++) {
        const t = SORTED_TREES_3D[i];
        if (
          Math.abs(t.x - cam.x) > cullRadiusX ||
          Math.abs(t.y - cam.y) > cullRadiusY
        ) {
          continue;
        }
        depthQueue.push({
          kind: "tree",
          depth: t.x * sinYaw + t.y * cosYaw,
          t,
        });
      }

      depthQueue.sort((a, b) => a.depth - b.depth);

      for (let i = 0; i < depthQueue.length; i++) {
        const item = depthQueue[i];

        if (item.kind === "mountain") {
          const { m } = item;
          const peak = elevate(m.x, m.y, m.h);

          const bN = { x: m.x, y: m.y - m.r * 0.68 };
          const bS = { x: m.x, y: m.y + m.r * 0.72 };
          const bW = { x: m.x - m.r * 0.95, y: m.y + m.r * 0.12 };
          const bE = { x: m.x + m.r * 0.95, y: m.y + m.r * 0.12 };

          const mountainFaces = [
            {
              p1: bW,
              p2: bN,
              color: "#142e24",
              snowColor: "rgba(148, 163, 184, 0.74)",
              depth: -sinYaw * 0.7 - cosYaw * 0.7,
            },
            {
              p1: bN,
              p2: bE,
              color: "#1c3d30",
              snowColor: "rgba(203, 213, 225, 0.8)",
              depth: sinYaw * 0.7 - cosYaw * 0.7,
            },
            {
              p1: bW,
              p2: bS,
              color: "#11261d",
              snowColor: "rgba(148, 163, 184, 0.72)",
              depth: -sinYaw * 0.7 + cosYaw * 0.7,
            },
            {
              p1: bS,
              p2: bE,
              color: "#285741",
              snowColor: "rgba(241, 245, 249, 0.86)",
              depth: sinYaw * 0.7 + cosYaw * 0.7,
            },
          ].sort((a, b) => a.depth - b.depth);

          for (let f = 0; f < mountainFaces.length; f++) {
            const face = mountainFaces[f];
            ctx.fillStyle = face.color;
            ctx.beginPath();
            ctx.moveTo(peak.x, peak.y);
            ctx.lineTo(face.p1.x, face.p1.y);
            ctx.lineTo(face.p2.x, face.p2.y);
            ctx.closePath();
            ctx.fill();

            if (m.h >= 195) {
              const s1x = peak.x + (face.p1.x - peak.x) * 0.35;
              const s1y = peak.y + (face.p1.y - peak.y) * 0.35;
              const s2x = peak.x + (face.p2.x - peak.x) * 0.35;
              const s2y = peak.y + (face.p2.y - peak.y) * 0.35;

              ctx.fillStyle = face.snowColor;
              ctx.beginPath();
              ctx.moveTo(peak.x, peak.y);
              ctx.lineTo(s1x, s1y);
              ctx.lineTo(s2x, s2y);
              ctx.closePath();
              ctx.fill();
            }
          }

          if (m.label && !modoReposo) {
            drawMapLabel(
              `▲ ${m.label}`,
              m.x,
              m.y,
              m.h - 10,
              "bold 11px serif",
              "rgba(241, 245, 249, 0.9)",
              true
            );
          }
        } else {
          const { t } = item;
          const ground = elevate(t.x, t.y, t.baseZ);
          const canopyMid = elevate(t.x, t.y, t.baseZ + t.height * 0.62);
          const canopyPeak = elevate(t.x, t.y, t.baseZ + t.height);
          const trunkTop =
            t.type === "araucaria"
              ? elevate(t.x, t.y, t.baseZ + t.height * 0.88)
              : canopyMid;

          ctx.fillStyle = "rgba(5, 14, 10, 0.38)";
          ctx.beginPath();
          ctx.ellipse(
            ground.x + 5 * rightX,
            ground.y + 5 * rightY,
            t.radius * 0.85,
            t.radius * 0.5,
            -cam.yaw,
            0,
            Math.PI * 2
          );
          ctx.fill();

          ctx.strokeStyle = "#5c2808";
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(ground.x, ground.y);
          ctx.lineTo(trunkTop.x, trunkTop.y);
          ctx.stroke();

          if (t.type === "araucaria") {
            ctx.fillStyle = "#15803d";
            ctx.beginPath();
            ctx.ellipse(
              canopyMid.x,
              canopyMid.y,
              t.radius * 1.15,
              t.radius * 0.5,
              -cam.yaw,
              Math.PI,
              0
            );
            ctx.fill();

            ctx.fillStyle = "#22c55e";
            ctx.beginPath();
            ctx.ellipse(
              canopyPeak.x,
              canopyPeak.y,
              t.radius * 1.4,
              t.radius * 0.65,
              -cam.yaw,
              Math.PI,
              0
            );
            ctx.fill();
          } else {
            ctx.fillStyle = t.colorSide;
            ctx.beginPath();
            ctx.arc(canopyMid.x, canopyMid.y, t.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = t.colorTop;
            ctx.beginPath();
            ctx.arc(canopyPeak.x, canopyPeak.y, t.radius * 0.78, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      if (!modoReposo) {
        const hitosFiltrados = HITOS_ANGOSTURA_MOCK.features
          .filter(
            (f) =>
              categoriaActiva === "Todas" ||
              f.properties.categoria === categoriaActiva
          )
          .map((feature) => {
            const rawPos = projectGeoToCanvas(
              feature.geometry.coordinates[0],
              feature.geometry.coordinates[1]
            );
            return {
              feature,
              rawPos,
              depth: rawPos.x * sinYaw + rawPos.y * cosYaw,
            };
          })
          .sort((a, b) => a.depth - b.depth);

        hitosFiltrados.forEach(({ feature, rawPos }) => {
          const props = feature.properties;

          const baseZ = getTerrainBaseZ(rawPos.x, rawPos.y);
          const groundPos = elevate(rawPos.x, rawPos.y, baseZ);

          const isSelected = hitoSeleccionado?.id_hito === props.id_hito;

          const floatZ =
            baseZ +
            (isSelected ? 116 : 90) +
            Math.sin(time * 2.4 + rawPos.x) * 5;
          const topPos = elevate(rawPos.x, rawPos.y, floatZ);

          const pulseR = (isSelected ? 30 : 24) + Math.sin(time * 2.5) * 4;
          ctx.beginPath();
          ctx.arc(groundPos.x, groundPos.y, pulseR, 0, Math.PI * 2);
          ctx.strokeStyle = isSelected ? "#fef08a" : props.color_hex;
          ctx.lineWidth = isSelected ? 3.5 : 2;
          ctx.globalAlpha = isSelected ? 0.95 : 0.55;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(groundPos.x, groundPos.y, isSelected ? 11 : 8, 0, Math.PI * 2);
          ctx.fillStyle = props.color_hex;
          ctx.fill();
          ctx.globalAlpha = 1;

          ctx.strokeStyle = isSelected ? "#fef08a" : props.color_hex;
          ctx.lineWidth = isSelected ? 4 : 2.5;
          ctx.beginPath();
          ctx.moveTo(groundPos.x, groundPos.y);
          ctx.lineTo(topPos.x, topPos.y);
          ctx.stroke();

          ctx.save();
          ctx.translate(topPos.x, topPos.y);
          ctx.rotate(-cam.yaw);
          ctx.scale(1, 1 / cam.pitch);

          const baseRadius = isSelected ? 32 : 25;

          ctx.fillStyle = isSelected
            ? "rgba(254, 240, 138, 0.28)"
            : "rgba(15, 23, 42, 0.35)";
          ctx.beginPath();
          ctx.arc(0, 0, baseRadius + 7, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = isSelected ? "#fef08a" : "#f59e0b";
          ctx.beginPath();
          ctx.moveTo(0, -baseRadius - 8);
          ctx.lineTo(7, -baseRadius + 2);
          ctx.lineTo(-7, -baseRadius + 2);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
          ctx.fillStyle = "#0f172a";
          ctx.fill();
          ctx.lineWidth = isSelected ? 3.5 : 2.5;
          ctx.strokeStyle = isSelected ? "#fef08a" : props.color_hex;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(0, 0, baseRadius - 5, 0, Math.PI * 2);
          ctx.fillStyle = props.color_hex;
          ctx.fill();

          ctx.font = `${isSelected ? 22 : 17}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(props.icono, 0, 1);

          const labelText = isSelected
            ? props.titulo
            : TOUCH_SHORT_LABELS[props.id_hito] || props.titulo;

          const labelY = -baseRadius - 19;
          ctx.font = isSelected
            ? "bold 12.5px sans-serif"
            : "bold 11px sans-serif";
          const textWidth = ctx.measureText(labelText).width;

          ctx.fillStyle = isSelected
            ? "rgba(15, 23, 42, 0.96)"
            : "rgba(15, 23, 42, 0.86)";
          ctx.strokeStyle = isSelected
            ? "#fef08a"
            : "rgba(245, 158, 11, 0.45)";
          ctx.lineWidth = isSelected ? 2 : 1.2;

          ctx.beginPath();
          ctx.roundRect(
            -textWidth / 2 - 9,
            labelY - 10,
            textWidth + 18,
            20,
            6
          );
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = isSelected ? "#fef08a" : "#f8fafc";
          ctx.fillText(labelText, 0, labelY + 1);

          ctx.restore();
        });
      }

      CLOUDS_3D.forEach((c, idx) => {
        const driftX =
          ((c.x + time * 16 * c.speed) % (WORLD_WIDTH - 400)) + 200;
        const cloudPos = elevate(driftX, c.y, 160);
        ctx.fillStyle = "rgba(226, 232, 240, 0.08)";
        ctx.beginPath();
        ctx.ellipse(
          cloudPos.x,
          cloudPos.y,
          c.w,
          c.h + Math.sin(time + idx) * 6,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      ctx.restore();

      if (modoReposo) {
        const vignette = ctx.createRadialGradient(
          width / 2,
          height / 2,
          Math.min(width, height) * 0.25,
          width / 2,
          height / 2,
          Math.max(width, height) * 0.8
        );
        vignette.addColorStop(0, "rgba(3, 7, 15, 0.18)");
        vignette.addColorStop(1, "rgba(2, 5, 12, 0.85)");
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [modoReposo, categoriaActiva, hitoSeleccionado]);

  const screenToWorld = (clientX: number, clientY: number) => {
    const cam = camRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const sx = (clientX - width / 2) / cam.zoom;
    const sy = (clientY - height / 2) / (cam.zoom * cam.pitch);

    const cos = Math.cos(-cam.yaw);
    const sin = Math.sin(-cam.yaw);

    const worldX = sx * cos - sy * sin + cam.x;
    const worldY = sx * sin + sy * cos + cam.y;
    return { worldX, worldY };
  };

  const buscarHitoEnPuntoTactil = (clientX: number, clientY: number) => {
    if (modoReposo) return null;
    const cam = camRef.current;
    const { worldX, worldY } = screenToWorld(clientX, clientY);

    const hitosVisibles = HITOS_ANGOSTURA_MOCK.features.filter(
      (f) =>
        categoriaActiva === "Todas" ||
        f.properties.categoria === categoriaActiva
    );

    for (const feature of hitosVisibles) {
      const groundPos = projectGeoToCanvas(
        feature.geometry.coordinates[0],
        feature.geometry.coordinates[1]
      );
      const baseZ = getTerrainBaseZ(groundPos.x, groundPos.y);
      const factorZ = ((baseZ + 95) * (1 - cam.pitch * 0.45)) / cam.pitch;

      const topPos = {
        x: groundPos.x - Math.sin(cam.yaw) * factorZ,
        y: groundPos.y - Math.cos(cam.yaw) * factorZ,
      };

      const distTop = Math.hypot(worldX - topPos.x, worldY - topPos.y);
      const distGround = Math.hypot(worldX - groundPos.x, worldY - groundPos.y);

      if (distTop < 58 || distGround < 48) {
        return { feature, groundPos };
      }
    }
    return null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (modoReposo) return;
    registrarActividad();
    camRef.current.isDragging = true;
    camRef.current.pointerMoved = false;
    camRef.current.dragStartX = e.clientX;
    camRef.current.dragStartY = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (modoReposo || pinchDistRef.current !== null) return;
    const cam = camRef.current;

    if (cam.isDragging) {
      registrarActividad();
      const dx = e.clientX - cam.dragStartX;
      const dy = e.clientY - cam.dragStartY;
      if (Math.hypot(dx, dy) > 6) cam.pointerMoved = true;

      const cos = Math.cos(-cam.yaw);
      const sin = Math.sin(-cam.yaw);
      const scaledDx = dx / cam.zoom;
      const scaledDy = dy / (cam.zoom * cam.pitch);

      cam.targetX -= scaledDx * cos - scaledDy * sin;
      cam.targetY -= scaledDx * sin + scaledDy * cos;

      cam.dragStartX = e.clientX;
      cam.dragStartY = e.clientY;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (modoReposo) return;
    registrarActividad();
    const cam = camRef.current;
    cam.isDragging = false;

    if (!cam.pointerMoved && pinchDistRef.current === null) {
      const hit = buscarHitoEnPuntoTactil(e.clientX, e.clientY);
      if (hit) {
        setHitoSeleccionado(hit.feature.properties);
        setIndiceDestacado(0);
        setGaleriaAbierta(false);
        setImagenExpandida(false);
        enfocarCamara(hit.groundPos.x, hit.groundPos.y);
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchDistRef.current = d;
      camRef.current.pointerMoved = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2 && pinchDistRef.current !== null) {
      registrarActividad();
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = d / pinchDistRef.current;
      camRef.current.targetZoom *= ratio;
      pinchDistRef.current = d;
    }
  };

  const handleTouchEnd = () => {
    pinchDistRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (modoReposo) return;
    registrarActividad();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    camRef.current.targetZoom *= zoomFactor;
  };

  const categorias: Array<{ label: CategoriaHito | "Todas"; color: string }> = [
    { label: "Todas", color: "#64748b" },
    { label: "Energética", color: "#3B82F6" },
    { label: "Turística", color: "#F59E0B" },
    { label: "Ecológica", color: "#10B981" },
    { label: "Histórica", color: "#A855F7" },
  ];

  const destacadosActuales = hitoSeleccionado
    ? obtenerDestacadosPorHito(hitoSeleccionado)
    : [];

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-[#132d21] select-none font-sans">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        className="w-full h-full touch-none cursor-default active:cursor-grabbing"
      />

      {/* PORTADA DE REPOSO / ATTRACT MODE */}
      {modoReposo && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-between py-12 md:py-16 px-4 md:px-6 pointer-events-auto animate-in fade-in duration-500">
          <div className="text-center opacity-85">
            <span className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-[#c8aa6e] font-semibold">
              COLBÚN S.A. • CENTRO DE VISITANTES
            </span>
          </div>

          <div className="flex flex-col items-center text-center my-auto px-2">
            <p className="text-[11px] md:text-sm uppercase tracking-[0.34em] text-[#cdbe91] font-semibold mb-2.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
              EXPLORA Y DESCUBRE
            </p>

            <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl font-bold uppercase tracking-[0.12em] text-transparent bg-clip-text bg-gradient-to-b from-[#fffdf7] via-[#f0e6d2] to-[#c8aa6e] drop-shadow-[0_10px_28px_rgba(0,0,0,0.95)] leading-tight">
              ANGOSTURA DEL BIOBÍO
            </h1>

            <div className="flex items-center justify-center w-52 sm:w-72 md:w-96 mt-4 md:mt-5">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#c8aa6e]/80 to-[#c8aa6e]" />
              <div className="w-2.5 h-2.5 rotate-45 border border-[#c8aa6e] bg-[#091322] mx-3 shadow-[0_0_10px_#c8aa6e]" />
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#c8aa6e]/80 to-[#c8aa6e]" />
            </div>
          </div>

          <div className="mb-2 md:mb-4">
            <button
              onClick={iniciarExploracion}
              className="group relative px-8 md:px-10 py-3.5 md:py-4 bg-[#0a111a]/95 hover:bg-[#162231] border-2 border-[#c8aa6e] text-[#f0e6d2] text-xs md:text-base font-bold uppercase tracking-[0.2em] shadow-[0_0_35px_rgba(0,0,0,0.95)] transition-all duration-300 active:scale-95 cursor-pointer rounded-lg"
            >
              COMIENZA A EXPLORAR
            </button>
          </div>
        </div>
      )}

      {/* HUD SUPERIOR Y CONTROLES DE CÁMARA */}
      {!modoReposo && (
        <>
          <header
            className={`absolute top-3 md:top-6 left-3 md:left-6 flex flex-col lg:flex-row lg:items-center justify-between gap-2 md:gap-4 pointer-events-none z-10 transition-all duration-300 ${
              hitoSeleccionado
                ? "right-3 md:right-[440px]"
                : "right-3 md:right-6"
            }`}
          >
            <div className="bg-[#0a111a]/90 backdrop-blur-md border border-[#c8aa6e]/35 px-3.5 py-2 md:px-5 md:py-3 rounded-xl shadow-xl pointer-events-auto flex items-center justify-between">
              <div>
                <p className="text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-[#c8aa6e] font-semibold">
                  Colbún S.A. • Destino Biobío
                </p>
                <h1 className="font-serif text-sm sm:text-base md:text-lg font-bold text-[#f0e6d2] tracking-wider uppercase">
                  Parque Angostura (12 Hitos)
                </h1>
              </div>

              <div className="flex lg:hidden items-center gap-1.5 ml-2">
                <button
                  onClick={restablecerVista}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase bg-slate-800 text-[#c8aa6e] border border-[#c8aa6e]/30"
                >
                  ↺
                </button>
                <button
                  onClick={activarModoReposo}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase bg-slate-950 text-slate-300 border border-slate-700"
                >
                  🌙
                </button>
              </div>
            </div>

            <nav className="flex items-center gap-1.5 bg-[#0a111a]/90 backdrop-blur-md border border-[#c8aa6e]/25 p-1.5 rounded-xl shadow-xl pointer-events-auto overflow-x-auto max-w-full">
              {categorias.map((cat) => {
                const activo = categoriaActiva === cat.label;
                return (
                  <button
                    key={cat.label}
                    onClick={() => {
                      registrarActividad();
                      setCategoriaActiva(cat.label);
                    }}
                    className={`shrink-0 px-3 py-1.5 md:py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                      activo
                        ? "text-white shadow-md scale-105"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                    }`}
                    style={{
                      backgroundColor: activo ? cat.color : "transparent",
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}

              <div className="hidden lg:block h-5 w-[1px] bg-slate-700 mx-1 shrink-0" />

              <button
                onClick={restablecerVista}
                className="hidden lg:inline-flex shrink-0 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-slate-800/90 text-[#f0e6d2] hover:bg-slate-700 border border-[#c8aa6e]/35 transition"
              >
                ↺ Vista General
              </button>

              <button
                onClick={alternarPantallaCompleta}
                className="hidden sm:inline-flex shrink-0 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-slate-800/80 text-slate-200 hover:text-white border border-slate-700 transition"
              >
                ⛶ Pantalla Completa
              </button>

              <button
                onClick={activarModoReposo}
                className="hidden lg:inline-flex shrink-0 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-slate-950/90 text-slate-300 hover:text-[#c8aa6e] border border-slate-800 transition"
              >
                🌙 Portada
              </button>
            </nav>
          </header>

          {/* Controles de Cámara */}
          <div
            className={`absolute bottom-4 md:bottom-6 left-3 md:left-6 flex items-end gap-2 z-10 transition-opacity ${
              hitoSeleccionado ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => {
                  registrarActividad();
                  camRef.current.targetZoom *= 1.2;
                }}
                className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-[#0a111a]/90 hover:bg-slate-800 text-[#f0e6d2] border border-[#c8aa6e]/35 text-xl font-bold shadow-xl flex items-center justify-center"
              >
                +
              </button>
              <button
                onClick={() => {
                  registrarActividad();
                  camRef.current.targetZoom *= 0.8;
                }}
                className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-[#0a111a]/90 hover:bg-slate-800 text-[#f0e6d2] border border-[#c8aa6e]/35 text-xl font-bold shadow-xl flex items-center justify-center"
              >
                −
              </button>
            </div>

            <div className="flex gap-1.5 bg-[#0a111a]/90 p-1.5 rounded-xl border border-[#c8aa6e]/35 shadow-xl">
              <button
                onClick={() => {
                  registrarActividad();
                  camRef.current.targetYaw -= 0.25;
                }}
                className="px-3 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[#c8aa6e] text-xs font-bold"
              >
                ⟲ Girar
              </button>
              <button
                onClick={alternarPerspectiva3D}
                className="px-3.5 py-2.5 rounded-lg bg-[#c8aa6e]/15 hover:bg-[#c8aa6e]/25 text-[#f0e6d2] border border-[#c8aa6e]/40 text-xs font-bold"
              >
                {vista3DActiva ? "3D" : "2D"}
              </button>
              <button
                onClick={() => {
                  registrarActividad();
                  camRef.current.targetYaw += 0.25;
                }}
                className="px-3 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[#c8aa6e] text-xs font-bold"
              >
                Girar ⟳
              </button>
            </div>
          </div>

          {/* =============================================================== */}
          {/* NIVEL 1: PANEL LATERAL EDITORIAL EMPOTRADO (ESTILO NOXUS)       */}
          {/* =============================================================== */}
          {hitoSeleccionado && (
            <aside className="fixed md:absolute bottom-0 md:top-0 right-0 left-0 md:left-auto w-full md:w-[420px] h-[68dvh] md:h-full bg-[#090e16]/95 backdrop-blur-xl border-t-2 md:border-t-0 md:border-l border-[#c8aa6e]/40 text-[#f0e6d2] shadow-[-20px_0_50px_rgba(0,0,0,0.85)] z-20 flex flex-col animate-in slide-in-from-bottom md:slide-in-from-right duration-300">
              {/* Botón de cierre en forma de rombo ("◆ >") con z-30 para que sea 100% clicable */}
              <button
                onClick={cerrarFichaHito}
                title="Cerrar panel lateral"
                className="hidden md:flex absolute -left-[18px] top-8 z-30 w-9 h-9 rotate-45 bg-[#0a111a] hover:bg-[#162231] border border-[#c8aa6e] items-center justify-center shadow-[0_0_18px_rgba(0,0,0,0.95)] cursor-pointer group transition-transform active:scale-90"
              >
                <span className="-rotate-45 text-[#c8aa6e] group-hover:text-white text-xs font-bold pointer-events-none">
                  ❯
                </span>
              </button>

              {/* Contenedor con scroll interno limpio */}
              <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden">
                <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-3 md:hidden" />

                {/* CABECERA HERO CON ARTE DE FONDO Y EMBLEMA */}
                <div
                  className="relative pt-7 pb-6 px-6 border-b border-[#c8aa6e]/20 overflow-hidden"
                  style={{
                    backgroundImage: destacadosActuales[0]?.gradient,
                  }}
                >
                  <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#c8aa6e_1px,transparent_1px)] [background-size:16px_16px]" />

                  <button
                    onClick={cerrarFichaHito}
                    className="md:hidden absolute top-3 right-4 w-8 h-8 rounded-full bg-slate-900/80 border border-[#c8aa6e]/40 text-[#c8aa6e] flex items-center justify-center text-sm font-bold"
                  >
                    ✕
                  </button>

                  <div className="relative flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center border-2 border-[#c8aa6e] bg-[#0a111a] shadow-[0_0_20px_rgba(200,170,110,0.35)] text-2xl"
                      style={{
                        boxShadow: `0 0 22px ${hitoSeleccionado.color_hex}55`,
                      }}
                    >
                      {hitoSeleccionado.icono}
                    </div>

                    <div>
                      <h2 className="font-serif text-xl md:text-2xl font-bold uppercase tracking-[0.08em] text-[#fffdf7] leading-tight">
                        {hitoSeleccionado.titulo}
                      </h2>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[#c8aa6e] font-semibold mt-1">
                        {hitoSeleccionado.categoria} • SECTOR{" "}
                        {hitoSeleccionado.sector}
                      </p>
                    </div>
                  </div>

                  {/* Fila de accesos rápidos del hito */}
                  <div className="relative flex items-center gap-2 mt-5 pt-4 border-t border-[#c8aa6e]/15">
                    {[
                      { icon: "📸", label: "Galería" },
                      { icon: "🎧", label: "Audioguía" },
                      { icon: "🧭", label: "GPS" },
                      { icon: "🌿", label: "Flora" },
                      { icon: "♿", label: "Acceso" },
                    ].map((badge, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          registrarActividad();
                          setIndiceDestacado(idx % 3);
                          setImagenExpandida(false);
                          setGaleriaAbierta(true);
                        }}
                        className="flex-1 py-1.5 px-2 bg-[#0a111a]/85 hover:bg-[#162231] border border-[#c8aa6e]/30 rounded flex flex-col items-center justify-center transition cursor-pointer"
                        title={`Ver ${badge.label}`}
                      >
                        <span className="text-sm">{badge.icon}</span>
                        <span className="text-[9px] uppercase tracking-wider text-[#cdbe91] mt-0.5">
                          {badge.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CUADRÍCULA 2x2 DE METADATOS TÉCNICOS */}
                <div className="px-6 py-5">
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 rotate-45 border border-[#c8aa6e]/60" />
                    <div className="h-[1px] flex-1 bg-[#c8aa6e]/25" />
                    <div className="w-1.5 h-1.5 rotate-45 border border-[#c8aa6e]/60" />
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-4 py-4">
                    <div>
                      <span className="text-[11px] text-slate-400 block">
                        Sector Territorial:
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#f0e6d2]">
                        {hitoSeleccionado.sector}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block">
                        Categoría de Hito:
                      </span>
                      <span
                        className="text-xs font-bold uppercase tracking-wider block"
                        style={{ color: hitoSeleccionado.color_hex }}
                      >
                        {hitoSeleccionado.categoria}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block">
                        Horario de Acceso:
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#f0e6d2]">
                        {hitoSeleccionado.horario_acceso}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block">
                        Estado de Ruta:
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Habilitado Todo el Año
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 rotate-45 border border-[#c8aa6e]/60" />
                    <div className="h-[1px] flex-1 bg-[#c8aa6e]/25" />
                    <div className="w-1.5 h-1.5 rotate-45 border border-[#c8aa6e]/60" />
                  </div>
                </div>

                {/* RELATO EDITORIAL PRINCIPAL + BOTÓN DE GALERÍA */}
                <div className="px-6 pb-5">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#c8aa6e] font-semibold mb-2">
                    {hitoSeleccionado.descripcion_corta}
                  </p>

                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    {hitoSeleccionado.contenido_didactico}
                  </p>

                  <div className="bg-[#0f1724] border border-[#c8aa6e]/30 rounded-lg p-3 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => registrarActividad()}
                        className="w-9 h-9 rounded bg-[#c8aa6e] hover:bg-[#d8bc82] text-[#090e16] flex items-center justify-center font-bold cursor-pointer transition"
                      >
                        ▶
                      </button>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#f0e6d2]">
                          Audioguía de Sala
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Relato inmersivo • Español
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#c8aa6e] border border-[#c8aa6e]/40 px-2 py-0.5 rounded">
                      MP3
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      registrarActividad();
                      setIndiceDestacado(0);
                      setImagenExpandida(false);
                      setGaleriaAbierta(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] text-sky-400 hover:text-sky-300 transition cursor-pointer"
                  >
                    <span>Explorar galería e historia de este hito</span>
                    <span>↗</span>
                  </button>
                </div>

                {/* SECCIÓN: CONTENIDO DESTACADO EN EL HITO */}
                <div className="px-6 pb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-1.5 h-1.5 rotate-45 border border-[#c8aa6e]/60" />
                    <div className="h-[1px] flex-1 bg-[#c8aa6e]/25" />
                    <div className="w-1.5 h-1.5 rotate-45 border border-[#c8aa6e]/60" />
                  </div>

                  <h3 className="font-serif text-xs font-bold uppercase tracking-[0.2em] text-[#f0e6d2] mb-3.5">
                    CONTENIDO DESTACADO EN{" "}
                    {TOUCH_SHORT_LABELS[
                      hitoSeleccionado.id_hito
                    ]?.toUpperCase() || "ESTE HITO"}
                  </h3>

                  <div className="flex flex-col gap-3">
                    {destacadosActuales.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          registrarActividad();
                          setIndiceDestacado(idx);
                          setImagenExpandida(false);
                          setGaleriaAbierta(true);
                        }}
                        className="group relative h-24 w-full rounded border border-[#c8aa6e]/30 hover:border-[#c8aa6e] overflow-hidden text-left p-4 flex flex-col justify-end transition-all duration-300 cursor-pointer shadow-lg"
                        style={{
                          backgroundImage: item.gradient,
                        }}
                      >
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-5xl opacity-20 group-hover:opacity-35 group-hover:scale-110 transition-all duration-300 pointer-events-none">
                          {idx === 0
                            ? hitoSeleccionado.icono
                            : idx === 1
                            ? "🌲"
                            : "🏔️"}
                        </div>

                        <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#c8aa6e] mb-0.5">
                          {item.numero}
                        </span>
                        <p className="font-serif text-sm font-bold uppercase tracking-[0.1em] text-white group-hover:text-[#fef08a] transition">
                          {item.titulo}
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-300">
                          {item.subtitulo}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* =============================================================== */}
          {/* NIVEL 2: VISOR MULTIMEDIA EXPANDIDO (ESTILO GALERÍA 01 / 03)    */}
          {/* =============================================================== */}
          {hitoSeleccionado && galeriaAbierta && (
            <div className="fixed inset-0 z-40 bg-[#060a10]/95 backdrop-blur-xl flex flex-col justify-between p-6 md:p-12 overflow-y-auto animate-in fade-in duration-300">
              {/* Barra superior del visor */}
              <div className="flex items-center justify-between border-b border-[#c8aa6e]/25 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{hitoSeleccionado.icono}</span>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-[#c8aa6e] font-semibold">
                      ARCHIVO TERRITORIAL • {hitoSeleccionado.sector}
                    </p>
                    <h2 className="font-serif text-lg md:text-xl font-bold uppercase tracking-[0.12em] text-[#f0e6d2]">
                      {hitoSeleccionado.titulo}
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => {
                    registrarActividad();
                    setGaleriaAbierta(false);
                    setImagenExpandida(false);
                  }}
                  className="w-10 h-10 rounded-full bg-[#0a111a] hover:bg-[#162231] border border-[#c8aa6e] text-[#c8aa6e] hover:text-white flex items-center justify-center text-base font-bold cursor-pointer transition"
                  title="Volver al mapa"
                >
                  ✕
                </button>
              </div>

              {/* Cuerpo principal del visor */}
              <div className="my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl mx-auto w-full transition-all duration-300">
                <div
                  className={`${
                    imagenExpandida ? "lg:col-span-12" : "lg:col-span-8"
                  } relative aspect-video w-full rounded border border-[#c8aa6e]/40 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col justify-between p-6 md:p-8 transition-all duration-300`}
                  style={{
                    backgroundImage:
                      destacadosActuales[indiceDestacado]?.gradient,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded bg-black/60 border border-[#c8aa6e]/40 text-[10px] uppercase tracking-[0.25em] text-[#c8aa6e] font-bold">
                      LÁMINA {destacadosActuales[indiceDestacado]?.numero}
                    </span>
                    <span className="text-xs text-slate-300/80 font-mono">
                      {hitoSeleccionado.id_hito.toUpperCase()} • PARQUE ANGOSTURA
                    </span>
                  </div>

                  {/* Ilustración / Placeholder central para fotografías HD */}
                  <div className="my-auto flex flex-col items-center justify-center text-center py-8">
                    <div
                      className={`${
                        imagenExpandida ? "w-32 h-32 text-6xl" : "w-24 h-24 text-5xl"
                      } rounded-full border-2 border-[#c8aa6e]/60 bg-[#0a111a]/80 flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(200,170,110,0.3)] transition-all`}
                    >
                      {indiceDestacado === 0
                        ? hitoSeleccionado.icono
                        : indiceDestacado === 1
                        ? "🌲"
                        : "🏔️"}
                    </div>
                    <p className="font-serif text-lg md:text-2xl font-bold uppercase tracking-[0.16em] text-[#fffdf7]">
                      {destacadosActuales[indiceDestacado]?.titulo}
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#c8aa6e] mt-1">
                      Espacio preparado para fotografía HD (
                      {destacadosActuales[indiceDestacado]?.imageUrl})
                    </p>
                  </div>

                  {/* Barra inferior de la foto */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {destacadosActuales.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            registrarActividad();
                            setIndiceDestacado(idx);
                          }}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            indiceDestacado === idx
                              ? "w-8 bg-[#c8aa6e]"
                              : "w-2 bg-slate-600 hover:bg-slate-400"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        registrarActividad();
                        setImagenExpandida((prev) => !prev);
                      }}
                      className="px-3 py-1.5 rounded bg-black/75 hover:bg-[#162231] border border-[#c8aa6e]/50 text-[#f0e6d2] flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer transition"
                      title={
                        imagenExpandida
                          ? "Mostrar columna de texto"
                          : "Ampliar fotografía sin texto"
                      }
                    >
                      <span>{imagenExpandida ? "🗗" : "⛶"}</span>
                      <span>
                        {imagenExpandida ? "Ver con texto" : "Ampliar foto"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Columna Editorial Derecha */}
                {!imagenExpandida && (
                  <div className="lg:col-span-4 flex flex-col justify-center animate-in fade-in duration-200">
                    <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#c8aa6e] mb-2">
                      {destacadosActuales[indiceDestacado]?.numero}
                    </span>

                    <h3 className="font-serif text-2xl md:text-3xl font-bold uppercase tracking-[0.08em] text-white leading-tight">
                      {destacadosActuales[indiceDestacado]?.titulo}
                    </h3>

                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#c8aa6e] font-semibold mt-1 mb-5">
                      {destacadosActuales[indiceDestacado]?.subtitulo}
                    </p>

                    <div className="h-[1px] w-16 bg-[#c8aa6e]/50 mb-5" />

                    <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-8">
                      {destacadosActuales[indiceDestacado]?.relato}
                    </p>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          registrarActividad();
                          setIndiceDestacado(
                            (prev) =>
                              (prev - 1 + destacadosActuales.length) %
                              destacadosActuales.length
                          );
                        }}
                        className="px-4 py-2.5 rounded bg-[#0a111a] hover:bg-[#162231] border border-[#c8aa6e]/50 text-xs font-bold uppercase tracking-widest text-[#f0e6d2] cursor-pointer transition"
                      >
                        ← Anterior
                      </button>

                      <button
                        onClick={() => {
                          registrarActividad();
                          setIndiceDestacado(
                            (prev) => (prev + 1) % destacadosActuales.length
                          );
                        }}
                        className="px-5 py-2.5 rounded bg-[#c8aa6e] hover:bg-[#d8bc82] text-xs font-bold uppercase tracking-widest text-[#090e16] cursor-pointer transition"
                      >
                        Siguiente Lámina →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Miniaturas inferiores */}
              <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto w-full pt-4 border-t border-[#c8aa6e]/20">
                {destacadosActuales.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      registrarActividad();
                      setIndiceDestacado(idx);
                    }}
                    className={`p-3 rounded border text-left transition cursor-pointer ${
                      indiceDestacado === idx
                        ? "bg-[#162231] border-[#c8aa6e]"
                        : "bg-[#0a111a]/60 border-slate-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <span className="text-[10px] font-bold text-[#c8aa6e] block">
                      {item.numero}
                    </span>
                    <span className="font-serif text-xs font-bold uppercase text-white line-clamp-1">
                      {item.titulo}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}