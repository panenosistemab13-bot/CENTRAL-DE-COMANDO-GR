import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  ChevronRight, 
  Container, 
  TrendingUp, 
  Layers, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  MapPin, 
  Sliders, 
  Activity,
  FileCheck2,
  FileSpreadsheet,
  Users2,
  Route
} from 'lucide-react';
import HeroCoffeeVisual3D from './3d/HeroCoffeeVisual3D';
import KPIStatCard3D from './3d/KPIStatCard3D';
import CylinderChart3D from './3d/CylinderChart3D';
import DonutChart3D from './3d/DonutChart3D';
import PGRQuickForm3D from './3d/PGRQuickForm3D';
import ReliefMap3D from './3d/ReliefMap3D';
import RecentActivityAndSales3D from './3d/RecentActivityAndSales3D';

interface MainOverviewDashboardProps {
  onNavigateTab: (tabId: string) => void;
  onOpenIndicators?: () => void;
  onOpenPatio?: () => void;
}

export default function MainOverviewDashboard({
  onNavigateTab,
  onOpenIndicators,
  onOpenPatio
}: MainOverviewDashboardProps) {
  return (
    <div className="space-y-4 pb-6 select-none">
      {/* 1. HERO SECTION & TOP 4 KPI CARDS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Hero Command Banner */}
        <div className="xl:col-span-7 card-3d-cinema-gold p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle warm amber lighting backdrop */}
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Tagline */}
            <div className="text-[11px] font-bold tracking-[0.2em] text-[#caa031] uppercase">
              A & B CAFÉ
            </div>

            {/* Main Headline in Bold Cinematic Typography */}
            <h1 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-[#fff7e6] tracking-tight leading-tight mt-1 max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Operação &amp; Inteligência em Tempo Real
            </h1>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#d8c2aa] mt-2 max-w-lg leading-relaxed">
              Central de comando integrada para acompanhamento de produção, rastreamento de frota, gestão de pátio e indicadores de vendas.
            </p>

            {/* CTA Buttons */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenIndicators || (() => onNavigateTab('controle'))}
                className="btn-3d-gold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
              >
                <Sparkles size={15} />
                <span>+ Ver Indicadores Operacionais</span>
              </button>

              <button
                onClick={onOpenPatio || (() => onNavigateTab('patio'))}
                className="btn-3d-glass px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
              >
                <Container size={15} className="text-[#caa031]" />
                <span>Monitorar Pátio (0 Veículos)</span>
              </button>
            </div>
          </div>

          {/* 3D Coffee Sack, Roasted Beans & Steaming Cup Visual */}
          <div className="mt-2 sm:mt-0 sm:absolute sm:right-2 sm:bottom-0 sm:w-72 lg:w-80 pointer-events-none">
            <HeroCoffeeVisual3D />
          </div>
        </div>

        {/* 4 Top KPI Stat Cards Grid */}
        <div className="xl:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
          <KPIStatCard3D type="operacoes" onClick={() => onNavigateTab('controle')} />
          <KPIStatCard3D type="colaboradores" onClick={() => onNavigateTab('presence')} />
          <KPIStatCard3D type="movimentacoes" onClick={() => onNavigateTab('controle')} />
          <KPIStatCard3D type="transportadoras" onClick={() => onNavigateTab('patio')} />
        </div>
      </div>

      {/* 2. MIDDLE ROW: 3D PRODUTIVIDADE + 3D MOVIMENTAÇÃO POR DESTINO + FORMULÁRIO PGR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chart 1: Produtividade da Operação (3D Golden Cylinders) */}
        <div className="lg:col-span-4 card-3d-cinema p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#3d2314] mb-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#3d2516] border border-[#e2ba61]/30 flex items-center justify-center text-[#ffe699]">
                  <TrendingUp size={12} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#f7ede1] leading-tight">
                    Produtividade da Operação
                  </h3>
                  <p className="text-[10px] text-[#a88d74]">Desempenho nas últimas 24 horas</p>
                </div>
              </div>

              {/* Operations Badge */}
              <div className="px-2 py-0.5 rounded-md bg-[#24150d] border border-[#e2ba61]/30 text-[10px] font-mono text-[#ffe699] font-bold">
                16/09 • 22 operações
              </div>
            </div>

            {/* 3D Cylinders Chart */}
            <div className="pt-2">
              <CylinderChart3D />
            </div>
          </div>
        </div>

        {/* Chart 2: Movimentação por Destino (3D Segmented Donut Ring) */}
        <div className="lg:col-span-4 card-3d-cinema p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#3d2314] mb-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#3d2516] border border-[#e2ba61]/30 flex items-center justify-center text-[#ffe699]">
                  <Layers size={12} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#f7ede1] leading-tight">
                    Movimentação por Destino
                  </h3>
                  <p className="text-[10px] text-[#a88d74]">Distribuição das cargas no período</p>
                </div>
              </div>
            </div>

            {/* 3D Segmented Donut Chart */}
            <div className="pt-1">
              <DonutChart3D onOpenComplete={() => onNavigateTab('controle')} />
            </div>
          </div>
        </div>

        {/* Form 3: Formulário de Controle PGR */}
        <div className="lg:col-span-4 card-3d-cinema-gold p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#3d2314] mb-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#3d2516] border border-[#e2ba61]/30 flex items-center justify-center text-[#ffe699]">
                  <ShieldCheck size={12} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#f7ede1] leading-tight">
                    Formulário de Controle PGR
                  </h3>
                  <p className="text-[10px] text-[#a88d74]">Preencha os dados para iniciar o controle</p>
                </div>
              </div>
            </div>

            {/* PGR Form Input fields */}
            <div className="pt-1">
              <PGRQuickForm3D onNavigateToFull={() => onNavigateTab('controle')} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM ROW: RASTREAMENTO DA FROTA 3D + ROTAS + ATIVIDADES + VENDAS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Rastreamento da Frota (3D Relief Map & Live status) */}
        <div className="xl:col-span-7 card-3d-cinema p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#3d2314] mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#3d2516] border border-[#e2ba61]/30 flex items-center justify-center text-[#ffe699]">
                  <Route size={12} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#f7ede1] leading-tight">
                    Rastreamento da Frota
                  </h3>
                  <p className="text-[10px] text-[#a88d74]">Posição dos veículos em tempo real</p>
                </div>
              </div>
            </div>

            {/* 3D Topographic Relief Map */}
            <ReliefMap3D onOpenRoutes={() => onNavigateTab('rotas')} />
          </div>
        </div>

        {/* Atividades Recentes & Últimas Vendas */}
        <div className="xl:col-span-5 flex flex-col justify-between">
          <RecentActivityAndSales3D 
            onOpenActivities={() => onNavigateTab('controle')}
            onOpenSales={() => onNavigateTab('patio')}
          />
        </div>
      </div>
    </div>
  );
}
