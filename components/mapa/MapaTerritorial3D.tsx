"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarraCategorias,
  BotonesSala,
  type CategoriaHub
} from "@/components/hub/BarraCategorias";
import { CapaReposo } from "@/components/hub/CapaReposo";
import { ControlesCamara } from "@/components/hub/ControlesCamara";
import { FichaHito } from "@/components/hub/FichaHito";
import { QrSala } from "@/components/hub/QrSala";
import {
  HITOS_ANGOSTURA_MOCK,
  type HitoFeature,
  type HitoGeoJSON
} from "@/data/hitosAngostura";

const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 1600;
const INACTIVITY_LIMIT_MS = 180000; // 3 minutos (180 s) para quiosco de sala

// Nombres cortos de 1 a 2 palabras optimizados para pantalla táctil
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

// Verifica si un punto cae dentro de los cauces extendidos o zonas de edificios
function isInsideWaterOrStructures(x: number, y: number): boolean {
  // 1. Brazo Izquierdo extendido: Río Huequecura
  if (distToSegment(x, y, 680, -500, 845, 200) < 90) return true;
  if (distToSegment(x, y, 845, 200, 790, 440) < 95) return true;
  if (distToSegment(x, y, 790, 440, 895, 710) < 105) return true;
  if (distToSegment(x, y, 895, 710, 1045, 1040) < 135) return true;

  // 2. Brazo Derecho extendido: Río Biobío y Lóbulo Loncopangue
  if (distToSegment(x, y, 2550, -350, 1950, 240) < 140) return true;
  if (distToSegment(x, y, 1950, 240, 1790, 430) < 145) return true;
  if (distToSegment(x, y, 1790, 430, 1690, 535) < 110) return true;
  if (distToSegment(x, y, 1690, 535, 1390, 775) < 175) return true;
  if (distToSegment(x, y, 1390, 775, 1045, 1040) < 170) return true;

  // 3. Río Biobío Aguas Abajo extendido hacia el sur
  if (distToSegment(x, y, 1045, 1040, 915, 1395) < 115) return true;
  if (distToSegment(x, y, 915, 1395, 760, 2100) < 115) return true;

  // 4. Quebrada del Río Lirquén extendida
  if (distToSegment(x, y, 2450, 720, 1890, 1060) < 52) return true;
  if (distToSegment(x, y, 1890, 1060, 1220, 1950) < 52) return true;

  const clearZones = [
    { x: 1420, y: 935, r: 65 },
    { x: 1045, y: 1045, r: 95 },
    { x: 1155, y: 720, r: 55 },
    { x: 1355, y: 575, r: 65 },
    { x: 1585, y: 805, r: 80 },
    { x: 1135, y: 1270, r: 75 },
    { x: 1655, y: 1085, r: 65 },
    { x: 1855, y: 455, r: 65 },
  ];
  for (const cz of clearZones) {
    if (Math.hypot(x - cz.x, y - cz.y) < cz.r) return true;
  }

  return false;
}

function getTerrainBaseZ(x: number, y: number): number {
  if (x >= 910 && x <= 1580 && y >= 240 && y <= 775) {
    const dHueq = distToSegment(x, y, 845, 220, 1020, 950);
    const dBio = distToSegment(x, y, 1880, 290, 1060, 980);
    if (dHueq > 75 && dBio > 105) return 24;
  }
  if (x >= 470 && x <= 920 && y >= 390 && y <= 1020) {
    const dHueq = distToSegment(x, y, 790, 420, 1045, 1040);
    if (dHueq > 80) return 18;
  }
  if (x >= 1760 && x <= 2020 && y >= 620 && y <= 1120) {
    return 16;
  }
  return 0;
}

// Malla de triángulos Low Poly pre-calculada para cubrir todo el fondo sin bordes negros
const LOW_POLY_BG_TILES: Array<{
  pts: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }];
  color: string;
}> = [];

(() => {
  const cols = 16;
  const rows = 12;
  const startX = -900;
  const startY = -700;
  const stepX = 265;
  const stepY = 250;
  const palette = ["#183b2b", "#1c4331", "#153325", "#1f4935", "#132d21", "#22503a"];

  const grid: Array<Array<{ x: number; y: number }>> = [];
  for (let r = 0; r <= rows; r++) {
    const rowPts: Array<{ x: number; y: number }> = [];
    for (let c = 0; c <= cols; c++) {
      const jitterX = Math.sin(r * 7.3 + c * 13.1) * 48;
      const jitterY = Math.cos(r * 11.7 + c * 5.9) * 42;
      rowPts.push({
        x: startX + c * stepX + jitterX,
        y: startY + r * stepY + jitterY,
      });
    }
    grid.push(rowPts);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const p00 = grid[r][c];
      const p10 = grid[r][c + 1];
      const p01 = grid[r + 1][c];
      const p11 = grid[r + 1][c + 1];

      LOW_POLY_BG_TILES.push({
        pts: [p00, p10, p11],
        color: palette[(r * 3 + c * 5) % palette.length],
      });
      LOW_POLY_BG_TILES.push({
        pts: [p00, p11, p01],
        color: palette[(r * 7 + c * 2 + 1) % palette.length],
      });
    }
  }
})();

// Árboles distribuidos por toda la cuenca y el perímetro extendido
const TREES_3D = Array.from({ length: 340 }, (_, i) => {
  const x = -150 + ((i * 211) % 2750);
  const y = -100 + ((i * 293) % 1850);
  return {
    x,
    y,
    radius: 11 + (i % 9),
    height: 25 + (i % 20),
    type: i % 4 === 0 ? "araucaria" : "nativo",
    colorTop: i % 3 === 0 ? "#22c55e" : i % 2 === 0 ? "#16a34a" : "#15803d",
    colorSide: "#14532d",
  };
}).filter((t) => !isInsideWaterOrStructures(t.x, t.y));

// Cordones montañosos Low Poly (Anillo interior + Anillo exterior para cubrir toda la pantalla)
const MOUNTAINS_3D: Array<{
  x: number;
  y: number;
  r: number;
  h: number;
  label?: string;
}> = [
  // Anillo exterior lejano (cubre las esquinas de la pantalla al rotar o alejar)
  { x: -120, y: 120, r: 310, h: 260 },
  { x: 220, y: -90, r: 290, h: 245 },
  { x: 1180, y: -110, r: 320, h: 275 },
  { x: 1620, y: -80, r: 290, h: 255 },
  { x: 2420, y: 180, r: 320, h: 270 },
  { x: 2520, y: 680, r: 310, h: 250 },
  { x: 2460, y: 1180, r: 300, h: 235 },
  { x: 2180, y: 1580, r: 290, h: 220 },
  { x: 1580, y: 1680, r: 280, h: 205 },
  { x: 320, y: 1620, r: 290, h: 210 },
  { x: -140, y: 1180, r: 300, h: 225 },
  { x: -180, y: 640, r: 290, h: 230 },

  // Anillo principal de la Cuenca de Angostura
  { x: 460, y: 290, r: 215, h: 195, label: "QUILLAILEO" },
  { x: 640, y: 210, r: 195, h: 215 },
  { x: 1120, y: 190, r: 240, h: 235, label: "LAS QUINIENTAS" },
  { x: 1440, y: 200, r: 255, h: 250 },
  { x: 1710, y: 210, r: 200, h: 215, label: "SALTOS DE NEWENKO" },
  { x: 2055, y: 490, r: 255, h: 245, label: "CERRO VAQUECHA" },
  { x: 2075, y: 835, r: 250, h: 230, label: "CERRO EL TREN" },
  { x: 1920, y: 1250, r: 245, h: 200 },
  { x: 1560, y: 1385, r: 220, h: 175, label: "CERRO EL PADRE" },
  { x: 520, y: 1320, r: 220, h: 170 },
  { x: 310, y: 720, r: 225, h: 185 },
];

const CLOUDS_3D = [
  { x: 550, y: 460, w: 340, h: 110, speed: 0.22 },
  { x: 1520, y: 390, w: 380, h: 125, speed: 0.16 },
  { x: 1120, y: 1080, w: 350, h: 110, speed: 0.2 },
  { x: 1880, y: 820, w: 310, h: 95, speed: 0.18 },
];

type MapaTerritorialProps = {
  /** Catálogo de hitos; admite alimentación desde la API de sala. */
  hitos?: HitoGeoJSON;
  /** Ruta destino del QR de sala (el mapa geográfico para el celular). */
  rutaQR?: string;
};

export default function MapaTerritorial3D({
  hitos = HITOS_ANGOSTURA_MOCK,
  rutaQR = "/mapa"
}: MapaTerritorialProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [modoReposo, setModoReposo] = useState<boolean>(true);
  const [categoriaActiva, setCategoriaActiva] = useState<string>("Todas");
  const [hitoSeleccionado, setHitoSeleccionado] = useState<HitoFeature["properties"] | null>(null);
  const [vista3DActiva, setVista3DActiva] = useState<boolean>(true);

  const lastInteractionRef = useRef<number>(0);

  // Cámara calibrada más cerca (Zoom 1.08 en portada / 1.24 en mapa) para llenar toda la pantalla
  const camRef = useRef({
    x: 1220,
    y: 790,
    zoom: 1.08,
    pitch: 0.64,
    yaw: -0.1,
    targetX: 1220,
    targetY: 790,
    targetZoom: 1.08,
    targetPitch: 0.64,
    targetYaw: -0.1,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    pointerMoved: false,
  });

  const registrarActividad = useCallback(() => {
    lastInteractionRef.current = Date.now();
  }, []);

  const activarModoReposo = useCallback(() => {
    setModoReposo(true);
    setHitoSeleccionado(null);
    setCategoriaActiva("Todas");
    camRef.current.targetX = 1220;
    camRef.current.targetY = 790;
    camRef.current.targetZoom = 1.08;
    camRef.current.targetPitch = 0.64;
    camRef.current.targetYaw = -0.1;
    setVista3DActiva(true);
  }, []);

  const iniciarExploracion = useCallback(() => {
    registrarActividad();
    setModoReposo(false);
    camRef.current.targetX = 1220;
    camRef.current.targetY = 800;
    camRef.current.targetZoom = 1.24;
    camRef.current.targetPitch = 0.62;
    camRef.current.targetYaw = -0.1;
  }, [registrarActividad]);

  const enfocarCamara = useCallback(
    (x: number, y: number, zoom = 1.52, pitch = 0.56) => {
      registrarActividad();
      camRef.current.targetX = x;
      camRef.current.targetY = y;
      camRef.current.targetZoom = zoom;
      camRef.current.targetPitch = pitch;
    },
    [registrarActividad]
  );

  const restablecerVista = useCallback(() => {
    registrarActividad();
    setHitoSeleccionado(null);
    setCategoriaActiva("Todas");
    camRef.current.targetX = 1220;
    camRef.current.targetY = 800;
    camRef.current.targetZoom = 1.24;
    camRef.current.targetPitch = 0.62;
    camRef.current.targetYaw = -0.1;
    setVista3DActiva(true);
  }, [registrarActividad]);

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
  }, []);

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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const render = () => {
      time += 0.025;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const cam = camRef.current;

      if (modoReposo) {
        cam.targetYaw = -0.1 + Math.sin(time * 0.12) * 0.06;
      }

      cam.x += (cam.targetX - cam.x) * 0.08;
      cam.y += (cam.targetY - cam.y) * 0.08;
      cam.zoom += (cam.targetZoom - cam.zoom) * 0.08;
      cam.pitch += (cam.targetPitch - cam.pitch) * 0.08;
      cam.yaw += (cam.targetYaw - cam.yaw) * 0.08;

      // Límites de cámara ajustados para que jamás se salga de la zona con terreno Low Poly
      const minAllowedZoom = Math.max(0.96, width / 2100);
      cam.targetZoom = Math.max(minAllowedZoom, Math.min(2.4, cam.targetZoom));
      cam.targetX = Math.max(680, Math.min(1780, cam.targetX));
      cam.targetY = Math.max(460, Math.min(1160, cam.targetY));

      const elevate = (x: number, y: number, z: number) => {
        const factorZ = (z * (1 - cam.pitch * 0.45)) / cam.pitch;
        return {
          x: x - Math.sin(cam.yaw) * factorZ,
          y: y - Math.cos(cam.yaw) * factorZ,
        };
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
        const b1 = elevate(cx - w / 2, cy - d / 2, zBase);
        const b2 = elevate(cx + w / 2, cy - d / 2, zBase);
        const b3 = elevate(cx + w / 2, cy + d / 2, zBase);
        const b4 = elevate(cx - w / 2, cy + d / 2, zBase);

        const t1 = elevate(cx - w / 2, cy - d / 2, zTop);
        const t2 = elevate(cx + w / 2, cy - d / 2, zTop);
        const t3 = elevate(cx + w / 2, cy + d / 2, zTop);
        const t4 = elevate(cx - w / 2, cy + d / 2, zTop);

        ctx.fillStyle = colorSide;
        ctx.beginPath();
        ctx.moveTo(b1.x, b1.y);
        ctx.lineTo(b4.x, b4.y);
        ctx.lineTo(t4.x, t4.y);
        ctx.lineTo(t1.x, t1.y);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = colorFront;
        ctx.beginPath();
        ctx.moveTo(b4.x, b4.y);
        ctx.lineTo(b3.x, b3.y);
        ctx.lineTo(t3.x, t3.y);
        ctx.lineTo(t4.x, t4.y);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = colorSide;
        ctx.beginPath();
        ctx.moveTo(b2.x, b2.y);
        ctx.lineTo(b3.x, b3.y);
        ctx.lineTo(t3.x, t3.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = colorTop;
        ctx.beginPath();
        ctx.moveTo(t1.x, t1.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.lineTo(t3.x, t3.y);
        ctx.lineTo(t4.x, t4.y);
        ctx.closePath();
        ctx.fill();
      };

      // 1. Fondo base verde bosque profundo (CERO fondo negro)
      ctx.save();
      ctx.setTransform(
        window.devicePixelRatio || 1,
        0,
        0,
        window.devicePixelRatio || 1,
        0,
        0
      );
      ctx.fillStyle = "#132d21";
      ctx.fillRect(0, 0, width, height);

      // Transformación de cámara
      ctx.translate(width / 2, height / 2);
      ctx.scale(cam.zoom, cam.zoom * cam.pitch);
      ctx.rotate(cam.yaw);
      ctx.translate(-cam.x, -cam.y);

      // =========================================================
      // CAPA 1: TERRENO LOW POLY CONTINUO EN TODA LA PANTALLA
      // =========================================================
      LOW_POLY_BG_TILES.forEach((tile) => {
        ctx.fillStyle = tile.color;
        ctx.strokeStyle = "rgba(110, 231, 183, 0.06)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tile.pts[0].x, tile.pts[0].y);
        ctx.lineTo(tile.pts[1].x, tile.pts[1].y);
        ctx.lineTo(tile.pts[2].x, tile.pts[2].y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      // Resplandor esmeralda suave en el corazón de la cuenca
      const valleyGlow = ctx.createRadialGradient(1220, 780, 120, 1220, 780, 1350);
      valleyGlow.addColorStop(0, "rgba(40, 94, 68, 0.85)");
      valleyGlow.addColorStop(0.6, "rgba(28, 67, 49, 0.45)");
      valleyGlow.addColorStop(1, "rgba(17, 41, 30, 0)");
      ctx.fillStyle = valleyGlow;
      ctx.fillRect(-800, -600, 4000, 3000);

      // Parcelas Agrícolas Low Poly (Potreros de Quilaco, Santa Bárbara y Loncopangue)
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
        {
          pts: [
            { x: 260, y: 980 },
            { x: 510, y: 940 },
            { x: 540, y: 1140 },
            { x: 280, y: 1180 },
          ],
          color: "rgba(132, 169, 92, 0.2)",
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

      // =========================================================
      // MESETAS EN RELIEVE 3D
      // =========================================================
      // Península Central (San Sebastián)
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

      // Meseta Occidental (Arboretum / Sendero Huequecura)
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

      // =========================================================
      // CAPA 2: BAHÍAS DE PLAYA DE ARENA DORADA
      // =========================================================
      ctx.save();
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

      // Playa Los Notros redondeada
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.moveTo(1315, 640);
      ctx.bezierCurveTo(1345, 590, 1395, 545, 1450, 530);
      ctx.bezierCurveTo(1475, 565, 1460, 620, 1410, 655);
      ctx.bezierCurveTo(1370, 675, 1330, 665, 1315, 640);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(254, 240, 138, 0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // =========================================================
      // CAPA 3: RÍOS EXTENDIDOS HASTA FUERA DE LA PANTALLA
      // =========================================================
      ctx.save();
      // Cañón de roca aguas abajo extendido
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

      ctx.shadowColor = "rgba(14, 165, 233, 0.42)";
      ctx.shadowBlur = 22;
      ctx.fillStyle = waterGrad;

      // 1) Río Huequecura (Desde fuera de cámara al Norte Y=-600 hasta la Presa)
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

      // 2) Río Biobío y Lóbulo Loncopangue (Desde fuera de cámara al Noreste X=2650, Y=-450 hasta la Presa)
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

      // 3) Río Biobío Aguas Abajo (Se extiende hasta Y=2100 fuera del borde inferior)
      ctx.beginPath();
      ctx.moveTo(995, 1055);
      ctx.bezierCurveTo(945, 1220, 825, 1580, 700, 2100);
      ctx.lineTo(835, 2100);
      ctx.bezierCurveTo(965, 1580, 1055, 1220, 1090, 1055);
      ctx.closePath();
      ctx.fill();

      // 4) Río Lirquén extendido en el cuadrante sureste
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

      // Isla Fluvial en el cañón del Biobío aguas abajo
      ctx.save();
      ctx.fillStyle = "#fde68a";
      ctx.beginPath();
      ctx.ellipse(968, 1235, 20, 58, 0.26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1f4e37";
      ctx.beginPath();
      ctx.ellipse(968, 1235, 13, 44, 0.26, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Ondas de agua animadas
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
      waveSpots.forEach((ws, i) => {
        const wx = ws.x + Math.sin(time * 1.5 + i) * 14;
        const wy = ws.y + Math.cos(time * 1.1 + i) * 6;
        ctx.beginPath();
        ctx.moveTo(wx - 22, wy);
        ctx.quadraticCurveTo(wx, wy - 6, wx + 22, wy);
        ctx.stroke();
      });

      // =========================================================
      // CAPA 4: PLAYAS, MUELLES Y KAYAKS
      // =========================================================
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
      ctx.translate(1415, 595);
      ctx.rotate(0.65);
      ctx.fillStyle = "#78350f";
      ctx.strokeStyle = "#fcd34d";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-8, -28, 16, 56, 3);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      const umbrellas = [
        { x: 1555, y: 835 },
        { x: 1595, y: 805 },
        { x: 1625, y: 765 },
        { x: 1370, y: 590 },
      ];
      umbrellas.forEach((u) => {
        const topU = elevate(u.x, u.y, 18);
        ctx.fillStyle = "rgba(120, 53, 15, 0.35)";
        ctx.beginPath();
        ctx.ellipse(u.x + 5, u.y + 3, 12, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#f8fafc";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(u.x, u.y);
        ctx.lineTo(topU.x, topU.y);
        ctx.stroke();

        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(topU.x, topU.y, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(topU.x, topU.y);
        ctx.arc(topU.x, topU.y, 11, 0, Math.PI / 2);
        ctx.moveTo(topU.x, topU.y);
        ctx.arc(topU.x, topU.y, 11, Math.PI, Math.PI * 1.5);
        ctx.fill();
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
        ctx.strokeStyle = "rgba(224, 242, 254, 0.55)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-24, -5);
        ctx.lineTo(-12, 0);
        ctx.lineTo(-24, 5);
        ctx.stroke();

        ctx.fillStyle = "#facc15";
        ctx.strokeStyle = "#ca8a04";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 17, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(0, 0, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-5, -10);
        ctx.lineTo(5, 10);
        ctx.stroke();
        ctx.restore();
      });

      // =========================================================
      // CAPA 5: CENTRAL ANGOSTURA, PRETIL, PUENTES Y TORRES 3D
      // =========================================================
      const dikeSegments = [
        { x: 1115, y: 1035 },
        { x: 1175, y: 1002 },
        { x: 1235, y: 974 },
        { x: 1295, y: 952 },
        { x: 1355, y: 936 },
      ];
      dikeSegments.forEach((seg) => {
        drawExtrudedBox(
          seg.x,
          seg.y,
          64,
          24,
          0,
          34,
          "#cbd5e1",
          "#64748b",
          "#475569"
        );
      });

      const damX = 1045;
      const damY = 1045;

      drawExtrudedBox(damX - 74, damY, 34, 48, 0, 62, "#f1f5f9", "#94a3b8", "#64748b");
      drawExtrudedBox(damX + 74, damY, 34, 48, 0, 62, "#f1f5f9", "#94a3b8", "#64748b");
      drawExtrudedBox(damX, damY, 136, 44, 0, 54, "#e2e8f0", "#94a3b8", "#475569");

      [-45, -15, 15, 45].forEach((offsetX) => {
        drawExtrudedBox(
          damX + offsetX,
          damY + 8,
          12,
          32,
          0,
          60,
          "#f8fafc",
          "#cbd5e1",
          "#475569"
        );
      });

      [-30, 0, 30].forEach((spillX, idx) => {
        const topSpill1 = elevate(damX + spillX - 10, damY + 14, 46);
        const topSpill2 = elevate(damX + spillX + 10, damY + 14, 46);

        const chuteGrad = ctx.createLinearGradient(
          topSpill1.x,
          topSpill1.y,
          damX + spillX,
          damY + 52
        );
        chuteGrad.addColorStop(0, "#38bdf8");
        chuteGrad.addColorStop(0.6, "#7dd3fc");
        chuteGrad.addColorStop(1, "#e0f2fe");

        ctx.fillStyle = chuteGrad;
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

      const bridgeStart = elevate(damX - 85, damY, 61);
      const bridgeEnd = elevate(damX + 85, damY, 61);
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(bridgeStart.x, bridgeStart.y);
      ctx.lineTo(bridgeEnd.x, bridgeEnd.y);
      ctx.stroke();

      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(bridgeStart.x, bridgeStart.y);
      ctx.lineTo(bridgeEnd.x, bridgeEnd.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Puente Colgante Huequecura
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
        suspLeft.y + 6,
        towerRight.x,
        towerRight.y
      );
      ctx.stroke();

      // Viaducto Río Biobío
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
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Torres de Alta Tensión
      const pylons = [
        { x: 1115, y: 1095 },
        { x: 1125, y: 1175 },
        { x: 1135, y: 1250 },
      ];
      pylons.forEach((p, idx) => {
        const pTop = elevate(p.x, p.y, 48);
        const pArmL = elevate(p.x - 14, p.y, 40);
        const pArmR = elevate(p.x + 14, p.y, 40);
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(p.x - 6, p.y);
        ctx.lineTo(pTop.x, pTop.y);
        ctx.lineTo(p.x + 6, p.y);
        ctx.moveTo(pArmL.x, pArmL.y);
        ctx.lineTo(pArmR.x, pArmR.y);
        ctx.stroke();

        if (idx < pylons.length - 1) {
          const next = pylons[idx + 1];
          const nArmL = elevate(next.x - 14, next.y, 40);
          const nArmR = elevate(next.x + 14, next.y, 40);
          ctx.strokeStyle = "rgba(56, 189, 248, 0.55)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(pArmL.x, pArmL.y);
          ctx.lineTo(nArmL.x, nArmL.y);
          ctx.moveTo(pArmR.x, pArmR.y);
          ctx.lineTo(nArmR.x, nArmR.y);
          ctx.stroke();
        }
      });

      // =========================================================
      // CAPA 6: MINIATURAS 3D DE LOS HITOS
      // =========================================================
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

      ctx.strokeStyle = "rgba(253, 224, 71, 0.55)";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      const pNorte = elevate(1210, 340, 24);
      const pNotros = elevate(1355, 575, 24);
      const pSanSeb = elevate(1155, 720, 24);
      ctx.moveTo(pNorte.x, pNorte.y);
      ctx.lineTo(pNotros.x, pNotros.y);
      ctx.moveTo(pNorte.x, pNorte.y);
      ctx.lineTo(pSanSeb.x, pSanSeb.y);
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

      [
        { x: 1335, y: 565, z: 24, c: "#ea580c" },
        { x: 1035, y: 1325, z: 0, c: "#16a34a" },
      ].forEach((camp) => {
        const cBase = elevate(camp.x, camp.y, camp.z);
        const cPeak = elevate(camp.x, camp.y, camp.z + 26);
        ctx.fillStyle = camp.c;
        ctx.beginPath();
        ctx.moveTo(cBase.x - 18, cBase.y + 9);
        ctx.lineTo(cBase.x + 18, cBase.y + 9);
        ctx.lineTo(cPeak.x, cPeak.y);
        ctx.closePath();
        ctx.fill();
      });

      drawExtrudedBox(1855, 445, 28, 22, 0, 22, "#ef4444", "#cbd5e1", "#94a3b8");
      drawExtrudedBox(1890, 470, 26, 20, 0, 20, "#f59e0b", "#cbd5e1", "#94a3b8");

      drawExtrudedBox(1655, 1085, 48, 34, 0, 30, "#a16207", "#713f12", "#422006");
      const domePos = elevate(1710, 1065, 14);
      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(domePos.x, domePos.y, 16, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // =========================================================
      // CAPA 7: MONTAÑAS LOW POLY Y BOSQUES EXTENDIDOS
      // =========================================================
      MOUNTAINS_3D.forEach((m) => {
        const peak = elevate(m.x, m.y, m.h);
        const left = { x: m.x - m.r, y: m.y + m.r * 0.25 };
        const right = { x: m.x + m.r, y: m.y + m.r * 0.25 };
        const front = { x: m.x, y: m.y + m.r * 0.72 };
        const back = { x: m.x, y: m.y - m.r * 0.65 };

        ctx.fillStyle = "#142e24";
        ctx.beginPath();
        ctx.moveTo(peak.x, peak.y);
        ctx.lineTo(left.x, left.y);
        ctx.lineTo(back.x, back.y);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#1c3d30";
        ctx.beginPath();
        ctx.moveTo(peak.x, peak.y);
        ctx.lineTo(back.x, back.y);
        ctx.lineTo(right.x, right.y);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#11261d";
        ctx.beginPath();
        ctx.moveTo(peak.x, peak.y);
        ctx.lineTo(left.x, left.y);
        ctx.lineTo(front.x, front.y);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#285741";
        ctx.beginPath();
        ctx.moveTo(peak.x, peak.y);
        ctx.lineTo(front.x, front.y);
        ctx.lineTo(right.x, right.y);
        ctx.closePath();
        ctx.fill();

        if (m.h >= 195) {
          const snowLeft = {
            x: peak.x + (left.x - peak.x) * 0.33,
            y: peak.y + (left.y - peak.y) * 0.33,
          };
          const snowFront = {
            x: peak.x + (front.x - peak.x) * 0.37,
            y: peak.y + (front.y - peak.y) * 0.37,
          };
          const snowRight = {
            x: peak.x + (right.x - peak.x) * 0.33,
            y: peak.y + (right.y - peak.y) * 0.33,
          };

          ctx.fillStyle = "rgba(241, 245, 249, 0.82)";
          ctx.beginPath();
          ctx.moveTo(peak.x, peak.y);
          ctx.lineTo(snowFront.x, snowFront.y);
          ctx.lineTo(snowRight.x, snowRight.y);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
          ctx.beginPath();
          ctx.moveTo(peak.x, peak.y);
          ctx.lineTo(snowLeft.x, snowLeft.y);
          ctx.lineTo(snowFront.x, snowFront.y);
          ctx.closePath();
          ctx.fill();
        }

        if (m.label && !modoReposo) {
          ctx.fillStyle = "rgba(226, 232, 240, 0.38)";
          ctx.font = "bold 12px serif";
          ctx.textAlign = "center";
          ctx.fillText(`▲ ${m.label}`, peak.x, peak.y - 12);
        }
      });

      const sortedTrees = [...TREES_3D].sort((a, b) => a.y - b.y);
      sortedTrees.forEach((t) => {
        const baseZ = getTerrainBaseZ(t.x, t.y);
        const ground = elevate(t.x, t.y, baseZ);
        const trunkTop = elevate(t.x, t.y, baseZ + 14);
        const canopyMid = elevate(t.x, t.y, baseZ + t.height * 0.6);
        const canopyPeak = elevate(t.x, t.y, baseZ + t.height);

        ctx.fillStyle = "rgba(5, 14, 10, 0.4)";
        ctx.beginPath();
        ctx.ellipse(
          ground.x + 7,
          ground.y + 4,
          t.radius,
          t.radius * 0.55,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(ground.x, ground.y);
        ctx.lineTo(trunkTop.x, trunkTop.y);
        ctx.stroke();

        if (t.type === "araucaria") {
          ctx.fillStyle = "#14532d";
          ctx.beginPath();
          ctx.ellipse(
            canopyPeak.x,
            canopyPeak.y,
            t.radius * 1.35,
            t.radius * 0.65,
            0,
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
      });

      // Toponimia y Tótems Táctiles
      if (!modoReposo) {
        ctx.fillStyle = "rgba(253, 230, 138, 0.44)";
        ctx.font = "bold 21px serif";
        ctx.textAlign = "center";
        ctx.fillText("EMBALSE ANGOSTURA", 1285, 865);
        ctx.font = "bold 15px serif";
        ctx.fillText("RÍO HUEQUECURA", 825, 595);
        ctx.fillText("RÍO BIOBÍO", 1625, 650);
        ctx.fillText("LONCOPANGUE", 1885, 420);
        ctx.fillText("SECTOR QUILME • CAMPO LINDO", 955, 1365);
        const penLabel = elevate(1215, 480, 24);
        ctx.fillText("PENÍNSULA SAN SEBASTIÁN", penLabel.x, penLabel.y);
        ctx.fillText("COMUNA DE SANTA BÁRBARA", 650, 1140);
        ctx.fillText("COMUNA DE QUILACO", 1380, 1185);

        const hitosFiltrados = hitos.features.filter(
          (f) =>
            categoriaActiva === "Todas" ||
            f.properties.categoria === categoriaActiva
        );

        hitosFiltrados.forEach((feature) => {
          const { coordinates } = feature.geometry;
          const props = feature.properties;
          const rawPos = projectGeoToCanvas(coordinates[0], coordinates[1]);

          const baseZ = getTerrainBaseZ(rawPos.x, rawPos.y);
          const groundPos = elevate(rawPos.x, rawPos.y, baseZ);

          const isSelected = hitoSeleccionado?.id_hito === props.id_hito;

          const floatZ =
            baseZ +
            (isSelected ? 116 : 90) +
            Math.sin(time * 2.4 + rawPos.x) * 5;
          const topPos = elevate(rawPos.x, rawPos.y, floatZ);

          const pulseR = (isSelected ? 30 : 25) + Math.sin(time * 2.5) * 4;
          ctx.beginPath();
          ctx.arc(groundPos.x, groundPos.y, pulseR, 0, Math.PI * 2);
          ctx.strokeStyle = isSelected ? "#fef08a" : props.color_hex;
          ctx.lineWidth = isSelected ? 4 : 2.5;
          ctx.globalAlpha = isSelected ? 0.95 : 0.55;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(groundPos.x, groundPos.y, isSelected ? 12 : 9, 0, Math.PI * 2);
          ctx.fillStyle = props.color_hex;
          ctx.fill();
          ctx.globalAlpha = 1;

          const pillarGrad = ctx.createLinearGradient(
            groundPos.x,
            groundPos.y,
            topPos.x,
            topPos.y
          );
          pillarGrad.addColorStop(0, props.color_hex);
          pillarGrad.addColorStop(1, isSelected ? "#ffffff" : "#fef08a");

          ctx.save();
          ctx.strokeStyle = pillarGrad;
          ctx.lineWidth = isSelected ? 4.5 : 2.8;
          ctx.shadowColor = props.color_hex;
          ctx.shadowBlur = isSelected ? 20 : 14;
          ctx.beginPath();
          ctx.moveTo(groundPos.x, groundPos.y);
          ctx.lineTo(topPos.x, topPos.y);
          ctx.stroke();
          ctx.restore();

          ctx.save();
          ctx.translate(topPos.x, topPos.y);
          ctx.rotate(-cam.yaw);
          ctx.scale(1, 1 / cam.pitch);

          const baseRadius = isSelected ? 32 : 26;

          ctx.shadowColor = isSelected ? "#fef08a" : props.color_hex;
          ctx.shadowBlur = isSelected ? 28 : 14;

          ctx.fillStyle = isSelected ? "#fef08a" : "#f59e0b";
          ctx.beginPath();
          ctx.moveTo(0, -baseRadius - 9);
          ctx.lineTo(8, -baseRadius + 2);
          ctx.lineTo(-8, -baseRadius + 2);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
          ctx.fillStyle = "#0f172a";
          ctx.fill();
          ctx.lineWidth = isSelected ? 4 : 3;
          ctx.strokeStyle = isSelected ? "#fef08a" : props.color_hex;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(0, 0, baseRadius - 5, 0, Math.PI * 2);
          ctx.fillStyle = props.color_hex;
          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.font = `${isSelected ? 23 : 18}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(props.icono, 0, 1);

          const labelText = isSelected
            ? props.titulo
            : TOUCH_SHORT_LABELS[props.id_hito] || props.titulo;

          const labelY = -baseRadius - 20;
          ctx.font = isSelected
            ? "bold 13px sans-serif"
            : "bold 11px sans-serif";
          const textWidth = ctx.measureText(labelText).width;

          ctx.fillStyle = isSelected
            ? "rgba(15, 23, 42, 0.98)"
            : "rgba(15, 23, 42, 0.86)";
          ctx.strokeStyle = isSelected
            ? "#fef08a"
            : "rgba(245, 158, 11, 0.4)";
          ctx.lineWidth = isSelected ? 2 : 1.2;

          ctx.beginPath();
          ctx.roundRect(
            -textWidth / 2 - 10,
            labelY - 11,
            textWidth + 20,
            22,
            6
          );
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = isSelected ? "#fef08a" : "#f8fafc";
          ctx.fillText(labelText, 0, labelY + 1);

          ctx.restore();
        });
      }

      // Nubes atmosféricas
      CLOUDS_3D.forEach((c, idx) => {
        const driftX =
          ((c.x + time * 16 * c.speed) % (WORLD_WIDTH - 400)) + 200;
        const cloudPos = elevate(driftX, c.y, 160);

        const cloudGrad = ctx.createRadialGradient(
          cloudPos.x,
          cloudPos.y,
          20,
          cloudPos.x,
          cloudPos.y,
          c.w
        );
        cloudGrad.addColorStop(0, "rgba(226, 232, 240, 0.14)");
        cloudGrad.addColorStop(0.5, "rgba(148, 163, 184, 0.06)");
        cloudGrad.addColorStop(1, "rgba(15, 23, 42, 0)");

        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.ellipse(
          cloudPos.x,
          cloudPos.y,
          c.w,
          c.h + Math.sin(time + idx) * 8,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      ctx.restore();

      // Viñeta atmosférica sutil solo en las esquinas extremas
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * (modoReposo ? 0.28 : 0.48),
        width / 2,
        height / 2,
        Math.max(width, height) * 0.82
      );
      vignette.addColorStop(
        0,
        modoReposo ? "rgba(3, 7, 15, 0.2)" : "rgba(0,0,0,0)"
      );
      vignette.addColorStop(
        1,
        modoReposo ? "rgba(2, 5, 12, 0.88)" : "rgba(4, 12, 9, 0.52)"
      );
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [modoReposo, categoriaActiva, hitoSeleccionado, hitos]);

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

    const hitosVisibles = hitos.features.filter(
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

      if (distTop < 54 || distGround < 44) {
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
    if (modoReposo) return;
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

    if (!cam.pointerMoved) {
      const hit = buscarHitoEnPuntoTactil(e.clientX, e.clientY);
      if (hit) {
        setHitoSeleccionado(hit.feature.properties);
        enfocarCamara(hit.groundPos.x, hit.groundPos.y, 1.52, 0.56);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (modoReposo) return;
    registrarActividad();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    camRef.current.targetZoom *= zoomFactor;
  };

  const categorias: CategoriaHub[] = [
    { etiqueta: "Todas", color: "#64748b" },
    { etiqueta: "Energética", color: "#3B82F6" },
    { etiqueta: "Turística", color: "#F59E0B" },
    { etiqueta: "Ecológica", color: "#10B981" },
    { etiqueta: "Histórica", color: "#A855F7" }
  ];

  const totalHitos = hitos.features.length;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#132d21] select-none font-sans">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full touch-none cursor-default active:cursor-grabbing"
      />

      {modoReposo && (
        <CapaReposo
          marca="COLBÚN S.A. • CENTRO DE VISITANTES"
          pretitulo="EXPLORA Y DESCUBRE"
          titulo="ANGOSTURA DEL BIOBÍO"
          onIniciar={iniciarExploracion}
        >
          <QrSala
            ruta={rutaQR}
            rotulo="Mapa geográfico en tu celular"
            detalle="Escanea y continúa el recorrido"
            ubicacion="flujo"
          />
        </CapaReposo>
      )}

      {/* HUD DE SALA Y CONTROLES TÁCTILES */}
      {!modoReposo && (
        <>
          <header className="pointer-events-none absolute left-6 right-6 top-6 z-10 flex flex-wrap items-center justify-between gap-4">
            <div className="pointer-events-auto rounded-2xl border border-amber-500/30 bg-slate-900/90 px-5 py-3 shadow-2xl backdrop-blur-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-400">
                Colbún S.A. {"•"} Destino Angostura del Biobío
              </p>
              <h1 className="text-lg font-bold tracking-wide text-slate-100 md:text-xl">
                Mapa Interactivo Parque Angostura ({totalHitos} Hitos)
              </h1>
            </div>

            <BarraCategorias
              categorias={categorias}
              activa={categoriaActiva}
              onSeleccionar={(etiqueta) => {
                registrarActividad();
                setCategoriaActiva(etiqueta);
              }}
            >
              <BotonesSala
                onVistaGeneral={restablecerVista}
                onPantallaCompleta={alternarPantallaCompleta}
                onPortada={activarModoReposo}
              />
            </BarraCategorias>
          </header>

          <ControlesCamara
            className="absolute bottom-6 left-6 z-10 flex items-end gap-2"
            onAcercar={() => {
              registrarActividad();
              camRef.current.targetZoom *= 1.2;
            }}
            onAlejar={() => {
              registrarActividad();
              camRef.current.targetZoom *= 0.8;
            }}
            onGirarIzquierda={() => {
              registrarActividad();
              camRef.current.targetYaw -= 0.25;
            }}
            onGirarDerecha={() => {
              registrarActividad();
              camRef.current.targetYaw += 0.25;
            }}
            vista3D={{ activa: vista3DActiva, onAlternar: alternarPerspectiva3D }}
          />

          <QrSala
            ruta={rutaQR}
            rotulo="Mapa geográfico"
            detalle="Escanea con tu celular"
            apartado={Boolean(hitoSeleccionado)}
          />

          {hitoSeleccionado && (
            <FichaHito
              hito={{
                titulo: hitoSeleccionado.titulo,
                categoria: hitoSeleccionado.categoria,
                color: hitoSeleccionado.color_hex,
                sector: hitoSeleccionado.sector,
                icono: hitoSeleccionado.icono,
                resumen: hitoSeleccionado.descripcion_corta,
                contenido: hitoSeleccionado.contenido_didactico,
                horario: hitoSeleccionado.horario_acceso,
                audioUrl: hitoSeleccionado.audio_url,
                duracionAudio: hitoSeleccionado.duracion_audio,
                modeloUrl: hitoSeleccionado.modelo_3d
              }}
              onCerrar={restablecerVista}
            />
          )}
        </>
      )}
    </div>
  );
}