import React, { useState } from 'react';
import { SponsorCompany, TeamCategory } from '../../data/rocketryHubData';
import { 
  Building2, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  DollarSign, 
  Briefcase, 
  FolderDown, 
  HeartHandshake
} from 'lucide-react';

interface SponsorsSectionProps {
  sponsors: SponsorCompany[];
  onSaveSponsor: (sponsor: SponsorCompany) => void;
}

export const SponsorsSection: React.FC<SponsorsSectionProps> = ({ sponsors, onSaveSponsor }) => {
  const [selectedCategory, setSelectedCategory] = useState<TeamCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState<Partial<SponsorCompany>>({
    companyName: '',
    industrySector: 'Usinagem CNC & Usinagem de Precisão',
    contactEmail: '',
    whatsapp: '',
    phone: '',
    website: '',
    targetCategories: ['ensino_medio', 'universitaria', 'equipe_independente'],
    offeredSponsorshipTypes: ['Apoio Financeiro', 'Doação de Componentes'],
    description: '',
    driveCompanyMaterialUrl: ''
  });

  const filteredSponsors = sponsors.filter((s) => {
    const matchesCat =
      selectedCategory === 'all' || s.targetCategories.includes(selectedCategory);
    const matchesSearch =
      s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.industrySector.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenModal = () => {
    setFormData({
      companyName: '',
      industrySector: 'Usinagem CNC & Usinagem de Precisão',
      contactEmail: '',
      whatsapp: '',
      phone: '',
      website: '',
      targetCategories: ['ensino_medio', 'universitaria', 'equipe_independente'],
      offeredSponsorshipTypes: ['Apoio Financeiro', 'Doação de Componentes'],
      description: '',
      driveCompanyMaterialUrl: ''
    });
    setShowModal(true);
  };

  const handleToggleTargetCat = (cat: TeamCategory) => {
    const current = formData.targetCategories || [];
    if (current.includes(cat)) {
      setFormData({
        ...formData,
        targetCategories: current.filter((c) => c !== cat)
      });
    } else {
      setFormData({
        ...formData,
        targetCategories: [...current, cat]
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName?.trim() || !formData.contactEmail?.trim()) return;

    const newSponsor: SponsorCompany = {
      id: `spon-${Date.now()}`,
      companyName: formData.companyName.trim(),
      industrySector: formData.industrySector?.trim() || 'Aeroespacial & Tecnologia',
      contactEmail: formData.contactEmail.trim(),
      whatsapp: formData.whatsapp?.trim() || '',
      phone: formData.phone?.trim() || '',
      website: formData.website?.trim() || '',
      targetCategories: formData.targetCategories || ['universitaria'],
      offeredSponsorshipTypes: formData.offeredSponsorshipTypes || ['Apoio Financeiro'],
      description: formData.description?.trim() || '',
      driveCompanyMaterialUrl: formData.driveCompanyMaterialUrl?.trim() || '',
      updatedAt: new Date().toLocaleString('pt-BR')
    };

    onSaveSponsor(newSponsor);
    setShowModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            Portal de Empresas Patrocinadoras
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Empresas e doadores interessados em patrocinar projetos de minifoguetes e equipes do Ensino Médio, Universitárias ou Independentes.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold px-4 py-2 rounded-lg shadow transition cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Empresa Patrocinadora
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-mono">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 border-emerald-500 text-white font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Todas as Categorias ({sponsors.length})
          </button>
          <button
            onClick={() => setSelectedCategory('ensino_medio')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              selectedCategory === 'ensino_medio'
                ? 'bg-amber-600 border-amber-500 text-white font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Apoiam Ensino Médio
          </button>
          <button
            onClick={() => setSelectedCategory('universitaria')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              selectedCategory === 'universitaria'
                ? 'bg-blue-600 border-blue-500 text-white font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Apoiam Universitárias
          </button>
          <button
            onClick={() => setSelectedCategory('equipe_independente')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              selectedCategory === 'equipe_independente'
                ? 'bg-cyan-600 border-cyan-500 text-white font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Apoiam Independentes
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar empresa ou setor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111827] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
          />
        </div>
      </div>

      {/* Grid of Sponsors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSponsors.map((sp) => (
          <div
            key={sp.id}
            className="bg-[#111827] border border-slate-800 hover:border-emerald-500/50 rounded-xl p-5 shadow-xl transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                    {sp.industrySector}
                  </span>
                  <h3 className="text-base font-bold text-white font-mono mt-1">
                    {sp.companyName}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {sp.description}
              </p>

              {/* Offered Support Types */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <HeartHandshake className="w-3 h-3 text-emerald-400" />
                  Tipos de Apoio Oferecidos:
                </span>
                <div className="flex flex-wrap gap-1">
                  {sp.offeredSponsorshipTypes.map((st, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono"
                    >
                      {st}
                    </span>
                  ))}
                </div>
              </div>

              {/* Target Categories */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-mono">Categorias Alvo de Interesse:</span>
                <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                  {sp.targetCategories.map((tc, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.2 rounded"
                    >
                      {tc === 'ensino_medio'
                        ? 'Ensino Médio'
                        : tc === 'equipe_independente'
                        ? 'Independente'
                        : 'Universitária'}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions & Links */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap justify-between items-center gap-2 text-xs font-mono">
              {sp.driveCompanyMaterialUrl ? (
                <a
                  href={sp.driveCompanyMaterialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-amber-300 hover:underline"
                >
                  <FolderDown className="w-3.5 h-3.5 text-amber-400" />
                  Material / Edital no Drive <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ) : (
                <span className="text-slate-500 text-[10px]">Sem material no Drive</span>
              )}

              {sp.whatsapp ? (
                <a
                  href={`https://wa.me/${sp.whatsapp.replace(/\D/g, '')}?text=Olá!%20Somos%20uma%20equipe%20cadastrada%20no%20Hub%20Aeroespacial%20e%20gostaríamos%20de%20apresentar%20nossa%20proposta%20de%20patrocínio.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-[11px] font-bold transition"
                >
                  Propor Patrocínio (WhatsApp)
                </a>
              ) : (
                <a
                  href={`mailto:${sp.contactEmail}?subject=Proposta%20de%20Patroc%C3%ADnio%20Aeroespacial&body=Ol%C3%A1,%20gostar%C3%ADamos%20de%20apresentar%20nossa%20equipe.`}
                  className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded text-[11px] font-bold transition border border-slate-700"
                >
                  <Mail className="w-3 h-3 text-cyan-400" /> Enviar E-mail
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Register Sponsor Company */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-[#111827] border border-emerald-500/40 rounded-xl max-w-xl w-full p-5 space-y-4 shadow-2xl text-slate-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                Cadastrar Empresa Patrocinadora
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white font-mono font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-slate-300 font-mono mb-1 font-bold">
                  Nome da Empresa / Organização *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: AeroTech Usinagem CNC"
                  value={formData.companyName || ''}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1 font-bold">
                    Ramo / Setor de Atuação *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Usinagem CNC / Impressão 3D / Eletrônica"
                    value={formData.industrySector || ''}
                    onChange={(e) => setFormData({ ...formData, industrySector: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1 font-bold">
                    E-mail de Contato para Equipes *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="patrocinio@empresa.com"
                    value={formData.contactEmail || ''}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">
                    WhatsApp Comercial (+55...)
                  </label>
                  <input
                    type="text"
                    placeholder="+55 11 99999-0000"
                    value={formData.whatsapp || ''}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">
                    Website Oficial
                  </label>
                  <input
                    type="url"
                    placeholder="https://empresa.com.br"
                    value={formData.website || ''}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">
                  Categorias de Equipes que Deseja Apoiar:
                </label>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  <label className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 p-2 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.targetCategories?.includes('ensino_medio')}
                      onChange={() => handleToggleTargetCat('ensino_medio')}
                    />
                    Ensino Médio
                  </label>
                  <label className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 p-2 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.targetCategories?.includes('universitaria')}
                      onChange={() => handleToggleTargetCat('universitaria')}
                    />
                    Universitária
                  </label>
                  <label className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 p-2 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.targetCategories?.includes('equipe_independente')}
                      onChange={() => handleToggleTargetCat('equipe_independente')}
                    />
                    Equipe Independente
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1 font-bold">
                  Descrição do Apoio & Condições *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: Fornecemos serviços de usinagem gratuita de bocais de alumínio para 5 equipes por ano..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">
                  Link Google Drive com Edital ou Regulamento de Patrocínio (opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/drive/folders/edital_empresa"
                  value={formData.driveCompanyMaterialUrl || ''}
                  onChange={(e) => setFormData({ ...formData, driveCompanyMaterialUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono text-[11px]"
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
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs px-5 py-2 rounded font-bold shadow"
                >
                  Cadastrar Empresa no Cloudflare
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
