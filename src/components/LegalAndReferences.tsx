import React from 'react';
import { ShieldCheck, FileText, Lock, Award, BookOpen, ExternalLink, Code } from 'lucide-react';
import { EXTERNAL_LINKS } from '../data/knowledgeData';

export const LegalAndReferences: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Title Header */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-4 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-[10px] uppercase tracking-wider mb-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Marco Legal, Licenciamento & Atribuições
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Legalização, Licença MIT, Privacidade e Atribuições</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Conformidade integral com a legislação brasileira (LGPD - Lei 13.709/2018), normativas internacionais (GDPR) e licenças de software livre.
          </p>
        </div>

        <div className="bg-[#05070A] px-3 py-1.5 rounded border border-slate-800 text-xs font-mono text-slate-300">
          Sistema: <strong className="text-blue-400">FogueteData Aerospace</strong>
        </div>
      </div>

      {/* Developer Credit & Ownership Card */}
      <div className="bg-[#111827] border border-blue-500/30 rounded-lg p-4 shadow-xl space-y-2">
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <div className="text-[10px] font-mono text-blue-300 uppercase">Créditos de Desenvolvimento e Autoria</div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Desenvolvedor: Micael Nildo Oliveira Souza com auxílio de Inteligência Artificial.
            </h3>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          Esta plataforma Web foi idealizada e desenvolvida por <strong>Micael Nildo</strong> com auxílio de agentes de inteligência artificial avançados para promover o avanço tecnológico da pesquisa em foguetemodelismo no Brasil e no exterior.
        </p>
      </div>

      {/* MIT License Section */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-4 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-2 font-mono">
          <Code className="w-4 h-4 text-blue-400" />
          <span>Licença MIT (Massachusetts Institute of Technology)</span>
        </div>

        <pre className="bg-[#05070A] p-3 rounded text-[10px] font-mono text-slate-300 leading-relaxed overflow-x-auto border border-slate-800/80">
{`MIT License

Copyright (c) 2026 Micael Nildo Oliveira Souza

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

================================================================================

Licença MIT

Copyright (c) 2026 Micael Nildo Oliveira Souza

É concedida permissão, gratuitamente, a qualquer pessoa que obtenha uma cópia
deste software e dos arquivos de documentação associados (o "Software"), para
lidar com o Software sem restrições, incluindo, sem limitação, os direitos
de usar, copiar, modificar, mesclar, publicar, distribuir, sublicenciar e/ou vender
cópias do Software, e permitir que as pessoas a quem o Software é
fornecido o façam, sujeito às seguintes condições:

O aviso de copyright acima e este aviso de permissão devem ser incluídos em todas
as cópias ou partes substanciais do Software.

O SOFTWARE É FORNECIDO "COMO ESTÁ", SEM GARANTIA DE QUALQUER TIPO, EXPRESSA OU
IMPLÍCITA, INCLUINDO, MAS NÃO SE LIMITANDO ÀS GARANTIAS DE COMERCIALIZAÇÃO,
ADEQUAÇÃO A UM DETERMINADO FIM E NÃO INFRAÇÃO. EM NENHUM CASO OS
AUTORES OU DETENTORES DE DIREITOS AUTORAIS SERÃO RESPONSÁVEIS POR QUALQUER REIVINDICAÇÃO,
DANOS OU OUTRA RESPONSABILIDADE, SEJA EM AÇÃO DE CONTRATO, ILÍCITO OU DE OUTRA FORMA,
DECORRENTE DE, FORA OU EM CONEXÃO COM O SOFTWARE OU O USO OU OUTRAS NEGOCIAÇÕES NO
SOFTWARE.`}
        </pre>
      </div>

      {/* Referência das Instituições: BAR (Associação sem fins lucrativos) e AEB (Separadas) */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-4 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-2 font-mono">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>Instituições e Entidades Brasileiras de Referência (BAR & AEB)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card BAR */}
          <div className="bg-[#05070A] border border-blue-500/30 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 font-mono">BAR (Associação Brasileira de Minifoguetes)</span>
              <span className="bg-blue-500/10 text-blue-300 border border-blue-500/30 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                Associação sem fins lucrativos
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Entidade civil, científica e educacional <strong>sem fins lucrativos</strong> fundada para organizar, regulamentar e incentivar o desenvolvimento de minifoguetes no Brasil. Promove o Festival Brasileiro de Minifoguetes e estabelece padrões de segurança e normas técnicas nacionais.
            </p>
          </div>

          {/* Card AEB */}
          <div className="bg-[#05070A] border border-purple-500/30 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 font-mono">AEB (Agência Espacial Brasileira)</span>
              <span className="bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                Autarquia Federal (MCTI)
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Órgão central do Sistema Nacional de Desenvolvimento das Atividades Espaciais (SINDAE), responsável por formular, coordenar e executar a Política Espacial Brasileira, emitir diretrizes regulatórias e promover a formação espacial.
            </p>
          </div>
        </div>
      </div>

      {/* Terms of Use and Privacy Policy (LGPD / GDPR) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Termos de Uso */}
        <div className="bg-[#111827] border border-slate-800 rounded-lg p-4 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-white font-bold text-xs border-b border-slate-800 pb-2 font-mono uppercase">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Termos de Uso no Brasil e Exterior</span>
          </div>

          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              1. <strong>Uso Acadêmico e Recreativo:</strong> A plataforma destina-se estritamente ao cálculo educativo, simulação de trajetórias e compartilhamento de conhecimentos de foguetemodelismo não-militar.
            </p>
            <p>
              2. <strong>Responsabilidade das Operações:</strong> O cumprimento das distâncias de segurança, limites de altitude (120m sem NOTAM) e regulamentos de espaço aéreo (DECEA/ANAC) é de inteira responsabilidade dos operadores e chefes de equipe.
            </p>
            <p>
              3. <strong>Registro de Lançamentos:</strong> Lançamentos de minifoguetes experimentais devem ser registrados junto à AEB conforme o procedimento do formulário oficial.
            </p>
          </div>
        </div>

        {/* Política de Privacidade LGPD */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-3">
            <Lock className="w-4 h-4 text-purple-400" />
            <span>Política de Privacidade e LGPD (Lei 13.709/2018)</span>
          </div>

          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              1. <strong>Coleta de Dados Limitada:</strong> Coletamos apenas nome, e-mail e instituição informados voluntariamente para contribuição no Manual BAR-AEB ou criação de perfil.
            </p>
            <p>
              2. <strong>Não Compartilhamento Comercial:</strong> Nossos dados nunca são vendidos a terceiros. As contribuições autorais são compartilhadas com a Comissão Técnica da BAR/AEB para fins de citação no manual.
            </p>
            <p>
              3. <strong>Direitos do Titular:</strong> O usuário tem o direito de solicitar a alteração, exclusão ou exportação de seus dados cadastrados a qualquer momento.
            </p>
          </div>
        </div>
      </div>

      {/* Licensing & Rights Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          Página de Referências, Fontes e Licenciamento de Arquivos
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Recurso / Conteúdo</th>
                <th className="p-3">Autoria / Fonte</th>
                <th className="p-3">Tipo de Licença</th>
                <th className="p-3">Atribuição & Direitos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">Modelos 3D de Foguetes</td>
                <td className="p-3 text-slate-300">Micael Nildo & Comunidade Open Rocketry</td>
                <td className="p-3 text-emerald-400 font-bold">Domínio Público CC0</td>
                <td className="p-3 text-slate-400">Permitido uso comercial sem atribuição obrigatória.</td>
              </tr>

              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">Textos e Ilustrações de Interface</td>
                <td className="p-3 text-slate-300">Micael Nildo / FogueteData</td>
                <td className="p-3 text-blue-400 font-bold">Uso Comercial Livre</td>
                <td className="p-3 text-slate-400">Permitido uso comercial sem necessidade de atribuição.</td>
              </tr>

              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">Regulamento e Normas do Festival de Minifoguetes</td>
                <td className="p-3 text-slate-300">BAR (Associação Brasileira de Minifoguetes)</td>
                <td className="p-3 text-blue-400 font-bold">Associação sem fins lucrativos</td>
                <td className="p-3 text-slate-400">Entidade civil e científica sem fins lucrativos responsável pelas diretrizes técnicas e esportivas do minifoguetismo no Brasil.</td>
              </tr>

              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">Manuais de Boas Práticas e Regulamentação Espacial</td>
                <td className="p-3 text-slate-300">Agência Espacial Brasileira (AEB)</td>
                <td className="p-3 text-purple-400 font-bold">Autarquia Federal (MCTI) / Governo</td>
                <td className="p-3 text-slate-400">Diretrizes oficiais do Governo Federal para segurança espacial, licenças de operação e regulação de lançamentos no Brasil.</td>
              </tr>

              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">Blog FogueteUFPR e Apostilas de Ensino</td>
                <td className="p-3 text-slate-300">Prof. Carlos Henrique Marchi (UFPR)</td>
                <td className="p-3 text-amber-400 font-bold">Direitos Reservados ao Autor</td>
                <td className="p-3 text-slate-400">
                  Referenciado formalmente com todos os direitos autorais mantidos para o Prof. Marchi e UFPR.
                </td>
              </tr>

              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">Documentação de Propulsão Nakka Rocketry</td>
                <td className="p-3 text-slate-300">Richard Nakka</td>
                <td className="p-3 text-indigo-400 font-bold">Direitos Reservados ao Autor</td>
                <td className="p-3 text-slate-400">
                  Referenciado com links para o acervo de pesquisa experimental de Richard Nakka.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
