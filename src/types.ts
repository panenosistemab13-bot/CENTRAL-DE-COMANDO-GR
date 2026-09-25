export type Tab = 
  | 'menu' 
  | 'presence' 
  | 'risk' 
  | 'averbacao' 
  | 'sm_creator' 
  | 'rotas' 
  | 'checklist' 
  | 'controle' 
  | 'escala';

export interface User {
  email: string;
  name: string;
  role: string;
}

export interface UserProfile {
  name?: string;
  role?: string;
  unit?: string;
  avatarUrl?: string;
  shift?: string;
  status?: string;
  [key: string]: any;
}

export interface AppointmentItem {
  id: string;
  date: string;
  time: string;
  title: string;
  type: 'pessoal' | 'corporativo';
}

export interface KPIMetrics {
  faturamentoMes?: number;
  metaMes?: number;
  faturamentoHoje?: number;
  pedidosHoje?: number;
  ticketMedio?: number;
  rotasAtivas?: number;
  frotaTotal?: number;
  frotaEmRota?: number;
  volumeProduzidoSacas?: number;
  eficienciaLogisticaPct?: number;
  [key: string]: any;
}

export interface DayPerformance {
  dia?: string;
  date?: string;
  volume?: number;
  meta?: number;
  pedidos?: number;
  [key: string]: any;
}

export interface ProductDistribution {
  id?: string;
  categoria?: string;
  sacas?: number;
  percentual?: number;
  corHex?: string;
  [key: string]: any;
}

export interface ActiveRoute {
  id: string;
  codigoRota?: string;
  motorista?: string;
  veiculoPlaca?: string;
  tipoVeiculo?: string;
  origem?: string;
  destino?: string;
  status?: any;
  progressoPct?: number;
  previsaoChegada?: string;
  itensCount?: number;
  sacasTotal?: number;
  [key: string]: any;
}

export interface FleetVehicle {
  id: string;
  placa?: string;
  modelo?: string;
  motorista?: string;
  driver?: string;
  status?: any;
  capacidadeSacas?: number;
  ultimaRevisao?: string;
  [key: string]: any;
}

export interface TopClient {
  id: string;
  razaoSocial?: string;
  cidade?: string;
  uf?: string;
  volumeSacasMes?: number;
  valorTotalMes?: number;
  statusConta?: any;
  rank?: number;
  [key: string]: any;
}

export interface OrderItem {
  id: string;
  cliente?: string;
  client?: string;
  produto?: string;
  product?: string;
  sacas?: number;
  valorTotal?: number;
  totalValue?: number;
  orderNumber?: string;
  destination?: string;
  weightKg?: number;
  time?: string;
  status?: any;
  horario?: string;
  [key: string]: any;
}

export interface AgendaEvent {
  id: string;
  horario?: string;
  time?: string;
  titulo?: string;
  tipo?: any;
  responsavel?: string;
  status?: any;
  [key: string]: any;
}

export interface NotificationItem {
  id: string;
  titulo?: string;
  title?: string;
  mensagem?: string;
  tipo?: any;
  horario?: string;
  lida?: boolean;
  [key: string]: any;
}

export type NavTab = 
  | 'inicio' 
  | 'vendas' 
  | 'produtos' 
  | 'clientes' 
  | 'rotas' 
  | 'relatorios' 
  | 'configuracoes';

export interface ProductCatalogItem {
  id: string;
  nome?: string;
  name?: string;
  sku?: string;
  categoria?: string;
  embalagem?: string;
  precoSaca?: number;
  estoqueSacas?: number;
  estoqueMinimo?: number;
  intensidade?: number;
  origem?: string;
  safra?: string;
  [key: string]: any;
}

export type ReportSubTab = 
  | 'averbacao' 
  | 'checklist' 
  | 'patio' 
  | 'rotas' 
  | 'sm' 
  | 'financeiro' 
  | 'logistica' 
  | 'producao' 
  | 'frota';

