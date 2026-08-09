export interface RocketSubsystemInfo {
  id: string;
  name: string;
  category: 'Estrutura' | 'Propulsão' | 'Eletrônica' | 'Recuperação';
  shortDesc: string;
  fullDetails: string;
  materialsOrComponents: string[];
  safetyNotes: string;
}

export const SUBSYSTEMS_DATA: RocketSubsystemInfo[] = [
  {
    id: 'coifa-nosecone',
    name: 'Coifa (Nosecone)',
    category: 'Estrutura',
    shortDesc: 'A ponta aerodinâmica projetada para minimizar a resistência do ar na fase de subida.',
    fullDetails: 'Responsável pela primeira penetração aerodinâmica. Formatos comuns incluem Parabólico, Ogival (VON KÁRMÁN), Cônico e Elíptico. O formato Von Kármán minimiza o arrasto em velocidades transônicas. Em foguetes experimentais, é produzida por impressão 3D (PETG/ABS), fibra de vidro ou polímero leve, e frequentemente abriga o altímetro e sensores de ponta.',
    materialsOrComponents: ['Fibra de Vidro', 'Polímero PETG/PLA', 'Alumínio usinado (para altas velocidades)', 'Resina Epóxi'],
    safetyNotes: 'Deve ter encaixe justo no tubo do corpo, porém suave o suficiente para permitir a ejeção por pressão positiva do sistema de recuperação sem travar.'
  },
  {
    id: 'tubo-corpo',
    name: 'Tubo do Corpo (Body Tube)',
    category: 'Estrutura',
    shortDesc: 'Estrutura cilíndrica principal que conecta a coifa, aviônica, carga útil e câmara de combustão.',
    fullDetails: 'Suporta as cargas estruturais de compressão durante a aceleração e momento fletor sob vento lateral. Deve ser perfeitamente cilíndrico e ter rigidez torsional. Em minifoguetes usam-se tubos de papelão espiralado Kraft tratados com selante; em foguetes amadores maiores utilizam-se compostos de fibra de vidro ou carbono enrolados a filament winding.',
    materialsOrComponents: ['Papelão Kraft Fenólico', 'Fibra de Carbono', 'Fibra de Vidro', 'Tubo Kraft Espiralado'],
    safetyNotes: 'Verifique trincas e delaminações após cada voo ou teste de ejeção estático.'
  },
  {
    id: 'aletas-estabilidade',
    name: 'Aletas de Estabilidade (Fins)',
    category: 'Estrutura',
    shortDesc: 'Superfícies aerodinâmicas traseiras que deslocam o Centro de Pressão (CP) atrás do Centro de Gravidade (CG).',
    fullDetails: 'Essenciais para garantir estabilidade estática e dinâmica durante o voo não guiado. O número de aletas costuma variar de 3 a 4 com perfis trapezoidais, elípticos ou retos com bordos de ataque chanfrados. O alinhamento angular preciso (<0.5º de desvio) é crucial para evitar rotações indesejadas (roll) em alta velocidade.',
    materialsOrComponents: ['Compensado de Balsa/Aeronáutico', 'Placa de Fibra de Vidro G10', 'Impressão 3D PETG Carbon', 'Alumínio 6061-T6'],
    safetyNotes: 'A estabilidade mínima exigida pela BAR/AEB é de 1.0 a 2.0 calibres (diâmetros do tubo) entre CG e CP.'
  },
  {
    id: 'propulsao-solida',
    name: 'Propulsão Sólida Ecológica & Sustentável (KNSU / KNDX / Biopolímeros)',
    category: 'Propulsão',
    shortDesc: 'Motor a combustível sólido eco-amigável com oxidante de baixo impacto e combustíveis de fontes renováveis.',
    fullDetails: 'O tipo mais difundido no foguetemodelismo experimental devido à segurança e sustentabilidade. Utiliza reagentes de baixa toxicidade de origem vegetal como Dextrose, Sacarose e Sorbitol (KNSB) combinados com Nitrato de Potássio. O grão BATES é moldado com ligantes biodegradáveis de origem vegetal e empacotado em casulos de polímeros recicláveis ou alumínio sustentável. A combustão gera cinzas neutras e vapor d\'água sem percloratos nocivos ao solo.',
    materialsOrComponents: ['KNSB (KNO3 + Sorbitol Renovável)', 'Dextrose e Sacarose de Origem Vegetal Sustentável', 'Aglomerante Biodegradável / Bio-Cera', 'Tubo/Case em Alumínio Reciclado ou Polímero PLA', 'Bocal de Grafite Reutilizável de Alta Durabilidade'],
    safetyNotes: 'A fusão dos compostos deve ser efetuada em banho-maria termostático com controle rígido de temperatura. Inofensivo ao solo e 100% biodegradável.'
  },
  {
    id: 'propulsao-hibrida',
    name: 'Propulsão Híbrida Sustentável (Cera de Abelha / Parafina Renovável + N2O)',
    category: 'Propulsão',
    shortDesc: 'Sistema ecológico de alta segurança com biocombustível sólido renovável e oxidante verde.',
    fullDetails: 'Combina máxima segurança inerente com pegada ecológica reduzida. Utiliza biocombustíveis sólidos naturais como Cera de Abelha purificada, Parafina renovável de origem vegetal ou PLA recoplado impresso em 3D, queimados com Óxido Nitroso (N2O) ou Peróxido de Hidrogênio verde. A combustão é limpa, livre de toxinas e cinzas pesadas, podendo ser interrompida instantaneamente pelo fechamento da válvula de oxidante.',
    materialsOrComponents: ['Biocombustível de Cera de Abelha Natural & Parafina Renovável', 'Grão Sólido em PLA Reciclado / Bio-HTPB', 'Oxidante Verde Óxido Nitroso (N2O) ou H2O2 Concentrado', 'Válvula Solenóide Reutilizável', 'Injetor de Inox Reciclável'],
    safetyNotes: 'Sistemas de oxidante liquefeito operam sob alta pressão (~50 bar). Utilizar válvulas de alívio térmico e checagem de estanqueidade pré-voo.'
  },
  {
    id: 'propulsao-liquida',
    name: 'Propulsão Líquida Verde & Ecológica (Bio-Etanol Renovável + LOX / H2O2)',
    category: 'Propulsão',
    shortDesc: 'Propulsão líquida de alto desempenho impulsionada por Bio-Etanol de cana-de-açúcar e oxidantes verdes.',
    fullDetails: 'Elimina combustíveis tóxicos tradicionais (como hidrazina ou tetróxido de nitrogênio) em favor do Bio-Etanol anidro nacional (derivado da cana-de-açúcar) com Oxigênio Líquido (LOX) ou Peróxido de Hidrogênio de alta concentração (Green Propellants). A combustão resulta primariamente em vapor d\'água e dióxido de carbono neutro. Câmaras de combustão são usinadas em ligas de cobre e alumínio 100% recicláveis com refrigeração regenerativa.',
    materialsOrComponents: ['Bio-Etanol Anidro Renovável de Cana-de-Açúcar (E96)', 'Oxigênio Líquido (LOX Verde - Subproduto Limpo)', 'Peróxido de Hidrogênio Concentrado (Green Propellant)', 'Câmara em Liga de Cobre/Alumínio 100% Reciclável', 'Valvulagem Pneumática Reutilizável'],
    safetyNotes: 'Exige equipamento de proteção criogênico (EPI) completo, checagem de vedação de tubulações e zona de teste isolada com raio de segurança conforme normas da AEB.'
  },
  {
    id: 'eletronica-altimetro',
    name: 'Computador de Voo e Altímetro de Precisão',
    category: 'Eletrônica',
    shortDesc: 'Unidade aviônica responsável por leitura barométrica/inercial, logging de dados e disparo do paraquedas.',
    fullDetails: 'Projetada em microcontroladores como ESP32, STM32 ou ATmega328P. Utiliza barômetros de altíssima precisão (BMP280 / MS5611) e IMU de 6 eixos (MPU6050 / ICM-20948) com filtro de Kalman em tempo real para detectar com exatidão a taxa de subida zero (Apogeu) e acionar os canais pirotécnicos via transistores MOSFET de alta corrente.',
    materialsOrComponents: ['Microcontrolador ESP32-S3', 'Sensor Barométrico MS5611/BMP280', 'IMU MPU6050', 'Transistores MOSFET N-Channel', 'Slot Cartão MicroSD'],
    safetyNotes: 'Implementar chave física de armamento (safety switch) instalada externamente no foguete, só armada na rampa de lançamento.'
  },
  {
    id: 'recuperacao-dual',
    name: 'Sistema de Recuperação Dupla (Drogue + Main)',
    category: 'Recuperação',
    shortDesc: 'Estratégia de dois estágios de paraquedas para conter o desvio pelo vento e pouso suave.',
    fullDetails: 'No apogeu (maior altitude), o altímetro aciona o ejetor do paraquedas piloto (Drogue - menor diâmetro), reduzindo a velocidade de queda para ~20 m/s e estabilizando a descendência sem que o vento arraste o foguete por quilômetros. Ao atingir uma altitude de segurança programada (ex: 150m do solo), o segundo canal aciona o paraquedas principal (Main Chute), reduzindo a velocidade para menos de 5 m/s para um toque suave no solo.',
    materialsOrComponents: ['Paraquedas Cruciforme em Nylon Ripstop', 'Linhas de Kevlar / Spectra', 'Ejetor de Pólvora Negra / Atuador C3', 'Pistão de Ejeção Térmico'],
    safetyNotes: 'Cálculo rigoroso da área da velatura ($A = \\frac{2 m g}{\\rho v^2 C_d}$) e testes de ejeção estática no solo são indispensáveis antes da montagem no foguete.'
  }
];

export const EXTERNAL_LINKS = {
  mnanimat3d: 'https://mnanimat.github.io/mnanimat3d',
  cadMnanimat: 'https://cad.mnanimat.xyz',
  fogueteUfprBlog: 'https://fogueteufpr.blogspot.com/',
  aebDriveFolder: 'https://drive.google.com/drive/folders/1-p2vv-CPYN58ABkRV371PNZVm7HUmpuQ?usp=sharing',
  nakkaRocketry: 'http://www.nakkas-space.com/',
  minifogueteYoutube: 'https://www.youtube.com/@Minifoguete'
};
