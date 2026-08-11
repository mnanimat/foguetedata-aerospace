import { jsPDF } from 'jspdf';
import * as THREE from 'three';
import { User3DModel } from '../types';

export interface CadTitleBlockCustom {
  drawingTitle?: string;
  authorName?: string;
  teamName?: string;
  drawingNumber?: string;
  date?: string;
  scale?: string;
  material?: string;
  revision?: string;
  tolerance?: string;
}

export interface CadParametricSpecs {
  lengthMm: number;
  diameterMm: number;
  wallThicknessMm: number;
  noseConeType: string;
  finCount: number;
  finThicknessMm: number;
  material: string;
  authorName?: string;
  teamName?: string;
  tubeType?: 'cylinder' | 'square' | 'rectangular' | 'l_profile' | 'edge_rail';
  tubeWidthMm?: number;
  tubeHeightMm?: number;
  extrusionDepthMm?: number;
  patternCount?: number;
  patternRadiusMm?: number;
  titleBlock?: CadTitleBlockCustom;
}

/**
 * Downloads a text or binary file to the browser
 */
export function triggerFileDownload(filename: string, content: string | Blob, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates an ISO/ABNT Technical Drawing Sheet (PDF) with Orthographic Views & Title Block
 */
export function generateTechnicalDrawingPDF(
  model: User3DModel,
  specs: CadParametricSpecs,
  authorName: string = 'Micael Nildo'
) {
  // Create A3 Landscape PDF Document (420 x 297 mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a3'
  });

  const width = 420;
  const height = 297;
  const margin = 10;

  // Outer Technical Frame
  doc.setLineWidth(0.8);
  doc.setDrawColor(20, 30, 50);
  doc.rect(margin, margin, width - margin * 2, height - margin * 2);

  // Inner Border Frame
  doc.setLineWidth(0.3);
  doc.rect(margin + 2, margin + 2, width - (margin + 2) * 2, height - (margin + 2) * 2);

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(220, 38, 38);
  doc.text('DESENHO TÉCNICO DE ENGENHARIA AEROESPACIAL - ABNT/ISO 128', margin + 8, margin + 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 80, 95);
  doc.text(`ESPECIFICAÇÃO DE FABRICAÇÃO E MEDIDAS EXATAS EM MILÍMETROS (mm) | PROJETO: ${model.title.toUpperCase()}`, margin + 8, margin + 17);

  // Grid Divider Lines for 4 Orthographic Views
  doc.setDrawColor(180, 190, 205);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(width / 2, margin + 22, width / 2, height - 55);
  doc.line(margin + 5, (height - 55 + 22) / 2, width - 5, (height - 55 + 22) / 2);
  doc.setLineDashPattern([], 0);

  const L = specs.lengthMm;
  const D = specs.diameterMm;
  const t = specs.wallThicknessMm || specs.finThicknessMm || 3.0;

  // -------------------------------------------------------------
  // VIEW 1: VISTA FRONTAL (ELEVAÇÃO) - TOP LEFT
  // -------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. VISTA FRONTAL (ELEVAÇÃO / PERFIL SANGUÍNEO)', margin + 10, margin + 30);

  // Draw Front View Profile
  const v1X = margin + 30;
  const v1Y = margin + 65;
  const scaleX = 140 / Math.max(300, L);
  const scaledL = L * scaleX;
  const scaledD = Math.max(12, D * scaleX * 1.5);

  // Center Line
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.2);
  doc.setLineDashPattern([4, 2, 1, 2], 0);
  doc.line(v1X - 10, v1Y, v1X + scaledL + 20, v1Y);
  doc.setLineDashPattern([], 0);

  // Nosecone Contour
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.6);
  doc.line(v1X, v1Y, v1X + 25, v1Y - scaledD / 2);
  doc.line(v1X, v1Y, v1X + 25, v1Y + scaledD / 2);

  // Body Tube Body
  doc.rect(v1X + 25, v1Y - scaledD / 2, scaledL - 35, scaledD);

  // Fins Contour
  const finX = v1X + scaledL - 10;
  doc.triangle(
    finX, v1Y - scaledD / 2,
    finX - 15, v1Y - scaledD / 2 - 12,
    finX + 10, v1Y - scaledD / 2,
    'S'
  );
  doc.triangle(
    finX, v1Y + scaledD / 2,
    finX - 15, v1Y + scaledD / 2 + 12,
    finX + 10, v1Y + scaledD / 2,
    'S'
  );

  // Cotas de Medidas Exatas (Dimensions Lines)
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.3);
  // Cota de Comprimento Total (L)
  doc.line(v1X, v1Y + scaledD / 2 + 18, v1X + scaledL, v1Y + scaledD / 2 + 18);
  doc.line(v1X, v1Y + scaledD / 2 + 15, v1X, v1Y + scaledD / 2 + 21);
  doc.line(v1X + scaledL, v1Y + scaledD / 2 + 15, v1X + scaledL, v1Y + scaledD / 2 + 21);
  doc.setFontSize(8);
  doc.setTextColor(37, 99, 235);
  doc.text(`L = ${L.toFixed(1)} mm`, v1X + scaledL / 2 - 12, v1Y + scaledD / 2 + 16);

  // Cota de Diâmetro (D)
  doc.line(v1X - 8, v1Y - scaledD / 2, v1X - 8, v1Y + scaledD / 2);
  doc.text(`Ø ${D.toFixed(1)} mm`, v1X - 22, v1Y + 1);

  // -------------------------------------------------------------
  // VIEW 2: VISTA SUPERIOR (PLANTA / CORTE TRANSVERSAL) - TOP RIGHT
  // -------------------------------------------------------------
  const v2X = width / 2 + 90;
  const v2Y = margin + 65;
  const radius = scaledD * 0.9;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. VISTA SUPERIOR (CORTES TRANSVERSAIS & ALETAS)', width / 2 + 10, margin + 30);

  // Center axes
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.2);
  doc.setLineDashPattern([4, 2, 1, 2], 0);
  doc.line(v2X - radius - 20, v2Y, v2X + radius + 20, v2Y);
  doc.line(v2X, v2Y - radius - 20, v2X, v2Y + radius + 20);
  doc.setLineDashPattern([], 0);

  // Outer & Inner Cylinders
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.6);
  doc.circle(v2X, v2Y, radius, 'S');
  doc.setLineWidth(0.3);
  doc.circle(v2X, v2Y, Math.max(3, radius - 3), 'S');

  // Radial Fins (3 or 4)
  const angleStep = (Math.PI * 2) / specs.finCount;
  for (let i = 0; i < specs.finCount; i++) {
    const a = i * angleStep - Math.PI / 2;
    const x1 = v2X + Math.cos(a) * radius;
    const y1 = v2Y + Math.sin(a) * radius;
    const x2 = v2X + Math.cos(a) * (radius + 24);
    const y2 = v2Y + Math.sin(a) * (radius + 24);
    doc.setLineWidth(0.8);
    doc.line(x1, y1, x2, y2);
  }

  // Dimension Cota Raio / Parede
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.3);
  doc.line(v2X, v2Y, v2X + radius, v2Y);
  doc.setFontSize(8);
  doc.setTextColor(37, 99, 235);
  doc.text(`R = ${(D / 2).toFixed(1)} mm | t = ${t.toFixed(1)} mm`, v2X + 2, v2Y - 2);

  // -------------------------------------------------------------
  // VIEW 3: VISTA LATERAL DE CORTE E SEÇÃO - BOTTOM LEFT
  // -------------------------------------------------------------
  const v3X = margin + 30;
  const v3Y = height - 120;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. DETALHAMENTO DE PAREDE E MONTAGEM DA COIFA', margin + 10, height / 2 - 10);

  // Cross section wall
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.rect(v3X, v3Y - scaledD / 2, scaledL, scaledD);
  doc.rect(v3X + 2, v3Y - scaledD / 2 + 2, scaledL - 4, scaledD - 4);

  // Hatching pattern (Hachura ABNT)
  doc.setDrawColor(160, 175, 195);
  doc.setLineWidth(0.15);
  for (let hx = v3X; hx < v3X + scaledL; hx += 8) {
    doc.line(hx, v3Y - scaledD / 2, hx + 5, v3Y - scaledD / 2 + 2);
    doc.line(hx, v3Y + scaledD / 2 - 2, hx + 5, v3Y + scaledD / 2);
  }

  doc.setFontSize(8);
  doc.setTextColor(70, 80, 95);
  doc.text(`Material Estrutural: ${specs.material}`, v3X, v3Y + scaledD / 2 + 12);
  doc.text(`Geometria do Nariz: ${specs.noseConeType}`, v3X, v3Y + scaledD / 2 + 17);

  // -------------------------------------------------------------
  // VIEW 4: PROJEÇÃO ISOMÉTRICA 3D - BOTTOM RIGHT
  // -------------------------------------------------------------
  const v4X = width / 2 + 90;
  const v4Y = height - 120;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('4. VISTA PROJETADA ISOMÉTRICA (3D PERSPECTIVA)', width / 2 + 10, height / 2 - 10);

  // Draw 3D Isometric Projection Wireframe
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.6);

  const isoLen = scaledL * 0.7;
  const isoRad = scaledD * 0.6;
  const cos30 = 0.866;
  const sin30 = 0.5;

  // Front Cone Point
  const nosePoint = { x: v4X - isoLen * cos30, y: v4Y + isoLen * sin30 };
  const baseCenter = { x: v4X, y: v4Y };

  doc.line(nosePoint.x, nosePoint.y, baseCenter.x - isoRad * sin30, baseCenter.y - isoRad * cos30);
  doc.line(nosePoint.x, nosePoint.y, baseCenter.x + isoRad * sin30, baseCenter.y + isoRad * cos30);

  // Cylinder body
  const backCenter = { x: v4X + isoLen * cos30, y: v4Y - isoLen * sin30 };
  doc.line(baseCenter.x - isoRad * sin30, baseCenter.y - isoRad * cos30, backCenter.x - isoRad * sin30, backCenter.y - isoRad * cos30);
  doc.line(baseCenter.x + isoRad * sin30, baseCenter.y + isoRad * cos30, backCenter.x + isoRad * sin30, backCenter.y + isoRad * cos30);

  doc.setFontSize(8);
  doc.setTextColor(100, 115, 130);
  doc.text('Perspectiva Trimétrica Esqueletal CAD 3D', v4X - 30, v4Y + 25);

  // -------------------------------------------------------------
  // TITLE BLOCK (LEGENDA TÉCNICA ABNT / ISO) - BOTTOM RIGHT CORNER
  // -------------------------------------------------------------
  const tbX = width - margin - 150;
  const tbY = height - margin - 42;
  const tbW = 150;
  const tbH = 42;

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.rect(tbX, tbY, tbW, tbH);

  // Title Block Rows
  doc.setLineWidth(0.3);
  doc.line(tbX, tbY + 10, tbX + tbW, tbY + 10);
  doc.line(tbX, tbY + 22, tbX + tbW, tbY + 22);
  doc.line(tbX, tbY + 32, tbX + tbW, tbY + 32);

  // Columns
  doc.line(tbX + 80, tbY, tbX + 80, tbY + 22);
  doc.line(tbX + 115, tbY + 22, tbX + 115, tbY + 42);

  const tbData = specs.titleBlock || {};
  const displayTitle = tbData.drawingTitle || model.title;
  const displayAuthor = tbData.authorName || authorName;
  const displayTeam = tbData.teamName || specs.teamName || 'MNAnimat AeroSpace';
  const displayDwg = tbData.drawingNumber || `DWG-${model.id.toUpperCase()}`;
  const displayScale = tbData.scale || '1:1';
  const displayDate = tbData.date || new Date().toLocaleDateString('pt-BR');
  const displayRev = tbData.revision || 'REV 01';
  const displayMat = tbData.material || specs.material;
  const displayTol = tbData.tolerance || '± 0.10 mm';

  doc.setFontSize(7);
  doc.setTextColor(100, 115, 130);
  doc.text('ORGANIZAÇÃO / EQUIPE:', tbX + 2, tbY + 4);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(displayTeam.slice(0, 32), tbX + 2, tbY + 8);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 115, 130);
  doc.text('AUTOR / PROJETISTA:', tbX + 82, tbY + 4);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(displayAuthor.slice(0, 30), tbX + 82, tbY + 8);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 115, 130);
  doc.text('TÍTULO DA PEÇA / COMPONENTE:', tbX + 2, tbY + 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text(displayTitle.slice(0, 42), tbX + 2, tbY + 19);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 115, 130);
  doc.text('DESENHO Nº:', tbX + 82, tbY + 14);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(displayDwg.slice(0, 20), tbX + 82, tbY + 19);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 115, 130);
  doc.text('ESCALA:', tbX + 2, tbY + 26);
  doc.text(displayScale, tbX + 2, tbY + 30);

  doc.text('TOLERÂNCIA:', tbX + 35, tbY + 26);
  doc.text(displayTol, tbX + 35, tbY + 30);

  doc.text('DATA:', tbX + 80, tbY + 26);
  doc.text(displayDate, tbX + 80, tbY + 30);

  doc.text('REVISÃO:', tbX + 118, tbY + 26);
  doc.text(displayRev, tbX + 118, tbY + 30);

  doc.text('MATERIAL / APROVAÇÃO RSO:', tbX + 2, tbY + 36);
  doc.setFont('helvetica', 'bold');
  doc.text(`${displayMat.slice(0, 40)} - ✓ APROVADO ISO 128`, tbX + 2, tbY + 40);

  // Save File
  const filename = `${model.title.replace(/\s+/g, '_')}_Desenho_Tecnico_A3.pdf`;
  doc.save(filename);
}

/**
 * Generates ASCII STL string for 3D export
 */
export function generateSTLContent(model: User3DModel, specs: CadParametricSpecs): string {
  const L = specs.lengthMm;
  const R = specs.diameterMm / 2;
  const steps = 32;

  let stl = `solid ${model.title.replace(/\s+/g, '_')}\n`;

  // Helper to add facet
  const addFacet = (n: number[], v1: number[], v2: number[], v3: number[]) => {
    stl += `  facet normal ${n[0]} ${n[1]} ${n[2]}\n`;
    stl += `    outer loop\n`;
    stl += `      vertex ${v1[0]} ${v1[1]} ${v1[2]}\n`;
    stl += `      vertex ${v2[0]} ${v2[1]} ${v2[2]}\n`;
    stl += `      vertex ${v3[0]} ${v3[1]} ${v3[2]}\n`;
    stl += `    endloop\n`;
    stl += `  endfacet\n`;
  };

  // Cylinder body facets
  for (let i = 0; i < steps; i++) {
    const a1 = (i / steps) * Math.PI * 2;
    const a2 = ((i + 1) / steps) * Math.PI * 2;

    const x1 = Math.cos(a1) * R;
    const z1 = Math.sin(a1) * R;
    const x2 = Math.cos(a2) * R;
    const z2 = Math.sin(a2) * R;

    // Normal approximation
    const nx = Math.cos((a1 + a2) / 2);
    const nz = Math.sin((a1 + a2) / 2);

    addFacet([nx, 0, nz], [x1, 0, z1], [x2, 0, z2], [x2, L, z2]);
    addFacet([nx, 0, nz], [x1, 0, z1], [x2, L, z2], [x1, L, z1]);

    // Bottom cap
    addFacet([0, -1, 0], [0, 0, 0], [x2, 0, z2], [x1, 0, z1]);
    // Top cap (if cylinder)
    addFacet([0, 1, 0], [0, L, 0], [x1, L, z1], [x2, L, z2]);
  }

  stl += `endsolid ${model.title.replace(/\s+/g, '_')}\n`;
  return stl;
}

/**
 * Generates Wavefront OBJ string for 3D export
 */
export function generateOBJContent(model: User3DModel, specs: CadParametricSpecs): string {
  const L = specs.lengthMm;
  const R = specs.diameterMm / 2;
  const steps = 32;

  let obj = `# CAD Model Exported: ${model.title}\n`;
  obj += `# Units: Millimeters (mm)\n`;
  obj += `o ${model.title.replace(/\s+/g, '_')}\n`;

  // Vertices
  obj += `v 0.0 0.0 0.0\n`; // Bottom center
  obj += `v 0.0 ${L} 0.0\n`; // Top center

  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const x = Math.cos(a) * R;
    const z = Math.sin(a) * R;
    obj += `v ${x.toFixed(4)} 0.0000 ${z.toFixed(4)}\n`;
    obj += `v ${x.toFixed(4)} ${L.toFixed(4)} ${z.toFixed(4)}\n`;
  }

  // Faces
  for (let i = 0; i < steps; i++) {
    const b1 = 3 + i * 2;
    const t1 = 4 + i * 2;
    const b2 = i === steps - 1 ? 3 : 3 + (i + 1) * 2;
    const t2 = i === steps - 1 ? 4 : 4 + (i + 1) * 2;

    obj += `f ${b1} ${b2} ${t2}\n`;
    obj += `f ${b1} ${t2} ${t1}\n`;
  }

  return obj;
}

/**
 * Generates CNC Turning / Milling G-Code File (.gcode)
 */
export function generateGCodeContent(model: User3DModel, specs: CadParametricSpecs): string {
  const L = specs.lengthMm;
  const D = specs.diameterMm;
  const R = D / 2;

  return `( =================================================== )
( MNANIMAT AEROSPACE - GERADOR DE CÓDIGO G PARA CNC )
( PEÇA: ${model.title.toUpperCase()} )
( MATERIAL: ${specs.material.toUpperCase()} )
( DIMENSÕES: COMPRIMENTO ${L}mm | DIÂMETRO ${D}mm )
( DATA: ${new Date().toISOString().split('T')[0]} )
( =================================================== )

G21 ( Unidades em milímetros )
G90 ( Posicionamento absoluto )
G18 ( Plano ZX para Torno CNC )
G94 ( Avanço mm/min )

( TROCA DE FERRAMENTA )
T0101 ( Ferramenta de Desbaste Externo R0.4 )
M03 S2200 ( Liga Spindle a 2200 RPM )
M08 ( Liga Fluido de Refrigeração )

( APROXIMAÇÃO DE SEGURANÇA )
G00 X${(D + 10).toFixed(2)} Z5.0
G00 Z2.0

( PASSE DE FACEAMENTO )
G01 X-0.5 F150.0
G00 Z5.0
G00 X${(D + 2).toFixed(2)}

( PASSE DE DESBASTE CILÍNDRICO )
G01 Z-${L.toFixed(2)} F250.0
G01 X${(D + 5).toFixed(2)} F400.0
G00 Z5.0

( USINAGEM DA COIFA OGIVAL )
G01 X${(D * 0.8).toFixed(2)} Z-10.0 F180.0
G02 X${D.toFixed(2)} Z-35.0 R${R.toFixed(2)} F150.0

( PASSE DE ACABAMENTO FINAL )
G00 X${(D + 15).toFixed(2)}
M09 ( Desliga Refrigeração )
M05 ( Parada do Spindle )
G00 Z100.0 ( Retorno à posição inicial )
M30 ( Fim do Programa )
`;
}

/**
 * Generates Parametric OpenSCAD Script (.scad)
 */
export function generateOpenSCADContent(model: User3DModel, specs: CadParametricSpecs): string {
  const L = specs.lengthMm;
  const D = specs.diameterMm;
  const R = D / 2;
  const t = specs.wallThicknessMm || 3.0;

  return `// ===================================================
// OPENSCAD CAD PARAMÉTRICO - MNANIMAT AEROSPACE 3D
// Peça: ${model.title}
// ===================================================

$fn = 100; // Resolução de curvatura

length_mm = ${L};
outer_diameter_mm = ${D};
wall_thickness_mm = ${t};
fin_count = ${specs.finCount};

module nosecone() {
    difference() {
        cylinder(h = length_mm * 0.25, r1 = outer_diameter_mm / 2, r2 = 0);
        cylinder(h = length_mm * 0.25 - 2, r1 = (outer_diameter_mm / 2) - wall_thickness_mm, r2 = 0);
    }
}

module body_tube() {
    difference() {
        cylinder(h = length_mm * 0.75, r = outer_diameter_mm / 2);
        translate([0, 0, -1])
            cylinder(h = length_mm * 0.75 + 2, r = (outer_diameter_mm / 2) - wall_thickness_mm);
    }
}

module fin() {
    linear_extrude(height = 3.0) {
        polygon(points = [[0, 0], [60, 20], [40, 80], [0, 80]]);
    }
}

// ASSEMBLE MODEL
translate([0, 0, length_mm * 0.75])
    nosecone();

body_tube();

// CIRCULAR PATTERN FINS
for (i = [0 : fin_count - 1]) {
    rotate([0, 0, i * (360 / fin_count)])
        translate([outer_diameter_mm / 2, 0, 10])
            rotate([90, 0, 0])
                fin();
}
`;
}

/**
 * Generates AutoCAD DXF 2D Drawing (.dxf)
 */
export function generateDXFContent(model: User3DModel, specs: CadParametricSpecs): string {
  const L = specs.lengthMm;
  const D = specs.diameterMm;

  return `0
SECTION
2
HEADER
9
$ACADVER
1
AC1009
0
ENDSEC
0
SECTION
2
ENTITIES
0
LINE
8
0
10
0.0
20
0.0
11
${L.toFixed(2)}
21
0.0
0
LINE
8
0
10
0.0
20
${(D / 2).toFixed(2)}
11
${L.toFixed(2)}
21
${(D / 2).toFixed(2)}
0
LINE
8
0
10
0.0
20
-${(D / 2).toFixed(2)}
11
${L.toFixed(2)}
21
-${(D / 2).toFixed(2)}
0
ENDSEC
0
EOF
`;
}

/**
 * Generates JSON CAD Spec File (.json)
 */
export function generateCADJsonContent(model: User3DModel, specs: CadParametricSpecs): string {
  return JSON.stringify(
    {
      cadStandard: 'FogueteData-CAD-v2.0',
      modelId: model.id,
      title: model.title,
      author: model.author,
      createdAt: model.createdAt,
      parametricSpecs: {
        ...specs,
        units: 'millimeters',
        tolerance: 0.1
      },
      geometryMesh: {
        primitiveShape: model.primitiveShape,
        meshType: model.meshType,
        color: model.color,
        transform: {
          position: [model.posX, model.posY, model.posZ],
          rotation: [model.rotX, model.rotY, model.rotZ],
          scale: [model.scaleX, model.scaleY, model.scaleZ]
        }
      }
    },
    null,
    2
  );
}
