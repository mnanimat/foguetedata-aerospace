import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Box, 
  Move, 
  Layers, 
  Edit3, 
  Wind, 
  Printer, 
  Rocket, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  CheckCircle2, 
  HelpCircle,
  Eye,
  Sliders,
  RotateCw,
  Maximize2
} from 'lucide-react';
import { ActiveTab } from '../types';

interface InteractiveWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export interface TourStep {
  id: string;
  title: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
  description: string;
  highlights: string[];
  tabTarget?: ActiveTab;
  badge?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao FogueteData Aerospace Studio!',
    subtitle: 'Ecossistema completo de Engenharia Aeroespacial e Minifoguetes',
    icon: Sparkles,
    badge: 'BOAS-VINDAS',
    description: 'Este software integrado permite projetar, simular, modelar em 3D e monitorar a telemetria de minifoguetes experimentais conforme as diretrizes da Associação Brasileira de Minifoguetes (BAR-AEB).',
    highlights: [
      'Simulação de trajetória e física de voo 6-DOF',
      'Estúdio 3D CAD completo com manipulador de peças',
      'Telemetria em tempo real e análise de subsistemas',
      'Gerador de documentação técnica ABNT e exportação para CNC/Impressão 3D'
    ]
  },
  {
    id: '3d_viewport',
    title: '1. Estúdio 3D & Seleção Interativa',
    subtitle: 'Navegação por Órbita e Raycasting 3D',
    icon: Box,
    badge: '3D STUDIO',
    tabTarget: 'community',
    description: 'Clique diretamente em qualquer componente do minifoguete no canvas 3D para inspecioná-lo. O objeto selecionado ficará destacado com efeito luminoso (glow) e abrirá a ficha de especificações técnicas.',
    highlights: [
      'Seleção direta: Ogiva, Aviônica, Paraquedas, Tanques LOX/RP-1, Aletas e Bocal',
      'Navegação do mouse: Arraste com botão esquerdo para orbitar, direito para arrastar e scroll para zoom',
      'Botões de Visão CAD: Alterne rapidamente entre as vistas Topo, Frontal, Lateral e Isométrica'
    ]
  },
  {
    id: 'gizmo_transforms',
    title: '2. Manipulação 3D (Gizmo & Atalhos)',
    subtitle: 'Mover, Rotacionar e Escalar Peças',
    icon: Move,
    badge: 'TRANSFORMAÇÃO',
    tabTarget: 'community',
    description: 'Ajuste livremente o posicionamento das peças usando os manipuladores visuais (Gizmo) ou digitando coordenadas numéricas exatas na barra lateral.',
    highlights: [
      'Atalhos de Teclado: Tecle M para Mover, R para Rotacionar e S para Escalar',
      'Histórico de Edição: Use Ctrl+Z para desfazer e Ctrl+Y para refazer ações',
      'Bloqueio de Peça: Trave componentes para evitar movimentações acidentais'
    ]
  },
  {
    id: 'visual_modes',
    title: '3. Modos Visuais & Visão Explodida',
    subtitle: 'Raio-X, Wireframe e Desmembramento',
    icon: Eye,
    badge: 'INSPEÇÃO',
    tabTarget: 'community',
    description: 'Analise a montagem interna do foguete alternando entre diferentes modos de renderização e descolando os componentes ao longo do eixo longitudinal.',
    highlights: [
      'Modo Raio-X (Transparente): Permite visualizar equipamentos e tanques internos',
      'Modo Wireframe: Exibe a malha estrutural de polígonos e vértices',
      'Slider de Visão Explodida: Desloca até 100% dos módulos para inspeção explodida'
    ]
  },
  {
    id: 'cad_sketch',
    title: '4. Ferramentas CAD 2D/3D (Esboço & Modelagem)',
    subtitle: 'Linhas, Círculos, Extrusão e Revolução 3D',
    icon: Edit3,
    badge: 'DESENHO CAD',
    tabTarget: 'community',
    description: 'Desenhe perfis geométricos na grade 3D e converta-os em componentes sólidos do foguete.',
    highlights: [
      'Ferramentas de Desenho: Linha, Círculo, Retângulo e Arco com snaps magnéticos',
      'Entrada Numérica: Digite comprimento (mm) e ângulo (°) diretamente',
      'Comandos 3D: Use "Extrudar para Sólido" ou "Revolução 3D" para gerar novas peças no estúdio'
    ]
  },
  {
    id: 'cfd_fea',
    title: '5. Estúdio CAD Avançado & Análise CFD/FEA',
    subtitle: 'Simulação Aerodinâmica e Estresse de Materiais',
    icon: Wind,
    badge: 'SIMULAÇÃO',
    tabTarget: 'community',
    description: 'Abra a janela expandida de simulação para analisar o comportamento aerodinâmico em velocidades supersônicas e a resistência mecânica dos materiais.',
    highlights: [
      'Simulação de Fluxo de Ar (CFD): Linhas de corrente, pressão e vetor de velocidade',
      'Análise de Elementos Finitos (FEA): Tensão de Von Mises, deformação e fator de segurança',
      'Seleção de Materiais Aeroespaciais: Alumínio-Lítio 2195, Fibra de Carbono e Inconel 718'
    ]
  },
  {
    id: 'technical_export',
    title: '6. Exportação Técnica, STL e CNC',
    subtitle: 'Impressão 3D e Fabricação de Peças',
    icon: Printer,
    badge: 'FABRICAÇÃO',
    tabTarget: 'community',
    description: 'Gere arquivos prontos para fabricação física dos protótipos e minifoguetes.',
    highlights: [
      'PDF A3 (ABNT): Prancha técnica formatada com vistas ortográficas e carimbo oficial',
      'Modelos .STL & .OBJ: Prontos para fatiadores de impressão 3D (Cura, PrusaSlicer)',
      'G-Code CNC: Código de ferramentas para usinagem computadorizada'
    ]
  },
  {
    id: 'navigation_modules',
    title: '7. Navegação entre Módulos do Sistema',
    subtitle: 'Trajetória, Telemetria e BAR-AEB',
    icon: Rocket,
    badge: 'MÓDULOS',
    description: 'Explore o menu superior para acessar todos os recursos do FogueteData Aerospace:',
    highlights: [
      'Trajetória & Simulação 3D: Apogeu, tempo de queima e estabilidade de voo',
      'Telemetria ao Vivo: Gráficos de dados em tempo real enviados via rádio',
      'Manual BAR-AEB: Regulamento oficial, normas de segurança e licenças'
    ]
  }
];

export const InteractiveWalkthrough: React.FC<InteractiveWalkthroughProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const IconComponent = currentStep.icon;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      const nextStep = TOUR_STEPS[nextIndex];
      if (nextStep.tabTarget && onNavigateTab) {
        onNavigateTab(nextStep.tabTarget);
      }
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      const prevStep = TOUR_STEPS[prevIndex];
      if (prevStep.tabTarget && onNavigateTab) {
        onNavigateTab(prevStep.tabTarget);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Tour Dialog Modal */}
      <div className="bg-[#0b1120] border border-red-500/40 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl text-slate-100 relative overflow-hidden font-sans space-y-5">
        
        {/* Top Decorative Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-blue-600" />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-400 border border-red-800 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {currentStep.badge}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Passo {currentStepIndex + 1} de {TOUR_STEPS.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Fechar Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Step Content */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 shrink-0">
              <IconComponent className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
                {currentStep.title}
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                {currentStep.subtitle}
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
            {currentStep.description}
          </p>

          {/* Key Highlights Checklist */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase text-red-400 tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
              Destaques e Funcionalidades:
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {currentStep.highlights.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-200 bg-slate-900/40 p-2 rounded-lg border border-slate-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-red-600 to-amber-500 h-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="text-xs font-mono text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            Pular Tour
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition transform active:scale-95"
            >
              <span>{isLast ? 'Concluir Tour 🚀' : 'Próximo'}</span>
              {!isLast && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
