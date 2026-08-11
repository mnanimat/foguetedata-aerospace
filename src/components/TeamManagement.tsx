import React, { useState, useRef } from 'react';
import { 
  PlannerTask, PlannerChecklistItem, Department, Invoice, TeamResourceLink,
  TeamMember, CustomDashboardWidget
} from '../types';
import type { User } from '../types';
import { ClearDataModal } from './ClearDataModal';
import { 
  Users, User as UserIcon, CheckSquare, Calendar, Link as LinkIcon, Plus, Youtube, FileSpreadsheet, 
  ExternalLink, Trash2, Edit3, DollarSign, Truck, Rocket, Flame, Cpu, Shield, 
  Clock, ChevronLeft, ChevronRight, FileText, CheckCircle2, AlertCircle, Tag, 
  Filter, Search, Paperclip, Download, PieChart as PieChartIcon, Layers, Settings, X, ArrowLeftRight,
  Move, ChevronDown, Check, FolderPlus, Upload, UserPlus, Table, BarChart2,
  TrendingUp, Sparkles, FileDown, ArrowUp, ArrowDown, Activity, Sliders, Layout, GripVertical
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  Line 
} from 'recharts';

interface TeamManagementProps {
  currentUser: User | null;
  onOpenAuthModal: () => void;
}

// Initial Default Departments for Rocketry Team
const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dep_prop',
    name: 'Propulsão & Motor',
    code: 'PROP',
    color: '#ef4444', // Red
    leader: 'Micael Nildo',
    budgetAllocated: 12500,
    description: 'Desenvolvimento do motor de propelente sólido/híbrido, grãos, câmara e bocal De Laval.'
  },
  {
    id: 'dep_aero',
    name: 'Aerodinâmica & Estruturas',
    code: 'AERO',
    color: '#3b82f6', // Blue
    leader: 'Nome 1',
    budgetAllocated: 8900,
    description: 'Dimensionamento da coifa, fuselagem em fibra de vidro/carbono, aletas e simulações CFD.'
  },
  {
    id: 'dep_avio',
    name: 'Aviônica & Eletrônica',
    code: 'AVIO',
    color: '#8b5cf6', // Purple
    leader: 'Nome 2',
    budgetAllocated: 6400,
    description: 'Computador de voo dual-event, altímetros barométricos, telemetria LoRa e GPS.'
  },
  {
    id: 'dep_rec',
    name: 'Sistemas de Recuperação',
    code: 'REC',
    color: '#10b981', // Emerald
    leader: 'Nome 3',
    budgetAllocated: 4200,
    description: 'Paraquedas drogue e principal, cargas ejetoras pirotécnicas e dobras de resgate.'
  },
  {
    id: 'dep_test',
    name: 'Testes Estáticos & Lançamento',
    code: 'TEST',
    color: '#f59e0b', // Amber
    leader: 'Nome 4',
    budgetAllocated: 3800,
    description: 'Bancos de ensaio de empuxo, instrumentação de solo, rampa de lançamento e ignitores.'
  },
  {
    id: 'dep_fin',
    name: 'Financeiro & Gestão',
    code: 'FIN',
    color: '#ec4899', // Pink
    leader: 'Nome 5',
    budgetAllocated: 25000,
    description: 'Gestão de orçamentos, patrocínios universitários, prestação de contas e reembolsos.'
  },
  {
    id: 'dep_log',
    name: 'Logística & Suprimentos',
    code: 'LOG',
    color: '#06b6d4', // Cyan
    leader: 'Nome 6',
    budgetAllocated: 5100,
    description: 'Compra de reativos químicas (KNO3/Sorbitol), transporte de campo, EPIs e ferramentas.'
  },
  {
    id: 'dep_rso',
    name: 'Segurança & RSO',
    code: 'RSO',
    color: '#f97316', // Orange
    leader: 'Nome 7',
    budgetAllocated: 2000,
    description: 'Range Safety Officer, isolamento de área de teste, extintores e manuais da AEB/COBAP.'
  }
];

// Initial Tasks with Checklist & Dates
const INITIAL_PLANNER_TASKS: PlannerTask[] = [
  {
    id: 'task_1',
    title: 'Usinagem em Torno CNC do Bocal De Laval em Grafite',
    description: 'Usinar a garganta do bocal com raio de divergência de 15° conforme cálculo teórico.',
    departmentId: 'dep_prop',
    assignee: 'Micael Nildo',
    startDate: '2026-08-10',
    startTime: '08:00',
    endDate: '2026-08-15',
    endTime: '17:00',
    status: 'Em Progresso',
    priority: 'Crítica',
    color: '#ef4444',
    tags: ['Oficina', 'CNC', 'Usinagem'],
    checklist: [
      { id: 'c1', text: 'Comprar bloco de grafite isostático', done: true },
      { id: 'c2', text: 'Gerar código G no Fusion 360', done: true },
      { id: 'c3', text: 'Usinar no torno da universidade', done: false },
      { id: 'c4', text: 'Inspecionar rugosidade com micrômetro', done: false }
    ]
  },
  {
    id: 'task_2',
    title: 'Integração do Sensor Barométrico BMP280 e LoRa SX1276',
    description: 'Soldagem da PCB da aviônica principal e teste de telemetria a 1 km em solo.',
    departmentId: 'dep_avio',
    assignee: 'Pedro Ramos',
    startDate: '2026-08-12',
    startTime: '09:00',
    endDate: '2026-08-18',
    endTime: '18:00',
    status: 'A Fazer',
    priority: 'Alta',
    color: '#8b5cf6',
    tags: ['Eletrônica', 'LoRa', 'PCB'],
    checklist: [
      { id: 'c5', text: 'Gravar firmware na ESP32 S3', done: true },
      { id: 'c6', text: 'Montar antena dipolo de 915 MHz', done: false },
      { id: 'c7', text: 'Teste de alcance em campo aberto', done: false }
    ]
  },
  {
    id: 'task_3',
    title: 'Teste de Costura e Resposta Dinâmica do Paraquedas Drogue',
    description: 'Ensaio com soprador industrial para verificar área efetiva do tecido Ripstop nylon.',
    departmentId: 'dep_rec',
    assignee: 'Amanda Silva',
    startDate: '2026-08-14',
    startTime: '13:00',
    endDate: '2026-08-20',
    endTime: '17:00',
    status: 'Em Teste',
    priority: 'Alta',
    color: '#10b981',
    tags: ['Costura', 'Ripstop', 'Paraquedas'],
    checklist: [
      { id: 'c8', text: 'Cortar gomos de tecido nylon 70D', done: true },
      { id: 'c9', text: 'Fixar cordames de Kevlar 200lb', done: true },
      { id: 'c10', text: 'Verificar rigidez dos tirantes', done: true }
    ]
  },
  {
    id: 'task_4',
    title: 'Simulação de Escoamento Transônico CFD na Coifa',
    description: 'Rodar simulação de arraste no Ansys Fluent para perfil de ogiva Von Kármán.',
    departmentId: 'dep_aero',
    assignee: 'Eng. Lucas Ferraz',
    startDate: '2026-08-08',
    startTime: '08:30',
    endDate: '2026-08-13',
    endTime: '12:30',
    status: 'Concluído',
    priority: 'Média',
    color: '#3b82f6',
    tags: ['CFD', 'Ansys', 'Ogiva'],
    checklist: [
      { id: 'c11', text: 'Malha não-estruturada com prismas no boundary layer', done: true },
      { id: 'c12', text: 'Calcular coeficiente de arraste Cd(Mach 1.2)', done: true }
    ]
  },
  {
    id: 'task_5',
    title: 'Aquisição de Nitrato de Potássio e Sacarose Purificados',
    description: 'Emitir nota fiscal e transportar insumos sob autorização do Exército / RSO.',
    departmentId: 'dep_log',
    assignee: 'Gabriel Santos',
    startDate: '2026-08-09',
    startTime: '08:00',
    endDate: '2026-08-11',
    endTime: '15:00',
    status: 'Concluído',
    priority: 'Crítica',
    color: '#06b6d4',
    tags: ['Insumos', 'Reativos', 'Frete'],
    checklist: [
      { id: 'c13', text: 'Cotar com distribuidor analítico', done: true },
      { id: 'c14', text: 'Receber NF-e e arquivar', done: true }
    ]
  }
];

// Initial Team Members
const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'mem_1',
    name: 'Micael Nildo',
    email: 'micaelnildo@mnanimat.xyz',
    role: 'Desenvolvedor Sênior de Propulsão & Pesquisador Principal',
    departmentId: 'dep_prop',
    subsystemRole: 'Dimensionamento de Motores e Bocal De Laval',
    accessLevel: 'Líder de Área',
    status: 'Ativo',
    phone: '+55 41 99881-2233',
    joinedDate: '2024-02-15'
  },
  {
    id: 'mem_2',
    name: 'Nome 1',
    email: 'minifoguetes@gmail.com',
    role: 'Líder de Aerodinâmica',
    departmentId: 'dep_aero',
    subsystemRole: 'Análise CFD & Estruturas de Vidro/Carbono',
    accessLevel: 'Líder de Área',
    status: 'Ativo',
    phone: '+55 41 98877-1122',
    joinedDate: '2024-03-01'
  },
  {
    id: 'mem_3',
    name: 'Nome 2',
    email: 'minifoguetes@gmail.com',
    role: 'Especialista em Aviônica & LoRa',
    departmentId: 'dep_avio',
    subsystemRole: 'Computador de Voo Dual-Event & Telemetria',
    accessLevel: 'Engenheiro Sênior',
    status: 'Ativo',
    phone: '+55 21 97766-5544',
    joinedDate: '2024-05-10'
  },
  {
    id: 'mem_4',
    name: 'Nome 3',
    email: 'minifoguetes@gmail.com',
    role: 'Desenvolvedora de Sistemas de Recuperação',
    departmentId: 'dep_rec',
    subsystemRole: 'Costura Ripstop & Cargas Pirotécnicas',
    accessLevel: 'Líder de Área',
    status: 'Ativo',
    phone: '+55 41 99112-4455',
    joinedDate: '2024-06-01'
  },
  {
    id: 'mem_5',
    name: 'Nome 4',
    email: 'minifoguetes@gmail.com',
    role: 'Gestor de Suprimentos & Reativos',
    departmentId: 'dep_log',
    subsystemRole: 'Aquisição de KNO3/Sorbitol & Transporte',
    accessLevel: 'Engenheiro Sênior',
    status: 'Ativo',
    phone: '+55 41 99655-3322',
    joinedDate: '2024-07-12'
  }
];

// Initial Tax Invoices
const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'nf_101',
    number: 'NF-004892',
    supplier: 'AeroMetals & Grafite Brasil Ltda',
    cnpjCpf: '24.912.834/0001-09',
    issueDate: '2026-08-02',
    dueDate: '2026-08-16',
    amount: 1450.00,
    departmentId: 'dep_prop',
    description: 'Bloco de grafite isostático de alta densidade (100x150mm) para garganta do bocal.',
    status: 'Pago',
    attachmentName: 'NF_004892_Grafite_Isostatico.pdf',
    attachmentUrl: 'https://drive.google.com'
  },
  {
    id: 'nf_102',
    number: 'NF-089120',
    supplier: 'Eletrônica Robótica & Sensores S.A.',
    cnpjCpf: '11.029.348/0001-52',
    issueDate: '2026-08-05',
    dueDate: '2026-08-20',
    amount: 890.50,
    departmentId: 'dep_avio',
    description: '02 Módulos ESP32-S3, 03 Módulos LoRa SX1276 915MHz e 05 Sensores BMP280.',
    status: 'Pago',
    attachmentName: 'NF_089120_Componentes_Avionica.pdf',
    attachmentUrl: 'https://drive.google.com'
  },
  {
    id: 'nf_103',
    number: 'NF-001243',
    supplier: 'Tecidos Técnicos Ripstop & Kevlar Ltda',
    cnpjCpf: '08.384.192/0001-88',
    issueDate: '2026-08-07',
    dueDate: '2026-08-25',
    amount: 620.00,
    departmentId: 'dep_rec',
    description: '10m Nylon Ripstop Parachute 70D + 50m Fita de Kevlar 200lb para linhas de suspensão.',
    status: 'Pendente',
    attachmentName: 'NF_001243_Ripstop_Kevlar.pdf',
    attachmentUrl: 'https://drive.google.com'
  },
  {
    id: 'nf_104',
    number: 'NF-000571',
    supplier: 'Química Industrial Bandeirantes',
    cnpjCpf: '45.102.993/0001-33',
    issueDate: '2026-08-08',
    dueDate: '2026-08-22',
    amount: 1120.00,
    departmentId: 'dep_log',
    description: '25kg Nitrato de Potássio PA 99.5% + 10kg Sorbitol Anidro para matriz propulsiva.',
    status: 'Pago',
    attachmentName: 'NF_000571_Insumos_KNO3.pdf',
    attachmentUrl: 'https://drive.google.com'
  }
];

const INITIAL_DASHBOARD_WIDGETS: CustomDashboardWidget[] = [
  {
    id: 'w1',
    title: 'Distribuição de Orçamento por Área (R$)',
    type: 'chart_budget',
    chartType: 'bar'
  },
  {
    id: 'w2',
    title: 'Status Geral das Tarefas do Foguete',
    type: 'chart_tasks',
    chartType: 'pie'
  },
  {
    id: 'w3',
    title: 'Investimento Total Aprovado',
    type: 'metric_kpi',
    value: 'R$ 69.400,00',
    notes: 'Verba somada de todas as 8 áreas técnicas e patrocínios.'
  },
  {
    id: 'w4',
    title: 'Membros Ativos no Projeto',
    type: 'metric_kpi',
    value: '24 Integrantes',
    notes: '5 Líderes de área, 12 Alunos e 7 Pesquisadores.'
  }
];

const INITIAL_RESOURCES: TeamResourceLink[] = [
  {
    id: 'r1',
    title: 'Gravação do Teste Estático de Propulsor KNDX (1200N)',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    type: 'YouTube',
    addedBy: 'Micael Nildo',
    category: 'Vídeo de Teste Estático'
  },
  {
    id: 'r2',
    title: 'Caderno de Cálculos da Estabilidade Aerodinâmica (CP x CG)',
    url: 'https://drive.google.com/drive/folders/1-p2vv-CPYN58ABkRV371PNZVm7HUmpuQ?usp=sharing',
    type: 'Google Drive',
    addedBy: 'MNAnimat AeroSpace',
    category: 'Relatório de Cálculo'
  }
];

interface TeamProgressChartsProps {
  tasks: PlannerTask[];
  departments: Department[];
}

export const TeamProgressCharts: React.FC<TeamProgressChartsProps> = ({ tasks, departments }) => {
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('ALL');

  // Filter tasks if requested
  const filteredTasks = tasks.filter((t) => {
    const matchesDept = selectedDeptFilter === 'ALL' || t.departmentId === selectedDeptFilter;
    const matchesPriority = selectedPriorityFilter === 'ALL' || t.priority === selectedPriorityFilter;
    return matchesDept && matchesPriority;
  });

  // 1. Data per Department (Concluído, Em Teste, Em Progresso, A Fazer)
  const deptProgressData = departments.map((dept) => {
    const deptTasks = filteredTasks.filter((t) => t.departmentId === dept.id);
    const completed = deptTasks.filter((t) => t.status === 'Concluído').length;
    const inTesting = deptTasks.filter((t) => t.status === 'Em Teste').length;
    const inProgress = deptTasks.filter((t) => t.status === 'Em Progresso').length;
    const todo = deptTasks.filter((t) => t.status === 'A Fazer').length;
    const total = deptTasks.length;

    let pctSum = 0;
    deptTasks.forEach((t) => {
      if (t.status === 'Concluído') pctSum += 100;
      else if (t.status === 'Em Teste') pctSum += 75;
      else if (t.status === 'Em Progresso') pctSum += 50;
      else if (t.checklist && t.checklist.length > 0) {
        const doneItems = t.checklist.filter((c) => c.done).length;
        pctSum += Math.round((doneItems / t.checklist.length) * 100);
      }
    });
    const avgProgress = total > 0 ? Math.round(pctSum / total) : 0;

    return {
      id: dept.id,
      name: dept.name,
      code: dept.code,
      color: dept.color,
      'Concluído': completed,
      'Em Teste': inTesting,
      'Em Progresso': inProgress,
      'A Fazer': todo,
      'Progresso Médio (%)': avgProgress,
      total
    };
  });

  // 2. Critical Milestones Tasks (% completion based on status and checklist)
  const criticalMilestones = filteredTasks
    .filter((t) => t.priority === 'Crítica' || t.priority === 'Alta')
    .map((t) => {
      const dept = departments.find((d) => d.id === t.departmentId);
      let pct = 0;
      if (t.status === 'Concluído') pct = 100;
      else if (t.status === 'Em Teste') pct = 75;
      else if (t.status === 'Em Progresso') pct = 50;

      if (t.checklist && t.checklist.length > 0) {
        const doneCount = t.checklist.filter((c) => c.done).length;
        const checkPct = Math.round((doneCount / t.checklist.length) * 100);
        if (t.status !== 'Concluído') pct = Math.max(pct, checkPct);
      }

      return {
        id: t.id,
        shortTitle: t.title.length > 32 ? t.title.slice(0, 30) + '...' : t.title,
        fullTitle: t.title,
        department: dept ? dept.code : 'GERAL',
        deptColor: dept?.color || '#ef4444',
        assignee: t.assignee,
        status: t.status,
        priority: t.priority,
        progresso: pct,
        endDate: t.endDate
      };
    })
    .sort((a, b) => (a.priority === 'Crítica' ? -1 : 1));

  // 3. Status Breakdown Pie Chart Data
  const statusPieData = [
    { name: 'Concluído', value: filteredTasks.filter((t) => t.status === 'Concluído').length, color: '#10b981' },
    { name: 'Em Teste', value: filteredTasks.filter((t) => t.status === 'Em Teste').length, color: '#06b6d4' },
    { name: 'Em Progresso', value: filteredTasks.filter((t) => t.status === 'Em Progresso').length, color: '#f59e0b' },
    { name: 'A Fazer', value: filteredTasks.filter((t) => t.status === 'A Fazer').length, color: '#ef4444' }
  ].filter((d) => d.value > 0);

  // Overall Completion %
  const totalTasks = filteredTasks.length;
  const completedTasksCount = filteredTasks.filter((t) => t.status === 'Concluído').length;
  const overallPct = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  // 4. Time Progress Cumulative Data
  const datesSorted = Array.from(new Set(filteredTasks.map((t) => t.endDate))).sort();
  const timelineData = datesSorted.map((dStr) => {
    const tasksUntil = filteredTasks.filter((t) => t.endDate <= dStr);
    const doneUntil = tasksUntil.filter((t) => t.status === 'Concluído').length;
    const criticalDoneUntil = tasksUntil.filter((t) => (t.priority === 'Crítica' || t.priority === 'Alta') && t.status === 'Concluído').length;
    return {
      date: new Date(dStr + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      'Tarefas Concluídas': doneUntil,
      'Marcos Críticos Concluídos': criticalDoneUntil,
      'Total Planejado': tasksUntil.length
    };
  });

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Controls Bar for Filtering Charts */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Gráficos de Progresso & Marcos Críticos
              <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] px-2 py-0.5 rounded font-mono">
                Recharts Engine
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">Acompanhamento visual da conclusão das metas e entregas críticas da equipe aeroespacial.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 font-mono"
          >
            <option value="ALL">Todas as Áreas ({departments.length})</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 font-mono"
          >
            <option value="ALL">Todas as Prioridades</option>
            <option value="Crítica">🚨 Somente Marcos Críticos</option>
            <option value="Alta">⚡ Alta Prioridade</option>
            <option value="Média">🔹 Prioridade Média</option>
            <option value="Baixa">🔹 Prioridade Baixa</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Taxa de Conclusão Global</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{overallPct}%</div>
          <div className="text-[10px] text-slate-500 font-mono">{completedTasksCount} de {totalTasks} atividades entregues</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Marcos Críticos Prontos</div>
          <div className="text-2xl font-black text-red-400 font-mono">
            {criticalMilestones.filter((m) => m.status === 'Concluído').length} / {criticalMilestones.length}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Entregáveis de Alta / Crítica prioridade</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Atividades em Execução</div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {filteredTasks.filter((t) => t.status === 'Em Progresso' || t.status === 'Em Teste').length}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Em desenvolvimento ou teste de campo</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Atividades Fila de Espera</div>
          <div className="text-2xl font-black text-slate-300 font-mono">
            {filteredTasks.filter((t) => t.status === 'A Fazer').length}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Status "A Fazer" pendentes</div>
        </div>
      </div>

      {/* Main Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 1: Task Completion per Subsystem / Area (Stacked BarChart) */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-900 pb-3">
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                Conclusão de Tarefas por Subsistema (Empilhado)
              </h4>
              <p className="text-[11px] text-slate-400">Distribuição de Concluído, Em Teste, Em Progresso e A Fazer</p>
            </div>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono">
              Empilhado
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="code" stroke="#64748b" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#cbd5e1', fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b0f17', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Concluído" stackId="a" fill="#10b981" />
                <Bar dataKey="Em Teste" stackId="a" fill="#06b6d4" />
                <Bar dataKey="Em Progresso" stackId="a" fill="#f59e0b" />
                <Bar dataKey="A Fazer" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status Breakdown Donut PieChart */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-900 pb-3">
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-cyan-400" />
                Proporção do Status Geral do Projeto
              </h4>
              <p className="text-[11px] text-slate-400">Volume percentual por estado das entregas técnicas</p>
            </div>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono">
              Rosca
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b0f17', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </RechartsPieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
              <span className="text-2xl font-black text-white font-mono">{overallPct}%</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Concluído</span>
            </div>
          </div>
        </div>

        {/* Chart 3: Critical Milestones Horizontal BarChart */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3 lg:col-span-2 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-900 pb-3">
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-500" />
                Barra de Progresso dos Marcos Críticos e Entregáveis Altas (%)
              </h4>
              <p className="text-[11px] text-slate-400">Porcentagem individual de avanço nas tarefas mais críticas do foguete</p>
            </div>
            <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded font-mono">
              {criticalMilestones.length} Marcos Listados
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={criticalMilestones}
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" tick={{ fill: '#cbd5e1', fontSize: 11 }} unit="%" />
                <YAxis dataKey="shortTitle" type="category" stroke="#64748b" tick={{ fill: '#e2e8f0', fontSize: 11 }} width={180} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b0f17', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  formatter={(value: any, name: any, item: any) => [
                    `${value}% (${item.payload.status}) - Resp: ${item.payload.assignee}`,
                    'Progresso'
                  ]}
                />
                <Bar dataKey="progresso" radius={[0, 8, 8, 0]}>
                  {criticalMilestones.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.progresso === 100
                          ? '#10b981'
                          : entry.progresso >= 50
                          ? '#f59e0b'
                          : entry.priority === 'Crítica'
                          ? '#ef4444'
                          : '#3b82f6'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Timeline Progress AreaChart */}
        {timelineData.length > 0 && (
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3 lg:col-span-2 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  Evolução Temporal e Conclusão de Marcos
                </h4>
                <p className="text-[11px] text-slate-400">Linha de acúmulo de atividades e marcos finalizados ao longo do prazo</p>
              </div>
              <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-mono">
                Linha do Tempo
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#cbd5e1', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b0f17', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area type="monotone" dataKey="Total Planejado" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTotal)" />
                  <Area type="monotone" dataKey="Tarefas Concluídas" stroke="#10b981" fillOpacity={1} fill="url(#colorDone)" />
                  <Line type="monotone" dataKey="Marcos Críticos Concluídos" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export const TeamManagement: React.FC<TeamManagementProps> = ({ currentUser, onOpenAuthModal }) => {
  // Main Sub-Tab Navigation
  const [activeSubTab, setActiveSubTab] = useState<'planner' | 'gantt' | 'members' | 'dashboards' | 'departments' | 'invoices' | 'resources'>('planner');

  // Core Data States
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [tasks, setTasks] = useState<PlannerTask[]>(INITIAL_PLANNER_TASKS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [resources, setResources] = useState<TeamResourceLink[]>(INITIAL_RESOURCES);
  const [dashboardWidgets, setDashboardWidgets] = useState<CustomDashboardWidget[]>(INITIAL_DASHBOARD_WIDGETS);

  // Planner View State
  const [plannerViewMode, setPlannerViewMode] = useState<'hoje' | 'semanal' | 'mensal'>('semanal');
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<PlannerTask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Selected Task in GANTT view
  const [activeGanttTaskId, setActiveGanttTaskId] = useState<string | null>(tasks[0]?.id || null);
  const [isDraggingGantt, setIsDraggingGantt] = useState(false);
  const [activeDragTaskId, setActiveDragTaskId] = useState<string | null>(null);
  const ganttGridRef = useRef<HTMLDivElement>(null);

  // Task Form State
  const [taskForm, setTaskForm] = useState<Partial<PlannerTask>>({
    title: '',
    description: '',
    departmentId: INITIAL_DEPARTMENTS[0].id,
    assignee: currentUser?.name || 'Micael Nildo',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '17:00',
    status: 'A Fazer',
    priority: 'Alta',
    color: '#ef4444',
    tags: [],
    checklist: []
  });

  const [newChecklistItemText, setNewChecklistItemText] = useState('');
  const [newTagInput, setNewTagInput] = useState('');

  // Team Member Modal & CSV Import State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberForm, setMemberForm] = useState<Partial<TeamMember>>({
    name: '',
    email: '',
    role: '',
    departmentId: INITIAL_DEPARTMENTS[0].id,
    subsystemRole: '',
    accessLevel: 'Engenheiro Sênior',
    status: 'Ativo',
    phone: '',
    joinedDate: new Date().toISOString().split('T')[0]
  });

  const [isCsvImportModalOpen, setIsCsvImportModalOpen] = useState(false);
  const [csvTextRaw, setCsvTextRaw] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dashboard Customization Modal State
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [widgetForm, setWidgetForm] = useState<Partial<CustomDashboardWidget>>({
    title: '',
    type: 'chart_budget',
    chartType: 'bar',
    value: '',
    notes: ''
  });

  // Department Modal State
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState<boolean>(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [departmentForm, setDepartmentForm] = useState<Partial<Department>>({
    name: '',
    code: '',
    color: '#3b82f6',
    leader: '',
    budgetAllocated: 5000,
    description: ''
  });

  // Invoice Modal State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  const [invoiceSearch, setInvoiceSearch] = useState('');

  // Clear Data Modal State
  const [isClearDataOpen, setIsClearDataOpen] = useState<boolean>(false);
  const [invoiceFilterDept, setInvoiceFilterDept] = useState('ALL');
  const [invoiceFilterStatus, setInvoiceFilterStatus] = useState('ALL');
  const [invoiceForm, setInvoiceForm] = useState<Partial<Invoice>>({
    number: '',
    supplier: '',
    cnpjCpf: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    amount: 0,
    departmentId: INITIAL_DEPARTMENTS[0].id,
    description: '',
    status: 'Pendente',
    attachmentName: 'NotaFiscal_Anexa.pdf'
  });

  // Resource Modal State
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceCategory, setResourceCategory] = useState('Vídeo de Teste Estático');

  // Gantt Chart Offset
  const [ganttOffsetDays, setGanttOffsetDays] = useState<number>(0);

  // Custom Area / Dept & Custom Assignee Inputs
  const [customTaskDeptInput, setCustomTaskDeptInput] = useState('');
  const [customTaskAssigneeInput, setCustomTaskAssigneeInput] = useState('');
  const [customMemberDeptInput, setCustomMemberDeptInput] = useState('');

  // Member Search State
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberDeptFilter, setMemberDeptFilter] = useState('ALL');

  // ==================== TASK HANDLERS ====================
  const handleOpenNewTaskModal = () => {
    setSelectedTaskForEdit(null);
    const initialDept = departments[0]?.id || 'dep_prop';
    const initialDeptName = departments[0]?.name || 'Propulsão';
    const initialAssignee = currentUser?.name || 'Micael Nildo';
    setTaskForm({
      title: '',
      description: '',
      departmentId: initialDept,
      assignee: initialAssignee,
      startDate: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endDate: new Date().toISOString().split('T')[0],
      endTime: '17:00',
      status: 'A Fazer',
      priority: 'Alta',
      color: departments[0]?.color || '#ef4444',
      tags: ['Foguetemodelismo'],
      checklist: [
        { id: 'c_' + Date.now() + '_1', text: 'Definir escopo técnico', done: false },
        { id: 'c_' + Date.now() + '_2', text: 'Verificar segurança RSO', done: false }
      ]
    });
    setCustomTaskDeptInput(initialDeptName);
    setCustomTaskAssigneeInput(initialAssignee);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTaskModal = (task: PlannerTask) => {
    setSelectedTaskForEdit(task);
    setTaskForm({ ...task });
    const deptObj = departments.find(d => d.id === task.departmentId);
    setCustomTaskDeptInput(deptObj ? deptObj.name : task.departmentId);
    setCustomTaskAssigneeInput(task.assignee);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title) return;

    let targetDeptId = taskForm.departmentId || departments[0]?.id || 'dep_prop';

    if (customTaskDeptInput.trim() !== '') {
      const existingDept = departments.find(
        (d) => d.name.toLowerCase() === customTaskDeptInput.trim().toLowerCase()
      );
      if (existingDept) {
        targetDeptId = existingDept.id;
      } else {
        const newDeptId = 'dep_' + Date.now();
        const newDept: Department = {
          id: newDeptId,
          name: customTaskDeptInput.trim(),
          code: customTaskDeptInput.trim().slice(0, 4).toUpperCase(),
          color: '#f59e0b',
          leader: customTaskAssigneeInput || 'Líder de Área',
          budgetAllocated: 2000,
          description: 'Área criada de forma personalizada no Planner de Tarefas.'
        };
        setDepartments((prev) => [...prev, newDept]);
        targetDeptId = newDeptId;
      }
    }

    const finalAssignee =
      customTaskAssigneeInput.trim() !== ''
        ? customTaskAssigneeInput.trim()
        : taskForm.assignee || 'Integrante da Equipe';

    const deptObj = departments.find((d) => d.id === targetDeptId);

    if (selectedTaskForEdit) {
      setTasks(
        tasks.map((t) =>
          t.id === selectedTaskForEdit.id
            ? ({
                ...t,
                ...taskForm,
                departmentId: targetDeptId,
                assignee: finalAssignee,
                color: deptObj?.color || t.color || '#ef4444'
              } as PlannerTask)
            : t
        )
      );
    } else {
      const newTask: PlannerTask = {
        id: 'task_' + Date.now(),
        title: taskForm.title || 'Nova Atividade',
        description: taskForm.description || '',
        departmentId: targetDeptId,
        assignee: finalAssignee,
        startDate: taskForm.startDate || new Date().toISOString().split('T')[0],
        startTime: taskForm.startTime || '08:00',
        endDate: taskForm.endDate || new Date().toISOString().split('T')[0],
        endTime: taskForm.endTime || '17:00',
        status: taskForm.status || 'A Fazer',
        priority: taskForm.priority || 'Alta',
        color: deptObj?.color || '#ef4444',
        checklist: taskForm.checklist || [],
        tags: taskForm.tags || ['Foguetemodelismo']
      };
      setTasks([...tasks, newTask]);
    }

    setIsTaskModalOpen(false);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
    setIsTaskModalOpen(false);
  };

  const handleUpdateTaskStatus = (
    taskId: string,
    newStatus: 'A Fazer' | 'Em Progresso' | 'Em Teste' | 'Concluído'
  ) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const handleUpdateTaskAssignee = (taskId: string, newAssignee: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, assignee: newAssignee } : t))
    );
  };

  const handleShiftTaskStatus = (
    taskId: string,
    direction: 'left' | 'right'
  ) => {
    const statuses: Array<'A Fazer' | 'Em Progresso' | 'Em Teste' | 'Concluído'> = [
      'A Fazer',
      'Em Progresso',
      'Em Teste',
      'Concluído'
    ];
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id !== taskId) return t;
        const currentIndex = statuses.indexOf(t.status as any);
        if (currentIndex === -1) return t;
        let nextIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;
        if (nextIndex < 0) nextIndex = 0;
        if (nextIndex >= statuses.length) nextIndex = statuses.length - 1;
        return { ...t, status: statuses[nextIndex] };
      })
    );
  };

  const handleToggleChecklist = (taskId: string, checklistId: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id !== taskId) return t;
        const updated = t.checklist.map((item) => (item.id === checklistId ? { ...item, done: !item.done } : item));
        return { ...t, checklist: updated };
      })
    );
  };

  const handleAddChecklistItemToForm = () => {
    if (!newChecklistItemText.trim()) return;
    const newItem: PlannerChecklistItem = {
      id: 'c_' + Date.now(),
      text: newChecklistItemText.trim(),
      done: false
    };
    setTaskForm({
      ...taskForm,
      checklist: [...(taskForm.checklist || []), newItem]
    });
    setNewChecklistItemText('');
  };

  const handleRemoveChecklistItemFromForm = (id: string) => {
    setTaskForm({
      ...taskForm,
      checklist: (taskForm.checklist || []).filter((item) => item.id !== id)
    });
  };

  const handleAddTagToForm = () => {
    if (!newTagInput.trim()) return;
    if ((taskForm.tags || []).includes(newTagInput.trim())) return;
    setTaskForm({
      ...taskForm,
      tags: [...(taskForm.tags || []), newTagInput.trim()]
    });
    setNewTagInput('');
  };

  const handleRemoveTagFromForm = (tagToRemove: string) => {
    setTaskForm({
      ...taskForm,
      tags: (taskForm.tags || []).filter((t) => t !== tagToRemove)
    });
  };

  // ==================== GANTT INTERACTIVE DRAG & HOURS/DAYS HANDLERS ====================
  const handleGanttPointerDown = (
    e: React.PointerEvent,
    taskId: string,
    mode: 'resize-start' | 'resize-end' | 'move-bar',
    task: PlannerTask
  ) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    
    e.stopPropagation();

    const containerWidth = ganttGridRef.current?.getBoundingClientRect().width || 700;
    const cellWidthPx = containerWidth / 14;

    const startX = e.clientX;
    const startY = e.clientY;
    const initialStartDate = task.startDate;
    const initialEndDate = task.endDate;
    const initialStartTime = task.startTime;
    const initialEndTime = task.endTime;

    setActiveDragTaskId(taskId);
    setIsDraggingGantt(true);

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const dayDelta = Math.round(deltaX / cellWidthPx);

      setTasks((prevTasks) =>
        prevTasks.map((t) => {
          if (t.id !== taskId) return t;

          if (mode === 'resize-start') {
            const start = new Date(initialStartDate);
            start.setDate(start.getDate() + dayDelta);
            const end = new Date(initialEndDate);
            if (start > end) return t;

            return {
              ...t,
              startDate: start.toISOString().split('T')[0]
            };
          }

          if (mode === 'resize-end') {
            const end = new Date(initialEndDate);
            end.setDate(end.getDate() + dayDelta);
            const start = new Date(initialStartDate);
            if (end < start) return t;

            return {
              ...t,
              endDate: end.toISOString().split('T')[0]
            };
          }

          if (mode === 'move-bar') {
            const start = new Date(initialStartDate);
            start.setDate(start.getDate() + dayDelta);
            const end = new Date(initialEndDate);
            end.setDate(end.getDate() + dayDelta);

            let updatedStartTime = initialStartTime;
            let updatedEndTime = initialEndTime;
            const hourDelta = -Math.round(deltaY / 20);
            if (Math.abs(hourDelta) >= 1) {
              const [sh, sm] = initialStartTime.split(':').map(Number);
              const [eh, em] = initialEndTime.split(':').map(Number);
              const nsh = Math.max(0, Math.min(23, sh + hourDelta));
              const neh = Math.max(0, Math.min(23, eh + hourDelta));
              updatedStartTime = `${String(nsh).padStart(2, '0')}:${String(sm || 0).padStart(2, '0')}`;
              updatedEndTime = `${String(neh).padStart(2, '0')}:${String(em || 0).padStart(2, '0')}`;
            }

            return {
              ...t,
              startDate: start.toISOString().split('T')[0],
              endDate: end.toISOString().split('T')[0],
              startTime: updatedStartTime,
              endTime: updatedEndTime
            };
          }

          return t;
        })
      );
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      setIsDraggingGantt(false);
      setActiveDragTaskId(null);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Shift start or end date by days (+1 or -1)
  const handleShiftTaskDays = (taskId: string, dayDelta: number) => {
    setTasks(
      tasks.map((t) => {
        if (t.id !== taskId) return t;
        const start = new Date(t.startDate);
        start.setDate(start.getDate() + dayDelta);
        const end = new Date(t.endDate);
        end.setDate(end.getDate() + dayDelta);

        return {
          ...t,
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        };
      })
    );
  };

  // Extend or shrink start date (Left boundary)
  const handleExtendStartDays = (taskId: string, dayDelta: number) => {
    setTasks(
      tasks.map((t) => {
        if (t.id !== taskId) return t;
        const start = new Date(t.startDate);
        start.setDate(start.getDate() + dayDelta);
        const end = new Date(t.endDate);
        if (start > end) return t;

        return {
          ...t,
          startDate: start.toISOString().split('T')[0]
        };
      })
    );
  };

  // Extend or shrink end date (Right boundary)
  const handleExtendTaskDuration = (taskId: string, dayDelta: number) => {
    setTasks(
      tasks.map((t) => {
        if (t.id !== taskId) return t;
        const end = new Date(t.endDate);
        end.setDate(end.getDate() + dayDelta);
        if (end < new Date(t.startDate)) return t;

        return {
          ...t,
          endDate: end.toISOString().split('T')[0]
        };
      })
    );
  };

  // Adjust Start/End Time in Hours Up or Down (+1h or -1h)
  const handleAdjustTaskHours = (taskId: string, timeTarget: 'start' | 'end', hourDelta: number) => {
    setTasks(
      tasks.map((t) => {
        if (t.id !== taskId) return t;

        const currentStr = timeTarget === 'start' ? t.startTime : t.endTime;
        const [h, m] = currentStr.split(':').map(Number);
        let newHour = h + hourDelta;
        if (newHour < 0) newHour = 0;
        if (newHour > 23) newHour = 23;

        const formatted = `${String(newHour).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;

        return {
          ...t,
          [timeTarget === 'start' ? 'startTime' : 'endTime']: formatted
        };
      })
    );
  };

  const handleReorderTaskRow = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === tasks.length - 1)) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newTasks = [...tasks];
    const temp = newTasks[index];
    newTasks[index] = newTasks[targetIndex];
    newTasks[targetIndex] = temp;
    setTasks(newTasks);
  };

  // ==================== TEAM MEMBER HANDLERS ====================
  const handleOpenNewMemberModal = () => {
    setEditingMember(null);
    const initialDept = departments[0]?.id || 'dep_prop';
    const initialDeptName = departments[0]?.name || 'Propulsão';
    setMemberForm({
      name: '',
      email: '',
      role: '',
      departmentId: initialDept,
      subsystemRole: '',
      accessLevel: 'Engenheiro Sênior',
      status: 'Ativo',
      phone: '',
      joinedDate: new Date().toISOString().split('T')[0]
    });
    setCustomMemberDeptInput(initialDeptName);
    setIsMemberModalOpen(true);
  };

  const handleOpenEditMemberModal = (mem: TeamMember) => {
    setEditingMember(mem);
    setMemberForm({ ...mem });
    const deptObj = departments.find(d => d.id === mem.departmentId);
    setCustomMemberDeptInput(deptObj ? deptObj.name : mem.departmentId);
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name) return;

    let targetDeptId = memberForm.departmentId || departments[0]?.id || 'dep_prop';

    if (customMemberDeptInput.trim() !== '') {
      const existingDept = departments.find(
        (d) => d.name.toLowerCase() === customMemberDeptInput.trim().toLowerCase()
      );
      if (existingDept) {
        targetDeptId = existingDept.id;
      } else {
        const newDeptId = 'dep_' + Date.now();
        const newDept: Department = {
          id: newDeptId,
          name: customMemberDeptInput.trim(),
          code: customMemberDeptInput.trim().slice(0, 4).toUpperCase(),
          color: '#3b82f6',
          leader: memberForm.name || 'Coordenador',
          budgetAllocated: 2000,
          description: 'Área criada de forma personalizada no formulário de membros.'
        };
        setDepartments((prev) => [...prev, newDept]);
        targetDeptId = newDeptId;
      }
    }

    if (editingMember) {
      setTeamMembers(
        teamMembers.map((m) =>
          m.id === editingMember.id
            ? ({ ...m, ...memberForm, departmentId: targetDeptId } as TeamMember)
            : m
        )
      );
    } else {
      const newMember: TeamMember = {
        id: 'mem_' + Date.now(),
        name: memberForm.name || 'Integrante',
        email: memberForm.email || 'integrante@foguete.org',
        role: memberForm.role || 'Pesquisador Aeroespacial',
        departmentId: targetDeptId,
        subsystemRole: memberForm.subsystemRole || 'Desenvolvimento Geral',
        accessLevel: memberForm.accessLevel || 'Engenheiro Sênior',
        status: memberForm.status || 'Ativo',
        phone: memberForm.phone || '',
        joinedDate: memberForm.joinedDate || new Date().toISOString().split('T')[0]
      };
      setTeamMembers([...teamMembers, newMember]);
    }

    setIsMemberModalOpen(false);
  };

  const handleDeleteMember = (id: string) => {
    setTeamMembers(teamMembers.filter((m) => m.id !== id));
  };

  // CSV Import Parsing
  const handleImportCsv = () => {
    if (!csvTextRaw.trim()) return;

    const lines = csvTextRaw.split('\n').filter((l) => l.trim().length > 0);
    const newMembers: TeamMember[] = [];

    lines.forEach((line, index) => {
      // Ignore header if starts with Nome or Name
      if (index === 0 && (line.toLowerCase().includes('nome') || line.toLowerCase().includes('name'))) {
        return;
      }

      const parts = line.split(/[,;\t]/).map((p) => p.trim());
      if (parts.length >= 1 && parts[0]) {
        newMembers.push({
          id: 'mem_csv_' + Date.now() + '_' + index,
          name: parts[0],
          email: parts[1] || `${parts[0].toLowerCase().replace(/\s+/g, '.')}@foguete.org`,
          role: parts[2] || 'Pesquisador Aeroespacial',
          departmentId: departments[0]?.id || 'dep_prop',
          subsystemRole: parts[3] || 'Integração de Sistemas',
          accessLevel: 'Engenheiro Sênior',
          status: 'Ativo',
          phone: parts[4] || '',
          joinedDate: new Date().toISOString().split('T')[0]
        });
      }
    });

    if (newMembers.length > 0) {
      setTeamMembers([...teamMembers, ...newMembers]);
      alert(`${newMembers.length} membros importados com sucesso para a equipe!`);
      setCsvTextRaw('');
      setIsCsvImportModalOpen(false);
    } else {
      alert('Nenhum registro válido encontrado. Certifique-se de usar vírgula, ponto-e-vírgula ou tabulação.');
    }
  };

  const handleFileUploadCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setCsvTextRaw(content);
      }
    };
    reader.readAsText(file);
  };

  // Export CSV
  const handleExportMembersCsv = () => {
    const headers = 'Nome;E-mail;Cargo;Departamento;Função;Status;Nível\n';
    const rows = teamMembers
      .map((m) => {
        const dept = departments.find((d) => d.id === m.departmentId)?.name || 'Geral';
        return `${m.name};${m.email};${m.role};${dept};${m.subsystemRole};${m.status};${m.accessLevel}`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Tabela_Equipe_Foguete.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Members
  const filteredMembers = teamMembers.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) || m.email.toLowerCase().includes(memberSearchQuery.toLowerCase()) || m.role.toLowerCase().includes(memberSearchQuery.toLowerCase());
    const matchesDept = memberDeptFilter === 'ALL' || m.departmentId === memberDeptFilter;
    return matchesSearch && matchesDept;
  });

  // ==================== DASHBOARD WIDGET HANDLERS ====================
  const handleOpenAddWidgetModal = () => {
    setWidgetForm({
      title: '',
      type: 'chart_budget',
      chartType: 'bar',
      value: '',
      notes: ''
    });
    setIsWidgetModalOpen(true);
  };

  const handleSaveWidget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!widgetForm.title) return;

    const newWidget: CustomDashboardWidget = {
      id: 'w_' + Date.now(),
      title: widgetForm.title,
      type: widgetForm.type || 'chart_budget',
      chartType: widgetForm.chartType || 'bar',
      value: widgetForm.value || '',
      notes: widgetForm.notes || ''
    };

    setDashboardWidgets([...dashboardWidgets, newWidget]);
    setIsWidgetModalOpen(false);
  };

  const handleDeleteWidget = (id: string) => {
    setDashboardWidgets(dashboardWidgets.filter((w) => w.id !== id));
  };

  // ==================== DEPARTMENT HANDLERS ====================
  const handleOpenNewDepartmentModal = () => {
    setEditingDepartment(null);
    setDepartmentForm({
      name: '',
      code: 'NOVA',
      color: '#10b981',
      leader: currentUser?.name || 'Micael Nildo',
      budgetAllocated: 5000,
      description: ''
    });
    setIsDepartmentModalOpen(true);
  };

  const handleOpenEditDepartmentModal = (dep: Department) => {
    setEditingDepartment(dep);
    setDepartmentForm({ ...dep });
    setIsDepartmentModalOpen(true);
  };

  const handleSaveDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentForm.name) return;

    if (editingDepartment) {
      setDepartments(departments.map((d) => (d.id === editingDepartment.id ? ({ ...d, ...departmentForm } as Department) : d)));
    } else {
      const newDep: Department = {
        id: 'dep_' + Date.now(),
        name: departmentForm.name || 'Nova Área',
        code: (departmentForm.code || 'AREA').toUpperCase(),
        color: departmentForm.color || '#3b82f6',
        leader: departmentForm.leader || 'Líder do Setor',
        budgetAllocated: Number(departmentForm.budgetAllocated) || 0,
        description: departmentForm.description || 'Área responsável pelo desenvolvimento de subsistemas.'
      };
      setDepartments([...departments, newDep]);
    }
    setIsDepartmentModalOpen(false);
  };

  const handleDeleteDepartment = (id: string) => {
    if (departments.length <= 1) {
      alert('É necessário manter ao menos uma área cadastrada.');
      return;
    }
    setDepartments(departments.filter((d) => d.id !== id));
  };

  // ==================== INVOICE HANDLERS ====================
  const handleOpenNewInvoiceModal = () => {
    setInvoiceForm({
      number: `NF-${Math.floor(100000 + Math.random() * 900000)}`,
      supplier: '',
      cnpjCpf: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      amount: 0,
      departmentId: departments[0]?.id || 'dep_prop',
      description: '',
      status: 'Pendente',
      attachmentName: 'Comprovante_NF.pdf'
    });
    setIsInvoiceModalOpen(true);
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.supplier || !invoiceForm.amount) return;

    const newInvoice: Invoice = {
      id: 'nf_' + Date.now(),
      number: invoiceForm.number || `NF-${Date.now()}`,
      supplier: invoiceForm.supplier,
      cnpjCpf: invoiceForm.cnpjCpf || '00.000.000/0001-00',
      issueDate: invoiceForm.issueDate || new Date().toISOString().split('T')[0],
      dueDate: invoiceForm.dueDate || new Date().toISOString().split('T')[0],
      amount: Number(invoiceForm.amount) || 0,
      departmentId: invoiceForm.departmentId || departments[0]?.id || 'dep_prop',
      description: invoiceForm.description || 'Insumos e materiais para o foguete',
      status: invoiceForm.status || 'Pendente',
      attachmentName: invoiceForm.attachmentName || 'Anexo_Nota_Fiscal.pdf',
      attachmentUrl: 'https://drive.google.com'
    };

    setInvoices([newInvoice, ...invoices]);
    setIsInvoiceModalOpen(false);
  };

  const handleToggleInvoiceStatus = (id: string) => {
    setInvoices(
      invoices.map((inv) => {
        if (inv.id !== id) return inv;
        const nextStatus: Invoice['status'] = inv.status === 'Pago' ? 'Pendente' : inv.status === 'Pendente' ? 'Cancelado' : 'Pago';
        return { ...inv, status: nextStatus };
      })
    );
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices(invoices.filter((i) => i.id !== id));
  };

  // Filtered Invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = inv.supplier.toLowerCase().includes(invoiceSearch.toLowerCase()) || inv.number.toLowerCase().includes(invoiceSearch.toLowerCase());
    const matchesDept = invoiceFilterDept === 'ALL' || inv.departmentId === invoiceFilterDept;
    const matchesStatus = invoiceFilterStatus === 'ALL' || inv.status === invoiceFilterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Invoice Statistics
  const totalInvoicesAmount = invoices.reduce((acc, curr) => acc + (curr.status !== 'Cancelado' ? curr.amount : 0), 0);
  const totalPaidAmount = invoices.reduce((acc, curr) => acc + (curr.status === 'Pago' ? curr.amount : 0), 0);
  const totalPendingAmount = invoices.reduce((acc, curr) => acc + (curr.status === 'Pendente' ? curr.amount : 0), 0);

  // ==================== RESOURCE HANDLERS ====================
  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceTitle || !resourceUrl) return;

    const isYoutube = resourceUrl.includes('youtube.com') || resourceUrl.includes('youtu.be');

    const newRes: TeamResourceLink = {
      id: 'res_' + Date.now(),
      title: resourceTitle,
      url: resourceUrl,
      type: isYoutube ? 'YouTube' : 'Google Drive',
      addedBy: currentUser ? currentUser.name : 'Micael Nildo',
      category: resourceCategory
    };

    setResources([newRes, ...resources]);
    setIsResourceModalOpen(false);
    setResourceTitle('');
    setResourceUrl('');
  };

  const handleDeleteResource = (id: string) => {
    setResources(resources.filter((r) => r.id !== id));
  };

  // Helper for department object lookups
  const getDept = (deptId: string) => departments.find((d) => d.id === deptId) || departments[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Rocket className="w-80 h-80 text-red-500" />
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-red-500 font-mono text-xs uppercase tracking-wider mb-1 font-bold">
              <Users className="w-4 h-4 text-red-500" />
              Gestão Integrada de Equipe & Engenharia Aeroespacial
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Planner, GANTT Interativo, Membros, Dashboards & Financeiro
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Sistema completo para gerenciamento da equipe do foguete: cadastro e importação de membros via planilha, controle de tarefas com ajuste duplo de dias/horas no GANTT, dashboards personalizáveis, personalização de áreas e registro de Notas Fiscais.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleOpenNewTaskModal}
              className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition shadow-lg border border-red-400/40"
            >
              <Plus className="w-4 h-4" />
              Nova Tarefa / Checklist
            </button>
            <button
              onClick={handleOpenNewMemberModal}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-2 rounded-lg transition shadow border border-indigo-400/40"
            >
              <UserPlus className="w-4 h-4 text-indigo-200" />
              Cadastrar Membro
            </button>
            <button
              onClick={() => setIsCsvImportModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3 py-2 rounded-lg transition shadow"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              Importar Planilha
            </button>
            <button
              onClick={handleOpenNewInvoiceModal}
              className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-2 rounded-lg transition shadow border border-emerald-500/40"
            >
              <FileText className="w-4 h-4 text-emerald-200" />
              Registrar NF
            </button>
            <button
              onClick={() => setIsClearDataOpen(true)}
              className="inline-flex items-center gap-1.5 bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 font-bold text-xs px-3 py-2 rounded-lg transition shadow"
              title="Limpar dados salvos e reiniciar do zero"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              Limpar Dados
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800/80 font-mono text-xs">
          <button
            onClick={() => setActiveSubTab('planner')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition font-bold ${
              activeSubTab === 'planner'
                ? 'bg-red-600 text-white shadow-lg border border-red-400'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>1. Planner</span>
            <span className="bg-slate-950/60 px-1.5 py-0.5 rounded text-[10px] text-red-200">{tasks.length}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('gantt')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition font-bold ${
              activeSubTab === 'gantt'
                ? 'bg-red-600 text-white shadow-lg border border-red-400'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. GANTT Interativo</span>
            <span className="text-[10px] bg-red-950 text-red-300 border border-red-700/50 px-1.5 py-0.5 rounded font-mono">
              Dias & Horas
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('members')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition font-bold ${
              activeSubTab === 'members'
                ? 'bg-red-600 text-white shadow-lg border border-red-400'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>3. Tabela da Equipe</span>
            <span className="bg-slate-950/60 px-1.5 py-0.5 rounded text-[10px] text-indigo-300">{teamMembers.length}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('dashboards')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition font-bold ${
              activeSubTab === 'dashboards'
                ? 'bg-red-600 text-white shadow-lg border border-red-400'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>4. Dashboards & Gráficos</span>
            <span className="bg-slate-950/60 px-1.5 py-0.5 rounded text-[10px] text-amber-300">{dashboardWidgets.length}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('departments')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition font-bold ${
              activeSubTab === 'departments'
                ? 'bg-red-600 text-white shadow-lg border border-red-400'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>5. Áreas & Subsistemas</span>
            <span className="bg-slate-950/60 px-1.5 py-0.5 rounded text-[10px] text-blue-300">{departments.length}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition font-bold ${
              activeSubTab === 'invoices'
                ? 'bg-red-600 text-white shadow-lg border border-red-400'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>6. Notas Fiscais</span>
            <span className="bg-slate-950/60 px-1.5 py-0.5 rounded text-[10px] text-emerald-300">{invoices.length} NFs</span>
          </button>

          <button
            onClick={() => setActiveSubTab('resources')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition font-bold ${
              activeSubTab === 'resources'
                ? 'bg-red-600 text-white shadow-lg border border-red-400'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>7. Vídeos & Drive</span>
            <span className="bg-slate-950/60 px-1.5 py-0.5 rounded text-[10px] text-sky-300">{resources.length}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: PLANNER (HOJE, SEMANAL, MENSAL) WITH CHECKLIST */}
      {/* ========================================================================= */}
      {activeSubTab === 'planner' && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-500" />
                Planner Avançado de Atividades
              </h3>
              <p className="text-xs text-slate-400">
                Acompanhe por visão diária, semanal ou mensal com checklists interativos e horários completos.
              </p>
            </div>

            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 font-mono text-xs">
              <button
                onClick={() => setPlannerViewMode('hoje')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  plannerViewMode === 'hoje' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Hoje
              </button>
              <button
                onClick={() => setPlannerViewMode('semanal')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  plannerViewMode === 'semanal' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Semanal
              </button>
              <button
                onClick={() => setPlannerViewMode('mensal')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  plannerViewMode === 'mensal' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Mensal
              </button>
            </div>
          </div>

          {/* HOJE VIEW */}
          {plannerViewMode === 'hoje' && (
            <div className="space-y-4">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs font-mono flex justify-between items-center text-slate-300">
                <span className="font-bold text-red-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Agenda de Hoje ({new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })})
                </span>
                <span>{tasks.length} Tarefas Registradas</span>
              </div>

              <div className="space-y-3">
                {tasks.map((task) => {
                  const dept = getDept(task.departmentId);
                  const completedChecklist = task.checklist.filter((c) => c.done).length;
                  const totalChecklist = task.checklist.length;

                  return (
                    <div
                      key={task.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition"
                      style={{ borderLeftWidth: '4px', borderLeftColor: task.color || dept.color }}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold font-mono text-white"
                              style={{ backgroundColor: dept.color }}
                            >
                              {dept.name}
                            </span>
                            <span className="text-xs font-bold text-white">{task.title}</span>
                          </div>
                          {task.description && (
                            <p className="text-xs text-slate-400">{task.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-slate-300 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-red-400" />
                            {task.startTime}h - {task.endTime}h
                          </span>
                          <button
                            onClick={() => handleOpenEditTaskModal(task)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition"
                            title="Editar Tarefa"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Status Selector Buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-900">
                        <span className="text-[10px] font-mono text-slate-400 font-semibold mr-1">Status:</span>
                        {(['A Fazer', 'Em Progresso', 'Em Teste', 'Concluído'] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdateTaskStatus(task.id, st)}
                            className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition border ${
                              task.status === st
                                ? st === 'Concluído'
                                  ? 'bg-emerald-600 border-emerald-500 text-white shadow'
                                  : st === 'Em Progresso'
                                  ? 'bg-blue-600 border-blue-500 text-white shadow'
                                  : st === 'Em Teste'
                                  ? 'bg-amber-600 border-amber-500 text-white shadow'
                                  : 'bg-red-600 border-red-500 text-white shadow'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>

                      {totalChecklist > 0 && (
                        <div className="pt-2 border-t border-slate-900 space-y-1.5">
                          <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                            <span>Checklist ({completedChecklist}/{totalChecklist})</span>
                            <span className="text-emerald-400 font-bold">
                              {Math.round((completedChecklist / totalChecklist) * 100)}% concluído
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {task.checklist.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => handleToggleChecklist(task.id, item.id)}
                                className={`flex items-center gap-2 p-2 rounded text-xs text-left transition border ${
                                  item.done
                                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 line-through'
                                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                                }`}
                              >
                                <CheckSquare className={`w-3.5 h-3.5 shrink-0 ${item.done ? 'text-emerald-400' : 'text-slate-500'}`} />
                                <span>{item.text}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SEMANAL VIEW (KANBAN BOARD INTERATIVO COM DRAG & DROP E BOTOES CLICAVEIS) */}
          {plannerViewMode === 'semanal' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(['A Fazer', 'Em Progresso', 'Em Teste', 'Concluído'] as const).map((statusGroup) => {
                const groupTasks = tasks.filter((t) => t.status === statusGroup);
                const isOver = dragOverColumn === statusGroup;

                return (
                  <div
                    key={statusGroup}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragOverColumn !== statusGroup) setDragOverColumn(statusGroup);
                    }}
                    onDragLeave={() => {
                      if (dragOverColumn === statusGroup) setDragOverColumn(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverColumn(null);
                      const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
                      if (taskId) {
                        handleUpdateTaskStatus(taskId, statusGroup);
                        setDraggedTaskId(null);
                      }
                    }}
                    className={`bg-slate-950 p-4 rounded-xl border transition-all space-y-3 ${
                      isOver ? 'border-red-500 bg-red-950/30 ring-2 ring-red-500/60 scale-[1.01]' : 'border-slate-800/80'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs font-bold font-mono border-b border-slate-800 pb-2 text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          statusGroup === 'Concluído' ? 'bg-emerald-500' : statusGroup === 'Em Progresso' ? 'bg-blue-500' : statusGroup === 'Em Teste' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        {statusGroup.toUpperCase()}
                      </span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-300 font-bold">
                        {groupTasks.length}
                      </span>
                    </div>

                    <div className="space-y-3 min-h-[140px]">
                      {groupTasks.length === 0 && (
                        <div className="text-[11px] font-mono text-slate-500 text-center py-8 border border-dashed border-slate-800 rounded-lg">
                          Solte tarefas aqui ou clique em mover nos cartões
                        </div>
                      )}

                      {groupTasks.map((t) => {
                        const dept = getDept(t.departmentId);
                        const completedChecklist = t.checklist.filter((c) => c.done).length;

                        return (
                          <div
                            key={t.id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', t.id);
                              setDraggedTaskId(t.id);
                            }}
                            onDragEnd={() => setDraggedTaskId(null)}
                            className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2.5 hover:border-slate-700 transition shadow-md relative group cursor-grab active:cursor-grabbing"
                            style={{ borderTopWidth: '3px', borderTopColor: t.color || dept.color }}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span
                                className="text-[9px] font-mono px-1.5 py-0.5 rounded text-white font-bold"
                                style={{ backgroundColor: dept.color }}
                              >
                                {dept.code} • {dept.name}
                              </span>
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                                  t.priority === 'Crítica'
                                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                }`}
                              >
                                {t.priority}
                              </span>
                            </div>

                            <h4 className="font-bold text-xs text-white leading-snug">{t.title}</h4>

                            {/* BOTOES INTERATIVOS PARA MOVER ENTRE STATUS */}
                            <div className="space-y-1.5 pt-1.5 border-t border-slate-800/80">
                              <div className="text-[10px] font-mono text-slate-400 font-semibold flex justify-between items-center">
                                <span>Mover para:</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleShiftTaskStatus(t.id, 'left')}
                                    disabled={t.status === 'A Fazer'}
                                    className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded transition text-[11px] font-bold"
                                    title="Mover para status anterior"
                                  >
                                    ‹
                                  </button>
                                  <button
                                    onClick={() => handleShiftTaskStatus(t.id, 'right')}
                                    disabled={t.status === 'Concluído'}
                                    className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded transition text-[11px] font-bold"
                                    title="Mover para próximo status"
                                  >
                                    ›
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-1 font-mono text-[9px]">
                                {(['A Fazer', 'Em Progresso', 'Em Teste', 'Concluído'] as const).map((st) => (
                                  <button
                                    key={st}
                                    onClick={() => handleUpdateTaskStatus(t.id, st)}
                                    className={`py-1 px-1 rounded transition font-bold text-center border truncate ${
                                      t.status === st
                                        ? st === 'Concluído'
                                          ? 'bg-emerald-600 border-emerald-500 text-white shadow'
                                          : st === 'Em Progresso'
                                          ? 'bg-blue-600 border-blue-500 text-white shadow'
                                          : st === 'Em Teste'
                                          ? 'bg-amber-600 border-amber-500 text-white shadow'
                                          : 'bg-red-600 border-red-500 text-white shadow'
                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                                  >
                                    {st}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {t.checklist.length > 0 && (
                              <div className="space-y-1">
                                <div className="text-[10px] font-mono text-slate-400 flex justify-between">
                                  <span>Checklist</span>
                                  <span>{completedChecklist}/{t.checklist.length}</span>
                                </div>
                                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-emerald-500 h-full transition-all"
                                    style={{ width: `${(completedChecklist / t.checklist.length) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                              <span className="text-slate-300 font-semibold">{t.assignee}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEditTaskModal(t)}
                                  className="p-1 hover:text-white text-slate-500 transition"
                                  title="Editar"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <span className="text-blue-400 font-bold">{t.startDate}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MENSAL VIEW */}
          {plannerViewMode === 'mensal' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((t) => {
                const dept = getDept(t.departmentId);
                return (
                  <div
                    key={t.id}
                    className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 hover:border-slate-700 transition"
                    style={{ borderLeftWidth: '4px', borderLeftColor: t.color || dept.color }}
                  >
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-slate-400">{t.startDate} até {t.endDate}</span>
                      <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                        {t.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-white">{t.title}</h4>

                    {/* Status Mover Buttons */}
                    <div className="grid grid-cols-2 gap-1 font-mono text-[9px] pt-1 border-t border-slate-900">
                      {(['A Fazer', 'Em Progresso', 'Em Teste', 'Concluído'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateTaskStatus(t.id, st)}
                          className={`py-1 px-1 rounded transition font-bold text-center border truncate ${
                            t.status === st
                              ? st === 'Concluído'
                                ? 'bg-emerald-600 border-emerald-500 text-white shadow'
                                : st === 'Em Progresso'
                                ? 'bg-blue-600 border-blue-500 text-white shadow'
                                : st === 'Em Teste'
                                ? 'bg-amber-600 border-amber-500 text-white shadow'
                                : 'bg-red-600 border-red-500 text-white shadow'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-400 flex justify-between items-center pt-2 border-t border-slate-900">
                      <span>Responsável: <strong className="text-slate-200">{t.assignee}</strong></span>
                      <button
                        onClick={() => handleOpenEditTaskModal(t)}
                        className="text-red-400 hover:underline font-mono text-[10px]"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: CRONOGRAMA GANTT INTERATIVO (AJUSTE DE DIAS E HORAS) */}
      {/* ========================================================================= */}
      {activeSubTab === 'gantt' && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-red-500" />
                Cronograma GANTT Interativo (Controle Lateral & Vertical)
              </h3>
              <p className="text-xs text-slate-400">
                Arraste/Ajuste lateralmente para alterar os <strong>dias</strong> (início/fim) e use os controles verticais para expandir/reduzir a janela de <strong>horas</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                onClick={() => setGanttOffsetDays(ganttOffsetDays - 7)}
                className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg transition border border-slate-700"
                title="Mover 7 dias para trás"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGanttOffsetDays(0)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition border border-slate-700 font-bold"
              >
                Hoje
              </button>
              <button
                onClick={() => setGanttOffsetDays(ganttOffsetDays + 7)}
                className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg transition border border-slate-700"
                title="Mover 7 dias para frente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Gantt Table Container with Dual Axis Scroll (Horizontal & Vertical) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto overflow-y-auto max-h-[600px] relative">
              <div className="min-w-[1100px]">
                {/* Timeline Header Row */}
                <div className="flex border-b border-slate-800 bg-slate-900/90 text-[11px] font-mono font-bold text-slate-300 sticky top-0 z-20">
                  <div className="w-80 p-3 border-r border-slate-800 bg-slate-900 shrink-0 flex justify-between items-center">
                    <span>TAREFA & HORÁRIO</span>
                    <span className="text-[9px] text-slate-500">Controles Verticais / Horas</span>
                  </div>

                  <div className="flex-1 grid grid-cols-14 divide-x divide-slate-800/80 text-center">
                    {Array.from({ length: 14 }).map((_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() + ganttOffsetDays + (i - 2));
                      const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                      const dayName = d.toLocaleDateString('pt-BR', { weekday: 'narrow' });
                      const isToday = d.toDateString() === new Date().toDateString();

                      return (
                        <div
                          key={i}
                          className={`p-2 flex flex-col items-center justify-center ${
                            isToday ? 'bg-red-950/40 text-red-400 font-extrabold border-b-2 border-red-500' : ''
                          }`}
                        >
                          <span className="text-[9px] text-slate-500">{dayName}</span>
                          <span>{dateStr}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Task Bars List */}
                <div className="divide-y divide-slate-900">
                  {tasks.map((task, index) => {
                    const dept = getDept(task.departmentId);
                    const isSelected = activeGanttTaskId === task.id;

                    const viewStartDate = new Date();
                    viewStartDate.setDate(viewStartDate.getDate() + ganttOffsetDays - 2);

                    const taskStart = new Date(task.startDate);
                    const taskEnd = new Date(task.endDate);

                    const diffStartDays = Math.round((taskStart.getTime() - viewStartDate.getTime()) / (1000 * 3600 * 24));
                    const durationDays = Math.max(1, Math.round((taskEnd.getTime() - taskStart.getTime()) / (1000 * 3600 * 24)) + 1);

                    const leftPercent = Math.max(0, Math.min(100, (diffStartDays / 14) * 100));
                    const widthPercent = Math.max(5, Math.min(100 - leftPercent, (durationDays / 14) * 100));

                    return (
                      <div 
                        key={task.id} 
                        onClick={() => setActiveGanttTaskId(task.id)}
                        className={`flex hover:bg-slate-900/40 transition group items-center ${isSelected ? 'bg-slate-900/60' : ''}`}
                      >
                        {/* Left Task Column with Vertical Order & Hours Adjustment */}
                        <div className="w-80 p-3 border-r border-slate-800 bg-slate-950/90 shrink-0 space-y-1">
                          <div className="flex justify-between items-center">
                            <span
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded text-white font-bold"
                              style={{ backgroundColor: dept.color }}
                            >
                              {dept.code}
                            </span>
                            
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleReorderTaskRow(index, 'up'); }}
                                className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                                title="Mover Fila para Cima"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleReorderTaskRow(index, 'down'); }}
                                className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                                title="Mover Fila para Baixo"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleOpenEditTaskModal(task); }}
                                className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                                title="Editar Detalhes"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <h5 className="text-xs font-bold text-white truncate">{task.title}</h5>

                          {/* Responsável Selector in GANTT */}
                          <div className="flex items-center gap-1 text-[10px] font-mono bg-slate-900 p-1 rounded border border-slate-800 text-slate-300">
                            <span className="text-slate-400 font-semibold shrink-0 flex items-center gap-1">
                              <UserIcon className="w-3 h-3 text-red-400" />
                              Resp:
                            </span>
                            <select
                              value={task.assignee}
                              onChange={(e) => handleUpdateTaskAssignee(task.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-slate-950 text-white border border-slate-800 rounded px-1 py-0.5 text-[9.5px] focus:border-red-500 outline-none w-full font-bold truncate cursor-pointer hover:bg-slate-900"
                              title="Alterar o Responsável da Tarefa no GANTT"
                            >
                              {teamMembers.map((m) => (
                                <option key={m.id} value={m.name}>
                                  {m.name} ({m.role})
                                </option>
                              ))}
                              {!teamMembers.some((m) => m.name === task.assignee) && (
                                <option value={task.assignee}>{task.assignee}</option>
                              )}
                            </select>
                          </div>

                          {/* Hours Controls (Up and Down for Start / End Hours) */}
                          <div className="flex items-center justify-between text-[10px] font-mono bg-slate-900 p-1.5 rounded border border-slate-800 text-slate-300">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-red-400" />
                              {task.startTime}h - {task.endTime}h
                            </span>

                            <div className="flex items-center gap-1.5 text-[9px]">
                              {/* Start Hour Controls */}
                              <div className="flex items-center bg-slate-950 rounded px-1 border border-slate-800">
                                <span className="text-slate-500 mr-1">Início:</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleAdjustTaskHours(task.id, 'start', -1); }}
                                  className="px-1 text-slate-400 hover:text-white font-bold"
                                  title="-1 Horas no início"
                                >
                                  -
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleAdjustTaskHours(task.id, 'start', +1); }}
                                  className="px-1 text-slate-400 hover:text-white font-bold"
                                  title="+1 Horas no início"
                                >
                                  +
                                </button>
                              </div>

                              {/* End Hour Controls */}
                              <div className="flex items-center bg-slate-950 rounded px-1 border border-slate-800">
                                <span className="text-slate-500 mr-1">Fim:</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleAdjustTaskHours(task.id, 'end', -1); }}
                                  className="px-1 text-slate-400 hover:text-white font-bold"
                                  title="-1 Horas no fim"
                                >
                                  -
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleAdjustTaskHours(task.id, 'end', +1); }}
                                  className="px-1 text-slate-400 hover:text-white font-bold"
                                  title="+1 Horas no fim"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Gantt Bar Cell with Horizontal Days Drag Controls */}
                        <div 
                          ref={index === 0 ? ganttGridRef : undefined}
                          className="flex-1 h-16 relative bg-slate-950 flex items-center px-1 border-b border-slate-900 overflow-hidden select-none"
                        >
                          {/* Background Grid Lines */}
                          <div className="absolute inset-0 grid grid-cols-14 divide-x divide-slate-900 pointer-events-none opacity-40">
                            {Array.from({ length: 14 }).map((_, i) => (
                              <div key={i} />
                            ))}
                          </div>

                          {/* Dynamic Task Bar */}
                          <div
                            onPointerDown={(e) => handleGanttPointerDown(e, task.id, 'move-bar', task)}
                            className={`absolute h-10 rounded-lg shadow-xl border flex items-center justify-between px-1 text-white font-mono text-[10px] font-bold transition-all cursor-grab active:cursor-grabbing group/bar ${
                              activeDragTaskId === task.id ? 'ring-2 ring-white scale-[1.01] z-10 shadow-2xl' : ''
                            }`}
                            style={{
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                              backgroundColor: task.color || dept.color,
                              borderColor: 'rgba(255, 255, 255, 0.4)'
                            }}
                            title="Clique e arraste a barra para mover no tempo, ou use as bordas laterais para aumentar/diminuir o tamanho."
                          >
                            {/* Left Drag Handle (Início em Dias) */}
                            <div
                              onPointerDown={(e) => handleGanttPointerDown(e, task.id, 'resize-start', task)}
                              onClick={(e) => { e.stopPropagation(); handleExtendStartDays(task.id, -1); }}
                              className="w-5 h-full bg-black/40 hover:bg-black/70 rounded-l transition-all flex items-center justify-center -ml-1 text-white cursor-ew-resize opacity-90 hover:opacity-100 group/left-handle shrink-0"
                              title="Arraste para aumentar ou encurtar o início da tarefa"
                            >
                              <GripVertical className="w-3.5 h-3.5 text-white/90" />
                            </div>

                            {/* Task Label, Responsável & Days Controls */}
                            <div className="truncate px-1.5 flex items-center gap-1.5 pointer-events-none">
                              <span className="truncate drop-shadow font-bold">{task.title}</span>
                              <span className="bg-black/60 px-1 py-0.5 rounded text-[8px] text-red-200 font-mono font-bold shrink-0 flex items-center gap-0.5 border border-white/20">
                                <UserIcon className="w-2.5 h-2.5 text-red-400" />
                                {task.assignee}
                              </span>
                              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-slate-100 font-mono shrink-0">
                                {durationDays}d ({task.startTime}-{task.endTime}h)
                              </span>
                            </div>

                            {/* Shift Whole Task Left / Right */}
                            <div className="hidden group-hover/bar:flex items-center gap-1 bg-black/70 px-1 py-0.5 rounded border border-white/30 shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleShiftTaskDays(task.id, -1); }}
                                className="hover:text-red-300 px-0.5"
                                title="Mover tarefa 1 dia para a esquerda"
                              >
                                ◄
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleShiftTaskDays(task.id, 1); }}
                                className="hover:text-red-300 px-0.5"
                                title="Mover tarefa 1 dia para a direita"
                              >
                                ►
                              </button>
                            </div>

                            {/* Right Drag Handle (Fim em Dias) */}
                            <div
                              onPointerDown={(e) => handleGanttPointerDown(e, task.id, 'resize-end', task)}
                              onClick={(e) => { e.stopPropagation(); handleExtendTaskDuration(task.id, 1); }}
                              className="w-5 h-full bg-black/40 hover:bg-black/70 rounded-r transition-all flex items-center justify-center -mr-1 text-white cursor-ew-resize opacity-90 hover:opacity-100 group/right-handle shrink-0"
                              title="Arraste para aumentar ou encurtar a duração final da tarefa"
                            >
                              <GripVertical className="w-3.5 h-3.5 text-white/90" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: TABELA DE MEMBROS DA EQUIPE & IMPORTAÇÃO DE PLANILHA */}
      {/* ========================================================================= */}
      {activeSubTab === 'members' && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Membros da Equipe & Importação de Planilha
              </h3>
              <p className="text-xs text-slate-400">
                Cadastre individualmente ou importe tabelas inteiras via CSV/Google Planilhas para gerenciar líderes, alunos e pesquisadores.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsCsvImportModalOpen(true)}
                className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Importar Tabela CSV
              </button>
              <button
                onClick={handleExportMembersCsv}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-400" />
                Exportar CSV
              </button>
              <button
                onClick={handleOpenNewMemberModal}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Novo Membro
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar membro por nome, e-mail ou cargo..."
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={memberDeptFilter}
              onChange={(e) => setMemberDeptFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Todos os Subsistemas ({teamMembers.length})</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Members Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Membro</th>
                    <th className="p-3">E-mail / Contato</th>
                    <th className="p-3">Cargo & Subsistema</th>
                    <th className="p-3">Área / Departamento</th>
                    <th className="p-3">Nível de Acesso</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {filteredMembers.map((m) => {
                    const dept = getDept(m.departmentId);

                    return (
                      <tr key={m.id} className="hover:bg-slate-900/50 transition">
                        <td className="p-3 font-bold text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0">
                            {m.name.charAt(0)}
                          </div>
                          <span>{m.name}</span>
                        </td>
                        <td className="p-3 text-slate-400">{m.email}</td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-200">{m.role}</div>
                          <div className="text-[10px] text-slate-500">{m.subsystemRole}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                            style={{ backgroundColor: dept.color }}
                          >
                            {dept.name}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                            {m.accessLevel}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEditMemberModal(m)}
                            className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded transition"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(m.id)}
                            className="p-1 bg-slate-900 hover:bg-red-950/60 text-red-400 rounded transition"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: PLANILHAS INTEGRADAS, DASHBOARDS & GRÁFICOS EDITÁVEIS */}
      {/* ========================================================================= */}
      {activeSubTab === 'dashboards' && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-amber-400" />
                Planilhas Integradas & Dashboards Personalizados
              </h3>
              <p className="text-xs text-slate-400">
                Painel customizável e editável com gráficos de verba, alocação de tarefas por subsistema e KPIs configuráveis.
              </p>
            </div>

            <button
              onClick={handleOpenAddWidgetModal}
              className="bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-lg border border-amber-400/40"
            >
              <Plus className="w-4 h-4" />
              Adicionar Gráfico / Widget
            </button>
          </div>

          {/* Interactive Recharts Progress & Critical Milestones Panel */}
          <TeamProgressCharts tasks={tasks} departments={departments} />

          {/* Title for custom widgets */}
          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <h4 className="text-sm font-bold text-slate-200 font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              Widgets e Indicadores Adicionais
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">{dashboardWidgets.length} configurados</span>
          </div>

          {/* Dynamic Grid of Editable Dashboard Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardWidgets.map((widget) => {
              return (
                <div key={widget.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl relative">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <Layout className="w-4 h-4 text-amber-400" />
                      {widget.title}
                    </h4>
                    <button
                      onClick={() => handleDeleteWidget(widget.id)}
                      className="p-1 hover:text-red-400 text-slate-600 transition"
                      title="Remover Widget"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Widget Content Type Render */}
                  {widget.type === 'chart_budget' && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        {departments.map((dept) => (
                          <div key={dept.id} className="space-y-1">
                            <div className="flex justify-between text-xs font-mono text-slate-300">
                              <span>{dept.name}</span>
                              <span className="font-bold" style={{ color: dept.color }}>
                                R$ {dept.budgetAllocated.toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(100, (dept.budgetAllocated / 25000) * 100)}%`,
                                  backgroundColor: dept.color
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {widget.type === 'chart_tasks' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                        {[
                          { st: 'Concluído', color: '#10b981' },
                          { st: 'Em Teste', color: '#06b6d4' },
                          { st: 'Em Progresso', color: '#f59e0b' },
                          { st: 'A Fazer', color: '#ef4444' }
                        ].map(({ st, color }) => {
                          const count = tasks.filter((t) => t.status === st).length;
                          return (
                            <div key={st} className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center space-y-1">
                              <div className="text-slate-400 text-[10px] uppercase font-bold" style={{ color }}>{st}</div>
                              <div className="text-xl font-bold text-white">{count} tarefas</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Mini Recharts Bar Chart in Widget */}
                      <div className="h-36 w-full pt-2 bg-slate-900/60 p-2 rounded-xl border border-slate-900">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { status: 'Concluído', count: tasks.filter((t) => t.status === 'Concluído').length, fill: '#10b981' },
                              { status: 'Em Teste', count: tasks.filter((t) => t.status === 'Em Teste').length, fill: '#06b6d4' },
                              { status: 'Em Progresso', count: tasks.filter((t) => t.status === 'Em Progresso').length, fill: '#f59e0b' },
                              { status: 'A Fazer', count: tasks.filter((t) => t.status === 'A Fazer').length, fill: '#ef4444' }
                            ]}
                            margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" />
                            <XAxis dataKey="status" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#0b0f17', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                              {[
                                { fill: '#10b981' },
                                { fill: '#06b6d4' },
                                { fill: '#f59e0b' },
                                { fill: '#ef4444' }
                              ].map((entry, index) => (
                                <Cell key={`widget-cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {widget.type === 'metric_kpi' && (
                    <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2 text-center">
                      <div className="text-2xl font-extrabold text-amber-400 font-mono">{widget.value || 'R$ 0,00'}</div>
                      <p className="text-xs text-slate-300 font-mono">{widget.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 5: ÁREAS & SUBSISTEMAS PERSONALIZÁVEIS */}
      {/* ========================================================================= */}
      {activeSubTab === 'departments' && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                Áreas Técnicas, Subsistemas & Orçamento
              </h3>
              <p className="text-xs text-slate-400">
                Crie novas áreas, edite nomes dos subsistemas e defina verbas para propulsão, aviônica, aerodinâmica e testes.
              </p>
            </div>

            <button
              onClick={handleOpenNewDepartmentModal}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <FolderPlus className="w-4 h-4" />
              Personalizar Nova Área
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const deptTasksCount = tasks.filter((t) => t.departmentId === dept.id).length;
              const deptInvoicesCount = invoices.filter((i) => i.departmentId === dept.id).length;

              return (
                <div
                  key={dept.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 relative hover:border-slate-700 transition shadow-lg"
                  style={{ borderLeftWidth: '5px', borderLeftColor: dept.color }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: dept.color }}>
                        {dept.code}
                      </span>
                      <h4 className="font-bold text-sm text-white mt-1">{dept.name}</h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditDepartmentModal(dept)}
                        className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded transition"
                        title="Editar Nome / Verba"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(dept.id)}
                        className="p-1 bg-slate-900 hover:bg-red-950/60 text-red-400 rounded transition"
                        title="Excluir Área"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">{dept.description}</p>

                  <div className="pt-2 border-t border-slate-900 space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span>Líder da Área:</span>
                      <span className="font-bold text-slate-100">{dept.leader}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Orçamento Aprovado:</span>
                      <span className="font-bold text-emerald-400">R$ {dept.budgetAllocated.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px] pt-1">
                      <span>{deptTasksCount} tarefas ativas</span>
                      <span>{deptInvoicesCount} notas fiscais</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 6: REGISTRO DE NOTAS FISCAIS */}
      {/* ========================================================================= */}
      {activeSubTab === 'invoices' && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Registro & Controle de Notas Fiscais
              </h3>
              <p className="text-xs text-slate-400">
                Arquivamento de comprovantes fiscais para aquisição de materiais de construção do foguete (grafite, componentes, nitrato, fibra de vidro).
              </p>
            </div>

            <button
              onClick={handleOpenNewInvoiceModal}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              Nova Nota Fiscal
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400">Total em Notas Fiscais</span>
              <div className="text-xl font-bold text-white">R$ {totalInvoicesAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400">Notas Pagas</span>
              <div className="text-xl font-bold text-emerald-400">R$ {totalPaidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400">Pendentes / A Vencer</span>
              <div className="text-xl font-bold text-amber-400">R$ {totalPendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                  <tr>
                    <th className="p-3">Nº / Fornecedor</th>
                    <th className="p-3">CNPJ/CPF</th>
                    <th className="p-3">Valor (R$)</th>
                    <th className="p-3">Departamento</th>
                    <th className="p-3">Emissão / Vencimento</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {filteredInvoices.map((inv) => {
                    const dept = getDept(inv.departmentId);

                    return (
                      <tr key={inv.id} className="hover:bg-slate-900/50 transition">
                        <td className="p-3">
                          <div className="font-bold text-white">{inv.number}</div>
                          <div className="text-slate-400 text-[11px]">{inv.supplier}</div>
                        </td>
                        <td className="p-3 text-slate-400">{inv.cnpjCpf}</td>
                        <td className="p-3 font-bold text-emerald-400">
                          R$ {inv.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] text-white font-bold" style={{ backgroundColor: dept.color }}>
                            {dept.name}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">
                          {inv.issueDate} ➔ {inv.dueDate}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleInvoiceStatus(inv.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inv.status === 'Pago'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {inv.status}
                          </button>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            onClick={() => handleDeleteInvoice(inv.id)}
                            className="p-1 bg-slate-900 hover:bg-red-950/60 text-red-400 rounded transition"
                            title="Excluir NF"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 7: VÍDEOS & GOOGLE DRIVE */}
      {/* ========================================================================= */}
      {activeSubTab === 'resources' && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-sky-400" />
                Repositório de Vídeos de Teste & Google Drive
              </h3>
              <p className="text-xs text-slate-400">
                Compartilhe vídeos de lançamentos, relatórios de simulação e links do Google Drive da equipe.
              </p>
            </div>

            <button
              onClick={() => setIsResourceModalOpen(true)}
              className="bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              Adicionar Link / Vídeo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((res) => (
              <div key={res.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 hover:border-slate-700 transition">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-sky-300 font-bold border border-slate-800">
                    {res.category}
                  </span>
                  <button
                    onClick={() => handleDeleteResource(res.id)}
                    className="p-1 hover:text-red-400 text-slate-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="font-bold text-sm text-white">{res.title}</h4>

                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:underline font-mono"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Acessar no {res.type}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== MODALS ==================== */}

      {/* MEMBER CSV IMPORT MODAL */}
      {isCsvImportModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-400" />
                Importar Tabela de Membros (CSV / Texto)
              </h3>
              <button onClick={() => setIsCsvImportModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Cole abaixo as linhas no formato: <code className="text-emerald-300">Nome, Email, Cargo, Subsistema, Telefone</code> ou selecione um arquivo <code>.csv</code>.
            </p>

            <textarea
              rows={6}
              value={csvTextRaw}
              onChange={(e) => setCsvTextRaw(e.target.value)}
              placeholder="Micael Nildo, micaelnildo@mnanimat.xyz, Líder de Propulsão, Motor KNDX, +55 41 99881-2233"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />

            <div className="flex justify-between items-center pt-2">
              <input
                type="file"
                accept=".csv,.txt"
                ref={fileInputRef}
                onChange={handleFileUploadCSV}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                Carregar Arquivo .CSV
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCsvImportModalOpen(false)}
                  className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleImportCsv}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow"
                >
                  Processar Importação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEMBER EDIT / NEW MODAL */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveMember} className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">
                {editingMember ? 'Editar Membro' : 'Cadastrar Novo Membro'}
              </h3>
              <button type="button" onClick={() => setIsMemberModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={memberForm.name || ''}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">E-mail Institucional</label>
                <input
                  type="email"
                  required
                  value={memberForm.email || ''}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Cargo / Título</label>
                  <input
                    type="text"
                    value={memberForm.role || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>

                {/* Área / Departamento com Opção de Digitar Área Personalizada */}
                <div className="space-y-1">
                  <label className="text-slate-400 block mb-1 flex items-center justify-between">
                    <span>Área / Departamento</span>
                    <span className="text-[10px] text-indigo-400">✏️ Personalizado</span>
                  </label>
                  <select
                    value={memberForm.departmentId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMemberForm({ ...memberForm, departmentId: val });
                      if (val !== 'custom') {
                        const d = departments.find((dep) => dep.id === val);
                        if (d) setCustomMemberDeptInput(d.name);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                    <option value="custom">✏️ Digitar Área Personalizada...</option>
                  </select>
                </div>
              </div>

              {/* Input direto para digitar Área Personalizada */}
              <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <label className="text-slate-300 text-[11px] font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1 text-indigo-400">
                    <Edit3 className="w-3 h-3" />
                    Nome da Área / Subsistema Personalizado:
                  </span>
                  <span className="text-[9px] text-slate-500">(Substitui a seleção)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Aviônica de Bordo / Telemetria LoRa / Testes de Bancada"
                  value={customMemberDeptInput}
                  onChange={(e) => {
                    setCustomMemberDeptInput(e.target.value);
                    if (memberForm.departmentId !== 'custom') {
                      setMemberForm({ ...memberForm, departmentId: 'custom' });
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg p-2 text-white outline-none text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setIsMemberModalOpen(false)} className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-xs">
                Cancelar
              </button>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold">
                Salvar Membro
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TASK EDIT / NEW MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSaveTask} className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">
                {selectedTaskForEdit ? 'Editar Tarefa' : 'Nova Tarefa no Planner'}
              </h3>
              <button type="button" onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Título da Tarefa</label>
                <input
                  type="text"
                  required
                  value={taskForm.title || ''}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              {/* Área / Subsistema & Responsável com opção de Área Personalizada */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Área / Subsistema */}
                <div className="space-y-1">
                  <label className="text-slate-400 block mb-1 font-semibold flex items-center justify-between">
                    <span>Área / Subsistema</span>
                    <span className="text-[10px] text-red-400">✏️ Personalizado</span>
                  </label>
                  <select
                    value={taskForm.departmentId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTaskForm({ ...taskForm, departmentId: val });
                      if (val !== 'custom') {
                        const d = departments.find((dep) => dep.id === val);
                        if (d) setCustomTaskDeptInput(d.name);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-red-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                    <option value="custom">✏️ Digitar Área Personalizada...</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Ou digite a área personalizada..."
                    value={customTaskDeptInput}
                    onChange={(e) => {
                      setCustomTaskDeptInput(e.target.value);
                      if (taskForm.departmentId !== 'custom') {
                        setTaskForm({ ...taskForm, departmentId: 'custom' });
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-lg p-2 text-white outline-none text-xs"
                  />
                </div>

                {/* Responsável da Tarefa */}
                <div className="space-y-1">
                  <label className="text-slate-400 block mb-1 font-semibold flex items-center justify-between">
                    <span>Responsável</span>
                    <span className="text-[10px] text-red-400">✏️ Personalizado</span>
                  </label>
                  <select
                    value={taskForm.assignee}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTaskForm({ ...taskForm, assignee: val });
                      if (val !== 'custom') {
                        setCustomTaskAssigneeInput(val);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-red-500"
                  >
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                    <option value="custom">✏️ Digitar Responsável Personalizado...</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Ou digite o responsável..."
                    value={customTaskAssigneeInput}
                    onChange={(e) => {
                      setCustomTaskAssigneeInput(e.target.value);
                      setTaskForm({ ...taskForm, assignee: e.target.value });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-lg p-2 text-white outline-none text-xs"
                  />
                </div>
              </div>

              {/* Status & Prioridade */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Status</label>
                  <select
                    value={taskForm.status || 'A Fazer'}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-red-500"
                  >
                    <option value="A Fazer">A Fazer</option>
                    <option value="Em Progresso">Em Progresso</option>
                    <option value="Em Teste">Em Teste</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Prioridade</label>
                  <select
                    value={taskForm.priority || 'Alta'}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-red-500"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Data de Início</label>
                  <input
                    type="date"
                    value={taskForm.startDate}
                    onChange={(e) => setTaskForm({ ...taskForm, startDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Horário Início</label>
                  <input
                    type="time"
                    value={taskForm.startTime}
                    onChange={(e) => setTaskForm({ ...taskForm, startTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Data de Término</label>
                  <input
                    type="date"
                    value={taskForm.endDate}
                    onChange={(e) => setTaskForm({ ...taskForm, endDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Horário Término</label>
                  <input
                    type="time"
                    value={taskForm.endTime}
                    onChange={(e) => setTaskForm({ ...taskForm, endTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setIsTaskModalOpen(false)} className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-xs">
                Cancelar
              </button>
              <button type="submit" className="bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold">
                Salvar Tarefa
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DEPARTMENT EDIT / NEW MODAL */}
      {isDepartmentModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveDepartment} className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-blue-400" />
                {editingDepartment ? 'Editar Área / Subsistema' : 'Personalizar Nova Área / Subsistema'}
              </h3>
              <button type="button" onClick={() => setIsDepartmentModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Nome da Área / Subsistema</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Propulsão Líquida / Aviônica Embarcada / Recuperação"
                  value={departmentForm.name || ''}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Código Curto (3-4 Letras)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="Ex: PROP / AVIO"
                    value={departmentForm.code || ''}
                    onChange={(e) => setDepartmentForm({ ...departmentForm, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white uppercase focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Cor de Identificação</label>
                  <input
                    type="color"
                    value={departmentForm.color || '#3b82f6'}
                    onChange={(e) => setDepartmentForm({ ...departmentForm, color: e.target.value })}
                    className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg p-1 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Líder do Subsistema</label>
                  <input
                    type="text"
                    placeholder="Nome do responsável"
                    value={departmentForm.leader || ''}
                    onChange={(e) => setDepartmentForm({ ...departmentForm, leader: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Orçamento Alocado (R$)</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={departmentForm.budgetAllocated || 0}
                    onChange={(e) => setDepartmentForm({ ...departmentForm, budgetAllocated: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Descrição Técnica</label>
                <textarea
                  rows={2}
                  placeholder="Atribuições e responsabilidades do subsistema..."
                  value={departmentForm.description || ''}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-blue-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setIsDepartmentModalOpen(false)} className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-xs">
                Cancelar
              </button>
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow">
                Salvar Área
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Clear Data Modal */}
      <ClearDataModal
        isOpen={isClearDataOpen}
        onClose={() => setIsClearDataOpen(false)}
      />
    </div>
  );
};
