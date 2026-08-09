import React from 'react';
import { 
  Rocket, 
  Activity, 
  Cpu, 
  BookOpen, 
  Users, 
  Box, 
  Globe, 
  FolderDown,
  ShieldCheck, 
  ExternalLink, 
  User as UserIcon,
  LogOut,
  Sparkles,
  Layers,
  Sun,
  Moon
} from 'lucide-react';
import { ActiveTab, User } from '../types';
import { EXTERNAL_LINKS } from '../data/knowledgeData';
import { useTheme } from '../context/ThemeContext';
import { FallingRocketryRain } from './FallingRocketryRain';
import { RocketAudioPlayer } from './RocketAudioPlayer';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuthModal,
  onLogout
}) => {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'trajectory', label: 'Trajetória & Simulação 3D', icon: Rocket },
    { id: 'telemetry', label: 'Telemetria ao Vivo', icon: Activity },
    { id: 'subsystems', label: 'Partes & Eletrônica', icon: Cpu },
    { id: 'manual_bar_aeb', label: 'Manual BAR-AEB', icon: BookOpen, badge: 'COLABORATIVO' },
    { id: 'team', label: 'Gestão de Equipe', icon: Users },
    { id: 'community', label: 'Estúdio 3D Interativo', icon: Box },
    { id: 'cad_repository', label: 'Modelos CAD & Diagramas', icon: FolderDown, badge: 'LICENÇAS' },
    { id: 'legal', label: 'Termos & Licença MIT', icon: ShieldCheck }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#05070A] dark:bg-[#05070A] light:bg-white border-b border-slate-800 dark:border-slate-800 light:border-slate-200 text-slate-100 dark:text-white light:text-slate-900 shadow-xl transition-colors">
      {/* Top Banner - Direct Links to MNAnimat Services */}
      <div className="bg-[#0B0F19] dark:bg-[#0B0F19] light:bg-slate-100 px-4 py-1 text-[11px] border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-400 light:text-slate-600 font-mono">
          <span className="inline-flex items-center gap-1 font-semibold text-blue-400 dark:text-blue-400 light:text-blue-700 bg-blue-900/30 dark:bg-blue-900/30 light:bg-blue-100 px-2 py-0.5 rounded text-[10px] border border-blue-800/50 light:border-blue-300">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Ecossistema Aerospace
          </span>
          <span className="hidden sm:inline">Modelagem 3D, Animação e Simulação Aeroespacial:</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={EXTERNAL_LINKS.mnanimat3d}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white transition font-mono bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-200 px-2.5 py-0.5 rounded border border-slate-700 dark:border-slate-700 light:border-slate-300"
          >
            <Layers className="w-3 h-3 text-cyan-400 dark:text-cyan-400 light:text-cyan-600" />
            MNAnimat3D
            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
          </a>

          <a
            href={EXTERNAL_LINKS.cadMnanimat}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-mono transition bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-0.5 rounded font-bold shadow"
          >
            <Box className="w-3 h-3 text-white" />
            cad.mnanimat.xyz
            <ExternalLink className="w-2.5 h-2.5 text-white/80" />
          </a>
        </div>
      </div>

      {/* Main High Density Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-12 gap-4">
          
          {/* Logo & System Name */}
          <div 
            onClick={() => setActiveTab('trajectory')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-base shadow-md shadow-red-600/30 group-hover:scale-105 transition-transform">
              F
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 dark:text-white light:text-slate-900 tracking-tight flex items-center gap-1.5">
                <span className="text-red-600 dark:text-red-500">FogueteData</span> Aerospace
                <span className="text-[10px] bg-red-950/40 dark:bg-red-950/40 light:bg-red-100 text-red-400 dark:text-red-400 light:text-red-700 px-1.5 py-0.5 rounded border border-red-800/50 light:border-red-300 font-mono">
                  BETA 1.0
                </span>
              </h1>
            </div>
          </div>

          {/* Header Middle Controls (Chuva Aeroespacial & Player de Música) */}
          <div className="flex items-center gap-2 font-mono">
            <FallingRocketryRain embedded />
            <RocketAudioPlayer embedded />
          </div>

          {/* Theme Switcher & User Status */}
          <div className="flex items-center gap-2.5">
            {/* Light/Dark Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md transition border border-slate-700 dark:border-slate-700 light:border-slate-300 bg-[#111827] dark:bg-[#111827] light:bg-slate-100 text-slate-200 dark:text-slate-200 light:text-slate-800 hover:border-red-500 hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-sm text-xs font-mono"
              title={theme === 'dark' ? 'Alternar para Tom Claro (Vermelho & Branco)' : 'Alternar para Tom Escuro (Red Aerospace)'}
              aria-label="Alternar tom claro/escuro"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="hidden sm:inline text-[11px] text-amber-300 font-sans">Tom Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-red-600" />
                  <span className="hidden sm:inline text-[11px] text-red-600 font-sans font-semibold">Tom Escuro</span>
                </>
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2 bg-[#111827] dark:bg-[#111827] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 px-2.5 py-1 rounded-md text-xs font-mono">
                <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-[10px] text-white">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <div className="font-semibold text-[11px] text-slate-200 dark:text-slate-200 light:text-slate-800">{currentUser.name}</div>
                  <div className="text-[9px] text-blue-400 uppercase">{currentUser.role}</div>
                </div>
                <button
                  onClick={onLogout}
                  title="Sair da conta"
                  className="ml-1 p-1 hover:text-red-400 text-slate-400 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded font-bold text-[11px] transition shadow"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Entrar / Cadastrar
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex space-x-1 overflow-x-auto pb-1.5 pt-1 no-scrollbar border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-800 dark:bg-slate-800 light:bg-blue-600 text-blue-400 dark:text-blue-400 light:text-white font-bold border border-slate-700 dark:border-slate-700 light:border-blue-600 shadow-sm'
                    : 'text-slate-400 dark:text-slate-400 light:text-slate-700 hover:text-slate-200 dark:hover:text-slate-200 light:hover:text-slate-900 hover:bg-slate-800/40 dark:hover:bg-slate-800/40 light:hover:bg-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? (theme === 'light' ? 'text-white' : 'text-blue-400') : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] px-1 rounded bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-800 font-mono border border-slate-700 dark:border-slate-700 light:border-slate-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
