export interface TimelineStep {
  date: string;
  title: string;
  description: string;
  responsible: string;
  status: 'concluido' | 'em_andamento' | 'futuro';
}

export const MANUAL_TIMELINE: TimelineStep[] = [
  {
    date: '09 Ago 2026',
    title: 'Divulgação da Proposta e Esboço Inicial',
    description: 'Apresentação pública da proposta e tópicos essenciais do manual de boas práticas BAR-AEB.',
    responsible: 'Prof. Marchi / BAR / AEB',
    status: 'concluido'
  },
  {
    date: '20 Ago 2026',
    title: 'Submissão de Tópicos e Ajustes de Estrutura',
    description: 'Prazo para todos os fogueteiros e equipes sugerirem inclusão, junção ou eliminação de tópicos via minifoguete@gmail.com.',
    responsible: 'Comunidade e Fogueteiros do Brasil',
    status: 'em_andamento'
  },
  {
    date: '25 Ago 2026',
    title: 'Divulgação da Estrutura Definitiva dos Tópicos',
    description: 'Compilação e consolidação dos tópicos oficiais que comporão o índice do manual.',
    responsible: 'Prof. Carlos Henrique Marchi (UFPR)',
    status: 'futuro'
  },
  {
    date: '30 Set 2026',
    title: 'Candidatura de Coordenadores e Redação Inicial',
    description: 'Elaboração das primeiras seções e indicação de coordenadores com experiência técnica por área.',
    responsible: 'Todos os Colaboradores e Candidatos a Coordenadores',
    status: 'futuro'
  },
  {
    date: '31 Out 2026',
    title: 'Texto Inicial de Compatibilização',
    description: 'Unificação dos textos recepcionados em cada tópico para garantir consistência terminológica.',
    responsible: 'Coordenadores de Tópico',
    status: 'futuro'
  },
  {
    date: 'Novembro 2026',
    title: 'Debates Públicos e Transmissões ao Vivo (Lives)',
    description: 'Realização de transmissões abertas pelo Prof. Marchi para discussão ao vivo de cada capítulo.',
    responsible: 'Prof. Marchi & Comunidade',
    status: 'futuro'
  },
  {
    date: '31 Dez 2026',
    title: 'Ajustes Finais e Formação da Comissão Técnica BAR',
    description: 'Abertura para formação da nova Comissão Técnica e envio das últimas contribuições por e-mail.',
    responsible: 'Todos os Participantes',
    status: 'futuro'
  },
  {
    date: '28 Fev 2027',
    title: 'Sintese Pós-Debates Públicos',
    description: 'Compatibilização de todas as sugestões surgidas nas lives e interações da comunidade.',
    responsible: 'Coordenadores de Tópico',
    status: 'futuro'
  },
  {
    date: '31 Mar 2027',
    title: 'Versão Consolidada da Comissão Técnica',
    description: 'Revisão técnica completa e validação científica pela Comissão da BAR.',
    responsible: 'Comissão Técnica da BAR',
    status: 'futuro'
  },
  {
    date: 'Abril 2027',
    title: 'Homologação pela Diretoria da BAR',
    description: 'Aprovação institucional no âmbito da Associação Brasileira de Foguetemodelismo.',
    responsible: 'Diretoria da BAR',
    status: 'futuro'
  },
  {
    date: 'Maio 2027',
    title: 'Homologação Oficial pela AEB',
    description: 'Validação final e chancela governamental pela Agência Espacial Brasileira.',
    responsible: 'Agência Espacial Brasileira (AEB)',
    status: 'futuro'
  },
  {
    date: 'Junho 2027',
    title: 'Lançamento e Divulgação da 1ª Edição',
    description: 'Publicação oficial e gratuita da 1ª Edição do Manual BAR-AEB de Boas Práticas.',
    responsible: 'BAR & AEB',
    status: 'futuro'
  }
];

export const MANUAL_TOPICS_DRAFT = [
  {
    id: 'topico-1',
    category: 'Fundamentos e Terminologia',
    title: '1. Terminologia de Foguetemodelismo em Português',
    items: [
      'Nomenclatura oficial baseada na Norma BAR-2/2020',
      'Conceitos de Apogeu, Propelente, Impulso Total, Centro de Gravidade (CG) e Centro de Pressão (CP)',
      'Classificação de trajetórias: Vertical, Inclinada e Suborbital'
    ]
  },
  {
    id: 'topico-2',
    category: 'Orientação e Infraestrutura',
    title: '2. Como Iniciar no Foguetemodelismo e Infraestrutura',
    items: [
      'Guia para professores de ensino fundamental, médio e superior',
      'Orientação para grupos hobbistas e projetistas isolados',
      'Laboratório básico e avançado por classe de motor (1/8A até O)'
    ]
  },
  {
    id: 'topico-3',
    category: 'Propulsão e Materiais',
    title: '3. Propelentes, Materiais e Testes Estáticos',
    items: [
      'Propelentes permitidos (KNSU, KNDX, Sorbitol) e não recomendados',
      'Testes de resistência a quente em bancada e curvas de empuxo',
      'Procedimentos de segurança e descarte de resíduos'
    ]
  },
  {
    id: 'topico-4',
    category: 'Sistemas e Eletrônica',
    title: '4. Eletrônica, Localizadores e Recuperação',
    items: [
      'Altímetros e computadores de voo comerciais e open-hardware',
      'Telemetria LoRa, GPS tracker e sistemas de acionamento por ejetores',
      'Dimensionamento de paraquedas e testes de ejeção antes do voo'
    ]
  },
  {
    id: 'topico-5',
    category: 'Operações de Lançamento e Legislação',
    title: '5. Normas de Segurança, Raio de Afastamento e Autorização DECEA',
    items: [
      'Distâncias mínimas da plataforma: 500m de rodovias/habitações',
      'Restrições meteorológicas: vento max 30 km/h, visibilidade min 8 km',
      'Verificação de zonas de espaço aéreo (limite 120m sem autorização prévia)'
    ]
  }
];

export const MOTOR_CLASSIFICATION_TABLE = [
  { class: '1/8A', impulse: '< 0.3125 Ns', category: 'Minifoguete' },
  { class: '1/4A', impulse: '0.3125 – 0.625 Ns', category: 'Minifoguete' },
  { class: '1/2A', impulse: '0.625 – 1.25 Ns', category: 'Minifoguete' },
  { class: 'A', impulse: '1.25 – 2.5 Ns', category: 'Minifoguete' },
  { class: 'B', impulse: '2.5 – 5.0 Ns', category: 'Minifoguete' },
  { class: 'C', impulse: '5.0 – 10.0 Ns', category: 'Minifoguete' },
  { class: 'D', impulse: '10.0 – 20.0 Ns', category: 'Minifoguete' },
  { class: 'E', impulse: '20.0 – 40.0 Ns', category: 'Minifoguete' },
  { class: 'F', impulse: '40.0 – 80.0 Ns', category: 'Minifoguete' },
  { class: 'G', impulse: '80.0 – 160.0 Ns', category: 'Minifoguete (Limite Classe 1)' },
  { class: 'H', impulse: '160 – 320 Ns', category: 'Foguete Amador (Classe 2)' },
  { class: 'I', impulse: '320 – 640 Ns', category: 'Foguete Amador (Classe 2)' },
  { class: 'J', impulse: '640 – 1280 Ns', category: 'Foguete Amador (Classe 2)' },
  { class: 'K', impulse: '1280 – 2560 Ns', category: 'Foguete Amador (Classe 2)' },
  { class: 'L', impulse: '2560 – 5120 Ns', category: 'Foguete Amador (Classe 2)' },
  { class: 'M', impulse: '5120 – 10240 Ns', category: 'Foguete Amador (Classe 2)' },
  { class: 'N', impulse: '10240 – 20480 Ns', category: 'Foguete Amador (Classe 2)' },
  { class: 'O', impulse: '20480 – 40960 Ns', category: 'Foguete Amador (Classe 2 Máx)' }
];
