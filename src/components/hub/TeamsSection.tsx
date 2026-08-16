import React, { useState } from 'react';
import { RocketryTeam, TeamCategory, TeamMemberItem } from '../../data/rocketryHubData';
import { 
  Users, 
  Plus, 
  Search, 
  GraduationCap, 
  Building, 
  UserCheck, 
  ExternalLink, 
  Mail, 
  Phone, 
  DollarSign, 
  FolderDown, 
  FileText, 
  Image as ImageIcon, 
  Award, 
  History, 
  Briefcase, 
  CheckCircle2, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface TeamsSectionProps {
  teams: RocketryTeam[];
  onSaveTeam: (team: RocketryTeam) => void;
  onDeleteTeam?: (id: string) => void;
}

export const TeamsSection: React.FC<TeamsSectionProps> = ({ teams, onSaveTeam }) => {
  const [selectedCategory, setSelectedCategory] = useState<TeamCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<RocketryTeam | null>(null);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<RocketryTeam>>({
    name: '',
    category: 'universitaria',
    institution: '',
    cityState: '',
    slogan: '',
    description: '',
    history: '',
    achievements: [],
    members: [],
    contactEmail: '',
    whatsapp: '',
    phone: '',
    socialInstagram: '',
    socialLinkedin: '',
    website: '',
    pixKey: '',
    bankDetails: '',
    sponsorshipContactName: '',
    sponsorshipContactEmail: '',
    sponsorshipContactPhone: '',
    requestedSupportTypes: ['Apoio Financeiro', 'Peças & Componentes'],
    sponsorshipNeedsDescription: '',
    driveSponsorshipKitUrl: '',
    driveAcademicPapersUrl: '',
    driveRocketBannersUrl: '',
    driveCadTelemetryFolderUrl: ''
  });

  // Member Form State
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberCv, setNewMemberCv] = useState('');
  const [newMemberDrive, setNewMemberDrive] = useState('');

  // Achievement Form State
  const [newAchievement, setNewAchievement] = useState('');

  const filteredTeams = teams.filter((t) => {
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.cityState.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenCreate = () => {
    setEditingTeam(null);
    setFormData({
      name: '',
      category: 'universitaria',
      institution: '',
      cityState: '',
      slogan: '',
      description: '',
      history: '',
      achievements: [],
      members: [],
      contactEmail: '',
      whatsapp: '',
      phone: '',
      socialInstagram: '',
      socialLinkedin: '',
      website: '',
      pixKey: '',
      bankDetails: '',
      sponsorshipContactName: '',
      sponsorshipContactEmail: '',
      sponsorshipContactPhone: '',
      requestedSupportTypes: ['Apoio Financeiro', 'Peças & Componentes'],
      sponsorshipNeedsDescription: '',
      driveSponsorshipKitUrl: '',
      driveAcademicPapersUrl: '',
      driveRocketBannersUrl: '',
      driveCadTelemetryFolderUrl: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (team: RocketryTeam) => {
    setEditingTeam(team);
    setFormData({ ...team });
    setShowModal(true);
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    const m: TeamMemberItem = {
      id: Date.now().toString(),
      name: newMemberName.trim(),
      role: newMemberRole.trim() || 'Membro da Equipe',
      curriculumSummary: newMemberCv.trim(),
      driveCvLink: newMemberDrive.trim()
    };
    setFormData((prev) => ({
      ...prev,
      members: [...(prev.members || []), m]
    }));
    setNewMemberName('');
    setNewMemberRole('');
    setNewMemberCv('');
    setNewMemberDrive('');
  };

  const handleRemoveMember = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      members: (prev.members || []).filter((m) => m.id !== id)
    }));
  };

  const handleAddAchievement = () => {
    if (!newAchievement.trim()) return;
    setFormData((prev) => ({
      ...prev,
      achievements: [...(prev.achievements || []), newAchievement.trim()]
    }));
    setNewAchievement('');
  };

  const handleRemoveAchievement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      achievements: (prev.achievements || []).filter((_, i) => i !== index)
    }));
  };

  const handleToggleSupportType = (type: string) => {
    const current = formData.requestedSupportTypes || [];
    if (current.includes(type)) {
      setFormData({
        ...formData,
        requestedSupportTypes: current.filter((t) => t !== type)
      });
    } else {
      setFormData({
        ...formData,
        requestedSupportTypes: [...current, type]
      });
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const catLabel =
      formData.category === 'ensino_medio'
        ? 'Ensino Médio'
        : formData.category === 'equipe_independente'
        ? 'Equipe Independente'
        : 'Universitária';

    const updatedTeam: RocketryTeam = {
      id: editingTeam ? editingTeam.id : `team-${Date.now()}`,
      name: formData.name.trim(),
      category: (formData.category as TeamCategory) || 'universitaria',
      categoryLabel: catLabel,
      institution: formData.institution?.trim() || 'Não informada',
      cityState: formData.cityState?.trim() || 'Brasil',
      slogan: formData.slogan?.trim() || '',
      description: formData.description?.trim() || '',
      history: formData.history?.trim() || '',
      achievements: formData.achievements || [],
      members: formData.members || [],
      contactEmail: formData.contactEmail?.trim() || '',
      whatsapp: formData.whatsapp?.trim() || '',
      phone: formData.phone?.trim() || '',
      socialInstagram: formData.socialInstagram?.trim() || '',
      socialLinkedin: formData.socialLinkedin?.trim() || '',
      website: formData.website?.trim() || '',
      pixKey: formData.pixKey?.trim() || '',
      bankDetails: formData.bankDetails?.trim() || '',
      sponsorshipContactName: formData.sponsorshipContactName?.trim() || '',
      sponsorshipContactEmail: formData.sponsorshipContactEmail?.trim() || '',
      sponsorshipContactPhone: formData.sponsorshipContactPhone?.trim() || '',
      requestedSupportTypes: formData.requestedSupportTypes || [],
      sponsorshipNeedsDescription: formData.sponsorshipNeedsDescription?.trim() || '',
      driveSponsorshipKitUrl: formData.driveSponsorshipKitUrl?.trim() || '',
      driveAcademicPapersUrl: formData.driveAcademicPapersUrl?.trim() || '',
      driveRocketBannersUrl: formData.driveRocketBannersUrl?.trim() || '',
      driveCadTelemetryFolderUrl: formData.driveCadTelemetryFolderUrl?.trim() || '',
      updatedAt: new Date().toLocaleString('pt-BR')
    };

    onSaveTeam(updatedTeam);
    setShowModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner and Category Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <Users className="w-5 h-5 text-red-500" />
            Equipes de Foguetemodelismo
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Cadastre sua equipe por categoria (Ensino Médio, Universitária ou Independente), cadastre membros, história, cotas de patrocínio e links do Google Drive para material e relatórios.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold px-4 py-2 rounded-lg shadow transition cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Nova Equipe
        </button>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-mono">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              selectedCategory === 'all'
                ? 'bg-red-600 border-red-500 text-white font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Todas ({teams.length})
          </button>

          <button
            onClick={() => setSelectedCategory('ensino_medio')}
            className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
              selectedCategory === 'ensino_medio'
                ? 'bg-amber-600 border-amber-500 text-white font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            Ensino Médio ({teams.filter((t) => t.category === 'ensino_medio').length})
          </button>

          <button
            onClick={() => setSelectedCategory('universitaria')}
            className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
              selectedCategory === 'universitaria'
                ? 'bg-blue-600 border-blue-500 text-white font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-blue-400" />
            Universitária ({teams.filter((t) => t.category === 'universitaria').length})
          </button>

          <button
            onClick={() => setSelectedCategory('equipe_independente')}
            className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
              selectedCategory === 'equipe_independente'
                ? 'bg-emerald-600 border-emerald-500 text-white font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            Independente ({teams.filter((t) => t.category === 'equipe_independente').length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nome ou cidade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111827] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-sans"
          />
        </div>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTeams.map((team) => {
          const isExpanded = expandedTeamId === team.id;

          const categoryBadgeColor =
            team.category === 'ensino_medio'
              ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
              : team.category === 'equipe_independente'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              : 'bg-blue-950/80 border-blue-500/50 text-blue-300';

          return (
            <div
              key={team.id}
              className="bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-xl transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Badge & Name */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-mono font-bold ${categoryBadgeColor}`}>
                      Categoria: {team.categoryLabel}
                    </span>
                    <h3 className="text-base font-bold text-white font-mono mt-1 flex items-center gap-2">
                      {team.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-sans">
                      {team.institution} • <span className="text-slate-300">{team.cityState}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(team)}
                    className="text-xs text-blue-400 hover:text-blue-300 underline font-mono shrink-0"
                  >
                    Editar
                  </button>
                </div>

                {/* Slogan & Description */}
                {team.slogan && (
                  <p className="text-xs text-amber-300/90 italic font-mono bg-black/40 p-2 rounded border border-amber-500/20">
                    "{team.slogan}"
                  </p>
                )}
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {team.description}
                </p>

                {/* Direct Google Drive Action Buttons */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] font-mono">
                  {team.driveSponsorshipKitUrl ? (
                    <a
                      href={team.driveSponsorshipKitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-500/40 px-2.5 py-1.5 rounded transition truncate"
                      title="Abrir Cotas de Patrocínio e Media Kit no Google Drive"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">Cotas Patrocínio (Drive)</span>
                      <ExternalLink className="w-3 h-3 text-amber-400 shrink-0 ml-auto" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-slate-900 text-slate-600 border border-slate-800 px-2.5 py-1.5 rounded text-[10px]">
                      Sem Cota no Drive
                    </span>
                  )}

                  {team.driveAcademicPapersUrl ? (
                    <a
                      href={team.driveAcademicPapersUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-500/40 px-2.5 py-1.5 rounded transition truncate"
                      title="Abrir Artigos Acadêmicos e Relatórios no Google Drive"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">Artigos & Relatórios</span>
                      <ExternalLink className="w-3 h-3 text-blue-400 shrink-0 ml-auto" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-slate-900 text-slate-600 border border-slate-800 px-2.5 py-1.5 rounded text-[10px]">
                      Sem Artigos no Drive
                    </span>
                  )}

                  {team.driveRocketBannersUrl && (
                    <a
                      href={team.driveRocketBannersUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-500/40 px-2.5 py-1.5 rounded transition truncate"
                      title="Abrir Banners e Fotos dos Foguetes no Google Drive"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="truncate">Banners dos Foguetes</span>
                      <ExternalLink className="w-3 h-3 text-purple-400 shrink-0 ml-auto" />
                    </a>
                  )}

                  {team.driveCadTelemetryFolderUrl && (
                    <a
                      href={team.driveCadTelemetryFolderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 px-2.5 py-1.5 rounded transition truncate"
                      title="Abrir CADs e Telemetrias no Google Drive"
                    >
                      <FolderDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">CADs & Telemetrias</span>
                      <ExternalLink className="w-3 h-3 text-cyan-400 shrink-0 ml-auto" />
                    </a>
                  )}
                </div>

                {/* Requested Sponsorship Badges */}
                {team.requestedSupportTypes && team.requestedSupportTypes.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Apoio & Patrocínio Solicitado:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {team.requestedSupportTypes.map((st, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono"
                        >
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Collapsible Details: Members, History, Contact */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-3 animate-fadeIn">
                    {/* Members List */}
                    {team.members && team.members.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          Membros da Equipe ({team.members.length}):
                        </h4>
                        <div className="space-y-1.5 bg-black/40 p-2.5 rounded border border-slate-800">
                          {team.members.map((m) => (
                            <div key={m.id} className="text-xs border-b border-slate-800/60 pb-1.5 last:border-none last:pb-0">
                              <div className="flex justify-between items-center font-mono">
                                <span className="font-bold text-slate-200">{m.name}</span>
                                <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.2 rounded">
                                  {m.role}
                                </span>
                              </div>
                              {m.curriculumSummary && (
                                <p className="text-[11px] text-slate-400 font-sans mt-0.5">{m.curriculumSummary}</p>
                              )}
                              {m.driveCvLink && (
                                <a
                                  href={m.driveCvLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:underline font-mono mt-0.5"
                                >
                                  Currículo do Membro (Drive) <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* History & Achievements */}
                    {team.history && (
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-amber-400" />
                          História da Equipe:
                        </h4>
                        <p className="text-xs text-slate-300 font-sans leading-relaxed">{team.history}</p>
                      </div>
                    )}

                    {team.achievements && team.achievements.length > 0 && (
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          Conquistas & Prêmios:
                        </h4>
                        <ul className="list-disc list-inside text-xs text-slate-300 font-sans space-y-0.5">
                          {team.achievements.map((ach, idx) => (
                            <li key={idx}>{ach}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Sponsorship Contact Info */}
                    {(team.sponsorshipContactName || team.pixKey || team.contactEmail || team.whatsapp) && (
                      <div className="bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-lg space-y-1.5 font-mono text-xs">
                        <div className="text-emerald-400 font-bold flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          Dados para Apoio Financeiro & Patrocínio:
                        </div>
                        {team.sponsorshipContactName && (
                          <div className="text-slate-300">Contato: {team.sponsorshipContactName}</div>
                        )}
                        {team.sponsorshipContactEmail && (
                          <div className="text-slate-300">Email: {team.sponsorshipContactEmail}</div>
                        )}
                        {team.whatsapp && (
                          <div className="text-emerald-300 flex items-center gap-1">
                            WhatsApp: {team.whatsapp}
                          </div>
                        )}
                        {team.pixKey && (
                          <div className="text-amber-300 bg-black/50 p-1.5 rounded border border-amber-500/20 text-[11px]">
                            Chave Pix: {team.pixKey}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer: Expand/Collapse Details */}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-mono">
                <button
                  onClick={() => setExpandedTeamId(isExpanded ? null : team.id)}
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4 text-red-400" />
                      Recolher Detalhes
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 text-cyan-400" />
                      Ver Membros, História e Contatos de Patrocínio
                    </>
                  )}
                </button>

                {team.whatsapp && (
                  <a
                    href={`https://wa.me/${team.whatsapp.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(team.name)},%20vimos%20seu%20cadastro%20no%20Hub%20Aeroespacial%20e%20gostaríamos%20de%20conversar%20sobre%20patrocínio.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-[11px] font-bold transition shadow"
                  >
                    Falar no WhatsApp
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Register / Edit Team */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-[#111827] border border-red-500/40 rounded-xl max-w-2xl w-full p-5 space-y-4 shadow-2xl my-8 text-slate-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" />
                {editingTeam ? 'Editar Equipe de Foguetemodelismo' : 'Cadastrar Nova Equipe no Cloudflare Pages'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white font-mono font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs font-sans max-h-[70vh] overflow-y-auto pr-1">
              {/* Category & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1 font-bold">
                    Categoria da Equipe *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as TeamCategory })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono focus:border-red-500"
                  >
                    <option value="ensino_medio">Ensino Médio</option>
                    <option value="universitaria">Universitária</option>
                    <option value="equipe_independente">Equipe Independente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1 font-bold">
                    Nome da Equipe *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Equipe Minerva Rockets"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-red-500"
                  />
                </div>
              </div>

              {/* Institution & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">
                    Instituição / Escola / Laboratório
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: UFRJ / IFPR / Laboratório Comunitário"
                    value={formData.institution || ''}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">
                    Cidade / Estado
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Curitiba, PR"
                    value={formData.cityState || ''}
                    onChange={(e) => setFormData({ ...formData, cityState: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-red-500"
                  />
                </div>
              </div>

              {/* Slogan & Description */}
              <div>
                <label className="block text-slate-300 font-mono mb-1">
                  Slogan ou Lema da Equipe (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Inovação e Precisão Aerodinâmica"
                  value={formData.slogan || ''}
                  onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1 font-bold">
                  Descrição da Equipe e Foco Tecnológico *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Descreva o foco da equipe (ex: propulsão sólida KNSB, aviônica LoRa, cargas úteis CanSat...)"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-red-500"
                />
              </div>

              {/* Members Registration Section (Optional) */}
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg space-y-3">
                <h4 className="font-mono font-bold text-cyan-400 flex items-center justify-between">
                  <span>Registrar Membros e Funções (Opcional)</span>
                  <span className="text-[10px] text-slate-400">Total: {formData.members?.length || 0}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nome do Membro"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="bg-black/60 border border-slate-700 rounded p-1.5 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Função (ex: Diretor de Propulsão)"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="bg-black/60 border border-slate-700 rounded p-1.5 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Resumo do Currículo (opcional)"
                    value={newMemberCv}
                    onChange={(e) => setNewMemberCv(e.target.value)}
                    className="bg-black/60 border border-slate-700 rounded p-1.5 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Link Drive Currículo (opcional)"
                    value={newMemberDrive}
                    onChange={(e) => setNewMemberDrive(e.target.value)}
                    className="bg-black/60 border border-slate-700 rounded p-1.5 text-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddMember}
                  className="bg-cyan-700 hover:bg-cyan-600 text-white font-mono text-[11px] px-3 py-1 rounded font-bold"
                >
                  + Adicionar Membro
                </button>

                {formData.members && formData.members.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {formData.members.map((m) => (
                      <div key={m.id} className="flex justify-between items-center bg-black/40 p-1.5 rounded text-[11px]">
                        <span><strong>{m.name}</strong> — <span className="text-cyan-300">{m.role}</span></span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(m.id)}
                          className="text-red-400 hover:text-red-300 font-mono font-bold"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* History & Achievements (Optional) */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-mono">
                  História da Equipe (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Fundação, marcos e trajetória da equipe..."
                  value={formData.history || ''}
                  onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              {/* Google Drive Links */}
              <div className="bg-slate-900/80 border border-amber-500/30 p-3 rounded-lg space-y-3">
                <h4 className="font-mono font-bold text-amber-400 flex items-center gap-1.5">
                  <FolderDown className="w-4 h-4" />
                  Links do Google Drive (Acesso a Materiais)
                </h4>

                <div className="space-y-2 text-[11px]">
                  <div>
                    <label className="block text-slate-300 font-mono mb-0.5">
                      Link Google Drive: Cotas de Patrocínio / Media Kit
                    </label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/drive/folders/cota_patrocinio..."
                      value={formData.driveSponsorshipKitUrl || ''}
                      onChange={(e) => setFormData({ ...formData, driveSponsorshipKitUrl: e.target.value })}
                      className="w-full bg-black/60 border border-slate-700 rounded p-1.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-mono mb-0.5">
                      Link Google Drive: Artigos Acadêmicos & Relatórios Técnicos
                    </label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/drive/folders/artigos_tecnicos..."
                      value={formData.driveAcademicPapersUrl || ''}
                      onChange={(e) => setFormData({ ...formData, driveAcademicPapersUrl: e.target.value })}
                      className="w-full bg-black/60 border border-slate-700 rounded p-1.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-mono mb-0.5">
                      Link Google Drive: Banner dos Foguetes & Pôsteres
                    </label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/drive/folders/banners_foguetes..."
                      value={formData.driveRocketBannersUrl || ''}
                      onChange={(e) => setFormData({ ...formData, driveRocketBannersUrl: e.target.value })}
                      className="w-full bg-black/60 border border-slate-700 rounded p-1.5 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Support & Sponsorship Contacts (Optional) */}
              <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-lg space-y-3">
                <h4 className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  Apoio Financeiro e Patrocínio (Empresas Visitantes)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <input
                    type="text"
                    placeholder="Nome do Responsável de Patrocínio"
                    value={formData.sponsorshipContactName || ''}
                    onChange={(e) => setFormData({ ...formData, sponsorshipContactName: e.target.value })}
                    className="bg-black/60 border border-slate-700 rounded p-1.5 text-white"
                  />
                  <input
                    type="email"
                    placeholder="E-mail de Patrocínio"
                    value={formData.sponsorshipContactEmail || ''}
                    onChange={(e) => setFormData({ ...formData, sponsorshipContactEmail: e.target.value })}
                    className="bg-black/60 border border-slate-700 rounded p-1.5 text-white"
                  />
                  <input
                    type="text"
                    placeholder="WhatsApp para Empresas (+55...)"
                    value={formData.whatsapp || ''}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="bg-black/60 border border-slate-700 rounded p-1.5 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Chave Pix (opcional para doações)"
                    value={formData.pixKey || ''}
                    onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                    className="bg-black/60 border border-slate-700 rounded p-1.5 text-white"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
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
                  className="bg-red-600 hover:bg-red-500 text-white font-mono text-xs px-5 py-2 rounded font-bold shadow"
                >
                  {editingTeam ? 'Salvar Alterações' : 'Registrar Equipe no Cloudflare'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
