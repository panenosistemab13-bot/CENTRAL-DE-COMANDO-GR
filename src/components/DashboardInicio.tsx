import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  Package,
  Truck,
  Coffee,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  Sparkles,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  ArrowRight
} from 'lucide-react';
import {
  KPIMetrics,
  DayPerformance,
  ProductDistribution,
  ActiveRoute,
  FleetVehicle,
  TopClient,
  OrderItem,
  AgendaEvent,
  NotificationItem,
  NavTab
} from '../types';
import { PremiumBarChart, PremiumDonutChart, PremiumLineChart } from './charts';
import ThreeDFleetMap from './ThreeDFleetMap';

interface DashboardInicioProps {
  kpis: KPIMetrics;
  performanceData: DayPerformance[];
  productDistribution: ProductDistribution[];
  routes: ActiveRoute[];
  vehicles: FleetVehicle[];
  topClients: TopClient[];
  orders: OrderItem[];
  agenda: AgendaEvent[];
  notifications: NotificationItem[];
  onNavigateTab: (tab: NavTab) => void;
  onOpenOrderDetails?: (order: OrderItem) => void;
  onOpenClientDetails?: (client: TopClient) => void;
}

export default function DashboardInicio({
  kpis,
  performanceData,
  productDistribution,
  routes,
  vehicles,
  topClients,
  orders,
  agenda,
  notifications,
  onNavigateTab,
  onOpenOrderDetails,
  onOpenClientDetails
}: DashboardInicioProps) {
  const [salesPeriodFilter, setSalesPeriodFilter] = useState<'9_meses' | 'ano_atual' | 'safra_2026'>('9_meses');

  // Wavy 9-month comparative data points (Jan to Set)
  const monthlyComparison = [
    { month: 'Jan', vendas: 24, producao: 18 },
    { month: 'Fev', vendas: 38, producao: 26 },
    { month: 'Mar', vendas: 32, producao: 30 },
    { month: 'Abr', vendas: 46, producao: 34 },
    { month: 'Mai', vendas: 52, producao: 44 },
    { month: 'Jun', vendas: 44, producao: 40 },
    { month: 'Jul', vendas: 60, producao: 52 },
    { month: 'Ago', vendas: 56, producao: 48 },
    { month: 'Set', vendas: 68, producao: 65 }
  ];

  return (
    <div className="w-full space-y-5">
      {/* 2-Column Master Layout: Left Main Stream (9 cols) + Right Side Rail (3 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        
        {/* =========================================================================
            LEFT / CENTER MAIN STREAM (9 Columns on XL Screens)
            ========================================================================= */}
        <div className="xl:col-span-9 space-y-5">
          
          {/* 1. TOP 4 3D KPI METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Produção Total */}
            <div className="bg-white rounded-2xl p-4 border border-[#e8ded0] shadow-[0_8px_24px_rgba(45,28,14,0.06)] hover:shadow-[0_12px_32px_rgba(45,28,14,0.12)] transition-all relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-200 p-0.5 shadow-md flex items-center justify-center mb-3">
                    <div className="w-full h-full rounded-full bg-[#fdfaf5] flex items-center justify-center">
                      <Coffee size={18} className="text-amber-800" />
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#7d6b5c] uppercase tracking-wider block">
                    Produção Total
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <strong className="text-xl sm:text-2xl font-black text-[#2c1a0e] font-mono tracking-tight">
                      {kpis.producaoTotalKg.toLocaleString('pt-BR')}
                    </strong>
                    <span className="text-xs font-bold text-[#8c7866]">kg</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-[11px] font-bold text-emerald-600">
                    <TrendingUp size={12} />
                    <span>↑ {kpis.producaoGrowth}%</span>
                  </div>
                </div>

                {/* 3D Realistic Coffee Beans Illustration */}
                <div className="w-20 h-20 shrink-0 relative">
                  <img
                    src="/src/assets/images/coffee_beans_3d_1789847062486.jpg"
                    alt="Grãos de Café 3D"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(45,28,14,0.25)] group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '/hero-podium-coffee.jpg';
                    }}
                  />
                </div>
              </div>

              {/* Bottom Sparkline Curve */}
              <div className="mt-2 w-full h-5 flex items-end">
                <svg viewBox="0 0 100 20" className="w-full h-full overflow-visible">
                  <path
                    d="M 0 15 Q 25 5 50 12 T 100 3"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Card 2: Colaboradores */}
            <div className="bg-white rounded-2xl p-4 border border-[#e8ded0] shadow-[0_8px_24px_rgba(45,28,14,0.06)] hover:shadow-[0_12px_32px_rgba(45,28,14,0.12)] transition-all relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-300 p-0.5 shadow-md flex items-center justify-center mb-3">
                    <div className="w-full h-full rounded-full bg-[#f0f7ff] flex items-center justify-center">
                      <Users size={18} className="text-blue-600" />
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#7d6b5c] uppercase tracking-wider block">
                    Colaboradores
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <strong className="text-xl sm:text-2xl font-black text-[#2c1a0e] font-mono tracking-tight">
                      {kpis.colaboradoresCount}
                    </strong>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-[11px] font-bold text-emerald-600">
                    <TrendingUp size={12} />
                    <span>↑ {kpis.colaboradoresGrowth}%</span>
                  </div>
                </div>

                {/* 3D Stylized Team Avatars Illustration */}
                <div className="w-20 h-20 shrink-0 relative">
                  <img
                    src="/src/assets/images/team_avatar_3d_1789847070838.jpg"
                    alt="Equipe 3D"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(37,99,235,0.2)] group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '/hero-podium-coffee.jpg';
                    }}
                  />
                </div>
              </div>

              {/* Bottom Sparkline Curve */}
              <div className="mt-2 w-full h-5 flex items-end">
                <svg viewBox="0 0 100 20" className="w-full h-full overflow-visible">
                  <path
                    d="M 0 16 Q 30 18 60 8 T 100 4"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Card 3: Produtos Ativos */}
            <div className="bg-white rounded-2xl p-4 border border-[#e8ded0] shadow-[0_8px_24px_rgba(45,28,14,0.06)] hover:shadow-[0_12px_32px_rgba(45,28,14,0.12)] transition-all relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-200 p-0.5 shadow-md flex items-center justify-center mb-3">
                    <div className="w-full h-full rounded-full bg-[#fffbeb] flex items-center justify-center">
                      <Package size={18} className="text-amber-700" />
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#7d6b5c] uppercase tracking-wider block">
                    Produtos Ativos
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <strong className="text-xl sm:text-2xl font-black text-[#2c1a0e] font-mono tracking-tight">
                      {kpis.produtosAtivos}
                    </strong>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-[11px] font-bold text-emerald-600">
                    <TrendingUp size={12} />
                    <span>↑ {kpis.produtosGrowth}%</span>
                  </div>
                </div>

                {/* 3D Coffee Pouches Packaging Illustration */}
                <div className="w-20 h-20 shrink-0 relative">
                  <img
                    src="/src/assets/images/coffee_packages_3d_1789847080376.jpg"
                    alt="Embalagens 3D"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(217,119,6,0.2)] group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '/hero-podium-coffee.jpg';
                    }}
                  />
                </div>
              </div>

              {/* Bottom Sparkline Curve */}
              <div className="mt-2 w-full h-5 flex items-end">
                <svg viewBox="0 0 100 20" className="w-full h-full overflow-visible">
                  <path
                    d="M 0 14 Q 35 16 65 9 T 100 2"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Card 4: Vendas no Mês */}
            <div className="bg-white rounded-2xl p-4 border border-[#e8ded0] shadow-[0_8px_24px_rgba(45,28,14,0.06)] hover:shadow-[0_12px_32px_rgba(45,28,14,0.12)] transition-all relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-cyan-300 p-0.5 shadow-md flex items-center justify-center mb-3">
                    <div className="w-full h-full rounded-full bg-[#f0fdfa] flex items-center justify-center">
                      <Truck size={18} className="text-cyan-700" />
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#7d6b5c] uppercase tracking-wider block">
                    Vendas no Mês
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <strong className="text-xl sm:text-2xl font-black text-[#2c1a0e] font-mono tracking-tight">
                      R$ 4.258,90
                    </strong>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-[11px] font-bold text-emerald-600">
                    <TrendingUp size={12} />
                    <span>↑ {kpis.vendasGrowth}%</span>
                  </div>
                </div>

                {/* 3D Ascending Golden Coin Stairs Illustration */}
                <div className="w-20 h-20 shrink-0 relative">
                  <img
                    src="/src/assets/images/gold_coins_3d_1789847095939.jpg"
                    alt="Moedas Douradas 3D"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(217,119,6,0.25)] group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '/hero-podium-coffee.jpg';
                    }}
                  />
                </div>
              </div>

              {/* Bottom Sparkline Curve */}
              <div className="mt-2 w-full h-5 flex items-end">
                <svg viewBox="0 0 100 20" className="w-full h-full overflow-visible">
                  <path
                    d="M 0 17 Q 40 14 70 8 T 100 3"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

          </div>

          {/* 2. MIDDLE ROW: DESEMPENHO GERAL (3D CYLINDERS) + DISTRIBUIÇÃO DE PRODUTOS (3D DONUT) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Box (7 cols): Desempenho Geral + Meta do Mês Gauge */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-[#e8ded0] shadow-[0_10px_30px_rgba(45,28,14,0.06)] flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#f0e8db] mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
                      <Coffee size={15} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#2c1a0e]">
                        Desempenho Geral
                      </h3>
                      <p className="text-[11px] text-[#8c7866]">
                        Evolução da produção e vendas nos últimos 30 dias
                      </p>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
                      <span className="text-[#5a483a]">Produção</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-sm" />
                      <span className="text-[#5a483a]">Vendas</span>
                    </div>
                  </div>
                </div>

                {/* Premium High-End Line Area Chart for Production & Sales */}
                <PremiumLineChart
                  data={performanceData.map(p => ({
                    date: p.dateLabel,
                    Produção: p.producaoKg,
                    Vendas: p.vendasKg
                  }))}
                  xKey="date"
                  lines={[
                    { key: 'Produção', name: 'Produção (kg)', color: '#9b1526' },
                    { key: 'Vendas', name: 'Vendas (kg)', color: '#06b6d4' }
                  ]}
                  height={200}
                  unit="kg"
                />
              </div>

              {/* Bottom Integrated Meta do Mês Circular Gauge Bar */}
              <div className="mt-4 pt-3 border-t border-[#f0e8db] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Circular Radial Donut 68% */}
                  <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#f3ede2"
                        strokeWidth="3.5"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="url(#gaugeGrad)"
                        strokeDasharray="68, 100"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <strong className="text-xs font-black text-[#2c1a0e] font-mono leading-none">
                        68%
                      </strong>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-[#2c1a0e] block">
                      Meta do Mês
                    </span>
                    <strong className="text-xs font-bold text-amber-700 font-mono">
                      R$ 102.450,00 <span className="text-[#8c7866] font-normal">/ R$ 150.000,00</span>
                    </strong>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full sm:w-48">
                  <div className="w-full bg-[#f0e8db] h-2.5 rounded-full overflow-hidden p-0.5">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full w-[68%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Box (5 cols): Distribuição de Produtos (3D Donut) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#e8ded0] shadow-[0_10px_30px_rgba(45,28,14,0.06)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#f0e8db] mb-4">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
                    <Package size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#2c1a0e]">
                      Distribuição de Produtos
                    </h3>
                  </div>
                </div>

                {/* Premium Donut Chart */}
                <div className="py-2">
                  <PremiumDonutChart
                    data={productDistribution.map((item) => ({
                      name: item.name,
                      value: item.percentage,
                      color: item.color
                    }))}
                    height={170}
                    unit="%"
                    centerLabel="Total Mix"
                    centerValue="100%"
                    showLegend={true}
                  />
                </div>
              </div>

              {/* Bottom Insight */}
              <div className="mt-3 pt-3 border-t border-[#f0e8db] flex items-center justify-between text-[11px] text-[#8c7866]">
                <span>Volume total em grãos lidera</span>
                <strong className="font-mono font-bold text-[#2c1a0e]">31.562 kg</strong>
              </div>
            </div>

          </div>

          {/* 3. MIDDLE SECTION: RASTREAMENTO DA FROTA 3D RELIEF RADAR */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Truck size={17} className="text-amber-800" />
                <h3 className="text-sm font-bold text-[#2c1a0e]">
                  Rastreamento da Frota
                </h3>
                <span className="text-xs text-[#8c7866]">
                  • Posição dos veículos em tempo real
                </span>
              </div>
            </div>

            <ThreeDFleetMap
              routes={routes}
              vehicles={vehicles}
              onSelectRoute={() => onNavigateTab('relatorios')}
            />
          </div>

          {/* 4. BOTTOM 3-COLUMN GRID: VENDAS POR PERÍODO + TOP CLIENTES + ÚLTIMOS PEDIDOS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* Box 1: Vendas por Período */}
            <div className="bg-white rounded-2xl p-4 border border-[#e8ded0] shadow-[0_8px_24px_rgba(45,28,14,0.06)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#f0e8db] mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-[#2c1a0e]">
                      Vendas por Período
                    </h4>
                    <span className="text-[10px] text-[#8c7866]">
                      Comparativo de vendas e produção
                    </span>
                  </div>

                  <button className="text-[10px] font-bold px-2 py-1 rounded-lg bg-[#fbf8f3] border border-[#e2d5c3] text-[#4a392b] flex items-center gap-1 hover:bg-[#f3ede2]">
                    Últimos 9 meses <ChevronDown size={11} />
                  </button>
                </div>

                {/* Smooth Wavy Dual Curve Area Chart */}
                <div className="h-44 w-full relative pt-2">
                  <svg viewBox="0 0 300 130" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="vendasWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="prodWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Vendas Curve (Amber Gold) */}
                    <path
                      d="M 10 95 C 40 70, 70 85, 100 60 C 130 50, 160 65, 190 40 C 220 45, 250 30, 290 15 L 290 115 L 10 115 Z"
                      fill="url(#vendasWaveGrad)"
                    />
                    <path
                      d="M 10 95 C 40 70, 70 85, 100 60 C 130 50, 160 65, 190 40 C 220 45, 250 30, 290 15"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                    />

                    {/* Produção Curve (Cyan Blue) */}
                    <path
                      d="M 10 105 C 40 85, 70 80, 100 75 C 130 60, 160 70, 190 55 C 220 58, 250 40, 290 22 L 290 115 L 10 115 Z"
                      fill="url(#prodWaveGrad)"
                    />
                    <path
                      d="M 10 105 C 40 85, 70 80, 100 75 C 130 60, 160 70, 190 55 C 220 58, 250 40, 290 22"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2.5"
                    />

                    {/* Month Ticks on Baseline */}
                    {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set'].map((m, i) => (
                      <text
                        key={m}
                        x={15 + i * 33}
                        y="126"
                        textAnchor="middle"
                        fontSize="8.5"
                        fontWeight="600"
                        fill="#8c7866"
                      >
                        {m}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>
            </div>

            {/* Box 2: Top Clientes */}
            <div className="bg-white rounded-2xl p-4 border border-[#e8ded0] shadow-[0_8px_24px_rgba(45,28,14,0.06)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#f0e8db] mb-3">
                  <h4 className="text-xs font-bold text-[#2c1a0e]">
                    Top Clientes
                  </h4>
                  <button
                    onClick={() => onNavigateTab('clientes')}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800"
                  >
                    Ver todos
                  </button>
                </div>

                <div className="space-y-2">
                  {topClients.map((client) => (
                    <div
                      key={client.rank}
                      onClick={() => onOpenClientDetails && onOpenClientDetails(client)}
                      className="p-1.5 rounded-xl hover:bg-[#faf6ef] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {/* Numbered Gold Disc */}
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-[#2c1808] font-black text-[10px] flex items-center justify-center shrink-0 shadow-xs">
                          {client.rank}
                        </div>
                        {/* Avatar */}
                        <img
                          src={client.avatarUrl || '/hero-podium-coffee.jpg'}
                          alt={client.name}
                          className="w-6 h-6 rounded-full object-cover border border-amber-300/60"
                        />
                        <span className="text-[11.5px] font-bold text-[#2c1a0e] truncate max-w-[100px]">
                          {client.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <strong className="text-xs font-mono font-bold text-[#2c1a0e]">
                          R$ {client.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </strong>
                        <span className="text-[10px] font-bold text-emerald-600">
                          ↑ {client.growth}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Box 3: Últimos Pedidos */}
            <div className="bg-white rounded-2xl p-4 border border-[#e8ded0] shadow-[0_8px_24px_rgba(45,28,14,0.06)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#f0e8db] mb-3">
                  <h4 className="text-xs font-bold text-[#2c1a0e]">
                    Últimos Pedidos
                  </h4>
                  <button
                    onClick={() => onNavigateTab('vendas')}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-0.5"
                  >
                    Ver todas <ChevronRight size={12} />
                  </button>
                </div>

                <div className="space-y-2">
                  {orders.map((ord) => {
                    const statusConfig =
                      ord.status === 'em_separacao'
                        ? { bg: 'bg-amber-50 text-amber-800 border-amber-300', dot: 'bg-amber-500', label: 'Em separação' }
                        : ord.status === 'faturado'
                        ? { bg: 'bg-blue-50 text-blue-800 border-blue-300', dot: 'bg-blue-500', label: 'Faturado' }
                        : ord.status === 'em_transporte'
                        ? { bg: 'bg-cyan-50 text-cyan-800 border-cyan-300', dot: 'bg-cyan-500', label: 'Em transporte' }
                        : { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500', label: 'Entregue' };

                    return (
                      <div
                        key={ord.id}
                        onClick={() => onOpenOrderDetails && onOpenOrderDetails(ord)}
                        className="p-1.5 rounded-xl hover:bg-[#faf6ef] transition-colors flex items-center justify-between cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <strong className="font-mono font-bold text-amber-800 text-[11px]">
                            {ord.orderNumber}
                          </strong>
                          <span className="text-[11px] font-bold text-[#5c493c]">
                            {ord.weightKg.toLocaleString('pt-BR')} kg
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusConfig.bg}`}>
                            <span className={`w-1 h-1 rounded-full ${statusConfig.dot}`} />
                            {statusConfig.label}
                          </span>
                          <span className="text-[9.5px] text-[#8c7866] font-medium hidden sm:inline">
                            {ord.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* =========================================================================
            RIGHT SIDEBAR RAIL (3 Columns on XL Screens)
            ========================================================================= */}
        <div className="xl:col-span-3 space-y-5">
          
          {/* 1. AGENDA DE HOJE */}
          <div className="bg-white rounded-2xl p-4 border border-[#e8ded0] shadow-[0_8px_24px_rgba(45,28,14,0.06)]">
            <div className="flex items-center justify-between pb-2 border-b border-[#f0e8db] mb-3">
              <div className="flex items-center gap-1.5">
                <CalendarIcon size={14} className="text-amber-800" />
                <h4 className="text-xs font-bold text-[#2c1a0e]">
                  Agenda de Hoje
                </h4>
              </div>
              <span className="text-[11px] font-bold text-stone-500 font-mono">
                18 Set 2026 &gt;
              </span>
            </div>

            <div className="space-y-2.5">
              {agenda.map((item) => (
                <div key={item.id} className="flex items-start gap-2.5 p-1.5 rounded-xl hover:bg-[#fbf8f3] transition-colors">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-xs"
                    style={{ backgroundColor: `${item.badgeColor}20`, color: item.badgeColor }}
                  >
                    <Clock size={11} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#8c7866] font-mono mr-1.5">
                      {item.time}
                    </span>
                    <strong className="text-xs font-bold text-[#2c1a0e]">
                      {item.title}
                    </strong>
                    {item.location && (
                      <span className="block text-[10px] text-stone-500 mt-0.5">
                        {item.location}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. NOTIFICAÇÕES */}
          <div className="bg-white rounded-2xl p-4 border border-[#e8ded0] shadow-[0_8px_24px_rgba(45,28,14,0.06)]">
            <div className="flex items-center justify-between pb-2 border-b border-[#f0e8db] mb-3">
              <div className="flex items-center gap-1.5">
                <Coffee size={14} className="text-amber-800" />
                <h4 className="text-xs font-bold text-[#2c1a0e]">
                  Notificações
                </h4>
              </div>
              <button className="text-[11px] font-bold text-amber-700 hover:text-amber-800">
                Ver todas &gt;
              </button>
            </div>

            <div className="space-y-2.5">
              {notifications.map((notif) => {
                const iconColor =
                  notif.type === 'venda'
                    ? 'text-amber-600 bg-amber-100'
                    : notif.type === 'pedido'
                    ? 'text-yellow-700 bg-amber-100'
                    : notif.type === 'alerta'
                    ? 'text-rose-600 bg-rose-100'
                    : 'text-teal-600 bg-teal-100';

                return (
                  <div
                    key={notif.id}
                    className="flex items-start justify-between gap-2 p-1.5 rounded-xl hover:bg-[#fbf8f3] transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${iconColor}`}>
                        {notif.type === 'venda' && <CheckCircle2 size={11} />}
                        {notif.type === 'pedido' && <Package size={11} />}
                        {notif.type === 'alerta' && <AlertCircle size={11} />}
                        {notif.type === 'entrega' && <Truck size={11} />}
                      </div>
                      <div>
                        <strong className="text-[11.5px] font-bold text-[#2c1a0e] block leading-tight">
                          {notif.title}
                        </strong>
                        <span className="text-[10px] text-[#7d6b5c] block">
                          {notif.subtitle}
                        </span>
                      </div>
                    </div>

                    <span className="text-[9.5px] text-[#8c7866] font-medium shrink-0 font-mono">
                      {notif.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. PROMOTIONAL LUXURY COFFEE BANNER */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#26150b] to-[#120904] p-5 text-white border border-[#d4a373]/30 shadow-[0_15px_35px_rgba(25,12,5,0.35)] flex flex-col justify-between min-h-[220px] group">
            {/* Background Steaming Coffee Visual */}
            <div className="absolute right-0 bottom-0 w-36 h-36 opacity-40 pointer-events-none group-hover:scale-110 group-hover:opacity-60 transition-all duration-700">
              <img
                src="/src/assets/images/steaming_cup_coffee_1789847106425.jpg"
                alt="Café"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.currentTarget.src = '/hero-podium-coffee.jpg';
                }}
              />
            </div>

            <div className="relative z-10">
              <h4 className="font-serif italic text-lg sm:text-xl font-bold text-[#ffd77d] leading-snug drop-shadow-sm">
                Mais do que café,<br />conexões.
              </h4>
            </div>

            <div className="relative z-10 pt-4">
              <button
                onClick={() => onNavigateTab('produtos')}
                className="w-full py-2.5 px-4 rounded-xl bg-transparent hover:bg-[#ffd77d] hover:text-[#2c1808] border border-[#ffd77d]/70 text-[#ffd77d] text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg group-hover:bg-[#ffd77d] group-hover:text-[#2c1808]"
              >
                Conheça nossos produtos
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
