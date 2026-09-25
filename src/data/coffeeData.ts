import {
  KPIMetrics,
  DayPerformance,
  ProductDistribution,
  FleetVehicle,
  ActiveRoute,
  TopClient,
  OrderItem,
  AgendaEvent,
  NotificationItem,
  ProductCatalogItem
} from '../types';

export const INITIAL_KPI_METRICS: KPIMetrics = {
  producaoTotalKg: 65482,
  producaoGrowth: 12.5,
  colaboradoresCount: 19,
  colaboradoresGrowth: 4.8,
  produtosAtivos: 368,
  produtosGrowth: 8.2,
  vendasMes: 4258900, // Displayed as formatted currency R$ 4.258.900,00 or R$ 4.258,90
  vendasGrowth: 12.5
};

export const INITIAL_PERFORMANCE_30_DAYS: DayPerformance[] = [
  { date: '2026-09-01', displayDate: '01/09', producao: 12400, vendas: 16800 },
  { date: '2026-09-04', displayDate: '04/09', producao: 24800, vendas: 21500 },
  { date: '2026-09-07', displayDate: '07/09', producao: 32600, vendas: 28900 },
  { date: '2026-09-10', displayDate: '10/09', producao: 27900, vendas: 31400 },
  { date: '2026-09-13', displayDate: '13/09', producao: 38200, vendas: 35100 },
  { date: '2026-09-16', displayDate: '16/09', producao: 44600, vendas: 39800 },
  { date: '2026-09-18', displayDate: '18/09', producao: 48900, vendas: 44500 },
];

export const INITIAL_PRODUCT_DISTRIBUTION: ProductDistribution[] = [
  { id: '1', name: 'Café em Grãos', percentage: 48.2, color: '#996025', volumeKg: 31562, revenue: 2052800 },
  { id: '2', name: 'Cappuccino', percentage: 22.6, color: '#2563eb', volumeKg: 14798, revenue: 962500 },
  { id: '3', name: 'Café Torrado', percentage: 15.3, color: '#10b981', volumeKg: 10018, revenue: 651600 },
  { id: '4', name: 'Acessórios', percentage: 8.7, color: '#f59e0b', volumeKg: 5696, revenue: 370500 },
  { id: '5', name: 'Outros', percentage: 5.2, color: '#f43f5e', volumeKg: 3405, revenue: 221500 },
];

export const INITIAL_FLEET_VEHICLES: FleetVehicle[] = [
  {
    id: 'V-01',
    driver: 'Carlos Eduardo Silva',
    plate: 'RTS9A45',
    truckModel: 'Volvo FH 540 6x4 Golden Edition',
    status: 'em_rota',
    origin: 'São Paulo - SP',
    destination: 'Belo Horizonte - MG',
    cargo: 'Café Especial em Grãos 100% Arábica',
    weightKg: 24500,
    progress: 72,
    lat: -20.85,
    lng: -44.52,
    eta: '14:30'
  },
  {
    id: 'V-02',
    driver: 'Marcos Vinícius Prado',
    plate: 'BRA2E19',
    truckModel: 'Scania R 450 Super Streamline',
    status: 'em_rota',
    origin: 'Belo Horizonte - MG',
    destination: 'Rio de Janeiro - RJ',
    cargo: 'Cappuccino & Solúveis Gourmet',
    weightKg: 18200,
    progress: 48,
    lat: -21.45,
    lng: -43.35,
    eta: '16:45'
  },
  {
    id: 'V-03',
    driver: 'Antônio José Ferreira',
    plate: 'ABC4F20',
    truckModel: 'Mercedes-Benz Actros 2651',
    status: 'carregando',
    origin: 'Brasília - DF',
    destination: 'São Paulo - SP',
    cargo: 'Microlotes Cerrado Mineiro',
    weightKg: 26000,
    progress: 15,
    lat: -15.79,
    lng: -47.88,
    eta: 'Amanhã 08:00'
  },
  {
    id: 'V-04',
    driver: 'Roberto Alves de Souza',
    plate: 'CUR8H99',
    truckModel: 'DAF XF 530 Space Cab',
    status: 'descarregando',
    origin: 'São Paulo - SP',
    destination: 'Curitiba - PR',
    cargo: 'Café Torrado e Moído Tradicional',
    weightKg: 22000,
    progress: 95,
    lat: -25.42,
    lng: -49.27,
    eta: '11:15'
  },
  {
    id: 'V-05',
    driver: 'Fernando Guimarães',
    plate: 'PGR3D77',
    truckModel: 'Volvo FH 460 Globetrotter',
    status: 'parado',
    origin: 'Pátio Central - 3 COR BH',
    destination: 'Aguardando Escala',
    cargo: 'Manutenção Preventiva / Checklist OK',
    weightKg: 0,
    progress: 0,
    lat: -19.92,
    lng: -43.93,
    eta: 'Disponível'
  }
];

export const INITIAL_ACTIVE_ROUTES: ActiveRoute[] = [
  { id: '1', route: 'SP ➔ BH', vehicleCount: 2, status: 'em_rota', distanceKm: 586, estimatedTime: '7h 45m' },
  { id: '2', route: 'BH ➔ RJ', vehicleCount: 1, status: 'em_rota', distanceKm: 442, estimatedTime: '5h 50m' },
  { id: '3', route: 'DF ➔ SP', vehicleCount: 1, status: 'carregando', distanceKm: 1015, estimatedTime: '13h 20m' },
  { id: '4', route: 'SP ➔ Curitiba', vehicleCount: 1, status: 'descarregando', distanceKm: 408, estimatedTime: '5h 15m' }
];

export const INITIAL_TOP_CLIENTS: TopClient[] = [
  {
    id: 'cli-1',
    rank: 1,
    name: 'Supermercado Paraná',
    totalValue: 48230.00,
    growth: 12.5,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    city: 'Curitiba - PR',
    ordersCount: 42,
    favoriteProduct: 'Café em Grãos 1kg'
  },
  {
    id: 'cli-2',
    rank: 2,
    name: 'Café Brasília',
    totalValue: 32450.00,
    growth: 8.7,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    city: 'Brasília - DF',
    ordersCount: 28,
    favoriteProduct: 'Cappuccino Avelã 500g'
  },
  {
    id: 'cli-3',
    rank: 3,
    name: 'Padaria Central',
    totalValue: 21780.00,
    growth: 6.3,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    city: 'Belo Horizonte - MG',
    ordersCount: 35,
    favoriteProduct: 'Café Torrado e Moído 500g'
  },
  {
    id: 'cli-4',
    rank: 4,
    name: 'Hotel Luxo',
    totalValue: 18920.00,
    growth: 4.9,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    city: 'São Paulo - SP',
    ordersCount: 19,
    favoriteProduct: 'Microlote Bourbon Amarelo'
  },
  {
    id: 'cli-5',
    rank: 5,
    name: 'Distribuidora Sol',
    totalValue: 12480.00,
    growth: 3.7,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    city: 'Rio de Janeiro - RJ',
    ordersCount: 14,
    favoriteProduct: 'Café Solúvel Premium'
  }
];

export const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'ord-1',
    orderNumber: '#4S87',
    client: 'Supermercado Paraná',
    weightKg: 1000,
    status: 'em_separacao',
    time: 'Hoje • 10:12',
    date: '18/09/2026',
    totalValue: 48200.00,
    product: 'Café em Grãos Especial 1kg',
    destination: 'Curitiba - PR'
  },
  {
    id: 'ord-2',
    orderNumber: '#4S86',
    client: 'Café Brasília',
    weightKg: 500,
    status: 'faturado',
    time: 'Hoje • 09:47',
    date: '18/09/2026',
    totalValue: 24500.00,
    product: 'Cappuccino Tradicional 500g',
    destination: 'Brasília - DF'
  },
  {
    id: 'ord-3',
    orderNumber: '#4S85',
    client: 'Padaria Central',
    weightKg: 750,
    status: 'em_transporte',
    time: 'Hoje • 08:32',
    date: '18/09/2026',
    totalValue: 36750.00,
    product: 'Café Torrado & Moído Gourmet',
    destination: 'Belo Horizonte - MG'
  },
  {
    id: 'ord-4',
    orderNumber: '#4S84',
    client: 'Hotel Luxo',
    weightKg: 300,
    status: 'entregue',
    time: 'Hoje • 07:21',
    date: '18/09/2026',
    totalValue: 19800.00,
    product: 'Linha Reserva Bourbon Amarelo',
    destination: 'São Paulo - SP'
  },
  {
    id: 'ord-5',
    orderNumber: '#4S83',
    client: 'Distribuidora Sol',
    weightKg: 1200,
    status: 'em_separacao',
    time: 'Hoje • 06:52',
    date: '18/09/2026',
    totalValue: 58400.00,
    product: 'Café em Grãos Torra Média',
    destination: 'Rio de Janeiro - RJ'
  }
];

export const INITIAL_AGENDA: AgendaEvent[] = [
  { id: '1', time: '08:00', title: 'Reunião de Produção', type: 'producao', badgeColor: '#f97316', location: 'Sala Executiva 01', description: 'Revisão das metas de torrefação e empacotamento da semana' },
  { id: '2', time: '10:30', title: 'Conferência de Vendas', type: 'vendas', badgeColor: '#64748b', location: 'Online Teams', description: 'Alinhamento com gerentes regionais SP/MG/RJ' },
  { id: '3', time: '14:00', title: 'Visita ao Cliente', type: 'cliente', badgeColor: '#06b6d4', location: 'Supermercado Paraná Matriz', description: 'Renovação do contrato semestral de fornecimento de grãos' },
  { id: '4', time: '16:00', title: 'Alinhamento Logística', type: 'logistica', badgeColor: '#3b82f6', location: 'Centro de Distribuição 3 COR', description: 'Expedição das cargas pesadas para Brasília e Curitiba' }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: '1', title: 'Venda aprovada', subtitle: 'Cliente: Supermercado Paraná', time: 'Hoje • 09:42', type: 'venda', read: false },
  { id: '2', title: 'Novo pedido', subtitle: 'Café em Grãos 500kg', time: 'Hoje • 08:17', type: 'pedido', read: false },
  { id: '3', title: 'Alerta de estoque', subtitle: 'Acessórios - Caneca', time: 'Hoje • 07:55', type: 'alerta', read: false },
  { id: '4', title: 'Entrega realizada', subtitle: 'Pedido #4S87', time: 'Ontem • 18:32', type: 'entrega', read: true }
];

export const INITIAL_PRODUCTS_CATALOG: ProductCatalogItem[] = [
  {
    id: 'prod-1',
    name: 'Café em Grãos Especial A&B',
    category: 'grãos',
    weight: '1kg',
    stockUnits: 1840,
    pricePerUnit: 68.50,
    roastProfile: 'Torra Média Clássica',
    intensity: 8,
    sku: 'AB-GRA-1000',
    description: 'Grãos 100% arábica colhidos a 1.250m de altitude. Notas de caramelo, chocolate amargo e nozes.'
  },
  {
    id: 'prod-2',
    name: 'Cappuccino Tradicional Italiano',
    category: 'cappuccino',
    weight: '500g',
    stockUnits: 920,
    pricePerUnit: 42.00,
    roastProfile: 'Blend Suave Cremoso',
    intensity: 6,
    sku: 'AB-CAP-0500',
    description: 'Fórmula exclusiva com cacau fino, toque de canela e espuma densa e aveludada.'
  },
  {
    id: 'prod-3',
    name: 'Café Torrado e Moído Gourmet',
    category: 'torrado',
    weight: '500g',
    stockUnits: 1450,
    pricePerUnit: 34.90,
    roastProfile: 'Torra Média Escura',
    intensity: 9,
    sku: 'AB-TOR-0500',
    description: 'Moagem precisa ideal para filtro e prensa francesa. Aroma intenso e finalização prolongada.'
  },
  {
    id: 'prod-4',
    name: 'Caneca Barista Porcelana A&B Gold',
    category: 'acessorios',
    weight: '350ml',
    stockUnits: 180,
    pricePerUnit: 49.90,
    roastProfile: 'Acessório Colecionável',
    intensity: 0,
    sku: 'AB-CAN-GOLD',
    description: 'Porcelana térmica nobre com borda folheada a ouro fosco e pegador anatômico.'
  },
  {
    id: 'prod-5',
    name: 'Microlote Bourbon Amarelo Reserva',
    category: 'grãos',
    weight: '250g',
    stockUnits: 310,
    pricePerUnit: 89.00,
    roastProfile: 'Torra Clara Especial (SCA 89)',
    intensity: 7,
    sku: 'AB-MIC-0250',
    description: 'Edição limitada numerada. Notas cítricas de bergamota, mel de laranjeira e corpo sedoso.'
  },
  {
    id: 'prod-6',
    name: 'Prensa Francesa Vidro Borossilicato',
    category: 'acessorios',
    weight: '600ml',
    stockUnits: 95,
    pricePerUnit: 129.90,
    roastProfile: 'Equipamento de Extração',
    intensity: 0,
    sku: 'AB-PRE-0600',
    description: 'Êmbolo duplo em aço inoxidável 304 com vedação perfeita para café sem resíduos.'
  }
];

export const SALES_PERIOD_DATA = {
  '9_meses': [
    { month: 'Jan', vendas: 28000, producao: 31000 },
    { month: 'Fev', vendas: 34000, producao: 36000 },
    { month: 'Mar', vendas: 31000, producao: 33000 },
    { month: 'Abr', vendas: 42000, producao: 38000 },
    { month: 'Mai', vendas: 49000, producao: 45000 },
    { month: 'Jun', vendas: 46000, producao: 43000 },
    { month: 'Jul', vendas: 58000, producao: 51000 },
    { month: 'Ago', vendas: 62000, producao: 56000 },
    { month: 'Set', vendas: 68000, producao: 65482 },
  ],
  'ano_atual': [
    { month: 'T1', vendas: 93000, producao: 100000 },
    { month: 'T2', vendas: 137000, producao: 126000 },
    { month: 'T3', vendas: 188000, producao: 172482 },
    { month: 'T4 (Proj)', vendas: 220000, producao: 200000 },
  ],
  'safra_2026': [
    { month: 'Maio', vendas: 45000, producao: 52000 },
    { month: 'Junho', vendas: 48000, producao: 58000 },
    { month: 'Julho', vendas: 61000, producao: 67000 },
    { month: 'Agosto', vendas: 64000, producao: 71000 },
    { month: 'Setembro', vendas: 70000, producao: 65482 },
  ]
};
