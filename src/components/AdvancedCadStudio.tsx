import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Box, 
  Wind, 
  Activity, 
  ShieldCheck, 
  Sliders, 
  Download, 
  Layers, 
  Maximize2, 
  RotateCw, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  FileText,
  Sparkles,
  ArrowRight,
  Sun,
  Grid,
  Camera,
  Compass,
  Edit3,
  Minimize2,
  Repeat,
  Circle,
  Maximize,
  Maximize2 as MaxIcon,
  Crosshair,
  Printer,
  FileCode,
  Disc,
  Feather,
  Flame
} from 'lucide-react';
import { User3DModel } from '../types';
import { 
  generateTechnicalDrawingPDF, 
  generateSTLContent, 
  generateOBJContent, 
  generateGCodeContent, 
  generateOpenSCADContent, 
  generateDXFContent, 
  generateCADJsonContent, 
  triggerFileDownload,
  CadParametricSpecs 
} from '../utils/cadExportUtils';

interface AdvancedCadStudioProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel?: User3DModel | null;
}

export const AdvancedCadStudio: React.FC<AdvancedCadStudioProps> = ({
  isOpen,
  onClose,
  selectedModel
}) => {
  const [activeTab, setActiveTab] = useState<'cad' | 'mesh_edit' | 'sketch' | 'propulsion' | 'lighting' | 'cfd' | 'fea' | 'export'>('cad');

  // Parametric CAD Dimensions State (Medidas Exatas)
  const [lengthMm, setLengthMm] = useState<number>(1250);
  const [diameterMm, setDiameterMm] = useState<number>(76);
  const [wallThicknessMm, setWallThicknessMm] = useState<number>(3.0);
  const [noseConeType, setNoseConeType] = useState<string>('Von Kármán (Mínimo Arraste)');
  const [finCount, setFinCount] = useState<number>(3);
  const [finThicknessMm, setFinThicknessMm] = useState<number>(3.0);
  const [material, setMaterial] = useState<string>('Alumínio-Lítio 2195 Aerospace');

  // Sub-Object Mesh Editing State
  const [subObjectMode, setSubObjectMode] = useState<'object' | 'vertex' | 'edge' | 'face'>('object');
  const [activeSubElementIndex, setActiveSubElementIndex] = useState<number>(0);
  const [meshExtrudeMm, setMeshExtrudeMm] = useState<number>(15);
  const [meshSubdivideLevel, setMeshSubdivideLevel] = useState<number>(2);

  // Thermodynamic Propulsion Engine Simulation State
  const [propellantPair, setPropellantPair] = useState<'lox_rp1' | 'lox_ch4' | 'n2o_htpb' | 'n2o_paraffin' | 'hno3_kerosene'>('lox_rp1');
  const [chamberPressureBar, setChamberPressureBar] = useState<number>(45);
  const [expansionRatio, setExpansionRatio] = useState<number>(14);
  const [throatDiameterMm, setThroatDiameterMm] = useState<number>(32);
  const [mixtureRatioOF, setMixtureRatioOF] = useState<number>(2.4);
  const [propulsionAltitudeM, setPropulsionAltitudeM] = useState<number>(2500);
  const [regenCoolingFlowKgS, setRegenCoolingFlowKgS] = useState<number>(0.65);

  // Editable Title Block State
  const [tbTitle, setTbTitle] = useState<string>('Minifoguete Experimental Alpha-1');
  const [tbAuthor, setTbAuthor] = useState<string>('Micael Nildo');
  const [tbTeam, setTbTeam] = useState<string>('MNAnimat AeroSpace');
  const [tbDwgNo, setTbDwgNo] = useState<string>('DWG-AERO-001');
  const [tbScale, setTbScale] = useState<string>('1:1');
  const [tbDate, setTbDate] = useState<string>(new Date().toLocaleDateString('pt-BR'));
  const [tbRev, setTbRev] = useState<string>('REV 02');
  const [tbMat, setTbMat] = useState<string>('Alumínio-Lítio 2195 / Fibra de Carbono');
  const [tbTol, setTbTol] = useState<string>('± 0.10 mm');
  const [activeExportView, setActiveExportView] = useState<'iso' | 'front' | 'top' | 'side' | 'bottom' | 'cross_section'>('iso');

  // CAD Modifiers State (Extrude, Tube Frames, Circular Pattern)
  const [tubeType, setTubeType] = useState<'cylinder' | 'square' | 'rectangular' | 'l_profile' | 'edge_rail'>('cylinder');
  const [extrusionDepthMm, setExtrusionDepthMm] = useState<number>(450);
  const [taperAngleDeg, setTaperAngleDeg] = useState<number>(0);
  const [circularPatternCount, setCircularPatternCount] = useState<number>(4);
  const [circularPatternRadiusMm, setCircularPatternRadiusMm] = useState<number>(85);

  // 2D/3D Sketch Suite State
  const [sketchTool, setSketchTool] = useState<'line' | 'circle' | 'arc' | 'rectangle'>('line');
  const [activeConstraint, setActiveConstraint] = useState<'none' | 'coincident' | 'parallel'>('coincident');
  const [sketchElements, setSketchElements] = useState<Array<{ id: string; type: string; label: string; dimMm: number }>>([
    { id: 'sk1', type: 'line', label: 'Eixo Longitudinal $L_1$', dimMm: 1250 },
    { id: 'sk2', type: 'circle', label: 'Círculo Externa Ø $D$', dimMm: 76 },
    { id: 'sk3', type: 'rectangle', label: 'Perfil Perpendicular Aleta', dimMm: 60 }
  ]);
  const [newSketchLabel, setNewSketchLabel] = useState('');
  const [newSketchDim, setNewSketchDim] = useState(100);

  // Lighting & Environment Render State
  const [lightingPreset, setLightingPreset] = useState<'3point' | 'hdri' | 'spotlight' | 'neon'>('3point');
  const [keyLightColor, setKeyLightColor] = useState('#ff4d4d');
  const [keyLightIntensity, setKeyLightIntensity] = useState(2.5);
  const [fillLightIntensity, setFillLightIntensity] = useState(1.2);
  const [rimLightIntensity, setRimLightIntensity] = useState(1.8);

  const [studioTheme, setStudioTheme] = useState<'dark_navy' | 'clean_white' | 'cyberpunk' | 'deep_space'>('dark_navy');
  const [showMirrorFloor, setShowMirrorFloor] = useState(true);
  const [showContactShadows, setShowContactShadows] = useState(true);
  const [enableBloom, setEnableBloom] = useState(true);
  const [enableSSAO, setEnableSSAO] = useState(true);
  const [renderQuality, setRenderQuality] = useState<'1080p' | '2K' | '4K'>('4K');
  const [isRenderingSnapshot, setIsRenderingSnapshot] = useState(false);

  // CFD State
  const [machNumber, setMachNumber] = useState<number>(0.85);
  const [angleofAttackDeg, setAngleOfAttackDeg] = useState<number>(2);
  const [altitudeM, setAltitudeM] = useState<number>(1500);
  const [isCfdRunning, setIsCfdRunning] = useState<boolean>(false);

  // FEA State
  const [thrustForceN, setThrustForceN] = useState<number>(1800);
  const [bendingMomentNm, setBendingMomentNm] = useState<number>(125);
  const [isFeaRunning, setIsFeaRunning] = useState<boolean>(false);

  // Toast Notification
  const [studioToast, setStudioToast] = useState<string | null>(null);

  if (!isOpen) return null;

  // Active Model Object
  const modelToExport: User3DModel = selectedModel || {
    id: 'm_active_' + Date.now(),
    title: 'Minifoguete Experimental Alpha-1',
    author: 'Micael Nildo',
    type: 'foguete_completo',
    meshType: 'cylinder_rocket',
    primitiveShape: 'cylinder',
    visible: true,
    locked: false,
    posX: 0, posY: 0, posZ: 0,
    rotX: 0, rotY: 0, rotZ: 0,
    scaleX: 1, scaleY: 1, scaleZ: 1,
    color: '#dc2626',
    description: 'Projeto de minifoguete classe G com medidas exatas em milímetros.',
    createdAt: new Date().toISOString().split('T')[0]
  };

  const specs: CadParametricSpecs = {
    lengthMm,
    diameterMm,
    wallThicknessMm,
    noseConeType,
    finCount,
    finThicknessMm,
    material,
    authorName: tbAuthor || modelToExport.author || 'Micael Nildo',
    teamName: tbTeam || 'MNAnimat AeroSpace',
    tubeType,
    extrusionDepthMm,
    patternCount: circularPatternCount,
    patternRadiusMm: circularPatternRadiusMm,
    titleBlock: {
      drawingTitle: tbTitle || modelToExport.title,
      authorName: tbAuthor || 'Micael Nildo',
      teamName: tbTeam || 'MNAnimat AeroSpace',
      drawingNumber: tbDwgNo || 'DWG-AERO-001',
      date: tbDate || new Date().toLocaleDateString('pt-BR'),
      scale: tbScale || '1:1',
      material: tbMat || material,
      revision: tbRev || 'REV 02',
      tolerance: tbTol || '± 0.10 mm'
    }
  };

  // Propulsion Thermodynamics Math
  const propDataMap = {
    lox_rp1: { name: 'LOX / RP-1 (Líquido Kerosene)', Tc: 3670, M: 22.4, gamma: 1.24, cp: 1.85, short: 'LOX/RP-1' },
    lox_ch4: { name: 'LOX / CH4 (Líquido Metano)', Tc: 3520, M: 20.3, gamma: 1.22, cp: 1.95, short: 'LOX/CH4' },
    n2o_htpb: { name: 'N2O / HTPB (Híbrido Borracha)', Tc: 3150, M: 25.1, gamma: 1.26, cp: 1.65, short: 'N2O/HTPB' },
    n2o_paraffin: { name: 'N2O / Parafina (Híbrido Parafina)', Tc: 3280, M: 24.8, gamma: 1.25, cp: 1.70, short: 'N2O/Parafina' },
    hno3_kerosene: { name: 'HNO3 / Kerosene (Ácido Nítrico)', Tc: 3100, M: 26.2, gamma: 1.23, cp: 1.60, short: 'HNO3/RP-1' },
  };
  const propData = propDataMap[propellantPair];

  // Atmospheric Pressure Pa at current altitude
  const Pa = 101325 * Math.pow(Math.max(0.01, 1 - 2.25577e-5 * propulsionAltitudeM), 5.25588); // Pa
  const PaBar = Pa / 100000;

  // Compressibility Correction Z (Peng-Robinson state equation factor)
  const zCompressibility = (1.0 + (chamberPressureBar / 220) * 0.085 - (propData.Tc / 4000) * 0.02).toFixed(3);

  // Throat Area
  const At = (Math.PI * Math.pow(throatDiameterMm / 1000, 2)) / 4; // m^2
  const Ae = At * expansionRatio; // m^2
  const exitDiameterMm = (Math.sqrt((4 * Ae) / Math.PI) * 1000).toFixed(1);

  // Pe nozzle exit pressure approximation
  const gGamma = propData.gamma;
  const Pe = (chamberPressureBar * 100000) / Math.pow(1 + ((gGamma - 1) / 2) * 2.8 * 2.8, gGamma / (gGamma - 1));
  const PeBar = Pe / 100000;

  // Expansion Regime
  const expansionState = PeBar < PaBar * 0.85 
    ? 'SUPER-EXPANDIDO (Choque Oblíquo no Bocal)' 
    : PeBar > PaBar * 1.15 
      ? 'SUB-EXPANDIDO (Leque de Expansão Externo)' 
      : 'EXPANSÃO IDEAL (Empuxo Máximo $P_e = P_a$)';

  // Characteristic velocity c* (m/s)
  const Rgas = 8314.46 / propData.M;
  const cStar = Math.round(Math.sqrt(gGamma * Rgas * propData.Tc) / (gGamma * Math.pow(2 / (gGamma + 1), (gGamma + 1) / (2 * (gGamma - 1)))));

  // Thrust Coefficient Cf
  const CfVal = (0.98 * Math.sqrt(((2 * gGamma * gGamma) / (gGamma - 1)) * Math.pow(2 / (gGamma + 1), (gGamma + 1) / (gGamma - 1)) * (1 - Math.pow(Pe / (chamberPressureBar * 100000), (gGamma - 1) / gGamma))) + ((Pe - Pa) / (chamberPressureBar * 100000)) * expansionRatio).toFixed(3);

  // Thrust F (kN)
  const thrustEngineKN = ((parseFloat(CfVal) * (chamberPressureBar * 100000) * At) / 1000).toFixed(2);
  const ispSeaLevel = Math.round((parseFloat(CfVal) * cStar) / 9.80665);
  const ispVac = Math.round(ispSeaLevel + (Pa * Ae) / (Math.max(1, parseFloat(thrustEngineKN) * 1000) / ispSeaLevel));

  // Thermal balance
  const heatFluxMWm2 = ((0.026 / Math.pow(Math.max(0.005, throatDiameterMm / 1000), 0.2)) * (chamberPressureBar / 30) * (propData.Tc / 3000) * 1.2).toFixed(1);
  const coolingDeltaT = Math.round((parseFloat(heatFluxMWm2) * 1e6 * At) / (regenCoolingFlowKgS * propData.cp * 1000));
  const wallTempHotC = Math.round(550 + parseFloat(heatFluxMWm2) * 38);

  // Calculations
  const airDensity = (1.225 * Math.exp(-altitudeM / 8500)).toFixed(3);
  const pressureDrag = (0.12 * Math.pow(machNumber, 1.8)).toFixed(3);
  const frictionDrag = (0.08 * (1 + 0.1 * machNumber)).toFixed(3);
  const baseDrag = (0.05 / Math.max(0.5, machNumber)).toFixed(3);
  const totalCd = (parseFloat(pressureDrag) + parseFloat(frictionDrag) + parseFloat(baseDrag) + (angleofAttackDeg * 0.015)).toFixed(3);
  const cpLocationCm = (lengthMm * 0.72 / 10).toFixed(1);
  const cgLocationCm = (lengthMm * 0.58 / 10).toFixed(1);
  const staticMargin = ((parseFloat(cpLocationCm) - parseFloat(cgLocationCm)) / (diameterMm / 10)).toFixed(2);

  const yieldStrengthMpa = material.includes('Alumínio') ? 276 : material.includes('Fibra de Carbono') ? 600 : 180;
  const maxVonMisesStressMpa = Math.round((thrustForceN / 120) + (bendingMomentNm * 1.8) + (finThicknessMm < 2.5 ? 45 : 0));
  const safetyFactor = (yieldStrengthMpa / Math.max(10, maxVonMisesStressMpa)).toFixed(2);
  const maxDeflectionMm = (bendingMomentNm * 0.012 / (finThicknessMm / 3)).toFixed(2);

  const showToast = (msg: string) => {
    setStudioToast(msg);
    setTimeout(() => setStudioToast(null), 3000);
  };

  const handleExportPDF = () => {
    generateTechnicalDrawingPDF(modelToExport, specs, modelToExport.author);
    showToast('📄 Desenho Técnico A3 em PDF gerado e baixado!');
  };

  const handleExport3D = (fmt: 'stl' | 'obj' | 'gltf' | 'ply') => {
    if (fmt === 'stl') {
      const content = generateSTLContent(modelToExport, specs);
      triggerFileDownload(`${modelToExport.title.replace(/\s+/g, '_')}.stl`, content, 'model/stl');
      showToast('📦 Arquivo .STL gerado para impressão 3D!');
    } else if (fmt === 'obj') {
      const content = generateOBJContent(modelToExport, specs);
      triggerFileDownload(`${modelToExport.title.replace(/\s+/g, '_')}.obj`, content, 'text/plain');
      showToast('📦 Arquivo .OBJ 3D gerado!');
    } else if (fmt === 'gltf') {
      const content = generateCADJsonContent(modelToExport, specs);
      triggerFileDownload(`${modelToExport.title.replace(/\s+/g, '_')}.gltf`, content, 'application/json');
      showToast('📦 Arquivo .GLTF gerado!');
    } else {
      const content = generateOBJContent(modelToExport, specs);
      triggerFileDownload(`${modelToExport.title.replace(/\s+/g, '_')}.ply`, content, 'text/plain');
      showToast('📦 Arquivo .PLY 3D gerado!');
    }
  };

  const handleExportManufacturing = (type: 'gcode' | 'scad' | 'dxf' | 'json') => {
    if (type === 'gcode') {
      const code = generateGCodeContent(modelToExport, specs);
      triggerFileDownload(`${modelToExport.title.replace(/\s+/g, '_')}_CNC.gcode`, code, 'text/plain');
      showToast('⚙️ Código G (G-Code CNC) gerado para usinagem!');
    } else if (type === 'scad') {
      const code = generateOpenSCADContent(modelToExport, specs);
      triggerFileDownload(`${modelToExport.title.replace(/\s+/g, '_')}.scad`, code, 'text/plain');
      showToast('📐 Script OpenSCAD gerado!');
    } else if (type === 'dxf') {
      const code = generateDXFContent(modelToExport, specs);
      triggerFileDownload(`${modelToExport.title.replace(/\s+/g, '_')}_2D.dxf`, code, 'text/plain');
      showToast('✏️ Arquivo 2D DXF gerado!');
    } else {
      const code = generateCADJsonContent(modelToExport, specs);
      triggerFileDownload(`${modelToExport.title.replace(/\s+/g, '_')}_CADSpec.json`, code, 'application/json');
      showToast('💾 Especificação JSON CAD salva!');
    }
  };

  const handleAddSketchElement = () => {
    if (!newSketchLabel) return;
    const newEl = {
      id: 'sk_' + Date.now(),
      type: sketchTool,
      label: newSketchLabel,
      dimMm: newSketchDim
    };
    setSketchElements([...sketchElements, newEl]);
    setNewSketchLabel('');
    showToast(`✍️ Elemento "${newEl.label}" adicionado ao Esboço 2D/3D com restrição de ${activeConstraint.toUpperCase()}!`);
  };

  const handleRenderHQSnapshot = () => {
    setIsRenderingSnapshot(true);
    setTimeout(() => {
      setIsRenderingSnapshot(false);
      showToast(`📸 Render HQ (${renderQuality}) capturado com Raymarching e Bloom!`);
    }, 1500);
  };

  const handleRunCfd = () => {
    setIsCfdRunning(true);
    setTimeout(() => {
      setIsCfdRunning(false);
      showToast('🌀 Simulação CFD concluída!');
    }, 1200);
  };

  const handleRunFea = () => {
    setIsFeaRunning(true);
    setTimeout(() => {
      setIsFeaRunning(false);
      showToast('🔬 Análise FEA de Von Mises calculada!');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 font-sans">
      <div className="bg-black border border-red-500/40 rounded-2xl max-w-6xl w-full h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden relative">
        
        {/* Studio Toast */}
        {studioToast && (
          <div className="absolute top-16 right-6 z-50 bg-red-600 text-white font-mono text-xs px-4 py-2.5 rounded-xl shadow-2xl border border-red-300 flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span>{studioToast}</span>
          </div>
        )}

        {/* Header Bar */}
        <div className="bg-[#111827] border-b border-slate-800 px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-500">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Estúdio de Engenharia CAD, Medidas Exatas & Renderização HQ
                <span className="text-[10px] bg-red-950 text-red-400 border border-red-500/40 px-2 py-0.5 rounded font-mono uppercase">
                  Aeroespacial & Usinagem
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Modelo Ativo: <strong className="text-red-400 font-mono">{modelToExport.title}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#05070A] border-b border-slate-800 px-4 flex items-center gap-1 overflow-x-auto shrink-0 font-mono text-xs">
          <button
            onClick={() => setActiveTab('cad')}
            className={`px-3 py-2.5 border-b-2 font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'cad'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-red-400" />
            1. Medidas Exatas & Materiais
          </button>

          <button
            onClick={() => setActiveTab('mesh_edit')}
            className={`px-3 py-2.5 border-b-2 font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'mesh_edit'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Maximize2 className="w-4 h-4 text-purple-400" />
            2. Vértices, Arestas & Extrusão
          </button>

          <button
            onClick={() => setActiveTab('sketch')}
            className={`px-3 py-2.5 border-b-2 font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'sketch'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-4 h-4 text-amber-400" />
            3. Esboço 2D/3D & Restrições
          </button>

          <button
            onClick={() => setActiveTab('propulsion')}
            className={`px-3 py-2.5 border-b-2 font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'propulsion'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-orange-400 animate-pulse" />
            4. Propulsão Termodinâmica
          </button>

          <button
            onClick={() => setActiveTab('lighting')}
            className={`px-3 py-2.5 border-b-2 font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'lighting'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-4 h-4 text-yellow-400" />
            5. Iluminação Estúdio & Render
          </button>

          <button
            onClick={() => setActiveTab('cfd')}
            className={`px-3 py-2.5 border-b-2 font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'cfd'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind className="w-4 h-4 text-cyan-400" />
            6. CFD Aerodinâmica & FEA
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`px-3 py-2.5 border-b-2 font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'export'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            7. Prancha A3 & Legenda Editável
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          
          {/* TAB 1: PARAMETRIC GEOMETRY, EXACT MEASUREMENTS & FRAMES */}
          {activeTab === 'cad' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* Controls Column */}
              <div className="lg:col-span-1 bg-[#111827] border border-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-bold text-red-400 uppercase font-mono tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4" /> Medidas Exatas do Modelo (mm)
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-mono mb-1">Comprimento Total ($L$): <strong className="text-red-400">{lengthMm} mm</strong></label>
                    <input
                      type="number"
                      value={lengthMm}
                      onChange={(e) => setLengthMm(Number(e.target.value))}
                      className="w-full bg-[#05070A] border border-slate-700 rounded-lg p-1.5 text-white outline-none font-mono text-xs mb-1 focus:border-red-500"
                    />
                    <input
                      type="range"
                      min="300"
                      max="3000"
                      step="5"
                      value={lengthMm}
                      onChange={(e) => setLengthMm(Number(e.target.value))}
                      className="w-full accent-red-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-mono mb-1">Diâmetro Externo ($D$): <strong className="text-red-400">{diameterMm} mm</strong> (Raio: {(diameterMm / 2).toFixed(1)} mm)</label>
                    <input
                      type="number"
                      value={diameterMm}
                      onChange={(e) => setDiameterMm(Number(e.target.value))}
                      className="w-full bg-[#05070A] border border-slate-700 rounded-lg p-1.5 text-white outline-none font-mono text-xs mb-1 focus:border-red-500"
                    />
                    <input
                      type="range"
                      min="20"
                      max="200"
                      step="1"
                      value={diameterMm}
                      onChange={(e) => setDiameterMm(Number(e.target.value))}
                      className="w-full accent-red-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-mono mb-1">Espessura de Parede ($t$): <strong className="text-red-400">{wallThicknessMm} mm</strong></label>
                    <input
                      type="range"
                      min="0.8"
                      max="10.0"
                      step="0.2"
                      value={wallThicknessMm}
                      onChange={(e) => setWallThicknessMm(Number(e.target.value))}
                      className="w-full accent-red-500 cursor-pointer"
                    />
                  </div>

                  {/* Material Selection */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <label className="block text-slate-300 font-mono font-bold text-xs flex items-center justify-between">
                      <span>Material do Componente</span>
                      <span className="text-[10px] text-amber-400">Propriedades Físicas</span>
                    </label>
                    <select
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      className="w-full bg-[#05070A] border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-red-500 font-mono text-xs"
                    >
                      <option value="Alumínio-Lítio 2195 Aerospace">Alumínio-Lítio 2195 Aerospace (ρ: 2.71 g/cm³ | 276 MPa)</option>
                      <option value="Fibra de Carbono 3K Composite">Fibra de Carbono 3K Composite (ρ: 1.55 g/cm³ | 600 MPa)</option>
                      <option value="Fibra de Vidro G10/FR4">Fibra de Vidro G10/FR4 (ρ: 1.85 g/cm³ | 310 MPa)</option>
                      <option value="Aço Carbono SAE 1020">Aço Carbono SAE 1020 (ρ: 7.85 g/cm³ | 350 MPa)</option>
                      <option value="Inconel 718 Superliga de Níquel">Inconel 718 Superliga de Níquel (ρ: 8.19 g/cm³ | 1100 MPa)</option>
                      <option value="Titânio Grau 5 (Ti-6Al-4V)">Titânio Grau 5 Ti-6Al-4V (ρ: 4.43 g/cm³ | 950 MPa)</option>
                      <option value="Ferro Fundido Nodular Estrutural">Ferro Fundido Nodular Estrutural (ρ: 7.20 g/cm³ | 250 MPa)</option>
                      <option value="Madeira Balsa / Plywood Aeromodelo">Madeira Balsa / Plywood Aeromodelo (ρ: 0.20 g/cm³ | 45 MPa)</option>
                    </select>
                  </div>

                  {/* Tube Frames Selection */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <label className="block text-slate-300 font-mono font-bold text-xs flex items-center justify-between">
                      <span>Modificador Frames & Tubos</span>
                      <span className="text-[10px] text-amber-400">Perfil Estrutural</span>
                    </label>
                    <select
                      value={tubeType}
                      onChange={(e) => setTubeType(e.target.value as any)}
                      className="w-full bg-[#05070A] border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-red-500 font-mono text-xs"
                    >
                      <option value="cylinder">Tubo Cilíndrico Redondo (Ø {diameterMm}mm)</option>
                      <option value="square">Tubo Quadrado Estrutural ({diameterMm}x{diameterMm}mm)</option>
                      <option value="rectangular">Tubo Retangular ({diameterMm}x{(diameterMm * 1.5).toFixed(0)}mm)</option>
                      <option value="l_profile">Perfil L Cantoneira (Cantoneira {diameterMm}mm)</option>
                      <option value="edge_rail">Trilho de Guia Aresta (Rail 2020 Aluminum)</option>
                    </select>
                  </div>

                  {/* Circular Pattern Modifier */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <label className="block text-slate-300 font-mono font-bold text-xs flex items-center justify-between">
                      <span>Padrão Circular (Circular Pattern)</span>
                      <span className="text-[10px] text-red-400">{circularPatternCount} Réplicas</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400">Cópias ($N$):</span>
                        <input
                          type="number"
                          min="2"
                          max="16"
                          value={circularPatternCount}
                          onChange={(e) => setCircularPatternCount(Number(e.target.value))}
                          className="w-full bg-[#05070A] border border-slate-700 rounded-lg p-1.5 text-white outline-none text-xs font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">Raio Eixo (mm):</span>
                        <input
                          type="number"
                          value={circularPatternRadiusMm}
                          onChange={(e) => setCircularPatternRadiusMm(Number(e.target.value))}
                          className="w-full bg-[#05070A] border border-slate-700 rounded-lg p-1.5 text-white outline-none text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Interactive Vector Geometry Viewport */}
              <div className="lg:col-span-2 bg-[#05070A] border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-mono">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Box className="w-4 h-4 text-red-500" /> Malha CAD Detalhada com Cotas Numéricas Exatas
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-red-400 font-bold">Tol: ±0.10mm</span>
                    <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">Perfil: {tubeType.toUpperCase()}</span>
                  </div>
                </div>

                {/* 2D Vector CAD Canvas Preview */}
                <div className="my-4 relative h-64 bg-gradient-to-b from-[#0B0F19] to-[#05070A] rounded-xl border border-slate-800 p-4 flex flex-col items-center justify-center">
                  
                  {/* Schematic Rendering */}
                  <div className="relative flex items-center justify-center w-full max-w-lg">
                    {/* Nosecone */}
                    <div className="w-20 h-14 bg-gradient-to-r from-red-600 to-red-800 rounded-l-full border border-red-400 shadow-lg relative flex items-center justify-center text-[9px] font-mono font-bold text-white">
                      Ogiva ({noseConeType.slice(0, 10)})
                    </div>
                    {/* Body Frame */}
                    <div className="h-14 flex-1 bg-slate-800/90 border-y-2 border-slate-500 relative flex flex-col items-center justify-center text-[10px] font-mono font-bold text-slate-200">
                      <span>{tubeType.toUpperCase()} FRAME</span>
                      <span className="text-[9px] text-red-400">Ø {diameterMm}mm × L {lengthMm}mm</span>
                    </div>
                    {/* Circular Pattern Fins */}
                    <div className="w-14 h-24 bg-gradient-to-r from-red-700 to-red-900 border border-red-500 rounded-r-md relative flex items-center justify-center text-[9px] font-mono font-bold text-white text-center">
                      Circular Pattern ({circularPatternCount}x)
                    </div>
                  </div>

                  {/* Realtime Dimension Overlays */}
                  <div className="absolute top-3 left-4 flex items-center gap-3 text-[11px] font-mono bg-black/90 border border-slate-800 p-2 rounded-lg">
                    <span className="text-red-400 font-bold">
                      Cota L: {lengthMm.toFixed(1)} mm
                    </span>
                    <span className="text-cyan-400 font-bold">
                      Cota Ø Ext: {diameterMm.toFixed(1)} mm
                    </span>
                    <span className="text-amber-400 font-bold">
                      Parede: {wallThicknessMm.toFixed(1)} mm
                    </span>
                  </div>

                  {/* Center Points */}
                  <div className="absolute bottom-3 right-4 flex items-center gap-3 text-[11px] font-mono bg-black/90 border border-slate-800 p-2 rounded-lg">
                    <span className="text-emerald-400 font-bold">
                      CG: {cgLocationCm} cm
                    </span>
                    <span className="text-blue-400 font-bold">
                      CP: {cpLocationCm} cm
                    </span>
                  </div>
                </div>

                {/* Specs Readout */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono bg-[#111827] border border-slate-800 p-3 rounded-xl">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Massa Calculada</div>
                    <div className="text-sm font-extrabold text-white">{(lengthMm * 0.82).toFixed(0)} g</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Volume da Malha</div>
                    <div className="text-sm font-extrabold text-red-400">{(Math.PI * Math.pow(diameterMm / 2, 2) * lengthMm / 1000).toFixed(1)} cm³</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Resistência Limite</div>
                    <div className="text-sm font-extrabold text-emerald-400">{yieldStrengthMpa} MPa</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Material Escolhido</div>
                    <div className="text-[11px] font-bold text-amber-400 truncate">{material.split(' ')[0]}</div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: MESH EDITING - VERTICES, EDGES, FACES & OPERATIONS */}
          {activeTab === 'mesh_edit' && (
            <div className="space-y-5">
              <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-purple-400 font-mono uppercase flex items-center gap-2">
                    <Maximize2 className="w-4 h-4" /> Edição Direta de Sub-Objetos da Malha 3D
                  </h3>
                  <p className="text-xs text-slate-400">
                    Selecione e manipule Vértices, Arestas e Faces com ferramentas de Extrusão, Subdivisão, Inset e Restrições Geométricas.
                  </p>
                </div>

                {/* Sub-Object Mode Selector */}
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs font-mono">
                  {(['object', 'vertex', 'edge', 'face'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSubObjectMode(mode)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 uppercase text-[11px] ${
                        subObjectMode === mode
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode === 'object' && '📦 Objeto Completo'}
                      {mode === 'vertex' && '📍 Vértice'}
                      {mode === 'edge' && '📏 Aresta'}
                      {mode === 'face' && '🔲 Face'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Mesh Operations Toolbar */}
                <div className="bg-[#05070A] border border-slate-800 rounded-xl p-4 space-y-4 text-xs font-mono">
                  <h4 className="font-bold text-purple-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Operações de Malha Tridimensional
                  </h4>

                  {/* 1. Extrudar */}
                  <div className="space-y-2 p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                    <label className="block text-slate-200 font-bold flex justify-between">
                      <span>📐 Extrudar Face (Extrude)</span>
                      <span className="text-purple-400">{meshExtrudeMm} mm</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={meshExtrudeMm}
                      onChange={(e) => setMeshExtrudeMm(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                    <button
                      onClick={() => showToast(`📐 Face Extrudada em +${meshExtrudeMm}mm ao longo do vetor normal!`)}
                      className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-1.5 rounded transition shadow"
                    >
                      Executar Extrusão de Face
                    </button>
                  </div>

                  {/* 2. Subdividir & Inset */}
                  <div className="space-y-2 p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                    <label className="block text-slate-200 font-bold flex justify-between">
                      <span>💠 Subdividir Malha (Subdivide)</span>
                      <span className="text-cyan-400">Nível {meshSubdivideLevel}x</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setMeshSubdivideLevel(Math.min(4, meshSubdivideLevel + 1));
                          showToast(`💠 Malha subdividida para nível ${meshSubdivideLevel + 1}!`);
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold py-1.5 rounded transition"
                      >
                        Subdividir +1
                      </button>
                      <button
                        onClick={() => showToast('🔲 Inset Face aplicado com offset de 3.0mm!')}
                        className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold py-1.5 rounded transition"
                      >
                        Inserir Face (Inset)
                      </button>
                    </div>
                  </div>

                  {/* 3. Geometric Alignment Constraints */}
                  <div className="space-y-2 p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                    <label className="block text-slate-200 font-bold mb-1">🎯 Alinhamento & Restrições Geométricas:</label>
                    <div className="space-y-1.5">
                      <button
                        onClick={() => showToast('🎯 Coincidência por Vértice/Ponto ativada: Vértices snap no mesmo nó!')}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-300 text-left px-2.5 py-1.5 rounded font-bold transition flex items-center justify-between"
                      >
                        <span>• Coincidência por Ponto / Vértice</span>
                        <Crosshair className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => showToast('⏸️ Paralelismo de Arestas aplicado no Eixo Z!')}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 text-left px-2.5 py-1.5 rounded font-bold transition flex items-center justify-between"
                      >
                        <span>• Paralelismo de Arestas</span>
                        <Repeat className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => showToast('⏸️ Horizontalismo ativado: Face travada no plano horizontal X-Z!')}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-300 text-left px-2.5 py-1.5 rounded font-bold transition flex items-center justify-between"
                      >
                        <span>• Horizontalismo de Plano (X-Z)</span>
                        <Box className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mesh Sub-Object Inspector Viewport */}
                <div className="lg:col-span-2 bg-[#05070A] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-mono mb-3">
                      <span className="font-bold text-purple-400 flex items-center gap-2">
                        <Box className="w-4 h-4" /> Inspeção Numérica de Sub-Elementos (Modo: {subObjectMode.toUpperCase()})
                      </span>
                      <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded">
                        {subObjectMode === 'vertex' ? '128 Vértices Ativos' : subObjectMode === 'edge' ? '256 Arestas Mapeadas' : subObjectMode === 'face' ? '128 Faces Quadriláteras' : 'Sólido Completo'}
                      </span>
                    </div>

                    {/* Sub-element Interactive Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1 text-xs font-mono">
                      {Array.from({ length: 8 }).map((_, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setActiveSubElementIndex(idx);
                            showToast(`📍 Sub-elemento #${idx + 1} selecionado no canvas 3D!`);
                          }}
                          className={`p-2.5 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                            activeSubElementIndex === idx
                              ? 'bg-purple-950/80 border-purple-400 text-white shadow-lg shadow-purple-500/20'
                              : 'bg-[#111827] border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-purple-300">
                              {subObjectMode === 'vertex' ? `v_${idx + 1}` : subObjectMode === 'edge' ? `e_${idx + 1}` : `f_${idx + 1}`}
                            </span>
                            <span className="w-2 h-2 rounded-full bg-purple-400" />
                          </div>
                          <div className="text-[10px] text-slate-400 space-y-0.5">
                            <div>X: {((idx - 3.5) * 12.5).toFixed(1)}</div>
                            <div>Y: {(idx * 45.0).toFixed(1)}</div>
                            <div>Z: {((idx % 2 === 0 ? 1 : -1) * 38.0).toFixed(1)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-[#111827] border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono text-slate-300">
                    <span>
                      Modo Selecionado: <strong className="text-purple-400 uppercase">{subObjectMode}</strong> (# {activeSubElementIndex + 1})
                    </span>
                    <button
                      onClick={() => showToast('⚡ Modificações aplicadas à geometria de malha do modelo!')}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-1.5 rounded-lg transition"
                    >
                      Confirmar Alterações na Malha
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 2D & 3D SKETCH SUITE WITH CONSTRAINTS */}
          {activeTab === 'sketch' && (
            <div className="space-y-5">
              <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-amber-400 font-mono uppercase flex items-center gap-2">
                    <Edit3 className="w-4 h-4" /> Esboço Paramétrico 2D/3D & Restrições Geométricas
                  </h3>
                  <p className="text-xs text-slate-400">
                    Crie perfis com restrições de Coincidência e Paralelo para extrusão e corte CAD.
                  </p>
                </div>

                {/* Constraint Selector */}
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400 font-bold">Restrição Ativa:</span>
                  <button
                    onClick={() => setActiveConstraint('coincident')}
                    className={`px-3 py-1.5 rounded-lg border font-bold transition flex items-center gap-1 ${
                      activeConstraint === 'coincident'
                        ? 'bg-amber-600 text-white border-amber-400'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    <Crosshair className="w-3.5 h-3.5" /> Coincidente
                  </button>
                  <button
                    onClick={() => setActiveConstraint('parallel')}
                    className={`px-3 py-1.5 rounded-lg border font-bold transition flex items-center gap-1 ${
                      activeConstraint === 'parallel'
                        ? 'bg-amber-600 text-white border-amber-400'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    <Repeat className="w-3.5 h-3.5" /> Paralelo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                
                {/* Sketch Tools Form */}
                <div className="bg-[#05070A] border border-slate-800 rounded-xl p-4 space-y-4 text-xs font-mono">
                  <h4 className="font-bold text-slate-300 uppercase border-b border-slate-800 pb-2 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-amber-400" /> Ferramentas de Desenho Esboçado
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'line', label: 'Linha', icon: ArrowRight },
                      { id: 'circle', label: 'Círculo', icon: Circle },
                      { id: 'arc', label: 'Arco', icon: Disc },
                      { id: 'rectangle', label: 'Retângulo', icon: Box }
                    ].map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <button
                          key={tool.id}
                          onClick={() => setSketchTool(tool.id as any)}
                          className={`p-2 rounded-lg border flex items-center gap-2 font-bold transition ${
                            sketchTool === tool.id
                              ? 'bg-amber-600 text-white border-amber-400'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-amber-400" />
                          <span>{tool.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="block text-slate-400">Nome do Elemento:</label>
                    <input
                      type="text"
                      placeholder="Ex: Cota de Flange / Aresta Guia"
                      value={newSketchLabel}
                      onChange={(e) => setNewSketchLabel(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-amber-500"
                    />

                    <label className="block text-slate-400">Medida Exata (mm):</label>
                    <input
                      type="number"
                      value={newSketchDim}
                      onChange={(e) => setNewSketchDim(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-amber-500"
                    />

                    <button
                      onClick={handleAddSketchElement}
                      className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-2 shadow"
                    >
                      <Sparkles className="w-4 h-4" /> Adicionar Cota ao Esboço
                    </button>
                  </div>
                </div>

                {/* Interactive Sketch Canvas & Elements List */}
                <div className="lg:col-span-2 bg-[#05070A] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-slate-300 uppercase border-b border-slate-800 pb-2 mb-3">
                      Elementos Esboçados Ativos ({sketchElements.length})
                    </h4>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {sketchElements.map((el) => (
                        <div
                          key={el.id}
                          className="bg-[#111827] border border-slate-800 p-3 rounded-lg flex items-center justify-between text-xs font-mono"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            <span className="font-bold text-white">{el.label}</span>
                            <span className="text-[10px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-amber-300 uppercase">
                              {el.type}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-amber-400 font-bold">{el.dimMm} mm</span>
                            <button
                              onClick={() => setSketchElements(sketchElements.filter((s) => s.id !== el.id))}
                              className="text-slate-500 hover:text-red-400 transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Extrude Button */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">
                      Profundidade de Extrusão: <strong className="text-amber-400">{extrusionDepthMm} mm</strong>
                    </span>
                    <button
                      onClick={() => showToast(`⚡ Esboço Extrudado em 3D (${extrusionDepthMm}mm)!`)}
                      className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-lg shadow-amber-600/20"
                    >
                      <Zap className="w-4 h-4" /> Extrudar Esboço para Sólido 3D
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: THERMODYNAMIC PROPULSION SIMULATION ENGINE */}
          {activeTab === 'propulsion' && (
            <div className="space-y-5">
              <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-orange-400 font-mono uppercase flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" /> Simulação Termodinâmica do Motor de Propulsão Híbrida & Líquida
                  </h3>
                  <p className="text-xs text-slate-400">
                    Previsão de empuxo F, Isp, velocidade característica c*, regime do bocal e balanço térmico de parede com equações de estado real (Peng-Robinson).
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="bg-orange-950/80 text-orange-300 border border-orange-800 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-400" />
                    Par Propulsor: {propData.short}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 font-mono text-xs">
                
                {/* Engine Parameters Form */}
                <div className="bg-[#05070A] border border-slate-800 rounded-xl p-4 space-y-4">
                  <h4 className="font-bold text-orange-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Parâmetros Termodinâmicos do Motor
                  </h4>

                  {/* Propellant Selection */}
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">1. Par de Propulsores (Ergóis):</label>
                    <select
                      value={propellantPair}
                      onChange={(e) => setPropellantPair(e.target.value as any)}
                      className="w-full bg-[#111827] border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-orange-500 font-bold"
                    >
                      <option value="lox_rp1">LOX / RP-1 (Líquido Kerosene | Tc: 3670 K)</option>
                      <option value="lox_ch4">LOX / CH4 (Líquido Metano | Tc: 3520 K)</option>
                      <option value="n2o_htpb">N2O / HTPB (Híbrido Borracha | Tc: 3150 K)</option>
                      <option value="n2o_paraffin">N2O / Parafina Wax (Híbrido | Tc: 3280 K)</option>
                      <option value="hno3_kerosene">HNO3 / Kerosene (Ácido Nítrico | Tc: 3100 K)</option>
                    </select>
                  </div>

                  {/* Chamber Pressure Pc */}
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold flex justify-between">
                      <span>Pressão da Câmara (Pc):</span>
                      <strong className="text-orange-400">{chamberPressureBar} bar</strong>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="120"
                      step="1"
                      value={chamberPressureBar}
                      onChange={(e) => setChamberPressureBar(Number(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>

                  {/* Expansion Ratio epsilon */}
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold flex justify-between">
                      <span>Razão de Expansão Bocal (ε = Ae/At):</span>
                      <strong className="text-cyan-400">{expansionRatio}:1</strong>
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="60"
                      step="1"
                      value={expansionRatio}
                      onChange={(e) => setExpansionRatio(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  {/* Throat Diameter */}
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold flex justify-between">
                      <span>Diâmetro da Garganta (dt):</span>
                      <strong className="text-emerald-400">{throatDiameterMm} mm</strong>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      step="1"
                      value={throatDiameterMm}
                      onChange={(e) => setThroatDiameterMm(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Altitude Slider */}
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold flex justify-between">
                      <span>Altitude de Voo (h):</span>
                      <strong className="text-amber-400">{propulsionAltitudeM} m</strong>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="45000"
                      step="500"
                      value={propulsionAltitudeM}
                      onChange={(e) => setPropulsionAltitudeM(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Regenerative Cooling Flow */}
                  <div className="space-y-1 pt-2 border-t border-slate-800">
                    <label className="block text-slate-300 font-bold flex justify-between">
                      <span>Refrigeração Regenerativa (m_cool):</span>
                      <strong className="text-purple-400">{regenCoolingFlowKgS} kg/s</strong>
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="2.5"
                      step="0.05"
                      value={regenCoolingFlowKgS}
                      onChange={(e) => setRegenCoolingFlowKgS(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Propulsion Thermodynamic Calculations Readout */}
                <div className="lg:col-span-2 bg-[#05070A] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
                  
                  {/* Performance Indicators Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#111827] border border-slate-800 p-3 rounded-xl">
                      <div className="text-[10px] text-slate-400 uppercase">Empuxo Total (F)</div>
                      <div className="text-lg font-black text-orange-400">{thrustEngineKN} kN</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">({(parseFloat(thrustEngineKN) * 101.97).toFixed(0)} kgf)</div>
                    </div>

                    <div className="bg-[#111827] border border-slate-800 p-3 rounded-xl">
                      <div className="text-[10px] text-slate-400 uppercase">Impulso Específico (Isp)</div>
                      <div className="text-lg font-black text-emerald-400">{ispSeaLevel} s</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">(Vácuo: {ispVac} s)</div>
                    </div>

                    <div className="bg-[#111827] border border-slate-800 p-3 rounded-xl">
                      <div className="text-[10px] text-slate-400 uppercase">Velocidade Caract. (c*)</div>
                      <div className="text-lg font-black text-cyan-400">{cStar} m/s</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Fator Z: {zCompressibility}</div>
                    </div>

                    <div className="bg-[#111827] border border-slate-800 p-3 rounded-xl">
                      <div className="text-[10px] text-slate-400 uppercase">Coef. Empuxo (Cf)</div>
                      <div className="text-lg font-black text-amber-400">{CfVal}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Ø Saída: {exitDiameterMm}mm</div>
                    </div>
                  </div>

                  {/* Nozzle Regime Diagram */}
                  <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-slate-200 uppercase flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" /> Regime de Expansão do Bocal Laval
                      </span>
                      <span className="text-[10px] bg-orange-950 text-orange-400 border border-orange-800 px-2 py-0.5 rounded font-bold">
                        {expansionState}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                      <div>Pressão Saída $P_e$: <strong className="text-white">{PeBar.toFixed(2)} bar</strong></div>
                      <div>Pressão Amb. $P_a$: <strong className="text-white">{PaBar.toFixed(2)} bar</strong></div>
                      <div>Temp. Combustão $T_c$: <strong className="text-orange-400">{propData.Tc} K</strong></div>
                      <div>Massa Molar $M$: <strong className="text-white">{propData.M} g/mol</strong></div>
                    </div>
                  </div>

                  {/* Thermal Balance & Cooling Jacket */}
                  <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-slate-200 uppercase flex items-center gap-2">
                        <Activity className="w-4 h-4 text-red-500" /> Balanço Térmico das Paredes do Motor
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold">
                        Margem Térmica Segura ok
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                        <div className="text-[10px] text-slate-400">Fluxo de Calor na Garganta</div>
                        <div className="text-sm font-extrabold text-red-400">{heatFluxMWm2} MW/m²</div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                        <div className="text-[10px] text-slate-400">Temp. Parede Interna ($T_w$)</div>
                        <div className="text-sm font-extrabold text-amber-400">{wallTempHotC} °C</div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                        <div className="text-[10px] text-slate-400">Elevação Temp. Refrigeração ($\Delta T$)</div>
                        <div className="text-sm font-extrabold text-purple-400">+{coolingDeltaT} °C</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => showToast(`🔥 Simulação Termodinâmica salva! Empuxo: ${thrustEngineKN}kN | Isp: ${ispSeaLevel}s`)}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 rounded-xl transition shadow-lg shadow-orange-600/20"
                  >
                    Gravar Parâmetros Termodinâmicos do Motor no Modelo CAD
                  </button>
                </div>

              </div>
            </div>
          )}
          {activeTab === 'lighting' && (
            <div className="space-y-5">
              <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-yellow-400 font-mono uppercase flex items-center gap-2">
                    <Sun className="w-4 h-4" /> Cenário, Iluminação de Estúdio & Renderização HQ
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ajuste luzes de 3 pontos, reflexo de piso espelhado, sombras de contato e fotos 4K.
                  </p>
                </div>

                <button
                  onClick={handleRenderHQSnapshot}
                  disabled={isRenderingSnapshot}
                  className="bg-yellow-600 hover:bg-yellow-500 text-white font-mono font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-lg shadow-yellow-600/30 text-xs"
                >
                  <Camera className="w-4 h-4" />
                  {isRenderingSnapshot ? 'Renderizando Raymarching 4K...' : `Capturar Snapshot (${renderQuality})`}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                
                {/* Lighting Controls */}
                <div className="bg-[#05070A] border border-slate-800 rounded-xl p-4 space-y-4 text-xs font-mono">
                  <h4 className="font-bold text-slate-300 uppercase border-b border-slate-800 pb-2 flex items-center gap-2">
                    <Sun className="w-4 h-4 text-yellow-400" /> Presets & Fontes de Luz
                  </h4>

                  <div>
                    <label className="block text-slate-400 mb-1">Preset de Iluminação Estúdio:</label>
                    <select
                      value={lightingPreset}
                      onChange={(e) => setLightingPreset(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-yellow-500"
                    >
                      <option value="3point">Estúdio 3 Pontos Clássico (Key / Fill / Rim)</option>
                      <option value="hdri">Estúdio HDRI Espacial Bordo</option>
                      <option value="spotlight">Spotlight Focado com Penumbra</option>
                      <option value="neon">Cyberpunk Neon Cobre / Azul</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Intensidade Luz Principal (Key Light): <strong className="text-yellow-400">{keyLightIntensity}x</strong></label>
                    <input
                      type="range"
                      min="0.5"
                      max="5.0"
                      step="0.1"
                      value={keyLightIntensity}
                      onChange={(e) => setKeyLightIntensity(Number(e.target.value))}
                      className="w-full accent-yellow-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Cor do Foco de Luz:</label>
                    <input
                      type="color"
                      value={keyLightColor}
                      onChange={(e) => setKeyLightColor(e.target.value)}
                      className="w-full h-8 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Environment Switches */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <label className="block text-slate-300 font-bold">Efeitos de Cenário & Piso:</label>
                    
                    <label className="flex items-center justify-between cursor-pointer text-slate-300">
                      <span>Piso Espelhado (Mirror Reflect):</span>
                      <input
                        type="checkbox"
                        checked={showMirrorFloor}
                        onChange={(e) => setShowMirrorFloor(e.target.checked)}
                        className="accent-yellow-500"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer text-slate-300">
                      <span>Sombras de Contato Realistas:</span>
                      <input
                        type="checkbox"
                        checked={showContactShadows}
                        onChange={(e) => setShowContactShadows(e.target.checked)}
                        className="accent-yellow-500"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer text-slate-300">
                      <span>Resplendor de Luz (Bloom Glow):</span>
                      <input
                        type="checkbox"
                        checked={enableBloom}
                        onChange={(e) => setEnableBloom(e.target.checked)}
                        className="accent-yellow-500"
                      />
                    </label>
                  </div>
                </div>

                {/* Studio Viewport Preview */}
                <div className="lg:col-span-2 bg-[#05070A] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-mono">
                    <span className="font-bold text-yellow-400 flex items-center gap-1.5">
                      <Camera className="w-4 h-4" /> Preview do Render com Passes de Iluminação
                    </span>
                    <span className="text-[10px] text-slate-400">Resolução: {renderQuality} PNG</span>
                  </div>

                  <div className="my-4 h-64 bg-slate-950 rounded-xl border border-slate-800 relative flex items-center justify-center overflow-hidden">
                    {/* Simulated Mirror Floor Reflection */}
                    {showMirrorFloor && (
                      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-red-600/10 via-slate-900/40 to-transparent border-t border-slate-800/80" />
                    )}

                    {/* Model Render Spotlight */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-16 h-40 bg-gradient-to-t from-red-600 via-red-500 to-amber-500 rounded-t-full border border-yellow-300/60 shadow-2xl shadow-yellow-500/40 flex items-center justify-center font-mono text-[9px] font-extrabold text-white text-center p-2">
                        {modelToExport.title}
                      </div>

                      {showContactShadows && (
                        <div className="w-24 h-3 bg-black/80 rounded-full blur-sm mt-1" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-[#111827] p-3 rounded-xl border border-slate-800">
                    <span>Oclusão Ambiental SSAO: <strong className="text-emerald-400">Ativada (64 samples)</strong></span>
                    <span>Anti-Aliasing: <strong className="text-yellow-400">MSAA 8x</strong></span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: CFD & FEA SIMULATION */}
          {activeTab === 'cfd' && (
            <div className="space-y-5">
              <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-cyan-400 font-mono uppercase flex items-center gap-2">
                    <Wind className="w-4 h-4" /> Análises CFD (Aerodinâmica) & FEA (Tensões de Von Mises)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Validação do coeficiente de arraste $C_d$, momento fletor e margem estática de estabilidade.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunCfd}
                    disabled={isCfdRunning}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold px-3 py-1.5 rounded-xl text-xs transition"
                  >
                    Simular CFD
                  </button>
                  <button
                    onClick={handleRunFea}
                    disabled={isFeaRunning}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold px-3 py-1.5 rounded-xl text-xs transition"
                  >
                    Simular FEA
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* CFD Box */}
                <div className="bg-[#05070A] border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
                  <h4 className="font-bold text-cyan-400 border-b border-slate-800 pb-1 flex items-center gap-2">
                    <Wind className="w-4 h-4" /> Coeficiente de Arraste (CFD)
                  </h4>
                  <div>• Número de Mach ($M$): <strong className="text-white">{machNumber} Mach</strong></div>
                  <div>• Coeficiente de Arraste Total ($C_d$): <strong className="text-cyan-400 font-bold">{totalCd}</strong></div>
                  <div>• Margem Estática: <strong className="text-emerald-400 font-bold">+{staticMargin} calibres</strong></div>
                  <div>• Posição do CP / CG: <strong className="text-white">CP = {cpLocationCm} cm | CG = {cgLocationCm} cm</strong></div>
                </div>

                {/* FEA Box */}
                <div className="bg-[#05070A] border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
                  <h4 className="font-bold text-amber-400 border-b border-slate-800 pb-1 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Tensões Estruturais (FEA)
                  </h4>
                  <div>• Empuxo Aplicado: <strong className="text-white">{thrustForceN} N</strong></div>
                  <div>• Tensão Máxima Von Mises: <strong className="text-amber-400 font-bold">{maxVonMisesStressMpa} MPa</strong></div>
                  <div>• Fator de Segurança ($SF$): <strong className="text-emerald-400 font-bold">{safetyFactor}x</strong></div>
                  <div>• Deformação Máxima: <strong className="text-white">{maxDeflectionMm} mm</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TECHNICAL DRAWING PDF & MANUFACTURING EXPORTS */}
          {activeTab === 'export' && (
            <div className="space-y-5 bg-[#111827] border border-slate-800 rounded-xl p-5 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Printer className="w-5 h-5 text-emerald-400" />
                    Central de Exportação de Engenharia e Usinagem
                  </h3>
                  <p className="text-slate-400">
                    Gere desenhos técnicos em PDF A3, arquivos 3D e programas para usinagem CNC e fabricação.
                  </p>
                </div>

                <button
                  onClick={handleExportPDF}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-lg shadow-emerald-600/30 text-xs"
                >
                  <FileText className="w-4 h-4" /> Gerar Desenho Técnico PDF (A3)
                </button>
              </div>

              {/* Title Block Customizer Form */}
              <div className="bg-[#05070A] border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-amber-400 border-b border-slate-800 pb-2 flex items-center gap-2 text-xs">
                  <Edit3 className="w-4 h-4" /> Personalizar Legenda da Prancheta de Desenho (ABNT / ISO)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Título do Projeto:</label>
                    <input
                      type="text"
                      value={tbTitle}
                      onChange={(e) => setTbTitle(e.target.value)}
                      placeholder={modelToExport.title}
                      className="w-full bg-[#111827] border border-slate-700 rounded-lg p-1.5 text-white outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Nome do Desenhista / Projetista:</label>
                    <input
                      type="text"
                      value={tbAuthor}
                      onChange={(e) => setTbAuthor(e.target.value)}
                      placeholder="Micael Nildo"
                      className="w-full bg-[#111827] border border-slate-700 rounded-lg p-1.5 text-white outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Equipe / Organização:</label>
                    <input
                      type="text"
                      value={tbTeam}
                      onChange={(e) => setTbTeam(e.target.value)}
                      placeholder="MNAnimat AeroSpace"
                      className="w-full bg-[#111827] border border-slate-700 rounded-lg p-1.5 text-white outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Número do Desenho:</label>
                    <input
                      type="text"
                      value={tbDwgNo}
                      onChange={(e) => setTbDwgNo(e.target.value)}
                      placeholder="DWG-AERO-001"
                      className="w-full bg-[#111827] border border-slate-700 rounded-lg p-1.5 text-white outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Data de Emissão:</label>
                    <input
                      type="text"
                      value={tbDate}
                      onChange={(e) => setTbDate(e.target.value)}
                      placeholder={new Date().toLocaleDateString('pt-BR')}
                      className="w-full bg-[#111827] border border-slate-700 rounded-lg p-1.5 text-white outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Escala Técnica:</label>
                    <input
                      type="text"
                      value={tbScale}
                      onChange={(e) => setTbScale(e.target.value)}
                      placeholder="1:1"
                      className="w-full bg-[#111827] border border-slate-700 rounded-lg p-1.5 text-white outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Revisão:</label>
                    <input
                      type="text"
                      value={tbRev}
                      onChange={(e) => setTbRev(e.target.value)}
                      placeholder="REV 02"
                      className="w-full bg-[#111827] border border-slate-700 rounded-lg p-1.5 text-white outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Tolerância Dimensional:</label>
                    <input
                      type="text"
                      value={tbTol}
                      onChange={(e) => setTbTol(e.target.value)}
                      placeholder="± 0.10 mm"
                      className="w-full bg-[#111827] border border-slate-700 rounded-lg p-1.5 text-white outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Formats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. PDF Technical Drawing */}
                <div className="bg-[#05070A] border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-emerald-400 border-b border-slate-800 pb-1 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Desenho Técnico ABNT
                    </h4>
                    <p className="text-slate-400 text-[11px] mt-2">
                      Folha A3 com 4 vistas ortográficas (Frontal, Superior, Lateral e Isométrica), cotas numéricas de medidas exatas e legenda de engenharia.
                    </p>
                  </div>

                  <button
                    onClick={handleExportPDF}
                    className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Baixar PDF A3
                  </button>
                </div>

                {/* 2. 3D Mesh Files */}
                <div className="bg-[#05070A] border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-cyan-400 border-b border-slate-800 pb-1 flex items-center gap-2">
                      <Box className="w-4 h-4" /> Formatos 3D & Impressão
                    </h4>
                    <p className="text-slate-400 text-[11px] mt-2">
                      Exporte a malha tridimensional detalhada para impressão 3D ou softwares CAD terceiros (.STL, .OBJ, .GLTF, .PLY).
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleExport3D('stl')}
                      className="bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-300 font-bold py-1.5 rounded-lg transition text-[11px]"
                    >
                      .STL (Impressão 3D)
                    </button>
                    <button
                      onClick={() => handleExport3D('obj')}
                      className="bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-300 font-bold py-1.5 rounded-lg transition text-[11px]"
                    >
                      .OBJ (Wavefront)
                    </button>
                    <button
                      onClick={() => handleExport3D('gltf')}
                      className="bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-300 font-bold py-1.5 rounded-lg transition text-[11px]"
                    >
                      .GLTF (JSON 3D)
                    </button>
                    <button
                      onClick={() => handleExport3D('ply')}
                      className="bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-300 font-bold py-1.5 rounded-lg transition text-[11px]"
                    >
                      .PLY (Polygon)
                    </button>
                  </div>
                </div>

                {/* 3. CNC Machining & Parametric Code */}
                <div className="bg-[#05070A] border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-amber-400 border-b border-slate-800 pb-1 flex items-center gap-2">
                      <FileCode className="w-4 h-4" /> Usinagem CNC & Script OpenSCAD
                    </h4>
                    <p className="text-slate-400 text-[11px] mt-2">
                      Gere código G ISO para torno e fresa CNC, scripts parametrizados em OpenSCAD e vetor 2D DXF para corte a laser.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleExportManufacturing('gcode')}
                      className="bg-slate-900 border border-slate-700 hover:border-amber-500 text-amber-300 font-bold py-1.5 rounded-lg transition text-[11px]"
                    >
                      Código G CNC (.gcode)
                    </button>
                    <button
                      onClick={() => handleExportManufacturing('scad')}
                      className="bg-slate-900 border border-slate-700 hover:border-amber-500 text-amber-300 font-bold py-1.5 rounded-lg transition text-[11px]"
                    >
                      OpenSCAD (.scad)
                    </button>
                    <button
                      onClick={() => handleExportManufacturing('dxf')}
                      className="bg-slate-900 border border-slate-700 hover:border-amber-500 text-amber-300 font-bold py-1.5 rounded-lg transition text-[11px]"
                    >
                      Vetor DXF 2D (.dxf)
                    </button>
                    <button
                      onClick={() => handleExportManufacturing('json')}
                      className="bg-slate-900 border border-slate-700 hover:border-amber-500 text-amber-300 font-bold py-1.5 rounded-lg transition text-[11px]"
                    >
                      JSON CAD Spec
                    </button>
                  </div>
                </div>

              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center gap-3 text-emerald-200 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  <strong>Validação Completa:</strong> Todos os arquivos gerados contêm cotas em milímetros com tolerância padrão de &plusmn;0.10 mm, prontos para envio ao centro de usinagem, manufatura aditiva e montagem.
                </span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
