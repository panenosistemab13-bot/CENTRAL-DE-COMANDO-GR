import React from 'react';
import { Crown, Trophy, TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassPanel3D } from './GlassPanel3D';

export interface PodiumItem {
  rank: 1 | 2 | 3;
  name: string;
  subtitle?: string;
  value: string | number;
  badge?: string;
  trend?: string;
  unit?: string;
}

interface Podium3DProps {
  title?: string;
  subtitle?: string;
  items: PodiumItem[];
  className?: string;
}

export function Podium3D({
  title = "RANKING DE DESTAQUES OPERACIONAIS",
  subtitle = "Principais destinos e unidades monitoradas no período",
  items,
  className
}: Podium3DProps) {
  // Sort or extract rank 1, 2, 3
  const first = items.find(i => i.rank === 1) || items[0];
  const second = items.find(i => i.rank === 2) || items[1];
  const third = items.find(i => i.rank === 3) || items[2];

  return (
    <GlassPanel3D className={cn("p-6 flex flex-col justify-between relative overflow-hidden", className)} variant="glow">
      {/* Subtle background ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={16} className="text-amber-400 animate-pulse" />
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-400">
              PGR 3D PODIUM LEADERBOARD
            </span>
          </div>
          <h3 className="text-lg font-mono font-black uppercase text-white tracking-tight flex items-center gap-2">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-400 font-sans mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase shrink-0">
          <Sparkles size={14} /> TOP OPERAÇÕES
        </div>
      </div>

      {/* Podium Display Arena */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end relative z-10 pt-8 pb-4">
        
        {/* RANK 2 - SILVER (LEFT) */}
        {second && (
          <div className="flex flex-col items-center group cursor-pointer transition-transform hover:-translate-y-1">
            {/* Rank Badge & Crown */}
            <div className="relative flex flex-col items-center mb-2">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 p-0.5 shadow-[0_0_15px_rgba(203,213,225,0.4)] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-slate-200 font-black font-mono text-sm">
                  <Crown size={18} className="text-slate-300" />
                </div>
              </div>
              <span className="absolute -bottom-2 bg-slate-300 text-slate-950 font-mono font-black text-[10px] px-2 py-0.5 rounded-full shadow-md uppercase">
                2º
              </span>
            </div>

            <div className="text-center mt-2 max-w-[120px]">
              <h4 className="font-mono font-bold text-xs text-white truncate" title={second.name}>
                {second.name}
              </h4>
              {second.subtitle && (
                <span className="text-[10px] font-sans text-slate-400 block truncate">{second.subtitle}</span>
              )}
              <div className="mt-1 font-mono font-black text-sm text-slate-200">
                {second.value}
              </div>
              {second.trend && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded-md mt-1">
                  <TrendingUp size={10} /> {second.trend}
                </span>
              )}
            </div>

            {/* 3D Metallic Cylinder Base - Rank 2 */}
            <div className="w-full h-28 sm:h-36 mt-3 rounded-t-2xl bg-gradient-to-b from-slate-400 via-slate-700 to-slate-900 border-t-2 border-slate-300 shadow-[0_15px_30px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.3)] relative overflow-hidden flex flex-col items-center justify-center">
              <div className="absolute inset-x-0 top-0 h-1 bg-white/40" />
              <div className="text-4xl font-mono font-black text-slate-400/20 select-none">#2</div>
              <div className="absolute bottom-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">SILVER</div>
            </div>
          </div>
        )}

        {/* RANK 1 - GOLD (CENTER - ELEVATED) */}
        {first && (
          <div className="flex flex-col items-center group cursor-pointer transition-transform hover:-translate-y-1 z-20">
            {/* Rank Badge & Crown */}
            <div className="relative flex flex-col items-center mb-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 p-0.5 shadow-[0_0_25px_rgba(245,158,11,0.6)] flex items-center justify-center animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-amber-400 font-black font-mono text-base">
                  <Crown size={24} className="text-amber-400 drop-shadow-[0_0_8px_#f59e0b]" />
                </div>
              </div>
              <span className="absolute -bottom-2.5 bg-amber-400 text-slate-950 font-mono font-black text-xs px-2.5 py-0.5 rounded-full shadow-lg uppercase tracking-wider">
                1º LÍDER
              </span>
            </div>

            <div className="text-center mt-3 max-w-[140px]">
              <h4 className="font-mono font-black text-sm text-amber-300 truncate" title={first.name}>
                {first.name}
              </h4>
              {first.subtitle && (
                <span className="text-[10px] font-sans text-slate-300 block truncate">{first.subtitle}</span>
              )}
              <div className="mt-1 font-mono font-black text-base text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                {first.value}
              </div>
              {first.trend && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-extrabold text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-md mt-1 shadow-md">
                  <TrendingUp size={11} /> {first.trend}
                </span>
              )}
            </div>

            {/* 3D Metallic Cylinder Base - Rank 1 (Gold) */}
            <div className="w-full h-36 sm:h-48 mt-3 rounded-t-2xl bg-gradient-to-b from-amber-500 via-amber-700 to-slate-950 border-t-2 border-yellow-300 shadow-[0_20px_40px_rgba(245,158,11,0.3),inset_0_2px_6px_rgba(255,255,255,0.5)] relative overflow-hidden flex flex-col items-center justify-center">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-yellow-200/60" />
              <div className="text-6xl font-mono font-black text-amber-400/25 select-none">#1</div>
              <div className="absolute bottom-2 text-[10px] font-mono font-black text-amber-300 uppercase tracking-widest">GOLD OPERAÇÃO</div>
            </div>
          </div>
        )}

        {/* RANK 3 - BRONZE (RIGHT) */}
        {third && (
          <div className="flex flex-col items-center group cursor-pointer transition-transform hover:-translate-y-1">
            {/* Rank Badge & Crown */}
            <div className="relative flex flex-col items-center mb-2">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-amber-600 via-orange-700 to-amber-900 p-0.5 shadow-[0_0_15px_rgba(217,119,6,0.4)] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-amber-600 font-black font-mono text-sm">
                  <Crown size={18} className="text-amber-600" />
                </div>
              </div>
              <span className="absolute -bottom-2 bg-amber-700 text-slate-100 font-mono font-black text-[10px] px-2 py-0.5 rounded-full shadow-md uppercase">
                3º
              </span>
            </div>

            <div className="text-center mt-2 max-w-[120px]">
              <h4 className="font-mono font-bold text-xs text-white truncate" title={third.name}>
                {third.name}
              </h4>
              {third.subtitle && (
                <span className="text-[10px] font-sans text-slate-400 block truncate">{third.subtitle}</span>
              )}
              <div className="mt-1 font-mono font-black text-sm text-slate-200">
                {third.value}
              </div>
              {third.trend && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded-md mt-1">
                  <TrendingUp size={10} /> {third.trend}
                </span>
              )}
            </div>

            {/* 3D Metallic Cylinder Base - Rank 3 */}
            <div className="w-full h-24 sm:h-32 mt-3 rounded-t-2xl bg-gradient-to-b from-amber-700 via-amber-900 to-slate-950 border-t-2 border-amber-500 shadow-[0_15px_30px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.2)] relative overflow-hidden flex flex-col items-center justify-center">
              <div className="absolute inset-x-0 top-0 h-1 bg-amber-400/30" />
              <div className="text-4xl font-mono font-black text-amber-600/20 select-none">#3</div>
              <div className="absolute bottom-2 text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest">BRONZE</div>
            </div>
          </div>
        )}

      </div>
    </GlassPanel3D>
  );
}
