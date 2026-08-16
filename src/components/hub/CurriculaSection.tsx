import React, { useState } from 'react';
import { AerospaceCurriculum } from '../../data/rocketryHubData';
import { 
  FileText, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  GraduationCap, 
  Briefcase, 
  ExternalLink, 
  FolderDown, 
  CheckCircle2, 
  User as UserIcon, 
  Sparkles 
} from 'lucide-react';

interface CurriculaSectionProps {
  curricula: AerospaceCurriculum[];
  onSaveCurriculum: (cv: AerospaceCurriculum) => void;
}

export const CurriculaSection: React.FC<CurriculaSectionProps> = ({
  curricula,
  onSaveCurriculum
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState<Partial<AerospaceCurriculum>>({
    fullName: '',
    email: '',
    phone: '',
    whatsapp: '',
    location: '',
    roleCategory: 'Engenheiro de Propulsão',
    institution: '',
    academicDegree: '',
    summaryBio: '',
    rocketryExperience: '',
    skills: [],
    driveCvUrl: ''
  });

  const [skillInput, setSkillInput] = useState('');

  const filteredCurricula = curricula.filter((cv) => {
    const query = searchQuery.toLowerCase();
    return (
      cv.fullName.toLowerCase().includes(query) ||
      cv.roleCategory.toLowerCase().includes(query) ||
      cv.institution.toLowerCase().includes(query) ||
      cv.skills.some((s) => s.toLowerCase().includes(query))
    );
  });

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), skillInput.trim()]
    }));
    setSkillInput('');
  };

  const handleRemoveSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName?.trim() || !formData.email?.trim()) return;

    const newCv: AerospaceCurriculum = {
      id: `cv-${Date.now()}`,
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone?.trim() || '',
      whatsapp: formData.whatsapp?.trim() || '',
      location: formData.location?.trim() || 'Brasil',
      roleCategory: formData.roleCategory?.trim() || 'Foguetemodelista',
      institution: formData.institution?.trim() || 'Independente',
      academicDegree: formData.academicDegree?.trim() || 'Graduação / Técnico',
      summaryBio: formData.summaryBio?.trim() || '',
      rocketryExperience: formData.rocketryExperience?.trim() || '',
      skills: formData.skills && formData.skills.length > 0 ? formData.skills : ['Minifoguetes', 'Projetos 3D'],
      driveCvUrl: formData.driveCvUrl?.trim() || '',
      updatedAt: new Date().toLocaleString('pt-BR')
    };

    onSaveCurriculum(newCv);
    setShowModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Banco de Currículos & Talentos Aeroespaciais
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Cadastre seu perfil profissional, habilidades em propulsão, aviônica, aerodinâmica ou CAD/CAE e disponibilize seu currículo hospedado no Google Drive para equipes e empresas.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold px-4 py-2 rounded-lg shadow transition cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Meu Currículo
        </button>
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Buscar por nome, especialidade (ex: Propulsão, LoRa, SolidWorks) ou universidade..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#111827] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
        />
      </div>

      {/* Grid of Curricula */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCurricula.map((cv) => (
          <div
            key={cv.id}
            className="bg-[#111827] border border-slate-800 hover:border-blue-500/50 rounded-xl p-5 shadow-xl transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-mono font-bold">
                    {cv.roleCategory}
                  </span>
                  <h3 className="text-base font-bold text-white font-mono mt-1 flex items-center gap-2">
                    {cv.fullName}
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">
                    {cv.institution} • <span className="text-slate-300">{cv.academicDegree}</span>
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {cv.summaryBio}
              </p>

              {cv.rocketryExperience && (
                <div className="bg-black/40 p-2.5 rounded border border-slate-800/80 space-y-0.5 text-xs">
                  <span className="font-mono font-bold text-amber-300 text-[10px]">
                    Experiência em Foguetemodelismo:
                  </span>
                  <p className="text-slate-300 font-sans text-[11px]">{cv.rocketryExperience}</p>
                </div>
              )}

              {/* Skills Tags */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-slate-400 font-mono">Habilidades & Softwares:</span>
                <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                  {cv.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-800 border border-slate-700 text-cyan-300 px-2 py-0.5 rounded"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Contact & Drive Links */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap justify-between items-center gap-2 text-xs font-mono">
              {cv.driveCvUrl ? (
                <a
                  href={cv.driveCvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-500/40 px-2.5 py-1 rounded text-[11px] font-bold transition"
                >
                  <FolderDown className="w-3.5 h-3.5 text-blue-400" />
                  Ver Currículo / Portfólio (Drive) <ExternalLink className="w-3 h-3 text-blue-400" />
                </a>
              ) : (
                <span className="text-slate-500 text-[10px]">Sem Drive anexo</span>
              )}

              <div className="flex items-center gap-2">
                {cv.whatsapp && (
                  <a
                    href={`https://wa.me/${cv.whatsapp.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(cv.fullName)},%20encontramos%20seu%20currículo%20no%20Hub%20Aeroespacial.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-[11px] font-bold transition"
                  >
                    WhatsApp
                  </a>
                )}
                <a
                  href={`mailto:${cv.email}`}
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-white"
                  title="Enviar E-mail"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Register Aerospace Curriculum */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-[#111827] border border-blue-500/40 rounded-xl max-w-xl w-full p-5 space-y-4 shadow-2xl text-slate-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Cadastrar Currículo Aeroespacial
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
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Lucas Gabriel Mendes"
                    value={formData.fullName || ''}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1 font-bold">
                    E-mail Principal *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="lucas@exemplo.com"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1 font-bold">
                    Área / Especialidade Principal *
                  </label>
                  <select
                    value={formData.roleCategory}
                    onChange={(e) => setFormData({ ...formData, roleCategory: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                  >
                    <option value="Engenheiro de Propulsão">Engenheiro de Propulsão</option>
                    <option value="Engenheira de Aviônica & Software">Engenheira de Aviônica & Software</option>
                    <option value="Projetista CAD/CAE Aerodinâmico">Projetista CAD/CAE Aerodinâmico</option>
                    <option value="Projetista de Estruturas & Compósitos">Projetista de Estruturas & Compósitos</option>
                    <option value="Capitão / Gestor de Equipe">Capitão / Gestor de Equipe</option>
                    <option value="Pesquisador / Estudante de Minifoguetes">Pesquisador / Estudante de Minifoguetes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">
                    WhatsApp (+55...)
                  </label>
                  <input
                    type="text"
                    placeholder="+55 21 99999-8888"
                    value={formData.whatsapp || ''}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">
                    Instituição / Universidade / Escola
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: UFRJ / IFPR / ITA"
                    value={formData.institution || ''}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">
                    Curso / Formação Acadêmica
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Eng. Aeroespacial (8º Período)"
                    value={formData.academicDegree || ''}
                    onChange={(e) => setFormData({ ...formData, academicDegree: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1 font-bold">
                  Resumo Profissional / Biografia *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Resuma seus principais interesses técnicos em foguetemodelismo e engenharia..."
                  value={formData.summaryBio || ''}
                  onChange={(e) => setFormData({ ...formData, summaryBio: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">
                  Experiência Prática em Foguetemodelismo
                </label>
                <textarea
                  rows={2}
                  placeholder="Projetos desenvolvidos, motores ensaiados, competições participadas..."
                  value={formData.rocketryExperience || ''}
                  onChange={(e) => setFormData({ ...formData, rocketryExperience: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              {/* Skills Input */}
              <div className="space-y-1">
                <label className="block text-slate-300 font-mono">
                  Habilidades & Softwares (Ex: SolidWorks, KNSB, LoRa, OpenRocket)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Adicionar habilidade"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded p-1.5 text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="bg-cyan-700 hover:bg-cyan-600 text-white font-mono px-3 py-1.5 rounded font-bold"
                  >
                    + Adicionar
                  </button>
                </div>

                {formData.skills && formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {formData.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-800 text-cyan-300 border border-slate-700 px-2 py-0.5 rounded flex items-center gap-1 font-mono text-[11px]"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(idx)}
                          className="text-red-400 hover:text-red-300 ml-1 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">
                  Link Google Drive com Currículo PDF Completo ou Portfólio
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/meu_curriculo_aeroespacial..."
                  value={formData.driveCvUrl || ''}
                  onChange={(e) => setFormData({ ...formData, driveCvUrl: e.target.value })}
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
                  className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs px-5 py-2 rounded font-bold shadow"
                >
                  Salvar Currículo no Cloudflare
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
