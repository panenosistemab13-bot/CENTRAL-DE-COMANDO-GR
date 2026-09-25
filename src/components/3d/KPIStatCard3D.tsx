import React from 'react';
import { Truck, Users2, Package, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface KPIProps {
  type: 'operacoes' | 'colaboradores' | 'movimentacoes' | 'transportadoras';
  onClick?: () => void;
}

export default function KPIStatCard3D({ type, onClick }: KPIProps) {
  switch (type) {
    case 'operacoes':
      return (
        <motion.div
          whileHover={{ y: -3, scale: 1.015 }}
          onClick={onClick}
          className="card-3d-stat p-3 sm:p-4 flex flex-col justify-between relative overflow-hidden cursor-pointer group"
        >
          {/* Subtle gold corner ambient glow */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-2 text-[#d8c2aa] text-xs font-semibold">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#3d2516] to-[#1c1008] border border-[#e2ba61]/30 flex items-center justify-center text-[#ffe699] shadow-inner shrink-0">
              <Truck size={15} />
            </div>
            <span className="truncate">Total de Operações</span>
          </div>

          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-extrabold text-2xl sm:text-3xl font-heading text-[#ffe699] tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              65
            </span>
            <div className="flex items-center gap-0.5 text-emerald-400 font-bold text-xs bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded-md">
              <ArrowUpRight size={13} />
              <span>+12,5%</span>
            </div>
          </div>

          <div className="mt-1 text-[10px] text-[#a88d74] truncate">
            vs. período anterior
          </div>
        </motion.div>
      );

    case 'colaboradores':
      return (
        <motion.div
          whileHover={{ y: -3, scale: 1.015 }}
          onClick={onClick}
          className="card-3d-stat p-3 sm:p-4 flex flex-col justify-between relative overflow-hidden cursor-pointer group"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-2 text-[#d8c2aa] text-xs font-semibold">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#3d2516] to-[#1c1008] border border-[#e2ba61]/30 flex items-center justify-center text-[#ffe699] shadow-inner shrink-0">
              <Users2 size={15} />
            </div>
            <span className="truncate">Colaboradores</span>
          </div>

          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-extrabold text-2xl sm:text-3xl font-heading text-[#ffe699] tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              19
            </span>
            <div className="flex items-center gap-1 text-cyan-300 font-bold text-xs bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>100% SACA</span>
            </div>
          </div>

          <div className="mt-1 text-[10px] text-[#a88d74] truncate">
            em atividade
          </div>
        </motion.div>
      );

    case 'movimentacoes':
      return (
        <motion.div
          whileHover={{ y: -3, scale: 1.015 }}
          onClick={onClick}
          className="card-3d-stat p-3 sm:p-4 flex flex-col justify-between relative overflow-hidden cursor-pointer group"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-2 text-[#d8c2aa] text-xs font-semibold">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#3d2516] to-[#1c1008] border border-[#e2ba61]/30 flex items-center justify-center text-[#ffe699] shadow-inner shrink-0">
              <Package size={15} />
            </div>
            <span className="truncate">Movimentações</span>
          </div>

          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-extrabold text-2xl sm:text-3xl font-heading text-[#ffe699] tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              368
            </span>
            <div className="flex items-center gap-0.5 text-emerald-400 font-bold text-xs bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded-md">
              <ArrowUpRight size={13} />
              <span>+4,8%</span>
            </div>
          </div>

          <div className="mt-1 text-[10px] text-[#a88d74] truncate">
            vs. período anterior
          </div>
        </motion.div>
      );

    case 'transportadoras':
      return (
        <motion.div
          whileHover={{ y: -3, scale: 1.015 }}
          onClick={onClick}
          className="card-3d-stat p-3 sm:p-4 flex flex-col justify-between relative overflow-hidden cursor-pointer group"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-2 text-[#d8c2aa] text-xs font-semibold">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#3d2516] to-[#1c1008] border border-[#e2ba61]/30 flex items-center justify-center text-[#ffe699] shadow-inner shrink-0">
              <Truck size={15} />
            </div>
            <span className="truncate">Transportadoras</span>
          </div>

          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-extrabold text-2xl sm:text-3xl font-heading text-[#ffe699] tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              12
            </span>
            <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded-md">
              <span>ativas</span>
            </div>
          </div>

          <div className="mt-1 text-[10px] text-[#a88d74] truncate">
            operando na frota
          </div>
        </motion.div>
      );
  }
}
