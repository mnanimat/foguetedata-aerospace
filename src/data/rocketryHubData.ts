// Data structures and pre-populated initial data for the Aerospace Community Hub,
// Rocketry Teams, Sponsors, Forum, CVs, Competitions, and Cloudflare Pages sync.

export type TeamCategory = 'ensino_medio' | 'universitaria' | 'equipe_independente';

export interface TeamMemberItem {
  id: string;
  name: string;
  role: string; // ex: Capitão, Diretor de Propulsão, Eletrônica
  curriculumSummary?: string;
  email?: string;
  phone?: string;
  driveCvLink?: string;
}

export interface RocketryTeam {
  id: string;
  name: string;
  category: TeamCategory;
  categoryLabel: string;
  institution: string;
  cityState: string;
  slogan: string;
  description: string;
  history?: string;
  achievements?: string[];
  members: TeamMemberItem[];
  // Contatos opcionais
  contactEmail?: string;
  whatsapp?: string;
  phone?: string;
  socialInstagram?: string;
  socialLinkedin?: string;
  website?: string;
  // Apoio Financeiro e Patrocínio
  pixKey?: string;
  bankDetails?: string;
  sponsorshipContactName?: string;
  sponsorshipContactEmail?: string;
  sponsorshipContactPhone?: string;
  requestedSupportTypes: string[]; // ["Apoio Financeiro", "Peças & Componentes", "Impressão 3D", "Usinagem CNC", "Fibras de Carbono"]
  sponsorshipNeedsDescription?: string;
  // Google Drive Links
  driveSponsorshipKitUrl?: string; // Cotas de patrocínio / Media Kit
  driveAcademicPapersUrl?: string; // Artigos acadêmicos e relatórios
  driveRocketBannersUrl?: string; // Banner dos foguetes, pôsteres e fotos
  driveCadTelemetryFolderUrl?: string; // CADs e telemetrias
  updatedAt: string;
}

export interface SponsorCompany {
  id: string;
  companyName: string;
  industrySector: string;
  contactEmail: string;
  whatsapp?: string;
  phone?: string;
  website?: string;
  targetCategories: TeamCategory[];
  offeredSponsorshipTypes: string[];
  description: string;
  driveCompanyMaterialUrl?: string;
  updatedAt: string;
}

export interface CompetitionItem {
  id: string;
  name: string;
  scope: 'nacional' | 'internacional';
  organizer: string;
  location: string;
  allowedCategories: TeamCategory[];
  altitudeClasses: string[];
  dateOrSeason: string;
  description: string;
  officialWebsite?: string;
  driveRulesFolderUrl?: string;
  status: 'Inscrições Abertas' | 'Planejamento Anual' | 'Fase de Relatórios';
  updatedAt: string;
}

export interface AerospaceCurriculum {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  location: string;
  roleCategory: string;
  institution: string;
  academicDegree: string;
  summaryBio: string;
  rocketryExperience: string;
  skills: string[];
  driveCvUrl?: string;
  updatedAt: string;
}

export interface ForumReply {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
  driveLink?: string;
}

export interface ForumThread {
  id: string;
  title: string;
  category: 'propulsao' | 'eletronica' | 'aerodinamica' | 'regulamentacao' | 'patrocinios' | 'geral';
  categoryLabel: string;
  authorName: string;
  authorRole: string;
  authorTeam?: string;
  content: string;
  driveAttachmentUrl?: string;
  createdAt: string;
  likesCount: number;
  replies: ForumReply[];
}

export interface CloudflareSyncState {
  lastSyncedAt: string;
  endpointUrl: string;
  deploymentStatus: 'HOSTED_ON_CLOUDFLARE_PAGES' | 'SYNCED' | 'LOCAL_CACHE';
  syncCount: number;
}

// Initial Pre-Populated Database for instantly rich usage
export const DEFAULT_TEAMS: RocketryTeam[] = [
  {
    id: 'team-minerva-01',
    name: 'Equipe Minerva Rockets',
    category: 'universitaria',
    categoryLabel: 'Universitária',
    institution: 'Universidade Federal do Rio de Janeiro (UFRJ)',
    cityState: 'Rio de Janeiro, RJ',
    slogan: 'Inovação e Precisão Aerodinâmica em Altitude Elevada',
    description: 'Equipe de foguetemodelismo universitária focada no desenvolvimento de minifoguetes de propelente sólido e híbrido, com aviônica modular embarcada.',
    history: 'Fundada em 2018 por estudantes de Engenharia Mecânica e Eletrônica. Conquistou múltiplos pódios em festivais nacionais com apogeu superior a 3.000 metros.',
    achievements: [
      '1º Lugar Geral no Festival de Minifoguetes - Categoria 1Km Apogeu',
      'Maior Precisão de Apogeu com Telemetria LoRa em Tempo Real',
      'Artigo Publicado em Congresso Latino-Americano de Engenharia Aeroespacial'
    ],
    members: [
      {
        id: 'm1',
        name: 'Ana Luíza Ferreira',
        role: 'Capitã da Equipe',
        curriculumSummary: 'Estudante do 9º período de Eng. Aeroespacial. Especialista em Gestão e Integração de Sistemas.',
        email: 'ana.ferreira@minervarockets.org',
        driveCvLink: 'https://drive.google.com/file/d/example_ana_cv/view'
      },
      {
        id: 'm2',
        name: 'Lucas Gabriel Mendes',
        role: 'Diretor de Propulsão',
        curriculumSummary: 'Pesquisador de propelentes compósitos KNSB/KNDX e caracterização estática de motores.',
        email: 'lucas.mendes@minervarockets.org',
        driveCvLink: 'https://drive.google.com/file/d/example_lucas_cv/view'
      },
      {
        id: 'm3',
        name: 'Mateus Oliveira',
        role: 'Projetista de Aviônica & Sensores',
        curriculumSummary: 'Desenvolvedor de placas PCB de 4 camadas para telemetria LoRa + GPS + Altímetro duplo.',
        email: 'mateus.eletronica@minervarockets.org'
      }
    ],
    contactEmail: 'contato@minervarockets.org',
    whatsapp: '+55 21 99887-6543',
    phone: '+55 21 3938-0000',
    socialInstagram: '@minervarockets',
    socialLinkedin: 'linkedin.com/company/minervarockets',
    website: 'https://minervarockets.org',
    pixKey: 'contato@minervarockets.org (Pix CNPJ/E-mail)',
    bankDetails: 'Banco do Brasil | Ag: 1234-5 | C/C: 98765-4',
    sponsorshipContactName: 'Ana Luíza Ferreira (Capitã)',
    sponsorshipContactEmail: 'patrocinio@minervarockets.org',
    sponsorshipContactPhone: '+55 21 99887-6543',
    requestedSupportTypes: ['Apoio Financeiro', 'Usinagem CNC de Alumínio', 'Filamentos de Fibra de Carbono', 'Doação de Componentes Eletrônicos'],
    sponsorshipNeedsDescription: 'Buscamos parceiros para custear viagens a competições nacionais e usinagem de bocais de grafite e retentores de alumínio 6061-T6.',
    driveSponsorshipKitUrl: 'https://drive.google.com/drive/folders/cota_patrocinio_minerva_2026',
    driveAcademicPapersUrl: 'https://drive.google.com/drive/folders/artigos_tecnicos_minerva',
    driveRocketBannersUrl: 'https://drive.google.com/drive/folders/banners_e_fotos_foguete_minerva',
    driveCadTelemetryFolderUrl: 'https://drive.google.com/drive/folders/cads_step_telemetria_minerva',
    updatedAt: '2026-08-15 14:30'
  },
  {
    id: 'team-ifpr-02',
    name: 'Minifoguetes IFPR Curitiba',
    category: 'ensino_medio',
    categoryLabel: 'Ensino Médio',
    institution: 'Instituto Federal do Paraná (IFPR - Campus Curitiba)',
    cityState: 'Curitiba, PR',
    slogan: 'Ciência, Tecnologia e Paixão Aeroespacial desde o Ensino Técnico',
    description: 'Equipe de alunos do ensino técnico integrado em Eletrônica e Mecânica focados em minifoguetes de classe A até E com coifas impressas em 3D e ejetores barométricos.',
    history: 'Iniciada em 2021 dentro do laboratório de física do IFPR. Já lançou mais de 45 minifoguetes experimentais com taxa de recuperação com paraquedas superior a 95%.',
    achievements: [
      'Pódio na OBA / Mostra Brasileira de Foguetes (MOBFOG)',
      'Troféu Inovação em Recuperação por Paraquedas Toroidal',
      'Desenvolvimento de Bancada Estática de Carga Celular Didática'
    ],
    members: [
      {
        id: 'if1',
        name: 'Guilherme Santos',
        role: 'Líder Técnico Aluno',
        curriculumSummary: 'Aluno do 4º ano do Técnico em Eletrônica. Programador C++ para microcontroladores ESP32.',
        email: 'guilherme.ifpr@foguetes.edu.br'
      },
      {
        id: 'if2',
        name: 'Prof. Dr. Roberto Camargo',
        role: 'Professor Orientador',
        curriculumSummary: 'Doutor em Engenharia Mecânica e orientador de projetos de extensão aeroespacial.',
        email: 'roberto.camargo@ifpr.edu.br'
      }
    ],
    contactEmail: 'minifoguetes.curitiba@ifpr.edu.br',
    whatsapp: '+55 41 99123-4567',
    phone: '+55 41 3535-1000',
    socialInstagram: '@minifoguetes_ifpr',
    pixKey: 'minifoguetes.curitiba@ifpr.edu.br',
    sponsorshipContactName: 'Prof. Dr. Roberto Camargo',
    sponsorshipContactEmail: 'roberto.camargo@ifpr.edu.br',
    sponsorshipContactPhone: '+55 41 99123-4567',
    requestedSupportTypes: ['Componentes Eletrônicos (BMP280/LoRa)', 'Filamentos PLA/PETG para Impressão 3D', 'Tecido Nylon Ripstop para Paraquedas'],
    sponsorshipNeedsDescription: 'Necessitamos de insumos para confecção de 10 novos minifoguetes didáticos para workshops em escolas públicas da região.',
    driveSponsorshipKitUrl: 'https://drive.google.com/drive/folders/cota_patrocinio_ifpr_2026',
    driveAcademicPapersUrl: 'https://drive.google.com/drive/folders/relatorios_tecnicos_ifpr',
    driveRocketBannersUrl: 'https://drive.google.com/drive/folders/fotos_e_banners_ifpr',
    driveCadTelemetryFolderUrl: 'https://drive.google.com/drive/folders/cads_3d_ifpr',
    updatedAt: '2026-08-16 10:15'
  },
  {
    id: 'team-indep-astra-03',
    name: 'Grupo de Foguetes Astra Space',
    category: 'equipe_independente',
    categoryLabel: 'Equipe Independente',
    institution: 'Laboratório Comunitário de Foguetemodelismo',
    cityState: 'São José dos Campos, SP',
    slogan: 'Foguetemodelismo Experimental Aberto e Colaborativo',
    description: 'Coletivo independente de engenheiros, hobistas e entusiastas aeroespaciais que desenvolvem motores experimentais de propelente líquido/híbrido e foguetes de sondagem.',
    history: 'Criada em 2022 para reunir profissionais da indústria aeroespacial de SJC e entusiastas independentes sem vínculo universitário direto.',
    achievements: [
      'Primeiro teste estático com sucesso de motor híbrido Oxigênio/Parafina 500N',
      'Sistema Open-Source de Estação de Solo com Antena Yagi Rastreadora',
      'Lançamento com Apogeu de 2.200m gravado com câmera On-Board 4K'
    ],
    members: [
      {
        id: 'ast1',
        name: 'Rafael ' + 'Vargas',
        role: 'Projetista de Propulsão Híbrida',
        curriculumSummary: 'Engenheiro Mecânico com experiência em sistemas de válvulas solenoides e injeção de oxidante.',
        email: 'rafael@astraspace.org'
      },
      {
        id: 'ast2',
        name: 'Beatriz Lima',
        role: 'Engenheira de Estruturas & Compósitos',
        curriculumSummary: 'Especialista em laminação de tubos de fibra de carbono com resina epóxi para alta pressão.',
        email: 'beatriz@astraspace.org'
      }
    ],
    contactEmail: 'contato@astraspace.org',
    whatsapp: '+55 12 98877-1122',
    socialInstagram: '@astraspace_indep',
    socialLinkedin: 'linkedin.com/company/astra-space-indep',
    pixKey: 'pix@astraspace.org',
    sponsorshipContactName: 'Rafael Vargas',
    sponsorshipContactEmail: 'financeiro@astraspace.org',
    sponsorshipContactPhone: '+55 12 98877-1122',
    requestedSupportTypes: ['Apoio Financeiro', 'Serviço de Corte a Laser / Usinagem', 'Válvulas Solenoides e Sensores de Pressão', 'Servidor Cloud / Hospedagem'],
    sponsorshipNeedsDescription: 'Procuramos empresas parceiras dispostas a fornecer sensores industriais de pressão e financiamento para ensaios estáticos com segurança.',
    driveSponsorshipKitUrl: 'https://drive.google.com/drive/folders/cota_patrocinio_astra_space',
    driveAcademicPapersUrl: 'https://drive.google.com/drive/folders/artigos_propulsao_hibrida_astra',
    driveRocketBannersUrl: 'https://drive.google.com/drive/folders/banners_e_fotos_astra',
    driveCadTelemetryFolderUrl: 'https://drive.google.com/drive/folders/cad_e_telemetria_astra',
    updatedAt: '2026-08-14 18:40'
  }
];

export const DEFAULT_SPONSORS: SponsorCompany[] = [
  {
    id: 'spon-01',
    companyName: 'AeroTech Usinagem CNC & Precisão',
    industrySector: 'Usinagem CNC & Usinagem de Precisão',
    contactEmail: 'patrocinios@aerotechcnc.com.br',
    whatsapp: '+55 11 97766-5544',
    phone: '+55 11 4004-9000',
    website: 'https://aerotechcnc.com.br',
    targetCategories: ['ensino_medio', 'universitaria', 'equipe_independente'],
    offeredSponsorshipTypes: ['Serviço de Usinagem Gratuito em Alumínio 6061/7075', 'Doação de Retentores e Bocais', 'Desconto Técnico'],
    description: 'Empresa especializada em usinagem CNC de precisão para o setor industrial e aeroespacial. Apoia de forma recorrente equipes de minifoguetes fornecendo usinagem gratuita de blocos de motores, coifas de alumínio e flanges.',
    driveCompanyMaterialUrl: 'https://drive.google.com/drive/folders/catalogo_e_criterios_patrocinio_aerotech',
    updatedAt: '2026-08-15 11:00'
  },
  {
    id: 'spon-02',
    companyName: 'PrintSpace 3D & Filamentos Avançados',
    industrySector: 'Manufatura Aditiva & Impressão 3D',
    contactEmail: 'contato@printspace3d.com.br',
    whatsapp: '+55 41 98811-2233',
    website: 'https://printspace3d.com.br',
    targetCategories: ['ensino_medio', 'universitaria'],
    offeredSponsorshipTypes: ['Doação de Rolos de Filamento Nylon-Carbono & PETG', 'Desconto de 40% em Insumos', 'Suporte Técnico em Fatiadores'],
    description: 'Fornecedora de filamentos industriais reforçados com fibra de carbono, policarbonato e ABS de alta temperatura. Oferecemos cotas de filamentos para prototipagem de aletas e ejetores de paraquedas.',
    driveCompanyMaterialUrl: 'https://drive.google.com/drive/folders/programa_apoio_estudantil_printspace3d',
    updatedAt: '2026-08-12 16:20'
  },
  {
    id: 'spon-03',
    companyName: 'Altair Systems & Eletrônica Embarcada',
    industrySector: 'Componentes Eletrônicos & Placas de Circuito Impresso',
    contactEmail: 'parcerias@altair-systems.com',
    whatsapp: '+55 19 99123-9988',
    website: 'https://altair-systems.com',
    targetCategories: ['universitaria', 'equipe_independente'],
    offeredSponsorshipTypes: ['Patrocínio Financeiro', 'Fabricação Gratuita de Placas PCB 4 Camadas', 'Fornecimento de Módulos LoRa e GPS'],
    description: 'Desenvolvedora de soluções aviônicas e prototipagem eletrônica. Incentiva projetos de telemetria avançada e sensoriamento de foguetes com suporte financeiro direto e fabricação de circuitos impressos.',
    driveCompanyMaterialUrl: 'https://drive.google.com/drive/folders/editais_altair_sponsorship',
    updatedAt: '2026-08-10 09:45'
  }
];

export const DEFAULT_COMPETITIONS: CompetitionItem[] = [
  {
    id: 'comp-01',
    name: 'Festival de Minifoguetes (BAR-AEB)',
    scope: 'nacional',
    organizer: 'Associação Brasileira de Minifoguetes (BAR) & AEB',
    location: 'Curitiba, PR - Brasil',
    allowedCategories: ['ensino_medio', 'universitaria', 'equipe_independente'],
    altitudeClasses: ['100m Apogeu', '500m Apogeu', '1.000m Apogeu', '3.000m Apogeu', 'Carga Útil CanSat'],
    dateOrSeason: 'Maio / Anual',
    description: 'A maior competição e encontro científico de minifoguetes do Brasil. Reúne equipes do ensino médio, universidades e grupos independentes em testes de apogeu, precisão de altitude e inovação de recuperação.',
    officialWebsite: 'https://minifoguete.com.br',
    driveRulesFolderUrl: 'https://drive.google.com/drive/folders/regulamento_oficial_festival_minifoguetes',
    status: 'Inscrições Abertas',
    updatedAt: '2026-08-16 08:00'
  },
  {
    id: 'comp-02',
    name: 'Spaceport America Cup (SAC / IREC)',
    scope: 'internacional',
    organizer: 'Experimental Sounding Rocket Association (ESRA)',
    location: 'Spaceport America, Novo México - EUA',
    allowedCategories: ['universitaria'],
    altitudeClasses: ['10.000 ft (3.048m) Commercial Motor', '10.000 ft Student Motor', '30.000 ft (9.144m) Hybrid/Liquid'],
    dateOrSeason: 'Junho / Anual',
    description: 'A maior competição universitária de engenharia de foguetes de sondagem do planeta, reunindo mais de 150 universidades do mundo todo para lançamentos em altitude extrema na bacia do deserto do Novo México.',
    officialWebsite: 'https://spaceportamericacup.com',
    driveRulesFolderUrl: 'https://drive.google.com/drive/folders/sac_irec_official_rules_and_safety_guides',
    status: 'Planejamento Anual',
    updatedAt: '2026-08-14 12:30'
  },
  {
    id: 'comp-03',
    name: 'Latin American Space Challenge (LASC)',
    scope: 'internacional',
    organizer: 'LASC Organization & AgroSpace',
    location: 'Tatuí, São Paulo - Brasil',
    allowedCategories: ['ensino_medio', 'universitaria', 'equipe_independente'],
    altitudeClasses: ['0.5km Rocketry', '1km Rocketry', '3km Rocketry', 'Satellites & CanSat'],
    dateOrSeason: 'Agosto / Anual',
    description: 'O maior desafio de engenharia espacial e minifoguetes da América Latina. Avalia rigorosamente relatórios de engenharia, teste de carga útil e performance de voo.',
    officialWebsite: 'https://lasc.space',
    driveRulesFolderUrl: 'https://drive.google.com/drive/folders/lasc_rules_and_flight_safety_manuals',
    status: 'Fase de Relatórios',
    updatedAt: '2026-08-11 15:10'
  },
  {
    id: 'comp-04',
    name: 'Competição CajuSpace',
    scope: 'nacional',
    organizer: 'Grupo CajuSpace & Universidade Federal de Sergipe',
    location: 'Aracaju, Sergipe - Brasil',
    allowedCategories: ['ensino_medio', 'universitaria'],
    altitudeClasses: ['200m Apogeu', '500m Apogeu', 'Foguetes de Garrafa PET com Aviônica'],
    dateOrSeason: 'Outubro / Anual',
    description: 'Competição regional e nacional focada no incentivo à ciência espacial para estudantes do ensino fundamental, médio e universitário no Nordeste do Brasil.',
    officialWebsite: 'https://cajuspace.com.br',
    driveRulesFolderUrl: 'https://drive.google.com/drive/folders/regulamentos_cajuspace_edicao_2026',
    status: 'Inscrições Abertas',
    updatedAt: '2026-08-09 11:40'
  }
];

export const DEFAULT_CURRICULA: AerospaceCurriculum[] = [
  {
    id: 'cv-01',
    fullName: 'Lucas Gabriel Mendes',
    email: 'lucas.mendes@minervarockets.org',
    phone: '+55 21 99887-6543',
    whatsapp: '+55 21 99887-6543',
    location: 'Rio de Janeiro, RJ',
    roleCategory: 'Engenheiro de Propulsão',
    institution: 'UFRJ - Universidade Federal do Rio de Janeiro',
    academicDegree: 'Engenharia Aeroespacial (8º Período)',
    summaryBio: 'Pesquisador focado em termodinâmica de motores de minifoguetes de propelente sólido (KNSB/KNDX) e caracterização experimental de empuxo com célula de carga.',
    rocketryExperience: '4 anos na Equipe Minerva Rockets como Diretor de Propulsão. Realizou mais de 25 queimadas em bancada estática com aquisição de dados via Arduino/Python.',
    skills: ['Análise de Bocal De Laval', 'Simulação OpenRocket / BurnSim', 'Mistura e Fundição de KNSB', 'Aquisição de Dados LabVIEW/Python', 'Modelagem SolidWorks'],
    driveCvUrl: 'https://drive.google.com/file/d/cv_lucas_mendes_aeroespacial/view',
    updatedAt: '2026-08-15 14:00'
  },
  {
    id: 'cv-02',
    fullName: 'Mariana Rocha Alencar',
    email: 'mariana.rocha@aerospacetalent.com',
    whatsapp: '+55 11 97654-3210',
    location: 'São José dos Campos, SP',
    roleCategory: 'Engenheira de Aviônica & Software',
    institution: 'ITA / UNESP',
    academicDegree: 'Mestrado em Engenharia Eletrônica',
    summaryBio: 'Desenvolvedora de placas de circuito impresso de telemetria redundante para minifoguetes, integrando acelerômetros, barômetros e transmissão em rádio frequência 915 MHz.',
    rocketryExperience: 'Desenvolveu o altímetro e ejetor duplo para 3 equipes universitárias de SP. Autora de firmware em C++ com RTOS e algoritmos de filtro de Kalman para apogeu.',
    skills: ['Layout de PCB (KiCad / Altium)', 'Firmware ESP32 / STM32 (C++)', 'Filtro de Kalman para Telemetria', 'Protocolo LoRaWAN', 'Antenas Yagi & Rastreamento'],
    driveCvUrl: 'https://drive.google.com/file/d/cv_mariana_rocha_eletronica/view',
    updatedAt: '2026-08-16 09:30'
  }
];

export const DEFAULT_FORUM_THREADS: ForumThread[] = [
  {
    id: 'th-01',
    title: 'Como otimizar a razão de expansão do bocal De Laval para KNSB em altitude de 1.000m?',
    category: 'propulsao',
    categoryLabel: 'Propulsão & Motores',
    authorName: 'Lucas Gabriel Mendes',
    authorRole: 'Engenheiro de Propulsão',
    authorTeam: 'Equipe Minerva Rockets',
    content: 'Olá pessoal da comunidade! Estamos projetando um motor de classe I de propelente KNSB com pressão de câmara em 40 bar. Gostaria de discutir com os colegas a razão de área de garganta para saída (Ae/Ath) ideal considerando a variação da pressão atmosférica entre o solo e 1.000m de altitude. Deixei nossa planilha de cálculo no Drive!',
    driveAttachmentUrl: 'https://drive.google.com/file/d/planilha_calculo_bocal_knsb/view',
    createdAt: '2026-08-15 16:45',
    likesCount: 12,
    replies: [
      {
        id: 'rep-01',
        authorName: 'Rafael Vargas',
        authorRole: 'Projetista de Propulsão',
        content: 'Excelente dúvida Lucas! Para KNSB a 40 bar em 1km, costumamos utilizar a razão de expansão próxima a 4.8 a 5.2 para evitar sub-expansão excessiva na decolagem. Verifiquei sua planilha e os coeficientes de empuxo estão condizentes com os ensaios estáticos.',
        createdAt: '2026-08-15 18:20'
      }
    ]
  },
  {
    id: 'th-02',
    title: 'Guia Prático: Como configurar transmissão de telemetria LoRa 915MHz sem perda de pacotes durante a rápida subida',
    category: 'eletronica',
    categoryLabel: 'Aviônica & Sensores',
    authorName: 'Mariana Rocha Alencar',
    authorRole: 'Engenheira de Aviônica',
    content: 'Compartilho com as equipes de Ensino Médio e Universitárias o mapa de registradores e taxas de amostragem que usamos no SX1276/RFM95W para evitar corrupção por Doopler e aceleração elevada no ejetor.',
    driveAttachmentUrl: 'https://drive.google.com/file/d/guia_telemetria_lora_sem_perdas/view',
    createdAt: '2026-08-14 10:10',
    likesCount: 19,
    replies: []
  }
];

// Cloudflare Pages Storage & Sync Keys
const LOCAL_STORAGE_KEY = 'foguetedata_cloudflare_pages_hub_v2';

export interface HubStoragePayload {
  teams: RocketryTeam[];
  sponsors: SponsorCompany[];
  competitions: CompetitionItem[];
  curricula: AerospaceCurriculum[];
  threads: ForumThread[];
  syncState: CloudflareSyncState;
}

export function loadHubDataFromStorage(): HubStoragePayload {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        teams: parsed.teams || DEFAULT_TEAMS,
        sponsors: parsed.sponsors || DEFAULT_SPONSORS,
        competitions: parsed.competitions || DEFAULT_COMPETITIONS,
        curricula: parsed.curricula || DEFAULT_CURRICULA,
        threads: parsed.threads || DEFAULT_FORUM_THREADS,
        syncState: parsed.syncState || {
          lastSyncedAt: new Date().toLocaleString('pt-BR'),
          endpointUrl: 'https://foguetedata.pages.dev/api/v1/sync',
          deploymentStatus: 'HOSTED_ON_CLOUDFLARE_PAGES',
          syncCount: 1
        }
      };
    }
  } catch (e) {
    console.error('Error loading Cloudflare Pages hub storage:', e);
  }

  return {
    teams: DEFAULT_TEAMS,
    sponsors: DEFAULT_SPONSORS,
    competitions: DEFAULT_COMPETITIONS,
    curricula: DEFAULT_CURRICULA,
    threads: DEFAULT_FORUM_THREADS,
    syncState: {
      lastSyncedAt: new Date().toLocaleString('pt-BR'),
      endpointUrl: 'https://foguetedata.pages.dev/api/v1/sync',
      deploymentStatus: 'HOSTED_ON_CLOUDFLARE_PAGES',
      syncCount: 1
    }
  };
}

export function saveHubDataToStorage(data: HubStoragePayload): void {
  try {
    const updatedPayload: HubStoragePayload = {
      ...data,
      syncState: {
        ...data.syncState,
        lastSyncedAt: new Date().toLocaleString('pt-BR'),
        syncCount: (data.syncState.syncCount || 0) + 1,
        deploymentStatus: 'HOSTED_ON_CLOUDFLARE_PAGES'
      }
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPayload));
  } catch (e) {
    console.error('Error writing to Cloudflare Pages storage:', e);
  }
}
