import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { 
  Box, Cpu, Zap, Download, Upload, Plus, Trash2, RotateCw, Move, Check, 
  Sparkles, FileCode, RefreshCw, Sliders, Eye, Save, FolderOpen, Flame, 
  Radio, Activity, Gauge, Layers, Scissors, CheckCircle, AlertCircle, Share2,
  Repeat, Settings, Grid, FileSpreadsheet, Wrench, X
} from 'lucide-react';

export interface PcbPin {
  id: string;
  name: string;
  relX: number; // relative X in mm from component top-left
  relY: number; // relative Y in mm from component top-left
  type: 'vcc' | 'gnd' | 'data' | 'power';
}

export interface PcbComponentTemplate {
  type: string;
  name: string;
  width: number; // mm
  height: number; // mm
  color: string;
  pins: PcbPin[];
  isCustom?: boolean;
}

export interface PcbComponent {
  id: string;
  type: string;
  name: string;
  x: number; // in mm on PCB grid (0 to boardWidth)
  y: number; // in mm on PCB grid (0 to boardHeight)
  rotation: number; // 0, 90, 180, 270 degrees
  width: number; // mm
  height: number; // mm
  color: string;
  pins: PcbPin[];
}

export type RoutingStyle = 'ortho90' | 'curved' | 'diagonal45' | 'direct';

export interface PcbTrace {
  id: string;
  fromCompId: string;
  fromPinId: string;
  toCompId: string;
  toPinId: string;
  netName: string;
  layer: 'top' | 'bottom';
  color: string;
  width: number; // mm trace width (e.g. 0.5mm, 0.8mm, 1.2mm, 2.5mm)
  routingStyle?: RoutingStyle; // 'ortho90' | 'curved' | 'diagonal45' | 'direct'
  points: { x: number; y: number }[];
}

export function generateTraceSvgPath(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  style: RoutingStyle = 'ortho90',
  scale: number = 5
): string {
  const x1 = p1.x * scale;
  const y1 = p1.y * scale;
  const x2 = p2.x * scale;
  const y2 = p2.y * scale;

  if (style === 'direct') {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  if (style === 'curved') {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    if (dx > dy) {
      const midX = (x1 + x2) / 2;
      return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
    } else {
      const midY = (y1 + y2) / 2;
      return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
    }
  }

  if (style === 'diagonal45') {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx > absDy) {
      const midX = dx > 0 ? x1 + (absDx - absDy) : x1 - (absDx - absDy);
      return `M ${x1} ${y1} L ${midX} ${y1} L ${x2} ${y2}`;
    } else {
      const midY = dy > 0 ? y1 + (absDy - absDx) : y1 - (absDy - absDx);
      return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${y2}`;
    }
  }

  // Default 'ortho90' (90 degrees orthogonal)
  const xMid = (x1 + x2) / 2;
  return `M ${x1} ${y1} L ${xMid} ${y1} L ${xMid} ${y2} L ${x2} ${y2}`;
}

export interface PcbProject {
  version: string;
  projectName: string;
  boardWidth: number; // mm
  boardHeight: number; // mm
  solderMaskColor: string; // '#0f3818', '#111111', '#1e3a8a', '#7f1d1d'
  components: PcbComponent[];
  traces: PcbTrace[];
}

// Preset Library Items
const DEFAULT_PRESET_LIBRARY: PcbComponentTemplate[] = [
  {
    type: 'esp32_s3',
    name: 'ESP32-S3 DevKit',
    width: 28,
    height: 52,
    color: '#1e293b',
    pins: [
      { id: '3V3', name: '3.3V', relX: 2, relY: 4, type: 'vcc' },
      { id: 'GND', name: 'GND', relX: 2, relY: 8, type: 'gnd' },
      { id: 'GPIO21', name: 'SDA (21)', relX: 2, relY: 16, type: 'data' },
      { id: 'GPIO22', name: 'SCL (22)', relX: 2, relY: 20, type: 'data' },
      { id: 'GPIO12', name: 'DROGUE (12)', relX: 26, relY: 12, type: 'power' },
      { id: 'GPIO27', name: 'MAIN (27)', relX: 26, relY: 16, type: 'power' },
      { id: 'GPIO5', name: 'LoRa CS (5)', relX: 26, relY: 24, type: 'data' },
      { id: '5V', name: '5V VIN', relX: 2, relY: 48, type: 'vcc' },
    ]
  },
  {
    type: 'bmp280',
    name: 'Barômetro BMP280',
    width: 16,
    height: 20,
    color: '#0284c7',
    pins: [
      { id: 'VCC', name: 'VCC', relX: 2, relY: 4, type: 'vcc' },
      { id: 'GND', name: 'GND', relX: 6, relY: 4, type: 'gnd' },
      { id: 'SCL', name: 'SCL', relX: 10, relY: 4, type: 'data' },
      { id: 'SDA', name: 'SDA', relX: 14, relY: 4, type: 'data' },
    ]
  },
  {
    type: 'mpu6050',
    name: 'IMU MPU6050 6-Eixos',
    width: 20,
    height: 16,
    color: '#0d9488',
    pins: [
      { id: 'VCC', name: 'VCC', relX: 3, relY: 2, type: 'vcc' },
      { id: 'GND', name: 'GND', relX: 7, relY: 2, type: 'gnd' },
      { id: 'SCL', name: 'SCL', relX: 11, relY: 2, type: 'data' },
      { id: 'SDA', name: 'SDA', relX: 15, relY: 2, type: 'data' },
    ]
  },
  {
    type: 'lora_sx1276',
    name: 'LoRa RF SX1276 915MHz',
    width: 26,
    height: 26,
    color: '#7c3aed',
    pins: [
      { id: '3V3', name: '3.3V', relX: 3, relY: 2, type: 'vcc' },
      { id: 'GND', name: 'GND', relX: 7, relY: 2, type: 'gnd' },
      { id: 'NSS', name: 'CS', relX: 11, relY: 2, type: 'data' },
      { id: 'MOSI', name: 'MOSI', relX: 15, relY: 2, type: 'data' },
      { id: 'MISO', name: 'MISO', relX: 19, relY: 2, type: 'data' },
      { id: 'SCK', name: 'SCK', relX: 23, relY: 2, type: 'data' },
    ]
  },
  {
    type: 'mosfet_switch',
    name: 'Módulo Driver MOSFET Ejetor',
    width: 24,
    height: 32,
    color: '#b45309',
    pins: [
      { id: 'VCC', name: '5V/12V', relX: 4, relY: 4, type: 'vcc' },
      { id: 'GND', name: 'GND', relX: 12, relY: 4, type: 'gnd' },
      { id: 'SIG', name: 'SIG (GPIO)', relX: 20, relY: 4, type: 'power' },
      { id: 'OUT_PLUS', name: 'IGN (+)', relX: 6, relY: 28, type: 'power' },
      { id: 'OUT_MINUS', name: 'IGN (-)', relX: 18, relY: 28, type: 'power' },
    ]
  },
  {
    type: 'gps_neo6m',
    name: 'GPS U-Blox NEO-6M',
    width: 25,
    height: 35,
    color: '#0369a1',
    pins: [
      { id: 'VCC', name: 'VCC', relX: 4, relY: 3, type: 'vcc' },
      { id: 'RX', name: 'RX', relX: 9, relY: 3, type: 'data' },
      { id: 'TX', name: 'TX', relX: 14, relY: 3, type: 'data' },
      { id: 'GND', name: 'GND', relX: 19, relY: 3, type: 'gnd' },
    ]
  },
  {
    type: 'buzzer_piezo',
    name: 'Buzzer Sonoro Apogeu',
    width: 12,
    height: 12,
    color: '#15803d',
    pins: [
      { id: 'POS', name: 'POS (+)', relX: 3, relY: 6, type: 'vcc' },
      { id: 'NEG', name: 'NEG (-)', relX: 9, relY: 6, type: 'gnd' },
    ]
  },
  {
    type: 'battery_jst',
    name: 'Conector LiPo XT30/JST',
    width: 14,
    height: 10,
    color: '#dc2626',
    pins: [
      { id: 'POS', name: '+7.4V', relX: 3, relY: 5, type: 'vcc' },
      { id: 'NEG', name: 'GND', relX: 11, relY: 5, type: 'gnd' },
    ]
  }
];

// Presets for default flight boards
const PRESET_BAR_AEB_PROJECT: PcbProject = {
  version: '1.2.0',
  projectName: 'Placa Aviônica de Voo BAR-AEB v2',
  boardWidth: 100, // 100mm
  boardHeight: 80,  // 80mm
  solderMaskColor: '#0f3818', // Classic PCB Green
  components: [
    {
      id: 'comp_esp32',
      type: 'esp32_s3',
      name: 'ESP32-S3 DevKit',
      x: 10,
      y: 14,
      rotation: 0,
      width: 28,
      height: 52,
      color: '#1e293b',
      pins: DEFAULT_PRESET_LIBRARY[0].pins
    },
    {
      id: 'comp_bmp280',
      type: 'bmp280',
      name: 'Barômetro BMP280',
      x: 46,
      y: 12,
      rotation: 0,
      width: 16,
      height: 20,
      color: '#0284c7',
      pins: DEFAULT_PRESET_LIBRARY[1].pins
    },
    {
      id: 'comp_mpu6050',
      type: 'mpu6050',
      name: 'IMU MPU6050 6-Eixos',
      x: 46,
      y: 40,
      rotation: 0,
      width: 20,
      height: 16,
      color: '#0d9488',
      pins: DEFAULT_PRESET_LIBRARY[2].pins
    },
    {
      id: 'comp_lora',
      type: 'lora_sx1276',
      name: 'LoRa RF SX1276 915MHz',
      x: 70,
      y: 10,
      rotation: 0,
      width: 26,
      height: 26,
      color: '#7c3aed',
      pins: DEFAULT_PRESET_LIBRARY[3].pins
    },
    {
      id: 'comp_mosfet',
      type: 'mosfet_switch',
      name: 'Módulo Driver MOSFET Ejetor',
      x: 70,
      y: 42,
      rotation: 0,
      width: 24,
      height: 32,
      color: '#b45309',
      pins: DEFAULT_PRESET_LIBRARY[4].pins
    },
    {
      id: 'comp_battery',
      type: 'battery_jst',
      name: 'Conector LiPo XT30/JST',
      x: 46,
      y: 62,
      rotation: 0,
      width: 14,
      height: 10,
      color: '#dc2626',
      pins: DEFAULT_PRESET_LIBRARY[7].pins
    }
  ],
  traces: [
    {
      id: 'trace_i2c_sda',
      fromCompId: 'comp_esp32',
      fromPinId: 'GPIO21',
      toCompId: 'comp_bmp280',
      toPinId: 'SDA',
      netName: 'I2C_SDA',
      layer: 'top',
      color: '#f59e0b',
      width: 0.8,
      points: [{ x: 12, y: 30 }, { x: 42, y: 30 }, { x: 60, y: 16 }]
    },
    {
      id: 'trace_i2c_scl',
      fromCompId: 'comp_esp32',
      fromPinId: 'GPIO22',
      toCompId: 'comp_bmp280',
      toPinId: 'SCL',
      netName: 'I2C_SCL',
      layer: 'top',
      color: '#06b6d4',
      width: 0.8,
      points: [{ x: 12, y: 34 }, { x: 38, y: 34 }, { x: 56, y: 16 }]
    },
    {
      id: 'trace_eject_gate',
      fromCompId: 'comp_esp32',
      fromPinId: 'GPIO12',
      toCompId: 'comp_mosfet',
      toPinId: 'SIG',
      netName: 'IGNITION_DROGUE',
      layer: 'bottom',
      color: '#ef4444',
      width: 1.2,
      points: [{ x: 36, y: 26 }, { x: 90, y: 46 }]
    }
  ]
};

export const PcbStudio2D3D: React.FC = () => {
  const [project, setProject] = useState<PcbProject>(PRESET_BAR_AEB_PROJECT);
  const [activeTab, setActiveTab] = useState<'2d' | '3d'>('2d');
  const [componentLibrary, setComponentLibrary] = useState<PcbComponentTemplate[]>(DEFAULT_PRESET_LIBRARY);
  
  // Grid & Drag settings
  const [gridSnap, setGridSnap] = useState<number>(1); // 1mm, 2mm, 5mm grid snap
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);

  // Dragging state on 2D PCB Canvas
  const [draggingCompId, setDraggingCompId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ mouseX: number; mouseY: number; compX: number; compY: number }>({ mouseX: 0, mouseY: 0, compX: 0, compY: 0 });
  const pcbCanvasRef = useRef<HTMLDivElement>(null);

  // Wire / Routing Tool state
  const [toolMode, setToolMode] = useState<'select' | 'route' | 'delete'>('select');
  const [routeStartPin, setRouteStartPin] = useState<{ compId: string; pinId: string } | null>(null);
  const [mouseCanvasPos, setMouseCanvasPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeLayer, setActiveLayer] = useState<'top' | 'bottom'>('top');
  const [selectedTraceWidth, setSelectedTraceWidth] = useState<number>(0.8);
  const [selectedTraceColor, setSelectedTraceColor] = useState<string>('#f59e0b');
  const [netNameInput, setNetNameInput] = useState<string>('NET_WIRE');
  const [selectedRoutingStyle, setSelectedRoutingStyle] = useState<RoutingStyle>('ortho90');

  const handleApplyGlobalRoutingStyle = (style: RoutingStyle) => {
    setSelectedRoutingStyle(style);
    setProject((prev) => ({
      ...prev,
      traces: prev.traces.map((t) => ({ ...t, routingStyle: style }))
    }));
  };

  const handleChangeTraceRoutingStyle = (traceId: string, style: RoutingStyle) => {
    setProject((prev) => ({
      ...prev,
      traces: prev.traces.map((t) => (t.id === traceId ? { ...t, routingStyle: style } : t))
    }));
  };

  // Custom Component Creator Modal State
  const [isCustomCompModalOpen, setIsCustomCompModalOpen] = useState<boolean>(false);
  const [customCompName, setCustomCompName] = useState<string>('Sensor Customizado XYZ');
  const [customCompWidth, setCustomCompWidth] = useState<number>(20);
  const [customCompHeight, setCustomCompHeight] = useState<number>(25);
  const [customCompColor, setCustomCompColor] = useState<string>('#3b82f6');
  const [customPins, setCustomPins] = useState<PcbPin[]>([
    { id: 'p1', name: 'VCC', relX: 3, relY: 3, type: 'vcc' },
    { id: 'p2', name: 'GND', relX: 10, relY: 3, type: 'gnd' },
    { id: 'p3', name: 'OUT', relX: 17, relY: 3, type: 'data' }
  ]);

  // Production Export Modal
  const [isProductionExportOpen, setIsProductionExportOpen] = useState<boolean>(false);

  // 3D Canvas Refs
  const canvas3dRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const boardGroupRef = useRef<THREE.Group | null>(null);
  const [is3dRotating, setIs3dRotating] = useState<boolean>(true);
  const [isExplodedView, setIsExplodedView] = useState<boolean>(false);

  // -------------------------------------------------------------
  // EXPORT & IMPORT HANDLERS
  // -------------------------------------------------------------
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${project.projectName.toLowerCase().replace(/\s+/g, '_')}_config.pcb.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.components) && parsed.boardWidth) {
          setProject(parsed);
          setSelectedCompId(null);
          setSelectedTraceId(null);
        } else {
          alert('Arquivo de circuito PCB inválido!');
        }
      } catch (err) {
        alert('Erro ao carregar o arquivo de circuito JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // -------------------------------------------------------------
  // PRODUCTION EXPORTS (Gerber, Drill, BOM, CPL, Netlist)
  // -------------------------------------------------------------
  const downloadTextFile = (filename: string, text: string, mime: string = 'text/plain') => {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 1. Gerber Top Copper Layer (.GTL)
  const generateGerberTopCopper = () => {
    let g = `%FSLAX34Y34*%\n%MOIN*%\n%G04 Gerber RS-274X Top Copper (.GTL) - ${project.projectName}*%\n`;
    g += `%ADD10C,0.2000*%\n%ADD11R,1.5000X1.5000*%\n%ADD12C,1.0000*%\n`;
    g += `G04 Board Edge Outline*%\nX0Y0D02*\nX${project.boardWidth * 1000}Y0D01*\nX${project.boardWidth * 1000}Y${project.boardHeight * 1000}D01*\nX0Y${project.boardHeight * 1000}D01*\nX0Y0D01*\n`;
    
    project.traces.filter(t => t.layer === 'top').forEach((t) => {
      g += `G04 Net Trace ${t.netName} (Width: ${t.width}mm)*%\n`;
      t.points.forEach((pt, idx) => {
        const x = Math.round(pt.x * 1000);
        const y = Math.round(pt.y * 1000);
        g += `X${x}Y${y}${idx === 0 ? 'D02*' : 'D01*'}\n`;
      });
    });

    project.components.forEach((c) => {
      c.pins.forEach((p) => {
        const px = Math.round((c.x + p.relX) * 1000);
        const py = Math.round((c.y + p.relY) * 1000);
        g += `D11*\nX${px}Y${py}D03*\n`;
      });
    });

    return g + `M02*\n`;
  };

  // 2. NC Drill Excellon (.DRL)
  const generateExcellonDrill = () => {
    let d = `; NC Drill File Excellon Format for CNC PCB Manufacturing\n; Project: ${project.projectName}\n; Units: MM\nM48\nMETRIC,TZ\nT1C0.800\nT2C1.200\n%\nT1\n`;
    project.components.forEach((c) => {
      c.pins.forEach((p) => {
        const px = (c.x + p.relX).toFixed(3);
        const py = (c.y + p.relY).toFixed(3);
        d += `X${px}Y${py}\n`;
      });
    });
    return d + `M30\n`;
  };

  // 3. Bill of Materials BOM (.CSV for JLCPCB/PCBWay)
  const generateBomCsv = () => {
    let bom = `Comment,Designator,Footprint,LCSC Part Number,Quantity\n`;
    const counts: { [key: string]: { count: number; comp: PcbComponent } } = {};
    project.components.forEach((c, idx) => {
      if (!counts[c.type]) {
        counts[c.type] = { count: 0, comp: c };
      }
      counts[c.type].count++;
    });

    Object.keys(counts).forEach((type, i) => {
      const item = counts[type];
      const desig = `U${i + 1}`;
      bom += `"${item.comp.name}","${desig}","${type.toUpperCase()}","C${10000 + i * 235}",${item.count}\n`;
    });
    return bom;
  };

  // 4. Pick & Place CPL (.CSV)
  const generateCplCsv = () => {
    let cpl = `Designator,Val,Package,Mid X,Mid Y,Rotation,Layer\n`;
    project.components.forEach((c, idx) => {
      const desig = `U${idx + 1}`;
      const midX = (c.x + c.width / 2).toFixed(2);
      const midY = (c.y + c.height / 2).toFixed(2);
      cpl += `"${desig}","${c.name}","${c.type.toUpperCase()}",${midX},${midY},${c.rotation},"Top"\n`;
    });
    return cpl;
  };

  // -------------------------------------------------------------
  // COMPONENT MOVEMENT & DRAG-AND-DROP HANDLERS
  // -------------------------------------------------------------
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Deselect if clicking blank canvas space
    if (e.target === pcbCanvasRef.current) {
      setSelectedCompId(null);
      setSelectedTraceId(null);
    }
  };

  const handleComponentMouseDown = (e: React.MouseEvent, comp: PcbComponent) => {
    e.stopPropagation();
    if (toolMode === 'delete') {
      handleDeleteComponent(comp.id);
      return;
    }

    if (toolMode === 'select') {
      setSelectedCompId(comp.id);
      setSelectedTraceId(null);
      setDraggingCompId(comp.id);
      setDragStartPos({
        mouseX: e.clientX,
        mouseY: e.clientY,
        compX: comp.x,
        compY: comp.y
      });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!pcbCanvasRef.current) return;
    const rect = pcbCanvasRef.current.getBoundingClientRect();
    const currentXMm = Math.round((e.clientX - rect.left) / 5);
    const currentYMm = Math.round((e.clientY - rect.top) / 5);
    setMouseCanvasPos({ x: currentXMm, y: currentYMm });

    // Handle component dragging
    if (draggingCompId && toolMode === 'select') {
      const deltaXMm = (e.clientX - dragStartPos.mouseX) / 5;
      const deltaYMm = (e.clientY - dragStartPos.mouseY) / 5;

      let newX = dragStartPos.compX + deltaXMm;
      let newY = dragStartPos.compY + deltaYMm;

      // Apply grid snap
      newX = Math.round(newX / gridSnap) * gridSnap;
      newY = Math.round(newY / gridSnap) * gridSnap;

      // Clamp within PCB borders
      const comp = project.components.find((c) => c.id === draggingCompId);
      const compW = comp ? comp.width : 20;
      const compH = comp ? comp.height : 20;

      newX = Math.max(0, Math.min(project.boardWidth - compW, newX));
      newY = Math.max(0, Math.min(project.boardHeight - compH, newY));

      setProject((prev) => ({
        ...prev,
        components: prev.components.map((c) =>
          c.id === draggingCompId ? { ...c, x: newX, y: newY } : c
        )
      }));
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggingCompId(null);
  };

  // -------------------------------------------------------------
  // COMPONENT ACTIONS (Swap, Rotate, Delete, Add, Drop)
  // -------------------------------------------------------------
  const handleAddComponent = (compTemplate: PcbComponentTemplate) => {
    const newComp: PcbComponent = {
      id: `comp_${Date.now().toString().slice(-6)}`,
      type: compTemplate.type,
      name: compTemplate.name,
      x: 10 + Math.floor(Math.random() * Math.max(10, project.boardWidth - compTemplate.width - 20)),
      y: 10 + Math.floor(Math.random() * Math.max(10, project.boardHeight - compTemplate.height - 20)),
      rotation: 0,
      width: compTemplate.width,
      height: compTemplate.height,
      color: compTemplate.color,
      pins: compTemplate.pins
    };

    setProject((prev) => ({
      ...prev,
      components: [...prev.components, newComp]
    }));
    setSelectedCompId(newComp.id);
  };

  const handleDropOnBoard = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const compType = e.dataTransfer.getData('text/plain');
    if (!compType || !pcbCanvasRef.current) return;

    const template = componentLibrary.find((t) => t.type === compType);
    if (!template) return;

    const rect = pcbCanvasRef.current.getBoundingClientRect();
    let dropX = Math.round((e.clientX - rect.left) / 5 - template.width / 2);
    let dropY = Math.round((e.clientY - rect.top) / 5 - template.height / 2);

    dropX = Math.max(0, Math.min(project.boardWidth - template.width, dropX));
    dropY = Math.max(0, Math.min(project.boardHeight - template.height, dropY));

    // Snap to grid
    dropX = Math.round(dropX / gridSnap) * gridSnap;
    dropY = Math.round(dropY / gridSnap) * gridSnap;

    const newComp: PcbComponent = {
      id: `comp_${Date.now().toString().slice(-6)}`,
      type: template.type,
      name: template.name,
      x: dropX,
      y: dropY,
      rotation: 0,
      width: template.width,
      height: template.height,
      color: template.color,
      pins: template.pins
    };

    setProject((prev) => ({
      ...prev,
      components: [...prev.components, newComp]
    }));
    setSelectedCompId(newComp.id);
  };

  const handleSwapComponent = (compId: string, targetType: string) => {
    const template = componentLibrary.find((t) => t.type === targetType);
    if (!template) return;

    setProject((prev) => ({
      ...prev,
      components: prev.components.map((c) => {
        if (c.id === compId) {
          return {
            ...c,
            type: template.type,
            name: template.name,
            width: template.width,
            height: template.height,
            color: template.color,
            pins: template.pins
          };
        }
        return c;
      })
    }));
  };

  const handleRotateComponent = (id: string) => {
    setProject((prev) => ({
      ...prev,
      components: prev.components.map((c) =>
        c.id === id ? { ...c, rotation: (c.rotation + 90) % 360 } : c
      )
    }));
  };

  const handleDeleteComponent = (id: string) => {
    setProject((prev) => ({
      ...prev,
      components: prev.components.filter((c) => c.id !== id),
      traces: prev.traces.filter((t) => t.fromCompId !== id && t.toCompId !== id)
    }));
    if (selectedCompId === id) setSelectedCompId(null);
  };

  // -------------------------------------------------------------
  // CUSTOM COMPONENT CREATOR HANDLERS
  // -------------------------------------------------------------
  const handleAddCustomPin = () => {
    const newPinId = `p_${customPins.length + 1}`;
    setCustomPins([
      ...customPins,
      { id: newPinId, name: `PIN_${customPins.length + 1}`, relX: 5, relY: 5, type: 'data' }
    ]);
  };

  const handleSaveCustomComponent = () => {
    const customTemplate: PcbComponentTemplate = {
      type: `custom_${Date.now().toString().slice(-6)}`,
      name: customCompName || 'Componente Customizado',
      width: Number(customCompWidth) || 20,
      height: Number(customCompHeight) || 20,
      color: customCompColor || '#3b82f6',
      pins: customPins,
      isCustom: true
    };

    setComponentLibrary((prev) => [...prev, customTemplate]);
    handleAddComponent(customTemplate);
    setIsCustomCompModalOpen(false);
  };

  // -------------------------------------------------------------
  // WIRE / TRACE ROUTING HANDLERS
  // -------------------------------------------------------------
  const handlePinClick = (compId: string, pinId: string) => {
    if (toolMode !== 'route') return;

    if (!routeStartPin) {
      setRouteStartPin({ compId, pinId });
    } else {
      if (routeStartPin.compId === compId && routeStartPin.pinId === pinId) {
        setRouteStartPin(null);
        return;
      }

      const fromComp = project.components.find((c) => c.id === routeStartPin.compId);
      const toComp = project.components.find((c) => c.id === compId);

      if (fromComp && toComp) {
        const fromPin = fromComp.pins.find((p) => p.id === routeStartPin.pinId);
        const toPin = toComp.pins.find((p) => p.id === pinId);

        const p1 = { x: fromComp.x + (fromPin?.relX || 0), y: fromComp.y + (fromPin?.relY || 0) };
        const p2 = { x: toComp.x + (toPin?.relX || 0), y: toComp.y + (toPin?.relY || 0) };

        const newTrace: PcbTrace = {
          id: `trace_${Date.now().toString().slice(-6)}`,
          fromCompId: routeStartPin.compId,
          fromPinId: routeStartPin.pinId,
          toCompId: compId,
          toPinId: pinId,
          netName: netNameInput || 'WIRE_NET',
          layer: activeLayer,
          color: selectedTraceColor,
          width: selectedTraceWidth,
          routingStyle: selectedRoutingStyle,
          points: [p1, p2]
        };

        setProject((prev) => ({
          ...prev,
          traces: [...prev.traces, newTrace]
        }));
      }

      setRouteStartPin(null);
    }
  };

  const handleDeleteTrace = (traceId: string) => {
    setProject((prev) => ({
      ...prev,
      traces: prev.traces.filter((t) => t.id !== traceId)
    }));
    if (selectedTraceId === traceId) setSelectedTraceId(null);
  };

  // -------------------------------------------------------------
  // THREE.JS 3D SCENE RENDERER
  // -------------------------------------------------------------
  useEffect(() => {
    if (activeTab !== '3d' || !canvas3dRef.current) return;

    const width = canvas3dRef.current.clientWidth;
    const height = canvas3dRef.current.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030712');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 120, 140);
    camera.lookAt(0, 0, 0);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(100, 150, 100);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.8);
    dirLight2.position.set(-100, -50, -100);
    scene.add(dirLight2);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    canvas3dRef.current.innerHTML = '';
    canvas3dRef.current.appendChild(renderer.domElement);

    // 4. Build 3D Board Group
    const boardGroup = new THREE.Group();
    boardGroupRef.current = boardGroup;
    scene.add(boardGroup);

    // PCB FR4 Base Substrate
    const boardW = project.boardWidth;
    const boardH = project.boardHeight;
    const boardThickness = 1.6;

    const boardGeo = new THREE.BoxGeometry(boardW, boardThickness, boardH);
    const boardMat = new THREE.MeshStandardMaterial({
      color: project.solderMaskColor,
      roughness: 0.3,
      metalness: 0.2
    });
    const pcbMesh = new THREE.Mesh(boardGeo, boardMat);
    pcbMesh.position.set(0, -boardThickness / 2, 0);
    boardGroup.add(pcbMesh);

    // Gold Bevel Edge Contact
    const edgeGeo = new THREE.BoxGeometry(boardW + 0.4, 0.2, boardH + 0.4);
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, metalness: 0.9, roughness: 0.1 });
    const edgeMesh = new THREE.Mesh(edgeGeo, edgeMat);
    edgeMesh.position.set(0, -boardThickness - 0.1, 0);
    boardGroup.add(edgeMesh);

    // Render Components in 3D
    const compYOffset = isExplodedView ? 15 : 0;

    project.components.forEach((c) => {
      const compGroup = new THREE.Group();
      
      const posX = c.x + c.width / 2 - boardW / 2;
      const posZ = c.y + c.height / 2 - boardH / 2;

      const bodyHeight = c.type === 'esp32_s3' ? 4 : c.type === 'battery_jst' ? 10 : 3.5;
      const bodyGeo = new THREE.BoxGeometry(c.width, bodyHeight, c.height);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: c.color,
        roughness: 0.4,
        metalness: 0.5
      });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.position.set(0, bodyHeight / 2 + compYOffset, 0);
      compGroup.add(bodyMesh);

      // Pins
      c.pins.forEach((pin) => {
        const pinGeo = new THREE.CylinderGeometry(0.8, 0.8, bodyHeight + 1.2, 8);
        const pinMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
        const pinMesh = new THREE.Mesh(pinGeo, pinMat);

        const pinX = pin.relX - c.width / 2;
        const pinZ = pin.relY - c.height / 2;
        pinMesh.position.set(pinX, bodyHeight / 2 + compYOffset, pinZ);
        compGroup.add(pinMesh);
      });

      compGroup.position.set(posX, 0, posZ);
      compGroup.rotation.y = (c.rotation * Math.PI) / 180;
      boardGroup.add(compGroup);
    });

    // Render Copper Traces in 3D
    project.traces.forEach((t) => {
      if (t.points.length >= 2) {
        const yPos = t.layer === 'top' ? 0.2 : -boardThickness - 0.2;
        const p1 = t.points[0];
        const p2 = t.points[t.points.length - 1];
        const style = t.routingStyle || 'ortho90';

        let pts3D: THREE.Vector3[] = [];
        if (style === 'direct') {
          pts3D = [
            new THREE.Vector3(p1.x - boardW / 2, yPos, p1.y - boardH / 2),
            new THREE.Vector3(p2.x - boardW / 2, yPos, p2.y - boardH / 2)
          ];
        } else if (style === 'curved') {
          const dx = Math.abs(p2.x - p1.x);
          const dy = Math.abs(p2.y - p1.y);
          if (dx > dy) {
            const midX = (p1.x + p2.x) / 2;
            for (let i = 0; i <= 10; i++) {
              const u = i / 10;
              const x = Math.pow(1 - u, 2) * p1.x + 2 * (1 - u) * u * midX + Math.pow(u, 2) * p2.x;
              const z = Math.pow(1 - u, 2) * p1.y + 2 * (1 - u) * u * p1.y + Math.pow(u, 2) * p2.y;
              pts3D.push(new THREE.Vector3(x - boardW / 2, yPos, z - boardH / 2));
            }
          } else {
            const midY = (p1.y + p2.y) / 2;
            for (let i = 0; i <= 10; i++) {
              const u = i / 10;
              const x = Math.pow(1 - u, 2) * p1.x + 2 * (1 - u) * u * p1.x + Math.pow(u, 2) * p2.x;
              const z = Math.pow(1 - u, 2) * p1.y + 2 * (1 - u) * u * midY + Math.pow(u, 2) * p2.y;
              pts3D.push(new THREE.Vector3(x - boardW / 2, yPos, z - boardH / 2));
            }
          }
        } else if (style === 'diagonal45') {
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);

          if (absDx > absDy) {
            const midX = dx > 0 ? p1.x + (absDx - absDy) : p1.x - (absDx - absDy);
            pts3D = [
              new THREE.Vector3(p1.x - boardW / 2, yPos, p1.y - boardH / 2),
              new THREE.Vector3(midX - boardW / 2, yPos, p1.y - boardH / 2),
              new THREE.Vector3(p2.x - boardW / 2, yPos, p2.y - boardH / 2)
            ];
          } else {
            const midY = dy > 0 ? p1.y + (absDy - absDx) : p1.y - (absDy - absDx);
            pts3D = [
              new THREE.Vector3(p1.x - boardW / 2, yPos, p1.y - boardH / 2),
              new THREE.Vector3(p1.x - boardW / 2, yPos, midY - boardH / 2),
              new THREE.Vector3(p2.x - boardW / 2, yPos, p2.y - boardH / 2)
            ];
          }
        } else {
          // ortho90
          const xMid = (p1.x + p2.x) / 2;
          pts3D = [
            new THREE.Vector3(p1.x - boardW / 2, yPos, p1.y - boardH / 2),
            new THREE.Vector3(xMid - boardW / 2, yPos, p1.y - boardH / 2),
            new THREE.Vector3(xMid - boardW / 2, yPos, p2.y - boardH / 2),
            new THREE.Vector3(p2.x - boardW / 2, yPos, p2.y - boardH / 2)
          ];
        }

        const curve = new THREE.CatmullRomCurve3(pts3D);
        const tubeGeo = new THREE.TubeGeometry(curve, 20, t.width / 2, 8, false);
        const tubeMat = new THREE.MeshStandardMaterial({
          color: t.layer === 'top' ? t.color : '#3b82f6',
          metalness: 0.8,
          roughness: 0.2
        });
        const traceMesh = new THREE.Mesh(tubeGeo, tubeMat);
        boardGroup.add(traceMesh);
      }
    });

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (boardGroupRef.current && is3dRotating) {
        boardGroupRef.current.rotation.y += 0.006;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
      }
    };
  }, [activeTab, project, is3dRotating, isExplodedView]);

  const selectedComp = project.components.find((c) => c.id === selectedCompId);
  const selectedTrace = project.traces.find((t) => t.id === selectedTraceId);

  return (
    <div className="space-y-4 font-mono text-xs">
      
      {/* HEADER & FILE IMPORT / EXPORT BAR */}
      <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-950/60 border border-amber-800/80 rounded-lg text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={project.projectName}
                onChange={(e) => setProject({ ...project, projectName: e.target.value })}
                className="bg-slate-900 border border-slate-800 text-white font-bold px-2 py-1 rounded text-sm focus:outline-none focus:border-amber-500 font-mono w-64"
              />
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                Gerber & JLCPCB Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Dimensões da Placa: {project.boardWidth}mm x {project.boardHeight}mm | Componentes: {project.components.length} | Trilhas: {project.traces.length}
            </p>
          </div>
        </div>

        {/* Action Buttons: Import, Export JSON, Real Life Production */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* View Tab Buttons */}
          <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setActiveTab('2d')}
              className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === '2d' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Move className="w-3.5 h-3.5" /> Layout 2D
            </button>
            <button
              onClick={() => setActiveTab('3d')}
              className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === '3d' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" /> Placa em 3D
            </button>
          </div>

          {/* Import JSON File Button */}
          <label className="bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800 px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 transition shadow">
            <Upload className="w-4 h-4 text-cyan-400" />
            Importar arquivo
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          {/* Export JSON Button */}
          <button
            onClick={handleExportJson}
            className="bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow shadow-amber-950"
          >
            <Save className="w-4 h-4" /> Exportar JSON
          </button>

          {/* Real Life Production Suite Button */}
          <button
            onClick={() => setIsProductionExportOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow shadow-emerald-950"
          >
            <Download className="w-4 h-4" /> Produção Real (.GBR / BOM)
          </button>
        </div>
      </div>

      {/* 2D INTERACTIVE WORKBENCH MODE */}
      {activeTab === '2d' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* Left Panel: Component Catalog, Custom Component Creator, Wiring Tools */}
          <div className="bg-[#0b0f17] border border-slate-800 p-4 rounded-xl space-y-4 lg:col-span-1">
            
            {/* Header + Add Custom Component */}
            <div className="font-bold text-xs text-white border-b border-slate-800 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Cpu className="w-4 h-4" /> Catálogo de Componentes
              </span>
              <button
                onClick={() => setIsCustomCompModalOpen(true)}
                className="text-[10px] bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-bold flex items-center gap-1 transition"
              >
                <Plus className="w-3 h-3" /> Criar Custom
              </button>
            </div>

            {/* Component Preset List */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {componentLibrary.map((comp) => (
                <div
                  key={comp.type}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', comp.type);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => handleAddComponent(comp)}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-800/90 hover:border-amber-500/50 p-2.5 rounded-lg cursor-grab active:cursor-grabbing transition flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-200 text-xs group-hover:text-amber-300 flex items-center gap-1.5">
                      <span>{comp.name}</span>
                      {comp.isCustom && <span className="text-[9px] bg-blue-950 text-blue-400 px-1.5 py-0.2 rounded border border-blue-800">Custom</span>}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{comp.width}x{comp.height}mm | {comp.pins.length} pinos</div>
                  </div>
                  <Plus className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
                </div>
              ))}
            </div>

            {/* Custom Wiring / Trace Controls */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="font-bold text-xs text-white flex items-center justify-between text-cyan-400">
                <span className="flex items-center gap-1.5"><Scissors className="w-4 h-4" /> Conectar Fios / Trilhas</span>
                <span className="text-[10px] text-slate-500">Grid Snap: {gridSnap}mm</span>
              </div>

              {/* Mode Toggle: Mover / Trilha / Excluir */}
              <div className="grid grid-cols-3 gap-1 text-[10px]">
                <button
                  onClick={() => { setToolMode('select'); setRouteStartPin(null); }}
                  className={`py-1.5 rounded border text-center font-bold flex items-center justify-center gap-1 ${
                    toolMode === 'select' ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <Move className="w-3 h-3" /> Mover
                </button>
                <button
                  onClick={() => { setToolMode('route'); setSelectedCompId(null); }}
                  className={`py-1.5 rounded border text-center font-bold flex items-center justify-center gap-1 ${
                    toolMode === 'route' ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <Scissors className="w-3 h-3" /> Trilha
                </button>
                <button
                  onClick={() => { setToolMode('delete'); setRouteStartPin(null); }}
                  className={`py-1.5 rounded border text-center font-bold flex items-center justify-center gap-1 ${
                    toolMode === 'delete' ? 'bg-red-600 text-white border-red-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <Trash2 className="w-3 h-3" /> Excluir
                </button>
              </div>

              {/* Custom Trace Settings */}
              {toolMode === 'route' && (
                <div className="space-y-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Camada de Cobre:</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setActiveLayer('top')}
                        className={`px-2 py-0.5 rounded font-bold border ${activeLayer === 'top' ? 'bg-red-950 text-red-300 border-red-800' : 'bg-slate-900 text-slate-500 border-slate-800'}`}
                      >
                        Top Layer
                      </button>
                      <button
                        onClick={() => setActiveLayer('bottom')}
                        className={`px-2 py-0.5 rounded font-bold border ${activeLayer === 'bottom' ? 'bg-blue-950 text-blue-300 border-blue-800' : 'bg-slate-900 text-slate-500 border-slate-800'}`}
                      >
                        Bottom Layer
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Espessura Trilha:</span>
                    <select
                      value={selectedTraceWidth}
                      onChange={(e) => setSelectedTraceWidth(Number(e.target.value))}
                      className="bg-slate-900 text-slate-200 border border-slate-800 rounded px-1.5 py-0.5"
                    >
                      <option value={0.5}>0.5mm (Sinal)</option>
                      <option value={0.8}>0.8mm (Padrão)</option>
                      <option value={1.2}>1.2mm (Alimentação)</option>
                      <option value={2.5}>2.5mm (Alta Corrente)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Formato / Rota:</span>
                    <select
                      value={selectedRoutingStyle}
                      onChange={(e) => setSelectedRoutingStyle(e.target.value as RoutingStyle)}
                      className="bg-slate-900 text-cyan-300 border border-slate-800 rounded px-1.5 py-0.5 font-bold"
                    >
                      <option value="ortho90">90º Ortogonal</option>
                      <option value="curved">Curvada (Suave)</option>
                      <option value="diagonal45">45º Chamfrada</option>
                      <option value="direct">Direta (Linha Reta)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Nome do Net:</span>
                    <input
                      type="text"
                      value={netNameInput}
                      onChange={(e) => setNetNameInput(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-cyan-300 rounded px-2 py-0.5 w-24 font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400">Cor do Fio:</span>
                    <div className="flex items-center gap-1.5">
                      {['#f59e0b', '#ef4444', '#10b981', '#06b6d4', '#7c3aed'].map((col) => (
                        <button
                          key={col}
                          onClick={() => setSelectedTraceColor(col)}
                          style={{ backgroundColor: col }}
                          className={`w-4 h-4 rounded-full border ${selectedTraceColor === col ? 'border-white scale-125' : 'border-transparent'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Grid Snap Adjustment */}
              <div className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800 text-[10px]">
                <span className="text-slate-400 flex items-center gap-1"><Grid className="w-3 h-3 text-amber-400" /> Encaixe da Grade:</span>
                <div className="flex gap-1">
                  {[1, 2, 5].map((g) => (
                    <button
                      key={g}
                      onClick={() => setGridSnap(g)}
                      className={`px-2 py-0.5 rounded font-bold border ${gridSnap === g ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-900 text-slate-500 border-slate-800'}`}
                    >
                      {g}mm
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Component Properties & SWAP option */}
            {selectedComp && (
              <div className="pt-3 border-t border-slate-800 space-y-2.5 bg-slate-950 p-3 rounded-lg border border-amber-500/50">
                <div className="font-bold text-xs text-amber-300 flex justify-between items-center">
                  <span>Inspector de Componente</span>
                  <button onClick={() => setSelectedCompId(null)} className="text-slate-500 hover:text-white">✕</button>
                </div>

                <div className="text-[11px] text-slate-200 font-bold">{selectedComp.name}</div>

                {/* SWAP COMPONENT DROPDOWN */}
                <div className="space-y-1 text-[10px]">
                  <label className="text-slate-400 flex items-center gap-1"><Repeat className="w-3 h-3 text-cyan-400" /> Trocar por outro componente:</label>
                  <select
                    onChange={(e) => handleSwapComponent(selectedComp.id, e.target.value)}
                    value={selectedComp.type}
                    className="w-full bg-slate-900 text-cyan-300 border border-slate-800 rounded px-2 py-1 text-[10px] font-mono"
                  >
                    {componentLibrary.map((lib) => (
                      <option key={lib.type} value={lib.type}>{lib.name} ({lib.width}x{lib.height}mm)</option>
                    ))}
                  </select>
                </div>

                {/* FINE COORDINATE MOVEMENT (X, Y) */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-400">Posição X (mm):</span>
                    <input
                      type="number"
                      value={selectedComp.x}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setProject((prev) => ({
                          ...prev,
                          components: prev.components.map((c) => c.id === selectedComp.id ? { ...c, x: Math.max(0, val) } : c)
                        }));
                      }}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded px-2 py-0.5 mt-0.5 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400">Posição Y (mm):</span>
                    <input
                      type="number"
                      value={selectedComp.y}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setProject((prev) => ({
                          ...prev,
                          components: prev.components.map((c) => c.id === selectedComp.id ? { ...c, y: Math.max(0, val) } : c)
                        }));
                      }}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded px-2 py-0.5 mt-0.5 font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleRotateComponent(selectedComp.id)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 py-1.5 rounded text-[10px] font-bold flex items-center justify-center gap-1"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Rotacionar 90°
                  </button>
                  <button
                    onClick={() => handleDeleteComponent(selectedComp.id)}
                    className="flex-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 py-1.5 rounded text-[10px] font-bold flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remover
                  </button>
                </div>
              </div>
            )}

            {/* Selected Trace Inspector */}
            {selectedTrace && (
              <div className="pt-3 border-t border-slate-800 space-y-2 bg-slate-950 p-3 rounded-lg border border-cyan-500/50">
                <div className="font-bold text-xs text-cyan-300 flex justify-between items-center">
                  <span>Trilha Selecionada</span>
                  <button onClick={() => setSelectedTraceId(null)} className="text-slate-500 hover:text-white">✕</button>
                </div>
                <div className="text-[10px] text-slate-300">Net: <strong>{selectedTrace.netName}</strong></div>
                <div className="text-[10px] text-slate-400">Camada: {selectedTrace.layer.toUpperCase()} | Espessura: {selectedTrace.width}mm</div>
                
                <div className="space-y-1 text-[10px]">
                  <span className="text-slate-400 font-semibold">Trajetória / Formato:</span>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { id: 'ortho90', label: '90º Graus' },
                      { id: 'curved', label: 'Curvada' },
                      { id: 'diagonal45', label: '45º Chamfro' },
                      { id: 'direct', label: 'Linha Reta' }
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => handleChangeTraceRoutingStyle(selectedTrace.id, st.id as RoutingStyle)}
                        className={`px-1.5 py-1 rounded text-[9px] font-bold border transition ${
                          (selectedTrace.routingStyle || 'ortho90') === st.id
                            ? 'bg-cyan-600 text-white border-cyan-400 shadow'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTrace(selectedTrace.id)}
                  className="w-full bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 py-1 rounded text-[10px] font-bold flex items-center justify-center gap-1 mt-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Excluir Esta Trilha
                </button>
              </div>
            )}
          </div>

          {/* MAIN 2D PCB INTERACTIVE GRID CANVAS */}
          <div className="bg-[#0b0f17] border border-slate-800 p-4 rounded-xl lg:col-span-3 flex flex-col items-center justify-center relative min-h-[500px] overflow-auto shadow-2xl">
            
            <div className="w-full mb-3 text-slate-400 text-[10px] flex flex-wrap items-center justify-between border-b border-slate-800 pb-2 gap-2">
              <div className="flex items-center gap-2">
                <span>Modo: <strong className="text-amber-400">{toolMode === 'select' ? 'Arraste para Mover Componentes' : toolMode === 'route' ? 'Clique em 2 Pinos para Conectar Fio' : 'Exclusão de Itens'}</strong></span>
                {routeStartPin && <span className="text-cyan-400 font-bold animate-pulse">→ Clique no pino de destino...</span>}
              </div>

              {/* Global Trace Style Formatter */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-bold px-1 text-[9px] flex items-center gap-1">
                  <Scissors className="w-3 h-3 text-cyan-400" /> Formatar Trilhas:
                </span>
                {[
                  { id: 'ortho90', label: '90º Ortogonal' },
                  { id: 'curved', label: 'Curvada' },
                  { id: 'diagonal45', label: '45º Chamfrada' },
                  { id: 'direct', label: 'Direta' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleApplyGlobalRoutingStyle(st.id as RoutingStyle)}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold border transition ${
                      selectedRoutingStyle === st.id
                        ? 'bg-amber-600 text-white border-amber-500 shadow'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="text-slate-500 font-mono">Cursor: X:{mouseCanvasPos.x}mm Y:{mouseCanvasPos.y}mm</div>
            </div>

            {/* 2D PCB GRID BOARD */}
            <div
              ref={pcbCanvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
              }}
              onDrop={handleDropOnBoard}
              style={{
                width: `${project.boardWidth * 5}px`,
                height: `${project.boardHeight * 5}px`,
                backgroundColor: project.solderMaskColor,
              }}
              className="relative rounded-lg border-4 border-amber-600/70 shadow-2xl overflow-hidden select-none cursor-crosshair"
            >
              {/* Millimeter Grid Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:10px_10px] opacity-25 pointer-events-none" />

              {/* RENDER COPPER TRACES & WIRES (SVG) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {project.traces.map((trace) => {
                  if (!trace.points || trace.points.length < 2) return null;
                  const p1 = trace.points[0];
                  const p2 = trace.points[trace.points.length - 1];
                  const style = trace.routingStyle || 'ortho90';
                  const pathData = generateTraceSvgPath(p1, p2, style, 5);
                  const isSelected = selectedTraceId === trace.id;

                  return (
                    <g key={trace.id} className="pointer-events-auto cursor-pointer" onClick={() => setSelectedTraceId(trace.id)}>
                      <path
                        d={pathData}
                        stroke={trace.layer === 'bottom' ? '#3b82f6' : trace.color}
                        strokeWidth={trace.width * 4}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-all ${isSelected ? 'stroke-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'opacity-90 hover:opacity-100'}`}
                      />
                      {/* Net label */}
                      <text
                        x={(p1.x + p2.x) * 2.5}
                        y={(p1.y + p2.y) * 2.5 - 4}
                        fill="#ffffff"
                        fontSize="8"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {trace.netName}
                      </text>
                    </g>
                  );
                })}

                {/* Rubberband interactive routing line preview */}
                {routeStartPin && (() => {
                  const fromComp = project.components.find((c) => c.id === routeStartPin.compId);
                  const fromPin = fromComp?.pins.find((p) => p.id === routeStartPin.pinId);
                  if (!fromComp || !fromPin) return null;
                  const startPt = { x: fromComp.x + (fromPin.relX || 0), y: fromComp.y + (fromPin.relY || 0) };
                  const endPt = { x: mouseCanvasPos.x, y: mouseCanvasPos.y };
                  const previewPath = generateTraceSvgPath(startPt, endPt, selectedRoutingStyle, 5);

                  return (
                    <path
                      d={previewPath}
                      stroke={selectedTraceColor}
                      strokeWidth={selectedTraceWidth * 4}
                      fill="none"
                      strokeDasharray="4 4"
                      className="animate-pulse"
                    />
                  );
                })()}
              </svg>

              {/* RENDER PCB COMPONENTS */}
              {project.components.map((c) => {
                const isSelected = selectedCompId === c.id;
                return (
                  <div
                    key={c.id}
                    onMouseDown={(e) => handleComponentMouseDown(e, c)}
                    style={{
                      left: `${c.x * 5}px`,
                      top: `${c.y * 5}px`,
                      width: `${c.width * 5}px`,
                      height: `${c.height * 5}px`,
                      backgroundColor: c.color,
                      transform: `rotate(${c.rotation}deg)`,
                    }}
                    className={`absolute rounded border-2 cursor-grab active:cursor-grabbing z-20 flex flex-col justify-between p-1 transition-shadow ${
                      isSelected ? 'border-amber-400 shadow-xl shadow-amber-500/60 scale-[1.01]' : 'border-slate-700/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-[9px] font-bold text-white tracking-tighter truncate px-0.5">
                      {c.name}
                    </div>

                    {/* Component Pins */}
                    <div className="absolute inset-0 pointer-events-auto">
                      {c.pins.map((pin) => {
                        const isRouteStart = routeStartPin?.compId === c.id && routeStartPin?.pinId === pin.id;
                        return (
                          <div
                            key={pin.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePinClick(c.id, pin.id);
                            }}
                            title={`${pin.name} (${pin.type.toUpperCase()})`}
                            style={{
                              left: `${pin.relX * 5 - 5}px`,
                              top: `${pin.relY * 5 - 5}px`,
                            }}
                            className={`absolute w-3 h-3 rounded-full border-2 border-black cursor-crosshair transition hover:scale-150 ${
                              isRouteStart
                                ? 'bg-amber-400 animate-ping border-white'
                                : pin.type === 'vcc'
                                ? 'bg-red-500'
                                : pin.type === 'gnd'
                                ? 'bg-emerald-500'
                                : pin.type === 'power'
                                ? 'bg-amber-500'
                                : 'bg-cyan-400'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 text-[10px] text-slate-400 font-mono flex items-center gap-4">
              <span>★ <strong>Mover</strong>: Arraste os módulos com o mouse.</span>
              <span>★ <strong>Fiação</strong>: Clique na ferramenta "Trilha" e conecte dois pinos.</span>
            </div>
          </div>

        </div>
      )}

      {/* 3D PCB VIEW MODE (THREE.JS) */}
      {activeTab === '3d' && (
        <div className="bg-[#030712] border border-slate-800 rounded-xl p-4 space-y-4 shadow-2xl relative">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 z-10 relative">
            <div className="flex items-center gap-2 text-cyan-400">
              <Box className="w-4 h-4" />
              <span className="font-bold text-xs">Visualizador 3D Realista da Placa de Voo</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setIs3dRotating(!is3dRotating)}
                className={`px-3 py-1 rounded-lg font-bold border transition ${
                  is3dRotating ? 'bg-cyan-950 text-cyan-300 border-cyan-800' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                {is3dRotating ? '⏸ Pausar Rotação' : '▶ Rotacionar Placa'}
              </button>

              <button
                onClick={() => setIsExplodedView(!isExplodedView)}
                className={`px-3 py-1 rounded-lg font-bold border transition ${
                  isExplodedView ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                {isExplodedView ? 'Unir Placa' : '💥 Vista Explodida de Componentes'}
              </button>

              <select
                value={project.solderMaskColor}
                onChange={(e) => setProject({ ...project, solderMaskColor: e.target.value })}
                className="bg-slate-900 text-slate-200 border border-slate-800 rounded px-2 py-1 text-xs"
              >
                <option value="#0f3818">Mascara Verde Padrão</option>
                <option value="#111111">Mascara Preto Fosco</option>
                <option value="#1e3a8a">Mascara Azul Royal</option>
                <option value="#7f1d1d">Mascara Vermelho Sangue</option>
              </select>
            </div>
          </div>

          <div
            ref={canvas3dRef}
            className="w-full h-[450px] rounded-lg overflow-hidden border border-slate-800/80 bg-black cursor-grab active:cursor-grabbing"
          />

          <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
            <span>Inspecione componentes, trilhas superiores/inferiores e pinos no modelo 3D.</span>
            <span className="text-emerald-400 font-bold">Three.js WebGL 60 FPS</span>
          </div>
        </div>
      )}

      {/* CREATE CUSTOM COMPONENT MODAL */}
      {isCustomCompModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-5 max-w-md w-full space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="font-bold text-amber-400 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Criar Componente Customizado
              </span>
              <button onClick={() => setIsCustomCompModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400">Nome do Componente:</label>
                <input
                  type="text"
                  value={customCompName}
                  onChange={(e) => setCustomCompName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded px-2.5 py-1.5 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400">Largura (mm):</label>
                  <input
                    type="number"
                    value={customCompWidth}
                    onChange={(e) => setCustomCompWidth(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded px-2.5 py-1.5 mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Altura (mm):</label>
                  <input
                    type="number"
                    value={customCompHeight}
                    onChange={(e) => setCustomCompHeight(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded px-2.5 py-1.5 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400">Cor do Módulo:</label>
                <div className="flex items-center gap-2 mt-1">
                  {['#3b82f6', '#10b981', '#f59e0b', '#7c3aed', '#dc2626', '#1e293b'].map((col) => (
                    <button
                      key={col}
                      onClick={() => setCustomCompColor(col)}
                      style={{ backgroundColor: col }}
                      className={`w-6 h-6 rounded border-2 ${customCompColor === col ? 'border-white scale-110' : 'border-transparent'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Pin List Editor */}
              <div className="border-t border-slate-800 pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-300">Pinos do Componente ({customPins.length}):</span>
                  <button
                    onClick={handleAddCustomPin}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-300 px-2 py-0.5 rounded font-bold"
                  >
                    + Adicionar Pino
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {customPins.map((pin, idx) => (
                    <div key={pin.id} className="flex items-center gap-2 bg-slate-950 p-1.5 rounded border border-slate-800 text-[10px]">
                      <input
                        type="text"
                        value={pin.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomPins(customPins.map((p) => p.id === pin.id ? { ...p, name: val } : p));
                        }}
                        className="bg-slate-900 text-white px-1 py-0.5 rounded w-16"
                      />
                      <span>RelX:</span>
                      <input
                        type="number"
                        value={pin.relX}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCustomPins(customPins.map((p) => p.id === pin.id ? { ...p, relX: val } : p));
                        }}
                        className="bg-slate-900 text-white px-1 py-0.5 rounded w-10"
                      />
                      <span>RelY:</span>
                      <input
                        type="number"
                        value={pin.relY}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCustomPins(customPins.map((p) => p.id === pin.id ? { ...p, relY: val } : p));
                        }}
                        className="bg-slate-900 text-white px-1 py-0.5 rounded w-10"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveCustomComponent}
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition shadow shadow-amber-950"
            >
              Salvar e Adicionar à Placa
            </button>
          </div>
        </div>
      )}

      {/* REAL LIFE PRODUCTION EXPORT MODAL */}
      {isProductionExportOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="font-bold text-emerald-400 text-sm flex items-center gap-2">
                <Download className="w-5 h-5" /> Exportação para Fabricação Real de PCB (JLCPCB / PCBWay)
              </span>
              <button onClick={() => setIsProductionExportOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-slate-300">
              Gere os arquivos padrão de fabricação industrial para enviar diretamente para fábricas de circuito impresso:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => downloadTextFile(`${project.projectName.toLowerCase().replace(/\s+/g, '_')}_top_copper.gtl`, generateGerberTopCopper())}
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-left space-y-1 transition group"
              >
                <div className="font-bold text-amber-400 group-hover:underline flex items-center gap-1.5">
                  <FileCode className="w-4 h-4" /> Gerber Top Copper (.GTL)
                </div>
                <div className="text-[10px] text-slate-400">Trilhas e fiação da camada superior</div>
              </button>

              <button
                onClick={() => downloadTextFile(`${project.projectName.toLowerCase().replace(/\s+/g, '_')}_drill.drl`, generateExcellonDrill())}
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-left space-y-1 transition group"
              >
                <div className="font-bold text-cyan-400 group-hover:underline flex items-center gap-1.5">
                  <Wrench className="w-4 h-4" /> NC Drill Excellon (.DRL)
                </div>
                <div className="text-[10px] text-slate-400">Coordenadas de furação CNC de pinos</div>
              </button>

              <button
                onClick={() => downloadTextFile(`${project.projectName.toLowerCase().replace(/\s+/g, '_')}_bom.csv`, generateBomCsv(), 'text/csv')}
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-left space-y-1 transition group"
              >
                <div className="font-bold text-emerald-400 group-hover:underline flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4" /> Lista de Materiais BOM (.CSV)
                </div>
                <div className="text-[10px] text-slate-400">Lista de peças para montagem SMT</div>
              </button>

              <button
                onClick={() => downloadTextFile(`${project.projectName.toLowerCase().replace(/\s+/g, '_')}_cpl.csv`, generateCplCsv(), 'text/csv')}
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-left space-y-1 transition group"
              >
                <div className="font-bold text-purple-400 group-hover:underline flex items-center gap-1.5">
                  <Move className="w-4 h-4" /> Pick & Place CPL (.CSV)
                </div>
                <div className="text-[10px] text-slate-400">Posicionamento centroidal SMT</div>
              </button>
            </div>

            <div className="border-t border-slate-800 pt-3 flex justify-end">
              <button
                onClick={() => setIsProductionExportOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
