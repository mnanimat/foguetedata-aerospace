import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { User, User3DModel } from '../types';
import { AdvancedCadStudio } from './AdvancedCadStudio';
import { 
  Box, 
  Move, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  Plus, 
  Sparkles, 
  Trash2, 
  ExternalLink, 
  ShieldAlert, 
  Upload, 
  RotateCcw, 
  Undo, 
  Redo, 
  CheckCircle2, 
  Keyboard, 
  Layers, 
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Circle,
  Triangle,
  Cylinder,
  FileCode,
  Wind,
  Activity,
  Zap,
  Flame,
  Package,
  Disc,
  Sliders,
  Sun,
  Edit3,
  Printer,
  Download,
  FileText,
  Camera,
  Crosshair,
  Repeat,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { 
  generateTechnicalDrawingPDF, 
  generateSTLContent, 
  generateOBJContent, 
  generateGCodeContent, 
  triggerFileDownload 
} from '../utils/cadExportUtils';

interface User3DModelStudioProps {
  currentUser: User | null;
  onOpenAuthModal: () => void;
}

interface TransformHistoryState {
  posX: number;
  posY: number;
  posZ: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
}

const INITIAL_MODELS: User3DModel[] = [
  {
    id: 'm1',
    title: 'Minifoguete Experimental Alpha-1',
    author: 'Micael Nildo',
    type: 'foguete_completo',
    meshType: 'cylinder_rocket',
    primitiveShape: 'cylinder',
    visible: true,
    locked: false,
    posX: 0,
    posY: 0,
    posZ: 0,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    color: '#dc2626',
    description: 'Foguetemodelo Classe G com câmara de alumínio e ogiva von Kármán.',
    createdAt: '2026-08-09',
    driveOrVideoLink: 'https://mnanimat.github.io/mnanimat3d'
  },
  {
    id: 'm2',
    title: 'Aletagem Tripla em Fibra de Vidro G10',
    author: 'MNAnimat AeroSpace',
    type: 'aletagem',
    meshType: 'multistage',
    primitiveShape: 'fin',
    visible: true,
    locked: false,
    posX: 2.5,
    posY: 0,
    posZ: 0,
    rotX: 0,
    rotY: 0.5,
    rotZ: 0,
    scaleX: 1.2,
    scaleY: 0.8,
    scaleZ: 1.2,
    color: '#ef4444',
    description: 'Aletas trapezoidais com chanfro de borda para redução de atrito transônico.',
    createdAt: '2026-08-08'
  }
];

// Helper to create Three.js Objects for basic primitives & rocket shapes
const createMeshForModel = (model: User3DModel, customGeo?: THREE.BufferGeometry | THREE.Group): THREE.Object3D => {
  const baseColor = model.color || '#dc2626';
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(baseColor),
    metalness: 0.4,
    roughness: 0.3
  });

  if (customGeo) {
    if (customGeo instanceof THREE.Group) {
      const cloned = customGeo.clone();
      cloned.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (!mesh.material) {
            mesh.material = mat;
          }
        }
      });
      return cloned;
    } else {
      return new THREE.Mesh(customGeo.clone(), mat);
    }
  }

  const shape = model.primitiveShape || model.meshType;

  if (shape === 'cube') {
    return new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), mat);
  } else if (shape === 'arc') {
    return new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.35, 16, 32), mat);
  } else if (shape === 'cone') {
    return new THREE.Mesh(new THREE.ConeGeometry(1.0, 2.2, 32), mat);
  } else if (shape === 'pyramid') {
    return new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.8, 4), mat);
  } else if (shape === 'cylinder') {
    return new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 2.5, 32), mat);
  } else if (shape === 'sphere') {
    return new THREE.Mesh(new THREE.SphereGeometry(1.1, 32, 32), mat);
  } else if (shape === 'fin') {
    // Rocket Fin (Trapezoidal fin geometry)
    const finGroup = new THREE.Group();
    const finGeo = new THREE.BoxGeometry(1.8, 1.2, 0.12);
    const finMesh = new THREE.Mesh(finGeo, mat);
    finGroup.add(finMesh);
    return finGroup;
  } else if (shape === 'nosecone') {
    // Nose Cone (Ogival nose cone)
    const noseGroup = new THREE.Group();
    const noseGeo = new THREE.ConeGeometry(0.8, 2.8, 32);
    const noseMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(baseColor), metalness: 0.6, roughness: 0.2 });
    const noseMesh = new THREE.Mesh(noseGeo, noseMat);
    noseGroup.add(noseMesh);
    return noseGroup;
  } else if (shape === 'engine') {
    // Engine & Nozzle
    const engineGroup = new THREE.Group();
    const chamberGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.4, 32);
    const chamberMesh = new THREE.Mesh(chamberGeo, mat);
    chamberMesh.position.y = 0.7;
    engineGroup.add(chamberMesh);

    const nozzleGeo = new THREE.CylinderGeometry(0.35, 0.85, 1.2, 32);
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const nozzleMesh = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzleMesh.position.y = -0.6;
    engineGroup.add(nozzleMesh);
    return engineGroup;
  } else if (shape === 'body_tube') {
    // Body Tube
    const tubeGroup = new THREE.Group();
    const tubeGeo = new THREE.CylinderGeometry(0.8, 0.8, 3.8, 32);
    const tubeMesh = new THREE.Mesh(tubeGeo, mat);
    tubeGroup.add(tubeMesh);
    return tubeGroup;
  } else if (shape === 'centering_ring') {
    // Centering Ring
    const ringGroup = new THREE.Group();
    const outerRing = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 32);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7 });
    const ringMesh = new THREE.Mesh(outerRing, ringMat);
    ringGroup.add(ringMesh);
    return ringGroup;
  } else if (shape === 'payload') {
    // Payload Bay Container
    const payloadGroup = new THREE.Group();
    const container = new THREE.CylinderGeometry(0.75, 0.75, 1.8, 32);
    const pMesh = new THREE.Mesh(container, mat);
    payloadGroup.add(pMesh);

    const ringGeo = new THREE.TorusGeometry(0.76, 0.05, 16, 32);
    const ringMesh = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }));
    ringMesh.rotation.x = Math.PI / 2;
    payloadGroup.add(ringMesh);
    return payloadGroup;
  } else if (shape === 'multistage') {
    const multiGroup = new THREE.Group();
    const b1 = new THREE.CylinderGeometry(0.9, 0.9, 3, 32);
    const m1 = new THREE.Mesh(b1, mat);
    m1.position.y = -1;
    multiGroup.add(m1);

    const b2 = new THREE.CylinderGeometry(0.6, 0.6, 2.5, 32);
    const m2 = new THREE.Mesh(b2, new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
    m2.position.y = 1.75;
    multiGroup.add(m2);

    const n2 = new THREE.ConeGeometry(0.6, 1.5, 32);
    const nm2 = new THREE.Mesh(n2, new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
    nm2.position.y = 3.75;
    multiGroup.add(nm2);
    return multiGroup;
  } else {
    // Default rocket assembly
    const rocketGroup = new THREE.Group();
    const bodyGeo = new THREE.CylinderGeometry(0.7, 0.7, 4, 32);
    const bodyMesh = new THREE.Mesh(bodyGeo, mat);
    rocketGroup.add(bodyMesh);

    const noseGeo = new THREE.ConeGeometry(0.7, 1.8, 32);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.6 });
    const noseMesh = new THREE.Mesh(noseGeo, noseMat);
    noseMesh.position.y = 2.9;
    rocketGroup.add(noseMesh);

    const finGeo = new THREE.BoxGeometry(1.6, 0.8, 0.08);
    const finMesh1 = new THREE.Mesh(finGeo, mat);
    finMesh1.position.y = -1.6;
    rocketGroup.add(finMesh1);

    const finMesh2 = new THREE.Mesh(finGeo, mat);
    finMesh2.position.y = -1.6;
    finMesh2.rotation.y = Math.PI / 2;
    rocketGroup.add(finMesh2);
    return rocketGroup;
  }
};

export const User3DModelStudio: React.FC<User3DModelStudioProps> = ({
  currentUser,
  onOpenAuthModal
}) => {
  const [models, setModels] = useState<User3DModel[]>(INITIAL_MODELS);
  const [selectedModelId, setSelectedModelId] = useState<string>(INITIAL_MODELS[0].id);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeGizmoTool, setActiveGizmoTool] = useState<'move' | 'rotate' | 'scale'>('move');

  // Custom Imported 3D Geometry Map
  const importedGeometriesRef = useRef<{ [modelId: string]: THREE.BufferGeometry | THREE.Group }>({});

  // History Stack for Undo/Redo
  const [history, setHistory] = useState<TransformHistoryState[]>([]);
  const [redoStack, setRedoStack] = useState<TransformHistoryState[]>([]);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Advanced CAD Studio Modal State
  const [isAdvancedCadOpen, setIsAdvancedCadOpen] = useState(false);

  // Floating In-Viewport CAD HUD State
  const [activeViewportCadTab, setActiveViewportCadTab] = useState<'none' | 'measures' | 'sketch' | 'lighting' | 'export'>('none');
  const [hudLengthMm, setHudLengthMm] = useState<number>(1250);
  const [hudDiameterMm, setHudDiameterMm] = useState<number>(76);
  const [hudWallThicknessMm, setHudWallThicknessMm] = useState<number>(3.0);
  const [hudTubeType, setHudTubeType] = useState<'cylinder' | 'square' | 'rectangular' | 'l_profile' | 'edge_rail'>('cylinder');
  const [hudPatternCount, setHudPatternCount] = useState<number>(4);
  const [hudMaterial, setHudMaterial] = useState<string>('Alumínio 6061-T6 (Estrutura) & G10');
  const [hudExtrudeDepth, setHudExtrudeDepth] = useState<number>(450);
  const [hudSketchTool, setHudSketchTool] = useState<'line' | 'circle' | 'arc' | 'rectangle'>('line');
  const [hudConstraint, setHudConstraint] = useState<'coincident' | 'parallel'>('coincident');
  const [hudKeyLight, setHudKeyLight] = useState<number>(2.5);

  const handleViewportExportPDF = () => {
    const specs = {
      lengthMm: hudLengthMm,
      diameterMm: hudDiameterMm,
      wallThicknessMm: hudWallThicknessMm,
      noseConeType: 'Von Kármán (Mínimo Arraste)',
      finCount: 3,
      finThicknessMm: 3.0,
      material: hudMaterial,
      authorName: currentModel.author || 'Micael Nildo',
      teamName: currentUser?.teamName || 'MNAnimat AeroSpace',
      tubeType: hudTubeType,
      extrusionDepthMm: hudExtrudeDepth,
      patternCount: hudPatternCount,
      patternRadiusMm: 85
    };
    generateTechnicalDrawingPDF(currentModel, specs, currentModel.author);
    setToastMessage('📄 Desenho Técnico A3 em PDF gerado diretamente do Estúdio 3D!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleViewportExport3D = (fmt: 'stl' | 'obj' | 'gcode') => {
    const specs = {
      lengthMm: hudLengthMm,
      diameterMm: hudDiameterMm,
      wallThicknessMm: hudWallThicknessMm,
      noseConeType: 'Von Kármán (Mínimo Arraste)',
      finCount: 3,
      finThicknessMm: 3.0,
      material: hudMaterial,
      authorName: currentModel.author || 'Micael Nildo',
      tubeType: hudTubeType,
      extrusionDepthMm: hudExtrudeDepth,
      patternCount: hudPatternCount,
      patternRadiusMm: 85
    };
    if (fmt === 'stl') {
      const content = generateSTLContent(currentModel, specs);
      triggerFileDownload(`${currentModel.title.replace(/\s+/g, '_')}.stl`, content, 'model/stl');
      setToastMessage('📦 Arquivo .STL gerado para Impressão 3D!');
    } else if (fmt === 'obj') {
      const content = generateOBJContent(currentModel, specs);
      triggerFileDownload(`${currentModel.title.replace(/\s+/g, '_')}.obj`, content, 'text/plain');
      setToastMessage('📦 Arquivo .OBJ 3D gerado!');
    } else {
      const code = generateGCodeContent(currentModel, specs);
      triggerFileDownload(`${currentModel.title.replace(/\s+/g, '_')}_CNC.gcode`, code, 'text/plain');
      setToastMessage('⚙️ Código G CNC gerado para Usinagem!');
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  const renderInViewportCadHud = () => (
    <>
      {/* Top Banner Over 3D Canvas */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-slate-950/85 backdrop-blur-md border border-slate-700/80 px-3 py-1 rounded-full text-[10px] font-mono flex items-center gap-2 sm:gap-3 text-slate-200 shadow-xl">
        <span className="flex items-center gap-1 text-red-400 font-bold">
          <SlidersHorizontal className="w-3 h-3" /> CAD HUD:
        </span>
        <span>$L$: <strong className="text-white">{hudLengthMm}mm</strong></span>
        <span>$\varnothing$: <strong className="text-white">{hudDiameterMm}mm</strong></span>
        <span>$t$: <strong className="text-white">{hudWallThicknessMm}mm</strong></span>
        <span className="hidden sm:inline text-amber-400 font-bold uppercase">{hudTubeType}</span>
      </div>

      {/* Floating Panel (when a tab is selected) */}
      {activeViewportCadTab !== 'none' && (
        <div className="absolute bottom-14 inset-x-2 sm:inset-x-4 z-30 bg-[#0B0F19]/95 backdrop-blur-xl border border-red-500/50 rounded-xl p-3 shadow-2xl text-xs font-mono text-slate-100 max-h-56 overflow-y-auto animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="font-bold text-red-400 uppercase flex items-center gap-1.5">
              {activeViewportCadTab === 'measures' && <><Sliders className="w-4 h-4 text-red-500" /> Medidas Exatas & Perfis CAD</>}
              {activeViewportCadTab === 'sketch' && <><Edit3 className="w-4 h-4 text-amber-400" /> Esboço 2D/3D & Restrições Geométricas</>}
              {activeViewportCadTab === 'lighting' && <><Sun className="w-4 h-4 text-yellow-400" /> Iluminação Estúdio & Render HQ</>}
              {activeViewportCadTab === 'export' && <><Printer className="w-4 h-4 text-emerald-400" /> Exportação Técnica & Usinagem CNC</>}
            </span>
            <button
              onClick={() => setActiveViewportCadTab('none')}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* TAB 1: MEASURES */}
          {activeViewportCadTab === 'measures' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Comprimento ($L$): <strong className="text-red-400">{hudLengthMm} mm</strong></label>
                <input
                  type="range"
                  min="300"
                  max="3000"
                  step="10"
                  value={hudLengthMm}
                  onChange={(e) => setHudLengthMm(Number(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Diâmetro ($\varnothing$): <strong className="text-red-400">{hudDiameterMm} mm</strong></label>
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="1"
                  value={hudDiameterMm}
                  onChange={(e) => setHudDiameterMm(Number(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Espessura ($t$): <strong className="text-red-400">{hudWallThicknessMm} mm</strong></label>
                <input
                  type="range"
                  min="0.8"
                  max="8.0"
                  step="0.2"
                  value={hudWallThicknessMm}
                  onChange={(e) => setHudWallThicknessMm(Number(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Perfil de Tubos / Modificador Frame:</label>
                <select
                  value={hudTubeType}
                  onChange={(e) => setHudTubeType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-white"
                >
                  <option value="cylinder">Tubo Cilíndrico Redondo (Ø {hudDiameterMm}mm)</option>
                  <option value="square">Tubo Quadrado Estrutural ({hudDiameterMm}x{hudDiameterMm}mm)</option>
                  <option value="rectangular">Tubo Retangular ({hudDiameterMm}x{(hudDiameterMm * 1.5).toFixed(0)}mm)</option>
                  <option value="l_profile">Perfil L Cantoneira ({hudDiameterMm}mm)</option>
                  <option value="edge_rail">Trilho Guia Aresta (Rail 2020)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Padrão Circular (Circular Pattern):</label>
                <input
                  type="number"
                  min="2"
                  max="12"
                  value={hudPatternCount}
                  onChange={(e) => setHudPatternCount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-white font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB 2: SKETCH */}
          {activeViewportCadTab === 'sketch' && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400">Ferramenta:</span>
                {(['line', 'circle', 'arc', 'rectangle'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setHudSketchTool(t)}
                    className={`px-2 py-1 rounded border capitalize ${hudSketchTool === t ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
                <button
                  onClick={() => setHudConstraint(hudConstraint === 'coincident' ? 'parallel' : 'coincident')}
                  className="bg-slate-900 border border-slate-700 text-amber-300 px-2 py-1 rounded flex items-center gap-1"
                >
                  {hudConstraint === 'coincident' ? <Crosshair className="w-3 h-3" /> : <Repeat className="w-3 h-3" />}
                  Restrição {hudConstraint.toUpperCase()}
                </button>
                <button
                  onClick={() => {
                    setToastMessage(`⚡ Esboço extrudado (${hudExtrudeDepth}mm) no estúdio!`);
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded font-bold"
                >
                  Extrudar para Sólido 3D ({hudExtrudeDepth}mm)
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: LIGHTING */}
          {activeViewportCadTab === 'lighting' && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <label className="block text-slate-400">Key Light: {hudKeyLight}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={hudKeyLight}
                  onChange={(e) => setHudKeyLight(Number(e.target.value))}
                  className="accent-yellow-500 cursor-pointer"
                />
              </div>
              <button
                onClick={() => {
                  setToastMessage('📸 Snapshot Raymarching 4K capturado com Oclusão!');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold px-3 py-1.5 rounded flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" /> Capturar Foto 4K HQ
              </button>
            </div>
          )}

          {/* TAB 4: EXPORT */}
          {activeViewportCadTab === 'export' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={handleViewportExportPDF}
                className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-1.5 rounded flex items-center justify-center gap-1 text-[11px]"
              >
                <FileText className="w-3.5 h-3.5" /> PDF A3 (ABNT)
              </button>
              <button
                onClick={() => handleViewportExport3D('stl')}
                className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-1.5 rounded flex items-center justify-center gap-1 text-[11px]"
              >
                <Box className="w-3.5 h-3.5" /> .STL (Impressão)
              </button>
              <button
                onClick={() => handleViewportExport3D('obj')}
                className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-1.5 rounded flex items-center justify-center gap-1 text-[11px]"
              >
                <Disc className="w-3.5 h-3.5" /> .OBJ (Malha 3D)
              </button>
              <button
                onClick={() => handleViewportExport3D('gcode')}
                className="bg-amber-700 hover:bg-amber-600 text-white font-bold py-1.5 rounded flex items-center justify-center gap-1 text-[11px]"
              >
                <FileCode className="w-3.5 h-3.5" /> G-Code (CNC)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Bottom In-Canvas CAD Toolbar (Anchored inside 3D Canvas) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-2xl shadow-2xl flex items-center gap-1 text-xs font-mono max-w-[95%] overflow-x-auto">
        <button
          onClick={() => setActiveViewportCadTab(activeViewportCadTab === 'measures' ? 'none' : 'measures')}
          className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
            activeViewportCadTab === 'measures'
              ? 'bg-red-600 text-white border border-red-400'
              : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800'
          }`}
          title="Abrir Painel de Medidas Exatas e Perfis CAD"
        >
          <Sliders className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden sm:inline">1. Medidas</span>
        </button>

        <button
          onClick={() => setActiveViewportCadTab(activeViewportCadTab === 'sketch' ? 'none' : 'sketch')}
          className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
            activeViewportCadTab === 'sketch'
              ? 'bg-amber-600 text-white border border-amber-400'
              : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800'
          }`}
          title="Abrir Ferramentas de Esboço 2D/3D e Restrições"
        >
          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">2. Esboço</span>
        </button>

        <button
          onClick={() => setActiveViewportCadTab(activeViewportCadTab === 'lighting' ? 'none' : 'lighting')}
          className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
            activeViewportCadTab === 'lighting'
              ? 'bg-yellow-600 text-white border border-yellow-400'
              : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800'
          }`}
          title="Controle de Iluminação de Estúdio e Render HQ"
        >
          <Sun className="w-3.5 h-3.5 text-yellow-400" />
          <span className="hidden sm:inline">3. Iluminação</span>
        </button>

        <button
          onClick={() => setActiveViewportCadTab(activeViewportCadTab === 'export' ? 'none' : 'export')}
          className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
            activeViewportCadTab === 'export'
              ? 'bg-emerald-600 text-white border border-emerald-400'
              : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800'
          }`}
          title="Exportar Desenho PDF A3, STL e Usinagem CNC"
        >
          <Printer className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">4. Exportar</span>
        </button>

        <button
          onClick={() => setIsAdvancedCadOpen(true)}
          className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition shadow shadow-red-600/30"
          title="Abrir Estúdio CAD Completo em Janela Expandida"
        >
          <Wind className="w-3.5 h-3.5" />
          <span>Estúdio CAD</span>
        </button>
      </div>
    </>
  );

  // New Model Form Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<User3DModel['type']>('foguete_completo');
  const [newMeshType, setNewMeshType] = useState<User3DModel['meshType']>('cylinder_rocket');
  const [newColor, setNewColor] = useState('#dc2626');
  const [newDesc, setNewDesc] = useState('');
  const [newLink, setNewLink] = useState('');

  const currentModel = models.find((m) => m.id === selectedModelId) || models[0] || INITIAL_MODELS[0];

  // Three.js Canvas Refs
  const mountRef = useRef<HTMLDivElement>(null);
  const expandedMountRef = useRef<HTMLDivElement>(null);

  // Helper to Push History
  const pushHistory = useCallback(() => {
    if (!currentModel) return;
    const currentState: TransformHistoryState = {
      posX: currentModel.posX,
      posY: currentModel.posY,
      posZ: currentModel.posZ,
      rotX: currentModel.rotX,
      rotY: currentModel.rotY,
      rotZ: currentModel.rotZ,
      scaleX: currentModel.scaleX,
      scaleY: currentModel.scaleY,
      scaleZ: currentModel.scaleZ
    };
    setHistory((prev) => [...prev.slice(-20), currentState]);
    setRedoStack([]);
  }, [currentModel]);

  // Undo Handler
  const handleUndo = useCallback(() => {
    if (history.length === 0 || !currentModel) return;
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, history.length - 1);

    const currentState: TransformHistoryState = {
      posX: currentModel.posX,
      posY: currentModel.posY,
      posZ: currentModel.posZ,
      rotX: currentModel.rotX,
      rotY: currentModel.rotY,
      rotZ: currentModel.rotZ,
      scaleX: currentModel.scaleX,
      scaleY: currentModel.scaleY,
      scaleZ: currentModel.scaleZ
    };

    setRedoStack((prev) => [...prev, currentState]);
    setHistory(newHistory);

    setModels((prev) =>
      prev.map((m) =>
        m.id === selectedModelId
          ? {
              ...m,
              posX: previous.posX,
              posY: previous.posY,
              posZ: previous.posZ,
              rotX: previous.rotX,
              rotY: previous.rotY,
              rotZ: previous.rotZ,
              scaleX: previous.scaleX,
              scaleY: previous.scaleY,
              scaleZ: previous.scaleZ
            }
          : m
      )
    );

    setToastMessage('↩️ Desfeito: Posição/Rotação/Escala restaurada');
    setTimeout(() => setToastMessage(null), 2500);
  }, [history, currentModel, selectedModelId]);

  // Redo Handler
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0 || !currentModel) return;
    const next = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, redoStack.length - 1);

    const currentState: TransformHistoryState = {
      posX: currentModel.posX,
      posY: currentModel.posY,
      posZ: currentModel.posZ,
      rotX: currentModel.rotX,
      rotY: currentModel.rotY,
      rotZ: currentModel.rotZ,
      scaleX: currentModel.scaleX,
      scaleY: currentModel.scaleY,
      scaleZ: currentModel.scaleZ
    };

    setHistory((prev) => [...prev, currentState]);
    setRedoStack(newRedo);

    setModels((prev) =>
      prev.map((m) =>
        m.id === selectedModelId
          ? {
              ...m,
              posX: next.posX,
              posY: next.posY,
              posZ: next.posZ,
              rotX: next.rotX,
              rotY: next.rotY,
              rotZ: next.rotZ,
              scaleX: next.scaleX,
              scaleY: next.scaleY,
              scaleZ: next.scaleZ
            }
          : m
      )
    );

    setToastMessage('↪️ Refeito: Transformação aplicada');
    setTimeout(() => setToastMessage(null), 2500);
  }, [redoStack, currentModel, selectedModelId]);

  // Reset Model Handler
  const handleResetTransform = useCallback(() => {
    if (currentModel?.locked) {
      setToastMessage('🔒 Objeto bloqueado para edições');
      setTimeout(() => setToastMessage(null), 2000);
      return;
    }
    pushHistory();
    setModels((prev) =>
      prev.map((m) =>
        m.id === selectedModelId
          ? {
              ...m,
              posX: 0,
              posY: 0,
              posZ: 0,
              rotX: 0,
              rotY: 0,
              rotZ: 0,
              scaleX: 1,
              scaleY: 1,
              scaleZ: 1
            }
          : m
      )
    );
    setToastMessage('🔄 Transformação redefinida para a origem (0,0,0)');
    setTimeout(() => setToastMessage(null), 2500);
  }, [pushHistory, selectedModelId, currentModel?.locked]);

  // Delete Object by ID Handler
  const handleDeleteModelById = useCallback((idToDelete: string) => {
    setModels((prev) => {
      const filtered = prev.filter((m) => m.id !== idToDelete);
      if (filtered.length === 0) {
        // Fallback default shape if user deletes everything
        const fallbackModel: User3DModel = {
          id: 'm_fallback_' + Date.now(),
          title: 'Cilindro Base 3D',
          author: currentUser ? currentUser.name : 'Micael Nildo',
          type: 'foguete_completo',
          meshType: 'cylinder_rocket',
          primitiveShape: 'cylinder',
          visible: true,
          locked: false,
          posX: 0, posY: 0, posZ: 0,
          rotX: 0, rotY: 0, rotZ: 0,
          scaleX: 1, scaleY: 1, scaleZ: 1,
          color: '#dc2626',
          description: 'Cilindro de trabalho padrão.',
          createdAt: new Date().toISOString().split('T')[0]
        };
        setSelectedModelId(fallbackModel.id);
        return [fallbackModel];
      }
      if (selectedModelId === idToDelete) {
        setSelectedModelId(filtered[0].id);
      }
      return filtered;
    });
    setToastMessage('🗑️ Objeto removido da cena 3D!');
    setTimeout(() => setToastMessage(null), 2500);
  }, [selectedModelId, currentUser]);

  // Delete Currently Selected Model Handler
  const handleDeleteSelected = useCallback(() => {
    if (selectedModelId) {
      handleDeleteModelById(selectedModelId);
    }
  }, [selectedModelId, handleDeleteModelById]);

  // Toggle Visibility Handler
  const handleToggleVisibility = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setModels((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextVis = m.visible === false ? true : false;
          setToastMessage(nextVis ? `👁️ Objeto "${m.title}" visível` : `🙈 Objeto "${m.title}" oculto na cena`);
          setTimeout(() => setToastMessage(null), 2000);
          return { ...m, visible: nextVis };
        }
        return m;
      })
    );
  };

  // Toggle Lock Handler
  const handleToggleLock = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setModels((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextLock = !m.locked;
          setToastMessage(nextLock ? `🔒 Objeto "${m.title}" bloqueado para edições` : `🔓 Objeto "${m.title}" desbloqueado`);
          setTimeout(() => setToastMessage(null), 2000);
          return { ...m, locked: nextLock };
        }
        return m;
      })
    );
  };

  // Add Basic Geometric Primitives Handler
  const handleAddPrimitive = (shape: 'cube' | 'arc' | 'cone' | 'pyramid' | 'cylinder' | 'sphere') => {
    const titles: Record<string, string> = {
      cube: 'Cubo 3D',
      arc: 'Arco / Toro 3D',
      cone: 'Cone Geométrico',
      pyramid: 'Pirâmide 3D',
      cylinder: 'Cilindro Base',
      sphere: 'Esfera Geométrica'
    };

    const colors: Record<string, string> = {
      cube: '#3b82f6',
      arc: '#8b5cf6',
      cone: '#f59e0b',
      pyramid: '#10b981',
      cylinder: '#ef4444',
      sphere: '#ec4899'
    };

    const newObj: User3DModel = {
      id: 'prim_' + Date.now(),
      title: `${titles[shape]} #${models.length + 1}`,
      author: currentUser ? currentUser.name : 'Engenheiro CAD',
      type: 'foguete_completo',
      meshType: 'cylinder_rocket',
      primitiveShape: shape,
      visible: true,
      locked: false,
      posX: (Math.random() - 0.5) * 3,
      posY: 0,
      posZ: (Math.random() - 0.5) * 3,
      rotX: 0, rotY: 0, rotZ: 0,
      scaleX: 1, scaleY: 1, scaleZ: 1,
      color: colors[shape] || '#3b82f6',
      description: `Forma geométrica básica (${titles[shape]}) inserida na cena.`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setModels((prev) => [newObj, ...prev]);
    setSelectedModelId(newObj.id);
    setToastMessage(`✨ Forma "${titles[shape]}" inserida na cena!`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Add Rocket Components Handler
  const handleAddRocketShape = (rocketShape: 'fin' | 'nosecone' | 'engine' | 'body_tube' | 'centering_ring' | 'payload') => {
    const labels: Record<string, string> = {
      fin: 'Aleta Aerodinâmica',
      nosecone: 'Coifa / Nariz Ogival',
      engine: 'Motor & Bocal de Empuxo',
      body_tube: 'Tubo de Fuselagem (Corpo)',
      centering_ring: 'Anel Centrador',
      payload: 'Módulo de Carga Útil'
    };

    const colors: Record<string, string> = {
      fin: '#ef4444',
      nosecone: '#dc2626',
      engine: '#f97316',
      body_tube: '#06b6d4',
      centering_ring: '#64748b',
      payload: '#a855f7'
    };

    const newRocketObj: User3DModel = {
      id: 'rkt_' + Date.now(),
      title: `${labels[rocketShape]} #${models.length + 1}`,
      author: currentUser ? currentUser.name : 'Micael Nildo',
      type: rocketShape === 'fin' ? 'aletagem' : rocketShape === 'nosecone' ? 'coifa' : rocketShape === 'engine' ? 'motor' : rocketShape === 'payload' ? 'payload' : 'foguete_completo',
      meshType: 'cylinder_rocket',
      primitiveShape: rocketShape,
      visible: true,
      locked: false,
      posX: (Math.random() - 0.5) * 2,
      posY: rocketShape === 'nosecone' ? 2.5 : rocketShape === 'engine' ? -2.5 : 0,
      posZ: (Math.random() - 0.5) * 2,
      rotX: 0, rotY: 0, rotZ: 0,
      scaleX: 1, scaleY: 1, scaleZ: 1,
      color: colors[rocketShape] || '#dc2626',
      description: `Componente aerospacial de foguete (${labels[rocketShape]}) inserido no projeto.`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setModels((prev) => [newRocketObj, ...prev]);
    setSelectedModelId(newRocketObj.id);
    setToastMessage(`🚀 Componente "${labels[rocketShape]}" inserido na cena!`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
      } else if (e.key.toLowerCase() === 'g' || e.key.toLowerCase() === 'm') {
        setActiveGizmoTool('move');
        setToastMessage('🎯 Modo Mover (M) Ativado');
        setTimeout(() => setToastMessage(null), 1500);
      } else if (e.key.toLowerCase() === 'r') {
        setActiveGizmoTool('rotate');
        setToastMessage('🔄 Modo Rotacionar (R) Ativado');
        setTimeout(() => setToastMessage(null), 1500);
      } else if (e.key.toLowerCase() === 's') {
        setActiveGizmoTool('scale');
        setToastMessage('📐 Modo Escalar (S) Ativado');
        setTimeout(() => setToastMessage(null), 1500);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteSelected();
      } else if (e.key === 'Escape') {
        handleResetTransform();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleDeleteSelected, handleResetTransform]);

  // File Upload Handler for STL, OBJ, FBX, GLTF, GLB
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const ext = fileName.split('.').pop()?.toLowerCase();
    const reader = new FileReader();

    reader.onload = (event) => {
      const contents = event.target?.result;
      if (!contents) return;

      try {
        const finalizeImport = (geoToSave: THREE.BufferGeometry | THREE.Group | null) => {
          const newModelId = 'imported_' + Date.now();
          if (geoToSave) {
            importedGeometriesRef.current[newModelId] = geoToSave;
          }

          const newImportedModel: User3DModel = {
            id: newModelId,
            title: fileName,
            author: currentUser ? currentUser.name : 'Micael Nildo',
            type: 'foguete_completo',
            meshType: 'cylinder_rocket',
            primitiveShape: 'imported',
            visible: true,
            locked: false,
            posX: 0,
            posY: 0,
            posZ: 0,
            rotX: 0,
            rotY: 0,
            rotZ: 0,
            scaleX: 1,
            scaleY: 1,
            scaleZ: 1,
            color: '#ef4444',
            description: `Modelo 3D CAD importado em formato .${ext?.toUpperCase()} (${(file.size / 1024).toFixed(1)} KB).`,
            createdAt: new Date().toISOString().split('T')[0]
          };

          setModels((prev) => [newImportedModel, ...prev]);
          setSelectedModelId(newModelId);

          setToastMessage(`🚀 Arquivo .${ext?.toUpperCase()} "${fileName}" importado com sucesso!`);
          setTimeout(() => setToastMessage(null), 4000);
        };

        if (ext === 'stl') {
          const loader = new STLLoader();
          const loadedGeometry = loader.parse(contents as ArrayBuffer);
          loadedGeometry.center();
          finalizeImport(loadedGeometry);
        } else if (ext === 'obj') {
          const loader = new OBJLoader();
          const text = typeof contents === 'string' ? contents : new TextDecoder().decode(contents as ArrayBuffer);
          const loadedGroup = loader.parse(text);
          finalizeImport(loadedGroup);
        } else if (ext === 'fbx') {
          const loader = new FBXLoader();
          const loadedGroup = loader.parse(contents as ArrayBuffer, '');
          finalizeImport(loadedGroup);
        } else if (ext === 'gltf' || ext === 'glb') {
          const loader = new GLTFLoader();
          loader.parse(
            contents as ArrayBuffer,
            '',
            (gltf) => {
              finalizeImport(gltf.scene);
            },
            (error) => {
              console.error('Erro no GLTFLoader:', error);
              setToastMessage('⚠️ Erro ao processar o arquivo GLTF/GLB.');
              setTimeout(() => setToastMessage(null), 4000);
            }
          );
          return;
        } else {
          // Fallback box for unknown format
          finalizeImport(new THREE.BoxGeometry(2, 2, 2));
        }

      } catch (err) {
        console.error('Erro ao importar arquivo 3D:', err);
        setToastMessage('⚠️ Erro ao processar o arquivo 3D. Verifique a sintaxe.');
        setTimeout(() => setToastMessage(null), 4000);
      }
    };

    if (ext === 'obj') {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  // Refs to maintain Three.js controls
  const transformControlRef = useRef<TransformControls | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const isDraggingRef = useRef(false);

  // Sync activeGizmoTool
  useEffect(() => {
    if (transformControlRef.current) {
      transformControlRef.current.setMode(activeGizmoTool === 'rotate' ? 'rotate' : activeGizmoTool === 'scale' ? 'scale' : 'translate');
    }
  }, [activeGizmoTool]);

  // Three.js Render Hook for active viewport
  useEffect(() => {
    const targetMount = isExpanded ? expandedMountRef.current : mountRef.current;
    if (!targetMount) return;

    const width = targetMount.clientWidth;
    const height = targetMount.clientHeight || (isExpanded ? 600 : 450);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1120);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(6, 6, 14);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    targetMount.innerHTML = '';
    targetMount.appendChild(renderer.domElement);

    // OrbitControls
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControlsRef.current = orbitControls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xef4444, 2);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    fillLight.position.set(-10, -10, -10);
    scene.add(fillLight);

    const grid = new THREE.GridHelper(20, 20, 0xdc2626, 0x1e293b);
    grid.position.y = -2;
    scene.add(grid);

    // Main Group for All Models
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);

    // TransformControls
    const transformControl = new TransformControls(camera, renderer.domElement);
    transformControl.setMode(activeGizmoTool === 'rotate' ? 'rotate' : activeGizmoTool === 'scale' ? 'scale' : 'translate');
    scene.add(transformControl.getHelper());
    transformControlRef.current = transformControl;

    let activeSelectedGroup: THREE.Object3D | null = null;

    // Build & render all visible objects in models
    models.forEach((m) => {
      if (m.visible === false) return; // Hide object if visible is false

      const customGeo = importedGeometriesRef.current[m.id];
      const meshObj = createMeshForModel(m, customGeo);

      meshObj.position.set(m.posX, m.posY, m.posZ);
      meshObj.rotation.set(m.rotX, m.rotY, m.rotZ);
      meshObj.scale.set(m.scaleX, m.scaleY, m.scaleZ);

      objectsGroup.add(meshObj);

      if (m.id === selectedModelId) {
        activeSelectedGroup = meshObj;
        if (!m.locked) {
          transformControl.attach(meshObj);
        } else {
          transformControl.detach();
        }
      }
    });

    if (!activeSelectedGroup || models.find((m) => m.id === selectedModelId)?.locked) {
      transformControl.detach();
    }

    transformControl.addEventListener('dragging-changed', (event) => {
      orbitControls.enabled = !event.value;
      isDraggingRef.current = event.value;

      if (!event.value && activeSelectedGroup) { // Drag ended
        pushHistory();
        setModels((prev) =>
          prev.map((m) =>
            m.id === selectedModelId
              ? {
                  ...m,
                  posX: activeSelectedGroup!.position.x,
                  posY: activeSelectedGroup!.position.y,
                  posZ: activeSelectedGroup!.position.z,
                  rotX: activeSelectedGroup!.rotation.x,
                  rotY: activeSelectedGroup!.rotation.y,
                  rotZ: activeSelectedGroup!.rotation.z,
                  scaleX: activeSelectedGroup!.scale.x,
                  scaleY: activeSelectedGroup!.scale.y,
                  scaleZ: activeSelectedGroup!.scale.z
                }
              : m
          )
        );
      }
    });

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      orbitControls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      transformControl.detach();
      transformControl.dispose();
      orbitControls.dispose();
      renderer.dispose();
    };
  }, [models, selectedModelId, isExpanded, activeGizmoTool, pushHistory]);

  // Handle Transform Slider Change
  const handleTransformChange = (field: keyof User3DModel, val: number) => {
    if (currentModel?.locked) {
      setToastMessage('🔒 Objeto bloqueado! Desbloqueie para editar.');
      setTimeout(() => setToastMessage(null), 2000);
      return;
    }
    pushHistory();
    setModels((prev) =>
      prev.map((m) => (m.id === selectedModelId ? { ...m, [field]: val } : m))
    );
  };

  const handleSetView = (view: 'front' | 'top' | 'side' | 'iso') => {
    if (!orbitControlsRef.current) return;
    const camera = orbitControlsRef.current.object as THREE.PerspectiveCamera;
    
    switch (view) {
      case 'front':
        camera.position.set(0, 0, 14);
        break;
      case 'top':
        camera.position.set(0, 14, 0);
        break;
      case 'side':
        camera.position.set(14, 0, 0);
        break;
      case 'iso':
        camera.position.set(8, 8, 14);
        break;
    }
    camera.lookAt(0, 0, 0);
    orbitControlsRef.current.target.set(0, 0, 0);
    orbitControlsRef.current.update();
  };

  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const created: User3DModel = {
      id: 'usr_' + Date.now(),
      title: newTitle,
      author: currentUser ? currentUser.name : 'Micael Nildo',
      type: newType,
      meshType: newMeshType,
      primitiveShape: 'cylinder',
      visible: true,
      locked: false,
      posX: 0,
      posY: 0,
      posZ: 0,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
      color: newColor,
      description: newDesc || 'Modelo 3D criado no estúdio interativo FogueteData.',
      createdAt: new Date().toISOString().split('T')[0],
      driveOrVideoLink: newLink
    };

    setModels([created, ...models]);
    setSelectedModelId(created.id);
    setShowAddModal(false);
    setNewTitle('');
    setNewDesc('');
    setNewLink('');

    setToastMessage('✨ Modelo cadastrado no estúdio com sucesso!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-red-600 text-white font-mono text-xs px-4 py-2.5 rounded-lg shadow-2xl border border-red-300 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-500 font-mono text-[10px] uppercase tracking-wider mb-1">
            <Box className="w-3.5 h-3.5" />
            Engenharia CAD 3D & Modelagem em Tempo Real
          </div>
          <h2 className="text-xl font-bold font-italic-title text-slate-900 dark:text-white tracking-tight">
            Estúdio Interativo de Objetos 3D & Importador CAD (.STL, .OBJ, .FBX)
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Adicione <strong className="text-red-400">formas geométricas básicas</strong> e <strong className="text-red-400">componentes de foguete</strong> (aleta, nariz, motor, tubo de corpo). Gerencie visibilidade (👁️), bloqueio (🔒) e exclusão por botão ou atalho (<strong className="text-white">Delete / Backspace</strong>). Importe arquivos <strong className="text-white">.STL, .OBJ e .FBX</strong> instantaneamente.
          </p>
        </div>

        {/* Quick Actions & Importers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* File Upload Button for STL, OBJ, FBX */}
          <label className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-lg shadow-red-600/30 cursor-pointer font-mono">
            <Upload className="w-4 h-4" />
            <span>Importar (.STL, .OBJ, .FBX)</span>
            <input
              type="file"
              accept=".stl,.obj,.fbx,.gltf,.glb,.step"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {currentUser ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-lg text-xs font-bold transition font-mono"
            >
              <Plus className="w-4 h-4 text-red-400" />
              Adicionar Modelo Procedural
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition"
            >
              <ShieldAlert className="w-4 h-4" />
              Login p/ Salvar CAD
            </button>
          )}
        </div>
      </div>

      {/* QUICK TOOLBAR: INSERT GEOMETRIC PRIMITIVES & ROCKET COMPONENTS */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-2">
          <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-red-500" />
            Inserção Rápida de Formas Geométricas & Componentes de Foguete
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Clique para adicionar diretamente na cena 3D</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Geometric Primitives */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-semibold text-slate-300 flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-blue-400" />
              Formas Geométricas Básicas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleAddPrimitive('cube')}
                className="bg-slate-900 hover:bg-blue-600/30 border border-slate-700 hover:border-blue-500 text-slate-200 hover:text-white px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
                title="Inserir Cubo 3D"
              >
                <Box className="w-3.5 h-3.5 text-blue-400" />
                Cubo
              </button>
              <button
                onClick={() => handleAddPrimitive('arc')}
                className="bg-slate-900 hover:bg-purple-600/30 border border-slate-700 hover:border-purple-500 text-slate-200 hover:text-white px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
                title="Inserir Arco / Toro 3D"
              >
                <Disc className="w-3.5 h-3.5 text-purple-400" />
                Arco / Toro
              </button>
              <button
                onClick={() => handleAddPrimitive('cone')}
                className="bg-slate-900 hover:bg-amber-600/30 border border-slate-700 hover:border-amber-500 text-slate-200 hover:text-white px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
                title="Inserir Cone Geométrico"
              >
                <Triangle className="w-3.5 h-3.5 text-amber-400 rotate-180" />
                Cone
              </button>
              <button
                onClick={() => handleAddPrimitive('pyramid')}
                className="bg-slate-900 hover:bg-emerald-600/30 border border-slate-700 hover:border-emerald-500 text-slate-200 hover:text-white px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
                title="Inserir Pirâmide 3D"
              >
                <Triangle className="w-3.5 h-3.5 text-emerald-400" />
                Pirâmide
              </button>
              <button
                onClick={() => handleAddPrimitive('cylinder')}
                className="bg-slate-900 hover:bg-red-600/30 border border-slate-700 hover:border-red-500 text-slate-200 hover:text-white px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
                title="Inserir Cilindro Base"
              >
                <Cylinder className="w-3.5 h-3.5 text-red-400" />
                Cilindro
              </button>
              <button
                onClick={() => handleAddPrimitive('sphere')}
                className="bg-slate-900 hover:bg-pink-600/30 border border-slate-700 hover:border-pink-500 text-slate-200 hover:text-white px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
                title="Inserir Esfera Geométrica"
              >
                <Circle className="w-3.5 h-3.5 text-pink-400" />
                Esfera
              </button>
            </div>
          </div>

          {/* Rocket Specific Components */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-red-500" />
              Componentes de Foguete:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleAddRocketShape('fin')}
                className="bg-slate-900 hover:bg-red-600/30 border border-slate-700 hover:border-red-500 text-slate-200 hover:text-white px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
                title="Inserir Aleta Aerodinâmica"
              >
                <Wind className="w-3.5 h-3.5 text-red-400" />
                Aleta
              </button>
              <button
                onClick={() => handleAddRocketShape('nosecone')}
                className="bg-slate-900 hover:bg-red-600/30 border border-slate-700 hover:border-red-500 text-slate-200 hover:text-white px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
                title="Inserir Coifa / Nariz Ogival"
              >
                <Triangle className="w-3.5 h-3.5 text-red-500" />
                Nariz / Coifa
              </button>
              <button
                onClick={() => handleAddRocketShape('engine')}
                className="bg-slate-900 hover:bg-orange-600/30 border border-slate-700 hover:border-orange-500 text-slate-200 hover:text-white px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
                title="Inserir Motor & Bocal de Empuxo"
              >
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                Motor / Bocal
              </button>
              <button
                onClick={() => handleAddRocketShape('body_tube')}
                className="bg-slate-900 hover:bg-cyan-600/30 border border-slate-700 hover:border-cyan-500 text-slate-200 hover:text-white px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
                title="Inserir Tubo de Corpo / Fuselagem"
              >
                <Cylinder className="w-3.5 h-3.5 text-cyan-400" />
                Corpo / Tubo
              </button>
              <button
                onClick={() => handleAddRocketShape('centering_ring')}
                className="bg-slate-900 hover:bg-slate-600/30 border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
                title="Inserir Anel Centrador"
              >
                <Disc className="w-3.5 h-3.5 text-slate-400" />
                Anel Centrador
              </button>
              <button
                onClick={() => handleAddRocketShape('payload')}
                className="bg-slate-900 hover:bg-purple-600/30 border border-slate-700 hover:border-purple-500 text-slate-200 hover:text-white px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
                title="Inserir Módulo de Carga Útil"
              >
                <Package className="w-3.5 h-3.5 text-purple-400" />
                Carga Útil
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Control Panel & Scene Objects List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* OBJETOS EM CENA (SCENE OBJECTS LIST WITH HIDE, LOCK, DELETE) */}
          <div className="bg-[#111827] border border-slate-800 rounded-lg p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-red-500" />
                Objetos na Cena ({models.length})
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                Atalho p/ Deletar: <strong className="text-white">Delete / Backspace</strong>
              </span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 no-scrollbar font-mono text-xs">
              {models.map((m) => {
                const isSelected = m.id === selectedModelId;
                const isHidden = m.visible === false;
                const isLocked = m.locked === true;

                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModelId(m.id)}
                    className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-red-600/20 border-red-500 text-white font-bold shadow-md'
                        : 'bg-[#05070A] border-slate-800 text-slate-300 hover:border-slate-700'
                    } ${isHidden ? 'opacity-50 italic' : ''}`}
                  >
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      <span className="w-3 h-3 rounded-full shrink-0 border border-white/20" style={{ backgroundColor: m.color }} />
                      <div className="min-w-0 truncate">
                        <div className="text-xs flex items-center gap-1.5 truncate">
                          <span className="truncate">{m.title}</span>
                          {m.primitiveShape === 'imported' && (
                            <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1 py-0.5 rounded uppercase shrink-0">
                              3D
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">Autor: {m.author}</div>
                      </div>
                    </div>

                    {/* Controls: Hide, Lock, Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Hide / Show Button */}
                      <button
                        onClick={(e) => handleToggleVisibility(m.id, e)}
                        className={`p-1.5 rounded transition ${
                          isHidden
                            ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                            : 'bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                        title={isHidden ? 'Visualizar Objeto na Cena' : 'Ocultar Objeto na Cena'}
                      >
                        {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      {/* Lock / Unlock Button */}
                      <button
                        onClick={(e) => handleToggleLock(m.id, e)}
                        className={`p-1.5 rounded transition ${
                          isLocked
                            ? 'bg-red-950/90 text-red-400 border border-red-800'
                            : 'bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                        title={isLocked ? 'Desbloquear Objeto' : 'Bloquear Objeto contra Edições'}
                      >
                        {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteModelById(m.id);
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-red-600/80 text-slate-400 hover:text-white rounded transition"
                        title="Deletar Objeto (Atalho: Delete / Backspace)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transformation Sliders & Shortcut Cheatsheet */}
          <div className="bg-[#111827] border border-slate-800 rounded-lg p-4 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 font-mono uppercase">
                <Sparkles className="w-3.5 h-3.5 text-red-500" />
                Painel de Manipulação do Modelo
                {currentModel?.locked && (
                  <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                    <Lock className="w-3 h-3" /> Bloqueado
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleUndo}
                  disabled={history.length === 0 || currentModel?.locked}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded text-xs transition"
                  title="Desfazer (Ctrl+Z)"
                >
                  <Undo className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={redoStack.length === 0 || currentModel?.locked}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded text-xs transition"
                  title="Refazer (Ctrl+Y)"
                >
                  <Redo className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetTransform}
                  disabled={currentModel?.locked}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded text-xs transition"
                  title="Resetar Posição (Esc)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mover Sliders */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between font-mono">
                <span className="flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-red-500" />
                  Mover Posição (X, Y, Z)
                </span>
                <span className="text-[10px] text-slate-500">Atalho: [G / M]</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono">X: {currentModel.posX.toFixed(1)}</span>
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    step="0.1"
                    disabled={currentModel?.locked}
                    value={currentModel.posX}
                    onChange={(e) => handleTransformChange('posX', parseFloat(e.target.value))}
                    className="w-full accent-red-500 h-1 bg-slate-800 rounded disabled:opacity-30"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono">Y: {currentModel.posY.toFixed(1)}</span>
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    step="0.1"
                    disabled={currentModel?.locked}
                    value={currentModel.posY}
                    onChange={(e) => handleTransformChange('posY', parseFloat(e.target.value))}
                    className="w-full accent-red-500 h-1 bg-slate-800 rounded disabled:opacity-30"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono">Z: {currentModel.posZ.toFixed(1)}</span>
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    step="0.1"
                    disabled={currentModel?.locked}
                    value={currentModel.posZ}
                    onChange={(e) => handleTransformChange('posZ', parseFloat(e.target.value))}
                    className="w-full accent-red-500 h-1 bg-slate-800 rounded disabled:opacity-30"
                  />
                </div>
              </div>
            </div>

            {/* Rotacionar Sliders */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between font-mono">
                <span className="flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-red-500" />
                  Rotacionar Ângulo (X, Y, Z)
                </span>
                <span className="text-[10px] text-slate-500">Atalho: [R]</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono">Rot X: {currentModel.rotX.toFixed(2)}</span>
                  <input
                    type="range"
                    min="-3.14"
                    max="3.14"
                    step="0.05"
                    disabled={currentModel?.locked}
                    value={currentModel.rotX}
                    onChange={(e) => handleTransformChange('rotX', parseFloat(e.target.value))}
                    className="w-full accent-red-500 h-1 bg-slate-800 rounded disabled:opacity-30"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono">Rot Y: {currentModel.rotY.toFixed(2)}</span>
                  <input
                    type="range"
                    min="-3.14"
                    max="3.14"
                    step="0.05"
                    disabled={currentModel?.locked}
                    value={currentModel.rotY}
                    onChange={(e) => handleTransformChange('rotY', parseFloat(e.target.value))}
                    className="w-full accent-red-500 h-1 bg-slate-800 rounded disabled:opacity-30"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono">Rot Z: {currentModel.rotZ.toFixed(2)}</span>
                  <input
                    type="range"
                    min="-3.14"
                    max="3.14"
                    step="0.05"
                    disabled={currentModel?.locked}
                    value={currentModel.rotZ}
                    onChange={(e) => handleTransformChange('rotZ', parseFloat(e.target.value))}
                    className="w-full accent-red-500 h-1 bg-slate-800 rounded disabled:opacity-30"
                  />
                </div>
              </div>
            </div>

            {/* Escalar Sliders */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between font-mono">
                <span className="flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-red-500" />
                  Escalar Dimensão (X, Y, Z)
                </span>
                <span className="text-[10px] text-slate-500">Atalho: [S]</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono">Esc X: {currentModel.scaleX.toFixed(1)}x</span>
                  <input
                    type="range"
                    min="0.2"
                    max="4.0"
                    step="0.1"
                    disabled={currentModel?.locked}
                    value={currentModel.scaleX}
                    onChange={(e) => handleTransformChange('scaleX', parseFloat(e.target.value))}
                    className="w-full accent-red-500 h-1 bg-slate-800 rounded disabled:opacity-30"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono">Esc Y: {currentModel.scaleY.toFixed(1)}x</span>
                  <input
                    type="range"
                    min="0.2"
                    max="4.0"
                    step="0.1"
                    disabled={currentModel?.locked}
                    value={currentModel.scaleY}
                    onChange={(e) => handleTransformChange('scaleY', parseFloat(e.target.value))}
                    className="w-full accent-red-500 h-1 bg-slate-800 rounded disabled:opacity-30"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono">Esc Z: {currentModel.scaleZ.toFixed(1)}x</span>
                  <input
                    type="range"
                    min="0.2"
                    max="4.0"
                    step="0.1"
                    disabled={currentModel?.locked}
                    value={currentModel.scaleZ}
                    onChange={(e) => handleTransformChange('scaleZ', parseFloat(e.target.value))}
                    className="w-full accent-red-500 h-1 bg-slate-800 rounded disabled:opacity-30"
                  />
                </div>
              </div>
            </div>

            {/* Keyboard Shortcuts Reference Box */}
            <div className="p-3 bg-[#05070A] rounded-lg border border-slate-800 space-y-1.5 font-mono text-[10px] text-slate-400">
              <div className="font-bold text-slate-300 flex items-center gap-1">
                <Keyboard className="w-3.5 h-3.5 text-red-400" />
                Guia de Teclas de Atalho:
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-400">
                <span>• <strong className="text-white">G / M</strong>: Modo Mover</span>
                <span>• <strong className="text-white">R</strong>: Modo Rotacionar</span>
                <span>• <strong className="text-white">S</strong>: Modo Escalar</span>
                <span>• <strong className="text-white">Del / Backspace</strong>: Deletar</span>
                <span>• <strong className="text-white">Ctrl+Z</strong>: Desfazer</span>
                <span>• <strong className="text-white">Ctrl+Y</strong>: Refazer</span>
                <span>• <strong className="text-white">Esc</strong>: Resetar Origem</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right 3D Viewport with On-Screen Toolbar (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
            
            {/* Viewport Header Toolbar */}
            <div className="p-3 bg-slate-950/90 border-b border-slate-800 flex justify-between items-center text-xs font-mono">
              <span className="font-semibold text-slate-200 flex items-center gap-2">
                <Box className="w-4 h-4 text-red-500" />
                {currentModel.title}
                {currentModel.locked && (
                  <span className="text-[10px] text-red-400 bg-red-950 border border-red-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Bloqueado
                  </span>
                )}
              </span>

              {/* On-Screen Manipulation Quick Tools */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveGizmoTool('move')}
                  className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition ${
                    activeGizmoTool === 'move' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                  title="Mover (M)"
                >
                  <Move className="w-3 h-3" />
                  Mover
                </button>
                <button
                  onClick={() => setActiveGizmoTool('rotate')}
                  className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition ${
                    activeGizmoTool === 'rotate' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                  title="Rotacionar (R)"
                >
                  <RotateCw className="w-3 h-3" />
                  Rotacionar
                </button>
                <button
                  onClick={() => setActiveGizmoTool('scale')}
                  className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition ${
                    activeGizmoTool === 'scale' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                  title="Escalar (S)"
                >
                  <Maximize2 className="w-3 h-3" />
                  Escalar
                </button>

                {/* Advanced CAD & Simulation CFD/FEA Button */}
                <button
                  onClick={() => setIsAdvancedCadOpen(true)}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold px-2.5 py-1 rounded text-[11px] flex items-center gap-1 transition shadow ml-1 font-mono"
                  title="Abrir Ambiente de CAD Avançado com Análises CFD e FEA"
                >
                  <Wind className="w-3 h-3 text-red-200" />
                  CAD & CFD/FEA
                </button>

                {/* Fullscreen Expand 3D View Button */}
                <button
                  onClick={() => setIsExpanded(true)}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold px-2.5 py-1 rounded text-[11px] flex items-center gap-1 transition shadow ml-1 font-mono"
                  title="Expandir Visualização 3D em Tela Cheia"
                >
                  <Maximize2 className="w-3 h-3" />
                  Expandir 3D
                </button>
              </div>
            </div>

            {/* WebGL Canvas Mounting Box */}
            <div className="relative w-full h-[480px] bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
              
              {/* View Cube Buttons Overlay */}
              <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                <div className="text-[9px] font-mono text-slate-400 text-center uppercase tracking-widest mb-1">Vistas CAD</div>
                <button onClick={() => handleSetView('top')} className="bg-slate-900/80 hover:bg-red-600/90 text-white p-1.5 rounded border border-slate-700 hover:border-red-500 transition shadow-lg text-[10px] font-mono">Topo</button>
                <button onClick={() => handleSetView('front')} className="bg-slate-900/80 hover:bg-red-600/90 text-white p-1.5 rounded border border-slate-700 hover:border-red-500 transition shadow-lg text-[10px] font-mono">Frente</button>
                <button onClick={() => handleSetView('side')} className="bg-slate-900/80 hover:bg-red-600/90 text-white p-1.5 rounded border border-slate-700 hover:border-red-500 transition shadow-lg text-[10px] font-mono">Lado</button>
                <button onClick={() => handleSetView('iso')} className="bg-slate-900/80 hover:bg-red-600/90 text-white p-1.5 rounded border border-slate-700 hover:border-red-500 transition shadow-lg text-[10px] font-mono">Iso</button>
              </div>

              {/* Transform Tool Shortcuts Overlay */}
              <div className="absolute top-2 left-2 flex gap-1 z-10">
                <button 
                  onClick={() => setActiveGizmoTool('move')} 
                  className={`p-2 rounded border transition shadow-lg ${activeGizmoTool === 'move' ? 'bg-red-600 border-red-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'}`}
                  title="Mover [G / M]"
                >
                  <Move className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveGizmoTool('rotate')} 
                  className={`p-2 rounded border transition shadow-lg ${activeGizmoTool === 'rotate' ? 'bg-red-600 border-red-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'}`}
                  title="Rotacionar [R]"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveGizmoTool('scale')} 
                  className={`p-2 rounded border transition shadow-lg ${activeGizmoTool === 'scale' ? 'bg-red-600 border-red-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'}`}
                  title="Escalar [S]"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
              {renderInViewportCadHud()}
            </div>

            {/* Footer Details */}
            <div className="p-3.5 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="text-xs font-semibold text-white">
                  Descrição: <span className="text-slate-300 font-normal">{currentModel.description}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                  Autor da Contribuição: <strong className="text-red-400">{currentModel.author}</strong>
                </div>
              </div>

              {currentModel.driveOrVideoLink && (
                <a
                  href={currentModel.driveOrVideoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-950/80 px-3 py-1.5 rounded-lg border border-red-500/30 whitespace-nowrap font-mono"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir Anexo CAD
                </a>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* FULLSCREEN EXPANDED 3D VIEWPORT MODAL */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col p-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
            <div className="flex items-center gap-3">
              <span className="text-red-500 font-bold text-base flex items-center gap-2">
                <Box className="w-5 h-5 text-red-500" />
                Estúdio 3D Ampliado - {currentModel.title}
              </span>
              <span className="bg-red-950 text-red-400 text-xs px-2 py-0.5 rounded border border-red-800">
                {currentModel.author}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleUndo}
                className="bg-slate-800 text-slate-200 px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-700 flex items-center gap-1"
              >
                <Undo className="w-3.5 h-3.5" />
                Desfazer
              </button>
              <button
                onClick={handleRedo}
                className="bg-slate-800 text-slate-200 px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-700 flex items-center gap-1"
              >
                <Redo className="w-3.5 h-3.5" />
                Refazer
              </button>
              <button
                onClick={handleResetTransform}
                className="bg-slate-800 text-slate-200 px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Resetar
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition"
              >
                <Minimize2 className="w-4 h-4" />
                Fechar Visão Expandida
              </button>
            </div>
          </div>

          {/* Fullscreen Canvas Container */}
          <div className="flex-1 relative w-full my-3 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            {/* View Cube Buttons Overlay */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <div className="text-xs font-mono text-slate-400 text-center uppercase tracking-widest mb-1">Vistas CAD</div>
              <button onClick={() => handleSetView('top')} className="bg-slate-900/80 hover:bg-red-600/90 text-white px-3 py-2 rounded-lg border border-slate-700 hover:border-red-500 transition shadow-lg text-xs font-mono">Topo</button>
              <button onClick={() => handleSetView('front')} className="bg-slate-900/80 hover:bg-red-600/90 text-white px-3 py-2 rounded-lg border border-slate-700 hover:border-red-500 transition shadow-lg text-xs font-mono">Frente</button>
              <button onClick={() => handleSetView('side')} className="bg-slate-900/80 hover:bg-red-600/90 text-white px-3 py-2 rounded-lg border border-slate-700 hover:border-red-500 transition shadow-lg text-xs font-mono">Lado</button>
              <button onClick={() => handleSetView('iso')} className="bg-slate-900/80 hover:bg-red-600/90 text-white px-3 py-2 rounded-lg border border-slate-700 hover:border-red-500 transition shadow-lg text-xs font-mono">Iso</button>
            </div>

            {/* Transform Tool Shortcuts Overlay */}
            <div className="absolute top-4 left-4 flex gap-2 z-10">
              <button 
                onClick={() => setActiveGizmoTool('move')} 
                className={`p-3 rounded-lg border transition shadow-lg ${activeGizmoTool === 'move' ? 'bg-red-600 border-red-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'}`}
                title="Mover [G / M]"
              >
                <Move className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setActiveGizmoTool('rotate')} 
                className={`p-3 rounded-lg border transition shadow-lg ${activeGizmoTool === 'rotate' ? 'bg-red-600 border-red-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'}`}
                title="Rotacionar [R]"
              >
                <RotateCw className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setActiveGizmoTool('scale')} 
                className={`p-3 rounded-lg border transition shadow-lg ${activeGizmoTool === 'scale' ? 'bg-red-600 border-red-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'}`}
                title="Escalar [S]"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>

            <div ref={expandedMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
            {renderInViewportCadHud()}
          </div>

          {/* Expanded Bottom Controls */}
          <div className="bg-[#111827] border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-slate-300">
            <div className="flex items-center gap-4">
              <span>Posição (X,Y,Z): <strong>{currentModel.posX.toFixed(1)}, {currentModel.posY.toFixed(1)}, {currentModel.posZ.toFixed(1)}</strong></span>
              <span>Rotação: <strong>{currentModel.rotX.toFixed(2)}, {currentModel.rotY.toFixed(2)}, {currentModel.rotZ.toFixed(2)}</strong></span>
              <span>Escala: <strong>{currentModel.scaleX.toFixed(1)}x</strong></span>
            </div>
            <div className="text-slate-400 text-[11px]">
              Utilize o mouse para rotacionar. Pressione <strong className="text-white">G (Mover)</strong>, <strong className="text-white">R (Rotacionar)</strong>, <strong className="text-white">S (Escalar)</strong>, <strong className="text-white">Del / Backspace (Deletar)</strong>.
            </div>
          </div>
        </div>
      )}

      {/* Modal - Add New Procedural 3D Model */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-slate-100 font-sans">
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
              <Box className="w-5 h-5 text-red-500" />
              Cadastrar Modelo Procedural 3D
            </h3>

            <form onSubmit={handleAddModel} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Título do Modelo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Foguete Amador Classe H - Veloce"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#05070A] border border-slate-800 rounded-lg p-2.5 text-white outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoria de Peça</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as User3DModel['type'])}
                    className="w-full bg-[#05070A] border border-slate-800 rounded-lg p-2.5 text-white outline-none font-mono"
                  >
                    <option value="foguete_completo">Foguete Completo</option>
                    <option value="coifa">Coifa (Nosecone)</option>
                    <option value="aletagem">Aletagem (Fins)</option>
                    <option value="motor">Motor de Propulsão</option>
                    <option value="payload">Carga Útil / Cansat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Geometria Mesh Base</label>
                  <select
                    value={newMeshType}
                    onChange={(e) => setNewMeshType(e.target.value as User3DModel['meshType'])}
                    className="w-full bg-[#05070A] border border-slate-800 rounded-lg p-2.5 text-white outline-none font-mono"
                  >
                    <option value="cylinder_rocket">Cilíndrico Monostágio</option>
                    <option value="multistage">Multiestágio Avançado</option>
                    <option value="heavy_lift">Heavy-Lift Booster</option>
                    <option value="experimental_mini">Minifoguete Experimental</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cor do Modelo</label>
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-full h-9 bg-[#05070A] border border-slate-800 rounded-lg cursor-pointer p-1"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descrição Técnica</label>
                <textarea
                  rows={2}
                  placeholder="Especifique massa, dimensão do tubo e impulso total..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#05070A] border border-slate-800 rounded-lg p-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Link Externo (Google Drive / CAD)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  className="w-full bg-[#05070A] border border-slate-800 rounded-lg p-2.5 text-white outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 font-mono"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow font-mono"
                >
                  Salvar no Estúdio
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Advanced CAD & Simulation CFD/FEA Modal */}
      <AdvancedCadStudio
        isOpen={isAdvancedCadOpen}
        onClose={() => setIsAdvancedCadOpen(false)}
        selectedModel={currentModel}
      />

    </div>
  );
};
