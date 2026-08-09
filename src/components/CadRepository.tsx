import React, { useState } from 'react';
import { 
  Box, 
  Cpu, 
  Download, 
  ExternalLink, 
  FileText, 
  Filter, 
  FolderDown, 
  GraduationCap, 
  Briefcase, 
  Lock, 
  Plus, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  Code, 
  CheckCircle2, 
  Share2,
  AlertTriangle
} from 'lucide-react';
import { CadResource, User } from '../types';

interface CadRepositoryProps {
  currentUser: User | null;
  onOpenAuthModal: () => void;
}

const INITIAL_RESOURCES: CadResource[] = [
  {
    id: 'cad_01',
    title: 'Coifa Parabólica Von Kármán 82mm com Encaixe de Baioneta',
    authorName: 'Micael Nildo',
    institution: 'MNAnimat Aerospace / BAR-AEB',
    category: 'cad_3d',
    softwareUsed: 'SolidWorks 2024 (Versão Educacional)',
    softwareLicenseType: 'educacional',
    resourceLicense: 'educacional_livre',
    licenseText: `TERMO DE LICENÇA DE USO EDUCACIONAL E ACADÊMICO
------------------------------------------------------------------
Item: Coifa Parabólica Von Kármán 82mm com Encaixe de Baioneta
Autor: Micael Nildo
Instituição: MNAnimat Aerospace / BAR-AEB
Licença de Origem do Software: SolidWorks 2024 Student / Educational License

CONDIÇÕES DE USO:
1. Este modelo CAD 3D é fornecido para fins estritamente EDUCACIONAIS, acadêmicos, de pesquisa e simulação em foguetemodelismo.
2. É PROIBIDA a comercialização direta dos arquivos digitais (.STEP, .STL, .SLDPRT) ou a venda em massa dos objetos impressos sem prévia autorização por escrito do autor.
3. Permite-se a impressão 3D (PETG, PLA, ABS) para uso próprio por equipes de foguetemodelismo e competições universitárias (Festival de Minifoguetes, Cobruf, Latin American Space Challenge).
4. Em qualquer publicação técnica, citar os créditos de autoria: Micael Nildo.`,
    driveDownloadUrl: 'https://drive.google.com/drive/folders/1_sample_foguetedata_vonkarman_82mm',
    description: 'Perfil aerodinâmico Von Kármán de baixíssimo atrito transônico com compartimento interno para altímetro e mecanismo de baioneta de rápida desconexão.',
    fileFormat: '.STEP, .STL, .SLDPRT',
    createdAt: '2026-08-09',
    downloadsCount: 142
  },
  {
    id: 'cad_02',
    title: 'Diagrama de Placa do Altímetro Duplo LoRa ESP32 MS5611',
    authorName: 'Equipe de Eletrônica Aviônica',
    institution: 'Grupo de Foguetes Científicos',
    category: 'diagrama_eletronico',
    softwareUsed: 'KiCad 8.0 (Open Source Software)',
    softwareLicenseType: 'open_source',
    resourceLicense: 'comercial_permitido',
    licenseText: `TERMO DE LICENÇA DE USO COMERCIAL AUTORIZADO (OPEN HARDWARE)
------------------------------------------------------------------
Item: Diagrama de Placa do Altímetro Duplo LoRa ESP32 MS5611
Autor: Equipe de Eletrônica Aviônica
Licença de Origem do Software: KiCad 8.0 Open Source

CONDIÇÕES DE USO:
1. ESTE PROJETO DE HARDWARE É LIBERADO PARA USO COMERCIAL E INDUSTRIAL.
2. Permite-se a fabricação de PCBs (JLCPCB, PCBWay), montagem de componentes SMT, integração em aviônicas e comercialização de kits sem pagamento de royalties.
3. Os esquemáticos (.kicad_sch), layout de placa (.kicad_pcb) e arquivos Gerber para produção direta são disponibilizados sob a licença CERN Open Hardware License v2.
4. Mantém-se o dever moral de manter os créditos dos engenheiros criadores na documentação.`,
    driveDownloadUrl: 'https://drive.google.com/drive/folders/1_sample_foguetedata_altimeter_lora',
    description: 'Esquemático eletrônico completo, layout PCB de 2 camadas com plano de terra reforçado e arquivos Gerber para acionamento de cargas pirotécnicas no apogeu.',
    fileFormat: '.kicad_sch, .kicad_pcb, .GERBER, .PDF',
    createdAt: '2026-08-08',
    downloadsCount: 98
  },
  {
    id: 'cad_03',
    title: 'Aletagem Tripla Ajustável com Retentor de Motor Classe G/H',
    authorName: 'Eng. Lucas Fernandes',
    institution: 'MNAnimat AeroSpace',
    category: 'cad_3d',
    softwareUsed: 'Autodesk Fusion 360 (Licença Educacional)',
    softwareLicenseType: 'educacional',
    resourceLicense: 'educacional_livre',
    licenseText: `TERMO DE LICENÇA DE USO EDUCACIONAL E ACADÊMICO
------------------------------------------------------------------
Item: Aletagem Tripla Ajustável com Retentor de Motor Classe G/H
Autor: Eng. Lucas Fernandes
Licença de Origem do Software: Autodesk Fusion 360 Education License

CONDIÇÕES DE USO:
1. Projeto desenvolvido sob licença educacional de software CAD.
2. Destinado ao estudo de estabilidade estática e margem de calibres para minifoguetes.
3. Proibido uso comercial ou revenda industrial dos arquivos em lote sem autorização.
4. Livre utilização em projetos acadêmicos e equipes de bancada universitária.`,
    driveDownloadUrl: 'https://drive.google.com/drive/folders/1_sample_foguetedata_finset_g10',
    description: 'Aletas trapezoidais chanfradas a 45° otimizadas para corte CNC em placa G10/Fibra de vidro ou impressão 3D reforçada em fibra de carbono.',
    fileFormat: '.STEP, .3MF, .DXF',
    createdAt: '2026-08-05',
    downloadsCount: 76
  },
  {
    id: 'cad_04',
    title: 'Bancada Eletrônica de Ignição Remota por RF 433MHz com Chave de Segurança',
    authorName: 'Micael Nildo',
    institution: 'BAR / MNAnimat Research',
    category: 'diagrama_eletronico',
    softwareUsed: 'EasyEDA Professional',
    softwareLicenseType: 'comercial',
    resourceLicense: 'comercial_permitido',
    licenseText: `TERMO DE LICENÇA COMERCIAL E DE FABRICAÇÃO LIVRE
------------------------------------------------------------------
Item: Bancada Eletrônica de Ignição Remota por RF 433MHz
Autor: Micael Nildo / BAR Research
Licença de Origem do Software: EasyEDA Commercial License

CONDIÇÕES DE USO:
1. Este circuito foi desenvolvido para proporcionar ignição segura e remota de motores de propelente sólido e híbrido.
2. PERMITIDO USO COMERCIAL TOTAL: fabricação, comercialização e modificação livre de royalties.
3. Inclui chave física de armamento (Safety Key) e buzzer indicador de continuidade de e-match.`,
    driveDownloadUrl: 'https://drive.google.com/drive/folders/1_sample_foguetedata_igniter_433mhz',
    description: 'Sistema de ignição remota sem fio com dupla validação de relés e proteção contra acionamento acidental durante a instalação do e-match na rampa.',
    fileFormat: '.JSON, .GERBER, .PDF, .BOM',
    createdAt: '2026-08-02',
    downloadsCount: 112
  }
];

export const CadRepository: React.FC<CadRepositoryProps> = ({
  currentUser,
  onOpenAuthModal
}) => {
  const [resources, setResources] = useState<CadResource[]>(INITIAL_RESOURCES);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedLicenseFilter, setSelectedLicenseFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State for New CAD/Diagram Submission
  const [showModal, setShowModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<CadResource['category']>('cad_3d');
  const [softwareUsed, setSoftwareUsed] = useState<string>('');
  const [softwareLicenseType, setSoftwareLicenseType] = useState<CadResource['softwareLicenseType']>('educacional');
  const [resourceLicense, setResourceLicense] = useState<CadResource['resourceLicense']>('educacional_livre');
  const [driveUrl, setDriveUrl] = useState<string>('');
  const [fileFormat, setFileFormat] = useState<string>('.STEP, .STL');
  const [description, setDescription] = useState<string>('');
  const [customLicenseTerms, setCustomLicenseTerms] = useState<string>('');

  // Toast Notice
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDownloadLicenseText = (res: CadResource) => {
    const fullContent = `====================================================================
TERMO OFICIAL DE LICENÇA E CRÉDITOS TÉCNICOS
FOGUETEDATA AEROSPACE - ECOSSISTEMA MNANIMAT RESEARCH
====================================================================

NOME DO MATERIAL: ${res.title}
AUTOR AUTORIZADO: ${res.authorName} (${res.institution || 'Independente'})
CATEGORIA: ${res.category.toUpperCase()}
FORMATO DOS ARQUIVOS: ${res.fileFormat}
SOFTWARE UTILIZADO: ${res.softwareUsed}
TIPO DE LICENÇA DO SOFTWARE: ${res.softwareLicenseType.toUpperCase()}
MODO DE LICENCIAMENTO: ${res.resourceLicense.toUpperCase()}

LINK PARA DOWNLOAD DOS ARQUIVOS DE CAD/GERBER (GOOGLE DRIVE):
${res.driveDownloadUrl}

--------------------------------------------------------------------
DISPOSIÇÕES E TERMOS LEGAIS DE USO:
--------------------------------------------------------------------
${res.licenseText}

--------------------------------------------------------------------
GERADO EM: ${new Date().toLocaleString('pt-BR')}
PLATAFORMA: FogueteData Aerospace - https://foguetedata.mnanimat.xyz
====================================================================`;

    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LICENCA_${res.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMessage(`📄 Termo de licença baixado com sucesso para: ${res.title}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenDrive = (res: CadResource) => {
    // Increment download count
    setResources(prev => prev.map(item => item.id === res.id ? { ...item, downloadsCount: item.downloadsCount + 1 } : item));
    window.open(res.driveDownloadUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !driveUrl.trim()) return;

    // Auto generate default license text based on selection
    let generatedLicenseText = '';
    if (resourceLicense === 'educacional_livre') {
      generatedLicenseText = `TERMO DE LICENÇA DE USO EDUCACIONAL E ACADÊMICO
------------------------------------------------------------------
Item: ${title}
Autor: ${currentUser ? currentUser.name : 'Micael Nildo'}
Software Utilizado: ${softwareUsed} (${softwareLicenseType.toUpperCase()})

CONDIÇÕES DE USO:
1. Este material foi desenvolvido em ambiente educacional e destina-se ao estudo, pesquisa e competições de minifoguetes sem fins lucrativos.
2. Fica expressamente vedada a comercialização industrial ou venda direta do arquivo ou da peça sem anuência do autor.
3. Permite-se modificação para adequação de diâmetro de corpo de minifoguetes mantendo os créditos de criação.
${customLicenseTerms ? `\nTERMOS ADICIONAIS DO AUTOR:\n${customLicenseTerms}` : ''}`;
    } else if (resourceLicense === 'comercial_permitido') {
      generatedLicenseText = `TERMO DE LICENÇA DE USO COMERCIAL AUTORIZADO
------------------------------------------------------------------
Item: ${title}
Autor: ${currentUser ? currentUser.name : 'Micael Nildo'}
Software Utilizado: ${softwareUsed}

CONDIÇÕES DE USO:
1. AUTORIZADO O USO COMERCIAL E INDUSTRIAL COMPLETO.
2. Livre para produção em série, venda física de peças usinadas ou impressas em 3D, e montagem de placas eletrônicas para mercado.
3. Não há royalties exigidos.
${customLicenseTerms ? `\nTERMOS ADICIONAIS DO AUTOR:\n${customLicenseTerms}` : ''}`;
    } else {
      generatedLicenseText = `TERMO DE LICENÇA OPEN HARDWARE & LICENÇA LIVRE (CC BY-SA / MIT)
------------------------------------------------------------------
Item: ${title}
Autor: ${currentUser ? currentUser.name : 'Micael Nildo'}
Software Utilizado: ${softwareUsed}

CONDIÇÕES DE USO:
1. Projeto aberto. Livre para copiar, distribuir, modificar e criar trabalhos derivados.
2. Requer atribuição de autoria original.
${customLicenseTerms ? `\nTERMOS ADICIONAIS DO AUTOR:\n${customLicenseTerms}` : ''}`;
    }

    const newRes: CadResource = {
      id: 'cad_' + Date.now(),
      title,
      authorName: currentUser ? currentUser.name : 'Micael Nildo',
      institution: currentUser?.teamName || 'Colaborador FogueteData',
      category,
      softwareUsed: softwareUsed || 'CAD / EDA Multiplataforma',
      softwareLicenseType,
      resourceLicense,
      licenseText: generatedLicenseText,
      driveDownloadUrl: driveUrl,
      description: description || 'Material disponibilizado para a comunidade de foguetemodelismo.',
      fileFormat: fileFormat || '.STEP, .STL',
      createdAt: new Date().toISOString().split('T')[0],
      downloadsCount: 1
    };

    setResources([newRes, ...resources]);
    setShowModal(false);
    // Reset fields
    setTitle('');
    setSoftwareUsed('');
    setDriveUrl('');
    setDescription('');
    setCustomLicenseTerms('');

    setToastMessage('✨ Novo material CAD / Diagrama cadastrado com sucesso!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredResources = resources.filter(res => {
    const matchesCategory = selectedCategory === 'todos' || res.category === selectedCategory;
    const matchesLicense = selectedLicenseFilter === 'todos' || res.resourceLicense === selectedLicenseFilter;
    const matchesSearch = searchQuery === '' || 
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.softwareUsed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.fileFormat.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesLicense && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-emerald-600 text-white font-mono text-xs px-4 py-2.5 rounded-lg shadow-2xl border border-emerald-300 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-[10px] uppercase tracking-wider mb-1">
            <Box className="w-3.5 h-3.5" />
            Engenharia Aberta & Repositório Técnico
          </div>
          <h2 className="text-xl font-bold font-italic-title text-slate-900 dark:text-white tracking-tight">
            Repositório de Modelos CAD 3D, Diagramas Eletrônicos e Licenças
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Acesse e compartilhe arquivos de engenharia de foguetemodelismo em pacotes diretos no Google Drive.
            Faça login para anexar seus modelos CAD, desenhos 2D (.STEP, .STL), projetos de placas (.kicad_pcb, Gerber) e associar a respectiva <strong className="text-amber-400">Licença Educacional ou Comercial</strong> para download.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-lg shadow-blue-600/30 font-mono"
            >
              <Plus className="w-4 h-4" />
              Anexar Arquivo CAD / Diagrama (Google Drive)
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 px-4 py-2 rounded-lg text-xs font-mono font-bold transition"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              Fazer Login p/ Anexar Arquivo
            </button>
          )}
        </div>
      </div>

      {/* Software & Licensing Rules Information Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Educacional Banner */}
        <div className="bg-[#111827] border border-amber-500/30 rounded-lg p-4 shadow-md flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-amber-300 uppercase font-mono tracking-wider flex items-center gap-2">
              <span>Licença Educacional & Acadêmica</span>
              <span className="text-[9px] bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded border border-amber-800 font-mono">
                Software de Ensino
              </span>
            </h3>
            <p className="text-[11px] text-slate-300 leading-snug">
              Para projetos modelados em versões estudantis/acadêmicas (ex: SolidWorks Education, Fusion 360 Personal). Permite estudo livre, simulação e impressão 3D para equipes universitárias, vedada qualquer exploração comercial sem permissão.
            </p>
          </div>
        </div>

        {/* Comercial Banner */}
        <div className="bg-[#111827] border border-emerald-500/30 rounded-lg p-4 shadow-md flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-emerald-300 uppercase font-mono tracking-wider flex items-center gap-2">
              <span>Licença com Uso Comercial Autorizado</span>
              <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800 font-mono">
                Uso Industrial Liberado
              </span>
            </h3>
            <p className="text-[11px] text-slate-300 leading-snug">
              Para componentes criados em softwares de licença comercial ou open-source. Permite usinagem CNC, fabricação de placas de circuito impresso em lote, revenda física de kits e integração industrial sem pagamento de royalties.
            </p>
          </div>
        </div>

      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-3.5 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título, autor, software (.STEP, KiCad, SolidWorks)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#05070A] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:border-blue-500 outline-none text-xs"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-blue-400" />
            Categoria:
          </span>
          {[
            { id: 'todos', label: 'Todos os Materiais' },
            { id: 'cad_3d', label: 'Modelos CAD 3D' },
            { id: 'diagrama_eletronico', label: 'Diagramas Eletrônicos' },
            { id: 'manual_tecnico', label: 'Manuais / Planilhas' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded text-[11px] transition ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white font-bold shadow'
                  : 'bg-[#05070A] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* License Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[10px] uppercase">Licença:</span>
          <select
            value={selectedLicenseFilter}
            onChange={(e) => setSelectedLicenseFilter(e.target.value)}
            className="bg-[#05070A] border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs outline-none"
          >
            <option value="todos">Todas as Licenças</option>
            <option value="educacional_livre">🎓 Uso Educacional</option>
            <option value="comercial_permitido">💼 Uso Comercial Autorizado</option>
          </select>
        </div>

      </div>

      {/* Main Grid of CAD & Diagram Material Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map((res) => {
          const isEducacional = res.resourceLicense === 'educacional_livre';
          const isComercial = res.resourceLicense === 'comercial_permitido';

          return (
            <div
              key={res.id}
              className={`bg-[#111827] border ${
                isEducacional ? 'border-amber-500/40 hover:border-amber-400' : 'border-emerald-500/40 hover:border-emerald-400'
              } rounded-xl p-4 shadow-xl flex flex-col justify-between transition-all space-y-4`}
            >
              <div className="space-y-3">
                
                {/* Card Top Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    {res.category === 'cad_3d' && (
                      <span className="bg-blue-900/40 text-blue-400 border border-blue-800/60 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <Box className="w-3 h-3" />
                        CAD 3D
                      </span>
                    )}
                    {res.category === 'diagrama_eletronico' && (
                      <span className="bg-cyan-900/40 text-cyan-400 border border-cyan-800/60 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        ELETRÔNICA
                      </span>
                    )}
                    <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700">
                      {res.fileFormat}
                    </span>
                  </div>

                  {/* License Badge */}
                  {isEducacional ? (
                    <span className="bg-amber-950/80 text-amber-300 border border-amber-600/60 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <GraduationCap className="w-3 h-3 text-amber-400" />
                      Licença Educacional
                    </span>
                  ) : (
                    <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Briefcase className="w-3 h-3 text-emerald-400" />
                      Uso Comercial Autorizado
                    </span>
                  )}
                </div>

                {/* Resource Title & Details */}
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                    {res.title}
                  </h3>
                  <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-3 font-mono">
                    <span>Autor: <strong className="text-slate-200">{res.authorName}</strong></span>
                    {res.institution && <span className="text-slate-500">• {res.institution}</span>}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed bg-[#05070A] p-2.5 rounded-lg border border-slate-800/80">
                  {res.description}
                </p>

                {/* Software Origin Info */}
                <div className="text-[11px] text-slate-400 font-mono bg-slate-900/80 p-2 rounded border border-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-blue-400" />
                    Software de Criação:
                  </span>
                  <span className="font-semibold text-slate-200">{res.softwareUsed}</span>
                </div>

              </div>

              {/* Action Buttons: Google Drive Download + License Term TXT Download */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  
                  {/* Google Drive Primary Download */}
                  <button
                    onClick={() => handleOpenDrive(res)}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <FolderDown className="w-4 h-4 text-white" />
                    <span>Baixar Pacote no Google Drive</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </button>

                  {/* Download License Term Button */}
                  <button
                    onClick={() => handleDownloadLicenseText(res)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-2 rounded-lg text-xs font-mono transition border border-slate-700 flex items-center justify-center gap-1.5"
                    title="Baixar o arquivo oficial do Termo de Licença em formato .txt"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Baixar Licença (.txt)</span>
                  </button>

                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-1">
                  <span>Cadastrado em: {res.createdAt}</span>
                  <span className="text-slate-400">Downloads efetuados: {res.downloadsCount}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal - Attach New CAD / Diagram with Google Drive Link and License Selection */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-6 max-w-xl w-full my-8 space-y-4 shadow-2xl text-slate-100 font-sans">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                <Box className="w-5 h-5 text-blue-400" />
                Anexar Material CAD / Diagrama com Licença
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-3 text-xs">
              
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Título do Projeto ou Componente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Coifa Ogival 82mm STEP com Encaixe de Sensor Barométrico"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#05070A] border border-slate-800 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoria de Material</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CadResource['category'])}
                    className="w-full bg-[#05070A] border border-slate-800 rounded-lg p-2.5 text-white outline-none font-mono"
                  >
                    <option value="cad_3d">Modelo 3D CAD (.STEP, .STL, .SLDPRT)</option>
                    <option value="diagrama_eletronico">Diagrama Eletrônico (.kicad_sch, Gerber)</option>
                    <option value="manual_tecnico">Manual Técnico / Planilha de Cálculo</option>
                    <option value="algoritmo_software">Algoritmo / Código de Aviônica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Formatos de Arquivo Inclusos</label>
                  <input
                    type="text"
                    placeholder="Ex: .STEP, .STL, .PDF"
                    value={fileFormat}
                    onChange={(e) => setFileFormat(e.target.value)}
                    className="w-full bg-[#05070A] border border-slate-800 rounded-lg p-2.5 text-white outline-none font-mono"
                  />
                </div>
              </div>

              {/* Software Used & Software Origin License */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Software Utilizado na Criação</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: SolidWorks 2024, Fusion 360, KiCad 8.0"
                    value={softwareUsed}
                    onChange={(e) => setSoftwareUsed(e.target.value)}
                    className="w-full bg-[#05070A] border border-slate-800 rounded-lg p-2.5 text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Licença do Software de Origem</label>
                  <select
                    value={softwareLicenseType}
                    onChange={(e) => setSoftwareLicenseType(e.target.value as CadResource['softwareLicenseType'])}
                    className="w-full bg-[#05070A] border border-slate-800 rounded-lg p-2.5 text-white outline-none font-mono"
                  >
                    <option value="educacional">🎓 Licença Educacional / Estudantil</option>
                    <option value="comercial">💼 Licença Comercial Pago</option>
                    <option value="open_source">🔓 Software Livre / Open Source</option>
                  </select>
                </div>
              </div>

              {/* Select Distribution License Model */}
              <div className="space-y-1 pt-1">
                <label className="block text-amber-400 font-bold mb-1 flex items-center gap-1.5 font-mono">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Modelo de Licença para Download & Distribuição *
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label className={`p-3 rounded-lg border cursor-pointer transition flex items-start gap-2 ${
                    resourceLicense === 'educacional_livre'
                      ? 'bg-amber-950/40 border-amber-500 text-white font-bold'
                      : 'bg-[#05070A] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="licenseType"
                      value="educacional_livre"
                      checked={resourceLicense === 'educacional_livre'}
                      onChange={() => setResourceLicense('educacional_livre')}
                      className="mt-0.5 accent-amber-500"
                    />
                    <div className="space-y-0.5 text-[11px]">
                      <div className="text-amber-300 font-bold flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        Uso Educacional / Acadêmico
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal leading-tight">
                        Feito para estudo e equipe universitária. Vedada venda comercial do modelo ou peça.
                      </div>
                    </div>
                  </label>

                  <label className={`p-3 rounded-lg border cursor-pointer transition flex items-start gap-2 ${
                    resourceLicense === 'comercial_permitido'
                      ? 'bg-emerald-950/40 border-emerald-500 text-white font-bold'
                      : 'bg-[#05070A] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="licenseType"
                      value="comercial_permitido"
                      checked={resourceLicense === 'comercial_permitido'}
                      onChange={() => setResourceLicense('comercial_permitido')}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <div className="space-y-0.5 text-[11px]">
                      <div className="text-emerald-300 font-bold flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        Uso Comercial Autorizado
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal leading-tight">
                        Permite fabricação industrial, usinagem, venda física e reprodução sem royalties.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Google Drive Link Input */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <FolderDown className="w-3.5 h-3.5 text-blue-400" />
                  Link do Compartilhamento no Google Drive *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  className="w-full bg-[#05070A] border border-slate-800 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none font-mono"
                />
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                  Certifique-se de definir a permissão da pasta como "Qualquer pessoa com o link pode ver/baixar".
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descrição Técnica e Instruções</label>
                <textarea
                  rows={3}
                  placeholder="Instruções de impressão 3D (ex: PETG com 4 paredes, infilled 30%), diâmetros do tubo e observações..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#05070A] border border-slate-800 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cláusulas Especiais da Licença (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Requer citar créditos em artigos científicos do projeto."
                  value={customLicenseTerms}
                  onChange={(e) => setCustomLicenseTerms(e.target.value)}
                  className="w-full bg-[#05070A] border border-slate-800 rounded-lg p-2 text-white outline-none font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 font-mono"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg font-mono"
                >
                  Publicar Material & Licença
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
