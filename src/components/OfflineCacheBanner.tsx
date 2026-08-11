import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  HardDrive, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  Database, 
  ChevronDown, 
  ChevronUp, 
  Box, 
  FileText, 
  Sliders,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useOfflineCache, clearOfflineCacheData, getLocalStorageSizeKb } from '../utils/offlineCache';

interface OfflineCacheBannerProps {
  modelsCount?: number;
  cadCount?: number;
}

export const OfflineCacheBanner: React.FC<OfflineCacheBannerProps> = ({
  modelsCount = 0,
  cadCount = 0
}) => {
  const { isOnline, isOffline, cacheMeta, refreshMeta, toastNotif } = useOfflineCache();
  const [isExpanded, setIsExpanded] = useState(false);
  const [localMsg, setLocalMsg] = useState<string | null>(null);

  const handleForceSync = () => {
    refreshMeta();
    setLocalMsg('✅ Cache local revalidado e atualizado!');
    setTimeout(() => setLocalMsg(null), 2500);
  };

  const handleClearCache = () => {
    if (window.confirm('Deseja realmente limpar o cache offline armazenado no navegador? Os dados padrão serão restaurados.')) {
      clearOfflineCacheData();
      refreshMeta();
      setLocalMsg('🗑️ Cache local limpo com sucesso.');
      setTimeout(() => setLocalMsg(null), 2500);
    }
  };

  const formattedDate = new Date(cacheMeta.lastSync).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="w-full">
      {/* Toast popup for connection change notifications */}
      {(toastNotif || localMsg) && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl border border-red-500 shadow-2xl flex items-center gap-2 text-xs font-mono animate-bounce">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>{localMsg || toastNotif}</span>
        </div>
      )}

      {/* Main Status Bar Header */}
      <div className={`w-full text-xs font-mono transition-colors border-b ${
        isOffline 
          ? 'bg-amber-950/80 text-amber-200 border-amber-800/80' 
          : 'bg-slate-900/90 text-slate-300 border-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-5 py-1.5 flex flex-wrap items-center justify-between gap-2">
          
          {/* Status Label */}
          <div className="flex items-center gap-2">
            {isOffline ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                <WifiOff className="w-3 h-3 text-amber-400" />
                Modo Offline (Cache Local)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Wifi className="w-3 h-3 text-emerald-400" />
                Online & Sincronizado
              </span>
            )}

            <span className="hidden md:inline text-slate-400">
              {isOffline 
                ? 'Acesso offline habilitado via localStorage: Modelos 3D, Cálculos de Trajetória e Documentos.' 
                : 'Cache local ativo para navegabilidade instantânea offline.'
              }
            </span>
          </div>

          {/* Quick Metrics & Toggle Expand Button */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline flex items-center gap-1 text-[11px] text-slate-400">
              <HardDrive className="w-3 h-3 text-cyan-400" />
              Cache: <strong className="text-white">{cacheMeta.totalSizeKb} KB</strong>
            </span>

            <span className="hidden sm:inline text-slate-600">|</span>

            <span className="hidden lg:inline text-[10px] text-slate-400">
              Última Sincronia: {formattedDate}
            </span>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] border border-slate-700 transition"
              title="Ver detalhes do Cache Offline no localStorage"
            >
              <Database className="w-3 h-3 text-blue-400" />
              <span>Gerenciar Cache</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Expanded Panel Details */}
        {isExpanded && (
          <div className="bg-[#0b0f17] border-t border-slate-800 p-4 text-xs font-mono space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Mecanismo de Persistência Offline (localStorage)
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Todos os modelos do Estúdio 3D, manuais, parâmetros de trajetória e recursos CAD são persistidos localmente no seu dispositivo para uso contínuo sem internet.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleForceSync}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold flex items-center gap-1.5 transition text-[11px]"
                >
                  <RefreshCw className="w-3 h-3" />
                  Forçar Sincronia
                </button>
                <button
                  onClick={handleClearCache}
                  className="px-2.5 py-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded font-bold flex items-center gap-1.5 transition text-[11px]"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                  Limpar Cache
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                <div className="text-slate-400 flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-red-400" />
                  Modelos 3D em Cache:
                </div>
                <div className="text-base font-bold text-slate-100 mt-1">
                  {modelsCount || cacheMeta.modelCount || 0} Modelos
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                <div className="text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  Recursos CAD / Diagramas:
                </div>
                <div className="text-base font-bold text-slate-100 mt-1">
                  {cadCount || cacheMeta.cadCount || 0} Arquivos
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                <div className="text-slate-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  Simulador de Voo:
                </div>
                <div className="text-base font-bold text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Parâmetros Salvos
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                <div className="text-slate-400 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                  Espaço Utilizado:
                </div>
                <div className="text-base font-bold text-slate-100 mt-1">
                  {getLocalStorageSizeKb()} KB
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
