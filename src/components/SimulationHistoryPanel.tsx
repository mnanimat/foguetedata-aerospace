import React, { useState } from 'react';
import { SimulationHistoryItem, RocketParams } from '../types';
import { History, Save, ArrowRightLeft, Trash2, Download, Check, RefreshCw } from 'lucide-react';

interface SimulationHistoryPanelProps {
  history: SimulationHistoryItem[];
  onSaveCurrent: () => void;
  onLoadParams: (params: RocketParams) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
  currentApogee: number;
  currentMaxVel: number;
}

export const SimulationHistoryPanel: React.FC<SimulationHistoryPanelProps> = ({
  history,
  onSaveCurrent,
  onLoadParams,
  onClearHistory,
  onDeleteHistoryItem,
  currentApogee,
  currentMaxVel
}) => {
  const [selectedForComparison, setSelectedForComparison] = useState<SimulationHistoryItem | null>(null);

  return (
    <div className="bg-[#111827] dark:bg-[#111827] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-xl p-4 shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-600/20 rounded-lg text-purple-400 border border-purple-500/30">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 dark:text-white light:text-slate-900 flex items-center gap-2">
              Histórico de Simulações Recentes (Últimas 5)
            </h3>
            <p className="text-[11px] text-slate-400">
              Salve, compare e recarregue parâmetros de trajetórias calculadas anteriormente.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSaveCurrent}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Simulação Atual</span>
          </button>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="p-1.5 text-slate-400 hover:text-red-400 transition rounded border border-slate-800 hover:border-red-500/30 cursor-pointer"
              title="Limpar Histórico"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* History Table */}
      {history.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg text-xs font-mono text-slate-500">
          Nenhuma simulação salva no histórico local ainda. Clique em "Salvar Simulação Atual" para registrar.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2 px-2">Data / Hora</th>
                <th className="py-2 px-2">Apogeu (m)</th>
                <th className="py-2 px-2">Vel. Máx (m/s)</th>
                <th className="py-2 px-2">Vento (km/h)</th>
                <th className="py-2 px-2">Elev. MSL (m)</th>
                <th className="py-2 px-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {history.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-900/60 transition">
                  <td className="py-2.5 px-2 font-bold text-purple-300">
                    #{history.length - idx} • {item.timestamp}
                  </td>
                  <td className="py-2.5 px-2 font-bold text-emerald-400">
                    {item.maxAltitude} m
                  </td>
                  <td className="py-2.5 px-2 text-cyan-400">
                    {item.maxVelocity} m/s
                  </td>
                  <td className="py-2.5 px-2 text-amber-400">
                    {item.windSpeed} km/h ({item.windDirection}°)
                  </td>
                  <td className="py-2.5 px-2 text-blue-300">
                    {item.elevationMSL || 0} m
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onLoadParams(item.params)}
                        className="px-2 py-0.5 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white rounded text-[10px] transition border border-blue-500/30 cursor-pointer"
                        title="Carregar Parâmetros no Simulador"
                      >
                        Carregar
                      </button>

                      <button
                        onClick={() => setSelectedForComparison(item)}
                        className="px-2 py-0.5 bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white rounded text-[10px] transition border border-purple-500/30 flex items-center gap-1 cursor-pointer"
                        title="Comparar com a Simulação Atual"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>Comparar</span>
                      </button>

                      <button
                        onClick={() => onDeleteHistoryItem(item.id)}
                        className="p-1 text-slate-500 hover:text-red-400 transition cursor-pointer"
                        title="Remover do histórico"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Comparison Modal */}
      {selectedForComparison && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-purple-500/40 rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold font-mono">
                <ArrowRightLeft className="w-5 h-5" />
                <span>Comparação Direta de Simulação</span>
              </div>
              <button
                onClick={() => setSelectedForComparison(null)}
                className="text-slate-400 hover:text-white text-xs font-mono border border-slate-700 px-2 py-1 rounded cursor-pointer"
              >
                Fechar ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
              {/* Current */}
              <div className="bg-[#05070A] p-4 rounded-xl border border-blue-500/30 space-y-2">
                <span className="text-cyan-400 font-bold block border-b border-slate-800 pb-1">
                  1. Simulação Atual (Em Execução)
                </span>
                <div className="space-y-1 text-slate-300">
                  <p>Apogeu Máximo: <strong className="text-emerald-400">{currentApogee} m</strong></p>
                  <p>Velocidade Máxima: <strong className="text-cyan-400">{currentMaxVel} m/s</strong></p>
                </div>
              </div>

              {/* Saved Item */}
              <div className="bg-[#05070A] p-4 rounded-xl border border-purple-500/30 space-y-2">
                <span className="text-purple-400 font-bold block border-b border-slate-800 pb-1">
                  2. Salva em {selectedForComparison.timestamp}
                </span>
                <div className="space-y-1 text-slate-300">
                  <p>Apogeu Máximo: <strong className="text-emerald-400">{selectedForComparison.maxAltitude} m</strong></p>
                  <p>Velocidade Máxima: <strong className="text-cyan-400">{selectedForComparison.maxVelocity} m/s</strong></p>
                  <p>Vento: <strong className="text-amber-400">{selectedForComparison.windSpeed} km/h ({selectedForComparison.windDirection}°)</strong></p>
                  <p>Elev. Campo: <strong className="text-blue-300">{selectedForComparison.elevationMSL} m</strong></p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 flex justify-between items-center">
              <span>Diferença de Apogeu:</span>
              <strong className={currentApogee >= selectedForComparison.maxAltitude ? 'text-emerald-400' : 'text-red-400'}>
                {(currentApogee - selectedForComparison.maxAltitude).toFixed(2)} m ({(((currentApogee - selectedForComparison.maxAltitude) / selectedForComparison.maxAltitude) * 100).toFixed(1)}%)
              </strong>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  onLoadParams(selectedForComparison.params);
                  setSelectedForComparison(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Carregar Parâmetros desta Simulação</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
