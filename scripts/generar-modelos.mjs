import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const destino = path.join(raiz, "public", "models");

function minMax(positions) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    min[0] = Math.min(min[0], positions[i]);
    min[1] = Math.min(min[1], positions[i + 1]);
    min[2] = Math.min(min[2], positions[i + 2]);
    max[0] = Math.max(max[0], positions[i]);
    max[1] = Math.max(max[1], positions[i + 1]);
    max[2] = Math.max(max[2], positions[i + 2]);
  }
  return { min, max };
}

function pad4(buffer) {
  const extra = (4 - (buffer.length % 4)) % 4;
  if (!extra) return buffer;
  return Buffer.concat([buffer, Buffer.alloc(extra, 0x20)]);
}

function crearGlb({ positions, normals, indices, color }) {
  const pos = Buffer.from(new Float32Array(positions).buffer);
  const nor = Buffer.from(new Float32Array(normals).buffer);
  const idx = Buffer.from(new Uint16Array(indices).buffer);
  const bin = Buffer.concat([pos, nor, idx]);
  const { min, max } = minMax(positions);
  const nVerts = positions.length / 3;

  const json = {
    asset: { version: "2.0", generator: "centro-visitantes-ar" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [
      {
        primitives: [
          {
            attributes: { POSITION: 0, NORMAL: 1 },
            indices: 2,
            material: 0
          }
        ]
      }
    ],
    materials: [
      {
        pbrMetallicRoughness: {
          baseColorFactor: [...color, 1],
          metallicFactor: 0.15,
          roughnessFactor: 0.4
        }
      }
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: nVerts,
        type: "VEC3",
        min,
        max
      },
      { bufferView: 1, componentType: 5126, count: nVerts, type: "VEC3" },
      { bufferView: 2, componentType: 5123, count: indices.length, type: "SCALAR" }
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: pos.length, target: 34962 },
      { buffer: 0, byteOffset: pos.length, byteLength: nor.length, target: 34962 },
      {
        buffer: 0,
        byteOffset: pos.length + nor.length,
        byteLength: idx.length,
        target: 34963
      }
    ],
    buffers: [{ byteLength: bin.length }]
  };

  const jsonChunk = pad4(Buffer.from(JSON.stringify(json)));
  const binChunk = pad4(bin);
  const header = Buffer.alloc(12);
  header.write("glTF", 0, "ascii");
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + jsonChunk.length + 8 + binChunk.length, 8);

  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonChunk.length, 0);
  jsonHeader.writeUInt32LE(0x4e4f534a, 4);

  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(binChunk.length, 0);
  binHeader.writeUInt32LE(0x004e4942, 4);

  return Buffer.concat([header, jsonHeader, jsonChunk, binHeader, binChunk]);
}

function empujar(arr, ...vals) {
  arr.push(...vals);
}

function caja(x0, y0, z0, x1, y1, z1, positions, normals, indices) {
  const caras = [
    { n: [0, 0, 1], v: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]] },
    { n: [0, 0, -1], v: [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]] },
    { n: [0, 1, 0], v: [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]] },
    { n: [0, -1, 0], v: [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]] },
    { n: [1, 0, 0], v: [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]] },
    { n: [-1, 0, 0], v: [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]] }
  ];
  for (const cara of caras) {
    const base = positions.length / 3;
    for (const [x, y, z] of cara.v) {
      empujar(positions, x, y, z);
      empujar(normals, ...cara.n);
    }
    empujar(indices, base, base + 1, base + 2, base, base + 2, base + 3);
  }
}

function cono(radio, alto, segmentos, positions, normals, indices, y0 = 0) {
  const apex = [0, y0 + alto, 0];
  for (let i = 0; i < segmentos; i += 1) {
    const a0 = (i / segmentos) * Math.PI * 2;
    const a1 = ((i + 1) / segmentos) * Math.PI * 2;
    const p0 = [Math.cos(a0) * radio, y0, Math.sin(a0) * radio];
    const p1 = [Math.cos(a1) * radio, y0, Math.sin(a1) * radio];
    const nx = (p0[0] + p1[0]) / 2;
    const nz = (p0[2] + p1[2]) / 2;
    const len = Math.hypot(nx, alto * 0.4, nz) || 1;
    const n = [nx / len, alto * 0.35 / len, nz / len];
    const base = positions.length / 3;
    empujar(positions, ...apex, ...p0, ...p1);
    empujar(normals, ...n, ...n, ...n);
    empujar(indices, base, base + 1, base + 2);
  }
}

function cilindro(radio, alto, segmentos, positions, normals, indices, y0 = 0) {
  for (let i = 0; i < segmentos; i += 1) {
    const a0 = (i / segmentos) * Math.PI * 2;
    const a1 = ((i + 1) / segmentos) * Math.PI * 2;
    const c0 = Math.cos(a0);
    const s0 = Math.sin(a0);
    const c1 = Math.cos(a1);
    const s1 = Math.sin(a1);
    const base = positions.length / 3;
    empujar(
      positions,
      c0 * radio, y0, s0 * radio,
      c1 * radio, y0, s1 * radio,
      c1 * radio, y0 + alto, s1 * radio,
      c0 * radio, y0 + alto, s0 * radio
    );
    empujar(normals, c0, 0, s0, c1, 0, s1, c1, 0, s1, c0, 0, s0);
    empujar(indices, base, base + 1, base + 2, base, base + 2, base + 3);
  }
}

function esfera(radio, segmentos, anillos, positions, normals, indices, oy = 0) {
  const verts = [];
  for (let y = 0; y <= anillos; y += 1) {
    const v = y / anillos;
    const phi = v * Math.PI;
    for (let x = 0; x <= segmentos; x += 1) {
      const u = x / segmentos;
      const theta = u * Math.PI * 2;
      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.cos(phi);
      const nz = Math.sin(phi) * Math.sin(theta);
      verts.push({ p: [nx * radio, ny * radio + oy, nz * radio], n: [nx, ny, nz] });
    }
  }
  const stride = segmentos + 1;
  const base = positions.length / 3;
  for (const vert of verts) {
    empujar(positions, ...vert.p);
    empujar(normals, ...vert.n);
  }
  for (let y = 0; y < anillos; y += 1) {
    for (let x = 0; x < segmentos; x += 1) {
      const a = base + y * stride + x;
      const b = a + stride;
      empujar(indices, a, b, a + 1, a + 1, b, b + 1);
    }
  }
}

const modelos = {
  "gota-agua": () => {
    const positions = [];
    const normals = [];
    const indices = [];
    esfera(0.42, 18, 12, positions, normals, indices, 0.08);
    cono(0.28, 0.55, 16, positions, normals, indices, 0.28);
    return { positions, normals, indices, color: [0.12, 0.62, 0.82] };
  },
  turbina: () => {
    const positions = [];
    const normals = [];
    const indices = [];
    cilindro(0.22, 0.9, 20, positions, normals, indices, -0.45);
    caja(-0.55, -0.08, -0.08, 0.55, 0.08, 0.08, positions, normals, indices);
    caja(-0.08, -0.08, -0.55, 0.08, 0.08, 0.55, positions, normals, indices);
    return { positions, normals, indices, color: [0.12, 0.78, 0.82] };
  },
  arbol: () => {
    const positions = [];
    const normals = [];
    const indices = [];
    cilindro(0.1, 0.45, 12, positions, normals, indices, -0.55);
    cono(0.48, 0.7, 16, positions, normals, indices, -0.18);
    cono(0.36, 0.55, 16, positions, normals, indices, 0.12);
    return { positions, normals, indices, color: [0.18, 0.55, 0.32] };
  },
  casa: () => {
    const positions = [];
    const normals = [];
    const indices = [];
    caja(-0.4, -0.35, -0.32, 0.4, 0.15, 0.32, positions, normals, indices);
    cono(0.55, 0.42, 4, positions, normals, indices, 0.15);
    return { positions, normals, indices, color: [0.78, 0.62, 0.38] };
  },
  "sol-energia": () => {
    const positions = [];
    const normals = [];
    const indices = [];
    esfera(0.38, 16, 12, positions, normals, indices, 0);
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      const x = Math.cos(a) * 0.55;
      const z = Math.sin(a) * 0.55;
      caja(x - 0.06, -0.06, z - 0.06, x + 0.06, 0.06, z + 0.06, positions, normals, indices);
    }
    return { positions, normals, indices, color: [0.92, 0.62, 0.22] };
  },
  ave: () => {
    const positions = [];
    const normals = [];
    const indices = [];
    esfera(0.22, 12, 8, positions, normals, indices, 0.05);
    caja(-0.55, 0.0, -0.04, 0.55, 0.08, 0.04, positions, normals, indices);
    caja(0.18, 0.08, -0.04, 0.32, 0.22, 0.04, positions, normals, indices);
    return { positions, normals, indices, color: [0.35, 0.62, 0.95] };
  },
  sendero: () => {
    const positions = [];
    const normals = [];
    const indices = [];
    caja(-0.12, -0.08, -0.55, 0.12, 0.02, 0.55, positions, normals, indices);
    caja(-0.08, 0.02, -0.1, 0.08, 0.45, 0.1, positions, normals, indices);
    caja(-0.22, 0.32, -0.04, 0.22, 0.4, 0.04, positions, normals, indices);
    return { positions, normals, indices, color: [0.94, 0.54, 0.23] };
  },
  flora: () => {
    const positions = [];
    const normals = [];
    const indices = [];
    cilindro(0.05, 0.4, 8, positions, normals, indices, -0.35);
    esfera(0.22, 10, 8, positions, normals, indices, 0.18);
    esfera(0.14, 8, 6, positions, normals, indices, 0.02);
    return { positions, normals, indices, color: [0.24, 0.86, 0.52] };
  }
};

await mkdir(destino, { recursive: true });
for (const [nombre, construir] of Object.entries(modelos)) {
  const glb = crearGlb(construir());
  const archivo = path.join(destino, `${nombre}.glb`);
  await writeFile(archivo, glb);
  console.log("ok", archivo, glb.length, "bytes");
}
