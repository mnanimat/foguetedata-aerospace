import React, { useState, useMemo } from 'react';
import { RocketParams } from '../types';
import { calculatePreciseTrajectory, TrajectorySummary } from '../utils/rocketPhysics';
import { Rocket3DViewer } from './Rocket3DViewer';
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
  X
} from 'lucide-react';

export const FlightSimulator: React.FC = () => {
  // Rocket Parameters State with High-Precision Recovery & Atmosphere Defaults
  const [params, setParams] = useState<RocketParams>({
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
    drogueDiameter: 0.35, // m drogue chute diameter
    drogueCd: 1.5, // drogue chute drag coefficient
    mainDeployAlt: 150, // m main deployment altitude
    mainDiameter: 1.15, // m main chute diameter
    mainCd: 2.2 // main chute drag coefficient
  });

  const [activeSubTab, setActiveSubTab] = useState<'sim' | 'params' | 'formulas'>('sim');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [showAdvancedFormulas, setShowAdvancedFormulas] = useState(true);
  const [isTrajectoryExpanded, setIsTrajectoryExpanded] = useState(false);

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

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 light:bg-slate-200 light:hover:bg-slate-300 text-slate-200 dark:text-slate-200 light:text-slate-800 border border-slate-700 dark:border-slate-700 light:border-slate-300 text-xs px-3 py-1.5 rounded font-mono font-bold transition shadow"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Sub-tab Switcher Navigation */}
      <div className="flex space-x-2 border-b border-slate-800 dark:border-slate-800 light:border-slate-300 pb-1">
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
              <Rocket3DViewer autoDeployParachute={currentPoint ? (currentPoint.time > trajectorySummary.timeToApogee) : false} />
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
        </div>
      )}

      {/* TAB 2: ROCKET & ATMOSPHERIC PARAMETERS FORM */}
      {activeSubTab === 'params' && (
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
          <div className="bg-[#0B0F19] border border-red-500/50 rounded-2xl max-w-6xl w-full h-[92vh] flex flex-col shadow-2xl overflow-hidden relative text-slate-100">
            
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
