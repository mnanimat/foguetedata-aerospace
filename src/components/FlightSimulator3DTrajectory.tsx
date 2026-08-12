import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { Play, Pause, RotateCcw, Maximize2, Wind, Navigation, Compass, Layers, Upload, Rocket, RefreshCw, CheckCircle2 } from 'lucide-react';
import { RocketParams } from '../types';
import { TrajectorySummary } from '../utils/rocketPhysics';
import { TrajectoryDownrange2DChart } from './TrajectoryDownrange2DChart';

interface FlightSimulator3DTrajectoryProps {
  summary: TrajectorySummary;
  params: RocketParams;
}

export const FlightSimulator3DTrajectory: React.FC<FlightSimulator3DTrajectoryProps> = ({
  summary,
  params
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [currentPointIndex, setCurrentPointIndex] = useState<number>(0);
  const [showGrid, setShowGrid] = useState(true);
  const [cameraMode, setCameraMode] = useState<'free' | 'follow' | 'top'>('free');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animRocketGroupRef = useRef<THREE.Group | null>(null);
  const rNoseGroupRef = useRef<THREE.Group | null>(null);
  const shockCordLineRef = useRef<THREE.Line | null>(null);
  const animParachuteRef = useRef<THREE.Group | null>(null);
  const chMeshRef = useRef<THREE.Mesh | null>(null);
  const chuteOriginalPositionsRef = useRef<Float32Array | null>(null);
  const chMeshesRef = useRef<THREE.Mesh[]>([]);
  const chuteOriginalPositionsArrayRef = useRef<Float32Array[]>([]);
  const animThrustRef = useRef<THREE.Points | null>(null);

  // Custom 3D Rocket Model Import state
  const [modelType, setModelType] = useState<'preset_bar' | 'preset_cansat' | 'preset_2stage' | 'custom'>('preset_bar');
  const [customFileName, setCustomFileName] = useState<string | null>(null);
  const [showModelModal, setShowModelModal] = useState(false);
  const customModelGroupRef = useRef<THREE.Group | null>(null);
  
  // Interactive anatomy tooltip state
  const [tooltip, setTooltip] = useState<{ title: string; description: string; x: number; y: number } | null>(null);

  const cameraModeRef = useRef(cameraMode);
  useEffect(() => {
    cameraModeRef.current = cameraMode;
  }, [cameraMode]);

  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const currentIndexRef = useRef(currentPointIndex);
  useEffect(() => {
    currentIndexRef.current = currentPointIndex;
  }, [currentPointIndex]);

  // Handler for custom .OBJ or .STL file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const reader = new FileReader();

    if (ext === 'obj') {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          try {
            const loader = new OBJLoader();
            const objGroup = loader.parse(text);
            normalizeAndApplyCustomModel(objGroup, file.name);
          } catch (err) {
            console.error('Error parsing OBJ:', err);
            alert('Erro ao carregar o arquivo .OBJ. Verifique a sintaxe.');
          }
        }
      };
      reader.readAsText(file);
    } else if (ext === 'stl') {
      reader.onload = (event) => {
        const buffer = event.target?.result as ArrayBuffer;
        if (buffer) {
          try {
            const loader = new STLLoader();
            const geometry = loader.parse(buffer);
            const mat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.7, roughness: 0.3 });
            const mesh = new THREE.Mesh(geometry, mat);
            const group = new THREE.Group();
            group.add(mesh);
            normalizeAndApplyCustomModel(group, file.name);
          } catch (err) {
            console.error('Error parsing STL:', err);
            alert('Erro ao carregar o arquivo .STL.');
          }
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Selecione um arquivo de modelo 3D nos formatos .OBJ ou .STL');
    }
  };

  const normalizeAndApplyCustomModel = (group: THREE.Group, fileName: string) => {
    // Compute bounding box to scale model nicely
    const box = new THREE.Box3().setFromObject(group);
    const size = new THREE.Vector3();
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const scale = 12.0 / maxDim; // Scale to ~12m model height
      group.scale.set(scale, scale, scale);
    }

    // Center geometry base at Y=0
    const center = new THREE.Vector3();
    box.getCenter(center);
    group.position.set(-center.x * group.scale.x, -box.min.y * group.scale.y - 5.0, -center.z * group.scale.z);

    customModelGroupRef.current = group;
    setCustomFileName(fileName);
    setModelType('custom');
    setShowModelModal(false);
  };

  useEffect(() => {
    if (!mountRef.current || !summary.points || summary.points.length === 0) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 500;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070a12);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 10000);
    camera.position.set(200, 300, 400);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, summary.maxAltitude * 0.4, 0);
    controlsRef.current = controls;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    dirLight.position.set(300, 800, 500);
    scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 1.0);
    dirLight2.position.set(-300, -200, -300);
    scene.add(dirLight2);

    // Ground Grid & Concentric Distance Rings
    const gridHelper = new THREE.GridHelper(2000, 40, 0x334155, 0x1e293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Landing target circle at touchdown point
    const lastPoint = summary.points[summary.points.length - 1];
    if (lastPoint) {
      const landingGeo = new THREE.RingGeometry(summary.searchRadius * 0.8, summary.searchRadius, 32);
      const landingMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
      const landingRing = new THREE.Mesh(landingGeo, landingMat);
      landingRing.rotation.x = Math.PI / 2;
      landingRing.position.set(lastPoint.xPos, 0.5, lastPoint.zPos || 0);
      scene.add(landingRing);
    }

    // Launch Rail Indicator at (0,0,0)
    const railLength = params.railLength || 2.0;
    const railGeo = new THREE.CylinderGeometry(0.8, 0.8, railLength * 10, 8);
    const railMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 });
    const railMesh = new THREE.Mesh(railGeo, railMat);
    const angleRad = (params.launchAngle * Math.PI) / 180;
    railMesh.rotation.z = Math.PI / 2 - angleRad;
    railMesh.position.set((railLength * 5) * Math.cos(angleRad), (railLength * 5) * Math.sin(angleRad), 0);
    scene.add(railMesh);

    // Wind Direction Vector Arrow on Ground
    const windMps = (params.windSpeed * 1000) / 3600;
    if (windMps > 0) {
      const windDirRad = (((params.windDirection ?? 90) - 90) * Math.PI) / 180;
      const windArrowDir = new THREE.Vector3(Math.cos(windDirRad), 0, Math.sin(windDirRad)).normalize();
      const arrowHelper = new THREE.ArrowHelper(windArrowDir, new THREE.Vector3(0, 2, 0), 80, 0x06b6d4, 15, 10);
      scene.add(arrowHelper);
    }

    // 3D Trajectory Curve Construction
    if (params.trajectoryLineVisible !== false) {
      const curvePoints: THREE.Vector3[] = summary.points.map(p => new THREE.Vector3(p.xPos, p.yPos, p.zPos || 0));
      if (curvePoints.length > 1) {
        const curve = new THREE.CatmullRomCurve3(curvePoints);
        
        if (params.trajectoryLineDashed) {
          // Render as a dashed line
          const lineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(Math.max(200, summary.points.length)));
          const lineMat = new THREE.LineDashedMaterial({
            color: 0x06b6d4, // Cyan base
            dashSize: 10,
            gapSize: 10,
            linewidth: params.trajectoryLineThickness || 2, // Note: WebGL linewidth might be limited on some platforms
          });
          const lineMesh = new THREE.Line(lineGeo, lineMat);
          lineMesh.computeLineDistances(); // Required for dashed material
          scene.add(lineMesh);
        } else {
          // Render as a thick tube (solid)
          const tubeRadius = (params.trajectoryLineThickness || 2) * 0.6;
          const tubeGeo = new THREE.TubeGeometry(curve, 200, tubeRadius, 8, false);

          // Vertex Colors based on phase
          const count = tubeGeo.attributes.position.count;
          const colors = new Float32Array(count * 3);

          for (let i = 0; i < count; i++) {
            const progress = i / count;
            const ptIdx = Math.min(summary.points.length - 1, Math.floor(progress * summary.points.length));
            const phase = summary.points[ptIdx]?.phase || 'coast';

            if (phase === 'ramp' || phase === 'thrust') {
              // Flame Orange
              colors[i * 3] = 0.98; colors[i * 3 + 1] = 0.45; colors[i * 3 + 2] = 0.08;
            } else if (phase === 'coast') {
              // Cyan
              colors[i * 3] = 0.06; colors[i * 3 + 1] = 0.72; colors[i * 3 + 2] = 0.98;
            } else if (phase === 'drogue') {
              // Yellow
              colors[i * 3] = 0.95; colors[i * 3 + 1] = 0.75; colors[i * 3 + 2] = 0.1;
            } else {
              // Emerald Green
              colors[i * 3] = 0.1; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 0.4;
            }
          }

          tubeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
          const tubeMat = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.3,
            metalness: 0.2,
            emissive: 0x111827
          });
          const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
          scene.add(tubeMesh);
        }
      }
    }

    // Apogee Marker Sphere
    const apogeePt = summary.points.reduce((max, p) => (p.altitude > max.altitude ? p : max), summary.points[0]);
    if (apogeePt) {
      const apogeeGeo = new THREE.SphereGeometry(6, 16, 16);
      const apogeeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x7f1d1d });
      const apogeeMesh = new THREE.Mesh(apogeeGeo, apogeeMat);
      apogeeMesh.position.set(apogeePt.xPos, apogeePt.yPos, apogeePt.zPos || 0);
      scene.add(apogeeMesh);
    }

    // Animated Rocket Representation Group
    const animRocketGroup = new THREE.Group();
    animRocketGroupRef.current = animRocketGroup;
    scene.add(animRocketGroup);

    const radiusUnits = 1.2;
    const bodyRadiusCm = (params.diameter || 0.082) * 100 / 2;
    const cmToUnits = radiusUnits / bodyRadiusCm;
    
    const bodyLengthUnits = (params.bodyLength || 100) * cmToUnits;
    const noseLengthUnits = (params.noseLength || 40) * cmToUnits;

    // Generic Nose Cone Helper
    const createNoseGeo = (shape = 'parabolic', radius = 1.2, height = 4.0, segments = 24) => {
      const points: THREE.Vector2[] = [];
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const y = height * t;
        const normY = y / height; // 0 at base, 1 at tip
        const xTip = 1 - normY; // 0 at tip, 1 at base
        let r = radius;
        
        if (shape === 'conical') {
          r = radius * xTip;
        } else if (shape === 'ogive') {
          r = radius * Math.sqrt(1 - Math.pow(normY, 2)); // simple circular ogive
        } else if (shape === 'vonkarman') {
          const theta = Math.acos(1 - 2 * xTip);
          r = radius * Math.sqrt((theta - Math.sin(2 * theta) / 2) / Math.PI);
        } else {
          // parabolic
          r = radius * (1 - normY * normY);
        }
        points.push(new THREE.Vector2(Math.max(0, r), y));
      }
      return new THREE.LatheGeometry(points, 24);
    };

    // Rocket Body Cylinder with High-Vis Livery
    const rBodyGeo = new THREE.CylinderGeometry(radiusUnits, radiusUnits, bodyLengthUnits, 24);
    const rBodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.3, roughness: 0.2 });
    const rBodyMesh = new THREE.Mesh(rBodyGeo, rBodyMat);
    rBodyMesh.userData = { name: 'Tubo do Corpo (Fuselagem)', description: 'Estrutura principal que aloja o motor, eletrônica e paraquedas.' };
    animRocketGroup.add(rBodyMesh);

    // High-Vis Orange Body Band
    const rBandGeo = new THREE.CylinderGeometry(radiusUnits + 0.02, radiusUnits + 0.02, bodyLengthUnits * 0.25, 24);
    const rBandMat = new THREE.MeshStandardMaterial({ color: 0xff4500, metalness: 0.4, roughness: 0.2 });
    const rBandMesh = new THREE.Mesh(rBandGeo, rBandMat);
    rBandMesh.userData = { name: 'Faixa de Visibilidade', description: 'Facilita o rastreamento visual e a recuperação do foguete.' };
    rBandMesh.position.y = bodyLengthUnits * 0.2;
    animRocketGroup.add(rBandMesh);

    // 4 Aerodynamic Fins (Aletas do Minifoguete)
    const createFinGeo = () => {
      const shape = new THREE.Shape();
      const spanUnits = (params.finSpan || 10) * 0.292;
      const rootChord = 3.5;
      const tipChord = 1.5;
      const sweep = 1.0; 
      
      if (params.finShape === 'elliptical') {
        shape.moveTo(0, 0);
        shape.quadraticCurveTo(spanUnits, 0, spanUnits, -rootChord / 2);
        shape.quadraticCurveTo(spanUnits, -rootChord, 0, -rootChord);
      } else {
        shape.moveTo(0, 0); // Root top
        shape.lineTo(spanUnits, -sweep); // Tip top
        shape.lineTo(spanUnits, -sweep - tipChord); // Tip bottom
        shape.lineTo(0, -rootChord); // Root bottom
      }
      shape.closePath();

      const extrudeSettings = {
        steps: 1,
        depth: 0.12,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.04,
        bevelSegments: 2
      };
      return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    };

    const finGeo = createFinGeo();
    const finMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // White
      metalness: 0.2,
      roughness: 0.4
    });

    const finAngleRad = ((params.finAngleOfAttack || 0) * Math.PI) / 180;

    for (let i = 0; i < 4; i++) {
      const finGroup = new THREE.Group();
      finGroup.rotation.y = (i * Math.PI) / 2;

      const finMesh = new THREE.Mesh(finGeo, finMat);
      finMesh.userData = { name: 'Aleta (Fin)', description: `Formato ${params.finShape === 'elliptical' ? 'Elíptico' : 'Trapezoidal'}. Envergadura: ${params.finSpan}cm. Provê estabilidade aerodinâmica estática.` };
      // Place it at x=radiusUnits-0.05 to intersect body. Root bottom will be at y = -bodyLengthUnits/2 + 1.0.
      // So root top will be at y = -bodyLengthUnits/2 + rootChord + 1.0 (which is 4.5).
      finMesh.position.set(radiusUnits - 0.05, -bodyLengthUnits / 2 + 4.5, -0.06); 
      finMesh.rotation.x = finAngleRad; // Angle of attack

      finGroup.add(finMesh);
      animRocketGroup.add(finGroup);
    }

    // Separable Nose Cone Group (Coifa / Nariz Ejetável)
    const rNoseGroup = new THREE.Group();
    rNoseGroup.position.set(0, bodyLengthUnits / 2, 0);
    rNoseGroupRef.current = rNoseGroup;

    // Nose Cone Mesh
    const rNoseGeo = createNoseGeo(params.noseShape || 'parabolic', radiusUnits, noseLengthUnits, 24);
    const rNoseMat = new THREE.MeshStandardMaterial({ color: 0xff4500, metalness: 0.5, roughness: 0.2 });
    const rNoseMesh = new THREE.Mesh(rNoseGeo, rNoseMat);
    rNoseMesh.userData = { name: 'Coifa (Nosecone)', description: 'Perfil aerodinâmico frontal. Ejetada no apogeu para liberar o paraquedas.' };
    rNoseGroup.add(rNoseMesh);

    // Nose Shoulder Coupler (Sombra de Encaixe da Coifa)
    const rCouplerGeo = new THREE.CylinderGeometry(radiusUnits - 0.05, radiusUnits - 0.05, radiusUnits, 24);
    const rCouplerMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.3, roughness: 0.6 });
    const rCouplerMesh = new THREE.Mesh(rCouplerGeo, rCouplerMat);
    rCouplerMesh.userData = { name: 'Ombro de Encaixe (Shoulder)', description: 'Acopla a coifa ao tubo do corpo e protege o paraquedas.' };
    rCouplerMesh.position.y = -radiusUnits / 2;
    rNoseGroup.add(rCouplerMesh);

    // Stainless Eyebolt for Shock Cord Attachment (Olhal de Ancoragem)
    const eyeGeo = new THREE.TorusGeometry(0.2, 0.05, 8, 16);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
    const eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
    eyeMesh.position.y = -radiusUnits - 0.05;
    rNoseGroup.add(eyeMesh);

    animRocketGroup.add(rNoseGroup);

    // High-Vis Yellow Kevlar Shock Cord (Cordão de Choque em Fita Tubular Kevlar)
    const shockCordGeo = new THREE.BufferGeometry();
    const shockCordPositions = new Float32Array([
      0, bodyLengthUnits / 2, 0, // Body tube top
      0.4, bodyLengthUnits / 2 + 1.8, 0.2, // Catenary loop
      0.9, bodyLengthUnits / 2 + 3.5, 0.4  // Nose cone eyebolt
    ]);
    shockCordGeo.setAttribute('position', new THREE.BufferAttribute(shockCordPositions, 3));

    const shockCordMat = new THREE.LineBasicMaterial({
      color: 0xf59e0b, // High-vis yellow Kevlar cord
      transparent: true,
      opacity: 0.95
    });
    const shockCordLine = new THREE.Line(shockCordGeo, shockCordMat);
    shockCordLine.visible = false;
    shockCordLineRef.current = shockCordLine;
    animRocketGroup.add(shockCordLine);

    // High-Vis Parachute Texture Generator
    const create3DChuteTexture = () => {
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

        for (let i = 0; i < sectors; i++) {
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, i * angleStep, (i + 1) * angleStep);
          ctx.closePath();
          if (i % 4 === 3) ctx.fillStyle = '#00d8ff';
          else if (i % 2 === 0) ctx.fillStyle = '#ff4500';
          else ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // Ripstop Nylon Grid
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

        // Apex Hole & Yellow Seam
        ctx.beginPath();
        ctx.arc(centerX, centerY, 64, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX, centerY, 64, 0, Math.PI * 2);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 14;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX, centerY, 490, 0, Math.PI * 2);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 20;
        ctx.stroke();
      }
      return new THREE.CanvasTexture(canvas);
    };

    // Rocket Parachute Group (High-Vis Orange / White / Cyan Dome)
    const animParachuteGroup = new THREE.Group();
    const chTexture = create3DChuteTexture();
    
    // Clear previous mesh lists
    chMeshesRef.current = [];
    chuteOriginalPositionsArrayRef.current = [];

    const numMainParachutes = params.parachuteCount || 1;
    const numLines = 16;

    // Helper to create a single detailed canopy inside the animation group
    const buildCanopy = (
      radius: number,
      canopyOffset: THREE.Vector3,
      harnessOffset: THREE.Vector3,
      rotationZ: number = 0
    ) => {
      const subGroup = new THREE.Group();
      subGroup.position.copy(canopyOffset);
      subGroup.rotation.z = rotationZ;

      // Realistic hemispherical dome with spill hole
      const canopyGeo = new THREE.SphereGeometry(radius, 40, 24, 0, Math.PI * 2, Math.PI * 0.08, Math.PI * 0.47);
      
      const posAttr = canopyGeo.attributes.position as THREE.BufferAttribute;
      const originalPositions = new Float32Array(posAttr.array);
      
      const canopyMat = new THREE.MeshStandardMaterial({
        map: chTexture,
        side: THREE.DoubleSide,
        metalness: 0.25,
        roughness: 0.35,
        wireframe: false
      });
      const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
      canopyMesh.userData = { name: 'Paraquedas', description: 'Sistema de recuperação aerodinâmico simulado com física de tecidos.' };
      
      subGroup.add(canopyMesh);

      // Keep refs for physics ripple animation
      chMeshesRef.current.push(canopyMesh);
      chuteOriginalPositionsArrayRef.current.push(originalPositions);

      // Yellow reinforced hem ring
      const rimRadius = radius * Math.sin(Math.PI * 0.55);
      const rimY = radius * Math.cos(Math.PI * 0.55);
      const hemGeo = new THREE.TorusGeometry(rimRadius, 0.06, 8, 40);
      const hemMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
      const hemMesh = new THREE.Mesh(hemGeo, hemMat);
      hemMesh.rotation.x = Math.PI / 2;
      hemMesh.position.y = rimY;
      subGroup.add(hemMesh);

      // Black spill hole ring
      const ventRadius = radius * Math.sin(Math.PI * 0.08);
      const ventY = radius * Math.cos(Math.PI * 0.08);
      const ventGeo = new THREE.TorusGeometry(ventRadius, 0.04, 6, 30);
      const ventMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
      const ventMesh = new THREE.Mesh(ventGeo, ventMat);
      ventMesh.rotation.x = Math.PI / 2;
      ventMesh.position.y = ventY;
      subGroup.add(ventMesh);

      // Shroud Lines (white nylon cords)
      const lineMat = new THREE.LineBasicMaterial({ color: 0xf8fafc, opacity: 0.9, transparent: true });
      for (let i = 0; i < numLines; i++) {
        const angle = (i / numLines) * Math.PI * 2;
        const topX = Math.cos(angle) * rimRadius;
        const topZ = Math.sin(angle) * rimRadius;
        const topY = rimY;

        const pts = [
          new THREE.Vector3(topX, topY, topZ),
          harnessOffset
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const lineMesh = new THREE.Line(lineGeo, lineMat);
        subGroup.add(lineMesh);
      }

      animParachuteGroup.add(subGroup);

      // Return absolute harness point in group coordinates
      const localHarness = new THREE.Vector3().copy(harnessOffset);
      localHarness.applyAxisAngle(new THREE.Vector3(0, 0, 1), rotationZ);
      return new THREE.Vector3().copy(canopyOffset).add(localHarness);
    };

    // Golden connection swivel ring
    const swivelGeo = new THREE.TorusGeometry(0.2, 0.05, 8, 24);
    const swivelMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.2 });
    const swivelMesh = new THREE.Mesh(swivelGeo, swivelMat);
    swivelMesh.rotation.x = Math.PI / 2;

    if (numMainParachutes === 1) {
      // 1 Parachute
      const harnessOffset = new THREE.Vector3(0, -6.5, 0);
      const canopyOffset = new THREE.Vector3(0, 0, 0);
      const harnessPos = buildCanopy(5.0, canopyOffset, harnessOffset, 0);

      swivelMesh.position.copy(harnessPos);
      animParachuteGroup.add(swivelMesh);

      // Main shock cord going down
      const shockCordPts = [harnessPos, new THREE.Vector3(0, -13.0, 0)];
      const cordGeo = new THREE.BufferGeometry().setFromPoints(shockCordPts);
      const mainCord = new THREE.Line(cordGeo, new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 3 }));
      animParachuteGroup.add(mainCord);

      // Legacy fallback refs to avoid crashing old lines
      if (chMeshesRef.current[0]) chMeshRef.current = chMeshesRef.current[0];
      if (chuteOriginalPositionsArrayRef.current[0]) chuteOriginalPositionsRef.current = chuteOriginalPositionsArrayRef.current[0];
    } else {
      // 2 Parachutes (tilted and beautiful!)
      // Left Parachute
      const leftHOffset = new THREE.Vector3(0, -5.5, 0);
      const leftCanopyOffset = new THREE.Vector3(-2.8, 0, 0.7);
      const leftHarnessPos = buildCanopy(3.8, leftCanopyOffset, leftHOffset, -0.16);

      // Right Parachute
      const rightHOffset = new THREE.Vector3(0, -5.5, 0);
      const rightCanopyOffset = new THREE.Vector3(2.8, 0, -0.7);
      const rightHarnessPos = buildCanopy(3.8, rightCanopyOffset, rightHOffset, 0.16);

      // Swivel point positioned in the center, slightly lower
      const swivelPos = new THREE.Vector3(0, -7.2, 0);
      swivelMesh.position.copy(swivelPos);
      animParachuteGroup.add(swivelMesh);

      // Bridle joining the two harness points to central swivel
      const bridleMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
      
      const leftBridleGeo = new THREE.BufferGeometry().setFromPoints([leftHarnessPos, swivelPos]);
      const leftBridle = new THREE.Line(leftBridleGeo, bridleMat);
      animParachuteGroup.add(leftBridle);

      const rightBridleGeo = new THREE.BufferGeometry().setFromPoints([rightHarnessPos, swivelPos]);
      const rightBridle = new THREE.Line(rightBridleGeo, bridleMat);
      animParachuteGroup.add(rightBridle);

      // Main shock cord going down
      const shockCordPts = [swivelPos, new THREE.Vector3(0, -13.0, 0)];
      const cordGeo = new THREE.BufferGeometry().setFromPoints(shockCordPts);
      const mainCord = new THREE.Line(cordGeo, new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 3 }));
      animParachuteGroup.add(mainCord);

      // Legacy fallback refs to avoid crashing old lines
      if (chMeshesRef.current[0]) chMeshRef.current = chMeshesRef.current[0];
      if (chuteOriginalPositionsArrayRef.current[0]) chuteOriginalPositionsRef.current = chuteOriginalPositionsArrayRef.current[0];
    }

    animParachuteGroup.visible = false;
    animParachuteRef.current = animParachuteGroup;
    scene.add(animParachuteGroup); // Add directly to scene so position/rotation are independent of rocket

    // Rocket Thrust Particles
    const pCount = 100;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 0.8;
      pPos[i * 3 + 1] = -bodyLengthUnits / 2 - Math.random() * 4;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.5, color: 0xf97316, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
    const pSystem = new THREE.Points(pGeo, pMat);
    animThrustRef.current = pSystem;
    animRocketGroup.add(pSystem);

    // Attach custom 3D model if imported
    if (modelType === 'custom' && customModelGroupRef.current) {
      // Clear default body tube and attach imported 3D mesh
      const customClone = customModelGroupRef.current.clone();
      animRocketGroup.add(customClone);
    }

    // Resize listener
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Interactive Anatomy Tooltip Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const handleMouseClick = (e: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Recursive intersection
      const intersects = raycaster.intersectObjects(scene.children, true);
      
      let found = false;
      for (const intersect of intersects) {
        if (intersect.object.userData?.name) {
          setTooltip({
            title: intersect.object.userData.name,
            description: intersect.object.userData.description,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
          found = true;
          break;
        }
      }
      
      if (!found) setTooltip(null);
    };
    mountRef.current.addEventListener('click', handleMouseClick);

    // Animation loop
    let reqId: number;
    let lastTime = performance.now();

    const renderLoop = (time: number) => {
      reqId = requestAnimationFrame(renderLoop);

      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlayingRef.current && summary.points.length > 0) {
        let nextIdx = currentIndexRef.current + Math.ceil(playbackSpeed * delta * 30);
        if (nextIdx >= summary.points.length) {
          nextIdx = 0;
        }
        setCurrentPointIndex(nextIdx);
      }

      // Update rocket & parachute position & orientation
      const ptIdx = Math.min(summary.points.length - 1, currentIndexRef.current);
      const pt = summary.points[ptIdx];
      if (pt && animRocketGroupRef.current) {
        const isDescent = (pt.phase === 'drogue' || pt.phase === 'main_chute');
        const isTouchdown = (pt.yPos <= 0.2 && isDescent);

        // Rocket Position in World Space
        animRocketGroupRef.current.position.set(pt.xPos, pt.yPos, pt.zPos || 0);

        // Rocket Orientation & Launch Rail Alignment Logic
        if (!isDescent) {
          const launchAngleRad = (params.launchAngle * Math.PI) / 180;
          const isRampPhase = (pt.phase === 'ramp' || pt.yPos <= (params.railLength || 2.0) * 8.0);

          if (isRampPhase) {
            // Perfectly aligned along the launch rail elevation angle pointing UPWARDS
            const railVector = new THREE.Vector3(Math.cos(launchAngleRad), Math.sin(launchAngleRad), 0).normalize();
            animRocketGroupRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), railVector);
          } else {
            // Flight path direction (velocity vector)
            const nextPt = summary.points[Math.min(summary.points.length - 1, ptIdx + 1)];
            if (nextPt) {
              const dir = new THREE.Vector3(
                nextPt.xPos - pt.xPos,
                nextPt.yPos - pt.yPos,
                (nextPt.zPos || 0) - (pt.zPos || 0)
              ).normalize();
              if (dir.lengthSq() > 0.001) {
                animRocketGroupRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
              }
            }
          }

          // Nose cone locked on top of body tube, cord stowed
          if (rNoseGroupRef.current) {
            rNoseGroupRef.current.position.set(0, 5.0, 0);
            rNoseGroupRef.current.rotation.set(0, 0, 0);
          }
          if (shockCordLineRef.current) {
            shockCordLineRef.current.visible = false;
          }
        } else if (!isTouchdown) {
          // DESCENT UNDER PARACHUTE (drogue, main_chute):
          // Rocket hangs suspended upright below the parachute with gentle aerodynamic pendulum sway
          const swayAngleX = Math.sin(pt.time * 2.8) * 0.12;
          const swayAngleZ = Math.cos(pt.time * 2.2) * 0.12;
          const euler = new THREE.Euler(swayAngleX, 0, swayAngleZ, 'YXZ');
          animRocketGroupRef.current.quaternion.setFromEuler(euler);

          // EJECTED NOSE CONE & KEVLAR SHOCK CORD SYSTEM
          // Strict physical clearance (Y=6.5m) guarantees zero collision with parachute canopy rim (Y=9.0m)
          if (rNoseGroupRef.current) {
            const noseSwayX = 1.1 + Math.sin(pt.time * 2.1) * 0.25;
            const noseSwayY = 6.5 + Math.cos(pt.time * 1.7) * 0.15;
            const noseSwayZ = 0.6 + Math.cos(pt.time * 2.3) * 0.25;
            rNoseGroupRef.current.position.set(noseSwayX, noseSwayY, noseSwayZ);
            rNoseGroupRef.current.rotation.set(0.3 + Math.sin(pt.time * 1.5) * 0.1, 0, -0.4);

            // Update Kevlar Shock Cord geometry dynamically
            if (shockCordLineRef.current) {
              shockCordLineRef.current.visible = true;
              const posAttr = shockCordLineRef.current.geometry.attributes.position as THREE.BufferAttribute;
              // Pt 0: Top lip of body tube
              posAttr.setXYZ(0, 0, 5.0, 0);
              // Pt 1: Sagging catenary loop
              posAttr.setXYZ(1, noseSwayX * 0.4, 5.5, noseSwayZ * 0.4);
              // Pt 2: Eyebolt at base of separated nose cone
              posAttr.setXYZ(2, noseSwayX, noseSwayY - 1.25, noseSwayZ);
              posAttr.needsUpdate = true;
            }
          }
        } else {
          // TOUCHDOWN: Rocket rests on the ground
          const tiltEuler = new THREE.Euler(Math.PI / 2 - 0.1, 0, 0.4);
          animRocketGroupRef.current.quaternion.setFromEuler(tiltEuler);

          if (rNoseGroupRef.current) {
            rNoseGroupRef.current.position.set(3.0, -4.5, 0.8);
            rNoseGroupRef.current.rotation.set(Math.PI / 2, 0, 0.8);
          }
          if (shockCordLineRef.current) {
            shockCordLineRef.current.visible = true;
            const posAttr = shockCordLineRef.current.geometry.attributes.position as THREE.BufferAttribute;
            posAttr.setXYZ(0, 0, -5.0, 0);
            posAttr.setXYZ(1, 1.5, -4.8, 0.4);
            posAttr.setXYZ(2, 3.0, -4.5, 0.8);
            posAttr.needsUpdate = true;
          }
        }

        // Parachute Position, Opening Inflation & Realistic Cloth Fabric Ripple Simulation
        if (animParachuteRef.current) {
          if (!isDescent) {
            // Stowed / Hidden during ascent
            animParachuteRef.current.visible = false;
          } else if (!isTouchdown) {
            // Active in air under descent
            animParachuteRef.current.visible = true;

            // Calculate inflation progress starting from deployment point
            const isMain = (pt.phase === 'main_chute');
            let inflationProgress = 1.0;

            const startPt = summary.points.find(p => p.phase === pt.phase);
            if (startPt) {
              const dtDeploy = Math.max(0, pt.time - startPt.time);
              const deployDuration = isMain ? 0.7 : 0.4;
              inflationProgress = Math.min(1.0, dtDeploy / deployDuration);
            }

            // Exponential opening curve (rapid deployment inflation)
            const openScale = 1.0 - Math.exp(-inflationProgress * 5.0);

            // Base scale according to parachute type
            const baseChuteScale = isMain ? 1.1 : 0.55;
            const currentScale = baseChuteScale * Math.max(0.08, openScale);

            // Parachute Canopy height above the rocket body (so lines attach at top of rocket)
            const chuteHeightAboveRocket = (isMain ? 14.0 : 10.0) * Math.max(0.3, openScale);

            // Subtle atmospheric wind drift & canopy sway
            const windSwayX = Math.sin(pt.time * 1.8) * 0.6;
            const windSwayZ = Math.cos(pt.time * 1.8) * 0.6;

            animParachuteRef.current.position.set(
              pt.xPos + windSwayX,
              pt.yPos + chuteHeightAboveRocket,
              (pt.zPos || 0) + windSwayZ
            );

            // Scale canopy & lines
            animParachuteRef.current.scale.set(currentScale, currentScale, currentScale);

            // Parachute breathing & wobble
            const chuteTiltX = Math.sin(pt.time * 1.4) * 0.08;
            const chuteTiltZ = Math.cos(pt.time * 1.4) * 0.08;
            animParachuteRef.current.rotation.set(chuteTiltX, 0, chuteTiltZ);

            // REALISTIC FABRIC / CLOTH RIPPLE WAVE SIMULATION
            if (chMeshesRef.current.length > 0 && chuteOriginalPositionsArrayRef.current.length > 0) {
              const timeSec = (pt.time || Date.now() * 0.001) * 3.5;
              chMeshesRef.current.forEach((mesh, index) => {
                const chGeometry = mesh.geometry;
                const pPositions = chGeometry.attributes.position as THREE.BufferAttribute;
                const origPositions = chuteOriginalPositionsArrayRef.current[index];
                if (!origPositions) return;

                for (let i = 0; i < pPositions.count; i++) {
                  const x0 = origPositions[i * 3];
                  const y0 = origPositions[i * 3 + 1];
                  const z0 = origPositions[i * 3 + 2];

                  const r = Math.sqrt(x0 * x0 + z0 * z0);
                  const angle = Math.atan2(z0, x0);

                  // Nylon Fabric Flutter & Wind Ripple Equation
                  const wave = Math.sin(timeSec * 2.5 + angle * 4.0) * Math.cos(timeSec * 1.8 + y0 * 0.5) * 0.18 * (r / 5.0);
                  const billowScale = 1.0 + wave;

                  pPositions.setXYZ(i, x0 * billowScale, y0 + Math.sin(timeSec * 3.0 + i) * 0.05, z0 * billowScale);
                }
                pPositions.needsUpdate = true;
                chGeometry.computeVertexNormals();
              });
            }
          } else {
            // Touchdown: Parachute gently rests on ground beside rocket
            animParachuteRef.current.visible = true;
            animParachuteRef.current.position.set(pt.xPos + 5, 1.0, (pt.zPos || 0) + 3);
            animParachuteRef.current.scale.set(0.8, 0.2, 0.8);
            animParachuteRef.current.rotation.set(Math.PI / 2.2, 0, 0.5);
          }
        }

        // Thrust Flame Particles
        if (animThrustRef.current) {
          animThrustRef.current.visible = (pt.phase === 'ramp' || pt.phase === 'thrust');
        }

        // Follow Camera Tracking
        if (cameraModeRef.current === 'follow' && cameraRef.current && controlsRef.current) {
          controlsRef.current.target.set(pt.xPos, pt.yPos, pt.zPos || 0);
          const camOffset = isDescent ? 45 : 60;
          cameraRef.current.position.set(pt.xPos + camOffset, pt.yPos + 30, (pt.zPos || 0) + camOffset * 1.3);
        } else if (cameraModeRef.current === 'top' && cameraRef.current && controlsRef.current) {
          controlsRef.current.target.set(pt.xPos, 0, pt.zPos || 0);
          cameraRef.current.position.set(pt.xPos, Math.max(200, summary.maxAltitude * 1.1), (pt.zPos || 0) + 1);
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    renderLoop(performance.now());

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeEventListener('click', handleMouseClick);
      }
      renderer.dispose();
    };
  }, [summary, params]);

  const currentPt = summary.points[currentPointIndex] || summary.points[0] || {};

  return (
    <div className="space-y-5">
      {/* 3D WebGL Canvas Viewport */}
      <div className="relative w-full h-[520px] bg-[#05070A] rounded-2xl overflow-hidden border border-blue-500/30 shadow-2xl flex flex-col">
        {/* Top Overlay Controls */}
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap justify-between items-center gap-2 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-xs font-mono text-cyan-300 flex items-center gap-2 pointer-events-auto shadow-lg">
            <Navigation className="w-4 h-4 text-cyan-400" />
            <span>Trajetória Balística 3D em Tempo Real</span>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
              Apogeu: {summary.maxAltitude} m
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/80 pointer-events-auto shadow-lg">
            {/* Import / Change 3D Rocket Model Modal Trigger */}
            <button
              onClick={() => setShowModelModal(true)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500 rounded text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
              title="Importar modelo 3D do foguete (.OBJ ou .STL) ou escolher predefinições"
            >
              <Rocket className="w-3.5 h-3.5 text-cyan-400" />
              <span>Modelo 3D</span>
              {modelType === 'custom' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Modelo 3D Personalizado Ativo" />
              )}
            </button>

            <div className="h-4 w-px bg-slate-700 mx-0.5" />

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow ${
                isPlaying ? 'bg-amber-600 text-white' : 'bg-cyan-600 text-white hover:bg-cyan-500'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pausar' : 'Play 3D'}</span>
            </button>

            <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded text-xs font-mono text-slate-300">
              <span>Velocidade:</span>
              {[1, 2, 5].map(s => (
                <button
                  key={s}
                  onClick={() => setPlaybackSpeed(s)}
                  className={`px-1.5 py-0.5 rounded text-[10px] transition cursor-pointer ${
                    playbackSpeed === s ? 'bg-cyan-500 text-white font-bold' : 'hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            {/* Camera Mode Buttons */}
            <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded text-xs font-mono text-slate-300">
              <button
                onClick={() => setCameraMode('free')}
                className={`px-2 py-0.5 rounded text-[10px] transition cursor-pointer ${
                  cameraMode === 'free' ? 'bg-blue-600 text-white font-bold' : 'hover:text-white text-slate-400'
                }`}
                title="Câmera Livre Orbital"
              >
                Livre
              </button>
              <button
                onClick={() => setCameraMode('follow')}
                className={`px-2 py-0.5 rounded text-[10px] transition cursor-pointer ${
                  cameraMode === 'follow' ? 'bg-cyan-600 text-white font-bold' : 'hover:text-white text-slate-400'
                }`}
                title="Acompanhar Foguete e Paraquedas"
              >
                Seguir
              </button>
              <button
                onClick={() => setCameraMode('top')}
                className={`px-2 py-0.5 rounded text-[10px] transition cursor-pointer ${
                  cameraMode === 'top' ? 'bg-purple-600 text-white font-bold' : 'hover:text-white text-slate-400'
                }`}
                title="Visão Zenital Superior (Topo)"
              >
                Topo
              </button>
            </div>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            <button
              onClick={() => {
                setCurrentPointIndex(0);
                setIsPlaying(false);
              }}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition cursor-pointer"
              title="Reiniciar Simulação"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3D Canvas Mounting Container */}
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Interactive Anatomy Tooltip */}
        {tooltip && (
          <div 
            className="absolute z-50 bg-slate-900/95 backdrop-blur border border-cyan-500/50 p-2.5 rounded shadow-xl pointer-events-none w-48 transition-all duration-150 ease-out"
            style={{ left: tooltip.x + 15, top: tooltip.y + 15 }}
          >
            <div className="font-bold text-cyan-400 text-xs mb-1 uppercase tracking-wider">{tooltip.title}</div>
            <div className="text-slate-300 text-[10px] leading-relaxed">{tooltip.description}</div>
          </div>
        )}

        {/* Bottom Timeline Scrubber & Live Telemetry Panel */}
        <div className="absolute bottom-3 left-3 right-3 z-10 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800/90 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-300 font-bold min-w-16">
              t = {currentPt.time || 0}s
            </span>
            <input
              type="range"
              min="0"
              max={Math.max(0, summary.points.length - 1)}
              value={currentPointIndex}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentPointIndex(parseInt(e.target.value) || 0);
              }}
              className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-400 min-w-16 text-right">
              {summary.totalFlightTime}s
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[10px] font-mono border-t border-slate-800 pt-2">
            <div className="text-slate-300">Altitude: <strong className="text-cyan-400">{currentPt.altitude || 0} m</strong></div>
            <div className="text-slate-300">Velocidade: <strong className="text-emerald-400">{currentPt.velocity || 0} m/s</strong></div>
            <div className="text-slate-300">Aceleração: <strong className="text-amber-400">{currentPt.acceleration || 0} G</strong></div>
            <div className="text-slate-300">Mach: <strong className="text-purple-400">{currentPt.mach || 0}</strong></div>
            <div className="text-slate-300">Deriva (X, Z): <strong className="text-blue-400">({currentPt.xPos || 0}, {currentPt.zPos || 0}) m</strong></div>
            <div className="text-slate-300">Fase: <strong className="text-orange-400 uppercase">{currentPt.phase || 'PRONTO'}</strong></div>
          </div>
        </div>
      </div>

      {/* 2D Recharts Trajectory Downrange Profile Chart Below 3D Viewport */}
      <TrajectoryDownrange2DChart summary={summary} params={params} />
    </div>
  );
};
