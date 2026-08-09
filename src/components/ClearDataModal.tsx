import React, { useState } from 'react';
import { Trash2, AlertTriangle, CheckSquare, Square, X, RefreshCw, Sparkles, Building2 } from 'lucide-react';

export interface DataCategoryOption {
  id: string;
  key: string;
  title: string;
  description: string;
  defaultChecked: boolean;
}

const DATA_CATEGORIES: DataCategoryOption[] = [
  {
    id: 'tasks',
    key: 'foguetedata_tasks',
    title: 'Tarefas do Planner (Kanban & GANTT)',
    description: 'Apaga todas as tarefas, status, prazos, checklists e cronogramas.',
    defaultChecked: true,
  },
  {
    id: 'team_members',
    key: 'foguetedata_team_members',
    title: 'Membros e Integrantes da Equipe',
    description: 'Apaga a lista de membros cadastrados, contatos e subsistemas.',
    defaultChecked: true,
  },
  {
    id: 'departments',
    key: 'foguetedata_departments',
    title: 'Departamentos e Áreas Técnicas',
    description: 'Restaura/zera os departamentos e siglas das equipes.',
    defaultChecked: true,
  },
  {
    id: 'invoices',
    key: 'foguetedata_invoices',
    title: 'Notas Fiscais e Registros Financeiros',
    description: 'Apaga histórico de despesas, compras e orçamentos.',
    defaultChecked: true,
  },
  {
    id: 'resources',
    key: 'foguetedata_resources',
    title: 'Links, Vídeos e Biblioteca da Equipe',
    description: 'Apaga links externos de relatórios e vídeos de testes.',
    defaultChecked: true,
  },
  {
    id: 'models3d',
    key: 'foguetedata_3d_models',
    title: 'Modelos 3D e Repositório CAD',
    description: 'Remove os modelos STL/GLTF e arquivos enviados.',
    defaultChecked: true,
  },
  {
    id: 'manual_articles',
    key: 'foguetedata_manual_articles',
    title: 'Artigos e Documentação do Manual',
    description: 'Remove artigos autorais e tutoriais salvos no manual.',
    defaultChecked: true,
  },
  {
    id: 'telemetry_logs',
    key: 'foguetedata_telemetry_logs',
    title: 'Ensaios Práticos e Telemetria de Voo',
    description: 'Limpa históricos de ensaios de motor e logs de sensores.',
    defaultChecked: true,
  },
];

interface ClearDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataCleared?: () => void;
}

export const ClearDataModal: React.FC<ClearDataModalProps> = ({ isOpen, onClose, onDataCleared }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    DATA_CATEGORIES.map((cat) => cat.id)
  );
  const [isConfirming, setIsConfirming] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    setSelectedIds(DATA_CATEGORIES.map((cat) => cat.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleExecuteClear = () => {
    if (selectedIds.length === 0) {
      alert('Selecione pelo menos uma categoria de dados para apagar.');
      return;
    }

    // Clear selected categories from localStorage
    DATA_CATEGORIES.forEach((cat) => {
      if (selectedIds.includes(cat.id)) {
        // Save empty array or custom cleared marker
        localStorage.setItem(cat.key, JSON.stringify([]));
      }
    });

    setSuccessMessage('Dados selecionados foram apagados com sucesso! A página será reiniciada para aplicar as alterações.');
    
    setTimeout(() => {
      if (onDataCleared) onDataCleared();
      window.location.reload();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0D1322] border border-red-900/60 rounded-2xl p-6 max-w-xl w-full space-y-5 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-red-400 font-mono text-xs uppercase tracking-wider font-bold">
            <Trash2 className="w-4 h-4 text-red-500" />
            Limpeza de Dados da Organização
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Registrar Organização do Zero
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Selecione quais categorias de informações armazenadas no navegador você deseja <strong className="text-red-400">apagar permanentemente</strong> para cadastrar a estrutura da sua organização totalmente do zero.
          </p>
        </div>

        {/* Warning Banner */}
        <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl flex items-start gap-3 text-xs text-red-200 font-mono">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-red-300 block">⚠️ Ação Irreversível:</span>
            <span>Os dados das categorias marcadas abaixo serão excluídos. Certifique-se de salvar cópias importantes antes de prosseguir.</span>
          </div>
        </div>

        {/* Quick Selection Toolbar */}
        <div className="flex justify-between items-center text-xs font-mono pt-1">
          <span className="text-slate-400">
            Selecionados: <strong className="text-white">{selectedIds.length}</strong> de {DATA_CATEGORIES.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="text-red-400 hover:text-red-300 hover:underline text-[11px]"
            >
              Marcar Todos
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={handleDeselectAll}
              className="text-slate-400 hover:text-white hover:underline text-[11px]"
            >
              Desmarcar Todos
            </button>
          </div>
        </div>

        {/* Categories List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {DATA_CATEGORIES.map((cat) => {
            const isChecked = selectedIds.includes(cat.id);
            return (
              <div
                key={cat.id}
                onClick={() => handleToggleSelect(cat.id)}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 select-none ${
                  isChecked
                    ? 'bg-red-950/20 border-red-500/50 hover:border-red-500'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-60'
                }`}
              >
                <div className="mt-0.5 text-red-500">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-red-500" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-white block">{cat.title}</span>
                  <p className="text-[11px] text-slate-400">{cat.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Success Message Banner */}
        {successMessage && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-mono rounded-xl text-center font-bold animate-pulse">
            {successMessage}
          </div>
        )}

        {/* Confirmation & Action Controls */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row justify-end items-center gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-mono transition"
          >
            Cancelar
          </button>

          {!isConfirming ? (
            <button
              onClick={() => setIsConfirming(true)}
              disabled={selectedIds.length === 0}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold text-xs font-mono transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
            >
              <Trash2 className="w-4 h-4" />
              Apagar Dados Selecionados ({selectedIds.length})
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsConfirming(false)}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
              >
                Voltar
              </button>
              <button
                onClick={handleExecuteClear}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-xs font-mono transition flex items-center justify-center gap-2 shadow-xl shadow-red-700/50 animate-bounce"
              >
                <AlertTriangle className="w-4 h-4 text-amber-300" />
                SIM, CONFIRMAR EXCLUSÃO!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
