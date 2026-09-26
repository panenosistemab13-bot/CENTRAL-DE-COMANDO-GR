import React from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  Truck, 
  ShieldCheck, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function MobileSlides({ onBack }: { onBack?: () => void }) {
  return (
    <div className="w-full min-h-screen bg-[#0d0603] text-[#f5ebd6] select-none pb-28">
      <div className="px-4 pt-3 space-y-4 max-w-full overflow-x-hidden">
        {/* EXECUTIVE BANNER */}
        <div className="w-full rounded-3xl bg-gradient-to-r from-[#B32025]/40 via-[#261308] to-[#1a0c05] border border-amber-500/30 p-4 shadow-xl">
          <span className="text-[9px] font-mono uppercase text-amber-400 block mb-0.5">
            Dashboard Executivo
          </span>
          <h3 className="text-base font-sans font-black text-white uppercase flex items-center gap-1.5">
            <Activity size={18} className="text-[#B32025]" />
            <span>Painel de Operações 3C</span>
          </h3>
          <p className="text-xs text-[#c2a67e] mt-1">
            Métricas de desempenho da frota própria e terceirizada em tempo real.
          </p>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1e0e06] to-[#120703] border border-amber-500/20 shadow-xl">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 mb-2">
              <Truck size={16} />
            </div>
            <span className="text-[10px] font-mono uppercase text-[#c2a67e] block">Frota em Viagem</span>
            <span className="text-2xl font-sans font-black text-white block mt-0.5">24</span>
            <span className="text-[10px] text-emerald-400 font-mono mt-1 block">▲ 96% no prazo</span>
          </div>

          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1e0e06] to-[#120703] border border-amber-500/20 shadow-xl">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 mb-2">
              <Clock size={16} />
            </div>
            <span className="text-[10px] font-mono uppercase text-[#c2a67e] block">Tempo Médio Doca</span>
            <span className="text-2xl font-sans font-black text-white block mt-0.5">1h 45m</span>
            <span className="text-[10px] text-amber-400 font-mono mt-1 block">Meta: &lt; 2h</span>
          </div>

          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1e0e06] to-[#120703] border border-amber-500/20 shadow-xl">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 mb-2">
              <ShieldCheck size={16} />
            </div>
            <span className="text-[10px] font-mono uppercase text-[#c2a67e] block">Sinistralidade</span>
            <span className="text-2xl font-sans font-black text-white block mt-0.5">0.0%</span>
            <span className="text-[10px] text-blue-400 font-mono mt-1 block">120 dias sem perdas</span>
          </div>

          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1e0e06] to-[#120703] border border-amber-500/20 shadow-xl">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-300 mb-2">
              <TrendingUp size={16} />
            </div>
            <span className="text-[10px] font-mono uppercase text-[#c2a67e] block">Volume Expedido</span>
            <span className="text-2xl font-sans font-black text-white block mt-0.5">480 Ton</span>
            <span className="text-[10px] text-[#c2a67e] font-mono mt-1 block">Hoje</span>
          </div>
        </div>

        {/* COMPLIANCE STATUS */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1e0e06] to-[#120703] border border-amber-500/20 shadow-xl space-y-2.5">
          <h4 className="text-xs font-sans font-black uppercase text-white flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>Conformidade Operacional</span>
          </h4>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[#c2a67e]">Checklists em Dia</span>
              <span className="text-emerald-400 font-bold">98.2%</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[#c2a67e]">Iscas Ativas &gt; 80% Bat.</span>
              <span className="text-emerald-400 font-bold">100%</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[#c2a67e]">Averbação Automática</span>
              <span className="text-emerald-400 font-bold">OPERACIONAL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
