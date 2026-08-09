import React, { useState, useEffect } from 'react';
import { TelemetryPacket } from '../types';
import { Activity, Play, Pause, RotateCcw, Download, Radio, ShieldCheck, Cpu, Navigation, Thermometer, Battery, Signal } from 'lucide-react';

export const TelemetryPanel: React.FC = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [packetCount, setPacketCount] = useState(142);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPacket[]>([]);

  // Current Live Telemetry Packet State
  const [currentPacket, setCurrentPacket] = useState<TelemetryPacket>({
    timestamp: Date.now(),
    altitude: 0,
    maxAltitude: 485.2,
    accelX: 0.02,
    accelY: 0.98,
    accelZ: 0.01,
    gyroX: 0.1,
    gyroY: -0.2,
    gyroZ: 0.05,
    temperature: 24.5,
    pressure: 1013.25,
    batteryVoltage: 7.8,
    rssi: -68,
    satellites: 11,
    lat: -25.4489,
    lng: -49.2312,
    flightState: 'PRÓ-LANÇAMENTO'
  });

  // Simulated Live Stream Effect
  useEffect(() => {
    if (!isStreaming) return;

    let timeSec = 0;
    const interval = setInterval(() => {
      timeSec += 0.2;
      setPacketCount((prev) => prev + 1);

      setCurrentPacket((prev) => {
        let nextAlt = prev.altitude;
        let state = prev.flightState;

        if (timeSec < 3) {
          state = 'EM RAMPA';
          nextAlt = 0;
        } else if (timeSec < 8) {
          state = 'PROPULSÃO';
          nextAlt = Math.min(485, prev.altitude + Math.random() * 25 + 15);
        } else if (timeSec < 15) {
          state = 'SUBIDA LIVRE';
          nextAlt = Math.min(485, prev.altitude + Math.random() * 8 + 2);
        } else if (timeSec < 17) {
          state = 'APOGEU (EJEÇÃO)';
          nextAlt = 485.2;
        } else if (timeSec < 35) {
          state = 'DESCIDA DROGUE';
          nextAlt = Math.max(120, prev.altitude - (Math.random() * 12 + 10));
        } else if (timeSec < 55) {
          state = 'DESCIDA PRINCIPAL';
          nextAlt = Math.max(0, prev.altitude - (Math.random() * 4 + 2));
        } else {
          state = 'SOLO ENCONTRADO';
          nextAlt = 0;
          setIsStreaming(false);
        }

        const newPacket: TelemetryPacket = {
          timestamp: Date.now(),
          altitude: parseFloat(nextAlt.toFixed(1)),
          maxAltitude: 485.2,
          accelX: parseFloat(((Math.random() - 0.5) * 0.4).toFixed(2)),
          accelY: parseFloat((state === 'PROPULSÃO' ? 8.5 + Math.random() * 2 : 1.0).toFixed(2)),
          accelZ: parseFloat(((Math.random() - 0.5) * 0.4).toFixed(2)),
          gyroX: parseFloat(((Math.random() - 0.5) * 2).toFixed(2)),
          gyroY: parseFloat(((Math.random() - 0.5) * 2).toFixed(2)),
          gyroZ: parseFloat(((Math.random() - 0.5) * 2).toFixed(2)),
          temperature: parseFloat((24.5 + (state === 'PROPULSÃO' ? 5.2 : 0)).toFixed(1)),
          pressure: parseFloat((1013.25 - nextAlt * 0.12).toFixed(1)),
          batteryVoltage: parseFloat((7.8 - timeSec * 0.002).toFixed(2)),
          rssi: Math.floor(-65 - Math.random() * 10),
          satellites: 11,
          lat: -25.4489 + (timeSec * 0.00002),
          lng: -49.2312 + (timeSec * 0.000015),
          flightState: state
        };

        setTelemetryHistory((h) => [newPacket, ...h.slice(0, 40)]);
        return newPacket;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(telemetryHistory, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `telemetria_lora_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4">
      {/* Title & Control Bar */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-4 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-[10px] uppercase tracking-wider mb-0.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            Estação de Solo & Telemetria LoRa SX1276 (915 MHz)
          </div>
          <h2 className="text-xl font-bold font-italic-title text-slate-900 dark:text-white tracking-tight">Painel de Telemetria em Tempo Real</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Recepção contínua de pacotes aviônicos via radiofrequência, altímetro MS5611 e IMU de 6 eixos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition shadow ${
              isStreaming
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isStreaming ? 'Pausar Recepção' : 'Iniciar Simulação de Voo'}
          </button>

          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded text-xs font-mono font-medium transition"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            JSON Pacotes
          </button>
        </div>
      </div>

      {/* Flight State Banner */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg font-mono">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <div>
            <div className="text-[9px] text-slate-500 uppercase">Estado Atual de Voo (State Machine)</div>
            <div className="text-base font-bold text-cyan-400 tracking-wider">
              {currentPacket.flightState}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5 text-xs">
          <div>
            <span className="text-slate-500 block text-[9px]">PACOTES RECEBIDOS</span>
            <span className="text-white font-bold">{packetCount} pkts</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px]">SINAL LORA (RSSI)</span>
            <span className="text-emerald-400 font-bold">{currentPacket.rssi} dBm</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px]">SATÉLITES GPS</span>
            <span className="text-blue-400 font-bold">{currentPacket.satellites} sats</span>
          </div>
        </div>
      </div>

      {/* High Density Metric Gauges & Sensors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Gauge 1: Altitude */}
        <div className="bg-[#111827] border border-slate-800 rounded-lg p-3 shadow-md space-y-1.5 border-l-2 border-l-blue-500">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <span>ALTITUDE (BARÔMETRO)</span>
            <Activity className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400 font-mono">{currentPacket.altitude} m</div>
          <div className="text-[10px] text-slate-400 font-mono flex justify-between pt-1 border-t border-slate-800/80">
            <span>Apogeu: <strong className="text-emerald-400">{currentPacket.maxAltitude} m</strong></span>
            <span>Pressão: {currentPacket.pressure} hPa</span>
          </div>
        </div>

        {/* Gauge 2: Acceleration Y */}
        <div className="bg-[#111827] border border-slate-800 rounded-lg p-3 shadow-md space-y-1.5 border-l-2 border-l-orange-500">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <span>ACELERAÇÃO VERTICAL (G)</span>
            <Cpu className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-orange-400 font-mono">{currentPacket.accelY} G</div>
          <div className="text-[10px] text-slate-400 font-mono flex justify-between pt-1 border-t border-slate-800/80">
            <span>X: {currentPacket.accelX} G</span>
            <span>Z: {currentPacket.accelZ} G</span>
          </div>
        </div>

        {/* Gauge 3: Temperature & Battery */}
        <div className="bg-[#111827] border border-slate-800 rounded-lg p-3 shadow-md space-y-1.5 border-l-2 border-l-emerald-500">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <span>TEMPERATURA / LIPO</span>
            <Thermometer className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{currentPacket.temperature} °C</div>
          <div className="text-[10px] text-slate-400 font-mono flex justify-between pt-1 border-t border-slate-800/80">
            <span>LiPo: <strong className="text-emerald-400">{currentPacket.batteryVoltage} V</strong></span>
            <span>Status: Nominal</span>
          </div>
        </div>

        {/* Gauge 4: GPS Coordinates */}
        <div className="bg-[#111827] border border-slate-800 rounded-lg p-3 shadow-md space-y-1.5 border-l-2 border-l-purple-500">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <span>COORDENADAS GPS</span>
            <Navigation className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-[11px] font-mono text-purple-300 font-bold leading-snug">
            <div>Lat: {currentPacket.lat.toFixed(5)}</div>
            <div>Lng: {currentPacket.lng.toFixed(5)}</div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/80 flex justify-between">
            <span>3D GPS Lock</span>
            <span className="text-purple-400 font-bold">Resgate OK</span>
          </div>
        </div>
      </div>

      {/* Packet Stream Log Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-4 shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-white flex items-center justify-between font-mono">
          <span className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            Log de Pacotes Recebidos (Stream Hex/JSON)
          </span>
          <span className="text-[10px] text-slate-500 font-normal">Exibindo últimos 40 pacotes</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-[#05070A] text-slate-400 border-b border-slate-800 text-[10px] uppercase">
              <tr>
                <th className="p-2">Horário</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Altitude</th>
                <th className="p-2">Accel (G)</th>
                <th className="p-2">Temp</th>
                <th className="p-2">Bateria</th>
                <th className="p-2">RSSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-[11px]">
              {telemetryHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-3 text-center text-slate-500">
                    Nenhum pacote capturado. Clique em "Iniciar Simulação de Voo" para receber telemetria em tempo real.
                  </td>
                </tr>
              ) : (
                telemetryHistory.map((pkt, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition">
                    <td className="p-2 text-slate-400">{new Date(pkt.timestamp).toLocaleTimeString()}</td>
                    <td className="p-2 font-bold text-cyan-400">{pkt.flightState}</td>
                    <td className="p-2 font-bold text-emerald-400">{pkt.altitude} m</td>
                    <td className="p-2">{pkt.accelY} G</td>
                    <td className="p-2">{pkt.temperature} °C</td>
                    <td className="p-2 text-slate-300">{pkt.batteryVoltage} V</td>
                    <td className="p-2 text-slate-400">{pkt.rssi} dBm</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
