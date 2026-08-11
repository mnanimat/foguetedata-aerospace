import React, { useState, useEffect, useRef } from 'react';
import { SUBSYSTEMS_DATA } from '../data/knowledgeData';
import { PcbStudio2D3D } from './PcbStudio2D3D';
import { 
  Cpu, Flame, Layers, ShieldCheck, Zap, Code, CheckCircle, ExternalLink, Box, Download, Sparkles,
  Play, Square, Radio, Activity, Gauge, Terminal, Copy, RotateCcw, Scissors, Sliders,
  ShieldAlert, Battery, Check, Volume2, VolumeX, RefreshCw
} from 'lucide-react';

export const SubsystemsDetail: React.FC = () => {
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('propulsao-solida');

  // Electronics Assembly Bench State
  const [connectedModules, setConnectedModules] = useState<{ [key: string]: boolean }>({
    esp32: true,
    bmp280: true,
    mpu6050: true,
    lora: true,
    mosfet: true,
    gps: true,
    battery: true
  });

  // Bench Power & Tools State
  const [benchPowerOn, setBenchPowerOn] = useState<boolean>(true);
  const [powerVoltage, setPowerVoltage] = useState<number>(3.3);
  const [multimeterMode, setMultimeterMode] = useState<'voltage' | 'continuity' | 'current'>('voltage');
  const [multimeterProbePinA, setMultimeterProbePinA] = useState<string>('ESP32_VCC');
  const [multimeterProbePinB, setMultimeterProbePinB] = useState<string>('ESP32_GND');
  const [oscilloscopeChannel, setOscilloscopeChannel] = useState<'i2c' | 'pwm' | 'lora_rf'>('i2c');
  const [selectedWireColor, setSelectedWireColor] = useState<string>('#ef4444'); // Default Red VCC

  // Live Test Simulation States
  const [simulatedAltitude, setSimulatedAltitude] = useState<number>(1250);
  const [simulatedPitch, setSimulatedPitch] = useState<number>(12);
  const [simulatedRoll, setSimulatedRoll] = useState<number>(3);
  const [ejectionCountdown, setEjectionCountdown] = useState<number | null>(null);
  const [ejectionFired, setEjectionFired] = useState<boolean>(false);
  const [isTransmittingLoRa, setIsTransmittingLoRa] = useState<boolean>(false);

  // Serial Monitor Terminal State
  const [serialLogs, setSerialLogs] = useState<string[]>([]);
  const [isTerminalPaused, setIsTerminalPaused] = useState<boolean>(false);
  const serialTerminalRef = useRef<HTMLDivElement>(null);

  // Flash Firmware Sim State
  const [flashProgress, setFlashProgress] = useState<number | null>(null);
  const [codeCopied, setCodeCopied] = useState<boolean>(false);

  const toggleModule = (id: string) => {
    setConnectedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Calculate live power consumption in mA
  const calculateCurrentDraw = () => {
    if (!benchPowerOn) return 0;
    let current = 25; // Base ESP32 idle
    if (connectedModules.esp32) current += 60;
    if (connectedModules.bmp280) current += 2;
    if (connectedModules.mpu6050) current += 5;
    if (connectedModules.lora) current += isTransmittingLoRa ? 120 : 15;
    if (connectedModules.mosfet && ejectionFired) current += 1800; // Peak igniter current
    if (connectedModules.gps) current += 35;
    return current;
  };

  // Ejection Countdown Handler
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (ejectionCountdown !== null && ejectionCountdown > 0) {
      timer = setTimeout(() => {
        setEjectionCountdown(ejectionCountdown - 1);
      }, 1000);
    } else if (ejectionCountdown === 0) {
      setEjectionFired(true);
      setEjectionCountdown(null);
      setSerialLogs((prev) => [
        ...prev,
        `[CRITICAL] >>> DISPARO DE EJEÇÃO EXECUTADO! CANAL MOSFET ATIVADO (PULSO 1000ms) <<<`
      ]);
      setTimeout(() => setEjectionFired(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [ejectionCountdown]);

  // Telemetry Serial Terminal Stream Generator
  useEffect(() => {
    if (!benchPowerOn || !connectedModules.esp32 || isTerminalPaused) return;

    const interval = setInterval(() => {
      const now = new Date().toISOString().split('T')[1].slice(0, 8);
      const press = (1013.25 * Math.exp(-simulatedAltitude / 8430)).toFixed(1);
      const pkt = `$PKT,${now},ALT=${simulatedAltitude}m,PRESS=${press}hPa,PITCH=${simulatedPitch}°,ROLL=${simulatedRoll}°,LORA=${connectedModules.lora ? 'OK' : 'OFF'}*CRC`;
      
      setSerialLogs((prev) => [...prev.slice(-30), pkt]);
    }, 1500);

    return () => clearInterval(interval);
  }, [benchPowerOn, connectedModules, simulatedAltitude, simulatedPitch, simulatedRoll, isTerminalPaused]);

  // Auto Scroll Serial Terminal
  useEffect(() => {
    if (serialTerminalRef.current && !isTerminalPaused) {
      serialTerminalRef.current.scrollTop = serialTerminalRef.current.scrollHeight;
    }
  }, [serialLogs, isTerminalPaused]);

  // Dynamic C++ Code Generation based on connected modules
  const generateArduinoCode = () => {
    let includes = `#include <Wire.h>\n#include <SPI.h>\n`;
    let defines = `#define PIN_SYSTEM_LED 2\n`;
    let globals = ``;
    let setupCode = `void setup() {\n  Serial.begin(115200);\n  pinMode(PIN_SYSTEM_LED, OUTPUT);\n`;
    let loopCode = `void loop() {\n  digitalWrite(PIN_SYSTEM_LED, HIGH);\n`;

    if (connectedModules.bmp280) {
      includes += `#include <Adafruit_BMP280.h>\n`;
      globals += `Adafruit_BMP280 bmp;\n`;
      setupCode += `  if (!bmp.begin(0x76)) {\n    Serial.println("Erro: Barometro BMP280 ausente!");\n  }\n`;
      loopCode += `  float altitude = bmp.readAltitude(1013.25);\n  Serial.print("Altitude: "); Serial.println(altitude);\n`;
    }

    if (connectedModules.mpu6050) {
      includes += `#include <Adafruit_MPU6050.h>\n`;
      globals += `Adafruit_MPU6050 mpu;\n`;
      setupCode += `  if (!mpu.begin()) {\n    Serial.println("Erro: IMU MPU6050 ausente!");\n  }\n`;
      loopCode += `  sensors_event_t a, g, temp;\n  mpu.getEvent(&a, &g, &temp);\n`;
    }

    if (connectedModules.lora) {
      includes += `#include <LoRa.h>\n`;
      defines += `#define LORA_CS 5\n#define LORA_RST 14\n#define LORA_IRQ 2\n`;
      setupCode += `  LoRa.setPins(LORA_CS, LORA_RST, LORA_IRQ);\n  if (!LoRa.begin(915E6)) {\n    Serial.println("Erro: Radio LoRa 915MHz falhou!");\n  }\n`;
      loopCode += `  LoRa.beginPacket();\n  LoRa.print("TELEMETRIA_VOO_FOGUETEDATA");\n  LoRa.endPacket();\n`;
    }

    if (connectedModules.mosfet) {
      defines += `#define PIN_MOSFET_DROGUE 12\n#define PIN_MOSFET_MAIN 27\n`;
      setupCode += `  pinMode(PIN_MOSFET_DROGUE, OUTPUT);\n  pinMode(PIN_MOSFET_MAIN, OUTPUT);\n  digitalWrite(PIN_MOSFET_DROGUE, LOW);\n  digitalWrite(PIN_MOSFET_MAIN, LOW);\n`;
      loopCode += `  // Algoritmo de Deteccao de Apogeu e Disparo de Ejeção\n  if (altitude > 1000 && deltaAlt < -2.0) {\n    digitalWrite(PIN_MOSFET_DROGUE, HIGH);\n    delay(1000);\n    digitalWrite(PIN_MOSFET_DROGUE, LOW);\n  }\n`;
    }

    setupCode += `  Serial.println(">>> Aviônica Inicializada com Sucesso! <<<");\n}\n`;
    loopCode += `  digitalWrite(PIN_SYSTEM_LED, LOW);\n  delay(200);\n}\n`;

    return `/*\n * FogueteData Aerospace - Firmware Aviônico de Voo Gerado\n * Microcontrolador: ESP32-S3 + Módulos de Bancada Ativos\n */\n\n${includes}\n${defines}\n${globals}\n${setupCode}\n${loopCode}`;
  };

  const activeSubsystem = SUBSYSTEMS_DATA.find((s) => s.id === selectedSubsystem) || SUBSYSTEMS_DATA[0];

  const handleFlashFirmware = () => {
    setFlashProgress(0);
    const interval = setInterval(() => {
      setFlashProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          setSerialLogs((l) => [...l, `[SYSTEM] Firmware C++ gravado com sucesso na memória Flash do ESP32-S3!`]);
          setTimeout(() => setFlashProgress(null), 1500);
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateArduinoCode());
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  // Calculate Multimeter Reading
  const getMultimeterReading = () => {
    if (!benchPowerOn) return '0.00 V (DESLIGADO)';
    if (multimeterMode === 'voltage') {
      if (multimeterProbePinA.includes('VCC') && multimeterProbePinB.includes('GND')) {
        return `${powerVoltage.toFixed(2)} V DC`;
      } else if (multimeterProbePinA.includes('MOSFET') && ejectionFired) {
        return '11.10 V DC (DISPARO ATIVO)';
      } else {
        return '3.28 V DC (Sinal lógico)';
      }
    } else if (multimeterMode === 'continuity') {
      const isContinuous = connectedModules.mosfet && connectedModules.esp32;
      return isContinuous ? '🔔 FECHADO (BIP! 0.1 Ω)' : '❌ ABERTO (Infinito Ω)';
    } else {
      return `${calculateCurrentDraw()} mA`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Title Header */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-4 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-[10px] uppercase tracking-wider mb-0.5">
            <Layers className="w-3.5 h-3.5" />
            Engenharia de Subsistemas e Motores
          </div>
          <h2 className="text-xl font-bold font-italic-title text-slate-900 dark:text-white tracking-tight">Detalhamento Técnico de Partes e Eletrônica</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Explore especificações completas de estruturas, propulsão sólida, híbrida e líquida, e bancada de montagem de eletrônica no navegador.
          </p>
        </div>
      </div>

      {/* Subsystem Selection Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {SUBSYSTEMS_DATA.map((sub) => {
          const isSelected = sub.id === selectedSubsystem;
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubsystem(sub.id)}
              className={`p-3 rounded border text-left transition ${
                isSelected
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow font-bold'
                  : 'bg-[#111827] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="text-[9px] uppercase font-mono text-blue-400 mb-0.5">{sub.category}</div>
              <div className="text-xs font-bold line-clamp-1">{sub.name}</div>
            </button>
          );
        })}
      </div>

      {/* Selected Subsystem Detailed Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-4 lg:p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
              {activeSubsystem.category}
            </span>
            <h3 className="text-xl font-bold text-white mt-1.5">{activeSubsystem.name}</h3>
            <p className="text-xs text-slate-300 mt-0.5">{activeSubsystem.shortDesc}</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="bg-[#05070A] p-3 rounded border border-slate-800/80 space-y-1.5">
            <h4 className="font-bold text-white text-xs font-mono uppercase">Detalhamento e Funcionamento Físico</h4>
            <p>{activeSubsystem.fullDetails}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#05070A] p-3 rounded border border-slate-800/80 space-y-1.5">
              <h4 className="font-bold text-emerald-400 text-xs font-mono uppercase">Materiais e Componentes Recomendados</h4>
              <ul className="list-disc pl-4 space-y-0.5">
                {activeSubsystem.materialsOrComponents.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-[#05070A] p-3 rounded border border-slate-800/80 space-y-1.5">
              <h4 className="font-bold text-amber-400 text-xs font-mono uppercase">Normas de Segurança & Alertas de Voo</h4>
              <p>{activeSubsystem.safetyNotes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* BANCADA DE MONTAGEM DE ELETRÔNICA NO NAVEGADOR - INTERATIVA */}
      <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-4 lg:p-6 shadow-2xl space-y-6 font-mono text-xs">
        
        {/* Bench Top Controls & Status Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-[10px] uppercase tracking-widest mb-1">
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              Bancada Interativa de Eletrônica Aviônica
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Montagem e Fiação Virtual no Navegador</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Laboratório virtual de fiação, instrumentos de bancada, simulação de sensores e gravação de firmware C++.
            </p>
          </div>

          {/* Bench Power Station Controls */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setBenchPowerOn(!benchPowerOn)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 transition shadow ${
                benchPowerOn
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
                  : 'bg-red-950 text-red-400 border border-red-800 hover:bg-red-900'
              }`}
            >
              <Battery className="w-4 h-4" />
              Fonte: {benchPowerOn ? 'LIGADA (3.3V/5V)' : 'DESLIGADA'}
            </button>

            {benchPowerOn && (
              <div className="flex items-center gap-2 text-[11px] text-slate-300">
                <span className="text-slate-400">Consumo:</span>
                <strong className="text-amber-400 font-bold">{calculateCurrentDraw()} mA</strong>
                <span className="text-slate-500">({((calculateCurrentDraw() * powerVoltage) / 1000).toFixed(2)} W)</span>
              </div>
            )}
          </div>
        </div>

        {/* BENCH INSTRUMENTATION TABS (Multímetro, Osciloscópio, Seletor de Fios) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Tool 1: Digital Multimeter */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-amber-400" /> Multímetro Digital de Bancada
              </span>
              <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                True RMS
              </span>
            </div>

            <div className="bg-emerald-950/80 border border-emerald-800 p-3 rounded-lg text-center space-y-1">
              <div className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">
                Leitura do Multímetro ({multimeterMode.toUpperCase()})
              </div>
              <div className="text-xl font-black text-emerald-300">{getMultimeterReading()}</div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <button
                onClick={() => setMultimeterMode('voltage')}
                className={`py-1 rounded border text-center font-bold ${
                  multimeterMode === 'voltage' ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Tensão (V)
              </button>
              <button
                onClick={() => setMultimeterMode('continuity')}
                className={`py-1 rounded border text-center font-bold ${
                  multimeterMode === 'continuity' ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Continuidade (Ω)
              </button>
              <button
                onClick={() => setMultimeterMode('current')}
                className={`py-1 rounded border text-center font-bold ${
                  multimeterMode === 'current' ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Corrente (mA)
              </button>
            </div>
          </div>

          {/* Tool 2: Virtual Bench Oscilloscope */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" /> Osciloscópio de Sinal 2-Canais
              </span>
              <select
                value={oscilloscopeChannel}
                onChange={(e) => setOscilloscopeChannel(e.target.value as any)}
                className="bg-slate-900 text-cyan-300 border border-slate-800 rounded px-2 py-0.5 text-[10px]"
              >
                <option value="i2c">Sinal I2C (SCL/SDA 400kHz)</option>
                <option value="pwm">Sinal PWM Ejeção Mosfet</option>
                <option value="lora_rf">Pulso RF LoRa 915MHz</option>
              </select>
            </div>

            {/* Canvas/Waveform Visualizer */}
            <div className="bg-slate-900 border border-slate-800 h-24 rounded-lg flex items-center justify-center p-2 relative overflow-hidden">
              <svg className="w-full h-full text-cyan-400 stroke-current fill-none stroke-2">
                {oscilloscopeChannel === 'i2c' && (
                  <path d="M 0,20 L 20,20 L 20,60 L 40,60 L 40,20 L 60,20 L 60,60 L 80,60 L 80,20 L 120,20 L 120,60 L 160,60 L 160,20 L 200,20 L 200,60 L 240,60 L 240,20 L 280,20 L 280,60 L 320,60 L 320,20 L 400,20" />
                )}
                {oscilloscopeChannel === 'pwm' && (
                  <path d="M 0,60 L 80,60 L 80,15 L 180,15 L 180,60 L 280,60 L 280,15 L 380,15" />
                )}
                {oscilloscopeChannel === 'lora_rf' && (
                  <path d="M 0,40 Q 10,10 20,40 T 40,40 T 60,40 T 80,40 T 100,40 Q 110,5 120,40 T 140,40 T 160,40 T 180,40 Q 190,0 200,40 T 220,40 T 240,40 T 260,40" />
                )}
              </svg>
              <div className="absolute top-1 left-2 text-[9px] text-slate-500 font-mono">50μs/div | 1.0V/div</div>
            </div>
          </div>

          {/* Tool 3: Wire & Cable Station */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="font-bold text-purple-400 flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-purple-400" /> Cor e Conexão dos Fios
              </span>
              <button
                onClick={() => setConnectedModules({ esp32: true, bmp280: true, mpu6050: true, lora: true, mosfet: true, gps: true, battery: true })}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 underline"
              >
                Restaurar Padrão BAR-AEB
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] text-slate-400">Escolha a cor do fio virtual para conexão:</div>
              <div className="flex items-center gap-2">
                {[
                  { color: '#ef4444', label: 'VCC (+3.3V/5V)' },
                  { color: '#10b981', label: 'GND (Terra)' },
                  { color: '#f59e0b', label: 'SDA (I2C)' },
                  { color: '#06b6d4', label: 'SCL (I2C)' },
                  { color: '#3b82f6', label: 'SPI (LoRa)' },
                  { color: '#f97316', label: 'Ignitor (Ejeção)' }
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setSelectedWireColor(c.color)}
                    style={{ backgroundColor: c.color }}
                    title={c.label}
                    className={`w-6 h-6 rounded-full border-2 transition ${
                      selectedWireColor === c.color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80'
                    }`}
                  />
                ))}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Cor Selecionada: <span style={{ color: selectedWireColor }} className="font-bold">
                  {selectedWireColor === '#ef4444' ? 'Alimentação VCC' : selectedWireColor === '#10b981' ? 'Massa GND' : 'Sinal de Dados'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* INTERACTIVE MODULE WIRING BOARD (CANVAS) */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Módulos e Placas Conectadas no Barramento da Aviônica
            </h4>
            <span className="text-[10px] text-slate-400">Clique no módulo para Conectar/Desconectar do Circuito</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            
            {/* Module 1: ESP32-S3 */}
            <div
              onClick={() => toggleModule('esp32')}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 relative overflow-hidden ${
                connectedModules.esp32
                  ? 'bg-blue-950/40 border-blue-500 text-white shadow-lg shadow-blue-950'
                  : 'bg-slate-950/60 border-slate-800 text-slate-600'
              }`}
            >
              <Cpu className={`w-7 h-7 shrink-0 mt-0.5 ${connectedModules.esp32 ? 'text-blue-400' : 'text-slate-600'}`} />
              <div className="space-y-1">
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>MCU Principal ESP32-S3</span>
                  {connectedModules.esp32 && <CheckCircle className="w-4 h-4 text-blue-400" />}
                </div>
                <p className="text-[11px] text-slate-400">Dual Core 240MHz, 8MB Flash, Wi-Fi/BT, 32 GPIOs.</p>
                <div className="text-[10px] font-mono text-blue-300">Pinos Ativos: GPIO 21 (SDA), GPIO 22 (SCL), GPIO 12/27 (Mosfet)</div>
              </div>
            </div>

            {/* Module 2: BMP280 / MS5611 Barometer */}
            <div
              onClick={() => toggleModule('bmp280')}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 relative overflow-hidden ${
                connectedModules.bmp280
                  ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-950'
                  : 'bg-slate-950/60 border-slate-800 text-slate-600'
              }`}
            >
              <Zap className={`w-7 h-7 shrink-0 mt-0.5 ${connectedModules.bmp280 ? 'text-emerald-400' : 'text-slate-600'}`} />
              <div className="space-y-1">
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Altímetro Barométrico BMP280</span>
                  {connectedModules.bmp280 && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400">Pressão barométrica e altitude relativa com precisão de ±0.5m.</p>
                <div className="text-[10px] font-mono text-emerald-300">Barramento: I2C (0x76) - VCC: 3.3V</div>
              </div>
            </div>

            {/* Module 3: MPU6050 IMU */}
            <div
              onClick={() => toggleModule('mpu6050')}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 relative overflow-hidden ${
                connectedModules.mpu6050
                  ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-lg shadow-indigo-950'
                  : 'bg-slate-950/60 border-slate-800 text-slate-600'
              }`}
            >
              <Activity className={`w-7 h-7 shrink-0 mt-0.5 ${connectedModules.mpu6050 ? 'text-indigo-400' : 'text-slate-600'}`} />
              <div className="space-y-1">
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>IMU 6-Eixos MPU6050</span>
                  {connectedModules.mpu6050 && <CheckCircle className="w-4 h-4 text-indigo-400" />}
                </div>
                <p className="text-[11px] text-slate-400">Acelerômetro MEMS 3 eixos + Giroscópio para controle de atitude.</p>
                <div className="text-[10px] font-mono text-indigo-300">Barramento: I2C (0x68) - VCC: 3.3V</div>
              </div>
            </div>

            {/* Module 4: LoRa Telemetry */}
            <div
              onClick={() => toggleModule('lora')}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 relative overflow-hidden ${
                connectedModules.lora
                  ? 'bg-purple-950/40 border-purple-500 text-white shadow-lg shadow-purple-950'
                  : 'bg-slate-950/60 border-slate-800 text-slate-600'
              }`}
            >
              <Radio className={`w-7 h-7 shrink-0 mt-0.5 ${connectedModules.lora ? 'text-purple-400' : 'text-slate-600'}`} />
              <div className="space-y-1">
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Rádio LoRa SX1276 (915 MHz)</span>
                  {connectedModules.lora && <CheckCircle className="w-4 h-4 text-purple-400" />}
                </div>
                <p className="text-[11px] text-slate-400">Transmissão RF de longa distância (até 15 km com antena 5dBi).</p>
                <div className="text-[10px] font-mono text-purple-300">Barramento: SPI (GPIO 5, 18, 19)</div>
              </div>
            </div>

            {/* Module 5: MOSFET Ejection Channel */}
            <div
              onClick={() => toggleModule('mosfet')}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 relative overflow-hidden ${
                connectedModules.mosfet
                  ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg shadow-amber-950'
                  : 'bg-slate-950/60 border-slate-800 text-slate-600'
              }`}
            >
              <Flame className={`w-7 h-7 shrink-0 mt-0.5 ${connectedModules.mosfet ? 'text-amber-400' : 'text-slate-600'}`} />
              <div className="space-y-1">
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Canal MOSFET de Ejeção Pirotécnica</span>
                  {connectedModules.mosfet && <CheckCircle className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-[11px] text-slate-400">Driver N-Channel de alta corrente (30A) com fotoacoplador optoisolado.</p>
                <div className="text-[10px] font-mono text-amber-300">Sinal: GPIO 12 (Drogue) & GPIO 27 (Main)</div>
              </div>
            </div>

            {/* Module 6: GPS NEO-6M */}
            <div
              onClick={() => toggleModule('gps')}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 relative overflow-hidden ${
                connectedModules.gps
                  ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-lg shadow-cyan-950'
                  : 'bg-slate-950/60 border-slate-800 text-slate-600'
              }`}
            >
              <Gauge className={`w-7 h-7 shrink-0 mt-0.5 ${connectedModules.gps ? 'text-cyan-400' : 'text-slate-600'}`} />
              <div className="space-y-1">
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Módulo GPS NEO-6M / U-Blox</span>
                  {connectedModules.gps && <CheckCircle className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-[11px] text-slate-400">Coordenadas de resgate em tempo real (Latitude / Longitude / Fix 3D).</p>
                <div className="text-[10px] font-mono text-cyan-300">Interface: UART Serial2 (TX:17, RX:16)</div>
              </div>
            </div>

          </div>
        </div>

        {/* LIVE SIMULATION CONTROLS (TESTE BARÔMETRO, TESTE EJEÇÃO, TELEMETRIA) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Test 1: Simulated Barometer Altitude */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" /> Teste Barométrico ao Vivo
              </span>
              <span className="text-emerald-300 font-bold">{simulatedAltitude} metros</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400">Simular Alteração de Altitude do Voo:</label>
              <input
                type="range"
                min="0"
                max="3500"
                step="25"
                value={simulatedAltitude}
                onChange={(e) => setSimulatedAltitude(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="text-[10px] text-slate-400 flex justify-between bg-slate-900 p-2 rounded">
              <span>Pressão Calculada: <strong>{(1013.25 * Math.exp(-simulatedAltitude / 8430)).toFixed(1)} hPa</strong></span>
              <span>Temp Est: <strong>{(25 - (simulatedAltitude * 0.0065)).toFixed(1)} °C</strong></span>
            </div>
          </div>

          {/* Test 2: MOSFET Ejection Trigger */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" /> Disparo de Ejeção MOSFET
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                ejectionFired ? 'bg-red-600 text-white animate-ping' : 'bg-amber-950 text-amber-300'
              }`}>
                {ejectionFired ? '🔥 IGNITOR DISPARADO!' : 'PRONTO PARA TESTE'}
              </span>
            </div>

            <button
              disabled={ejectionCountdown !== null || !benchPowerOn || !connectedModules.mosfet}
              onClick={() => setEjectionCountdown(3)}
              className={`w-full py-2.5 rounded-lg font-bold text-xs transition flex items-center justify-center gap-2 shadow ${
                ejectionCountdown !== null
                  ? 'bg-amber-600 text-white animate-pulse'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950 disabled:opacity-40'
              }`}
            >
              <Flame className="w-4 h-4" />
              {ejectionCountdown !== null ? `CONTAGEM REGRESSIVA: ${ejectionCountdown}s...` : 'TESTAR DISPARO PIROTÉCNICO'}
            </button>

            <div className="text-[10px] text-slate-400">
              {connectedModules.mosfet ? '✓ Circuito Mosfet Energizado & Contato Seguro' : '❌ Conecte o Módulo MOSFET para habilitar o teste'}
            </div>
          </div>

          {/* Test 3: LoRa Transmitter Test */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
              <span className="font-bold text-purple-400 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-purple-400" /> Transmissão de RF LoRa 915MHz
              </span>
              <span className="text-[10px] text-purple-300 font-bold">RSSI: -68 dBm</span>
            </div>

            <button
              onClick={() => {
                setIsTransmittingLoRa(true);
                setSerialLogs((l) => [...l, `[LORA TX] Pacote de Telemetria enviado com sucesso via RF 915MHz!`]);
                setTimeout(() => setIsTransmittingLoRa(false), 1200);
              }}
              disabled={!benchPowerOn || !connectedModules.lora}
              className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow disabled:opacity-40"
            >
              <Radio className="w-4 h-4" />
              {isTransmittingLoRa ? 'TRANSMITINDO PACOTE...' : 'ENVIAR PAC PACOTE TELEMETRIA'}
            </button>

            <div className="text-[10px] text-slate-400">
              Frequência: 915.000 MHz | Bw: 125 kHz | Spreading Factor: SF7
            </div>
          </div>

        </div>

        {/* SERIAL TERMINAL MONITOR & C++ FIRMWARE CODE GENERATOR */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Serial Terminal View */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col">
            <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
              <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" /> Terminal Serial de Voo (115200 Baud)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTerminalPaused(!isTerminalPaused)}
                  className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800"
                >
                  {isTerminalPaused ? 'Continuar' : 'Pausar'}
                </button>
                <button
                  onClick={() => setSerialLogs([])}
                  className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800"
                >
                  Limpar Log
                </button>
              </div>
            </div>

            <div
              ref={serialTerminalRef}
              className="bg-black/90 border border-slate-900 rounded-lg p-3 h-56 overflow-y-auto font-mono text-[11px] text-emerald-400 space-y-1 border-slate-800/80 leading-relaxed"
            >
              {serialLogs.length === 0 ? (
                <div className="text-slate-600 italic">Aguardando dados da porta serial do ESP32-S3...</div>
              ) : (
                serialLogs.map((log, idx) => (
                  <div key={idx} className={log.includes('CRITICAL') ? 'text-red-400 font-bold' : log.includes('LORA') ? 'text-purple-300' : 'text-emerald-400'}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* C++ Code Window & Flash Firmware */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-amber-400" /> Código C++ / Arduino Dinâmico Gerado
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-200 px-2.5 py-1 rounded text-[10px] font-bold border border-slate-800 flex items-center gap-1 transition"
                >
                  {codeCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {codeCopied ? 'Copiado!' : 'Copiar C++'}
                </button>
              </div>
            </div>

            <pre className="bg-slate-900 p-3 rounded-lg h-44 overflow-y-auto text-[10px] font-mono text-emerald-300 border border-slate-800/80 leading-relaxed">
              {generateArduinoCode()}
            </pre>

            {/* Flash Firmware Simulation */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
              <button
                onClick={handleFlashFirmware}
                disabled={flashProgress !== null}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow shadow-blue-950 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${flashProgress !== null ? 'animate-spin' : ''}`} />
                Gravar Firmware no ESP32-S3
              </button>

              {flashProgress !== null && (
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Gravando Flash Memory...</span>
                    <span>{flashProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${flashProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ESTÚDIO E DESIGNER DE PCB 2D & 3D COM EXPORTAÇÃO/IMPORTAÇÃO */}
      <PcbStudio2D3D />
    </div>
  );
};

