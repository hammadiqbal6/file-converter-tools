/**
 * STL parsing and conversion utilities (ASCII ↔ binary, STL → OBJ).
 * A full FDM slicer is intentionally limited — see BASIC_SLICER_LIMITS.
 */

export const BASIC_SLICER_LIMITS = [
  'Produces a single-layer contour path (not a production slicer).',
  'No support generation, infill patterns, or multi-extruder logic.',
  'Assumes Z-up millimeters; verify units in your CAD export.',
  'Large meshes (>200k triangles) may be slow in-browser.',
  'Always dry-run G-code in your printer firmware / simulator before printing.',
] as const;

export type Vec3 = [number, number, number];
export type Triangle = { normal: Vec3; vertices: [Vec3, Vec3, Vec3] };

export type StlMesh = {
  name: string;
  triangles: Triangle[];
};

function parseAsciiStl(text: string): StlMesh {
  const lines = text.split(/\r?\n/);
  let name = 'solid';
  const triangles: Triangle[] = [];
  let normal: Vec3 = [0, 0, 0];
  let verts: Vec3[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith('solid') && !line.startsWith('solid ')) {
      /* ignore */
    }
    if (/^solid\s+/.test(line)) {
      name = line.replace(/^solid\s+/, '') || 'solid';
    } else if (line.startsWith('facet normal')) {
      const parts = line.split(/\s+/).slice(2).map(Number) as Vec3;
      normal = parts;
      verts = [];
    } else if (line.startsWith('vertex')) {
      const parts = line.split(/\s+/).slice(1).map(Number) as Vec3;
      verts.push(parts);
    } else if (line.startsWith('endfacet')) {
      if (verts.length === 3) {
        triangles.push({ normal, vertices: [verts[0], verts[1], verts[2]] });
      }
    }
  }
  if (!triangles.length) throw new Error('No triangles found in ASCII STL.');
  return { name, triangles };
}

function parseBinaryStl(buffer: ArrayBuffer): StlMesh {
  const view = new DataView(buffer);
  if (buffer.byteLength < 84) throw new Error('Binary STL too short.');
  const count = view.getUint32(80, true);
  const expected = 84 + count * 50;
  if (buffer.byteLength < expected) {
    throw new Error(`Binary STL truncated: expected ${expected} bytes, got ${buffer.byteLength}.`);
  }
  const triangles: Triangle[] = [];
  let offset = 84;
  for (let i = 0; i < count; i++) {
    const nx = view.getFloat32(offset, true);
    const ny = view.getFloat32(offset + 4, true);
    const nz = view.getFloat32(offset + 8, true);
    offset += 12;
    const verts: Vec3[] = [];
    for (let v = 0; v < 3; v++) {
      verts.push([
        view.getFloat32(offset, true),
        view.getFloat32(offset + 4, true),
        view.getFloat32(offset + 8, true),
      ]);
      offset += 12;
    }
    offset += 2; // attribute byte count
    triangles.push({ normal: [nx, ny, nz], vertices: [verts[0], verts[1], verts[2]] });
  }
  return { name: 'binary', triangles };
}

export function isAsciiStl(buffer: ArrayBuffer): boolean {
  const head = new TextDecoder().decode(buffer.slice(0, Math.min(80, buffer.byteLength))).trimStart();
  if (!head.toLowerCase().startsWith('solid')) return false;
  // Many binary STLs also start with "solid" — check for facet keywords
  const sample = new TextDecoder().decode(buffer.slice(0, Math.min(1024, buffer.byteLength)));
  return /facet\s+normal/i.test(sample) || /endsolid/i.test(sample);
}

export function parseStl(buffer: ArrayBuffer): StlMesh {
  return isAsciiStl(buffer) ? parseAsciiStl(new TextDecoder().decode(buffer)) : parseBinaryStl(buffer);
}

export function parseStlText(text: string): StlMesh {
  return parseAsciiStl(text);
}

export function stlToAscii(mesh: StlMesh): string {
  const lines = [`solid ${mesh.name || 'export'}`];
  for (const t of mesh.triangles) {
    lines.push(`  facet normal ${t.normal.join(' ')}`);
    lines.push('    outer loop');
    for (const v of t.vertices) {
      lines.push(`      vertex ${v.join(' ')}`);
    }
    lines.push('    endloop');
    lines.push('  endfacet');
  }
  lines.push(`endsolid ${mesh.name || 'export'}`);
  return lines.join('\n');
}

export function stlToBinary(mesh: StlMesh): ArrayBuffer {
  const count = mesh.triangles.length;
  const buffer = new ArrayBuffer(84 + count * 50);
  const view = new DataView(buffer);
  const header = 'LocalFile Convert binary STL';
  for (let i = 0; i < 80; i++) {
    view.setUint8(i, i < header.length ? header.charCodeAt(i) : 0);
  }
  view.setUint32(80, count, true);
  let offset = 84;
  for (const t of mesh.triangles) {
    view.setFloat32(offset, t.normal[0], true);
    view.setFloat32(offset + 4, t.normal[1], true);
    view.setFloat32(offset + 8, t.normal[2], true);
    offset += 12;
    for (const v of t.vertices) {
      view.setFloat32(offset, v[0], true);
      view.setFloat32(offset + 4, v[1], true);
      view.setFloat32(offset + 8, v[2], true);
      offset += 12;
    }
    view.setUint16(offset, 0, true);
    offset += 2;
  }
  return buffer;
}

export function stlToObj(mesh: StlMesh): string {
  const lines = [`# Converted from STL (${mesh.triangles.length} triangles)`, `o ${mesh.name || 'mesh'}`];
  let vi = 1;
  for (const t of mesh.triangles) {
    for (const v of t.vertices) {
      lines.push(`v ${v[0]} ${v[1]} ${v[2]}`);
    }
    lines.push(`f ${vi} ${vi + 1} ${vi + 2}`);
    vi += 3;
  }
  return lines.join('\n');
}

export type BasicSlicerOptions = {
  layerHeight?: number;
  feedRate?: number;
  travelRate?: number;
  extrudePerMm?: number;
};

/**
 * Extremely basic "slicer": walks triangle edges near each Z layer and emits G1 moves.
 * Documented as educational / preview-only — not for unattended printing.
 */
export function stlToBasicGcode(mesh: StlMesh, options: BasicSlicerOptions = {}): string {
  const layerHeight = options.layerHeight ?? 0.2;
  const feed = options.feedRate ?? 1200;
  const travel = options.travelRate ?? 3000;
  const ePerMm = options.extrudePerMm ?? 0.05;

  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const t of mesh.triangles) {
    for (const v of t.vertices) {
      minZ = Math.min(minZ, v[2]);
      maxZ = Math.max(maxZ, v[2]);
    }
  }
  if (!isFinite(minZ) || !isFinite(maxZ)) throw new Error('Invalid mesh bounds.');

  const lines: string[] = [
    '; Generated by LocalFile Convert basic STL→G-code (preview only)',
    `; Limits: ${BASIC_SLICER_LIMITS.join(' | ')}`,
    'G21 ; mm',
    'G90 ; absolute',
    'G28 ; home',
    'G1 Z0.2 F3000',
    'M104 S200 ; set hotend (edit for your filament)',
    'M140 S60  ; set bed',
  ];

  let e = 0;
  for (let z = minZ + layerHeight; z <= maxZ + 1e-6; z += layerHeight) {
    lines.push(`; LAYER z=${z.toFixed(3)}`);
    lines.push(`G0 Z${z.toFixed(3)} F${travel}`);
    const segments: Array<[Vec3, Vec3]> = [];
    for (const t of mesh.triangles) {
      const pts = t.vertices;
      const crossings: Vec3[] = [];
      for (let i = 0; i < 3; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % 3];
        if ((a[2] <= z && b[2] >= z) || (b[2] <= z && a[2] >= z)) {
          const tparam = Math.abs(b[2] - a[2]) < 1e-9 ? 0 : (z - a[2]) / (b[2] - a[2]);
          crossings.push([
            a[0] + (b[0] - a[0]) * tparam,
            a[1] + (b[1] - a[1]) * tparam,
            z,
          ]);
        }
      }
      if (crossings.length >= 2) {
        segments.push([crossings[0], crossings[1]]);
      }
    }
    for (const [a, b] of segments.slice(0, 500)) {
      lines.push(`G0 X${a[0].toFixed(3)} Y${a[1].toFixed(3)} F${travel}`);
      const dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
      e += dist * ePerMm;
      lines.push(`G1 X${b[0].toFixed(3)} Y${b[1].toFixed(3)} E${e.toFixed(5)} F${feed}`);
    }
  }

  lines.push('G0 Z10 F3000');
  lines.push('M104 S0');
  lines.push('M140 S0');
  lines.push('M84');
  lines.push('; end');
  return lines.join('\n');
}
