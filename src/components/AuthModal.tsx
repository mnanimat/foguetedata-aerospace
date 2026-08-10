import React, { useState } from 'react';
import { User } from '../types';
import { User as UserIcon, X, ShieldCheck, Mail, Lock, Sparkles, Building2, HardDrive, CheckSquare, Square, Trash2, Edit3 } from 'lucide-react';
import { ClearDataModal } from './ClearDataModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [teamName, setTeamName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [roleSelect, setRoleSelect] = useState<string>('Engenheiro');
  const [customRoleInput, setCustomRoleInput] = useState<string>('');
  const [isAgeVerified, setIsAgeVerified] = useState<boolean>(true);
  const [isClearDataOpen, setIsClearDataOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  const finalRole = customRoleInput.trim() !== '' ? customRoleInput : (roleSelect === 'Personalizado' ? 'Fogueteiro Personalizado' : roleSelect);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAgeVerified) {
      alert('Para conformidade legal no Brasil (ECA, LGPD e Diretrizes de Foguetemodelismo AEB), confirme a declaração de idade e autorização.');
      return;
    }

    const user: User = {
      id: 'usr_' + Date.now(),
      name: name || 'Fogueteiro Colaborador',
      email: email || 'fogueteiro@foguetedata.org',
      teamName: teamName || 'Equipe',
      organizationName: organizationName || 'Independente / Institucional',
      role: finalRole,
      customRole: customRoleInput.trim() !== '' ? customRoleInput : undefined,
      isAgeVerified: true
    };
    onLogin(user);
    onClose();
  };

  const handleVisitor = () => {
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl relative font-sans text-slate-100 max-h-[90vh] overflow-y-auto no-scrollbar">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-red-400 font-mono text-[10px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Acesso ao Ecossistema FogueteData
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {isRegister ? 'Criar Conta de Fogueteiro' : 'Acessar Conta de Usuário'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Faça login para cadastrar modelos 3D, submeter contribuições autorais e gerenciar sua equipe.
            </p>
          </div>

          {/* Local Operation Banner Notice */}
          <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-start gap-2.5 text-[11px] text-emerald-200 font-mono">
            <HardDrive className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-300 block">⚡ Execução 100% Local no Navegador:</span>
              <span>A plataforma opera integralmente em ambiente local (LocalStorage / WebGL). Seus dados, modelos 3D e arquivos permanecem armazenados de forma privada no seu próprio computador.</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {isRegister && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1 font-mono text-[11px]">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Digite o nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#05070A] border border-slate-800 rounded-lg p-2.5 text-white focus:border-red-500 outline-none font-mono text-xs"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1 font-mono text-[11px]">E-mail de Contato</label>
              <input
                type="email"
                required
                placeholder="Digite o e-mail de contato"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#05070A] border border-slate-800 rounded-lg p-2.5 text-white focus:border-red-500 outline-none font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 font-mono text-[11px]">Senha Acesso Local</label>
              <input
                type="password"
                required
                placeholder="Digite a senha"
                defaultValue="123456"
                className="w-full bg-[#05070A] border border-slate-800 rounded-lg p-2.5 text-white focus:border-red-500 outline-none font-mono text-xs"
              />
            </div>

            {/* Optional Organization Field */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 font-mono text-[11px] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-red-400" />
                  Nome da Organização / Instituição / Empresa
                </span>
                <span className="text-[10px] text-slate-500 font-normal">(Opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Ex: MNAnimat AeroSpace, AEB, Escola Técnica, Autônomo"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="w-full bg-[#05070A] border border-slate-800 rounded-lg p-2.5 text-white focus:border-red-500 outline-none font-mono text-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-slate-300 font-semibold font-mono text-[11px]">
                Nome da Equipe & Função / Cargo
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Digite o nome da equipe"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-[#05070A] border border-slate-800 rounded-lg p-2.5 text-white focus:border-red-500 outline-none font-mono text-xs"
                />

                {/* Role / Function Selector */}
                <select
                  value={roleSelect}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRoleSelect(val);
                    if (val !== 'Personalizado') {
                      setCustomRoleInput(val);
                    }
                  }}
                  className="w-full bg-[#05070A] border border-slate-800 rounded-lg p-2.5 text-white focus:border-red-500 outline-none font-mono text-xs"
                >
                  <option value="Engenheiro">Engenheiro</option>
                  <option value="Capitão">Capitão / Líder</option>
                  <option value="RSO - Segurança">RSO - Segurança</option>
                  <option value="Pesquisador">Pesquisador</option>
                  <option value="Estudante">Estudante</option>
                  <option value="Gerente de Projetos">Gerente de Projetos</option>
                  <option value="Projetista CAD">Projetista CAD</option>
                  <option value="Personalizado">✏️ Personalizado (Digitar)...</option>
                </select>
              </div>

              {/* Direct Custom Role Writing Input */}
              <div className="space-y-1">
                <label className="block text-slate-400 text-[10px] font-mono flex items-center justify-between">
                  <span className="flex items-center gap-1 text-red-400">
                    <Edit3 className="w-3 h-3" />
                    Escrever Função/Cargo Personalizado:
                  </span>
                  <span className="text-slate-500 text-[9px]">(Substitui a seleção se preenchido)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ex: Diretor Técnico / Projetista de Turbinas / Piloto R/C"
                    value={customRoleInput}
                    onChange={(e) => {
                      setCustomRoleInput(e.target.value);
                      if (roleSelect !== 'Personalizado') setRoleSelect('Personalizado');
                    }}
                    className="w-full bg-[#05070A] border border-slate-800 focus:border-red-500 rounded-lg p-2 text-white outline-none font-mono text-xs pl-7"
                  />
                  <UserIcon className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2.5" />
                </div>
              </div>
            </div>

            {/* Brazilian Age & Legal Compliance Verification Checkbox */}
            <div 
              onClick={() => setIsAgeVerified(!isAgeVerified)}
              className="p-3 bg-[#05070A] border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer flex items-start gap-2.5 transition text-xs select-none"
            >
              <div className="mt-0.5 text-red-500">
                {isAgeVerified ? (
                  <CheckSquare className="w-4 h-4 text-red-500" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <div className="space-y-0.5 text-[11px]">
                <span className="font-bold text-slate-200 block">
                  Verificação de Idade & Legalização (Brasil / AEB / LGPD):
                </span>
                <p className="text-slate-400 leading-relaxed">
                  Declaro ter 18 anos ou mais (ou autorização de responsável legal / supervisão acadêmica para uso de simuladores aeroespaciais conforme diretrizes da AEB e LGPD).
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-600/30 transition text-xs font-mono uppercase tracking-wider"
            >
              {isRegister ? 'Concluir Cadastro Local' : 'Entrar na Plataforma Local'}
            </button>
            <button
              type="button"
              onClick={handleVisitor}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl shadow-lg transition text-xs font-mono uppercase tracking-wider mt-2"
            >
              Acessar como Visitante
            </button>
          </form>

          {/* Option to Clear Data and Register Organization from Scratch */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={() => setIsClearDataOpen(true)}
              className="w-full p-2.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 hover:border-red-500 text-red-300 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-2 group"
            >
              <Trash2 className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
              <span>🧹 Limpar Dados & Zerar Organização</span>
            </button>
            <p className="text-[10px] text-slate-500 text-center font-mono">
              Apague tarefas, membros ou modelos para registrar dados da sua organização do zero.
            </p>
          </div>

          <div className="text-center pt-2 border-t border-slate-800">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-red-400 hover:underline font-mono"
            >
              {isRegister
                ? 'Já possui uma conta? Faça login aqui'
                : 'Não tem conta? Cadastre-se gratuitamente'}
            </button>
          </div>
        </div>
      </div>

      {/* Clear Data Selection Modal */}
      <ClearDataModal
        isOpen={isClearDataOpen}
        onClose={() => setIsClearDataOpen(false)}
      />
    </>
  );
};

