import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, Eye, RotateCcw, Box, Sparkles, Sliders, Maximize2, Minimize2 } from 'lucide-react';

interface Rocket3DViewerProps {
  selectedSubsystem?: string;
  onSelectSubsystem?: (subsystemId: string) => void;
  autoDeployParachute?: boolean;
}

export const Rocket3DViewer: React.FC<Rocket3DViewerProps> = ({
  selectedSubsystem,
  onSelectSubsystem,
  autoDeployParachute
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [activePart, setActivePart] = useState<string>('coifa-nosecone');
  const [showParticles, setShowParticles] = useState(true);
  const [showParachute, setShowParachute] = useState(autoDeployParachute ?? true);
  const [parachuteNotice, setParachuteNotice] = useState<string | null>(null);

  const showParachuteRef = useRef(showParachute);
  useEffect(() => {
    showParachuteRef.current = showParachute;
  }, [showParachute]);

  // Sync with prop if autoDeployParachute is provided
  useEffect(() => {
    if (autoDeployParachute !== undefined) {
      setShowParachute(autoDeployParachute);
    }
  }, [autoDeployParachute]);

  const handleEjectParachute = () => {
    const nextState = !showParachute;
    setShowParachute(nextState);
    if (nextState) {
      setParachuteNotice('🪂 Paraquedas Ejetado e Inflado com Sucesso!');
    } else {
      setParachuteNotice('📦 Paraquedas Recolhido e Re-acoplado na Coifa');
    }
    setTimeout(() => setParachuteNotice(null), 3500);
  };

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rocketGroupRef = useRef<THREE.Group | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const chuteGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 18);
    camera.lookAt(0, 2, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Clear previous
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.5);
    dirLight1.position.set(10, 20, 10);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf43f5e, 1.2);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    const gridHelper = new THREE.GridHelper(20, 20, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -4;
    scene.add(gridHelper);

    // Rocket Main Assembly Group
    const rocketGroup = new THREE.Group();
    rocketGroupRef.current = rocketGroup;
    scene.add(rocketGroup);

    // 1. NoseCone (Ogival)
    const noseGeo = new THREE.ConeGeometry(0.8, 2.5, 32);
    const noseMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Red nosecone
      metalness: 0.3,
      roughness: 0.2,
      wireframe: wireframe
    });
    const noseMesh = new THREE.Mesh(noseGeo, noseMat);
    noseMesh.position.y = 5.25;
    noseMesh.userData = { id: 'coifa-nosecone', name: 'Coifa Ogival' };
    rocketGroup.add(noseMesh);

    // 2. Electronics Bay Ring / Coupler
    const couplerGeo = new THREE.CylinderGeometry(0.805, 0.805, 0.5, 32);
    const couplerMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.8,
      roughness: 0.1,
      wireframe: wireframe
    });
    const couplerMesh = new THREE.Mesh(couplerGeo, couplerMat);
    couplerMesh.position.y = 3.75;
    couplerMesh.userData = { id: 'eletronica-altimetro', name: 'Baía de Eletrônica & Altímetro' };
    rocketGroup.add(couplerMesh);

    // 3. Body Tube
    const bodyGeo = new THREE.CylinderGeometry(0.8, 0.8, 5.0, 32);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // White Body
      metalness: 0.1,
      roughness: 0.3,
      wireframe: wireframe
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 1.0;
    bodyMesh.userData = { id: 'tubo-corpo', name: 'Tubo do Corpo (Body Tube)' };
    rocketGroup.add(bodyMesh);

    // 4. Fins (4x Trapezoidal)
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(1.2, -0.6);
    finShape.lineTo(1.2, -1.8);
    finShape.lineTo(0, -1.2);
    finShape.closePath();

    const extrudeSettings = { depth: 0.08, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };
    const finGeo = new THREE.ExtrudeGeometry(finShape, extrudeSettings);
    const finMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.5, roughness: 0.2, wireframe: wireframe });

    for (let i = 0; i < 4; i++) {
      const finMesh = new THREE.Mesh(finGeo, finMat);
      const angle = (i * Math.PI) / 2;
      finMesh.position.set(Math.cos(angle) * 0.78, -0.8, Math.sin(angle) * 0.78);
      finMesh.rotation.y = -angle;
      finMesh.userData = { id: 'aletas-estabilidade', name: 'Aletas de Estabilidade' };
      rocketGroup.add(finMesh);
    }

    // 5. Motor Nozzle / De Laval
    const nozzleGeo = new THREE.CylinderGeometry(0.5, 0.75, 0.8, 24);
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.1, wireframe: wireframe });
    const nozzleMesh = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzleMesh.position.y = -1.9;
    nozzleMesh.userData = { id: 'propulsao-solida', name: 'Bocal De Laval / Motor Sólido' };
    rocketGroup.add(nozzleMesh);

    // Exhaust Thrust Flame Particle Effect
    const particleCount = 250;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.4;
      positions[i * 3 + 1] = -2.3 - Math.random() * 2.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;

      // Orange to yellow gradient
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.4 + Math.random() * 0.6;
      colors[i * 3 + 2] = 0.0;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMat = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    particleSystemRef.current = particleSystem;
    rocketGroup.add(particleSystem);

    // 6. Recovery Parachute Group (Opened on return)
    const chuteGroup = new THREE.Group();
    chuteGroup.position.set(0, 8.2, 0); // Positioned above nose cone
    chuteGroup.userData = { id: 'paraquedas-recuperacao', name: 'Sistema de Paraquedas de Retorno' };

    // Canopy Dome (Orange)
    const canopyGeo = new THREE.SphereGeometry(2.5, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.52);
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0xf97316, // Bright High-Vis Safety Orange
      side: THREE.DoubleSide,
      roughness: 0.3,
      metalness: 0.1,
      wireframe: wireframe
    });
    const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
    chuteGroup.add(canopyMesh);

    // White Trim Accent Line inside Canopy
    const innerRingGeo = new THREE.RingGeometry(0.6, 2.48, 24);
    const innerRingMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const innerRingMesh = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRingMesh.rotation.x = Math.PI / 2;
    innerRingMesh.position.y = 0.02;
    chuteGroup.add(innerRingMesh);

    // Suspension Lines connecting canopy rim to rocket body
    const numLines = 8;
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xf1f5f9, transparent: true, opacity: 0.9 });
    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2;
      const radius = 2.45;
      const topX = Math.cos(angle) * radius;
      const topZ = Math.sin(angle) * radius;

      const points = [
        new THREE.Vector3(topX, 0, topZ),
        new THREE.Vector3(0, -2.8, 0) // Attachment point on rocket nosecone coupler
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMesh = new THREE.Line(lineGeo, lineMaterial);
      chuteGroup.add(lineMesh);
    }

    rocketGroup.add(chuteGroup);
    chuteGroupRef.current = chuteGroup;

    // Mouse Controls (Rotate & Pitch)
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
      rocketGroupRef.current.rotation.x += deltaY * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isRotating && rocketGroupRef.current && !isMouseDown) {
        rocketGroupRef.current.rotation.y += 0.008;
      }

      // Animate Thrust Particles
      if (particleSystemRef.current) {
        particleSystemRef.current.visible = showParticles;
        if (showParticles) {
          const posAttr = particleSystemRef.current.geometry.attributes.position as THREE.BufferAttribute;
          const posArray = posAttr.array as Float32Array;

          for (let i = 0; i < particleCount; i++) {
            posArray[i * 3 + 1] -= 0.08 + Math.random() * 0.05;
            if (posArray[i * 3 + 1] < -5.0) {
              posArray[i * 3] = (Math.random() - 0.5) * 0.4;
              posArray[i * 3 + 1] = -2.3;
              posArray[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
            }
          }
          posAttr.needsUpdate = true;
        }
      }

      // Animate Parachute Deployment, Lerp Scaling & Aerodynamic Sway
      if (chuteGroupRef.current) {
        const targetScale = showParachuteRef.current ? 1.0 : 0.001;
        chuteGroupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
        chuteGroupRef.current.visible = chuteGroupRef.current.scale.x > 0.02;

        if (chuteGroupRef.current.visible) {
          const time = Date.now() * 0.002;
          chuteGroupRef.current.rotation.z = Math.sin(time) * 0.08;
          chuteGroupRef.current.rotation.x = Math.cos(time * 0.7) * 0.06;
          chuteGroupRef.current.position.y = 8.2 + Math.sin(time * 1.5) * 0.15;
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
  }, []);

  // Update wireframe state
  useEffect(() => {
    if (!rocketGroupRef.current) return;
    rocketGroupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.wireframe = wireframe;
      }
    });
  }, [wireframe]);

  const handleResetView = () => {
    if (rocketGroupRef.current) {
      rocketGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  return (
    <div className="relative w-full h-[450px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* Top Overlay Controls */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap justify-between items-center gap-2 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-xs font-mono text-blue-300 flex items-center gap-2 pointer-events-auto">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Renderizador 3D em Tempo Real</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1 rounded-lg border border-slate-700/80 pointer-events-auto">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`p-1.5 rounded text-xs transition flex items-center gap-1 ${
              isRotating ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Alternar rotação automática"
          >
            {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Girar</span>
          </button>

          <button
            onClick={() => setWireframe(!wireframe)}
            className={`p-1.5 rounded text-xs transition flex items-center gap-1 ${
              wireframe ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Modo Raio-X / Structure Wireframe"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Wireframe</span>
          </button>

          <button
            onClick={() => setShowParticles(!showParticles)}
            className={`p-1.5 rounded text-xs transition flex items-center gap-1 ${
              showParticles ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Alternar partículas de empuxo"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chama</span>
          </button>

          <button
            onClick={handleEjectParachute}
            className={`p-1.5 rounded text-xs transition flex items-center gap-1.5 shadow ${
              showParachute ? 'bg-orange-600 hover:bg-orange-500 text-white font-bold ring-2 ring-orange-400/50' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Ejetar ou Recolher Sistema de Paraquedas de Recuperação"
          >
            <span className="text-sm">🪂</span>
            <span className="font-semibold">{showParachute ? 'Ejetado (Aberto)' : 'Ejetar Paraquedas'}</span>
          </button>

          <button
            onClick={handleResetView}
            className="p-1.5 text-slate-400 hover:text-white transition rounded"
            title="Redefinir Câmera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
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
            className="p-1.5 bg-red-600 hover:bg-red-500 text-white transition rounded text-xs font-mono font-bold flex items-center gap-1 shadow"
            title="Expandir 3D em Tela Cheia / Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tela Cheia</span>
          </button>
        </div>
      </div>

      {/* Parachute Ejection Toast Banner */}
      {parachuteNotice && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-orange-600 text-white font-bold font-mono text-xs px-4 py-2 rounded-full shadow-2xl border border-orange-300 flex items-center gap-2 animate-bounce">
          <span>{parachuteNotice}</span>
        </div>
      )}

      {/* 3D Canvas Mounting Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Bottom Hint Overlay */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex justify-between items-center text-[11px] text-slate-400 bg-slate-900/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800">
        <span>Arraste com o mouse para rotacionar o modelo em 360°</span>
        <span className="font-mono text-cyan-400">WebGL Three.js • BAR-AEB Standard</span>
      </div>
    </div>
  );
};
