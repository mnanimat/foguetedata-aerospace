export type ActiveTab = 
  | 'home'
  | 'trajectory'
  | 'telemetry'
  | 'subsystems'
  | 'electronics'
  | 'manual_bar_aeb'
  | 'team'
  | 'community'
  | 'cad_repository'
  | 'satellite'
  | 'hub_aeroespacial'
  | 'legal';

export interface SatellitePayloadConfig {
  id: string;
  name: string;
  formFactor: '1U' | '2U' | '3U' | '6U' | 'PocketQube' | 'CustomCanister';
  totalMassKg: number;
  widthCm: number;
  heightCm: number;
  lengthCm: number;
  structureMaterial: 'aluminum_6061' | 'carbon_fiber' | 'titanium';
  solarCellsType: 'triple_junction_gaas' | 'silicon_monocrystalline' | 'none';
  deployableSolarWings: boolean;
  batteryCapacityWh: number;
  obcProcessor: string;
  commBand: 'UHF/VHF' | 'S-Band' | 'X-Band';
  adcsType: 'passive_magnet' | 'magnetorquers_3axis' | 'reaction_wheels_3axis';
  payloadSensors: string[];
  powerConsumptionW: number;
  solarGenerationW: number;
}

export interface CadResource {
  id: string;
  title: string;
  authorName: string;
  authorEmail?: string;
  institution?: string;
  category: 'cad_3d' | 'diagrama_eletronico' | 'manual_tecnico' | 'algoritmo_software';
  softwareUsed: string; // ex: SolidWorks Educacional, Fusion 360, KiCad, EasyEDA
  softwareLicenseType: 'educacional' | 'comercial' | 'open_source';
  resourceLicense: 'educacional_livre' | 'comercial_permitido' | 'cc_by_nc_sa' | 'mit_open';
  licenseText: string;
  driveDownloadUrl: string;
  description: string;
  fileFormat: string; // ex: .STEP, .STL, .SchDoc, .kicad_sch, .PDF
  createdAt: string;
  downloadsCount: number;
}

export interface RocketParams {
  massInitial: number; // kg (Total wet mass)
  massFinal: number; // kg (Dry mass without propellant)
  motorThrust: number; // N (Peak / Nominal Thrust)
  motorImpulse: number; // N*s (Total Impulse, e.g. 240 N*s)
  burnTime: number; // s (Burn duration)
  diameter: number; // m (Rocket caliber diameter)
  cd: number; // Base subsonic drag coefficient Cd0
  launchAngle: number; // degrees (Elevation angle from horizon)
  railLength: number; // m (Launch rail length)
  windSpeed: number; // km/h (Ground level wind speed)
  windDirection: number; // degrees (Wind heading angle)
  temperatureGround: number; // °C (Ambient ground temperature)
  pressureGround: number; // hPa (Ground level atmospheric pressure)
  cgPosition: number; // cm from nosecone tip
  cpPosition: number; // cm from nosecone tip
  finSpan: number; // cm (Fin span / envergadura)
  finShape: 'trapezoidal' | 'elliptical'; // Fin shape
  finAngleOfAttack: number; // degrees
  trajectoryLineVisible: boolean;
  trajectoryLineThickness: number;
  trajectoryLineDashed: boolean;
  noseShape: 'parabolic' | 'conical' | 'ogive' | 'vonkarman';
  noseLength: number; // cm
  bodyLength: number; // cm
  drogueDiameter: number; // m (Drogue parachute diameter)
  drogueCd: number; // Drogue chute drag coefficient
  mainDeployAlt: number; // m (Altitude to trigger main parachute)
  mainDiameter: number; // m (Main parachute diameter)
  mainCd: number; // Main chute drag coefficient
  parachuteCount?: number; // Number of main parachutes (1 or 2)
  thrustStartDelay?: number; // s (Delay before engine thrust ignition, default 0s)
  parachuteDeployMode?: 'apogee_auto' | 'delay_after_apogee' | 'fixed_time'; // Parachute ejection timing mode
  parachuteDeployDelay?: number; // s (Delay in seconds for parachute ejection)
  elevationMSL?: number; // m (Launch site elevation above mean sea level MSL)
}

export interface ParachuteConfig {
  mainDiameter: number; // m
  mainCd: number; // Cd
  mainDeployAlt: number; // m
  drogueDiameter: number; // m
  drogueCd: number; // Cd
  shroudLinesCount?: number;
  canopyColor?: string;
  canopyStyle?: 'domed_hemispherical' | 'cruciform' | 'toroidal' | 'elliptical';
  deployDelaySec?: number;
}

export interface SimulationHistoryItem {
  id: string;
  timestamp: string;
  name: string;
  params: RocketParams;
  maxAltitude: number;
  maxVelocity: number;
  maxMach: number;
  maxAcceleration: number;
  totalFlightTime: number;
  driftDistance: number;
  elevationMSL: number;
  windSpeed: number;
  windDirection: number;
}

export interface TrajectoryPoint {
  time: number; // s
  altitude: number; // m
  velocity: number; // m/s
  acceleration: number; // m/s²
  phase: 'ramp' | 'thrust' | 'coast' | 'drogue' | 'main_chute' | 'landed';
  xPos: number; // m (downrange distance East/X)
  yPos: number; // m (altitude Y)
  zPos?: number; // m (crossrange distance North/Z)
  mach: number; // Mach number v / a(h)
  dynamicPressure: number; // Pa (q = 0.5 * rho * v^2)
  dragForce: number; // N
  thrustForce: number; // N
  currentMass: number; // kg
  airDensity: number; // kg/m³
  staticMargin: number; // calibers (CP - CG) / diameter
  driftDistance: number; // m (wind recovery drift)
}

export interface TelemetryPacket {
  timestamp: number;
  altitude: number;
  maxAltitude: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  temperature: number;
  pressure: number;
  batteryVoltage: number;
  rssi: number;
  satellites: number;
  lat: number;
  lng: number;
  flightState: 'PRÓ-LANÇAMENTO' | 'EM RAMPA' | 'PROPULSÃO' | 'SUBIDA LIVRE' | 'APOGEU (EJEÇÃO)' | 'DESCIDA DROGUE' | 'DESCIDA PRINCIPAL' | 'SOLO ENCONTRADO';
}

export interface User {
  id: string;
  name: string;
  email: string;
  teamName?: string;
  organizationName?: string;
  role: string;
  customRole?: string;
  avatar?: string;
  isAgeVerified?: boolean;
}

export interface User3DModel {
  id: string;
  title: string;
  author: string;
  type: 'foguete_completo' | 'coifa' | 'aletagem' | 'motor' | 'payload' | 'peca_solida';
  meshType: 'cylinder_rocket' | 'multistage' | 'heavy_lift' | 'experimental_mini';
  primitiveShape?: 'cube' | 'arc' | 'cone' | 'pyramid' | 'cylinder' | 'sphere' | 'fin' | 'nosecone' | 'engine' | 'body_tube' | 'centering_ring' | 'payload' | 'imported';
  visible?: boolean;
  locked?: boolean;
  posX: number;
  posY: number;
  posZ: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  color: string;
  description: string;
  createdAt: string;
  driveOrVideoLink?: string;
}

export interface ManualContribution {
  id: string;
  authorName: string;
  email: string;
  institution: string;
  topicTitle: string;
  proposedContent: string;
  status: 'rascunho' | 'submetido' | 'em_revisao' | 'aprovado_comissao';
  date: string;
  isSpecialAuthor?: boolean; // Micael Nildo
}

export interface PlannerChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface PlannerTask {
  id: string;
  title: string;
  description?: string;
  departmentId: string;
  assignee: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:MM
  status: 'A Fazer' | 'Em Progresso' | 'Em Teste' | 'Concluído';
  priority: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  color: string;
  checklist: PlannerChecklistItem[];
  tags: string[];
}

export interface Department {
  id: string;
  name: string;
  code: string;
  color: string;
  leader: string;
  budgetAllocated: number;
  description: string;
}

export interface Invoice {
  id: string;
  number: string;
  supplier: string;
  cnpjCpf: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  departmentId: string;
  description: string;
  status: 'Pago' | 'Pendente' | 'Cancelado';
  attachmentName?: string;
  attachmentUrl?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId: string;
  subsystemRole: string;
  accessLevel: 'Líder de Área' | 'Engenheiro Sênior' | 'Pesquisador / Aluno' | 'Convidado';
  status: 'Ativo' | 'Em Licença' | 'Inativo';
  phone?: string;
  joinedDate: string;
  avatarUrl?: string;
}

export interface CustomDashboardWidget {
  id: string;
  title: string;
  type: 'chart_budget' | 'chart_tasks' | 'metric_kpi' | 'table_summary' | 'custom_notes';
  departmentFilter?: string;
  chartType?: 'bar' | 'pie' | 'line';
  value?: string;
  notes?: string;
}

export interface TeamTask {
  id: string;
  title: string;
  assignee: string;
  subsystem: string;
  status: 'A Fazer' | 'Em Progresso' | 'Em Teste' | 'Concluído';
  dueDate: string;
  priority: string;
}

export interface TeamResourceLink {
  id: string;
  title: string;
  url: string;
  type: 'YouTube' | 'Google Drive' | 'Outro';
  addedBy: string;
  category: string;
}
