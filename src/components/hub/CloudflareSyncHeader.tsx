import React, { useState } from 'react';
import { Cloud, CheckCircle2, RefreshCw, Database, ExternalLink, ShieldCheck, Download, Code } from 'lucide-react';
import { CloudflareSyncState } from '../../data/rocketryHubData';

interface CloudflareSyncHeaderProps {
  syncState: CloudflareSyncState;
  onForceSync: () => void;
  onExportJson: () => void;
}

export const CloudflareSyncHeader: React.FC<CloudflareSyncHeaderProps> = ({
  syncState,
  onForceSync,
  onExportJson
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      onForceSync();
      setIsSyncing(false);
    }, 600);
  };

  return (
    <div className="bg-gradient-to-r from-orange-950/80 via-slate-900 to-slate-950 border border-orange-500/40 rounded-xl p-4 shadow-xl space-y-3">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-orange-500/20 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-600/20 border border-orange-500/50 flex items-center justify-center text-orange-400 shrink-0">
            <Cloud className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white font-mono tracking-tight">
                Hub Aeroespacial & Plataforma Cloudflare Pages
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded border border-orange-500/40 font-mono font-bold">
                <CheckCircle2 className="w-3 h-3 text-orange-400" />
                HOSPEDAGEM CLOUDFLARE PAGES ATIVA
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              Única seção da plataforma integrada ao armazenamento em nuvem no Cloudflare Pages. Alterações de equipes, patrocinadores, fórum e currículos atualizam em tempo real para todos os usuários.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs px-3 py-1.5 rounded-lg font-bold transition shadow cursor-pointer active:scale-95 disabled:opacity-50"
            title="Sincronizar banco de dados local com o endpoint do Cloudflare Pages"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Cloudflare'}
          </button>

          <button
            onClick={onExportJson}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer active:scale-95"
            title="Exportar backup completo em JSON do banco de dados Cloudflare D1/KV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Backup D1/KV
          </button>

          <button
            onClick={() => setShowConfigModal(true)}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-mono text-xs px-2 py-1.5 rounded-lg transition"
            title="Ver detalhes técnicos da API do Cloudflare Pages"
          >
            <Code className="w-3.5 h-3.5 text-amber-400" />
            API Info
          </button>
        </div>
      </div>

      {/* Synchronized Live Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
        <div className="bg-slate-900/80 border border-slate-800 rounded px-2.5 py-1.5 flex justify-between items-center">
          <span className="text-slate-400">Status KV/D1:</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Online
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded px-2.5 py-1.5 flex justify-between items-center">
          <span className="text-slate-400">Endpoint:</span>
          <span className="text-orange-300 font-semibold truncate max-w-[110px]" title={syncState.endpointUrl}>
            foguetedata.pages.dev
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded px-2.5 py-1.5 flex justify-between items-center">
          <span className="text-slate-400">Sincronizações:</span>
          <span className="text-cyan-400 font-bold">{syncState.syncCount} ciclos</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded px-2.5 py-1.5 flex justify-between items-center">
          <span className="text-slate-400">Última Atualização:</span>
          <span className="text-slate-200 font-medium">{syncState.lastSyncedAt}</span>
        </div>
      </div>

      {/* Modal API Details */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-orange-500/50 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl text-slate-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white font-mono flex items-center gap-2">
                <Cloud className="w-5 h-5 text-orange-400" />
                Arquitetura de Hospedagem Cloudflare Pages
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white font-mono font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-2 font-sans leading-relaxed text-slate-300">
              <p>
                Esta é a <strong>única seção da plataforma</strong> que envia e persiste registros no ambiente serverless do <strong>Cloudflare Pages (Cloudflare Workers KV + D1 Relational DB)</strong>.
              </p>
              <div className="bg-black/60 border border-slate-800 p-3 rounded font-mono text-[11px] text-orange-300 space-y-1">
                <div>// Configuration:</div>
                <div>CLOUDFLARE_PAGES_HOST = "https://foguetedata.pages.dev"</div>
                <div>CLOUDFLARE_KV_BINDING = "ROCKETRY_HUB_DATA"</div>
                <div>CLOUDFLARE_D1_DATABASE = "aerospace_community_db"</div>
              </div>
              <p className="text-[11px] text-slate-400">
                Qualquer modificação realizada em equipes, currículos, empresas patrocinadoras, fórum ou competições é salva localmente e propagada via broadcast para o Cloudflare Pages.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowConfigModal(false)}
                className="bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs px-4 py-2 rounded font-bold"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
