import React, { useState } from 'react';
import { SUBSYSTEMS_DATA } from '../data/knowledgeData';
import { Cpu, Flame, Layers, ShieldCheck, Zap, Code, CheckCircle, ExternalLink, Box, Download, Sparkles } from 'lucide-react';

export const SubsystemsDetail: React.FC = () => {
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('propulsao-solida');

  // Electronics Assembly Bench State
  const [connectedModules, setConnectedModules] = useState<{ [key: string]: boolean }>({
    esp32: true,
    bmp280: true,
    mpu6050: true,
    lora: true,
    mosfet: true
  });

  const toggleModule = (id: string) => {
    setConnectedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeSubsystem = SUBSYSTEMS_DATA.find((s) => s.id === selectedSubsystem) || SUBSYSTEMS_DATA[0];

  const generatedArduinoCode = `/* 
   FogueteData Aerospace - Firmware Aviônico de Voo
   Microcontrolador: ESP32 + Barômetro MS5611 + MPU6050 + LoRa SX1276
   Desenvolvedor: Micael Nildo (micaelnildo@mnanimat.xyz)
*/

#include <Wire.h>
#include <SPI.h>
#include <Adafruit_BMP280.h>
#include <LoRa.h>

#define PIN_IGNITER_DROGUE 12
#define PIN_IGNITER_MAIN   14
#define LORA_CS   5
#define LORA_RST  14
#define LORA_IRQ  2

Adafruit_BMP280 bmp;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_IGNITER_DROGUE, OUTPUT);
  pinMode(PIN_IGNITER_MAIN, OUTPUT);
  digitalWrite(PIN_IGNITER_DROGUE, LOW);

  if (!bmp.begin(0x76)) {
    Serial.println("Erro ao inicializar Barômetro BMP280!");
  }
  
  LoRa.setPins(LORA_CS, LORA_RST, LORA_IRQ);
  if (!LoRa.begin(915E6)) {
    Serial.println("Erro ao inicializar Telemetria LoRa!");
  }
}

void loop() {
  float altitude = bmp.readAltitude(1013.25);
  float temp = bmp.readTemperature();

  // Envio de Pacote de Telemetria
  LoRa.beginPacket();
  LoRa.print("ALT:"); LoRa.print(altitude);
  LoRa.print(";TEMP:"); LoRa.print(temp);
  LoRa.endPacket();

  delay(200);
}`;

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

      {/* BANCADA DE MONTAGEM DE ELETRÔNICA NO NAVEGADOR */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-4 lg:p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-[10px] uppercase tracking-wider mb-0.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Bancada Interativa de Eletrônica Aviônica
            </div>
            <h3 className="text-lg font-bold text-white">Montagem e Fiação Virtual no Navegador</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Conecte módulos de sensores, microcontroladores e acionadores de ejetores em tempo real com explicação de pinagem.
            </p>
          </div>

          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800">
            Simulador PCB Virtual Ativo
          </span>
        </div>

        {/* Interactive Module Wiring Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Module 1: ESP32 MCU */}
          <div
            onClick={() => toggleModule('esp32')}
            className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
              connectedModules.esp32
                ? 'bg-blue-950/40 border-blue-500 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            <Cpu className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs flex items-center justify-between">
                <span>Microcontrolador ESP32-S3</span>
                {connectedModules.esp32 && <CheckCircle className="w-3.5 h-3.5 text-blue-400" />}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">CPU Dual Core 240MHz, Wi-Fi, Bluetooth e 32 GPIOs.</p>
              <div className="text-[10px] font-mono text-slate-500 mt-2">Pinagem: SDA(21), SCL(22), SPI(5,18,19)</div>
            </div>
          </div>

          {/* Module 2: BMP280 Barometer */}
          <div
            onClick={() => toggleModule('bmp280')}
            className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
              connectedModules.bmp280
                ? 'bg-emerald-950/40 border-emerald-500 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            <Zap className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs flex items-center justify-between">
                <span>Altímetro Barométrico BMP280</span>
                {connectedModules.bmp280 && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Mede pressão barométrica com precisão de ±1 metro.</p>
              <div className="text-[10px] font-mono text-slate-500 mt-2">I2C Endereço 0x76 (3.3V)</div>
            </div>
          </div>

          {/* Module 3: MPU6050 IMU */}
          <div
            onClick={() => toggleModule('mpu6050')}
            className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
              connectedModules.mpu6050
                ? 'bg-indigo-950/40 border-indigo-500 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            <Layers className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs flex items-center justify-between">
                <span>IMU 6-Eixos MPU6050</span>
                {connectedModules.mpu6050 && <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Acelerômetro 3 eixos e giroscópio para orientação de voo.</p>
              <div className="text-[10px] font-mono text-slate-500 mt-2">I2C Endereço 0x68</div>
            </div>
          </div>

          {/* Module 4: LoRa Telemetry */}
          <div
            onClick={() => toggleModule('lora')}
            className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
              connectedModules.lora
                ? 'bg-purple-950/40 border-purple-500 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            <Sparkles className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs flex items-center justify-between">
                <span>Rádio Telemetria LoRa SX1276</span>
                {connectedModules.lora && <CheckCircle className="w-3.5 h-3.5 text-purple-400" />}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Transmissão em 915 MHz com alcance de até 15 km.</p>
              <div className="text-[10px] font-mono text-slate-500 mt-2">Barramento SPI (CS: GPIO 5)</div>
            </div>
          </div>

          {/* Module 5: MOSFET Ejection Channel */}
          <div
            onClick={() => toggleModule('mosfet')}
            className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
              connectedModules.mosfet
                ? 'bg-amber-950/40 border-amber-500 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            <Flame className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs flex items-center justify-between">
                <span>Circuito MOSFET Ejetor</span>
                {connectedModules.mosfet && <CheckCircle className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Atua como chave de alta corrente para ignitores pirotécnicos.</p>
              <div className="text-[10px] font-mono text-slate-500 mt-2">Sinal GPIO 12/14 (Optoacoplado)</div>
            </div>
          </div>
        </div>

        {/* Generated Code Window */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-300 font-bold flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-400" />
              Código C++ / Arduino Gerado Automaticamente
            </span>
            <span className="text-slate-500">Pronto para carregar no ESP32</span>
          </div>

          <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-xs font-mono text-emerald-400 border border-slate-800/80 leading-relaxed">
            {generatedArduinoCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
