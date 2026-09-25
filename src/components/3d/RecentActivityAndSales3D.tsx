import React from 'react';
import { Activity, ShoppingBag, ChevronRight, CheckCircle2, Truck, FileText, Coffee } from 'lucide-react';

interface RecentActivityAndSalesProps {
  onOpenActivities?: () => void;
  onOpenSales?: () => void;
}

export default function RecentActivityAndSales3D({ onOpenActivities, onOpenSales }: RecentActivityAndSalesProps) {
  const ACTIVITIES = [
    {
      id: '1',
      title: 'Novo pré-alerta gerado',
      desc: 'BRASÍLIA - TYQ6F51',
      time: '10:21',
      icon: Truck,
      iconColor: 'text-amber-400 bg-amber-950/60 border-amber-500/30'
    },
    {
      id: '2',
      title: 'Carga aprovada',
      desc: 'São Paulo - SP',
      time: '10:18',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30'
    },
    {
      id: '3',
      title: 'Motorista em rota',
      desc: 'JEFFERSON AUGUSTO',
      time: '10:12',
      icon: Activity,
      iconColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30'
    },
    {
      id: '4',
      title: 'Relatório importado',
      desc: '3 COR - BH',
      time: '09:56',
      icon: FileText,
      iconColor: 'text-amber-300 bg-amber-950/60 border-amber-500/30'
    }
  ];

  const SALES = [
    {
      id: '1',
      title: 'Café em Grãos 1kg',
      price: 'R$ 48,90',
      time: 'Hoje - 10:15',
      icon: Coffee,
      iconBg: 'bg-gradient-to-br from-[#caa031] to-[#6b4c10]'
    },
    {
      id: '2',
      title: 'Cappuccino Tradicional',
      price: 'R$ 12,90',
      time: 'Hoje - 09:42',
      icon: Coffee,
      iconBg: 'bg-gradient-to-br from-[#dfb14b] to-[#805814]'
    },
    {
      id: '3',
      title: 'Café Torrado 500g',
      price: 'R$ 28,90',
      time: 'Hoje - 08:27',
      icon: Coffee,
      iconBg: 'bg-gradient-to-br from-[#a67c24] to-[#4d3209]'
    },
    {
      id: '4',
      title: 'Acessório - Caneca',
      price: 'R$ 35,90',
      time: 'Hoje - 07:55',
      icon: ShoppingBag,
      iconBg: 'bg-gradient-to-br from-[#c49a6c] to-[#5a3a1f]'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full">
      {/* 1. Atividades Recentes */}
      <div className="card-3d-cinema p-3 sm:p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-[#3d2314] mb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#f7ede1]">
              <div className="w-5 h-5 rounded-md bg-[#3d2516] border border-[#e2ba61]/30 flex items-center justify-center text-[#ffe699]">
                <Activity size={12} />
              </div>
              <div>
                <span className="block leading-tight">Atividades Recentes</span>
                <span className="text-[10px] font-normal text-[#a88d74]">Últimas movimentações</span>
              </div>
            </div>
            <button
              onClick={onOpenActivities}
              className="text-[10px] font-bold text-[#e2ba61] hover:text-[#fff0b3] flex items-center gap-0.5 cursor-pointer"
            >
              Ver todas <ChevronRight size={11} />
            </button>
          </div>

          <div className="space-y-2">
            {ACTIVITIES.map((act) => {
              const Icon = act.icon;
              return (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-[#1a0f09] border border-[#3d2314] hover:border-[#e2ba61]/30 transition-all text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center border shrink-0 ${act.iconColor}`}>
                      <Icon size={12} />
                    </div>
                    <div className="truncate">
                      <div className="text-[11px] font-bold text-[#f7ede1] truncate">{act.title}</div>
                      <div className="text-[10px] text-[#a88d74] truncate">{act.desc}</div>
                    </div>
                  </div>
                  <div className="font-mono text-[10px] text-[#d8c2aa] shrink-0 pl-2">
                    {act.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Últimas Vendas */}
      <div className="card-3d-cinema p-3 sm:p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-[#3d2314] mb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#f7ede1]">
              <div className="w-5 h-5 rounded-md bg-[#3d2516] border border-[#e2ba61]/30 flex items-center justify-center text-[#ffe699]">
                <ShoppingBag size={12} />
              </div>
              <div>
                <span className="block leading-tight">Últimas Vendas</span>
                <span className="text-[10px] font-normal text-[#a88d74]">Produtos comercializados</span>
              </div>
            </div>
            <button
              onClick={onOpenSales}
              className="text-[10px] font-bold text-[#e2ba61] hover:text-[#fff0b3] flex items-center gap-0.5 cursor-pointer"
            >
              Ver todas <ChevronRight size={11} />
            </button>
          </div>

          <div className="space-y-2">
            {SALES.map((sale) => {
              const Icon = sale.icon;
              return (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-[#1a0f09] border border-[#3d2314] hover:border-[#e2ba61]/30 transition-all text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[#1a0f07] font-bold shadow-sm shrink-0 ${sale.iconBg}`}>
                      <Icon size={12} />
                    </div>
                    <div className="truncate">
                      <div className="text-[11px] font-bold text-[#f7ede1] truncate">{sale.title}</div>
                      <div className="text-[10px] text-[#a88d74] truncate">{sale.time}</div>
                    </div>
                  </div>
                  <div className="font-bold font-mono text-xs text-[#ffe699] shrink-0 pl-2">
                    {sale.price}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
