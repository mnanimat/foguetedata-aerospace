import React, { useState } from 'react';
import { CompetitionItem, TeamCategory } from '../../data/rocketryHubData';
import { 
  Trophy, 
  Plus, 
  Search, 
  Globe, 
  MapPin, 
  ExternalLink, 
  FolderDown, 
  Calendar, 
  Layers, 
  CheckCircle2 
} from 'lucide-react';

interface CompetitionsSectionProps {
  competitions: CompetitionItem[];
  onSaveCompetition: (comp: CompetitionItem) => void;
}

export const CompetitionsSection: React.FC<CompetitionsSectionProps> = ({
  competitions,
  onSaveCompetition
}) => {
  const [selectedScope, setSelectedScope] = useState<'all' | 'nacional' | 'internacional'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState<Partial<CompetitionItem>>({
    name: '',
    scope: 'nacional',
    organizer: '',
    location: '',
    allowedCategories: ['ensino_medio', 'universitaria', 'equipe_independente'],
    altitudeClasses: ['500m Apogeu', '1.000m Apogeu', '3.000m Apogeu'],
    dateOrSeason: '',
    description: '',
    officialWebsite: '',
    driveRulesFolderUrl: '',
    status: 'Inscrições Abertas'
  });

  const filteredCompetitions = competitions.filter((c) => {
    const matchesScope = selectedScope === 'all' || c.scope === selectedScope;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesScope && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const newComp: CompetitionItem = {
      id: `comp-${Date.now()}`,
      name: formData.name.trim(),
      scope: (formData.scope as 'nacional' | 'internacional') || 'nacional',
      organizer: formData.organizer?.trim() || 'Comissão Organizadora',
      location: formData.location?.trim() || 'Brasil',
      allowedCategories: formData.allowedCategories || ['universitaria'],
      altitudeClasses: formData.altitudeClasses || ['1.000m Apogeu'],
      dateOrSeason: formData.dateOrSeason?.trim() || 'Anual',
      description: formData.description?.trim() || '',
      officialWebsite: formData.officialWebsite?.trim() || '',
      driveRulesFolderUrl: formData.driveRulesFolderUrl?.trim() || '',
      status: (formData.status as any) || 'Inscrições Abertas',
      updatedAt: new Date().toLocaleString('pt-BR')
    };

    onSaveCompetition(newComp);
    setShowModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Banco de Dados de Competições Nacionais e Internacionais
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Catálogo atualizado de festivais, desafios e torneios de foguetemodelismo no Brasil e no mundo. Baixe regulamentos e manuais de segurança no Google Drive.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono font-bold px-4 py-2 rounded-lg shadow transition cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Competição
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <button
            onClick={() => setSelectedScope('all')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              selectedScope === 'all'
                ? 'bg-amber-600 border-amber-500 text-white font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Todas ({competitions.length})
          </button>
          <button
            onClick={() => setSelectedScope('nacional')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              selectedScope === 'nacional'
                ? 'bg-blue-600 border-blue-500 text-white font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Nacionais ({competitions.filter((c) => c.scope === 'nacional').length})
          </button>
          <button
            onClick={() => setSelectedScope('internacional')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              selectedScope === 'internacional'
                ? 'bg-purple-600 border-purple-500 text-white font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Internacionais ({competitions.filter((c) => c.scope === 'internacional').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nome ou país..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111827] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans"
          />
        </div>
      </div>

      {/* Grid of Competitions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCompetitions.map((comp) => {
          const isNational = comp.scope === 'nacional';

          return (
            <div
              key={comp.id}
              className="bg-[#111827] border border-slate-800 hover:border-amber-500/50 rounded-xl p-5 shadow-xl transition space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span
                      className={`inline-block text-[10px] px-2 py-0.5 rounded border font-mono font-bold ${
                        isNational
                          ? 'bg-blue-950 text-blue-300 border-blue-800'
                          : 'bg-purple-950 text-purple-300 border-purple-800'
                      }`}
                    >
                      {isNational ? 'Competição Nacional 🇧🇷' : 'Competição Internacional 🌎'}
                    </span>
                    <h3 className="text-base font-bold text-white font-mono mt-1">
                      {comp.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-sans flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                      {comp.location} • <span className="text-slate-300">{comp.organizer}</span>
                    </p>
                  </div>

                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold shrink-0">
                    {comp.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {comp.description}
                </p>

                {/* Altitude & Payload Classes */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Layers className="w-3 h-3 text-amber-400" />
                    Classes de Altitude & Cargas:
                  </span>
                  <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                    {comp.altitudeClasses.map((ac, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-800 text-amber-300 border border-slate-700 px-2 py-0.5 rounded"
                      >
                        {ac}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Allowed Categories */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono">Categorias Aceitas:</span>
                  <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                    {comp.allowedCategories.map((cat, i) => (
                      <span
                        key={i}
                        className="bg-black/50 text-slate-300 border border-slate-800 px-1.5 py-0.2 rounded"
                      >
                        {cat === 'ensino_medio'
                          ? 'Ensino Médio'
                          : cat === 'equipe_independente'
                          ? 'Independente'
                          : 'Universitária'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap justify-between items-center gap-2 text-xs font-mono">
                <div className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{comp.dateOrSeason}</span>
                </div>

                <div className="flex items-center gap-2">
                  {comp.driveRulesFolderUrl && (
                    <a
                      href={comp.driveRulesFolderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded text-[11px] font-bold transition"
                      title="Abrir Regulamentos e Manuais no Google Drive"
                    >
                      <FolderDown className="w-3.5 h-3.5 text-amber-400" /> Regulamento (Drive)
                    </a>
                  )}

                  {comp.officialWebsite && (
                    <a
                      href={comp.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded text-[11px] font-bold transition shadow"
                    >
                      Site Oficial <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Register New Competition */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-[#111827] border border-amber-500/40 rounded-xl max-w-xl w-full p-5 space-y-4 shadow-2xl text-slate-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Cadastrar Competição no Banco de Dados
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white font-mono font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1 font-bold">
                    Nome da Competição *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Festival de Minifoguetes"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1 font-bold">
                    Escopo *
                  </label>
                  <select
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                  >
                    <option value="nacional">Nacional (Brasil)</option>
                    <option value="internacional">Internacional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">
                    Organizador / Associação
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Associação Brasileira de Minifoguetes (BAR)"
                    value={formData.organizer || ''}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">
                    Local / Cidade / Estado
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Curitiba, PR - Brasil"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1 font-bold">
                  Descrição da Competição & Objetivos *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Descreva as categorias, regulamentos e dinâmicas da competição..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">
                  Link Google Drive com Regulamentos e Guia de Segurança
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/drive/folders/regulamentos..."
                  value={formData.driveRulesFolderUrl || ''}
                  onChange={(e) => setFormData({ ...formData, driveRulesFolderUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">
                  Website Oficial da Competição
                </label>
                <input
                  type="url"
                  placeholder="https://minifoguete.com.br"
                  value={formData.officialWebsite || ''}
                  onChange={(e) => setFormData({ ...formData, officialWebsite: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs px-4 py-2 rounded font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs px-5 py-2 rounded font-bold shadow"
                >
                  Salvar Competição no Cloudflare
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
