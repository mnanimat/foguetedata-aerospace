import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  Play,
  Pause,
  Eye,
  RotateCcw,
  Sparkles,
  Maximize2,
  Upload,
  Download,
  Settings2,
  FileCode,
  Layers,
  Info,
  Sliders,
  ChevronRight,
  Cpu,
  Compass,
  Box,
  Flame,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { ParachuteConfig, RocketParams } from '../types';

interface Rocket3DViewerProps {
  selectedSubsystem?: string;
  onSelectSubsystem?: (subsystemId: string) => void;
  autoDeployParachute?: boolean;
  parachuteConfig?: ParachuteConfig;
  onUpdateParachuteConfig?: (config: ParachuteConfig) => void;
  rocketParams?: RocketParams;
}

// Subsystem Anatomy Definition
export interface RocketAnatomyPart {
  id: string;
  name: string;
  shortLabel: string;
  category: string;
  material: string;
  massStr: string;
  dimensionsStr: string;
  functionDesc: string;
  barAebGuide: string;
  colorHex: string;
}

const ROCKET_ANATOMY_PARTS: RocketAnatomyPart[] = [
  {
    id: 'nose',
    name: 'Coifa & Nariz Parabólico (Parabolic Nose Cone)',
    shortLabel: 'Coifa Parabólica',
    category: 'Aerodinâmica',
    material: 'Fibra de Vidro usinada com ponta de Alumínio 6061-T6 Anodizado',
    massStr: '0.35 kg (350g)',
    dimensionsStr: 'Ø 80 mm | Comprimento 240 mm (Série Parabólica)',
    functionDesc: 'Perfil de curvatura parabólica contínua r(y) = R·(1 - (y/L)²) que minimiza a resistência aerodinâmica e o arrasto em voo supersônico/subsônico.',
    barAebGuide: 'Verificar alinhamento e ajuste por pressão (fit) suficiente para evitar abertura prematura sem travar na carga de espoleta de expulsão.',
    colorHex: '#ff4500'
  },
  {
    id: 'payload',
    name: 'Compartimento de Carga Útil & CubeSat (Payload Bay)',
    shortLabel: 'Carga Útil / CubeSat',
    category: 'Científica',
    material: 'Liga de Alumínio 7075-T6 e janelas de policarbonato óptico',
    massStr: '0.80 kg - 4.0 kg',
    dimensionsStr: 'Ø Interno 78 mm | Comprimento 300 mm (Compatível CubeSat 1U/3U)',
    functionDesc: 'Abriga o nanosatélite, módulo de microgravidade, câmera RGB de bordo e sensores de radiação/CO2 para coleta de dados durante o apogeu.',
    barAebGuide: 'Garantir travamento com amortecedores de impacto e isolamento elétrico/térmico de 15G contra vibrações de decolagem.',
    colorHex: '#00d8ff'
  },
  {
    id: 'recovery',
    name: 'Sistema de Recuperação & Paraquedas (Parachute System)',
    shortLabel: 'Paraquedas & Chute Bay',
    category: 'Segurança',
    material: 'Velame Nylon Ripstop 1.1 oz (Laranja/Branco), Cabos de Kevlar 300 lbs',
    massStr: '0.25 kg (250g)',
    dimensionsStr: 'Diâmetro Aberto Ø 120 cm | Cd: 1.50 (16 Linhas)',
    functionDesc: 'Desdobrado no apogeu para reduzir a velocidade de queda terminal para 5 - 7 m/s, garantindo pouso suave sem danos aos aviônicos.',
    barAebGuide: 'Uso obrigatório de Manta Protetora Nomex resistente a chamas para evitar queimaduras do velame durante a deflagração da espoleta.',
    colorHex: '#ff8800'
  },
  {
    id: 'avionics',
    name: 'Computador de Bordo & Aviônica (Flight Computer Bay)',
    shortLabel: 'Computador de Bordo',
    category: 'Eletrônica',
    material: 'Placa FR4 de 4 camadas em invólucro PETG de alta resistência térmica',
    massStr: '0.18 kg (180g)',
    dimensionsStr: '70 x 50 x 120 mm (Processador duplo ESP32 + STM32)',
    functionDesc: 'Módulo central de telemetria com altímetro BMP280, acelerômetro/giroscópio MPU6050, rádio LoRa 915MHz e acionador de espoletas.',
    barAebGuide: 'Executar teste obrigatório de continuidade do circuito de ignição do paraquedas e verificação da bateria LiPo de alimentação isolada.',
    colorHex: '#a855f7'
  },
  {
    id: 'body',
    name: 'Tubo Estrutural Principal & Fuselagem (Airframe Body Tube)',
    shortLabel: 'Fuselagem / Tubo',
    category: 'Estrutural',
    material: 'Composto de Fibra de Carbono Epoxy com acabamento de Alta Visibilidade',
    massStr: '0.65 kg (650g)',
    dimensionsStr: 'Ø Externo 80 mm | Parede 1.8 mm | Comprimento 520 mm',
    functionDesc: 'Suporta a rigidez mecânica axial e os momentos fletor/aerodinâmico durante o empuxo do motor e manobras sob vento empuxado.',
    barAebGuide: 'Inspecionar ausência de delaminações ou fissuras na resina epoxy antes de cada abastecimento e acoplamento de rampa.',
    colorHex: '#f8fafc'
  },
  {
    id: 'motor',
    name: 'Motor Foguete & Grão Propulsor (Solid Rocket Motor & Grain)',
    shortLabel: 'Motor Propulsor Sólido',
    category: 'Propulsão',
    material: 'Carcaça de Aço Sem Costura 1020 / Alumínio, Bocal de Grafite Isostático',
    massStr: '1.30 kg (Propulsor: 850g KNSB/APCP)',
    dimensionsStr: 'Ø 54 mm | Empuxo Máx: 450 N | Impulso Total: 220 N.s',
    functionDesc: 'Gera a força de propulsão por combustão controlada do grão sólido e expansão supersônica de gases pela Tobera De Laval.',
    barAebGuide: 'Ignição obrigatoriamente remota via mesa de acionamento elétrico a pelo menos 50 metros de distância com chave física de travamento.',
    colorHex: '#f59e0b'
  },
  {
    id: 'fins',
    name: 'Conjunto de Aletas Trapezoidais (Fin Can & Stabilization Fins)',
    shortLabel: 'Aletas Estabilizadoras',
    category: 'Estabilidade',
    material: 'Alumínio Aeroespacial 6061-T6 usinado em CNC com bordo chanfrado',
    massStr: '0.22 kg (4 aletas)',
    dimensionsStr: 'Envergadura 130 mm | Raiz 200 mm | Espessura 3.0 mm',
    functionDesc: '4 aletas ortogonais que fornecem o centro de pressão (CP) necessário para estabilidade estática e margem estática de 1.5 a 2.0 calibres.',
    barAebGuide: 'Verificar alinhamento angular rigoroso a 90° entre aletas para evitar momento induzido de ropagem/spin não planejado.',
    colorHex: '#38bdf8'
  }
];

// Helper to map subsystem IDs to Lucide icons
const getPartIcon = (id: string, className = "w-4 h-4") => {
  switch (id) {
    case 'nose': return <Compass className={className} />;
    case 'payload': return <Box className={className} />;
    case 'recovery': return <ShieldCheck className={className} />;
    case 'avionics': return <Cpu className={className} />;
    case 'body': return <Layers className={className} />;
    case 'motor': return <Flame className={className} />;
    case 'fins': return <Zap className={className} />;
    default: return <Activity className={className} />;
  }
};

export const Rocket3DViewer: React.FC<Rocket3DViewerProps> = ({
  selectedSubsystem,
  onSelectSubsystem,
  autoDeployParachute,
  parachuteConfig,
  onUpdateParachuteConfig,
  rocketParams
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const [wireframe, setWireframe] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [showParachute, setShowParachute] = useState(autoDeployParachute ?? true);
  const [parachuteNotice, setParachuteNotice] = useState<string | null>(null);
  const [importedModelName, setImportedModelName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Anatomical Inspection & Exploded View States
  const [isAnatomyMode, setIsAnatomyMode] = useState(false);
  const [explodedAmount, setExplodedAmount] = useState(0.0); // 0.0 to 1.0
  const [activeAnatomyId, setActiveAnatomyId] = useState<string>('nose');

  // Parachute configuration state
  const [currentChuteConfig, setCurrentChuteConfig] = useState<ParachuteConfig>(
    parachuteConfig || {
      mainDiameter: 0.85,
      mainCd: 1.5,
      mainDeployAlt: 200,
      drogueDiameter: 0.3,
      drogueCd: 1.2,
      shroudLinesCount: 16,
      canopyColor: '#ff4500', // High-visibility fluorescent orange
      canopyStyle: 'domed_hemispherical',
      deployDelaySec: 0
    }
  );

  const showParachuteRef = useRef(showParachute);
  useEffect(() => {
    showParachuteRef.current = showParachute;
  }, [showParachute]);

  const explodedAmountRef = useRef(explodedAmount);
  useEffect(() => {
    explodedAmountRef.current = explodedAmount;
  }, [explodedAmount]);

  const activeAnatomyIdRef = useRef(activeAnatomyId);
  useEffect(() => {
    activeAnatomyIdRef.current = activeAnatomyId;
  }, [activeAnatomyId]);

  useEffect(() => {
    if (autoDeployParachute !== undefined) {
      setShowParachute(autoDeployParachute);
    }
  }, [autoDeployParachute]);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rocketGroupRef = useRef<THREE.Group | null>(null);
  const customModelGroupRef = useRef<THREE.Group | null>(null);
  const defaultTubeGroupRef = useRef<THREE.Group | null>(null);

  // Subsystem Mesh References for Exploded View & Highlights
  const noseConeMeshRef = useRef<THREE.Mesh | null>(null);
  const payloadMeshRef = useRef<THREE.Mesh | null>(null);
  const recoveryMeshRef = useRef<THREE.Mesh | null>(null);
  const avionicsMeshRef = useRef<THREE.Mesh | null>(null);
  const bodyTubeMeshRef = useRef<THREE.Mesh | null>(null);
  const motorMeshRef = useRef<THREE.Mesh | null>(null);
  const finsGroupRef = useRef<THREE.Group | null>(null);

  const shockCordLineRef = useRef<THREE.Line | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const chuteGroupRef = useRef<THREE.Group | null>(null);

  // High-Visibility Parachute Canvas Texture (Alternating Orange / White Radial Sectors)
  // High-Visibility Parachute Canvas Texture (Alternating Orange / White / Cyan Radial Sectors with Ripstop Nylon Weave)
  const createHighVisParachuteTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const sectors = 16;
      const angleStep = (Math.PI * 2) / sectors;
      const centerX = 512;
      const centerY = 512;
      const radius = 512;

      // 1. Draw 16 Radial Gore Panels
      for (let i = 0; i < sectors; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, i * angleStep, (i + 1) * angleStep);
        ctx.closePath();

        // Alternating color scheme: High-Vis Orange (#ff4500), Silk White (#ffffff), and Cyan (#00d8ff) accent
        if (i % 4 === 3) {
          ctx.fillStyle = '#00d8ff';
        } else if (i % 2 === 0) {
          ctx.fillStyle = '#ff4500';
        } else {
          ctx.fillStyle = '#ffffff';
        }
        ctx.fill();

        // Panel Seam Border
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Dashed Stitching Line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(i * angleStep) * radius, centerY + Math.sin(i * angleStep) * radius);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 2. Ripstop Nylon Grid Texture Overlay
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 1024; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1024);
        ctx.stroke();
      }
      for (let y = 0; y < 1024; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
      }

      // 3. Concentric Reinforcement Tape Rings
      [180, 320, 460].forEach((r) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.lineWidth = 6;
        ctx.stroke();
      });

      // 4. BAR-AEB Marking Logos on White Panels
      ctx.save();
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px monospace';
      ctx.translate(centerX + 260, centerY);
      ctx.rotate(Math.PI / 8);
      ctx.fillText('BAR-AEB • RIPSTOP NYLON 1.1oz', -100, 0);
      ctx.restore();

      // 5. Dark Apex Vent Vent Hole
      ctx.beginPath();
      ctx.arc(centerX, centerY, 64, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      // Apex Reinforced Ring (Yellow Kevlar Tape)
      ctx.beginPath();
      ctx.arc(centerX, centerY, 64, 0, Math.PI * 2);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 14;
      ctx.stroke();

      // 6. Outer Edge High-Vis Yellow Bias Tape Seam
      ctx.beginPath();
      ctx.arc(centerX, centerY, 490, 0, Math.PI * 2);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 20;
      ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  // High-Visibility Rocket Body Livery Canvas Texture
  const createHighVisRocketTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Base: High-Gloss Aerospace Pure White
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 1024, 1024);

      // High-visibility Vibrant Aerospace Orange Bands (#ff4500)
      ctx.fillStyle = '#ff4500';
      ctx.fillRect(0, 40, 1024, 160);
      ctx.fillRect(0, 760, 1024, 180);

      // Electric Cyan Trim Lines (#00d8ff)
      ctx.fillStyle = '#00d8ff';
      ctx.fillRect(0, 200, 1024, 16);
      ctx.fillRect(0, 744, 1024, 16);

      // NASA / Saturn V Style Black Roll Alignment Grid Checkers
      ctx.fillStyle = '#0f172a';
      const numBlocks = 8;
      const w = 1024 / numBlocks;
      for (let i = 0; i < numBlocks; i += 2) {
        ctx.fillRect(i * w, 440, w, 110);
      }

      // Branding Text
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 32px monospace';
      ctx.fillText('FOGUETEDATA AEROSPACE • BAR-AEB', 100, 340);

      ctx.fillStyle = '#ff4500';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('EXPERIMENTAL SOUNDING ROCKET • SL-01', 100, 380);

      // Panel seam lines
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      for (let y = 120; y < 1000; y += 140) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  // Helper for Parabolic Nose Cone Geometry (Continuous Parabola)
  const createNoseGeo = (shape = 'parabolic', baseRadius = 0.8, height = 2.4, segments = 32) => {
    const points: THREE.Vector2[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments; // 0 at base, 1 at tip
      const y = height * t;   // height coordinate
      const normY = y / height;
      const xTip = 1 - normY;
      let r = baseRadius;
      
      if (shape === 'conical') {
        r = baseRadius * xTip;
      } else if (shape === 'ogive') {
        r = baseRadius * Math.sqrt(1 - Math.pow(normY, 2));
      } else if (shape === 'vonkarman') {
        const theta = Math.acos(1 - 2 * xTip);
        r = baseRadius * Math.sqrt((theta - Math.sin(2 * theta) / 2) / Math.PI);
      } else {
        r = baseRadius * (1 - normY * normY);
      }
      points.push(new THREE.Vector2(Math.max(0, r), y));
    }
    return new THREE.LatheGeometry(points, 32);
  };

  const handleEjectParachute = () => {
    const nextState = !showParachute;
    setShowParachute(nextState);
    if (nextState) {
      setParachuteNotice('🪂 Coifa Ejetada e Paraquedas Laranja/Branco Inflado!');
    } else {
      setParachuteNotice('📦 Paraquedas Recolhido e Coifa Acoplada');
    }
    setTimeout(() => setParachuteNotice(null), 3500);
  };

  // Main Three.js Setup Effect
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 20);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // Studio Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.5);
    dirLight1.position.set(15, 25, 15);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff8800, 1.8);
    dirLight2.position.set(-15, -10, -15);
    scene.add(dirLight2);

    const gridHelper = new THREE.GridHelper(26, 26, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -5;
    scene.add(gridHelper);

    // Rocket Main Root Group
    const rocketGroup = new THREE.Group();
    rocketGroupRef.current = rocketGroup;
    scene.add(rocketGroup);

    // Container for imported custom meshes
    const customModelGroup = new THREE.Group();
    customModelGroupRef.current = customModelGroup;
    rocketGroup.add(customModelGroup);

    // Default High-Detail Anatomical Procedural Rocket Group
    const defaultTubeGroup = new THREE.Group();
    defaultTubeGroupRef.current = defaultTubeGroup;
    rocketGroup.add(defaultTubeGroup);

    const defaultBodyLengthCm = 100;
    const defaultNoseLengthCm = 40;

    const currentBodyLengthCm = rocketParams?.bodyLength || defaultBodyLengthCm;
    const currentNoseLengthCm = rocketParams?.noseLength || defaultNoseLengthCm;

    const bodyScaleY = currentBodyLengthCm / defaultBodyLengthCm;
    const noseScaleY = currentNoseLengthCm / defaultNoseLengthCm;

    const rocketTexture = createHighVisRocketTexture();

    // 1. Coifa / Nariz Parabólico (Parabolic Nose Cone)
    const noseGeo = createNoseGeo(rocketParams?.noseShape || 'parabolic', 0.8, 2.4 * noseScaleY, 32);
    const noseMat = new THREE.MeshStandardMaterial({
      color: 0xff4500, // Vibrant Aerospace Orange Nose
      metalness: 0.3,
      roughness: 0.2,
      wireframe: wireframe
    });
    const noseMesh = new THREE.Mesh(noseGeo, noseMat);
    noseMesh.position.y = 3.6 * bodyScaleY; // Sitting right atop the body
    noseConeMeshRef.current = noseMesh;
    defaultTubeGroup.add(noseMesh);

    // Pitot Tube Tip
    const pitotGeo = new THREE.CylinderGeometry(0.04, 0.08, 0.5 * noseScaleY, 16);
    const pitotMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
    const pitotMesh = new THREE.Mesh(pitotGeo, pitotMat);
    pitotMesh.position.y = 2.4 * noseScaleY + 0.2;
    noseMesh.add(pitotMesh);

    // 2. Payload Bay / CubeSat Module
    const payloadGeo = new THREE.CylinderGeometry(0.79, 0.79, 1.2 * bodyScaleY, 32);
    const payloadMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Solid White
      metalness: 0.2,
      roughness: 0.3,
      wireframe: wireframe
    });
    const payloadMesh = new THREE.Mesh(payloadGeo, payloadMat);
    payloadMesh.position.y = 2.4 * bodyScaleY;
    payloadMeshRef.current = payloadMesh;
    defaultTubeGroup.add(payloadMesh);

    // Micro CubeSat Model inside Payload Bay
    const cubeSatGeo = new THREE.BoxGeometry(0.6 * bodyScaleY, 0.6 * bodyScaleY, 0.6 * bodyScaleY);
    const cubeSatMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 });
    const cubeSatMesh = new THREE.Mesh(cubeSatGeo, cubeSatMat);
    payloadMesh.add(cubeSatMesh);

    // 3. Recovery Bay (Parachute Container & Shock Cord)
    const recoveryGeo = new THREE.CylinderGeometry(0.79, 0.79, 0.8 * bodyScaleY, 32);
    const recoveryMat = new THREE.MeshStandardMaterial({
      color: 0xff4500, // Orange High-Vis Band
      metalness: 0.3,
      roughness: 0.2,
      wireframe: wireframe
    });
    const recoveryMesh = new THREE.Mesh(recoveryGeo, recoveryMat);
    recoveryMesh.position.y = 1.4 * bodyScaleY;
    recoveryMeshRef.current = recoveryMesh;
    defaultTubeGroup.add(recoveryMesh);

    // Shock cord line connecting open tube to ejected nose cone
    const cordMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    const cordPoints = [new THREE.Vector3(0, 3.6 * bodyScaleY, 0), new THREE.Vector3(-2.8, 2.2 * bodyScaleY, 0.5)];
    const cordGeo = new THREE.BufferGeometry().setFromPoints(cordPoints);
    const cordLine = new THREE.Line(cordGeo, cordMaterial);
    cordLine.visible = false;
    shockCordLineRef.current = cordLine;
    defaultTubeGroup.add(cordLine);

    // 4. Avionics & Flight Computer Bay
    const avionicsGeo = new THREE.CylinderGeometry(0.79, 0.79, 0.8 * bodyScaleY, 32);
    const avionicsMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Solid White
      metalness: 0.2,
      roughness: 0.3,
      wireframe: wireframe
    });
    const avionicsMesh = new THREE.Mesh(avionicsGeo, avionicsMat);
    avionicsMesh.position.y = 0.6 * bodyScaleY;
    avionicsMeshRef.current = avionicsMesh;
    defaultTubeGroup.add(avionicsMesh);

    // 5. Fuselagem & Tubo Estrutural Principal (Main Body Tube)
    const bodyGeo = new THREE.CylinderGeometry(0.8, 0.8, 2.4 * bodyScaleY, 32);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Solid White
      metalness: 0.2,
      roughness: 0.3,
      wireframe: wireframe
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = -1.0 * bodyScaleY;
    bodyTubeMeshRef.current = bodyMesh;
    defaultTubeGroup.add(bodyMesh);

    // 6. Motor Foguete Sólido & Câmara de Combustão
    const motorGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.2 * bodyScaleY, 32);
    const motorMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.2,
      wireframe: wireframe
    });
    const motorMesh = new THREE.Mesh(motorGeo, motorMat);
    motorMesh.position.y = -2.2 * bodyScaleY;
    motorMeshRef.current = motorMesh;
    defaultTubeGroup.add(motorMesh);

    // De Laval Nozzle
    const nozzleGeo = new THREE.CylinderGeometry(0.35, 0.65, 0.6 * bodyScaleY, 24);
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.1 });
    const nozzleMesh = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzleMesh.position.y = -0.8 * bodyScaleY;
    motorMesh.add(nozzleMesh);

    // 7. Aletas de Estabilização Aeroespacial (4x CNC Fins)
    const finsGroup = new THREE.Group();
    finsGroup.position.y = -1.8 * bodyScaleY;
    finsGroupRef.current = finsGroup;
    defaultTubeGroup.add(finsGroup);

    const finShape = new THREE.Shape();
    const spanUnits = rocketParams ? (rocketParams.finSpan / 10) * 1.4 : 1.4;
    const isElliptical = rocketParams?.finShape === 'elliptical';
    
    if (isElliptical) {
      finShape.moveTo(0, 0);
      finShape.quadraticCurveTo(spanUnits, 0, spanUnits, -1.2 / 2);
      finShape.quadraticCurveTo(spanUnits, -1.2, 0, -1.2);
    } else {
      finShape.moveTo(0, 0);
      finShape.lineTo(spanUnits, -0.7);
      finShape.lineTo(spanUnits, -1.8);
      finShape.lineTo(0, -1.2);
    }
    finShape.closePath();

    const finExtrude = { depth: 0.08, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.03, bevelThickness: 0.03 };
    const finGeo = new THREE.ExtrudeGeometry(finShape, finExtrude);
    const finMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Solid White Fins
      metalness: 0.2,
      roughness: 0.4,
      wireframe: wireframe
    });

    for (let i = 0; i < 4; i++) {
      const finMesh = new THREE.Mesh(finGeo, finMat);
      const angle = (i * Math.PI) / 2;
      finMesh.position.set(Math.cos(angle) * 0.78, 0, Math.sin(angle) * 0.78);
      finMesh.rotation.y = -angle;
      finsGroup.add(finMesh);
    }

    // Exhaust Thrust Particle System
    const particleCount = 350;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.45;
      positions[i * 3 + 1] = -3.4 - Math.random() * 2.8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.45;

      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.4 + Math.random() * 0.6;
      colors[i * 3 + 2] = Math.random() * 0.2;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    particleSystemRef.current = particleSystem;
    rocketGroup.add(particleSystem);

    // Parachute Group (High-Visibility Orange/White Sectors)
    const chuteGroup = new THREE.Group();
    chuteGroup.position.set(0, 9.2, 0);
    chuteGroupRef.current = chuteGroup;

    const pCount = rocketParams?.parachuteCount || 1;
    const numLines = currentChuteConfig.shroudLinesCount || 16;
    const chuteTexture = createHighVisParachuteTexture();

    // Helper to create a single canopy with pristine, realistic geometry, gold reinforced hem and dark spill hole
    const createDetailedCanopy = (
      radius: number,
      shroudLinesCount: number,
      harnessOffset: THREE.Vector3, // relative to canopy center
      canopyOffset: THREE.Vector3, // relative to chuteGroup root
      rotationZ: number = 0
    ) => {
      const singleChuteGroup = new THREE.Group();
      singleChuteGroup.position.copy(canopyOffset);
      singleChuteGroup.rotation.z = rotationZ;

      // Canopy: beautiful inflated hemispherical dome with spill hole (vent) at the top
      // Theta start at 0.08*PI to construct a beautiful spill hole at the apex
      const canopyGeo = new THREE.SphereGeometry(radius, 40, 24, 0, Math.PI * 2, Math.PI * 0.08, Math.PI * 0.47);
      const canopyMat = new THREE.MeshStandardMaterial({
        map: chuteTexture,
        side: THREE.DoubleSide,
        roughness: 0.35,
        metalness: 0.15,
        wireframe: wireframe
      });
      const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
      singleChuteGroup.add(canopyMesh);

      // Yellow reinforced hem webbing tape (lower rim)
      const rimRadius = radius * Math.sin(Math.PI * 0.55);
      const rimY = radius * Math.cos(Math.PI * 0.55);
      const hemGeo = new THREE.TorusGeometry(rimRadius, 0.035, 8, 40);
      const hemMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
      const hemMesh = new THREE.Mesh(hemGeo, hemMat);
      hemMesh.rotation.x = Math.PI / 2;
      hemMesh.position.y = rimY;
      singleChuteGroup.add(hemMesh);

      // Spill Hole / Vent black reinforcement ring
      const ventRadius = radius * Math.sin(Math.PI * 0.08);
      const ventY = radius * Math.cos(Math.PI * 0.08);
      const ventGeo = new THREE.TorusGeometry(ventRadius, 0.025, 6, 30);
      const ventMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
      const ventMesh = new THREE.Mesh(ventGeo, ventMat);
      ventMesh.rotation.x = Math.PI / 2;
      ventMesh.position.y = ventY;
      singleChuteGroup.add(ventMesh);

      // Shroud lines (White high-fidelity nylon cords)
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xf1f5f9, transparent: true, opacity: 0.85 });
      for (let i = 0; i < shroudLinesCount; i++) {
        const angle = (i / shroudLinesCount) * Math.PI * 2;
        const topX = Math.cos(angle) * rimRadius;
        const topZ = Math.sin(angle) * rimRadius;
        const topY = rimY;

        const linePoints = [
          new THREE.Vector3(topX, topY, topZ),
          harnessOffset
        ];
        const linePointsGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
        const lineMesh = new THREE.Line(linePointsGeo, lineMaterial);
        singleChuteGroup.add(lineMesh);
      }

      chuteGroup.add(singleChuteGroup);

      // Calculate and return harness position in parent space (chuteGroup)
      const localHarness = new THREE.Vector3().copy(harnessOffset);
      localHarness.applyAxisAngle(new THREE.Vector3(0, 0, 1), rotationZ);
      return new THREE.Vector3().copy(canopyOffset).add(localHarness);
    };

    // Golden connection swivel ring where shroud lines or branch cords connect
    const swivelGeo = new THREE.TorusGeometry(0.12, 0.03, 8, 24);
    const swivelMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.2 });
    const swivelMesh = new THREE.Mesh(swivelGeo, swivelMat);
    swivelMesh.rotation.x = Math.PI / 2;

    if (pCount === 1) {
      // 1 Parachute Configuration
      const hOffset = new THREE.Vector3(0, -3.8, 0);
      const canopyCenter = new THREE.Vector3(0, 0, 0);
      const harnessPos = createDetailedCanopy(2.8, numLines, hOffset, canopyCenter, 0);

      swivelMesh.position.copy(harnessPos);
      chuteGroup.add(swivelMesh);

      // Thick red main shock cord going from swivel down to recovery bay
      const shockCordPoints = [
        harnessPos,
        new THREE.Vector3(0, -7.8, 0) // World height y = 1.4 (9.2 - 7.8)
      ];
      const cordGeo = new THREE.BufferGeometry().setFromPoints(shockCordPoints);
      const mainShockCord = new THREE.Line(cordGeo, new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 3 }));
      chuteGroup.add(mainShockCord);

    } else {
      // 2 Parachutes Configuration (beautifully tilted side-by-side, matching the image perfectly!)
      // Left Parachute
      const leftHOffset = new THREE.Vector3(0, -3.2, 0);
      const leftCanopyCenter = new THREE.Vector3(-1.6, 0, 0.4);
      const leftHarnessPos = createDetailedCanopy(2.1, numLines, leftHOffset, leftCanopyCenter, -0.16);

      // Right Parachute
      const rightHOffset = new THREE.Vector3(0, -3.2, 0);
      const rightCanopyCenter = new THREE.Vector3(1.6, 0, -0.4);
      const rightHarnessPos = createDetailedCanopy(2.1, numLines, rightHOffset, rightCanopyCenter, 0.16);

      // Swivel node positioned in the center, slightly lower
      const swivelPos = new THREE.Vector3(0, -4.2, 0);
      swivelMesh.position.copy(swivelPos);
      chuteGroup.add(swivelMesh);

      // Sky blue branch cords (bridle) joining each harness to the central swivel
      const bridleMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
      
      const leftBridleGeo = new THREE.BufferGeometry().setFromPoints([leftHarnessPos, swivelPos]);
      const leftBridle = new THREE.Line(leftBridleGeo, bridleMat);
      chuteGroup.add(leftBridle);

      const rightBridleGeo = new THREE.BufferGeometry().setFromPoints([rightHarnessPos, swivelPos]);
      const rightBridle = new THREE.Line(rightBridleGeo, bridleMat);
      chuteGroup.add(rightBridle);

      // Thick red main shock cord going from swivel down to recovery bay
      const shockCordPoints = [
        swivelPos,
        new THREE.Vector3(0, -7.8, 0) // World height y = 1.4 (9.2 - 7.8)
      ];
      const cordGeo = new THREE.BufferGeometry().setFromPoints(shockCordPoints);
      const mainShockCord = new THREE.Line(cordGeo, new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 3 }));
      chuteGroup.add(mainShockCord);
    }

    rocketGroup.add(chuteGroup);

    // Mouse Controls
    let isMouseDown = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown || !rocketGroupRef.current) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      rocketGroupRef.current.rotation.y += deltaX * 0.01;
      rocketGroupRef.current.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Render Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isRotating && rocketGroupRef.current && !isMouseDown) {
        rocketGroupRef.current.rotation.y += 0.008;
      }

      // Handle Exploded View Positions for Anatomy Mode
      const expl = explodedAmountRef.current;
      if (noseConeMeshRef.current) {
        if (showParachuteRef.current) {
          noseConeMeshRef.current.position.lerp(new THREE.Vector3(-2.8, 2.2 * bodyScaleY + expl * 3, 0.5), 0.1);
          noseConeMeshRef.current.rotation.z = 0.8;
          if (shockCordLineRef.current) {
            shockCordLineRef.current.visible = true;
            if (recoveryMeshRef.current && defaultTubeGroupRef.current) {
              const bodyPos = new THREE.Vector3();
              recoveryMeshRef.current.getWorldPosition(bodyPos);
              
              const nosePos = new THREE.Vector3();
              noseConeMeshRef.current.getWorldPosition(nosePos);

              const localBody = defaultTubeGroupRef.current.worldToLocal(bodyPos.clone());
              const localNose = defaultTubeGroupRef.current.worldToLocal(nosePos.clone());

              const points = [localBody];

              if (chuteGroupRef.current && chuteGroupRef.current.visible) {
                const swivelLocal = new THREE.Vector3(0, pCount === 1 ? -3.8 : -4.2, 0);
                swivelLocal.applyMatrix4(chuteGroupRef.current.matrixWorld);
                const localSwivel = defaultTubeGroupRef.current.worldToLocal(swivelLocal);
                points.push(localSwivel);
              }

              points.push(localNose);
              shockCordLineRef.current.geometry.setFromPoints(points);
              shockCordLineRef.current.geometry.attributes.position.needsUpdate = true;
            }
          }
        } else {
          noseConeMeshRef.current.position.lerp(new THREE.Vector3(0, 3.6 * bodyScaleY + expl * 4.5, 0), 0.15);
          noseConeMeshRef.current.rotation.set(0, 0, 0);
          if (shockCordLineRef.current) shockCordLineRef.current.visible = false;
        }
      }

      if (payloadMeshRef.current) {
        payloadMeshRef.current.position.lerp(new THREE.Vector3(0, 2.4 * bodyScaleY + expl * 3.0, 0), 0.15);
      }
      if (recoveryMeshRef.current) {
        recoveryMeshRef.current.position.lerp(new THREE.Vector3(0, 1.4 * bodyScaleY + expl * 1.8, 0), 0.15);
      }
      if (avionicsMeshRef.current) {
        avionicsMeshRef.current.position.lerp(new THREE.Vector3(0, 0.6 * bodyScaleY + expl * 0.6, 0), 0.15);
      }
      if (bodyTubeMeshRef.current) {
        bodyTubeMeshRef.current.position.lerp(new THREE.Vector3(0, -1.0 * bodyScaleY - expl * 0.8, 0), 0.15);
      }
      if (motorMeshRef.current) {
        motorMeshRef.current.position.lerp(new THREE.Vector3(0, -2.2 * bodyScaleY - expl * 2.2, 0), 0.15);
      }
      if (finsGroupRef.current) {
        finsGroupRef.current.position.lerp(new THREE.Vector3(0, -1.8 * bodyScaleY - expl * 3.5, 0), 0.15);
      }

      // Particles Animation
      if (particleSystemRef.current) {
        particleSystemRef.current.visible = showParticles;
        if (showParticles) {
          const posAttr = particleSystemRef.current.geometry.attributes.position as THREE.BufferAttribute;
          const posArray = posAttr.array as Float32Array;

          for (let i = 0; i < particleCount; i++) {
            posArray[i * 3 + 1] -= 0.09 + Math.random() * 0.06;
            if (posArray[i * 3 + 1] < -6.0) {
              posArray[i * 3] = (Math.random() - 0.5) * 0.45;
              posArray[i * 3 + 1] = -3.4;
              posArray[i * 3 + 2] = (Math.random() - 0.5) * 0.45;
            }
          }
          posAttr.needsUpdate = true;
        }
      }

      // Parachute sway
      if (chuteGroupRef.current) {
        const isDeployed = showParachuteRef.current;
        const targetScale = isDeployed ? 1.0 : 0.001;
        chuteGroupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
        chuteGroupRef.current.visible = chuteGroupRef.current.scale.x > 0.02;

        if (chuteGroupRef.current.visible) {
          const time = Date.now() * 0.002;
          chuteGroupRef.current.rotation.z = Math.sin(time) * 0.08;
          chuteGroupRef.current.rotation.x = Math.cos(time * 0.7) * 0.06;
          chuteGroupRef.current.position.y = 9.2 + Math.sin(time * 1.5) * 0.18;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElem.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [wireframe, rocketParams, currentChuteConfig]);

  // Handle 3D File Upload (OBJ, FBX, GLTF, GLB, STL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileName = file.name;
    const ext = fileName.split('.').pop()?.toLowerCase();
    const url = URL.createObjectURL(file);

    const onModelLoaded = (object: THREE.Object3D) => {
      if (!customModelGroupRef.current || !defaultTubeGroupRef.current) return;

      while (customModelGroupRef.current.children.length > 0) {
        customModelGroupRef.current.remove(customModelGroupRef.current.children[0]);
      }

      defaultTubeGroupRef.current.visible = false;

      const box = new THREE.Box3().setFromObject(object);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 7.0 / (maxDim || 1);
      object.scale.set(scale, scale, scale);

      box.setFromObject(object);
      const center = new THREE.Vector3();
      box.getCenter(center);
      object.position.sub(center);
      object.position.y += 1.0;

      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.wireframe = wireframe;
          }
        }
      });

      customModelGroupRef.current.add(object);
      setImportedModelName(fileName);
      setIsUploading(false);
      setParachuteNotice(`✅ Modelo 3D "${fileName}" Importado com Sucesso!`);
      setTimeout(() => setParachuteNotice(null), 4000);
    };

    try {
      if (ext === 'obj') {
        const loader = new OBJLoader();
        loader.load(url, onModelLoaded);
      } else if (ext === 'gltf' || ext === 'glb') {
        const loader = new GLTFLoader();
        loader.load(url, (gltf) => onModelLoaded(gltf.scene));
      } else if (ext === 'fbx') {
        const loader = new FBXLoader();
        loader.load(url, onModelLoaded);
      } else if (ext === 'stl') {
        const loader = new STLLoader();
        loader.load(url, (geometry) => {
          const mat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.5, roughness: 0.2 });
          const mesh = new THREE.Mesh(geometry, mat);
          onModelLoaded(mesh);
        });
      } else {
        alert('Formato não suportado! Suportados: .OBJ, .FBX, .GLTF, .GLB, .STL');
        setIsUploading(false);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar o arquivo 3D.');
      setIsUploading(false);
    }
  };

  // Handle Parachute JSON Config Upload
  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.mainDiameter || parsed.drogueDiameter) {
          const updated: ParachuteConfig = {
            mainDiameter: parsed.mainDiameter || currentChuteConfig.mainDiameter,
            mainCd: parsed.mainCd || currentChuteConfig.mainCd,
            mainDeployAlt: parsed.mainDeployAlt || currentChuteConfig.mainDeployAlt,
            drogueDiameter: parsed.drogueDiameter || currentChuteConfig.drogueDiameter,
            drogueCd: parsed.drogueCd || currentChuteConfig.drogueCd,
            shroudLinesCount: parsed.shroudLinesCount || 16,
            canopyColor: parsed.canopyColor || '#ff4500',
            canopyStyle: parsed.canopyStyle || 'domed_hemispherical',
            deployDelaySec: parsed.deployDelaySec || 0
          };

          setCurrentChuteConfig(updated);
          if (onUpdateParachuteConfig) onUpdateParachuteConfig(updated);

          setParachuteNotice('⚙️ Configuração de Paraquedas Importada via JSON!');
          setTimeout(() => setParachuteNotice(null), 4000);
        } else {
          alert('Arquivo JSON inválido.');
        }
      } catch (err) {
        alert('Erro ao ler arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(currentChuteConfig, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'config_paraquedas_bar_aeb.json';
    link.click();
  };

  const handleResetDefaultModel = () => {
    if (customModelGroupRef.current) {
      while (customModelGroupRef.current.children.length > 0) {
        customModelGroupRef.current.remove(customModelGroupRef.current.children[0]);
      }
    }
    if (defaultTubeGroupRef.current) {
      defaultTubeGroupRef.current.visible = true;
    }
    setImportedModelName(null);
  };

  const currentAnatomyPart = ROCKET_ANATOMY_PARTS.find((p) => p.id === activeAnatomyId) || ROCKET_ANATOMY_PARTS[0];

  return (
    <div className="space-y-4">
      {/* 3D WebGL Primary Canvas Box */}
      <div className="relative w-full h-[520px] bg-[#05070A] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".obj,.fbx,.gltf,.glb,.stl"
          className="hidden"
        />
        <input
          type="file"
          ref={jsonInputRef}
          onChange={handleJsonUpload}
          accept=".json"
          className="hidden"
        />

        {/* Top Overlay Bar */}
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap justify-between items-center gap-2 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-xs font-mono text-cyan-300 flex items-center gap-2 pointer-events-auto shadow-lg">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{importedModelName ? `Modelo 3D: ${importedModelName}` : 'Foguete BAR-AEB High-Vis (3D WebGL)'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/80 pointer-events-auto shadow-lg">
            {/* Toggle Anatomy Explorer Mode */}
            <button
              onClick={() => {
                const next = !isAnatomyMode;
                setIsAnatomyMode(next);
                if (next && explodedAmount === 0) {
                  setExplodedAmount(0.6); // Default 60% exploded when opening anatomy
                }
              }}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow ${
                isAnatomyMode
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white ring-2 ring-cyan-400/50'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-300" />
              <span>{isAnatomyMode ? 'Modo Anatomia Ativo' : 'Explorar Anatomia'}</span>
            </button>

            {/* Import 3D Model */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer shadow"
              title="Importar modelo 3D personalizado (OBJ, FBX, GLTF, STL)"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importar 3D</span>
            </button>

            {/* Parachute JSON */}
            <button
              onClick={() => jsonInputRef.current?.click()}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer shadow"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>

            {importedModelName && (
              <button
                onClick={handleResetDefaultModel}
                className="px-2 py-1 bg-red-600/80 hover:bg-red-500 text-white rounded text-xs font-mono transition"
              >
                Padrão
              </button>
            )}

            <div className="h-4 w-px bg-slate-700 mx-1" />

            <button
              onClick={() => setIsRotating(!isRotating)}
              className={`p-1.5 rounded text-xs transition ${
                isRotating ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Girar automaticamente"
            >
              {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setWireframe(!wireframe)}
              className={`p-1.5 rounded text-xs transition ${
                wireframe ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Modo Estrutura Interna (Wireframe)"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {/* Parachute Ejection */}
            <button
              onClick={handleEjectParachute}
              className={`px-2.5 py-1 rounded text-xs transition flex items-center gap-1.5 shadow font-bold ${
                showParachute ? 'bg-orange-600 hover:bg-orange-500 text-white ring-2 ring-orange-400/50' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <span>🪂</span>
              <span>{showParachute ? 'Aberto' : 'Ejetar Paraquedas'}</span>
            </button>

            <button
              onClick={() => {
                const elem = mountRef.current?.parentElement;
                if (elem) {
                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    elem.requestFullscreen().catch(() => {});
                  }
                }
              }}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 transition rounded"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Parachute Notice Toast */}
        {parachuteNotice && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-orange-600 text-white font-bold font-mono text-xs px-4 py-2 rounded-full shadow-2xl border border-orange-300 flex items-center gap-2 animate-bounce">
            <span>{parachuteNotice}</span>
          </div>
        )}

        {/* 3D Canvas Mounting Container */}
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Exploded View Slider Overlay (Bottom) */}
        <div className="absolute bottom-3 left-3 right-3 z-10 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800/90 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-slate-300 font-bold flex items-center gap-1.5 min-w-32">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Vista Explodida: <strong>{(explodedAmount * 100).toFixed(0)}%</strong>
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={explodedAmount}
              onChange={(e) => setExplodedAmount(parseFloat(e.target.value))}
              className="w-44 accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Nariz: <strong className="text-orange-400">Parabólico Aerodinâmico</strong></span>
            <span>Paraquedas: <strong className="text-orange-400">Laranja/Branco High-Vis</strong></span>
            <span>Fuselagem: <strong className="text-white">Branco/Laranja Neon</strong></span>
          </div>
        </div>
      </div>

      {/* Anatomy Explorer Subsystems Detailed Panel */}
      {isAnatomyMode && (
        <div className="bg-[#05070A] p-4 sm:p-5 lg:p-6 rounded-2xl border border-cyan-500/30 shadow-2xl space-y-4 lg:space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-600/20 text-purple-400 rounded-lg border border-purple-500/40">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-mono text-white">
                  Explorador Anatômico de Sub-sistemas do Foguete (BAR-AEB)
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Selecione os componentes do foguete para inspecionar materiais, dimensões, função e manual pre-flight
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (explodedAmount === 0) setExplodedAmount(0.75);
                else setExplodedAmount(0);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-mono font-bold transition cursor-pointer border border-slate-700"
            >
              {explodedAmount > 0 ? 'Reagrupar Estrutura (0%)' : 'Explodir Todos Componentes (75%)'}
            </button>
          </div>

          {/* Subsystem Buttons Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {ROCKET_ANATOMY_PARTS.map((part) => {
              const isActive = activeAnatomyId === part.id;
              return (
                <button
                  key={part.id}
                  id={`btn-subsystem-${part.id}`}
                  onClick={() => {
                    setActiveAnatomyId(part.id);
                    if (onSelectSubsystem) onSelectSubsystem(part.id);
                  }}
                  className={`p-2 md:p-2.5 lg:p-3 rounded-xl border transition cursor-pointer flex flex-col items-center justify-center md:items-start md:justify-start lg:items-center lg:justify-center gap-1.5 min-w-0 ${
                    isActive
                      ? 'bg-gradient-to-b from-cyan-900/40 to-purple-900/40 border-cyan-400 shadow-lg ring-1 ring-cyan-400/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                  title={part.name}
                >
                  <div className="flex items-center justify-between w-full lg:justify-center">
                    <div className="flex items-center gap-1.5 justify-center md:justify-start lg:justify-center w-full md:w-auto lg:w-full">
                      <span
                        className="w-2 h-2 rounded-full hidden md:inline-block lg:hidden xl:inline-block"
                        style={{ backgroundColor: part.colorHex }}
                      />
                      <div className="text-cyan-400">
                        {getPartIcon(part.id, "w-4 h-4")}
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 uppercase hidden lg:hidden xl:inline">{part.category}</span>
                  </div>
                  {/* Full label on larger screens, hidden on lg screen (tight column 1/3 layout) to prevent squeeze */}
                  <span className="text-[10px] md:text-xs font-mono font-bold text-white line-clamp-1 hidden sm:block lg:hidden xl:block">
                    {part.shortLabel}
                  </span>
                  {/* Single word on mobile to guarantee layout doesn't overflow */}
                  <span className="text-[9px] font-mono font-bold text-white line-clamp-1 block sm:hidden">
                    {part.shortLabel.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Subsystem Detailed Card */}
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: currentAnatomyPart.colorHex }}
                />
                <h4 className="text-sm font-bold font-mono text-white">
                  {currentAnatomyPart.name}
                </h4>
              </div>

              <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800/80">
                {currentAnatomyPart.category}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400">Material & Acabamento:</span>
                <p className="text-slate-200 font-semibold">{currentAnatomyPart.material}</p>
              </div>

              <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400">Massa Estimada:</span>
                <p className="text-emerald-400 font-bold">{currentAnatomyPart.massStr}</p>
              </div>

              <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400">Dimensões & Geometria:</span>
                <p className="text-cyan-400 font-bold">{currentAnatomyPart.dimensionsStr}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono pt-1">
              <div>
                <span className="text-slate-400 font-bold">Função Aeroespacial:</span>
                <p className="text-slate-300 mt-0.5 leading-relaxed">{currentAnatomyPart.functionDesc}</p>
              </div>

              <div className="p-3 bg-amber-950/30 rounded-lg border border-amber-500/30 text-amber-200 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-amber-400">
                  <ShieldCheck className="w-4 h-4" /> Diretriz recomendada para Pré-Lançamento:
                </span>
                <p className="text-[11px] leading-relaxed text-amber-200/90">{currentAnatomyPart.barAebGuide}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

