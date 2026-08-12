import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { RocketParams } from '../types';
import { calculatePreciseTrajectory, TrajectorySummary } from '../utils/rocketPhysics';
import { Rocket3DViewer } from './Rocket3DViewer';
import { FlightSimulator3DTrajectory } from './FlightSimulator3DTrajectory';
import { SimulationHistoryPanel } from './SimulationHistoryPanel';
import { SimulationHistoryItem } from '../types';
import {
  Rocket,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  TrendingUp,
  Gauge,
  AlertTriangle,
  ShieldCheck,
  Download,
  FileText,
  Wind,
  Compass,
  Cpu,
  Calculator,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
  MapPin,
  CheckCircle2,
  XCircle,
  Maximize2,
  X,
  Thermometer,
  Navigation,
  Activity
} from 'lucide-react';
import { getStoredFlightParams, saveStoredFlightParams } from '../utils/offlineCache';

interface AtmosphericControlPanelProps {
  params: RocketParams;
  setParams: React.Dispatch<React.SetStateAction<RocketParams>>;
  trajectorySummary: TrajectorySummary;
}

const AtmosphericControlPanel: React.FC<AtmosphericControlPanelProps> = ({
  params,
  setParams,
  trajectorySummary
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const getCardinalName = (deg: number): string => {
    const normalized = ((deg % 360) + 360) % 360;
    if (normalized >= 337.5 || normalized < 22.5) return 'Norte (N)';
    if (normalized >= 22.5 && normalized < 67.5) return 'Nordeste (NE)';
    if (normalized >= 67.5 && normalized < 112.5) return 'Leste (E)';
    if (normalized >= 112.5 && normalized < 157.5) return 'Sudeste (SE)';
    if (normalized >= 157.5 && normalized < 202.5) return 'Sul (S)';
    if (normalized >= 202.5 && normalized < 247.5) return 'Sudoeste (SW)';
    if (normalized >= 247.5 && normalized < 292.5) return 'Oeste (W)';
    return 'Noroeste (NW)';
  };

  const groundTempK = (params.temperatureGround || 25) + 273.15;
  const groundPressPa = (params.pressureGround || 1013.25) * 100;
  const rho0 = groundPressPa / (287.058 * groundTempK);
  const soundSpeed0 = Math.sqrt(1.4 * 287.058 * groundTempK);

  const windMps = ((params.windSpeed || 0) * 1000) / 3600;
  const windDirRad = (((params.windDirection ?? 90) - 90) * Math.PI) / 180;
  const windAxialMps = windMps * Math.cos(windDirRad);
  const windLateralMps = windMps * Math.sin(windDirRad);

  return (
    <div className="bg-[#111827] dark:bg-[#111827] light:bg-white border border-blue-500/30 rounded-xl p-4 shadow-xl space-y-4 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400 border border-blue-500/30">
            <Wind className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 dark:text-white light:text-slate-900 flex items-center gap-2 font-italic-title">
              Painel de Configuração de Variáveis Atmosféricas & Ventos (ISA)
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-600">
              Ajuste a velocidade do vento, direção angular (Rosa dos Ventos), temperatura e pressão ISA para recalcular a trajetória e a deriva balística em tempo real.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-mono font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-slate-900 dark:bg-slate-900 light:bg-slate-100 px-2.5 py-1 rounded border border-slate-800 cursor-pointer"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>{isOpen ? 'Ocultar Painel Atmosférico' : 'Configurar Ventos & Atmosfera'}</span>
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-8 space-y-4">
              {/* Wind Speed */}
              <div className="bg-[#05070A] dark:bg-[#05070A] light:bg-slate-50 p-3.5 rounded-lg border border-slate-800 dark:border-slate-800 light:border-slate-300 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <Wind className="w-4 h-4" />
                    Velocidade do Vento no Solo
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-200 dark:text-slate-200 light:text-slate-800 font-bold">
                      {params.windSpeed} km/h
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      ({windMps.toFixed(1)} m/s)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="1"
                    value={params.windSpeed}
                    onChange={(e) => setParams((prev) => ({ ...prev, windSpeed: parseFloat(e.target.value) || 0 }))}
                    className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={params.windSpeed}
                    onChange={(e) => setParams((prev) => ({ ...prev, windSpeed: parseFloat(e.target.value) || 0 }))}
                    className="w-20 bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded px-2 py-1 text-xs text-center font-mono font-bold text-cyan-300 outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-mono mr-1">Presets:</span>
                  {[
                    { label: 'Calmo (0 km/h)', val: 0 },
                    { label: 'Brisa (10 km/h)', val: 10 },
                    { label: 'Moderado (25 km/h)', val: 25 },
                    { label: 'Forte (40 km/h)', val: 40 },
                    { label: 'Alerta AEB (60 km/h)', val: 60 }
                  ].map((p) => (
                    <button
                      key={p.val}
                      onClick={() => setParams((prev) => ({ ...prev, windSpeed: p.val }))}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border transition cursor-pointer ${
                        params.windSpeed === p.val
                          ? 'bg-cyan-600 text-white border-cyan-400 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wind Direction */}
              <div className="bg-[#05070A] dark:bg-[#05070A] light:bg-slate-50 p-3.5 rounded-lg border border-slate-800 dark:border-slate-800 light:border-slate-300 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-amber-400" />
                    Direção do Vento (Rosa dos Ventos / Azimute)
                  </span>
                  <span className="text-amber-300 font-bold">
                    {params.windDirection}° - {getCardinalName(params.windDirection ?? 90)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={params.windDirection ?? 90}
                    onChange={(e) => setParams((prev) => ({ ...prev, windDirection: parseFloat(e.target.value) || 0 }))}
                    className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={params.windDirection ?? 90}
                    onChange={(e) => setParams((prev) => ({ ...prev, windDirection: parseFloat(e.target.value) || 0 }))}
                    className="w-20 bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded px-2 py-1 text-xs text-center font-mono font-bold text-amber-300 outline-none"
                  />
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 pt-1">
                  {[
                    { label: 'N (0°)', deg: 0 },
                    { label: 'NE (45°)', deg: 45 },
                    { label: 'E (90°)', deg: 90 },
                    { label: 'SE (135°)', deg: 135 },
                    { label: 'S (180°)', deg: 180 },
                    { label: 'SW (225°)', deg: 225 },
                    { label: 'W (270°)', deg: 270 },
                    { label: 'NW (315°)', deg: 315 }
                  ].map((card) => (
                    <button
                      key={card.deg}
                      onClick={() => setParams((prev) => ({ ...prev, windDirection: card.deg }))}
                      className={`text-[10px] font-mono py-1 rounded border transition text-center cursor-pointer ${
                        params.windDirection === card.deg
                          ? 'bg-amber-600 text-white border-amber-400 font-bold shadow'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {card.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Altitude MSL, Temperature & Pressure */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Altitude ASL (MSL) */}
                <div className="bg-[#05070A] dark:bg-[#05070A] light:bg-slate-50 p-3.5 rounded-lg border border-slate-800 dark:border-slate-800 light:border-slate-300 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-bold text-purple-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Altitude Campo (MSL)
                    </span>
                    <span className="text-purple-300 font-bold">{params.elevationMSL || 0} m</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4000"
                    step="10"
                    value={params.elevationMSL || 0}
                    onChange={(e) => setParams((prev) => ({ ...prev, elevationMSL: parseFloat(e.target.value) || 0 }))}
                    className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-slate-400 pt-0.5">
                    <button onClick={() => setParams((prev) => ({ ...prev, elevationMSL: 0 }))} className="hover:text-white cursor-pointer">Nível do Mar (0m)</button>
                    <button onClick={() => setParams((prev) => ({ ...prev, elevationMSL: 50 }))} className="hover:text-white cursor-pointer">Alcântara (50m)</button>
                    <button onClick={() => setParams((prev) => ({ ...prev, elevationMSL: 800 }))} className="hover:text-white cursor-pointer">SP (800m)</button>
                  </div>
                </div>

                {/* Temperature */}
                <div className="bg-[#05070A] dark:bg-[#05070A] light:bg-slate-50 p-3.5 rounded-lg border border-slate-800 dark:border-slate-800 light:border-slate-300 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5" /> Temperatura Solo
                    </span>
                    <span className="text-emerald-300 font-bold">{params.temperatureGround}°C</span>
                  </div>
                  <input
                    type="range"
                    min="-10"
                    max="50"
                    step="1"
                    value={params.temperatureGround}
                    onChange={(e) => setParams((prev) => ({ ...prev, temperatureGround: parseFloat(e.target.value) || 0 }))}
                    className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-slate-400 pt-0.5">
                    <button onClick={() => setParams((prev) => ({ ...prev, temperatureGround: 10 }))} className="hover:text-white cursor-pointer">10°C (Frio)</button>
                    <button onClick={() => setParams((prev) => ({ ...prev, temperatureGround: 15 }))} className="hover:text-white cursor-pointer">15°C (ISA)</button>
                    <button onClick={() => setParams((prev) => ({ ...prev, temperatureGround: 25 }))} className="hover:text-white cursor-pointer">25°C (Trop)</button>
                  </div>
                </div>

                {/* Pressure */}
                <div className="bg-[#05070A] dark:bg-[#05070A] light:bg-slate-50 p-3.5 rounded-lg border border-slate-800 dark:border-slate-800 light:border-slate-300 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-bold text-blue-400 flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5" /> Pressão Solo
                    </span>
                    <span className="text-blue-300 font-bold">{params.pressureGround} hPa</span>
                  </div>
                  <input
                    type="range"
                    min="850"
                    max="1080"
                    step="1"
                    value={params.pressureGround}
                    onChange={(e) => setParams((prev) => ({ ...prev, pressureGround: parseFloat(e.target.value) || 1013.25 }))}
                    className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-slate-400 pt-0.5">
                    <button onClick={() => setParams((prev) => ({ ...prev, pressureGround: 900 }))} className="hover:text-white cursor-pointer">900 hPa</button>
                    <button onClick={() => setParams((prev) => ({ ...prev, pressureGround: 1013.25 }))} className="hover:text-white cursor-pointer">1013 ISA</button>
                    <button onClick={() => setParams((prev) => ({ ...prev, pressureGround: 1020 }))} className="hover:text-white cursor-pointer">1020 hPa</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Compass Vector & ISA Metrics */}
            <div className="lg:col-span-4 bg-[#05070A] dark:bg-[#05070A] light:bg-slate-50 p-4 rounded-lg border border-slate-800 dark:border-slate-800 light:border-slate-300 flex flex-col items-center justify-between space-y-3 h-full">
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                <Compass className="w-4 h-4" /> Bússola & Vetor de Vento
              </span>

              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="#090d16" stroke="#334155" strokeWidth="2" />
                  <circle cx="60" cy="60" r="44" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />

                  <text x="60" y="16" fill="#ef4444" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>
                  <text x="60" y="112" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">S</text>
                  <text x="108" y="63" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">E</text>
                  <text x="12" y="63" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">W</text>

                  <line x1="60" y1="60" x2="100" y2="60" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 1" />

                  <g transform={`rotate(${params.windDirection ?? 90}, 60, 60)`}>
                    <line x1="60" y1="92" x2="60" y2="22" stroke="#f59e0b" strokeWidth="3" />
                    <polygon points="60,14 54,26 66,26" fill="#f59e0b" />
                    <circle cx="60" cy="60" r="4" fill="#ef4444" />
                  </g>
                </svg>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-mono font-bold text-amber-300 bg-slate-900/90 px-1.5 py-0.5 rounded border border-amber-500/40">
                    {params.windSpeed} km/h
                  </span>
                </div>
              </div>

              <div className="w-full space-y-1.5 text-[10px] font-mono border-t border-slate-800 pt-2">
                <div className="flex justify-between text-slate-300">
                  <span>Densidade do Ar (ρ₀):</span>
                  <strong className="text-emerald-400">{rho0.toFixed(3)} kg/m³</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Velocidade Som (a₀):</span>
                  <strong className="text-blue-400">{soundSpeed0.toFixed(1)} m/s</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Vento Axial / Lateral:</span>
                  <strong className="text-cyan-400">{windAxialMps.toFixed(1)} / {windLateralMps.toFixed(1)} m/s</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Deriva de Pouso Est.:</span>
                  <strong className="text-amber-400">{trajectorySummary.driftDistance} m</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface AdvancedThrustCdStabilityPanelProps {
  params: RocketParams;
  setParams: React.Dispatch<React.SetStateAction<RocketParams>>;
  trajectorySummary: TrajectorySummary;
}

const AdvancedThrustCdStabilityPanel: React.FC<AdvancedThrustCdStabilityPanelProps> = ({
  params,
  setParams,
  trajectorySummary
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const diameterCm = (params.diameter || 0.082) * 100;
  const deltaXCm = params.cpPosition - params.cgPosition;
  const staticMargin = diameterCm > 0 ? deltaXCm / diameterCm : 0;

  let stabilityStatus = {
    label: 'Idealmente Estável (Padrão BAR-AEB)',
    badgeClass: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50',
    colorHex: '#10b981',
    description: 'A margem estática está na faixa ideal (1.0 a 2.5 calibres). O minifoguete manterá estabilidade passiva sem caturro ou giros indesejados.'
  };

  if (staticMargin < 1.0) {
    stabilityStatus = {
      label: 'SUB-ESTÁVEL / INSTÁVEL (Risco de Tombamento)',
      badgeClass: 'bg-red-950/90 text-red-300 border-red-500/50 animate-pulse',
      colorHex: '#ef4444',
      description: 'CUIDADO: A distância CP - CG é menor que 1.0 calibre. O minifoguete pode sofrer instabilidade grave, tombamento na saída de rampa e voo caótico!'
    };
  } else if (staticMargin > 2.5) {
    stabilityStatus = {
      label: 'SUPER-ESTÁVEL (Sensibilidade a Vento Cruzado)',
      badgeClass: 'bg-amber-950/90 text-amber-300 border-amber-500/50',
      colorHex: '#f59e0b',
      description: 'ALERTA: Margem estática > 2.5 calibres. O minifoguete responderá excessivamente ao vento cruzado, guinando acentuadamente contra o vento (Weathercocking).'
    };
  }

  const propMassKg = Math.max(0.001, params.massInitial - params.massFinal);
  const avgThrustN = params.burnTime > 0 ? params.motorImpulse / params.burnTime : 0;
  const specificImpulseSec = params.motorImpulse / (propMassKg * 9.80665);
  const peakTransonicCd = (params.cd * 1.85 + 0.12).toFixed(2);

  return (
    <div className="bg-[#111827] dark:bg-[#111827] light:bg-white border border-cyan-500/40 rounded-xl p-4 shadow-xl space-y-4 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-600/20 rounded-lg text-cyan-400 border border-cyan-500/30">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 dark:text-white light:text-slate-900 flex items-center gap-2 font-italic-title">
              Controles Avançados: Arraste (Cd), Empuxo do Motor & Estabilidade Estática
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-600">
              Ajuste fino do coeficiente de arrasto, curva de empuxo do motor e margem estática (CG vs CP).
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-slate-900 dark:bg-slate-900 light:bg-slate-100 px-2.5 py-1 rounded border border-slate-800 cursor-pointer"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>{isOpen ? 'Ocultar Controles Avançados' : 'Ajustar Cd, Empuxo & Estabilidade'}</span>
        </button>
      </div>

      {isOpen && (
        <div className="space-y-5 text-xs font-mono">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5">
            {/* PANEL 1: DRAG COEFFICIENT (Cd) CONTROL */}
            <div className="bg-[#05070A] dark:bg-[#05070A] light:bg-slate-50 p-4 rounded-lg border border-slate-800 dark:border-slate-800 light:border-slate-300 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5 text-sm">
                  <Gauge className="w-4 h-4" />
                  Coeficiente de Arrasto C_d
                </span>
                <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-bold">
                  Cd₀ = {params.cd.toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 flex justify-between">
                  <span>Arrasto Subsônico Base (Cd₀):</span>
                  <span className="font-bold text-cyan-300">{params.cd.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0.15"
                  max="1.20"
                  step="0.01"
                  value={params.cd}
                  onChange={(e) => setParams({ ...params, cd: parseFloat(e.target.value) || 0.3 })}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0.15 (Super Aerodinâmico)</span>
                  <span>1.20 (Alta Resistência)</span>
                </div>
              </div>

              {/* Aerodynamic Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] text-slate-400 font-bold block">Presets Aerodinâmicos:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setParams({ ...params, cd: 0.28 })}
                    className={`p-1.5 rounded text-left border text-[10px] transition-all cursor-pointer ${
                      params.cd === 0.28
                        ? 'bg-cyan-900/60 border-cyan-400 text-cyan-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    🚀 Ogiva Polida (0.28)
                  </button>
                  <button
                    onClick={() => setParams({ ...params, cd: 0.42 })}
                    className={`p-1.5 rounded text-left border text-[10px] transition-all cursor-pointer ${
                      params.cd === 0.42
                        ? 'bg-cyan-900/60 border-cyan-400 text-cyan-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    🎯 Padrão BAR-AEB (0.42)
                  </button>
                  <button
                    onClick={() => setParams({ ...params, cd: 0.52 })}
                    className={`p-1.5 rounded text-left border text-[10px] transition-all cursor-pointer ${
                      params.cd === 0.52
                        ? 'bg-cyan-900/60 border-cyan-400 text-cyan-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    📐 Cônica Rugosa (0.52)
                  </button>
                  <button
                    onClick={() => setParams({ ...params, cd: 0.68 })}
                    className={`p-1.5 rounded text-left border text-[10px] transition-all cursor-pointer ${
                      params.cd === 0.68
                        ? 'bg-cyan-900/60 border-cyan-400 text-cyan-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    📷 Câmera Bordo (0.68)
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Pico Transônico (Mach 1.05):</span>
                  <span className="font-bold text-amber-400">Cd_peak ≈ {peakTransonicCd}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Calibre do Foguete (d):</span>
                  <span className="font-bold text-slate-200">{diameterCm.toFixed(1)} cm ({(params.diameter * 1000).toFixed(0)} mm)</span>
                </div>
              </div>
            </div>

            {/* PANEL 2: MOTOR THRUST & IGNITION CONTROL */}
            <div className="bg-[#05070A] dark:bg-[#05070A] light:bg-slate-50 p-4 rounded-lg border border-slate-800 dark:border-slate-800 light:border-slate-300 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
                  <Rocket className="w-4 h-4" />
                  Empuxo & Propulsão
                </span>
                <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-bold">
                  {params.motorThrust} N Pico
                </span>
              </div>

              {/* Thrust Slider */}
              <div>
                <label className="block text-slate-300 mb-1 flex justify-between">
                  <span>Empuxo Máximo/Pico (F_T):</span>
                  <span className="font-bold text-amber-300">{params.motorThrust} N</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="1500"
                  step="5"
                  value={params.motorThrust}
                  onChange={(e) => setParams({ ...params, motorThrust: parseFloat(e.target.value) || 10 })}
                  className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              {/* Impulse Slider */}
              <div>
                <label className="block text-slate-300 mb-1 flex justify-between">
                  <span>Impulso Total (I_tot):</span>
                  <span className="font-bold text-amber-300">{params.motorImpulse} N·s</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="2000"
                  step="5"
                  value={params.motorImpulse}
                  onChange={(e) => setParams({ ...params, motorImpulse: parseFloat(e.target.value) || 5 })}
                  className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              {/* Burn Time Slider */}
              <div>
                <label className="block text-slate-300 mb-1 flex justify-between">
                  <span>Tempo de Queima (t_burn):</span>
                  <span className="font-bold text-amber-300">{params.burnTime.toFixed(2)} s</span>
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="8.0"
                  step="0.1"
                  value={params.burnTime}
                  onChange={(e) => setParams({ ...params, burnTime: parseFloat(e.target.value) || 0.5 })}
                  className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              {/* Motor Presets */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-bold block">Presets de Motores Comerciais:</span>
                <div className="grid grid-cols-3 gap-1 text-[10px]">
                  <button
                    onClick={() => setParams({ ...params, motorThrust: 30, motorImpulse: 17.5, burnTime: 1.65 })}
                    className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:border-amber-500/50 cursor-pointer"
                  >
                    Estes D12
                  </button>
                  <button
                    onClick={() => setParams({ ...params, motorThrust: 52, motorImpulse: 72, burnTime: 2.25 })}
                    className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:border-amber-500/50 cursor-pointer"
                  >
                    Cesaroni F32
                  </button>
                  <button
                    onClick={() => setParams({ ...params, motorThrust: 210, motorImpulse: 260, burnTime: 2.3 })}
                    className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:border-amber-500/50 cursor-pointer"
                  >
                    Minifoguete G64
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/80 p-2 rounded border border-slate-800 flex justify-between text-[11px] text-slate-400">
                <span>Empuxo Médio F_avg: <strong className="text-amber-300">{avgThrustN.toFixed(1)} N</strong></span>
                <span>I_sp: <strong className="text-amber-300">{specificImpulseSec.toFixed(0)} s</strong></span>
              </div>
            </div>

            {/* PANEL 3: STABILITY ANALYSIS (CG vs CP & STATIC MARGIN) */}
            <div className="bg-[#05070A] dark:bg-[#05070A] light:bg-slate-50 p-4 rounded-lg border border-slate-800 dark:border-slate-800 light:border-slate-300 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  Estabilidade Estática (CG vs CP)
                </span>
                <span className={`px-2 py-0.5 rounded font-bold border text-[11px] ${stabilityStatus.badgeClass}`}>
                  SM = {staticMargin.toFixed(2)} cal
                </span>
              </div>

              {/* Status Badge */}
              <div className={`p-2.5 rounded border ${stabilityStatus.badgeClass} space-y-1`}>
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <span>{stabilityStatus.label}</span>
                </div>
                <p className="text-[10.5px] leading-relaxed opacity-90">{stabilityStatus.description}</p>
              </div>

              {/* Sliders for CG & CP */}
              <div className="space-y-2">
                <div>
                  <label className="block text-slate-300 flex justify-between">
                    <span>Centro de Gravidade (CG):</span>
                    <span className="font-bold text-blue-400">{params.cgPosition} cm</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="150"
                    step="1"
                    value={params.cgPosition}
                    onChange={(e) => setParams({ ...params, cgPosition: parseFloat(e.target.value) || 10 })}
                    className="w-full accent-blue-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 flex justify-between">
                    <span>Centro de Pressão Barrowman (CP):</span>
                    <span className="font-bold text-amber-400">{params.cpPosition} cm</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="150"
                    step="1"
                    value={params.cpPosition}
                    onChange={(e) => setParams({ ...params, cpPosition: parseFloat(e.target.value) || 20 })}
                    className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Rocket Stability Schematic Diagram */}
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Esquema de Posição Relativa:</span>
                  <span>Distância ΔX = {(params.cpPosition - params.cgPosition).toFixed(1)} cm</span>
                </div>

                {/* Visual Bar */}
                <div className="relative w-full h-8 bg-slate-900 rounded border border-slate-800 overflow-hidden flex items-center px-2">
                  {/* Ideal Zone Highlight */}
                  <div className="absolute top-0 bottom-0 left-1/4 right-1/4 bg-emerald-500/10 border-x border-emerald-500/30" />

                  {/* Rocket Nose Tip */}
                  <div className="text-[9px] font-bold text-slate-500 mr-2">O (Coifa)</div>

                  {/* CG Pin */}
                  <div
                    className="absolute top-1 bottom-1 w-1 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50"
                    style={{ left: `${Math.min(85, Math.max(10, (params.cgPosition / 100) * 80))}%` }}
                    title={`CG: ${params.cgPosition} cm`}
                  >
                    <span className="absolute -top-3 text-[9px] font-bold text-blue-400 bg-slate-900 px-1 rounded border border-blue-800">
                      CG
                    </span>
                  </div>

                  {/* CP Pin */}
                  <div
                    className="absolute top-1 bottom-1 w-1 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/50"
                    style={{ left: `${Math.min(90, Math.max(15, (params.cpPosition / 100) * 80))}%` }}
                    title={`CP: ${params.cpPosition} cm`}
                  >
                    <span className="absolute -bottom-3 text-[9px] font-bold text-amber-400 bg-slate-900 px-1 rounded border border-amber-800">
                      CP
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                  <span>Ideal BAR-AEB: 1.0 - 2.5 cal</span>
                  <span className="font-bold text-slate-200">Margem Atual: {staticMargin.toFixed(2)} cal</span>
                </div>
              </div>
            </div>

            {/* PANEL 4: FINS (ALETAS) */}
            <div className="bg-[#05070A] dark:bg-[#05070A] light:bg-slate-50 p-4 rounded-lg border border-slate-800 dark:border-slate-800 light:border-slate-300 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-bold text-indigo-400 flex items-center gap-1.5 text-sm">
                  <Layers className="w-4 h-4" />
                  Aletas & Aerodinâmica
                </span>
              </div>

              {/* Span Slider */}
              <div>
                <label className="block text-slate-300 mb-1 flex justify-between">
                  <span>Envergadura (Span):</span>
                  <span className="font-bold text-indigo-300">{params.finSpan} cm</span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="20"
                  step="0.5"
                  value={params.finSpan}
                  onChange={(e) => setParams({ ...params, finSpan: parseFloat(e.target.value) || 10 })}
                  className="w-full accent-indigo-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              {/* Angle of Attack Slider */}
              <div>
                <label className="block text-slate-300 mb-1 flex justify-between">
                  <span>Ângulo de Ataque:</span>
                  <span className="font-bold text-indigo-300">{params.finAngleOfAttack}°</span>
                </label>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.5"
                  value={params.finAngleOfAttack}
                  onChange={(e) => setParams({ ...params, finAngleOfAttack: parseFloat(e.target.value) || 0 })}
                  className="w-full accent-indigo-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              {/* Fin Shape Toggle */}
              <div>
                <label className="block text-slate-300 mb-2">
                  <span>Formato (Shape):</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setParams({ ...params, finShape: 'trapezoidal' })}
                    className={`flex-1 p-1.5 rounded border text-[10px] transition-all cursor-pointer ${
                      params.finShape === 'trapezoidal'
                        ? 'bg-indigo-900/60 border-indigo-400 text-indigo-200 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    Trapezoidal
                  </button>
                  <button
                    onClick={() => setParams({ ...params, finShape: 'elliptical' })}
                    className={`flex-1 p-1.5 rounded border text-[10px] transition-all cursor-pointer ${
                      params.finShape === 'elliptical'
                        ? 'bg-indigo-900/60 border-indigo-400 text-indigo-200 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    Elíptica
                  </button>
                </div>
              </div>
            </div>

            {/* PANEL 5: ESTRUTURA DO FOGUETE */}
            <div className="bg-[#05070A] dark:bg-[#05070A] light:bg-slate-50 p-4 rounded-lg border border-slate-800 dark:border-slate-800 light:border-slate-300 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-bold text-pink-400 flex items-center gap-1.5 text-sm">
                  <Rocket className="w-4 h-4" />
                  Estrutura do Foguete
                </span>
              </div>

              {/* Nose Length */}
              <div>
                <label className="block text-slate-300 mb-1 flex justify-between items-center">
                  <span>Tam. Coifa (cm):</span>
                  <input
                    type="number"
                    value={params.noseLength}
                    onChange={(e) => setParams({ ...params, noseLength: parseFloat(e.target.value) || 0 })}
                    className="w-16 bg-slate-900 border border-slate-700 text-pink-300 font-bold px-1 py-0.5 rounded text-right text-xs"
                  />
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={params.noseLength}
                  onChange={(e) => setParams({ ...params, noseLength: parseFloat(e.target.value) || 40 })}
                  className="w-full accent-pink-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              {/* Body Length */}
              <div>
                <label className="block text-slate-300 mb-1 flex justify-between items-center">
                  <span>Tam. Tubo (cm):</span>
                  <input
                    type="number"
                    value={params.bodyLength}
                    onChange={(e) => setParams({ ...params, bodyLength: parseFloat(e.target.value) || 0 })}
                    className="w-16 bg-slate-900 border border-slate-700 text-pink-300 font-bold px-1 py-0.5 rounded text-right text-xs"
                  />
                </label>
                <input
                  type="range"
                  min="20"
                  max="300"
                  step="1"
                  value={params.bodyLength}
                  onChange={(e) => setParams({ ...params, bodyLength: parseFloat(e.target.value) || 100 })}
                  className="w-full accent-pink-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              {/* Nose Shape Toggle */}
              <div>
                <label className="block text-slate-300 mb-2">
                  <span>Formato da Coifa:</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['parabolic', 'conical', 'ogive', 'vonkarman'].map((shape) => (
                    <button
                      key={shape}
                      onClick={() => setParams({ ...params, noseShape: shape as any })}
                      className={`p-1.5 rounded border text-[10px] transition-all cursor-pointer ${
                        params.noseShape === shape
                          ? 'bg-pink-900/60 border-pink-400 text-pink-200 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {shape === 'parabolic' ? 'Parabólica' : shape === 'conical' ? 'Cônica' : shape === 'ogive' ? 'Ogiva' : 'Von Karman'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PANEL 6: OPÇÕES VISUAIS DA TRAJETÓRIA */}
            <div className="bg-[#05070A] dark:bg-[#05070A] light:bg-slate-50 p-4 rounded-lg border border-slate-800 dark:border-slate-800 light:border-slate-300 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-bold text-teal-400 flex items-center gap-1.5 text-sm">
                  <Activity className="w-4 h-4" />
                  Visual da Trajetória
                </span>
              </div>

              {/* Toggle Line Visibility */}
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={params.trajectoryLineVisible}
                  onChange={(e) => setParams({ ...params, trajectoryLineVisible: e.target.checked })}
                  className="accent-teal-400"
                />
                <span className="text-xs">Exibir Linha de Trajetória</span>
              </label>

              {/* Toggle Dashed Line */}
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={params.trajectoryLineDashed}
                  onChange={(e) => setParams({ ...params, trajectoryLineDashed: e.target.checked })}
                  className="accent-teal-400"
                  disabled={!params.trajectoryLineVisible}
                />
                <span className={`text-xs ${!params.trajectoryLineVisible ? 'opacity-50' : ''}`}>Linha Tracejada</span>
              </label>

              {/* Line Thickness */}
              <div>
                <label className={`block text-slate-300 mb-1 flex justify-between items-center ${!params.trajectoryLineVisible ? 'opacity-50' : ''}`}>
                  <span>Espessura:</span>
                  <span className="font-bold text-teal-300">{params.trajectoryLineThickness}px</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={params.trajectoryLineThickness}
                  onChange={(e) => setParams({ ...params, trajectoryLineThickness: parseFloat(e.target.value) || 2 })}
                  disabled={!params.trajectoryLineVisible}
                  className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded cursor-pointer disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DEFAULT_FLIGHT_PARAMS: RocketParams = {
  massInitial: 1.45, // kg total wet mass
  massFinal: 0.95, // kg dry mass without propellant
  motorThrust: 210, // N peak thrust
  motorImpulse: 260, // N*s total impulse (Class G/H motor)
  burnTime: 2.3, // s burn time
  diameter: 0.082, // m (82mm caliber)
  cd: 0.42, // Base subsonic drag coefficient Cd0
  launchAngle: 86, // degrees
  railLength: 2.5, // m launch rail length
  windSpeed: 14, // km/h ground wind
  windDirection: 90, // degrees
  temperatureGround: 25, // °C
  pressureGround: 1013.25, // hPa
  cgPosition: 44, // cm from nosecone tip
  cpPosition: 62, // cm from nosecone tip
  finSpan: 10, // cm
  finShape: 'trapezoidal',
  finAngleOfAttack: 0, // degrees
  trajectoryLineVisible: true,
  trajectoryLineThickness: 2,
  trajectoryLineDashed: true,
  noseShape: 'parabolic',
  noseLength: 40,
  bodyLength: 100,
  drogueDiameter: 0.35, // m drogue chute diameter
  drogueCd: 1.5, // drogue chute drag coefficient
  mainDeployAlt: 150, // m main deployment altitude
  mainDiameter: 1.15, // m main chute diameter
  mainCd: 2.2 // main chute drag coefficient
};

export const FlightSimulator: React.FC = () => {
  // Rocket Parameters State with High-Precision Recovery & Atmosphere Defaults cached in localStorage
  const [params, setParams] = React.useState<RocketParams>(() => getStoredFlightParams(DEFAULT_FLIGHT_PARAMS));

  React.useEffect(() => {
    saveStoredFlightParams(params);
  }, [params]);

  React.useEffect(() => {
    // Dynamic Barrowman CP estimation based on fin geometry
    const baseCP = 55; // Base CP without fins variation
    const finSpanShift = (params.finSpan - 10) * 1.2; // Larger span moves CP backwards
    const finShapeShift = params.finShape === 'elliptical' ? -1.5 : 0; 
    const angleShift = Math.abs(params.finAngleOfAttack) * -0.4; 

    const computedCp = Math.max(10, Math.min(150, Math.round(baseCP + finSpanShift + finShapeShift + angleShift)));
    
    setParams(prev => {
      if (prev.cpPosition !== computedCp) {
        return { ...prev, cpPosition: computedCp };
      }
      return prev;
    });
  }, [params.finSpan, params.finShape, params.finAngleOfAttack]);

  const [activeSubTab, setActiveSubTab] = useState<'sim' | 'trajectory3d' | 'params' | 'formulas'>('sim');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [showAdvancedFormulas, setShowAdvancedFormulas] = useState(true);
  const [isTrajectoryExpanded, setIsTrajectoryExpanded] = useState(false);
  const [show3DTrajectoryTab, setShow3DTrajectoryTab] = useState(false);

  // History State for storing the last 5 simulations
  const [history, setHistory] = useState<SimulationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('bar_aeb_simulation_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleSaveCurrentSimulation = () => {
    const newItem: SimulationHistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      name: `Simulação #${history.length + 1}`,
      params: { ...params },
      maxAltitude: trajectorySummary.maxAltitude,
      maxVelocity: trajectorySummary.maxVelocity,
      maxMach: trajectorySummary.maxMach,
      maxAcceleration: trajectorySummary.maxAcceleration,
      totalFlightTime: trajectorySummary.totalFlightTime,
      driftDistance: trajectorySummary.driftDistance,
      elevationMSL: params.elevationMSL || 0,
      windSpeed: params.windSpeed,
      windDirection: params.windDirection ?? 90
    };

    const updated = [newItem, ...history].slice(0, 5); // Keep last 5
    setHistory(updated);
    try {
      localStorage.setItem('bar_aeb_simulation_history', JSON.stringify(updated));
    } catch {}
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('bar_aeb_simulation_history');
    } catch {}
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem('bar_aeb_simulation_history', JSON.stringify(updated));
    } catch {}
  };

  // Execute High-Precision Physics Simulation Integration
  const trajectorySummary: TrajectorySummary = useMemo(() => {
    return calculatePreciseTrajectory(params);
  }, [params]);

  const trajectoryData = trajectorySummary.points;

  // Current Animated Trajectory Point
  const currentPoint = useMemo(() => {
    if (trajectoryData.length === 0) return null;
    const target = trajectoryData.find((p) => p.time >= playbackTime);
    return target || trajectoryData[trajectoryData.length - 1];
  }, [trajectoryData, playbackTime]);

  // Handle Simulation Playback Loop
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackTime((prev) => {
          if (prev >= trajectorySummary.totalFlightTime) {
            setIsPlaying(false);
            return trajectorySummary.totalFlightTime;
          }
          return parseFloat((prev + 0.1).toFixed(2));
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, trajectorySummary.totalFlightTime]);

  // Export Simulation Data as CSV
  const handleExportCSV = () => {
    const headers =
      'Tempo(s),Altitude(m),Velocidade(m/s),Aceleracao(G),Mach,Pressao_Dinamica(Pa),Massa(kg),Ar_Densidade(kg/m3),Fase\n';
    const rows = trajectoryData
      .map(
        (p) =>
          `${p.time},${p.altitude},${p.velocity},${p.acceleration},${p.mach},${p.dynamicPressure},${p.currentMass},${p.airDensity},${p.phase}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trajetoria_foguete_precisa_${Date.now()}.csv`;
    a.click();
  };

  // Export Trajectory Simulation PDF Report
  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Page styling & header banner
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('FOGUETEDATA AEROSPACE - RELATÓRIO TÉCNICO DE SIMULAÇÃO DE TRAJETÓRIA', 14, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Análise Aerodinâmica Balística - Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 17);

    doc.setFontSize(7.5);
    doc.setTextColor(59, 130, 246);
    doc.text('INTEGRAÇÃO RUNGE-KUTTA (RK4) | ATMOSFERA ISA | MODELO DE ARRASTO TRANSONICO', 14, 22);

    // KPI Cards Row 1 (Y = 32)
    let y = 32;

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, y, 56, 18, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('APOGEU MÁXIMO', 18, y + 5);
    doc.setFontSize(13);
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text(`${trajectorySummary.maxAltitude} m`, 18, y + 13);

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(77, y, 56, 18, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('VELOCIDADE MÁXIMA', 81, y + 5);
    doc.setFontSize(13);
    doc.setTextColor(37, 99, 235); // Blue
    doc.text(`${trajectorySummary.maxVelocity} m/s`, 81, y + 13);

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(140, y, 56, 18, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('ACELERAÇÃO PICO', 144, y + 5);
    doc.setFontSize(13);
    doc.setTextColor(217, 119, 6); // Amber
    doc.text(`${trajectorySummary.maxGForce.toFixed(2)} G`, 144, y + 13);

    y += 22;

    // KPI Cards Row 2
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, y, 56, 16, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('MACH MÁXIMO', 18, y + 5);
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`Mach ${trajectorySummary.maxMach.toFixed(2)}`, 18, y + 12);

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(77, y, 56, 16, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('TEMPO ATÉ APOGEU', 81, y + 5);
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`${trajectorySummary.timeToApogee} s`, 81, y + 12);

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(140, y, 56, 16, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('TEMPO TOTAL VOO', 144, y + 5);
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`${trajectorySummary.totalFlightTime} s`, 144, y + 12);

    y += 22;

    // Section 1: Rocket & Launch Physics Parameters
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('1. PARÂMETROS FÍSICOS DO FOGUETE E LANÇAMENTO', 14, y);
    y += 3;
    doc.setDrawColor(203, 213, 225);
    doc.line(14, y, 196, y);
    y += 5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    const col1X = 14;
    const col2X = 105;

    const leftParams = [
      `• Massa Inicial (Úmida): ${params.massInitial} kg`,
      `• Massa Seca (Burnout): ${params.massFinal} kg`,
      `• Impulso Total do Motor: ${params.motorImpulse} N·s (Classe ${trajectorySummary.motorClass})`,
      `• Empuxo Máximo do Motor: ${params.motorThrust} N`,
      `• Tempo de Queima: ${params.burnTime} s`,
      `• Calibre / Diâmetro: ${(params.diameter * 1000).toFixed(0)} mm`,
      `• Coeficiente de Arrasto (Cd0): ${params.cd}`
    ];

    const rightParams = [
      `• Ângulo de Lançamento: ${params.launchAngle}°`,
      `• Comprimento da Rampa: ${params.railLength} m`,
      `• Vento em Solo: ${params.windSpeed} km/h`,
      `• Paraquedas Drogue: ${(params.drogueDiameter * 100).toFixed(0)} cm (Cd: ${params.drogueCd})`,
      `• Paraquedas Principal: ${(params.mainDiameter * 100).toFixed(0)} cm (Cd: ${params.mainCd})`,
      `• Altura Deploy Principal: ${params.mainDeployAlt} m`,
      `• Margem Estática Inicial/Burnout: ${trajectorySummary.staticMarginInitial.toFixed(2)} cal / ${trajectorySummary.staticMarginBurnout.toFixed(2)} cal`
    ];

    let pY = y;
    leftParams.forEach((p) => {
      doc.text(p, col1X, pY);
      pY += 4;
    });

    pY = y;
    rightParams.forEach((p) => {
      doc.text(p, col2X, pY);
      pY += 4;
    });

    y = pY + 3;

    // Section 2: Milestones
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('2. MARCOS DAS FASES DE VOO (MILESTONES)', 14, y);
    y += 3;
    doc.line(14, y, 196, y);
    y += 5;

    // Table Header
    doc.setFillColor(30, 41, 59);
    doc.rect(14, y, 182, 5.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('FASE DE VOO', 18, y + 3.8);
    doc.text('TEMPO (s)', 75, y + 3.8);
    doc.text('ALTITUDE (m)', 115, y + 3.8);
    doc.text('VELOCIDADE (m/s)', 155, y + 3.8);

    y += 5.5;

    const milestones = [
      { phase: 'Saída da Rampa (Rail Exit)', time: (Math.sqrt((2 * params.railLength) / (params.motorThrust / params.massInitial))).toFixed(2), alt: (params.railLength * Math.sin(params.launchAngle * Math.PI / 180)).toFixed(1), vel: trajectorySummary.railExitVelocity.toFixed(1) },
      { phase: 'Término da Queima (Burnout)', time: params.burnTime.toFixed(2), alt: (trajectoryData.find(p => p.time >= params.burnTime)?.altitude || 0).toFixed(1), vel: (trajectoryData.find(p => p.time >= params.burnTime)?.velocity || 0).toFixed(1) },
      { phase: 'Pressão Dinâmica Máxima (q_max)', time: trajectorySummary.timeMaxQ.toFixed(2), alt: (trajectoryData.find(p => p.time >= trajectorySummary.timeMaxQ)?.altitude || 0).toFixed(1), vel: (trajectoryData.find(p => p.time >= trajectorySummary.timeMaxQ)?.velocity || 0).toFixed(1) },
      { phase: 'Apogeu (Ejeção Drogue)', time: trajectorySummary.timeToApogee.toFixed(2), alt: trajectorySummary.maxAltitude.toFixed(1), vel: '0.0' },
      { phase: 'Deploy Paraquedas Principal', time: (trajectoryData.find(p => p.phase === 'main_chute')?.time || 0).toFixed(2), alt: (trajectoryData.find(p => p.phase === 'main_chute')?.altitude || params.mainDeployAlt).toFixed(1), vel: (trajectoryData.find(p => p.phase === 'main_chute')?.velocity || 0).toFixed(1) },
      { phase: 'Pouso no Solo (Touchdown)', time: trajectorySummary.totalFlightTime.toFixed(2), alt: '0.0', vel: trajectorySummary.touchdownVelocity.toFixed(1) }
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    milestones.forEach((m, i) => {
      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, 182, 5, 'F');
      }
      doc.setTextColor(30, 41, 59);
      doc.text(m.phase, 18, y + 3.5);
      doc.text(`${m.time} s`, 75, y + 3.5);
      doc.text(`${m.alt} m`, 115, y + 3.5);
      doc.text(`${m.vel} m/s`, 155, y + 3.5);
      y += 5;
    });

    y += 5;

    // Section 3: Telemetry Data Points
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('3. TELEMETRIA AMOSTRADA DA TRAJETÓRIA', 14, y);
    y += 3;
    doc.line(14, y, 196, y);
    y += 5;

    // Header for telemetry
    doc.setFillColor(30, 41, 59);
    doc.rect(14, y, 182, 5.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('Tempo(s)', 16, y + 3.8);
    doc.text('Alt(m)', 42, y + 3.8);
    doc.text('Vel(m/s)', 68, y + 3.8);
    doc.text('Acel(G)', 94, y + 3.8);
    doc.text('Mach', 120, y + 3.8);
    doc.text('Massa(kg)', 146, y + 3.8);
    doc.text('Fase', 170, y + 3.8);

    y += 5.5;

    const sampleCount = 20;
    const step = Math.max(1, Math.floor(trajectoryData.length / sampleCount));
    const samplePoints = [];
    for (let i = 0; i < trajectoryData.length; i += step) {
      samplePoints.push(trajectoryData[i]);
    }
    if (samplePoints[samplePoints.length - 1] !== trajectoryData[trajectoryData.length - 1]) {
      samplePoints.push(trajectoryData[trajectoryData.length - 1]);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);

    samplePoints.forEach((pt, idx) => {
      if (y > 275) {
        doc.addPage();
        y = 15;
        doc.setFillColor(30, 41, 59);
        doc.rect(14, y, 182, 5.5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('Tempo(s)', 16, y + 3.8);
        doc.text('Alt(m)', 42, y + 3.8);
        doc.text('Vel(m/s)', 68, y + 3.8);
        doc.text('Acel(G)', 94, y + 3.8);
        doc.text('Mach', 120, y + 3.8);
        doc.text('Massa(kg)', 146, y + 3.8);
        doc.text('Fase', 170, y + 3.8);
        y += 5.5;
        doc.setFont('helvetica', 'normal');
      }

      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, 182, 4.5, 'F');
      }

      doc.setTextColor(30, 41, 59);
      doc.text(`${pt.time.toFixed(1)}s`, 16, y + 3.2);
      doc.text(`${pt.altitude.toFixed(1)}m`, 42, y + 3.2);
      doc.text(`${pt.velocity.toFixed(1)}`, 68, y + 3.2);
      doc.text(`${pt.acceleration.toFixed(1)}`, 94, y + 3.2);
      doc.text(`${pt.mach.toFixed(2)}`, 120, y + 3.2);
      doc.text(`${pt.currentMass.toFixed(2)}`, 146, y + 3.2);
      doc.text(`${pt.phase}`, 170, y + 3.2);

      y += 4.5;
    });

    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`FogueteData Aerospace | Página ${p} de ${totalPages}`, 14, 290);
      doc.text('Documento gerado automaticamente pelo Simulador de Trajetória', 115, 290);
    }

    doc.save(`relatorio_simulacao_foguete_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner Header */}
      <div className="bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-lg p-4 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-blue-500 font-mono text-[11px] uppercase tracking-wider mb-1 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Módulo Aerodinâmico & Modelo Físico Integração Runge-Kutta
          </div>
          <h2 className="text-xl font-bold font-italic-title text-slate-900 dark:text-white tracking-tight">
            Trajetória do Foguete
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-0.5 max-w-3xl leading-relaxed">
            Previsão balística em tempo real da trajetória do foguete com momentos editáveis para acionamento da propulsão (fogo ativo) e abertura automática do paraquedas no apogeu ou tempo configurável.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 bg-red-600/90 hover:bg-red-600 text-white border border-red-500/50 text-xs px-3 py-1.5 rounded font-mono font-bold transition shadow cursor-pointer active:scale-95"
            title="Exportar Relatório Completo em PDF"
          >
            <FileText className="w-3.5 h-3.5 text-red-200" />
            Exportar Relatório PDF
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 light:bg-slate-200 light:hover:bg-slate-300 text-slate-200 dark:text-slate-200 light:text-slate-800 border border-slate-700 dark:border-slate-700 light:border-slate-300 text-xs px-3 py-1.5 rounded font-mono font-bold transition shadow cursor-pointer active:scale-95"
            title="Exportar Telemetria Bruta em CSV"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Sub-tab Switcher Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 dark:border-slate-800 light:border-slate-300 pb-1">
        <button
          onClick={() => setActiveSubTab('sim')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold font-mono transition ${
            activeSubTab === 'sim'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:bg-slate-800/40'
          }`}
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>Trajetória do Foguete</span>
        </button>

        <button
          onClick={() => setActiveSubTab('trajectory3d' as any)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold font-mono transition ${
            (activeSubTab as string) === 'trajectory3d'
              ? 'bg-cyan-600 text-white shadow ring-2 ring-cyan-400/50'
              : 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:bg-slate-800/40'
          }`}
        >
          <Navigation className="w-3.5 h-3.5 text-cyan-300" />
          <span>Visualização 3D da Trajetória (Curva 3D WebGL)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('params')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold font-mono transition ${
            activeSubTab === 'params'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:bg-slate-800/40'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Parâmetros de Projeto ({trajectorySummary.motorClass})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('formulas')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold font-mono transition ${
            activeSubTab === 'formulas'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:bg-slate-800/40'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Fórmulas e Equações Físicas</span>
        </button>
      </div>

      {/* TAB 1: TRAJECTORY & SIMULATION ANALYTICS */}
      {activeSubTab === 'sim' && (
        <div className="space-y-5">
          {/* Realtime Atmospheric Variables & Wind Configuration Panel */}
          <AtmosphericControlPanel params={params} setParams={setParams} trajectorySummary={trajectorySummary} />

          {/* Executive Key Physics Indicators (KPI Grid) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Apogee */}
            <div className="bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-lg p-3 shadow-md space-y-1">
              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-400 light:text-slate-500 uppercase flex items-center justify-between">
                <span>Apogeu Máximo</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-extrabold font-mono text-emerald-400">
                {trajectorySummary.maxAltitude} <span className="text-xs font-sans font-normal text-slate-300 dark:text-slate-300 light:text-slate-600">m</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Tempo até apogeu: <strong className="text-slate-200 dark:text-slate-200 light:text-slate-800">{trajectorySummary.timeToApogee}s</strong>
              </div>
            </div>

            {/* Max Velocity & Mach */}
            <div className="bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-lg p-3 shadow-md space-y-1">
              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-400 light:text-slate-500 uppercase flex items-center justify-between">
                <span>Velocidade Máx / Mach</span>
                <Gauge className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="text-xl font-extrabold font-mono text-blue-400">
                {trajectorySummary.maxVelocity} <span className="text-xs font-sans font-normal text-slate-300 dark:text-slate-300 light:text-slate-600">m/s</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Número Mach: <strong className="text-cyan-400">Mach {trajectorySummary.maxMach}</strong>
              </div>
            </div>

            {/* Max Dynamic Pressure Q */}
            <div className="bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-lg p-3 shadow-md space-y-1">
              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-400 light:text-slate-500 uppercase flex items-center justify-between">
                <span>Pressão Dinâmica (Max-Q)</span>
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-xl font-extrabold font-mono text-amber-400">
                {(trajectorySummary.maxDynamicPressure / 1000).toFixed(2)} <span className="text-xs font-sans font-normal text-slate-300 dark:text-slate-300 light:text-slate-600">kPa</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Ocorre em t = <strong className="text-slate-200 dark:text-slate-200 light:text-slate-800">{trajectorySummary.timeMaxQ}s</strong>
              </div>
            </div>

            {/* Rail Exit Speed */}
            <div className="bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-lg p-3 shadow-md space-y-1">
              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-400 light:text-slate-500 uppercase flex items-center justify-between">
                <span>Saída de Rampa ({params.railLength}m)</span>
                {trajectorySummary.isRailExitSafe ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                )}
              </div>
              <div className={`text-xl font-extrabold font-mono ${trajectorySummary.isRailExitSafe ? 'text-emerald-400' : 'text-red-400'}`}>
                {trajectorySummary.railExitVelocity} <span className="text-xs font-sans font-normal text-slate-300 dark:text-slate-300 light:text-slate-600">m/s</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Mínimo seguro: <strong className="text-slate-200 dark:text-slate-200 light:text-slate-800">15.0 m/s</strong>
              </div>
            </div>

            {/* Touchdown Kinetic Energy */}
            <div className="bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-lg p-3 shadow-md space-y-1">
              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-400 light:text-slate-500 uppercase flex items-center justify-between">
                <span>Energia Impacto (Ek)</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className={`text-xl font-extrabold font-mono ${trajectorySummary.isTouchdownSafe ? 'text-emerald-400' : 'text-red-400'}`}>
                {trajectorySummary.touchdownKineticEnergy} <span className="text-xs font-sans font-normal text-slate-300 dark:text-slate-300 light:text-slate-600">J</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Limite segurança: <strong className="text-slate-200 dark:text-slate-200 light:text-slate-800">&lt; 15.0 J</strong>
              </div>
            </div>

            {/* Recovery Wind Drift */}
            <div className="bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-lg p-3 shadow-md space-y-1">
              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-400 light:text-slate-500 uppercase flex items-center justify-between">
                <span>Deriva de Vento (D)</span>
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-xl font-extrabold font-mono text-cyan-400">
                {trajectorySummary.driftDistance} <span className="text-xs font-sans font-normal text-slate-300 dark:text-slate-300 light:text-slate-600">m</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Raio de resgate: <strong className="text-slate-200 dark:text-slate-200 light:text-slate-800">±{trajectorySummary.searchRadius}m</strong>
              </div>
            </div>
          </div>

          {/* Interactive Trajectory Simulation & 3D Rocket Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 3D Realtime Rocket Model */}
            <div className="lg:col-span-1 space-y-3">
              <div className="flex items-center justify-between bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 p-3 rounded-lg">
                <span className="text-xs font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 font-mono flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Modelo 3D Foguete & Malha CAD
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 dark:bg-emerald-950/50 light:bg-emerald-100 border border-emerald-800/50 light:border-emerald-300 px-2 py-0.5 rounded">
                  BAR-AEB Calibre {params.diameter * 1000}mm
                </span>
              </div>
              <Rocket3DViewer 
                autoDeployParachute={currentPoint ? (currentPoint.time > trajectorySummary.timeToApogee) : false} 
                rocketParams={params}
              />
            </div>

            {/* Trajectory Flight Profile Chart Visualizer */}
            <div className="lg:col-span-2 bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-lg p-4 shadow-xl space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 dark:text-white light:text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    Perfil da Trajetória Balística: $h(t)$ e $v(t)$
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-600">
                    Integração incremental de altitude, velocidade, aceleração e trocas de fase de recuperação.
                  </p>
                </div>

                {/* Simulation Playback & Fullscreen Expand Controls */}
                <div className="flex flex-wrap items-center gap-2 bg-[#05070A] dark:bg-[#05070A] light:bg-slate-100 p-1.5 rounded-md border border-slate-800 dark:border-slate-800 light:border-slate-300">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded text-xs font-bold transition shadow"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'Pausar' : 'Simular'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setPlaybackTime(0);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-200 transition"
                    title="Reiniciar tempo t=0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-xs font-mono font-bold text-blue-400 px-2">
                    t = {playbackTime.toFixed(1)}s / {trajectorySummary.totalFlightTime}s
                  </span>

                  {/* Expand Trajectory Button */}
                  <button
                    onClick={() => setIsTrajectoryExpanded(true)}
                    className="bg-red-600 hover:bg-red-500 text-white font-mono font-bold px-2.5 py-1 rounded text-xs inline-flex items-center gap-1 transition shadow ml-1"
                    title="Expandir Perfil da Trajetória em Tela Cheia"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Expandir</span>
                  </button>
                </div>
              </div>

              {/* Top Graph Legend Bar (SEPARATE from graph line so it never sit on top of the trajectory) */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono bg-[#05070A] dark:bg-[#05070A] light:bg-slate-100 p-2.5 rounded-lg border border-slate-800 dark:border-slate-800 light:border-slate-300">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white" />
                    Altitude $h(t)$ (m) [Verde]
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                    <span className="w-3 h-3 rounded-full bg-blue-500 border border-white" />
                    Velocidade $v(t)$ (m/s) [Azul Traçado]
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-600">
                  Apogeu Máx: <strong className="text-emerald-400">{trajectorySummary.maxAltitude} m</strong> | Velocidade Máx: <strong className="text-blue-400">{trajectorySummary.maxVelocity} m/s</strong>
                </div>
              </div>

              {/* Clean Unobstructed High Density SVG Graph Canvas */}
              <div className="relative w-full h-64 bg-[#05070A] dark:bg-[#05070A] light:bg-slate-50 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-300 p-2 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[0.25, 0.5, 0.75].map((r, i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={200 * r}
                      x2="500"
                      y2={200 * r}
                      stroke="currentColor"
                      className="text-slate-800 dark:text-slate-800 light:text-slate-300"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  ))}

                  {/* Altitude Curve Path */}
                  {trajectoryData.length > 1 && (
                    <path
                      d={trajectoryData.reduce((acc, p, idx) => {
                        const xSvg = (p.time / trajectorySummary.totalFlightTime) * 500;
                        const ySvg = 190 - (p.altitude / (trajectorySummary.maxAltitude * 1.1)) * 180;
                        return idx === 0 ? `M ${xSvg} ${ySvg}` : `${acc} L ${xSvg} ${ySvg}`;
                      }, '')}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Velocity Curve Path */}
                  {trajectoryData.length > 1 && (
                    <path
                      d={trajectoryData.reduce((acc, p, idx) => {
                        const xSvg = (p.time / trajectorySummary.totalFlightTime) * 500;
                        const ySvg = 190 - (p.velocity / (trajectorySummary.maxVelocity * 1.2)) * 180;
                        return idx === 0 ? `M ${xSvg} ${ySvg}` : `${acc} L ${xSvg} ${ySvg}`;
                      }, '')}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Current Animation Position Dot, Propulsion Flame at Start & Parachute on Return */}
                  {currentPoint && (
                    <g>
                      {/* Propulsion Fire / Flame Plume displayed at the start during motor burn phase */}
                      {(currentPoint.time <= params.burnTime && currentPoint.time > 0) && (
                        <g transform={`translate(${(currentPoint.time / trajectorySummary.totalFlightTime) * 500}, ${190 - (currentPoint.altitude / (trajectorySummary.maxAltitude * 1.1)) * 180})`}>
                          {/* Fiery Exhaust Plume Cone */}
                          <path
                            d="M -4 4 L 0 24 L 4 4 Z"
                            fill="#f97316"
                            className="animate-pulse"
                          />
                          <path
                            d="M -2 4 L 0 16 L 2 4 Z"
                            fill="#fef08a"
                          />
                          {/* Flame Particle Glows */}
                          <circle cx="0" cy="18" r="5" fill="#ef4444" opacity="0.8" className="animate-ping" />
                          <circle cx="-2" cy="22" r="3" fill="#f59e0b" opacity="0.9" />
                          <circle cx="2" cy="22" r="3" fill="#ef4444" opacity="0.9" />
                          {/* Propulsion Burn Text Badge */}
                          <text x="10" y="16" fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="bold">
                            🔥 Queima do Motor ({currentPoint.time.toFixed(1)}s)
                          </text>
                        </g>
                      )}

                      {/* Parachute deployed during return / recovery phase */}
                      {(currentPoint.phase.toLowerCase().includes('drogue') || 
                        currentPoint.phase.toLowerCase().includes('main') || 
                        currentPoint.phase.toLowerCase().includes('chute') ||
                        currentPoint.phase.toLowerCase().includes('queda') ||
                        currentPoint.time > trajectorySummary.timeToApogee) && (
                        <g transform={`translate(${(currentPoint.time / trajectorySummary.totalFlightTime) * 500}, ${190 - (currentPoint.altitude / (trajectorySummary.maxAltitude * 1.1)) * 180 - 18})`}>
                          {/* Suspension Cords */}
                          <line x1="-12" y1="-8" x2="0" y2="14" stroke="#f97316" strokeWidth="1" opacity="0.85" />
                          <line x1="-4" y1="-8" x2="0" y2="14" stroke="#f97316" strokeWidth="1" opacity="0.85" />
                          <line x1="4" y1="-8" x2="0" y2="14" stroke="#f97316" strokeWidth="1" opacity="0.85" />
                          <line x1="12" y1="-8" x2="0" y2="14" stroke="#f97316" strokeWidth="1" opacity="0.85" />
                          {/* Canopy Dome */}
                          <path
                            d="M -16 -8 Q 0 -24 16 -8 Q 8 -12 0 -12 Q -8 -12 -16 -8 Z"
                            fill="#f97316"
                            stroke="#ffffff"
                            strokeWidth="1.2"
                          />
                        </g>
                      )}

                      <circle
                        cx={(currentPoint.time / trajectorySummary.totalFlightTime) * 500}
                        cy={190 - (currentPoint.altitude / (trajectorySummary.maxAltitude * 1.1)) * 180}
                        r="6"
                        fill="#38bdf8"
                        className="animate-ping"
                      />
                      <circle
                        cx={(currentPoint.time / trajectorySummary.totalFlightTime) * 500}
                        cy={190 - (currentPoint.altitude / (trajectorySummary.maxAltitude * 1.1)) * 180}
                        r="4"
                        fill="#2563eb"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    </g>
                  )}
                </svg>
              </div>

              {/* Bottom Telemetry Realtime Status Bar (SEPARATE from graph line) */}
              {currentPoint && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-[#05070A] dark:bg-[#05070A] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 p-2.5 rounded-xl text-slate-200 dark:text-slate-200 light:text-slate-800 shadow">
                  <div>Fase: <strong className="text-cyan-400 uppercase">{currentPoint.phase}</strong></div>
                  <div>Altitude: <strong className="text-emerald-400 font-bold">{currentPoint.altitude} m</strong></div>
                  <div>Velocidade: <strong className="text-blue-400 font-bold">{currentPoint.velocity} m/s</strong> (Mach {currentPoint.mach})</div>
                  <div>Aceleração: <strong className="text-amber-400 font-bold">{currentPoint.acceleration} G</strong></div>
                </div>
              )}

              {/* Recovery Wind Drift & Landing Target Map Visualizer */}
              <div className="border-t border-slate-800 dark:border-slate-800 light:border-slate-200 pt-3">
                <h4 className="text-xs font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 font-mono flex items-center gap-2 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  Previsão da Área de Pouso & Deriva de Vento na Recuperação
                </h4>

                <div className="bg-[#05070A] dark:bg-[#05070A] light:bg-slate-100 p-3 rounded border border-slate-800 dark:border-slate-800 light:border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
                  <div className="space-y-1">
                    <div>Coordenada Base da Rampa: <span className="text-slate-400">(X=0m, Y=0m)</span></div>
                    <div>Vento Superficial: <strong className="text-cyan-400">{params.windSpeed} km/h</strong> na direção <strong className="text-slate-200 dark:text-slate-200 light:text-slate-800">{params.windDirection}°</strong></div>
                    <div>Deslocamento Total de Deriva: <strong className="text-emerald-400">{trajectorySummary.driftDistance} metros</strong></div>
                  </div>

                  <div className="bg-[#111827] dark:bg-[#111827] light:bg-white p-2.5 rounded border border-slate-800 dark:border-slate-800 light:border-slate-300 text-center space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase">Raio da Elipse de Resgate ($3\sigma$)</div>
                    <div className="text-lg font-extrabold text-amber-400">± {trajectorySummary.searchRadius} metros</div>
                    <div className="text-[9px] text-emerald-400 font-sans">
                      {trajectorySummary.isTouchdownSafe ? '✓ Pouso com Energia Protegida (<15 J)' : '⚠ Atenção: Reforçar Paraquedas'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Simulation History Panel (Last 5 Simulations) */}
          <AdvancedThrustCdStabilityPanel params={params} setParams={setParams} trajectorySummary={trajectorySummary} />
          <SimulationHistoryPanel
            history={history}
            onSaveCurrent={handleSaveCurrentSimulation}
            onLoadParams={(newParams) => setParams(newParams)}
            onClearHistory={handleClearHistory}
            onDeleteHistoryItem={handleDeleteHistoryItem}
            currentApogee={trajectorySummary.maxAltitude}
            currentMaxVel={trajectorySummary.maxVelocity}
          />
        </div>
      )}

      {/* TAB: 3D TRAJECTORY VISUALIZATION (REACT THREE FIBER / THREE.JS WEBGL) */}
      {activeSubTab === 'trajectory3d' && (
        <div className="space-y-5">
          <AtmosphericControlPanel params={params} setParams={setParams} trajectorySummary={trajectorySummary} />
          <AdvancedThrustCdStabilityPanel params={params} setParams={setParams} trajectorySummary={trajectorySummary} />
          <FlightSimulator3DTrajectory summary={trajectorySummary} params={params} />
          <SimulationHistoryPanel
            history={history}
            onSaveCurrent={handleSaveCurrentSimulation}
            onLoadParams={(newParams) => setParams(newParams)}
            onClearHistory={handleClearHistory}
            onDeleteHistoryItem={handleDeleteHistoryItem}
            currentApogee={trajectorySummary.maxAltitude}
            currentMaxVel={trajectorySummary.maxVelocity}
          />
        </div>
      )}

      {/* TAB 2: ROCKET & ATMOSPHERIC PARAMETERS FORM */}
      {activeSubTab === 'params' && (
        <div className="space-y-5">
          {/* Dedicated Realtime Atmospheric Variables & Wind Configuration Panel */}
          <AtmosphericControlPanel params={params} setParams={setParams} trajectorySummary={trajectorySummary} />
          {/* Dedicated Advanced Controls for Cd, Thrust and Stability */}
          <AdvancedThrustCdStabilityPanel params={params} setParams={setParams} trajectorySummary={trajectorySummary} />

          <div className="bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-lg p-5 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 dark:border-slate-800 light:border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-100 dark:text-white light:text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                Parâmetros Físicos do Foguete, Motor e Recuperação
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
                Ajuste os dados estruturais e ambientais. A simulação atualiza instantaneamente.
              </p>
            </div>
            <span className="bg-blue-900/40 text-blue-300 border border-blue-800 px-2.5 py-1 rounded text-xs font-mono font-bold">
              Motor Classe: {trajectorySummary.motorClass} ({params.motorImpulse} N·s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-mono">
            {/* Column 1: Masses & Motor */}
            <div className="space-y-3 bg-[#05070A] dark:bg-[#05070A] light:bg-slate-50 p-4 rounded border border-slate-800 dark:border-slate-800 light:border-slate-300">
              <h4 className="text-sm font-bold text-blue-400 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 pb-1.5 flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5" />
                Massa & Propulsão
              </h4>

              <div>
                <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                  Massa Inicial Total m₀ (kg) [Com Propelente]
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={params.massInitial}
                  onChange={(e) => setParams({ ...params, massInitial: parseFloat(e.target.value) || 0.1 })}
                  className="w-full bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded p-2 text-slate-100 dark:text-white light:text-slate-900 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                  Massa Seca m_dry (kg) [Sem Propelente]
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={params.massFinal}
                  onChange={(e) => setParams({ ...params, massFinal: parseFloat(e.target.value) || 0.1 })}
                  className="w-full bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded p-2 text-slate-100 dark:text-white light:text-slate-900 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                  Empuxo Máximo/Pico F_T (N)
                </label>
                <input
                  type="number"
                  value={params.motorThrust}
                  onChange={(e) => setParams({ ...params, motorThrust: parseFloat(e.target.value) || 10 })}
                  className="w-full bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded p-2 text-slate-100 dark:text-white light:text-slate-900 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                  Impulso Total I_tot (N·s)
                </label>
                <input
                  type="number"
                  value={params.motorImpulse}
                  onChange={(e) => setParams({ ...params, motorImpulse: parseFloat(e.target.value) || 10 })}
                  className="w-full bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded p-2 text-slate-100 dark:text-white light:text-slate-900 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                  Tempo de Funcionamento da Propulsão t_b (s)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={params.burnTime}
                  onChange={(e) => setParams({ ...params, burnTime: parseFloat(e.target.value) || 0.5 })}
                  className="w-full bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded p-2 text-slate-100 dark:text-white light:text-slate-900 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1 font-bold text-amber-400">
                  🔥 Momento de Início da Propulsão (s)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={params.thrustStartDelay || 0}
                  onChange={(e) => setParams({ ...params, thrustStartDelay: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#111827] dark:bg-[#111827] light:bg-white border border-amber-500/50 rounded p-2 text-amber-300 focus:border-amber-400 outline-none font-bold"
                  placeholder="0.0s (Imediato no t=0)"
                />
              </div>
            </div>

            {/* Column 2: Aerodynamics & Rail */}
            <div className="space-y-3 bg-[#05070A] dark:bg-[#05070A] light:bg-slate-50 p-4 rounded border border-slate-800 dark:border-slate-800 light:border-slate-300">
              <h4 className="text-sm font-bold text-cyan-400 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 pb-1.5 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" />
                Aerodinâmica & Rampa
              </h4>

              <div>
                <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                  Diâmetro do Calibre d (m) [Ex: 0.082m = 82mm]
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={params.diameter}
                  onChange={(e) => setParams({ ...params, diameter: parseFloat(e.target.value) || 0.05 })}
                  className="w-full bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded p-2 text-slate-100 dark:text-white light:text-slate-900 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                  Coeficiente Arraste Subsônico C_d0
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={params.cd}
                  onChange={(e) => setParams({ ...params, cd: parseFloat(e.target.value) || 0.3 })}
                  className="w-full bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded p-2 text-slate-100 dark:text-white light:text-slate-900 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                  Ângulo da Rampa de Lançamento (graus)
                </label>
                <input
                  type="number"
                  value={params.launchAngle}
                  onChange={(e) => setParams({ ...params, launchAngle: parseFloat(e.target.value) || 45 })}
                  className="w-full bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded p-2 text-slate-100 dark:text-white light:text-slate-900 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                  Comprimento da Rampa L_rail (m)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={params.railLength}
                  onChange={(e) => setParams({ ...params, railLength: parseFloat(e.target.value) || 1.0 })}
                  className="w-full bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded p-2 text-slate-100 dark:text-white light:text-slate-900 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                  Centro de Gravidade CG (cm da coifa)
                </label>
                <input
                  type="number"
                  value={params.cgPosition}
                  onChange={(e) => setParams({ ...params, cgPosition: parseFloat(e.target.value) || 10 })}
                  className="w-full bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded p-2 text-slate-100 dark:text-white light:text-slate-900 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                  Centro de Pressão CP Barrowman (cm da coifa)
                </label>
                <input
                  type="number"
                  value={params.cpPosition}
                  onChange={(e) => setParams({ ...params, cpPosition: parseFloat(e.target.value) || 20 })}
                  className="w-full bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded p-2 text-slate-100 dark:text-white light:text-slate-900 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Column 3: Recovery Parachutes & Atmosphere */}
            <div className="space-y-3 bg-[#05070A] dark:bg-[#05070A] light:bg-slate-50 p-4 rounded border border-slate-800 dark:border-slate-800 light:border-slate-300">
              <h4 className="text-sm font-bold text-emerald-400 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 pb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Recuperação & Atmosfera
              </h4>

              <div>
                <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1 font-bold text-emerald-400">
                  🪂 Modo de Abertura do Paraquedas
                </label>
                <select
                  value={params.parachuteDeployMode || 'apogee_auto'}
                  onChange={(e) => setParams({ ...params, parachuteDeployMode: e.target.value as any })}
                  className="w-full bg-[#111827] dark:bg-[#111827] light:bg-white border border-emerald-500/50 rounded p-2 text-emerald-300 focus:border-emerald-400 outline-none font-bold"
                >
                  <option value="apogee_auto">Automático no Apogeu (Sem Atraso)</option>
                  <option value="delay_after_apogee">Atraso Personalizado após Apogeu</option>
                  <option value="fixed_time">Abertura em Tempo Fixo de Voo</option>
                </select>
              </div>

              {params.parachuteDeployMode !== 'apogee_auto' && (
                <div>
                  <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1 font-bold text-emerald-400">
                    Atraso para Abertura do Paraquedas (s)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={params.parachuteDeployDelay || 0}
                    onChange={(e) => setParams({ ...params, parachuteDeployDelay: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#111827] dark:bg-[#111827] light:bg-white border border-emerald-500/50 rounded p-2 text-emerald-300 focus:border-emerald-400 outline-none font-bold"
                    placeholder="Ex: 1.5s"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                  Diâmetro Paraquedas Drogue D_drogue (m)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={params.drogueDiameter}
                  onChange={(e) => setParams({ ...params, drogueDiameter: parseFloat(e.target.value) || 0.1 })}
                  className="w-full bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded p-2 text-slate-100 dark:text-white light:text-slate-900 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                  Altitude do Paraquedas Principal h_main (m)
                </label>
                <input
                  type="number"
                  value={params.mainDeployAlt}
                  onChange={(e) => setParams({ ...params, mainDeployAlt: parseFloat(e.target.value) || 50 })}
                  className="w-full bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded p-2 text-slate-100 dark:text-white light:text-slate-900 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                  Diâmetro Paraquedas Principal D_main (m)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={params.mainDiameter}
                  onChange={(e) => setParams({ ...params, mainDiameter: parseFloat(e.target.value) || 0.5 })}
                  className="w-full bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded p-2 text-slate-100 dark:text-white light:text-slate-900 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                  Velocidade do Vento de Solo (km/h)
                </label>
                <input
                  type="number"
                  value={params.windSpeed}
                  onChange={(e) => setParams({ ...params, windSpeed: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded p-2 text-slate-100 dark:text-white light:text-slate-900 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                  Temperatura no Solo (°C)
                </label>
                <input
                  type="number"
                  value={params.temperatureGround}
                  onChange={(e) => setParams({ ...params, temperatureGround: parseFloat(e.target.value) || 20 })}
                  className="w-full bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded p-2 text-slate-100 dark:text-white light:text-slate-900 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* TAB 3: MATHEMATICAL PHYSICS & DIFFERENTIAL EQUATIONS FORMULAS PANEL */}
      {activeSubTab === 'formulas' && (
        <div className="bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-lg p-5 shadow-xl space-y-5">
          <div className="flex justify-between items-center border-b border-slate-800 dark:border-slate-800 light:border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-100 dark:text-white light:text-slate-900 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                Fundamentação Físico-Matemática & Equações da Trajetória
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
                Fórmulas utilizadas na resolução numérica da trajetória, arraste transônico, estabilidade e recuperação.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* 1. ISA Atmosphere Formula */}
            <div className="bg-[#05070A] dark:bg-[#05070A] light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 p-4 rounded space-y-2">
              <div className="text-blue-400 font-bold uppercase text-[11px]">1. Modelo de Atmosfera Padrão ISA</div>
              <div className="bg-[#111827] dark:bg-[#111827] light:bg-white p-3 rounded text-slate-200 dark:text-slate-200 light:text-slate-900 border border-slate-800 dark:border-slate-800 light:border-slate-200 overflow-x-auto text-[11px] leading-relaxed">
                <div>ρ(h) = P(h) / (R · T(h))</div>
                <div>T(h) = T₀ - L · h   (L = 0.0065 K/m)</div>
                <div>P(h) = P₀ · (1 - L·h / T₀)^(g₀ / (R·L))</div>
                <div>a(h) = √(γ · R · T(h))   (γ = 1.4)</div>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-600 font-sans">
                Calcula a variação contínua de densidade do ar ρ(h) e velocidade do som a(h) até o apogeu.
              </p>
            </div>

            {/* 2. Drag & Transonic Compressibility */}
            <div className="bg-[#05070A] dark:bg-[#05070A] light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 p-4 rounded space-y-2">
              <div className="text-cyan-400 font-bold uppercase text-[11px]">2. Força de Arraste & Modelo Transônico</div>
              <div className="bg-[#111827] dark:bg-[#111827] light:bg-white p-3 rounded text-slate-200 dark:text-slate-200 light:text-slate-900 border border-slate-800 dark:border-slate-800 light:border-slate-200 overflow-x-auto text-[11px] leading-relaxed">
                <div>F_D(h, v, Mach) = ½ · ρ(h) · A · C_d(Mach) · v_rel²</div>
                <div>Mach = v / a(h)</div>
                <div>C_d(Mach) = C_d0 + 0.85 · C_d0 · e^(-14 · (Mach - 1.05)²)</div>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-600 font-sans">
                Soma a divergência de ondas de choque transônicas na barreira do som ao coeficiente base C_d0 = {params.cd}.
              </p>
            </div>

            {/* 3. Barrowman Equations Static Margin */}
            <div className="bg-[#05070A] dark:bg-[#05070A] light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 p-4 rounded space-y-2">
              <div className="text-amber-400 font-bold uppercase text-[11px]">3. Estabilidade Barrowman & Margem Estática</div>
              <div className="bg-[#111827] dark:bg-[#111827] light:bg-white p-3 rounded text-slate-200 dark:text-slate-200 light:text-slate-900 border border-slate-800 dark:border-slate-800 light:border-slate-200 overflow-x-auto text-[11px] leading-relaxed">
                <div>Margem Estática SM = (CP - CG) / d_calibre</div>
                <div>CP_foguete = (C_N,coifa · X_n + C_N,aleta · X_f) / (C_N,coifa + C_N,aleta)</div>
                <div>1.0 ≤ SM ≤ 2.5 calibres (Recomendação BAR-AEB)</div>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-600 font-sans">
                Margem atual do projeto: <strong className="text-amber-400">{trajectorySummary.staticMarginInitial} calibres</strong>.
              </p>
            </div>

            {/* 4. Dual Recovery & Terminal Velocity */}
            <div className="bg-[#05070A] dark:bg-[#05070A] light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 p-4 rounded space-y-2">
              <div className="text-emerald-400 font-bold uppercase text-[11px]">4. Recuperação Dupla & Velocidade Terminal</div>
              <div className="bg-[#111827] dark:bg-[#111827] light:bg-white p-3 rounded text-slate-200 dark:text-slate-200 light:text-slate-900 border border-slate-800 dark:border-slate-800 light:border-slate-200 overflow-x-auto text-[11px] leading-relaxed">
                <div>v_terminal = √[ (2 · m_dry · g) / (ρ(h) · C_d · A_paraquedas) ]</div>
                <div>E_k = ½ · m_dry · v_touchdown² ≤ 15.0 Joules</div>
                <div>D_deriva = ∫ v_vento(h(t)) dt  (de t_apogeu até t_pouso)</div>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-600 font-sans">
                Garante descida amortecida sem riscos estruturais na aterrissagem.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Trajectory Fullscreen Modal */}
      {isTrajectoryExpanded && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 font-mono text-xs">
          <div className="bg-black border border-red-500/50 rounded-2xl max-w-6xl w-full h-[92vh] flex flex-col shadow-2xl overflow-hidden relative text-slate-100">
            
            {/* Modal Header */}
            <div className="bg-[#111827] border-b border-slate-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/50 text-red-500">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Análise Expandida da Trajetória Balística & Telemetria em Tempo Real
                    <span className="text-[10px] bg-red-950 text-red-400 border border-red-500/40 px-2 py-0.5 rounded font-mono uppercase">
                      Alta Precisão t = 0.05s
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">
                    Foguete Calibre {params.diameter * 1000}mm | Apogeu {trajectorySummary.maxAltitude}m | Tempo Total de Voo {trajectorySummary.totalFlightTime}s
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Simulation Playback inside expanded modal */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pausar' : 'Simular'}</span>
                </button>

                <button
                  onClick={() => setIsTrajectoryExpanded(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  title="Fechar Visualização Expandida"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              
              {/* Full Resolution Chart Canvas */}
              <div className="bg-[#05070A] border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between text-xs border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-4">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white" />
                      Altitude $h(t)$ (Curva Verde)
                    </span>
                    <span className="text-blue-400 font-bold flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-blue-500 border border-white" />
                      Velocidade $v(t)$ (Curva Azul)
                    </span>
                  </div>

                  <div className="text-slate-400">
                    Tempo Atual: <strong className="text-blue-400 font-bold">{playbackTime.toFixed(2)}s</strong> / {trajectorySummary.totalFlightTime}s
                  </div>
                </div>

                {/* High Res SVG Graph Canvas */}
                <div className="relative w-full h-80 bg-slate-950 rounded-lg border border-slate-800/80 p-2">
                  <svg className="w-full h-full" viewBox="0 0 1000 350" preserveAspectRatio="none">
                    {/* Horizontal Grid */}
                    {[0.2, 0.4, 0.6, 0.8].map((r, i) => (
                      <line
                        key={i}
                        x1="0"
                        y1={350 * r}
                        x2="1000"
                        y2={350 * r}
                        stroke="#1e293b"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                    ))}

                    {/* Altitude Curve */}
                    {trajectoryData.length > 1 && (
                      <path
                        d={trajectoryData.reduce((acc, p, idx) => {
                          const xSvg = (p.time / trajectorySummary.totalFlightTime) * 1000;
                          const ySvg = 330 - (p.altitude / (trajectorySummary.maxAltitude * 1.1)) * 310;
                          return idx === 0 ? `M ${xSvg} ${ySvg}` : `${acc} L ${xSvg} ${ySvg}`;
                        }, '')}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                      />
                    )}

                    {/* Velocity Curve */}
                    {trajectoryData.length > 1 && (
                      <path
                        d={trajectoryData.reduce((acc, p, idx) => {
                          const xSvg = (p.time / trajectorySummary.totalFlightTime) * 1000;
                          const ySvg = 330 - (p.velocity / (trajectorySummary.maxVelocity * 1.2)) * 310;
                          return idx === 0 ? `M ${xSvg} ${ySvg}` : `${acc} L ${xSvg} ${ySvg}`;
                        }, '')}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                      />
                    )}

                    {/* Dynamic Point Dot with Fire Plume & Parachute in Expanded Screen View */}
                    {currentPoint && (
                      <g>
                        {/* 1. PROPULSION FIRE (FOGO DE PROPULSÃO) DURING MOTOR BURN */}
                        {(currentPoint.time <= params.burnTime && currentPoint.time > 0) && (
                          <g transform={`translate(${(currentPoint.time / trajectorySummary.totalFlightTime) * 1000}, ${330 - (currentPoint.altitude / (trajectorySummary.maxAltitude * 1.1)) * 310})`}>
                            {/* Fiery Exhaust Plume Cone */}
                            <path
                              d="M -8 8 L 0 45 L 8 8 Z"
                              fill="#f97316"
                              className="animate-pulse"
                            />
                            <path
                              d="M -4 8 L 0 30 L 4 8 Z"
                              fill="#fef08a"
                            />
                            {/* Inner Blue-White Core Flame */}
                            <path
                              d="M -2 8 L 0 18 L 2 8 Z"
                              fill="#60a5fa"
                            />
                            {/* Flame Particle Glows */}
                            <circle cx="0" cy="35" r="8" fill="#ef4444" opacity="0.85" className="animate-ping" />
                            <circle cx="-4" cy="42" r="5" fill="#f59e0b" opacity="0.9" />
                            <circle cx="4" cy="42" r="5" fill="#ef4444" opacity="0.9" />
                            <circle cx="0" cy="50" r="4" fill="#fbbf24" opacity="0.7" />

                            {/* Main Rocket Dot */}
                            <circle r="9" fill="#ef4444" className="animate-ping" />
                            <circle r="6" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />

                            {/* Propulsion Fire Text Badge */}
                            <g transform="translate(14, -10)">
                              <rect x="0" y="0" width="220" height="24" rx="6" fill="#0f172a" stroke="#f97316" strokeWidth="1.5" />
                              <text x="10" y="16" fill="#fbbf24" fontSize="11" fontFamily="monospace" fontWeight="bold">
                                🔥 FOGO: QUEIMA MOTOR ({currentPoint.time.toFixed(1)}s)
                              </text>
                            </g>
                          </g>
                        )}

                        {/* 2. PARACHUTE (PARAQUEDAS) DURING DESCENT / RECOVERY PHASE */}
                        {(currentPoint.phase.toLowerCase().includes('drogue') || 
                          currentPoint.phase.toLowerCase().includes('main') || 
                          currentPoint.phase.toLowerCase().includes('chute') ||
                          currentPoint.phase.toLowerCase().includes('queda') ||
                          currentPoint.time > trajectorySummary.timeToApogee) && (
                          <g transform={`translate(${(currentPoint.time / trajectorySummary.totalFlightTime) * 1000}, ${330 - (currentPoint.altitude / (trajectorySummary.maxAltitude * 1.1)) * 310 - 30})`}>
                            {/* Suspension Rigging Cords */}
                            <line x1="-24" y1="-12" x2="0" y2="28" stroke="#f97316" strokeWidth="1.5" opacity="0.9" />
                            <line x1="-12" y1="-12" x2="0" y2="28" stroke="#f97316" strokeWidth="1.5" opacity="0.9" />
                            <line x1="0" y1="-12" x2="0" y2="28" stroke="#f2f5f8" strokeWidth="1.5" opacity="0.9" />
                            <line x1="12" y1="-12" x2="0" y2="28" stroke="#f97316" strokeWidth="1.5" opacity="0.9" />
                            <line x1="24" y1="-12" x2="0" y2="28" stroke="#f97316" strokeWidth="1.5" opacity="0.9" />

                            {/* Parachute Canopy Dome */}
                            <path
                              d="M -30 -12 Q 0 -45 30 -12 Q 15 -20 0 -20 Q -15 -20 -30 -12 Z"
                              fill="#f97316"
                              stroke="#ffffff"
                              strokeWidth="2"
                            />

                            {/* Canopy White Striped Gores */}
                            <path
                              d="M -15 -18 Q 0 -45 15 -18 Q 0 -22 -15 -18 Z"
                              fill="#ffffff"
                              opacity="0.8"
                            />

                            {/* Parachute Pulse Aura */}
                            <ellipse cx="0" cy="-26" rx="28" ry="14" fill="#38bdf8" opacity="0.2" className="animate-pulse" />

                            {/* Rocket Node underneath parachute */}
                            <circle cx="0" cy="28" r="8" fill="#10b981" className="animate-ping" />
                            <circle cx="0" cy="28" r="5" fill="#059669" stroke="#ffffff" strokeWidth="2" />

                            {/* Parachute Text Badge */}
                            <g transform="translate(18, -25)">
                              <rect x="0" y="0" width="230" height="24" rx="6" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
                              <text x="10" y="16" fill="#34d399" fontSize="11" fontFamily="monospace" fontWeight="bold">
                                🪂 PARAQUEDAS ABERTO ({currentPoint.phase})
                              </text>
                            </g>
                          </g>
                        )}

                        {/* Standard Coasting / Apogee Dot (When not burning fire and not descent parachute) */}
                        {(currentPoint.time > params.burnTime && currentPoint.time <= trajectorySummary.timeToApogee) && (
                          <g transform={`translate(${(currentPoint.time / trajectorySummary.totalFlightTime) * 1000}, ${330 - (currentPoint.altitude / (trajectorySummary.maxAltitude * 1.1)) * 310})`}>
                            <circle r="8" fill="#38bdf8" className="animate-ping" />
                            <circle r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                            <g transform="translate(12, -10)">
                              <rect x="0" y="0" width="180" height="22" rx="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                              <text x="8" y="15" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                                🚀 VOO INERCIAL / COASTING
                              </text>
                            </g>
                          </g>
                        )}
                      </g>
                    )}
                  </svg>
                </div>
              </div>

              {/* Telemetry Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#05070A] border border-slate-800 p-3.5 rounded-xl space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase">Fase de Voo</div>
                  <div className="text-sm font-bold text-cyan-400 uppercase">{currentPoint?.phase || 'Pronto'}</div>
                </div>

                <div className="bg-[#05070A] border border-slate-800 p-3.5 rounded-xl space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase">Altitude Atual</div>
                  <div className="text-sm font-bold text-emerald-400">{currentPoint?.altitude || 0} m</div>
                </div>

                <div className="bg-[#05070A] border border-slate-800 p-3.5 rounded-xl space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase">Velocidade Atual</div>
                  <div className="text-sm font-bold text-blue-400">{currentPoint?.velocity || 0} m/s (Mach {currentPoint?.mach || 0})</div>
                </div>

                <div className="bg-[#05070A] border border-slate-800 p-3.5 rounded-xl space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase">Aceleração G</div>
                  <div className="text-sm font-bold text-amber-400">{currentPoint?.acceleration || 0} G</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};
