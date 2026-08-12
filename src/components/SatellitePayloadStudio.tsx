import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Globe,
  Box,
  Cpu,
  Zap,
  Radio,
  Compass,
  Eye,
  Rocket,
  Download,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Activity,
  Sliders,
  Maximize2,
  Sparkles,
  Maximize
} from 'lucide-react';
import { SatellitePayloadConfig, User } from '../types';
import { jsPDF } from 'jspdf';

interface SatellitePayloadStudioProps {
  currentUser?: User | null;
  onOpenAuthModal?: () => void;
  onLoadPayloadToSimulator?: (payloadMassKg: number) => void;
}

const PRESET_FORM_FACTORS: Record<string, Partial<SatellitePayloadConfig>> = {
  '1U': {
    formFactor: '1U',
    widthCm: 10,
    heightCm: 10,
    lengthCm: 10,
    totalMassKg: 1.33,
    powerConsumptionW: 2.5,
    solarGenerationW: 3.2,
    batteryCapacityWh: 10
  },
  '2U': {
    formFactor: '2U',
    widthCm: 10,
    heightCm: 10,
    lengthCm: 20,
    totalMassKg: 2.66,
    powerConsumptionW: 5.0,
    solarGenerationW: 7.5,
    batteryCapacityWh: 20
  },
  '3U': {
    formFactor: '3U',
    widthCm: 10,
    heightCm: 10,
    lengthCm: 30,
    totalMassKg: 4.0,
    powerConsumptionW: 8.5,
    solarGenerationW: 14.0,
    batteryCapacityWh: 40
  },
  '6U': {
    formFactor: '6U',
    widthCm: 20,
    heightCm: 10,
    lengthCm: 30,
    totalMassKg: 8.0,
    powerConsumptionW: 18.0,
    solarGenerationW: 28.0,
    batteryCapacityWh: 80
  },
  'PocketQube': {
    formFactor: 'PocketQube',
    widthCm: 5,
    heightCm: 5,
    lengthCm: 5,
    totalMassKg: 0.25,
    powerConsumptionW: 0.8,
    solarGenerationW: 0.9,
    batteryCapacityWh: 3.5
  },
  'CustomCanister': {
    formFactor: 'CustomCanister',
    widthCm: 8,
    heightCm: 8,
    lengthCm: 15,
    totalMassKg: 0.5,
    powerConsumptionW: 1.5,
    solarGenerationW: 2.0,
    batteryCapacityWh: 8.0
  }
};

export const SatellitePayloadStudio: React.FC<SatellitePayloadStudioProps> = ({
  currentUser,
  onOpenAuthModal,
  onLoadPayloadToSimulator
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<SatellitePayloadConfig>({
    id: 'sat_fd_01',
    name: 'NanoSat FogueteData-1',
    formFactor: '3U',
    totalMassKg: 4.0,
    widthCm: 10,
    heightCm: 10,
    lengthCm: 30,
    structureMaterial: 'aluminum_6061',
    solarCellsType: 'triple_junction_gaas',
    deployableSolarWings: true,
    batteryCapacityWh: 40,
    obcProcessor: 'STM32F4 Dual + ESP32 Redundant Flight Computer',
    commBand: 'S-Band',
    adcsType: 'magnetorquers_3axis',
    payloadSensors: ['Câmera RGB Alta Resolução', 'Sensores Ambientais CO2/O3', 'Contador Geiger de Radiação'],
    powerConsumptionW: 8.5,
    solarGenerationW: 18.0
  });

  const [wireframe, setWireframe] = useState(false);
  const [explodedView, setExplodedView] = useState(false);
  const [wingsDeployed, setWingsDeployed] = useState(true);
  const [copiedStatus, setCopiedStatus] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const satGroupRef = useRef<THREE.Group | null>(null);
  const wingsGroupRef = useRef<THREE.Group | null>(null);

  // Apply Preset Form Factor
  const handleSelectPreset = (presetKey: string) => {
    const preset = PRESET_FORM_FACTORS[presetKey];
    if (!preset) return;
    setConfig((prev) => ({
      ...prev,
      ...preset,
      name: `NanoSat ${presetKey} FogueteData`
    }));
  };

  // Toggle Payload Sensor
  const handleToggleSensor = (sensorName: string) => {
    setConfig((prev) => {
      const exists = prev.payloadSensors.includes(sensorName);
      const updated = exists
        ? prev.payloadSensors.filter((s) => s !== sensorName)
        : [...prev.payloadSensors, sensorName];
      
      // Adjust mass and power slightly based on sensors
      const powerAdder = updated.length * 1.2;
      return {
        ...prev,
        payloadSensors: updated,
        powerConsumptionW: Math.round((5.0 + powerAdder) * 10) / 10
      };
    });
  };

  // 3D Three.js WebGL Satellite Renderer
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 25, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.0);
    dirLight1.position.set(50, 80, 50);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 1.2);
    dirLight2.position.set(-50, -30, -50);
    scene.add(dirLight2);

    // Grid Helper
    const grid = new THREE.GridHelper(100, 20, 0x1e293b, 0x0f172a);
    grid.position.y = -15;
    scene.add(grid);

    // Main Satellite Group
    const satGroup = new THREE.Group();
    scene.add(satGroup);
    satGroupRef.current = satGroup;

    // Scale 3D dimensions proportional to cm
    const sx = config.widthCm * 0.8;
    const sy = config.lengthCm * 0.8; // Z length / height
    const sz = config.heightCm * 0.8;

    // 1. Satellite Chassis Frame (Aluminum or Carbon Fiber)
    const chassisGeo = new THREE.BoxGeometry(sx, sy, sz);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: config.structureMaterial === 'carbon_fiber' ? 0x111827 : 0x94a3b8,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: wireframe
    });
    const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
    satGroup.add(chassisMesh);

    // 2. Solar Panels on Chassis Surfaces
    const solarMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      metalness: 0.8,
      roughness: 0.3,
      wireframe: wireframe
    });

    // Top & Bottom solar panels
    const panelGeoHoriz = new THREE.BoxGeometry(sx * 0.96, 0.2, sz * 0.96);
    const topPanel = new THREE.Mesh(panelGeoHoriz, solarMat);
    topPanel.position.y = sy / 2 + 0.1;
    satGroup.add(topPanel);

    const bottomPanel = new THREE.Mesh(panelGeoHoriz, solarMat);
    bottomPanel.position.y = -sy / 2 - 0.1;
    satGroup.add(bottomPanel);

    // 3. Deployable Solar Wings (if enabled)
    const wingsGroup = new THREE.Group();
    satGroup.add(wingsGroup);
    wingsGroupRef.current = wingsGroup;

    if (config.deployableSolarWings) {
      const wingGeo = new THREE.BoxGeometry(sx * 1.8, 0.2, sy * 0.9);
      const leftWing = new THREE.Mesh(wingGeo, solarMat);
      leftWing.position.set(-sx * 1.3, 0, 0);

      const rightWing = new THREE.Mesh(wingGeo, solarMat);
      rightWing.position.set(sx * 1.3, 0, 0);

      wingsGroup.add(leftWing);
      wingsGroup.add(rightWing);
    }

    // 4. Optical Camera Lens Aperture (Payload Sensor)
    const lensGeo = new THREE.CylinderGeometry(sx * 0.25, sx * 0.25, 1.2, 32);
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.1 });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(0, sy / 2 + 0.7, 0);
    satGroup.add(lens);

    // 5. COMM Antenna Dipole / Patch
    const antGeo = new THREE.CylinderGeometry(0.1, 0.1, sy * 0.8, 16);
    const antMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    const antenna = new THREE.Mesh(antGeo, antMat);
    antenna.position.set(sx / 2 + 0.5, sy / 4, sz / 2 + 0.5);
    satGroup.add(antenna);

    // Animation Loop
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      if (satGroupRef.current) {
        satGroupRef.current.rotation.y += 0.005;
      }

      // Exploded View effect
      if (explodedView && wingsGroupRef.current) {
        wingsGroupRef.current.position.z = THREE.MathUtils.lerp(wingsGroupRef.current.position.z, 8, 0.05);
      } else if (wingsGroupRef.current) {
        wingsGroupRef.current.position.z = THREE.MathUtils.lerp(wingsGroupRef.current.position.z, 0, 0.05);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [config, wireframe, explodedView]);

  // Export Satellite Configuration Spec PDF (FogueteData Aerospace)
  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('FOGUETEDATA AEROSPACE - ESPECIFICAÇÃO DE SATÉLITE & CARGA ÚTIL', 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Relatório de Engenharia e Orçamento Mássico/Energético - Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 18);

    doc.setFontSize(7.5);
    doc.setTextColor(59, 130, 246);
    doc.text('ARQUITETURA CUBESAT / NANOSATÉLITE DE PESQUISA & TELEMETRIA', 14, 23);

    let y = 36;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`1. IDENTIFICAÇÃO DO PROJETO: ${config.name.toUpperCase()}`, 14, y);

    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Factor Form: ${config.formFactor}`, 14, y);
    doc.text(`Massa Total: ${config.totalMassKg} kg`, 85, y);
    doc.text(`Dimensões: ${config.widthCm} x ${config.heightCm} x ${config.lengthCm} cm`, 140, y);

    y += 8;
    doc.text(`Material Estrutural: ${config.structureMaterial.toUpperCase()}`, 14, y);
    doc.text(`Processador OBC: ${config.obcProcessor}`, 85, y);

    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.text('2. SUB-SISTEMA DE ENERGIA (EPS) & POTÊNCIA', 14, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Células Solares: ${config.solarCellsType}`, 14, y);
    doc.text(`Geração Estimada: ${config.solarGenerationW} W`, 85, y);
    doc.text(`Consumo Médio: ${config.powerConsumptionW} W`, 140, y);

    y += 8;
    doc.text(`Bateria Li-Ion: ${config.batteryCapacityWh} Wh`, 14, y);
    doc.text(`Painéis Desdobráveis: ${config.deployableSolarWings ? 'SIM (Asas Ejetáveis)' : 'NÃO'}`, 85, y);

    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.text('3. SENSORES E CARGAS ÚTEIS DE PESQUISA', 14, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    config.payloadSensors.forEach((sensor, idx) => {
      doc.text(`• ${sensor}`, 18, y);
      y += 6;
    });

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('4. COMUNICAÇÕES & CONTROLE DE ATITUDE', 14, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Banda de Frequência: ${config.commBand}`, 14, y);
    doc.text(`ADCS / Orientação: ${config.adcsType}`, 85, y);

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`FogueteData Aerospace | Página ${p} de ${totalPages}`, 14, 288);
      doc.text('Documento de Engenharia de Carga Útil para Foguetes Experimentais', 110, 288);
    }

    doc.save(`especificacao_satelite_${config.id}_${Date.now()}.pdf`);
  };

  // Export Spec JSON
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `satelite_payload_${config.formFactor}_${config.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-[#05070A] p-5 rounded-2xl border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl text-white shadow-lg">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono text-white">
                Estúdio de Criação de Satélite & Carga Útil (CubeSat Designer)
              </h1>
              <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-500/40">
                FogueteData Aerospace
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Projete, dimensione e integre cargas úteis científicas, CubeSats 1U-6U e satélites para minifoguetes
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-2 border border-slate-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Exportar JSON</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold transition flex items-center gap-2 shadow cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Relatório PDF (FogueteData Aerospace)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 3D WebGL Viewer Left (7 cols) + Configuration Controls Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 3D Interactive WebGL Satellite Viewport */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative w-full h-[480px] bg-[#05070A] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
            
            {/* Top Viewport Overlay Controls */}
            <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-center gap-2 pointer-events-none">
              <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-xs font-mono text-cyan-300 flex items-center gap-2 pointer-events-auto">
                <Box className="w-4 h-4 text-cyan-400" />
                <span>CubeSat 3D WebGL: <strong>{config.formFactor}</strong></span>
              </div>

              <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/80 pointer-events-auto">
                <button
                  onClick={() => setWireframe(!wireframe)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition cursor-pointer ${
                    wireframe ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  Wireframe
                </button>

                <button
                  onClick={() => setExplodedView(!explodedView)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition cursor-pointer ${
                    explodedView ? 'bg-amber-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  Vista Explodida
                </button>
              </div>
            </div>

            {/* Three.js Canvas Container */}
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Bottom 3D Stats Strip */}
            <div className="absolute bottom-3 left-3 right-3 z-10 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800/90 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
              <div className="text-slate-300">
                Dimensões: <strong className="text-cyan-400">{config.widthCm}x{config.heightCm}x{config.lengthCm} cm</strong>
              </div>
              <div className="text-slate-300">
                Massa: <strong className="text-emerald-400">{config.totalMassKg} kg</strong>
              </div>
              <div className="text-slate-300">
                Potência Geração: <strong className="text-amber-400">{config.solarGenerationW} W</strong>
              </div>
              <div className="text-slate-300">
                Consumo: <strong className="text-purple-400">{config.powerConsumptionW} W</strong>
              </div>
            </div>
          </div>

          {/* Load Payload to Rocket Simulator Button */}
          <div className="bg-gradient-to-r from-blue-900/40 via-cyan-900/30 to-slate-900 p-4 rounded-xl border border-blue-500/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/40">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-mono text-white">
                  Embarcar Carga Útil no Foguete FogueteData Aerospace
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  Sincroniza a massa total do satélite ({config.totalMassKg} kg) com o Simulador de Trajetória
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (onLoadPayloadToSimulator) {
                  onLoadPayloadToSimulator(config.totalMassKg);
                }
                setCopiedStatus(true);
                setTimeout(() => setCopiedStatus(false), 3000);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold transition flex items-center gap-2 shadow cursor-pointer"
            >
              {copiedStatus ? <CheckCircle2 className="w-4 h-4" /> : <Rocket className="w-4 h-4" />}
              <span>{copiedStatus ? 'Carga Útil Carregada!' : 'Carregar no Foguete'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Configuration Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#05070A] p-4 rounded-2xl border border-slate-800 space-y-4">
            
            {/* Form Factor Presets */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-cyan-400" />
                Form Factor Standard CubeSat:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                {['1U', '2U', '3U', '6U', 'PocketQube', 'CustomCanister'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleSelectPreset(preset)}
                    className={`py-2 px-2 rounded-lg border text-center transition cursor-pointer font-bold ${
                      config.formFactor === preset
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Satellite Name & Mass */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Nome da Carga Útil:</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Massa Total (kg):</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="50"
                  value={config.totalMassKg}
                  onChange={(e) => setConfig((prev) => ({ ...prev, totalMassKg: parseFloat(e.target.value) || 0.1 }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-400 font-bold focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Dimensions (W, H, L in cm) */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400">Largura (cm):</label>
                <input
                  type="number"
                  value={config.widthCm}
                  onChange={(e) => setConfig((prev) => ({ ...prev, widthCm: parseFloat(e.target.value) || 10 }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400">Altura (cm):</label>
                <input
                  type="number"
                  value={config.heightCm}
                  onChange={(e) => setConfig((prev) => ({ ...prev, heightCm: parseFloat(e.target.value) || 10 }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400">Comprimento (cm):</label>
                <input
                  type="number"
                  value={config.lengthCm}
                  onChange={(e) => setConfig((prev) => ({ ...prev, lengthCm: parseFloat(e.target.value) || 10 }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-white"
                />
              </div>
            </div>

            {/* Structure Material */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400">Material do Chassi Estrutural:</label>
              <select
                value={config.structureMaterial}
                onChange={(e) => setConfig((prev) => ({ ...prev, structureMaterial: e.target.value as any }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white"
              >
                <option value="aluminum_6061">Alumínio 6061-T6 Anodizado (Padrão Aeroespacial)</option>
                <option value="carbon_fiber">Fibra de Carbono PEEK (Leve & Rígido)</option>
                <option value="titanium">Liga de Titânio Gr.5 (Extrema Resistência Térmica)</option>
              </select>
            </div>

            {/* Power System (EPS) & Battery */}
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2.5">
              <div className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Sub-sistema de Energia Electrical Power System (EPS)
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <label className="text-[10px] text-slate-400">Geração Solar (W):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={config.solarGenerationW}
                    onChange={(e) => setConfig((prev) => ({ ...prev, solarGenerationW: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-amber-300 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400">Consumo Médio (W):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={config.powerConsumptionW}
                    onChange={(e) => setConfig((prev) => ({ ...prev, powerConsumptionW: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-purple-300 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-1">
                <span className="text-slate-400">Asas Solares Desdobráveis:</span>
                <button
                  onClick={() => setConfig((prev) => ({ ...prev, deployableSolarWings: !prev.deployableSolarWings }))}
                  className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer ${
                    config.deployableSolarWings ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {config.deployableSolarWings ? 'ATIVADAS' : 'DESATIVADAS'}
                </button>
              </div>
            </div>

            {/* Scientific Payload Sensors Checkboxes */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                Experimentos & Sensores de Bordo:
              </label>

              <div className="space-y-1.5 text-xs font-mono">
                {[
                  'Câmera RGB Alta Resolução',
                  'Sensores Ambientais CO2/O3',
                  'Contador Geiger de Radiação',
                  'Módulo Microgravidade Biológica',
                  'Magnetômetro de Alta Precisão 3 Eixos'
                ].map((sensor) => {
                  const isChecked = config.payloadSensors.includes(sensor);
                  return (
                    <label
                      key={sensor}
                      onClick={() => handleToggleSensor(sensor)}
                      className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition ${
                        isChecked
                          ? 'bg-cyan-900/30 border-cyan-500/50 text-cyan-200'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{sensor}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="accent-cyan-400"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
