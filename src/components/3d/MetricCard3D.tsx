import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassPanel3D } from './GlassPanel3D';

interface MetricCard3DProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string | number;
    isUp: boolean;
  };
  icon?: LucideIcon;
  status?: 'normal' | 'warning' | 'critical' | 'info';
  className?: string;
  id?: string;
}

export function MetricCard3D({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  status = 'info',
  className,
  id
}: MetricCard3DProps) {
  const statusColors = {
    normal: {
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      led: 'led-status-green',
      glow: 'shadow-emerald-500/10'
    },
    warning: {
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      led: 'led-status-yellow',
      glow: 'shadow-amber-500/10'
    },
    critical: {
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
      led: 'led-status-red',
      glow: 'shadow-rose-500/10'
    },
    info: {
      border: 'border-sky-500/30',
      text: 'text-sky-400',
      bg: 'bg-sky-500/10',
      led: 'led-status-blue',
      glow: 'shadow-sky-500/10'
    }
  }[status];

  return (
    <GlassPanel3D
      id={id}
      className={cn("p-4.5 flex flex-col justify-between relative group", statusColors.border, className)}
      variant="metallic"
    >
      {/* Background Volumetric Glow */}
      <div className={cn("absolute -right-6 -bottom-6 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-35", statusColors.bg)} />

      {/* Header with LED & Title */}
      <div className="flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2 min-w-0">
          <span className={statusColors.led} />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 truncate">
            {title}
          </span>
        </div>
        {Icon && (
          <div className={cn("p-2 rounded-xl border border-slate-700/60 shrink-0", statusColors.bg, statusColors.text)}>
            <Icon size={16} className="stroke-[2.2]" />
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="my-2.5 z-10 flex items-baseline justify-between gap-2">
        <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
          {value}
        </div>

        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg border",
            trend.isUp
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/15 border-rose-500/30 text-rose-400"
          )}>
            {trend.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      {/* Subtitle / Footer detail */}
      {subtitle && (
        <div className="text-[10px] font-sans font-semibold text-slate-400/90 z-10 flex items-center justify-between">
          <span className="truncate">{subtitle}</span>
        </div>
      )}
    </GlassPanel3D>
  );
}
