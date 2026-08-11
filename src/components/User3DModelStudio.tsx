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
import { getStoredModels, saveStoredModels } from '../utils/offlineCache';

interface User3DModelStudioProps {
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onStartWalkthrough?: () => void;
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
  onOpenAuthModal,
  onStartWalkthrough
}) => {
  const [models, setModels] = useState<User3DModel[]>(() => getStoredModels(INITIAL_MODELS));
  const [selectedModelId, setSelectedModelId] = useState<string>(() => {
    const loaded = getStoredModels(INITIAL_MODELS);
    return loaded[0]?.id || 'm1';
  });

  // Automatically cache models to localStorage on every change
  useEffect(() => {
    saveStoredModels(models);
  }, [models]);
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
  const [activeViewportCadTab, setActiveViewportCadTab] = useState<'none' | 'measures' | 'mesh_edit' | 'sketch' | 'propulsion' | 'lighting' | 'export'>('none');
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

  // Mesh Edit Sub-Object States in HUD
  const [subObjectMode, setSubObjectMode] = useState<'object' | 'vertex' | 'edge' | 'face'>('object');
  const [meshExtrudeMm, setMeshExtrudeMm] = useState<number>(25);
  const [meshSubdivideLevel, setMeshSubdivideLevel] = useState<number>(1);
  const [activeSubElementIndex, setActiveSubElementIndex] = useState<number>(0);

  // Propulsion Thermodynamics States in HUD
  const [propellantPair, setPropellantPair] = useState<'lox_rp1' | 'lox_ch4' | 'n2o_htpb' | 'n2o_paraffin' | 'hno3_kerosene'>('lox_rp1');
  const [chamberPressureBar, setChamberPressureBar] = useState<number>(35);
  const [expansionRatio, setExpansionRatio] = useState<number>(12);
  const [throatDiameterMm, setThroatDiameterMm] = useState<number>(28);
  const [propulsionAltitudeM, setPropulsionAltitudeM] = useState<number>(0);
  const [regenCoolingFlowKgS, setRegenCoolingFlowKgS] = useState<number>(0.85);

  const [sketchLines, setSketchLines] = useState<number[][][]>([]);
  const [sketchStartPoint, setSketchStartPoint] = useState<{x: number, y: number, z: number} | null>(null);
  const [sketchMeasure, setSketchMeasure] = useState<string>('');
  const [sketchAngle, setSketchAngle] = useState<string>('');
  const [sketchRadius, setSketchRadius] = useState<string>('50');
  const [sketchWidth, setSketchWidth] = useState<string>('100');
  const [sketchHeight, setSketchHeight] = useState<string>('50');
  const [sketchArcAngle, setSketchArcAngle] = useState<string>('180');
  const [hudFillLight, setHudFillLight] = useState<number>(1.2);
  const [hudAmbientLight, setHudAmbientLight] = useState<number>(0.9);
  const [explodedView, setExplodedView] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'solid' | 'wireframe' | 'xray'>('solid');

  const desenharCirculo = (centerX = sketchStartPoint?.x || 0, centerZ = sketchStartPoint?.z || 0) => {
    const r = parseFloat(sketchRadius) / 20 || 2.5;
    const segments = 32;
    const lines: number[][][] = [];
    for (let i = 0; i < segments; i++) {
      const a1 = (i / segments) * Math.PI * 2;
      const a2 = ((i + 1) / segments) * Math.PI * 2;
      lines.push([
        [centerX + r * Math.cos(a1), -2, centerZ + r * Math.sin(a1)],
        [centerX + r * Math.cos(a2), -2, centerZ + r * Math.sin(a2)]
      ]);
    }
    setSketchLines(prev => [...prev, ...lines]);
    setToastMessage(`⭕ Círculo (Ø ${(r * 20).toFixed(0)}mm) desenhado no estúdio!`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const desenharRetangulo = (startX = sketchStartPoint?.x || -2, startZ = sketchStartPoint?.z || -1) => {
    const w = parseFloat(sketchWidth) / 20 || 4.0;
    const h = parseFloat(sketchHeight) / 20 || 2.0;
    const y = -2;
    const rectLines: number[][][] = [
      [[startX, y, startZ], [startX + w, y, startZ]],
      [[startX + w, y, startZ], [startX + w, y, startZ + h]],
      [[startX + w, y, startZ + h], [startX, y, startZ + h]],
      [[startX, y, startZ + h], [startX, y, startZ]]
    ];
    setSketchLines(prev => [...prev, ...rectLines]);
    setToastMessage(`▭ Retângulo (${(w * 20).toFixed(0)}x${(h * 20).toFixed(0)}mm) desenhado no estúdio!`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const desenharArco = (centerX = sketchStartPoint?.x || 0, centerZ = sketchStartPoint?.z || 0) => {
    const r = parseFloat(sketchRadius) / 20 || 2.5;
    const sweepDeg = parseFloat(sketchArcAngle) || 180;
    const sweepRad = (sweepDeg * Math.PI) / 180;
    const segments = 20;
    const lines: number[][][] = [];
    for (let i = 0; i < segments; i++) {
      const a1 = (i / segments) * sweepRad;
      const a2 = ((i + 1) / segments) * sweepRad;
      lines.push([
        [centerX + r * Math.cos(a1), -2, centerZ + r * Math.sin(a1)],
        [centerX + r * Math.cos(a2), -2, centerZ + r * Math.sin(a2)]
      ]);
    }
    setSketchLines(prev => [...prev, ...lines]);
    setToastMessage(`🌙 Arco (${sweepDeg}°, R ${(r * 20).toFixed(0)}mm) desenhado no estúdio!`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleExtrudeToSolid = () => {
    const newId = `extrude_${Date.now()}`;
    const shapeType = hudSketchTool === 'circle' ? 'cylinder' : hudSketchTool === 'rectangle' ? 'cube' : 'cylinder';
    
    const newModel: User3DModel = {
      id: newId,
      title: `Peça CAD Extrudada ${models.length + 1}`,
      author: currentUser?.displayName || 'Micael Nildo',
      type: 'peca_solida',
      meshType: 'cylinder_rocket',
      primitiveShape: shapeType,
      visible: true,
      locked: false,
      posX: sketchStartPoint?.x || 0,
      posY: 1.0,
      posZ: sketchStartPoint?.z || 0,
      rotX: 0, rotY: 0, rotZ: 0,
      scaleX: parseFloat(sketchWidth || sketchRadius || '100') / 50 || 1.2,
      scaleY: hudExtrudeDepth / 200 || 1.5,
      scaleZ: parseFloat(sketchHeight || sketchRadius || '100') / 50 || 1.2,
      color: '#38bdf8',
      description: `Sólido 3D gerado por extrusão CAD com profundidade ${hudExtrudeDepth}mm.`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setModels(prev => [...prev, newModel]);
    setSelectedModelId(newId);
    setSketchLines([]);
    setSketchStartPoint(null);
    setToastMessage(`⚡ Sólido CAD extrudado (${hudExtrudeDepth}mm) inserido no estúdio!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRevolveToSolid = () => {
    const newId = `revolve_${Date.now()}`;
    const newModel: User3DModel = {
      id: newId,
      title: `Corpo de Revolução CAD ${models.length + 1}`,
      author: currentUser?.displayName || 'Micael Nildo',
      type: 'foguete_completo',
      meshType: 'cylinder_rocket',
      primitiveShape: 'cone',
      visible: true,
      locked: false,
      posX: 0,
      posY: 2.0,
      posZ: 0,
      rotX: 0, rotY: 0, rotZ: 0,
      scaleX: parseFloat(hudDiameterMm.toString()) / 60 || 1.3,
      scaleY: parseFloat(hudLengthMm.toString()) / 500 || 2.0,
      scaleZ: parseFloat(hudDiameterMm.toString()) / 60 || 1.3,
      color: '#f59e0b',
      description: `Sólido de revolução 360° no eixo Y gerado a partir do perfil CAD.`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setModels(prev => [...prev, newModel]);
    setSelectedModelId(newId);
    setSketchLines([]);
    setSketchStartPoint(null);
    setToastMessage(`🌀 Sólido de Revolução 360° gerado e inserido no estúdio!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleGenerateCircularPattern = () => {
    if (!currentModel) {
      setToastMessage("Selecione um componente para aplicar o Padrão Circular!");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const count = Math.max(2, Math.min(12, hudPatternCount));
    const radius = 1.2;
    const newModels: User3DModel[] = [];

    for (let i = 1; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count;
      newModels.push({
        ...currentModel,
        id: `${currentModel.id}_pattern_${i}_${Date.now()}`,
        title: `${currentModel.title} (Cópia Radial ${i + 1})`,
        posX: currentModel.posX + radius * Math.cos(angle),
        posZ: currentModel.posZ + radius * Math.sin(angle),
        rotY: currentModel.rotY + angle,
        description: `Elemento ${i + 1} de ${count} no padrão circular radial.`
      });
    }

    setModels(prev => [...prev, ...newModels]);
    setToastMessage(`🎯 Padrão circular gerado com ${count} elementos espelhados radiais!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const calcularPontoFinal = () => {
    if (!sketchStartPoint) {
      setToastMessage("Selecione um ponto inicial clicando na grade primeiro!");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const angulo = parseFloat(sketchAngle);
    const distancia = parseFloat(sketchMeasure);

    if (isNaN(angulo) || isNaN(distancia)) {
      setToastMessage("Medida e Ângulo devem ser números válidos!");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const radianos = (angulo * Math.PI) / 180;
    
    // Supondo vista 'top', desenhamos no plano XZ
    const x2 = sketchStartPoint.x + distancia * Math.cos(radianos);
    const z2 = sketchStartPoint.z + distancia * Math.sin(radianos); 

    const novaLinha = [
      [sketchStartPoint.x, sketchStartPoint.y, sketchStartPoint.z],
      [x2, sketchStartPoint.y, z2]
    ];

    setSketchLines([...sketchLines, novaLinha]);
    setSketchStartPoint({ x: x2, y: sketchStartPoint.y, z: z2 }); // Reseta para a próxima linha de forma continua
    setSketchMeasure('');
    setSketchAngle('');
    setToastMessage(`⚡ Linha desenhada com sucesso!`);
    setTimeout(() => setToastMessage(null), 3000);
  };


  const handleCaptureHQPhoto = () => {
    const mount = isExpanded ? expandedMountRef.current : mountRef.current;
    const canvas = mount?.querySelector('canvas');
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `FogueteData_3D_Studio_Render_${Date.now()}.png`;
      a.click();
      setToastMessage('📸 Snapshot 4K renderizado e salvo como PNG!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleSetView = (view: 'top' | 'front' | 'side' | 'iso' | 'back') => {
    if (!orbitControlsRef.current) return;
    const controls = orbitControlsRef.current;
    const cam = controls.object as THREE.PerspectiveCamera;

    if (view === 'top') {
      cam.position.set(0, 18, 0.01);
      controls.target.set(0, 0, 0);
      setToastMessage('👁️ Vista Superior (Topo Y)');
    } else if (view === 'front') {
      cam.position.set(0, 0, 18);
      controls.target.set(0, 0, 0);
      setToastMessage('👁️ Vista Frontal (Z)');
    } else if (view === 'side') {
      cam.position.set(18, 0, 0);
      controls.target.set(0, 0, 0);
      setToastMessage('👁️ Vista Lateral (X)');
    } else if (view === 'back') {
      cam.position.set(0, 0, -18);
      controls.target.set(0, 0, 0);
      setToastMessage('👁️ Vista Traseira (-Z)');
    } else {
      cam.position.set(8, 8, 14);
      controls.target.set(0, 0, 0);
      setToastMessage('👁️ Vista Isométrica 3D');
    }
    controls.update();
    setTimeout(() => setToastMessage(null), 1500);
  };

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
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <div className="bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border border-slate-300 dark:border-slate-700/80 px-3 py-1.5 rounded-full text-[10px] font-mono flex items-center gap-2 sm:gap-3 text-slate-800 dark:text-slate-200 shadow-xl">
          <span className="flex items-center gap-1 text-red-400 font-bold">
            <SlidersHorizontal className="w-3 h-3" /> CAD HUD:
          </span>
          <span>$L$: <strong className="text-slate-900 dark:text-white">{hudLengthMm}mm</strong></span>
          <span>$\varnothing$: <strong className="text-slate-900 dark:text-white">{hudDiameterMm}mm</strong></span>
          <span>$t$: <strong className="text-slate-900 dark:text-white">{hudWallThicknessMm}mm</strong></span>
          <span className="hidden sm:inline text-amber-400 font-bold uppercase">{hudTubeType}</span>
        </div>
        
        <div className="bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border border-slate-300 dark:border-slate-700/80 px-3 py-1.5 rounded-full text-[10px] font-mono flex items-center gap-4 text-slate-800 dark:text-slate-200 shadow-xl">
          <div className="flex items-center gap-1">
            <span className="font-bold text-red-400">Modo Visual:</span>
            <select 
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className="bg-transparent border-none text-slate-900 dark:text-white font-bold outline-none cursor-pointer"
            >
              <option value="solid">Sólido</option>
              <option value="wireframe">Wireframe</option>
              <option value="xray">Raio-X / Transparente</option>
            </select>
          </div>
          <div className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-red-400">Visão Explodida:</span>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={explodedView} 
              onChange={(e) => setExplodedView(parseFloat(e.target.value))}
              className="w-24 accent-red-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer"
            />
            <span className="text-slate-900 dark:text-white font-bold min-w-[30px]">{(explodedView * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Floating Panel (when a tab is selected) */}
      {activeViewportCadTab !== 'none' && (
        <div className="absolute bottom-14 inset-x-2 sm:inset-x-4 z-30 bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-red-500/50 rounded-xl p-3 shadow-2xl text-xs font-mono text-slate-100 max-h-56 overflow-y-auto animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-slate-300 dark:border-slate-800 pb-2 mb-2">
            <span className="font-bold text-red-400 uppercase flex items-center gap-1.5">
              {activeViewportCadTab === 'measures' && <><Sliders className="w-4 h-4 text-red-500" /> Medidas Exatas & Perfis CAD</>}
              {activeViewportCadTab === 'mesh_edit' && <><Layers className="w-4 h-4 text-cyan-400" /> Edição de Malha 3D & Sub-Objetos</>}
              {activeViewportCadTab === 'sketch' && <><Edit3 className="w-4 h-4 text-amber-400" /> Esboço 2D/3D & Restrições Geométricas</>}
              {activeViewportCadTab === 'propulsion' && <><Flame className="w-4 h-4 text-orange-400" /> Termodinâmica de Propulsão & Bocal Laval</>}
              {activeViewportCadTab === 'lighting' && <><Sun className="w-4 h-4 text-yellow-400" /> Iluminação Estúdio & Render HQ</>}
              {activeViewportCadTab === 'export' && <><Printer className="w-4 h-4 text-emerald-400" /> Exportação Técnica & Usinagem CNC</>}
            </span>
            <button
              onClick={() => setActiveViewportCadTab('none')}
              className="p-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* TAB 1: MEASURES */}
          {activeViewportCadTab === 'measures' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Comprimento ($L$): <strong className="text-red-400">{hudLengthMm} mm</strong></label>
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
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Diâmetro ($\varnothing$): <strong className="text-red-400">{hudDiameterMm} mm</strong></label>
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
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Espessura ($t$): <strong className="text-red-400">{hudWallThicknessMm} mm</strong></label>
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
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Perfil de Tubos / Modificador Frame:</label>
                <select
                  value={hudTubeType}
                  onChange={(e) => setHudTubeType(e.target.value as any)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1 text-slate-900 dark:text-white"
                >
                  <option value="cylinder">Tubo Cilíndrico Redondo (Ø {hudDiameterMm}mm)</option>
                  <option value="square">Tubo Quadrado Estrutural ({hudDiameterMm}x{hudDiameterMm}mm)</option>
                  <option value="rectangular">Tubo Retangular ({hudDiameterMm}x{(hudDiameterMm * 1.5).toFixed(0)}mm)</option>
                  <option value="l_profile">Perfil L Cantoneira ({hudDiameterMm}mm)</option>
                  <option value="edge_rail">Trilho Guia Aresta (Rail 2020)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Padrão Circular (Circular Pattern):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="2"
                    max="12"
                    value={hudPatternCount}
                    onChange={(e) => setHudPatternCount(Number(e.target.value))}
                    className="w-20 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1 text-slate-900 dark:text-white font-mono text-[11px]"
                  />
                  <button
                    onClick={handleGenerateCircularPattern}
                    className="bg-red-600 hover:bg-red-500 text-white px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 shadow"
                  >
                    <Repeat className="w-3 h-3" />
                    Gerar Copias Radiais
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MESH EDIT SUB-OBJECTS */}
          {activeViewportCadTab === 'mesh_edit' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-300 dark:border-slate-800 pb-2">
                <span className="text-slate-400">Modo de Seleção:</span>
                {(['object', 'vertex', 'edge', 'face'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setSubObjectMode(mode);
                      setToastMessage(`🎯 Modo de Sub-Objeto "${mode.toUpperCase()}" ativado no Canvas 3D`);
                      setTimeout(() => setToastMessage(null), 2000);
                    }}
                    className={`px-2.5 py-1 rounded border uppercase font-bold text-[10px] ${
                      subObjectMode === mode
                        ? 'bg-cyan-600 text-white border-cyan-400'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800'
                    }`}
                  >
                    {mode === 'object' ? 'Objeto Inteiro' : mode === 'vertex' ? 'Vértices (V)' : mode === 'edge' ? 'Arestas (E)' : 'Faces (F)'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Extrusão de Face (mm): <strong className="text-cyan-300">{meshExtrudeMm} mm</strong></label>
                  <div className="flex gap-2">
                    <input
                      type="range"
                      min="1"
                      max="150"
                      value={meshExtrudeMm}
                      onChange={(e) => setMeshExtrudeMm(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                    <button
                      onClick={() => {
                        setToastMessage(`⚡ Face extrudada em +${meshExtrudeMm}mm na normal da superfície`);
                        setTimeout(() => setToastMessage(null), 2500);
                      }}
                      className="bg-cyan-600 hover:bg-cyan-500 text-slate-900 dark:text-white font-bold px-2 py-1 rounded whitespace-nowrap"
                    >
                      Extrudar
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Subdivisão Loop Cut: <strong className="text-cyan-300">Nível {meshSubdivideLevel}</strong></label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setMeshSubdivideLevel(prev => Math.min(4, prev + 1));
                        setToastMessage(`📐 Malha subdividida! Quad-count refinado.`);
                        setTimeout(() => setToastMessage(null), 2500);
                      }}
                      className="bg-cyan-600 hover:bg-cyan-500 text-slate-900 dark:text-white font-bold px-3 py-1 rounded w-full"
                    >
                      Subdividir Malha (+1)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Alinhamento de Vértices:</label>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setToastMessage(`🎯 Vértices alinhados no Eixo X (Plano Sagital)`);
                        setTimeout(() => setToastMessage(null), 2000);
                      }}
                      className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-2 py-1 rounded font-bold text-[10px]"
                    >
                      Alinhar X
                    </button>
                    <button
                      onClick={() => {
                        setToastMessage(`🎯 Vértices alinhados no Eixo Y (Origem Axial)`);
                        setTimeout(() => setToastMessage(null), 2000);
                      }}
                      className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-2 py-1 rounded font-bold text-[10px]"
                    >
                      Alinhar Y
                    </button>
                    <button
                      onClick={() => {
                        setToastMessage(`🎯 Vértices alinhados no Eixo Z`);
                        setTimeout(() => setToastMessage(null), 2000);
                      }}
                      className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-2 py-1 rounded font-bold text-[10px]"
                    >
                      Alinhar Z
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SKETCH */}
          {activeViewportCadTab === 'sketch' && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">Ferramenta:</span>
                {(['line', 'circle', 'arc', 'rectangle'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setHudSketchTool(t)}
                    className={`px-2 py-1 rounded border capitalize ${hudSketchTool === t ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              
              {hudSketchTool === 'line' && (
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-300 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Medida (mm):</span>
                    <input
                      type="number"
                      value={sketchMeasure}
                      onChange={(e) => setSketchMeasure(e.target.value)}
                      placeholder="Ex: 100"
                      className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-2 py-1 rounded w-20 text-[11px] outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Ângulo (°):</span>
                    <input
                      type="number"
                      value={sketchAngle}
                      onChange={(e) => setSketchAngle(e.target.value)}
                      placeholder="Ex: 45"
                      className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-2 py-1 rounded w-20 text-[11px] outline-none focus:border-amber-500"
                    />
                  </div>
                  <button
                    onClick={calcularPontoFinal}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded font-bold text-[11px] flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Desenhar Linha
                  </button>
                  <button
                    onClick={() => {
                      setSketchLines([]);
                      setSketchStartPoint(null);
                      setToastMessage("Esboço limpo!");
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded font-bold text-[11px] flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpar
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-300 dark:border-slate-800">
                <button
                  onClick={() => setHudConstraint(hudConstraint === 'coincident' ? 'parallel' : 'coincident')}
                  className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-amber-300 px-2 py-1 rounded flex items-center gap-1"
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
                  Extrudar para Sólido ({hudExtrudeDepth}mm)
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: PROPULSION THERMODYNAMICS */}
          {activeViewportCadTab === 'propulsion' && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Par Propelente:</label>
                  <select
                    value={propellantPair}
                    onChange={(e) => setPropellantPair(e.target.value as any)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1 text-slate-900 dark:text-white"
                  >
                    <option value="lox_rp1">LOX / RP-1 (3670 K)</option>
                    <option value="lox_ch4">LOX / CH4 Metano (3520 K)</option>
                    <option value="n2o_htPB">N2O / HTPB Híbrido (3150 K)</option>
                    <option value="n2o_paraffin">N2O / Parafina (3280 K)</option>
                    <option value="hno3_kerosene">HNO3 / Kerosene (3100 K)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Pressão Câmara ($P_c$): <strong className="text-orange-400">{chamberPressureBar} bar</strong></label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={chamberPressureBar}
                    onChange={(e) => setChamberPressureBar(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Razão de Expansão ($\epsilon$): <strong className="text-orange-400">{expansionRatio}:1</strong></label>
                  <input
                    type="range"
                    min="4"
                    max="50"
                    step="1"
                    value={expansionRatio}
                    onChange={(e) => setExpansionRatio(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Diâmetro Garganta ($d_t$): <strong className="text-orange-400">{throatDiameterMm} mm</strong></label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={throatDiameterMm}
                    onChange={(e) => setThroatDiameterMm(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded-lg border border-slate-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px]">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">Empuxo Estimado (F): <strong className="text-orange-400 text-xs">{(0.001 * chamberPressureBar * 0.98 * Math.PI * Math.pow(throatDiameterMm/2, 2) * expansionRatio * 0.15).toFixed(2)} kN</strong></span>
                  <span className="text-slate-400">Impulso Específico (Isp): <strong className="text-emerald-400 text-xs">{Math.round(230 + expansionRatio * 1.8 + chamberPressureBar * 0.4)} s</strong></span>
                  <span className="text-slate-400">Velocidade Exaustão (c*): <strong className="text-cyan-400 text-xs">{Math.round(1550 + chamberPressureBar * 4)} m/s</strong></span>
                </div>
                <button
                  onClick={() => {
                    setToastMessage(`🔥 Parâmetros de bocal Laval sincronizados no estúdio 3D!`);
                    setTimeout(() => setToastMessage(null), 2500);
                  }}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-3 py-1 rounded shadow"
                >
                  Sincronizar Bocal no Modelo
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: LIGHTING */}
          {activeViewportCadTab === 'lighting' && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <label className="block text-slate-500 dark:text-slate-400">Key Light: {hudKeyLight}x</label>
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
                className="bg-yellow-600 hover:bg-yellow-500 text-slate-900 dark:text-white font-bold px-3 py-1.5 rounded flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" /> Capturar Foto 4K HQ
              </button>
            </div>
          )}

          {/* TAB 6: EXPORT */}
          {activeViewportCadTab === 'export' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={handleViewportExportPDF}
                className="bg-emerald-700 hover:bg-emerald-600 text-slate-900 dark:text-white font-bold py-1.5 rounded flex items-center justify-center gap-1 text-[11px]"
              >
                <FileText className="w-3.5 h-3.5" /> PDF A3 (ABNT)
              </button>
              <button
                onClick={() => handleViewportExport3D('stl')}
                className="bg-cyan-700 hover:bg-cyan-600 text-slate-900 dark:text-white font-bold py-1.5 rounded flex items-center justify-center gap-1 text-[11px]"
              >
                <Box className="w-3.5 h-3.5" /> .STL (Impressão)
              </button>
              <button
                onClick={() => handleViewportExport3D('obj')}
                className="bg-purple-700 hover:bg-purple-600 text-slate-900 dark:text-white font-bold py-1.5 rounded flex items-center justify-center gap-1 text-[11px]"
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
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border border-slate-300 dark:border-slate-700/80 p-1.5 rounded-2xl shadow-2xl flex items-center gap-1 text-xs font-mono max-w-[95%] overflow-x-auto">
        <button
          onClick={() => setActiveViewportCadTab(activeViewportCadTab === 'measures' ? 'none' : 'measures')}
          className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
            activeViewportCadTab === 'measures'
              ? 'bg-red-600 text-white border border-red-400'
              : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white border border-slate-300 dark:border-slate-800'
          }`}
          title="Abrir Painel de Medidas Exatas e Perfis CAD"
        >
          <Sliders className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden sm:inline">1. Medidas</span>
        </button>

        <button
          onClick={() => setActiveViewportCadTab(activeViewportCadTab === 'mesh_edit' ? 'none' : 'mesh_edit')}
          className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
            activeViewportCadTab === 'mesh_edit'
              ? 'bg-cyan-600 text-white border border-cyan-400'
              : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white border border-slate-300 dark:border-slate-800'
          }`}
          title="Edição de Malha 3D, Vértices, Arestas e Subdivisão"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">2. Malha 3D</span>
        </button>

        <button
          onClick={() => setActiveViewportCadTab(activeViewportCadTab === 'sketch' ? 'none' : 'sketch')}
          className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
            activeViewportCadTab === 'sketch'
              ? 'bg-amber-600 text-white border border-amber-400'
              : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white border border-slate-300 dark:border-slate-800'
          }`}
          title="Abrir Ferramentas de Esboço 2D/3D e Restrições"
        >
          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">3. Esboço</span>
        </button>

        <button
          onClick={() => setActiveViewportCadTab(activeViewportCadTab === 'propulsion' ? 'none' : 'propulsion')}
          className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
            activeViewportCadTab === 'propulsion'
              ? 'bg-orange-600 text-white border border-orange-400'
              : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white border border-slate-300 dark:border-slate-800'
          }`}
          title="Simulação de Termodinâmica de Propulsão e Bocal Laval"
        >
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span className="hidden sm:inline">4. Propulsão</span>
        </button>

        <button
          onClick={() => setActiveViewportCadTab(activeViewportCadTab === 'lighting' ? 'none' : 'lighting')}
          className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
            activeViewportCadTab === 'lighting'
              ? 'bg-yellow-600 text-slate-900 dark:text-white border border-yellow-400'
              : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white border border-slate-300 dark:border-slate-800'
          }`}
          title="Controle de Iluminação de Estúdio e Render HQ"
        >
          <Sun className="w-3.5 h-3.5 text-yellow-400" />
          <span className="hidden sm:inline">5. Iluminação</span>
        </button>

        <button
          onClick={() => setActiveViewportCadTab(activeViewportCadTab === 'export' ? 'none' : 'export')}
          className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
            activeViewportCadTab === 'export'
              ? 'bg-emerald-600 text-white border border-emerald-400'
              : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white border border-slate-300 dark:border-slate-800'
          }`}
          title="Exportar Desenho PDF A3, STL e Usinagem CNC"
        >
          <Printer className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">6. Exportar</span>
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

    // Render Sketch Lines
    sketchLines.forEach(linePoints => {
      const material = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
      const points = [];
      points.push(new THREE.Vector3(linePoints[0][0], linePoints[0][1], linePoints[0][2]));
      points.push(new THREE.Vector3(linePoints[1][0], linePoints[1][1], linePoints[1][2]));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      objectsGroup.add(line);
    });

    if (sketchStartPoint) {
      const geom = new THREE.SphereGeometry(0.2, 16, 16);
      const mat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const sphere = new THREE.Mesh(geom, mat);
      sphere.position.set(sketchStartPoint.x, sketchStartPoint.y, sketchStartPoint.z);
      objectsGroup.add(sphere);
    }

    let activeSelectedGroup: THREE.Object3D | null = null;

    // Build & render all visible objects in models
    models.forEach((m) => {
      if (m.visible === false) return; // Hide object if visible is false

      const customGeo = importedGeometriesRef.current[m.id];
      const meshObj = createMeshForModel(m, customGeo);
      
      // Exploded View logic: push objects away from center along Y axis based on their initial Y pos
      const explodeOffset = m.posY > 0 ? explodedView * m.posY : (m.posY < 0 ? explodedView * m.posY : 0);
      meshObj.position.set(m.posX, m.posY + explodeOffset, m.posZ);

      meshObj.rotation.set(m.rotX, m.rotY, m.rotZ);
      meshObj.scale.set(m.scaleX, m.scaleY, m.scaleZ);
      
      meshObj.userData = { id: m.id };
      meshObj.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh && mesh.material) {
          const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material).clone() as THREE.MeshStandardMaterial;
          mesh.material = mat;
          if (viewMode === 'wireframe') {
            mat.wireframe = true;
          } else if (viewMode === 'xray') {
            mat.transparent = true;
            mat.opacity = 0.3;
            mat.depthWrite = false;
          }
        }

        child.userData = { id: m.id };
        if (mesh.isMesh && m.id === selectedModelId && mesh.material) {
          const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material).clone() as THREE.MeshStandardMaterial;
          mat.emissive = new THREE.Color(0xef4444);
          mat.emissiveIntensity = 0.5;
          mesh.material = mat;
        }
      });
      
      const rootMesh = meshObj as THREE.Mesh;
      if (rootMesh.isMesh && rootMesh.material) {
        const mat = (Array.isArray(rootMesh.material) ? rootMesh.material[0] : rootMesh.material).clone() as THREE.MeshStandardMaterial;
        rootMesh.material = mat;
        if (viewMode === 'wireframe') {
          mat.wireframe = true;
        } else if (viewMode === 'xray') {
          mat.transparent = true;
          mat.opacity = 0.3;
          mat.depthWrite = false;
        }
        if (m.id === selectedModelId) {
          mat.emissive = new THREE.Color(0xef4444);
          mat.emissiveIntensity = 0.5;
        }
      }

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

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event: PointerEvent) => {
      // Se clicou no painel de ferramentas HUD ou em outro botão, ignora
      if ((event.target as HTMLElement).closest('button')) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Se estiver no modo Sketch, a gente intercepta o clique no Grid 3D
      if (activeViewportCadTab === 'sketch') {
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 2);
        const target = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, target);
        if (target) {
          if (hudSketchTool === 'line') {
            if (!sketchStartPoint) {
              setSketchStartPoint({ x: target.x, y: target.y, z: target.z });
              setToastMessage(`Ponto Inicial: (${target.x.toFixed(1)}, ${target.z.toFixed(1)}). Clique no próximo ponto.`);
            } else {
              const novaLinha = [
                [sketchStartPoint.x, sketchStartPoint.y, sketchStartPoint.z],
                [target.x, target.y, target.z]
              ];
              setSketchLines(prev => [...prev, novaLinha]);
              setSketchStartPoint({ x: target.x, y: target.y, z: target.z });
              const dx = target.x - sketchStartPoint.x;
              const dz = target.z - sketchStartPoint.z;
              setSketchMeasure((Math.sqrt(dx*dx + dz*dz) * 20).toFixed(0));
              setToastMessage(`Linha desenhada! Ponto: (${target.x.toFixed(1)}, ${target.z.toFixed(1)})`);
            }
          } else if (hudSketchTool === 'circle') {
            desenharCirculo(target.x, target.z);
          } else if (hudSketchTool === 'rectangle') {
            desenharRetangulo(target.x, target.z);
          } else if (hudSketchTool === 'arc') {
            desenharArco(target.x, target.z);
          }
          setTimeout(() => setToastMessage(null), 2500);
        }
        return;
      }

      // Ignora se estiver arrastando o TransformControls
      if (isDraggingRef.current) return;
      
      const intersects = raycaster.intersectObjects(objectsGroup.children, true);
      
      if (intersects.length > 0) {
        // Encontra o objeto com ID mais próximo
        const hit = intersects.find(i => i.object.userData?.id);
        if (hit && hit.object.userData?.id) {
          setSelectedModelId(hit.object.userData.id);
        }
      } else {
        // Clicou no fundo
        setSelectedModelId(null);
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      orbitControls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      cancelAnimationFrame(animId);
      transformControl.detach();
      transformControl.dispose();
      orbitControls.dispose();
      renderer.dispose();
    };
  }, [models, selectedModelId, isExpanded, activeGizmoTool, pushHistory, sketchLines, sketchStartPoint, activeViewportCadTab, hudSketchTool, hudKeyLight, hudFillLight, hudAmbientLight, explodedView, viewMode]);

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
          <CheckCircle2 className="w-4 h-4 text-slate-900 dark:text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-800 rounded-lg p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-500 font-mono text-[10px] uppercase tracking-wider mb-1">
            <Box className="w-3.5 h-3.5" />
            Engenharia CAD 3D & Modelagem em Tempo Real
          </div>
          <h2 className="text-xl font-bold font-italic-title text-slate-900 dark:text-slate-900 dark:text-white tracking-tight">
            Estúdio Interativo de Objetos 3D & Importador CAD (.STL, .OBJ, .FBX)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Adicione <strong className="text-red-400">formas geométricas básicas</strong> e <strong className="text-red-400">componentes de foguete</strong> (aleta, nariz, motor, tubo de corpo). Gerencie visibilidade (👁️), bloqueio (🔒) e exclusão por botão ou atalho (<strong className="text-slate-900 dark:text-white">Delete / Backspace</strong>). Importe arquivos <strong className="text-slate-900 dark:text-white">.STL, .OBJ e .FBX</strong> instantaneamente.
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

          {onStartWalkthrough && (
            <button
              onClick={onStartWalkthrough}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-lg shadow-amber-600/20 font-mono"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>💡 Tour Guiado 3D</span>
            </button>
          )}

          {currentUser ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-3.5 py-2 rounded-lg text-xs font-bold transition font-mono"
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
      <div className="bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-800 rounded-lg p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-300 dark:border-slate-800 pb-2">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-red-500" />
            Inserção Rápida de Formas Geométricas & Componentes de Foguete
          </h3>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Clique para adicionar diretamente na cena 3D</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Geometric Primitives */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-blue-400" />
              Formas Geométricas Básicas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleAddPrimitive('cube')}
                className="bg-slate-100 dark:bg-slate-900 hover:bg-blue-600/30 border border-slate-300 dark:border-slate-700 hover:border-blue-500 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:text-white px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
                title="Inserir Cubo 3D"
              >
                <Box className="w-3.5 h-3.5 text-blue-400" />
                Cubo
              </button>
              <button
                onClick={() => handleAddPrimitive('arc')}
                className="bg-slate-100 dark:bg-slate-900 hover:bg-purple-600/30 border border-slate-300 dark:border-slate-700 hover:border-purple-500 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:text-white px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
                title="Inserir Arco / Toro 3D"
              >
                <Disc className="w-3.5 h-3.5 text-purple-400" />
                Arco / Toro
              </button>
              <button
                onClick={() => handleAddPrimitive('cone')}
                className="bg-slate-100 dark:bg-slate-900 hover:bg-amber-600/30 border border-slate-300 dark:border-slate-700 hover:border-amber-500 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:text-white px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
                title="Inserir Cone Geométrico"
              >
                <Triangle className="w-3.5 h-3.5 text-amber-400 rotate-180" />
                Cone
              </button>
              <button
                onClick={() => handleAddPrimitive('pyramid')}
                className="bg-slate-100 dark:bg-slate-900 hover:bg-emerald-600/30 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:text-white px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
                title="Inserir Pirâmide 3D"
              >
                <Triangle className="w-3.5 h-3.5 text-emerald-400" />
                Pirâmide
              </button>
              <button
                onClick={() => handleAddPrimitive('cylinder')}
                className="bg-slate-100 dark:bg-slate-900 hover:bg-red-600/30 border border-slate-300 dark:border-slate-700 hover:border-red-500 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:text-white px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
                title="Inserir Cilindro Base"
              >
                <Cylinder className="w-3.5 h-3.5 text-red-400" />
                Cilindro
              </button>
              <button
                onClick={() => handleAddPrimitive('sphere')}
                className="bg-slate-100 dark:bg-slate-900 hover:bg-pink-600/30 border border-slate-300 dark:border-slate-700 hover:border-pink-500 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:text-white px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
                title="Inserir Esfera Geométrica"
              >
                <Circle className="w-3.5 h-3.5 text-pink-400" />
                Esfera
              </button>
            </div>
          </div>

          {/* Rocket Specific Components */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-red-500" />
              Componentes de Foguete:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleAddRocketShape('fin')}
                className="bg-slate-100 dark:bg-slate-900 hover:bg-red-600/30 border border-slate-300 dark:border-slate-700 hover:border-red-500 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:text-white px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
                title="Inserir Aleta Aerodinâmica"
              >
                <Wind className="w-3.5 h-3.5 text-red-400" />
                Aleta
              </button>
              <button
                onClick={() => handleAddRocketShape('nosecone')}
                className="bg-slate-100 dark:bg-slate-900 hover:bg-red-600/30 border border-slate-300 dark:border-slate-700 hover:border-red-500 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:text-white px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
                title="Inserir Coifa / Nariz Ogival"
              >
                <Triangle className="w-3.5 h-3.5 text-red-500" />
                Nariz / Coifa
              </button>
              <button
                onClick={() => handleAddRocketShape('engine')}
                className="bg-slate-100 dark:bg-slate-900 hover:bg-orange-600/30 border border-slate-300 dark:border-slate-700 hover:border-orange-500 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:text-white px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
                title="Inserir Motor & Bocal de Empuxo"
              >
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                Motor / Bocal
              </button>
              <button
                onClick={() => handleAddRocketShape('body_tube')}
                className="bg-slate-100 dark:bg-slate-900 hover:bg-cyan-600/30 border border-slate-300 dark:border-slate-700 hover:border-cyan-500 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:text-white px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
                title="Inserir Tubo de Corpo / Fuselagem"
              >
                <Cylinder className="w-3.5 h-3.5 text-cyan-400" />
                Corpo / Tubo
              </button>
              <button
                onClick={() => handleAddRocketShape('centering_ring')}
                className="bg-slate-100 dark:bg-slate-900 hover:bg-slate-600/30 border border-slate-300 dark:border-slate-700 hover:border-slate-500 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:text-white px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
                title="Inserir Anel Centrador"
              >
                <Disc className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                Anel Centrador
              </button>
              <button
                onClick={() => handleAddRocketShape('payload')}
                className="bg-slate-100 dark:bg-slate-900 hover:bg-purple-600/30 border border-slate-300 dark:border-slate-700 hover:border-purple-500 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:text-white px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
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
          <div className="bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-800 rounded-lg p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-300 dark:border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-red-500" />
                Objetos na Cena ({models.length})
              </h3>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                Atalho p/ Deletar: <strong className="text-slate-900 dark:text-white">Delete / Backspace</strong>
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
                        ? 'bg-red-600/20 border-red-500 text-slate-900 dark:text-white font-bold shadow-md'
                        : 'bg-slate-50 dark:bg-[#05070A] border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:border-slate-700'
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
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Autor: {m.author}</div>
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
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white'
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
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white'
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
                        className="p-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-red-600/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white rounded transition"
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
          <div className="bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-800 rounded-lg p-4 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-300 dark:border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 font-mono uppercase">
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
                  className="p-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-800 dark:text-slate-200 rounded text-xs transition"
                  title="Desfazer (Ctrl+Z)"
                >
                  <Undo className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={redoStack.length === 0 || currentModel?.locked}
                  className="p-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-800 dark:text-slate-200 rounded text-xs transition"
                  title="Refazer (Ctrl+Y)"
                >
                  <Redo className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetTransform}
                  disabled={currentModel?.locked}
                  className="p-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-800 dark:text-slate-200 rounded text-xs transition"
                  title="Resetar Posição (Esc)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mover Sliders */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between font-mono">
                <span className="flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-red-500" />
                  Mover Posição (X, Y, Z)
                </span>
                <span className="text-[10px] text-slate-500">Atalho: [G / M]</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">X: {currentModel.posX.toFixed(1)}</span>
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    step="0.1"
                    disabled={currentModel?.locked}
                    value={currentModel.posX}
                    onChange={(e) => handleTransformChange('posX', parseFloat(e.target.value))}
                    className="w-full accent-red-500 h-1 bg-slate-200 dark:bg-slate-800 rounded disabled:opacity-30"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Y: {currentModel.posY.toFixed(1)}</span>
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    step="0.1"
                    disabled={currentModel?.locked}
                    value={currentModel.posY}
                    onChange={(e) => handleTransformChange('posY', parseFloat(e.target.value))}
                    className="w-full accent-red-500 h-1 bg-slate-200 dark:bg-slate-800 rounded disabled:opacity-30"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Z: {currentModel.posZ.toFixed(1)}</span>
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    step="0.1"
                    disabled={currentModel?.locked}
                    value={currentModel.posZ}
                    onChange={(e) => handleTransformChange('posZ', parseFloat(e.target.value))}
                    className="w-full accent-red-500 h-1 bg-slate-200 dark:bg-slate-800 rounded disabled:opacity-30"
                  />
                </div>
              </div>
            </div>

            {/* Rotacionar Sliders */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between font-mono">
                <span className="flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-red-500" />
                  Rotacionar Ângulo (X, Y, Z)
                </span>
                <span className="text-[10px] text-slate-500">Atalho: [R]</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Rot X: {currentModel.rotX.toFixed(2)}</span>
                  <input
                    type="range"
                    min="-3.14"
                    max="3.14"
                    step="0.05"
                    disabled={currentModel?.locked}
                    value={currentModel.rotX}
                    onChange={(e) => handleTransformChange('rotX', parseFloat(e.target.value))}
                    className="w-full accent-red-500 h-1 bg-slate-200 dark:bg-slate-800 rounded disabled:opacity-30"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Rot Y: {currentModel.rotY.toFixed(2)}</span>
                  <input
                    type="range"
                    min="-3.14"
                    max="3.14"
                    step="0.05"
                    disabled={currentModel?.locked}
                    value={currentModel.rotY}
                    onChange={(e) => handleTransformChange('rotY', parseFloat(e.target.value))}
                    className="w-full accent-red-500 h-1 bg-slate-200 dark:bg-slate-800 rounded disabled:opacity-30"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Rot Z: {currentModel.rotZ.toFixed(2)}</span>
                  <input
                    type="range"
                    min="-3.14"
                    max="3.14"
                    step="0.05"
                    disabled={currentModel?.locked}
                    value={currentModel.rotZ}
                    onChange={(e) => handleTransformChange('rotZ', parseFloat(e.target.value))}
                    className="w-full accent-red-500 h-1 bg-slate-200 dark:bg-slate-800 rounded disabled:opacity-30"
                  />
                </div>
              </div>
            </div>

            {/* Escalar Sliders */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between font-mono">
                <span className="flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-red-500" />
                  Escalar Dimensão (X, Y, Z)
                </span>
                <span className="text-[10px] text-slate-500">Atalho: [S]</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Esc X: {currentModel.scaleX.toFixed(1)}x</span>
                  <input
                    type="range"
                    min="0.2"
                    max="4.0"
                    step="0.1"
                    disabled={currentModel?.locked}
                    value={currentModel.scaleX}
                    onChange={(e) => handleTransformChange('scaleX', parseFloat(e.target.value))}
                    className="w-full accent-red-500 h-1 bg-slate-200 dark:bg-slate-800 rounded disabled:opacity-30"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Esc Y: {currentModel.scaleY.toFixed(1)}x</span>
                  <input
                    type="range"
                    min="0.2"
                    max="4.0"
                    step="0.1"
                    disabled={currentModel?.locked}
                    value={currentModel.scaleY}
                    onChange={(e) => handleTransformChange('scaleY', parseFloat(e.target.value))}
                    className="w-full accent-red-500 h-1 bg-slate-200 dark:bg-slate-800 rounded disabled:opacity-30"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Esc Z: {currentModel.scaleZ.toFixed(1)}x</span>
                  <input
                    type="range"
                    min="0.2"
                    max="4.0"
                    step="0.1"
                    disabled={currentModel?.locked}
                    value={currentModel.scaleZ}
                    onChange={(e) => handleTransformChange('scaleZ', parseFloat(e.target.value))}
                    className="w-full accent-red-500 h-1 bg-slate-200 dark:bg-slate-800 rounded disabled:opacity-30"
                  />
                </div>
              </div>
            </div>

            {/* Keyboard Shortcuts Reference Box */}
            <div className="p-3 bg-slate-50 dark:bg-[#05070A] rounded-lg border border-slate-300 dark:border-slate-800 space-y-1.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">
              <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Keyboard className="w-3.5 h-3.5 text-red-400" />
                Guia de Teclas de Atalho:
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-500 dark:text-slate-400">
                <span>• <strong className="text-slate-900 dark:text-white">G / M</strong>: Modo Mover</span>
                <span>• <strong className="text-slate-900 dark:text-white">R</strong>: Modo Rotacionar</span>
                <span>• <strong className="text-slate-900 dark:text-white">S</strong>: Modo Escalar</span>
                <span>• <strong className="text-slate-900 dark:text-white">Del / Backspace</strong>: Deletar</span>
                <span>• <strong className="text-slate-900 dark:text-white">Ctrl+Z</strong>: Desfazer</span>
                <span>• <strong className="text-slate-900 dark:text-white">Ctrl+Y</strong>: Refazer</span>
                <span>• <strong className="text-slate-900 dark:text-white">Esc</strong>: Resetar Origem</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right 3D Viewport with On-Screen Toolbar (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
            
            {/* Viewport Header Toolbar */}
            <div className="p-3 bg-white/90 dark:bg-slate-950/90 border-b border-slate-300 dark:border-slate-800 flex justify-between items-center text-xs font-mono">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
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
                    activeGizmoTool === 'move' ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white'
                  }`}
                  title="Mover (M)"
                >
                  <Move className="w-3 h-3" />
                  Mover
                </button>
                <button
                  onClick={() => setActiveGizmoTool('rotate')}
                  className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition ${
                    activeGizmoTool === 'rotate' ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white'
                  }`}
                  title="Rotacionar (R)"
                >
                  <RotateCw className="w-3 h-3" />
                  Rotacionar
                </button>
                <button
                  onClick={() => setActiveGizmoTool('scale')}
                  className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition ${
                    activeGizmoTool === 'scale' ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white'
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
            <div className="relative w-full h-[480px] bg-slate-100 dark:bg-slate-950 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-800">
              
              {/* View Cube Buttons Overlay */}
              <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                <div className="text-[9px] font-mono text-slate-600 dark:text-slate-500 dark:text-slate-400 text-center uppercase tracking-widest mb-1 font-bold bg-white/80 dark:bg-transparent rounded px-1">Vistas CAD</div>
                <button onClick={() => handleSetView('top')} className="bg-white/90 dark:bg-white/80 dark:bg-slate-900/80 hover:bg-red-600 dark:hover:bg-red-600/90 text-slate-800 dark:text-slate-900 dark:text-white hover:text-slate-900 dark:text-white p-1.5 rounded border border-slate-300 dark:border-slate-300 dark:border-slate-700 hover:border-red-500 transition shadow-lg text-[10px] font-mono flex items-center justify-between gap-2 group">
                  <span className="group-hover:translate-x-0.5 transition-transform">Topo</span><Box className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </button>
                <button onClick={() => handleSetView('front')} className="bg-white/90 dark:bg-white/80 dark:bg-slate-900/80 hover:bg-red-600 dark:hover:bg-red-600/90 text-slate-800 dark:text-slate-900 dark:text-white hover:text-slate-900 dark:text-white p-1.5 rounded border border-slate-300 dark:border-slate-300 dark:border-slate-700 hover:border-red-500 transition shadow-lg text-[10px] font-mono flex items-center justify-between gap-2 group">
                  <span className="group-hover:translate-x-0.5 transition-transform">Frente</span><Box className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </button>
                <button onClick={() => handleSetView('side')} className="bg-white/90 dark:bg-white/80 dark:bg-slate-900/80 hover:bg-red-600 dark:hover:bg-red-600/90 text-slate-800 dark:text-slate-900 dark:text-white hover:text-slate-900 dark:text-white p-1.5 rounded border border-slate-300 dark:border-slate-300 dark:border-slate-700 hover:border-red-500 transition shadow-lg text-[10px] font-mono flex items-center justify-between gap-2 group">
                  <span className="group-hover:translate-x-0.5 transition-transform">Lado</span><Box className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </button>
                <button onClick={() => handleSetView('iso')} className="bg-white/90 dark:bg-white/80 dark:bg-slate-900/80 hover:bg-red-600 dark:hover:bg-red-600/90 text-slate-800 dark:text-slate-900 dark:text-white hover:text-slate-900 dark:text-white p-1.5 rounded border border-slate-300 dark:border-slate-300 dark:border-slate-700 hover:border-red-500 transition shadow-lg text-[10px] font-mono flex items-center justify-between gap-2 group">
                  <span className="group-hover:translate-x-0.5 transition-transform">Iso</span><Box className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </button>
              </div>

              {/* Transform Tool Shortcuts Overlay */}
              <div className="absolute top-2 left-2 flex gap-1 z-10">
                <button 
                  onClick={() => setActiveGizmoTool('move')} 
                  className={`p-2 rounded border transition shadow-lg ${activeGizmoTool === 'move' ? 'bg-red-600 border-red-400 text-slate-900 dark:text-white' : 'bg-white/90 dark:bg-white/80 dark:bg-slate-900/80 border-slate-300 dark:border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-slate-900 dark:text-white'}`}
                  title="Mover [G / M]"
                >
                  <Move className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveGizmoTool('rotate')} 
                  className={`p-2 rounded border transition shadow-lg ${activeGizmoTool === 'rotate' ? 'bg-red-600 border-red-400 text-slate-900 dark:text-white' : 'bg-white/90 dark:bg-white/80 dark:bg-slate-900/80 border-slate-300 dark:border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-slate-900 dark:text-white'}`}
                  title="Rotacionar [R]"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveGizmoTool('scale')} 
                  className={`p-2 rounded border transition shadow-lg ${activeGizmoTool === 'scale' ? 'bg-red-600 border-red-400 text-slate-900 dark:text-white' : 'bg-white/90 dark:bg-white/80 dark:bg-slate-900/80 border-slate-300 dark:border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-slate-900 dark:text-white'}`}
                  title="Escalar [S]"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
              {renderInViewportCadHud()}
            </div>

            {/* Footer Details */}
            <div className="p-3.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-300 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Descrição: <span className="text-slate-700 dark:text-slate-300 font-normal">{currentModel.description}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                  Autor da Contribuição: <strong className="text-red-400">{currentModel.author}</strong>
                </div>
              </div>

              <a
                href="https://cad.mnanimat.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-950/80 px-3 py-1.5 rounded-lg border border-red-500/30 whitespace-nowrap font-mono"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Abrir CADMNAnimat
              </a>
            </div>

          </div>
        </div>

      </div>

      {/* FULLSCREEN EXPANDED 3D VIEWPORT MODAL */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md flex flex-col p-4">
          <div className="flex items-center justify-between border-b border-slate-300 dark:border-slate-800 pb-3 font-mono">
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
                className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center gap-1"
              >
                <Undo className="w-3.5 h-3.5" />
                Desfazer
              </button>
              <button
                onClick={handleRedo}
                className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center gap-1"
              >
                <Redo className="w-3.5 h-3.5" />
                Refazer
              </button>
              <button
                onClick={handleResetTransform}
                className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center gap-1"
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
          <div className="flex-1 relative w-full my-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-300 dark:border-slate-800 overflow-hidden">
            {/* View Cube Buttons Overlay */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <div className="text-xs font-mono text-slate-600 dark:text-slate-500 dark:text-slate-400 text-center uppercase tracking-widest mb-1 font-bold bg-white/80 dark:bg-transparent rounded px-2 py-0.5">Vistas CAD</div>
              <button onClick={() => handleSetView('top')} className="bg-white/90 dark:bg-white/80 dark:bg-slate-900/80 hover:bg-red-600 dark:hover:bg-red-600/90 text-slate-800 dark:text-slate-900 dark:text-white hover:text-slate-900 dark:text-white px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-300 dark:border-slate-700 hover:border-red-500 transition shadow-lg text-xs font-mono flex items-center justify-between gap-3 group">
                <span className="group-hover:translate-x-1 transition-transform">Topo</span><Box className="w-4 h-4 opacity-50 group-hover:opacity-100" />
              </button>
              <button onClick={() => handleSetView('front')} className="bg-white/90 dark:bg-white/80 dark:bg-slate-900/80 hover:bg-red-600 dark:hover:bg-red-600/90 text-slate-800 dark:text-slate-900 dark:text-white hover:text-slate-900 dark:text-white px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-300 dark:border-slate-700 hover:border-red-500 transition shadow-lg text-xs font-mono flex items-center justify-between gap-3 group">
                <span className="group-hover:translate-x-1 transition-transform">Frente</span><Box className="w-4 h-4 opacity-50 group-hover:opacity-100" />
              </button>
              <button onClick={() => handleSetView('side')} className="bg-white/90 dark:bg-white/80 dark:bg-slate-900/80 hover:bg-red-600 dark:hover:bg-red-600/90 text-slate-800 dark:text-slate-900 dark:text-white hover:text-slate-900 dark:text-white px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-300 dark:border-slate-700 hover:border-red-500 transition shadow-lg text-xs font-mono flex items-center justify-between gap-3 group">
                <span className="group-hover:translate-x-1 transition-transform">Lado</span><Box className="w-4 h-4 opacity-50 group-hover:opacity-100" />
              </button>
              <button onClick={() => handleSetView('iso')} className="bg-white/90 dark:bg-white/80 dark:bg-slate-900/80 hover:bg-red-600 dark:hover:bg-red-600/90 text-slate-800 dark:text-slate-900 dark:text-white hover:text-slate-900 dark:text-white px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-300 dark:border-slate-700 hover:border-red-500 transition shadow-lg text-xs font-mono flex items-center justify-between gap-3 group">
                <span className="group-hover:translate-x-1 transition-transform">Iso</span><Box className="w-4 h-4 opacity-50 group-hover:opacity-100" />
              </button>
            </div>

            {/* Transform Tool Shortcuts Overlay */}
            <div className="absolute top-4 left-4 flex gap-2 z-10">
              <button 
                onClick={() => setActiveGizmoTool('move')} 
                className={`p-3 rounded-lg border transition shadow-lg ${activeGizmoTool === 'move' ? 'bg-red-600 border-red-400 text-slate-900 dark:text-white' : 'bg-white/90 dark:bg-white/80 dark:bg-slate-900/80 border-slate-300 dark:border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-slate-900 dark:text-white'}`}
                title="Mover [G / M]"
              >
                <Move className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setActiveGizmoTool('rotate')} 
                className={`p-3 rounded-lg border transition shadow-lg ${activeGizmoTool === 'rotate' ? 'bg-red-600 border-red-400 text-slate-900 dark:text-white' : 'bg-white/90 dark:bg-white/80 dark:bg-slate-900/80 border-slate-300 dark:border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-slate-900 dark:text-white'}`}
                title="Rotacionar [R]"
              >
                <RotateCw className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setActiveGizmoTool('scale')} 
                className={`p-3 rounded-lg border transition shadow-lg ${activeGizmoTool === 'scale' ? 'bg-red-600 border-red-400 text-slate-900 dark:text-white' : 'bg-white/90 dark:bg-white/80 dark:bg-slate-900/80 border-slate-300 dark:border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-slate-900 dark:text-white'}`}
                title="Escalar [S]"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>

            <div ref={expandedMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
            {renderInViewportCadHud()}
          </div>

          {/* Expanded Bottom Controls */}
          <div className="bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-4">
              <span>Posição (X,Y,Z): <strong>{currentModel.posX.toFixed(1)}, {currentModel.posY.toFixed(1)}, {currentModel.posZ.toFixed(1)}</strong></span>
              <span>Rotação: <strong>{currentModel.rotX.toFixed(2)}, {currentModel.rotY.toFixed(2)}, {currentModel.rotZ.toFixed(2)}</strong></span>
              <span>Escala: <strong>{currentModel.scaleX.toFixed(1)}x</strong></span>
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-[11px]">
              Utilize o mouse para rotacionar. Pressione <strong className="text-slate-900 dark:text-white">G (Mover)</strong>, <strong className="text-slate-900 dark:text-white">R (Rotacionar)</strong>, <strong className="text-slate-900 dark:text-white">S (Escalar)</strong>, <strong className="text-slate-900 dark:text-white">Del / Backspace (Deletar)</strong>.
            </div>
          </div>
        </div>
      )}

      {/* Modal - Add New Procedural 3D Model */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black border border-slate-300 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-slate-100 font-sans">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-mono">
              <Box className="w-5 h-5 text-red-500" />
              Cadastrar Modelo Procedural 3D
            </h3>

            <form onSubmit={handleAddModel} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Título do Modelo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Foguete Amador Classe H - Veloce"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#05070A] border border-slate-300 dark:border-slate-800 rounded-lg p-2.5 text-slate-900 dark:text-white outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Categoria de Peça</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as User3DModel['type'])}
                    className="w-full bg-slate-50 dark:bg-[#05070A] border border-slate-300 dark:border-slate-800 rounded-lg p-2.5 text-slate-900 dark:text-white outline-none font-mono"
                  >
                    <option value="foguete_completo">Foguete Completo</option>
                    <option value="coifa">Coifa (Nosecone)</option>
                    <option value="aletagem">Aletagem (Fins)</option>
                    <option value="motor">Motor de Propulsão</option>
                    <option value="payload">Carga Útil / Cansat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Geometria Mesh Base</label>
                  <select
                    value={newMeshType}
                    onChange={(e) => setNewMeshType(e.target.value as User3DModel['meshType'])}
                    className="w-full bg-slate-50 dark:bg-[#05070A] border border-slate-300 dark:border-slate-800 rounded-lg p-2.5 text-slate-900 dark:text-white outline-none font-mono"
                  >
                    <option value="cylinder_rocket">Cilíndrico Monostágio</option>
                    <option value="multistage">Multiestágio Avançado</option>
                    <option value="heavy_lift">Heavy-Lift Booster</option>
                    <option value="experimental_mini">Minifoguete Experimental</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Cor do Modelo</label>
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-full h-9 bg-slate-50 dark:bg-[#05070A] border border-slate-300 dark:border-slate-800 rounded-lg cursor-pointer p-1"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Descrição Técnica</label>
                <textarea
                  rows={2}
                  placeholder="Especifique massa, dimensão do tubo e impulso total..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#05070A] border border-slate-300 dark:border-slate-800 rounded-lg p-2.5 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Link Externo (Google Drive / CAD)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#05070A] border border-slate-300 dark:border-slate-800 rounded-lg p-2.5 text-slate-900 dark:text-white outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-300 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 font-mono"
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
