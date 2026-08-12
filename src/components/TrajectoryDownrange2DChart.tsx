import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceDot
} from 'recharts';
import { TrajectorySummary } from '../utils/rocketPhysics';
import { RocketParams } from '../types';
import { MapPin, ArrowUpRight, Wind, Layers, Activity, ShieldCheck, Gauge } from 'lucide-react';

interface TrajectoryDownrange2DChartProps {
  summary: TrajectorySummary;
  params: RocketParams;
}

export const TrajectoryDownrange2DChart: React.FC<TrajectoryDownrange2DChartProps> = ({
  summary,
  params
}) => {
  const [showSecondaryAxis, setShowSecondaryAxis] = useState(true);
  const [showPhaseLines, setShowPhaseLines] = useState(true);
  const [fillArea, setFillArea] = useState(true);

  // Sample data points to ensure performant Recharts rendering (~100-150 points)
  const chartData = useMemo(() => {
    if (!summary.points || summary.points.length === 0) return [];
    
    // Pick downsampled points for clean chart curve
    const step = Math.max(1, Math.floor(summary.points.length / 120));
    const sampled = [];

    for (let i = 0; i < summary.points.length; i += step) {
      const pt = summary.points[i];
      sampled.push({
        time: pt.time,
        xPos: Math.round(pt.xPos * 10) / 10, // Downrange distance (m)
        zPos: Math.round((pt.zPos || 0) * 10) / 10, // Crossrange distance (m)
        altitude: Math.round(pt.altitude * 10) / 10, // Altitude (m)
        velocity: Math.round(pt.velocity * 10) / 10, // Velocity (m/s)
        mach: Math.round(pt.mach * 100) / 100, // Mach number
        phase: pt.phase,
        drift: Math.round(pt.driftDistance * 10) / 10
      });
    }

    // Ensure last touchdown point is included
    const last = summary.points[summary.points.length - 1];
    if (sampled[sampled.length - 1]?.time !== last.time) {
      sampled.push({
        time: last.time,
        xPos: Math.round(last.xPos * 10) / 10,
        zPos: Math.round((last.zPos || 0) * 10) / 10,
        altitude: Math.round(last.altitude * 10) / 10,
        velocity: Math.round(last.velocity * 10) / 10,
        mach: Math.round(last.mach * 100) / 100,
        phase: last.phase,
        drift: Math.round(last.driftDistance * 10) / 10
      });
    }

    return sampled;
  }, [summary.points]);

  // Find Apogee Point
  const apogeePoint = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;
    let maxPt = chartData[0];
    for (const pt of chartData) {
      if (pt.altitude > maxPt.altitude) {
        maxPt = pt;
      }
    }
    return maxPt;
  }, [chartData]);

  // Find Burnout Point
  const burnoutPoint = useMemo(() => {
    return chartData.find((pt) => pt.time >= params.burnTime) || null;
  }, [chartData, params.burnTime]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0b0f19]/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/80 shadow-2xl font-mono text-xs text-slate-200 space-y-1.5 min-w-56">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5 font-bold">
            <span className="text-cyan-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> t = {data.time}s
            </span>
            <span className="text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] uppercase">
              {data.phase}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
            <span className="text-slate-400">Alcance (X):</span>
            <span className="text-right font-bold text-white">{data.xPos} m</span>

            <span className="text-slate-400">Altitude (Y):</span>
            <span className="text-right font-bold text-emerald-400">{data.altitude} m</span>

            <span className="text-slate-400">Velocidade:</span>
            <span className="text-right font-bold text-blue-400">{data.velocity} m/s</span>

            <span className="text-slate-400">Número Mach:</span>
            <span className="text-right font-bold text-purple-400">Mach {data.mach}</span>

            <span className="text-slate-400">Deriva Plana:</span>
            <span className="text-right font-bold text-orange-400">{data.drift} m</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#05070A] dark:bg-[#05070A] light:bg-white p-4 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-xl space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-100 dark:text-white light:text-slate-900 flex items-center gap-2">
              Perfil Tridimensional de Voo: Altitude vs Alcance Horizontal (Downrange)
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Curva 2D detalhada da trajetória balística, apogeu e ponto de dispersão sob influência do vento
            </p>
          </div>
        </div>

        {/* Toggle Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setShowSecondaryAxis(!showSecondaryAxis)}
            className={`px-2.5 py-1 rounded border transition cursor-pointer flex items-center gap-1 ${
              showSecondaryAxis
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-300 font-bold'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            Eixo Velocidade (m/s)
          </button>

          <button
            onClick={() => setShowPhaseLines(!showPhaseLines)}
            className={`px-2.5 py-1 rounded border transition cursor-pointer flex items-center gap-1 ${
              showPhaseLines
                ? 'bg-amber-600/20 border-amber-500/50 text-amber-300 font-bold'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Marcos de Fase (Apogeu/Burnout)
          </button>

          <button
            onClick={() => setFillArea(!fillArea)}
            className={`px-2.5 py-1 rounded border transition cursor-pointer flex items-center gap-1 ${
              fillArea
                ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300 font-bold'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Preenchimento Gradiente
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <div className="text-slate-400 text-[10px]">Apogeu Máximo (Y):</div>
          <div className="text-emerald-400 font-bold text-sm">{summary.maxAltitude} m</div>
          <div className="text-[10px] text-slate-500">aos {summary.timeToApogee}s de voo</div>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <div className="text-slate-400 text-[10px]">Alcance Final no Solo (X):</div>
          <div className="text-cyan-400 font-bold text-sm">{summary.driftDistance} m</div>
          <div className="text-[10px] text-slate-500">Deslocamento horizontal</div>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <div className="text-slate-400 text-[10px]">Velocidade Pico:</div>
          <div className="text-blue-400 font-bold text-sm">{summary.maxVelocity} m/s</div>
          <div className="text-[10px] text-slate-500">Mach {summary.maxMach.toFixed(2)}</div>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <div className="text-slate-400 text-[10px]">Condição do Vento:</div>
          <div className="text-orange-400 font-bold text-sm flex items-center gap-1">
            <Wind className="w-3 h-3" /> {params.windSpeed} km/h
          </div>
          <div className="text-[10px] text-slate-500">Direção: {params.windDirection ?? 90}°</div>
        </div>
      </div>

      {/* Recharts Chart Container */}
      <div className="h-80 w-full bg-[#030508] p-2 rounded-lg border border-slate-800/80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
            <defs>
              <linearGradient id="altitudeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />

            {/* X-Axis: Alcance Horizontal Downrange (X Pos in m) */}
            <XAxis
              dataKey="xPos"
              type="number"
              domain={['auto', 'auto']}
              unit="m"
              stroke="#64748b"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              label={{
                value: 'Alcance Horizontal Downrange (X em metros)',
                position: 'insideBottom',
                offset: -12,
                fill: '#94a3b8',
                fontSize: 11
              }}
            />

            {/* Primary Y-Axis: Altitude (m) */}
            <YAxis
              yAxisId="left"
              unit="m"
              stroke="#06b6d4"
              tick={{ fontSize: 11, fill: '#38bdf8' }}
              label={{
                value: 'Altitude (metros)',
                angle: -90,
                position: 'insideLeft',
                fill: '#38bdf8',
                fontSize: 11
              }}
            />

            {/* Secondary Y-Axis: Velocity (m/s) */}
            {showSecondaryAxis && (
              <YAxis
                yAxisId="right"
                orientation="right"
                unit="m/s"
                stroke="#3b82f6"
                tick={{ fontSize: 11, fill: '#60a5fa' }}
                label={{
                  value: 'Velocidade (m/s)',
                  angle: 90,
                  position: 'insideRight',
                  fill: '#60a5fa',
                  fontSize: 11
                }}
              />
            )}

            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />

            {/* Altitude Area / Line */}
            {fillArea ? (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="altitude"
                name="Altitude (m)"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fill="url(#altitudeGradient)"
              />
            ) : (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="altitude"
                name="Altitude (m)"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={false}
              />
            )}

            {/* Velocity Line on Secondary Axis */}
            {showSecondaryAxis && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="velocity"
                name="Velocidade (m/s)"
                stroke="#3b82f6"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            )}

            {/* Phase Reference Markers */}
            {showPhaseLines && apogeePoint && (
              <ReferenceLine
                yAxisId="left"
                x={apogeePoint.xPos}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{
                  value: `Apogeu: ${apogeePoint.altitude}m`,
                  position: 'top',
                  fill: '#f87171',
                  fontSize: 10,
                  fontFamily: 'monospace'
                }}
              />
            )}

            {showPhaseLines && apogeePoint && (
              <ReferenceDot
                yAxisId="left"
                x={apogeePoint.xPos}
                y={apogeePoint.altitude}
                r={6}
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth={2}
              />
            )}

            {showPhaseLines && burnoutPoint && (
              <ReferenceDot
                yAxisId="left"
                x={burnoutPoint.xPos}
                y={burnoutPoint.altitude}
                r={4}
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth={1.5}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Modelo Balístico FogueteData Aerospace - Resolução RK4 Integrada
        </span>
        <span className="text-slate-500">
          Trajetória em Função da Deriva Planar $(x, z)$
        </span>
      </div>
    </div>
  );
};
