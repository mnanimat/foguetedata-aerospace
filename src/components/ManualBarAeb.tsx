import React, { useState } from 'react';
import { MANUAL_TIMELINE, MANUAL_TOPICS_DRAFT, MOTOR_CLASSIFICATION_TABLE } from '../data/manualData';
import { ManualContribution, User } from '../types';
import { BookOpen, Calendar, Mail, ExternalLink, CheckCircle2, Clock, Send, Sparkles, UserCheck, ShieldCheck, FileText } from 'lucide-react';

interface ManualBarAebProps {
  currentUser: User | null;
  onOpenAuthModal: () => void;
}

export const ManualBarAeb: React.FC<ManualBarAebProps> = ({ currentUser, onOpenAuthModal }) => {
  // Authorial Contributions State
  const [contributions, setContributions] = useState<ManualContribution[]>([
    {
      id: 'c1',
      authorName: 'Micael Nildo',
      email: 'micaelnildo@mnanimat.xyz',
      institution: 'MNAnimat Aerospace',
      topicTitle: '4. Eletrônica, Localizadores e Modelagem 3D em Tempo Real',
      proposedContent:
        'Proposta de diretrizes para padronização de interfaces de telemetria LoRa (915 MHz) integradas a computadores de voo ESP32. Inclui procedimentos de teste para verificação da taxa de atualização do barômetro em câmara de vácuo, isolamento eletromagnético de servomotores e exportação de telemetria para renderização 3D em tempo real.',
      status: 'submetido',
      date: '2026-08-09',
      isSpecialAuthor: true
    }
  ]);

  // Form State
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorInstitution, setAuthorInstitution] = useState('');
  const [topicTitle, setTopicTitle] = useState('3. Propelentes, Materiais e Testes Estáticos');
  const [customTopicTitle, setCustomTopicTitle] = useState('');
  const [proposedContent, setProposedContent] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const handleSubmitContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposedContent.trim()) return;

    const resolvedTopic = topicTitle === 'custom' 
      ? (customTopicTitle.trim() ? `[Tópico Personalizado] ${customTopicTitle.trim()}` : 'Tópico Personalizado')
      : topicTitle;

    const newContrib: ManualContribution = {
      id: 'contrib_' + Date.now(),
      authorName,
      email: authorEmail,
      institution: authorInstitution,
      topicTitle: resolvedTopic,
      proposedContent,
      status: 'submetido',
      date: new Date().toISOString().split('T')[0],
      isSpecialAuthor: authorName.toLowerCase().includes('micael')
    };

    setContributions([newContrib, ...contributions]);
    setProposedContent('');
    setCustomTopicTitle('');
    setSubmittedMessage(true);
    setTimeout(() => setSubmittedMessage(false), 5000);
  };

  return (
    <div className="space-y-4">
      {/* Hero Header - Official Invitation */}
      <div className="bg-[#111827] border border-blue-500/30 rounded-lg p-4 lg:p-5 shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] px-2.5 py-0.5 rounded font-mono">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Iniciativa Nacional BAR-AEB 2026-2027
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Manual BAR-AEB de Boas Práticas em Foguetemodelismo
          </h1>

          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
            Prezado membro da BAR e demais fogueteiros brasileiros.

            Vamos iniciar um esforço conjunto para termos até o primeiro semestre do próximo ano uma primeira versão do manual BAR-AEB de boas práticas em foguetemodelismo.

            Como documento de referência, usaremos o manual da Agência Espacial Brasileira - AEB, 
            gerado em 2023. Duas versões dele estão disponíveis no seguinte link:
            <a href="https://drive.google.com/drive/folders/1-p2vv-CPYN58ABkRV371PNZVm7HUmpuQ?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">https://drive.google.com/drive/folders/1-p2vv-CPYN58ABkRV371PNZVm7HUmpuQ?usp=sharing <ExternalLink className="w-3 h-3" /></a>
          </p>

          <div className="flex flex-wrap gap-2 text-[10px] font-mono">
            <span className="bg-blue-950/80 border border-blue-600/50 text-blue-300 px-2.5 py-1 rounded-md">
              🏛️ <strong>BAR:</strong> Associação Brasileira de Minifoguetes
            </span>
            <span className="bg-purple-950/80 border border-purple-600/50 text-purple-300 px-2.5 py-1 rounded-md">
              🇧🇷 <strong>AEB:</strong> Agência Espacial Brasileira (Governo Federal)
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href="https://drive.google.com/drive/folders/1-p2vv-CPYN58ABkRV371PNZVm7HUmpuQ?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded transition shadow"
            >
              <FileText className="w-3.5 h-3.5" />
              Acessar Manuais AEB (Google Drive)
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href="mailto:minifoguete@gmail.com"
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs px-3 py-1.5 rounded transition"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              Propostas: minifoguete@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* DEDICATED CONTRIBUTION SECTION: Micael Nildo */}
      <div className="bg-[#111827] border-2 border-blue-500/40 rounded-lg p-4 lg:p-5 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold mb-1">
              <UserCheck className="w-3 h-3 text-amber-400" />
              Espaço de Contribuição Autoral Especial
            </div>
            <h2 className="text-lg font-bold font-italic-title text-slate-900 dark:text-white tracking-tight">
              Espaço de Contribuição Autoral: Micael Nildo
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Área reservada para redação de artigos, especificações técnicas e proposições diretas para incorporação no Manual BAR-AEB.
            </p>
          </div>

          <div className="text-right font-mono text-[11px] text-slate-400">
            <span>Desenvolvedor: </span>
            <span className="text-blue-400 font-bold block">Micael Nildo</span>
          </div>
        </div>

        {/* Form for Submitting Contribution */}
        <form onSubmit={handleSubmitContribution} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 font-mono text-[11px]">Nome do Autor</label>
              <input
                type="text"
                required
                placeholder="Digite sua resposta..."
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-[#05070A] border border-slate-800 rounded p-2 text-white focus:border-blue-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 font-mono text-[11px]">E-mail de Contato</label>
              <input
                type="email"
                required
                placeholder="Digite sua resposta..."
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                className="w-full bg-[#05070A] border border-slate-800 rounded p-2 text-white focus:border-blue-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 font-mono text-[11px]">Instituição / Equipe</label>
              <input
                type="text"
                placeholder="Digite sua resposta..."
                value={authorInstitution}
                onChange={(e) => setAuthorInstitution(e.target.value)}
                className="w-full bg-[#05070A] border border-slate-800 rounded p-2 text-white focus:border-blue-500 outline-none font-mono"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-slate-300 font-semibold mb-1 font-mono text-[11px]">Tópico do Manual a Contribuir</label>
            <select
              value={topicTitle}
              onChange={(e) => setTopicTitle(e.target.value)}
              className="w-full bg-[#05070A] border border-slate-800 rounded p-2 text-white focus:border-blue-500 outline-none font-mono"
            >
              {MANUAL_TOPICS_DRAFT.map((t) => (
                <option key={t.id} value={t.title}>
                  {t.title}
                </option>
              ))}
              <option value="custom" className="text-amber-400 font-bold">
                ✏️ Outro / Tópico Personalizado...
              </option>
            </select>

            {topicTitle === 'custom' && (
              <div className="mt-2 text-xs">
                <label className="block text-amber-400 font-semibold mb-1 font-mono text-[11px]">
                  Título do Tópico Personalizado
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 11. Recuperação com Pára-quedas Direcionável e Telemetria LoRa GPS..."
                  value={customTopicTitle}
                  onChange={(e) => setCustomTopicTitle(e.target.value)}
                  className="w-full bg-[#05070A] border border-amber-500/60 rounded p-2 text-white focus:border-amber-400 outline-none font-mono text-xs shadow-inner"
                />
              </div>
            )}
          </div>

          <div className="text-xs">
            <label className="block text-slate-300 font-semibold mb-1 font-mono text-[11px]">
              Redação da Contribuição Autoral (Texto Técnico / Recomendações)
            </label>
            <textarea
              rows={4}
              required
              placeholder="Escreva detalhadamente sua contribuição com boas práticas, procedimentos recomendados, alertas de segurança e referências técnicas..."
              value={proposedContent}
              onChange={(e) => setProposedContent(e.target.value)}
              className="w-full bg-[#05070A] border border-slate-800 rounded p-2.5 text-white focus:border-blue-500 outline-none leading-relaxed font-mono text-[11px]"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-[10px] text-slate-400 font-mono">
              * Todos que participarem terão seus nomes e equipes incluídos no Manual BAR-AEB.
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded transition shadow"
            >
              <Send className="w-3.5 h-3.5" />
              Submeter Contribuição Autoral
            </button>
          </div>

          {submittedMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Contribuição autoral registrada com sucesso! Ela foi adicionada ao acervo e enviada para a comissão técnica.
            </div>
          )}
        </form>

        {/* Display Submitted Contributions List */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold text-slate-200 uppercase font-mono">Contribuições Registradas na Plataforma</h3>

          <div className="space-y-3">
            {contributions.map((c) => (
              <div
                key={c.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 relative"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{c.authorName}</span>
                      {c.isSpecialAuthor && (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold">
                          Autor(a)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      {c.institution} • {c.email}
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-blue-400 bg-blue-950 px-2 py-1 rounded border border-blue-800">
                    {c.topicTitle}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  "{c.proposedContent}"
                </p>

                <div className="text-[10px] text-slate-500 font-mono flex justify-between pt-1">
                  <span>Data de Submissão: {c.date}</span>
                  <span className="text-emerald-400 font-semibold">Status: Integrado no Rascunho BAR-AEB</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official Schedule Timeline Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xl space-y-6">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            Cronograma do Manual BAR-AEB
          </div>
          <h2 className="text-xl font-bold text-white">Plano de Ação Inicial - Etapas e Prazos</h2>
          <p className="text-xs text-slate-400 mt-1">
            Acompanhe o fluxo temporal completo aprovado pela BAR e AEB até a homologação final em meados de 2027.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MANUAL_TIMELINE.map((step, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 ${
                step.status === 'concluido'
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                  : step.status === 'em_andamento'
                  ? 'bg-blue-950/30 border-blue-500/40 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-400">{step.date}</span>
                  {step.status === 'concluido' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : step.status === 'em_andamento' ? (
                    <Clock className="w-4 h-4 text-blue-400 animate-spin" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <h3 className="font-bold text-xs text-white">{step.title}</h3>
                <p className="text-[11px] text-slate-300 leading-snug">{step.description}</p>
              </div>

              <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                Responsável: <strong className="text-slate-200">{step.responsible}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AEB Normative Rules Summary from PDFs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xl space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Resumo Normativo do Manual AEB de Boas Práticas (2023)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <h3 className="font-bold text-white text-sm text-blue-400">Classificação de Foguetes Amadores</h3>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              <li><strong>Classe 1:</strong> Impulso total menor que 320 Ns. Peso máximo 1500g (max 120g propelente). Partes estruturais obrigatoriamente sem peças metálicas primárias.</li>
              <li><strong>Classe 2:</strong> Impulso total entre 320 Ns e 40.960 Ns.</li>
              <li><strong>Classe 3 / Licença Especial:</strong> Impulso superior a 40.960 Ns exige Licença de Operador de Lançamento formal pela AEB.</li>
            </ul>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <h3 className="font-bold text-white text-sm text-emerald-400">Distâncias e Segurança Operacional</h3>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              <li>Plataforma afastada no mínimo 500m de rodovias públicas e habitações.</li>
              <li>Raio de 5 metros ao redor da rampa completamente livre de vegetação seca ou combustíveis.</li>
              <li>Velocidade do vento máx: 30 km/h | Visibilidade horizontal mínima: 8 km.</li>
              <li>Procedimento em caso de falha de ignição: Aguardar obrigatoriamente 5 minutos com bloqueio removido antes de qualquer aproximação.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
