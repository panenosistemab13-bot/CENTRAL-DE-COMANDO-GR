import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface PremiumStatChartProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badgeText?: string;
  badgeType?: 'success' | 'danger' | 'warning' | 'neutral';
  progress?: number;
  icon?: LucideIcon;
  iconColor?: string;
  className?: string;
}

export default function PremiumStatChart({
  title,
  value,
  subtitle,
  badgeText,
  badgeType = 'neutral',
  progress,
  icon: Icon,
  iconColor = '#9b1526',
  className
}: PremiumStatChartProps) {
  const badgeClasses = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.2)]',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)]',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.2)]',
    neutral: 'bg-white/5 text-[#faeed7] border-white/10'
  };

  return (
    <div className={cn("bg-[#131118]/70 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-xl flex flex-col justify-between overflow-hidden relative group hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)] transition-all", className)}>
      <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none" />
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 block">
            {title}
          </span>
          <div className="text-xl sm:text-2xl font-mono font-black text-white leading-none tracking-tight">
            {value}
          </div>
        </div>

        {Icon && (
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 shadow-md group-hover:scale-105 transition-transform"
            style={{ 
              backgroundColor: `${iconColor}20`, 
              borderColor: `${iconColor}40`,
              color: iconColor,
              filter: `drop-shadow(0 0 6px ${iconColor}40)`
            }}
          >
            <Icon size={18} />
          </div>
        )}
      </div>

      {(subtitle || badgeText || progress !== undefined) && (
        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between gap-2">
          {subtitle && (
            <span className="text-[10px] font-sans font-medium text-stone-400 truncate">
              {subtitle}
            </span>
          )}

          {badgeText && (
            <span className={cn("px-2 py-0.5 rounded-md border text-[9px] font-mono font-bold uppercase tracking-wider shrink-0", badgeClasses[badgeType])}>
              {badgeText}
            </span>
          )}

          {progress !== undefined && (
            <div className="w-full flex items-center gap-2 mt-1">
              <div className="flex-1 bg-white/5 border border-white/5 h-1.5 rounded-full overflow-hidden p-[1px]">
                <div 
                  className="h-full rounded-full transition-all duration-1000 shadow-[0_0_6px_rgba(255,255,255,0.4)]"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: iconColor }}
                />
              </div>
              <span className="text-[9px] font-mono font-bold text-stone-400">{progress}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
