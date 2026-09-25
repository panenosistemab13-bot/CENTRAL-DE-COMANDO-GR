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
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    neutral: 'bg-stone-100 text-stone-700 border-stone-200'
  };

  return (
    <div className={cn("bg-[#fbf9f5] border border-[#d6ccbe] rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between overflow-hidden relative group hover:shadow-sm transition-all", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 block">
            {title}
          </span>
          <div className="text-xl sm:text-2xl font-mono font-black text-stone-900 leading-none tracking-tight">
            {value}
          </div>
        </div>

        {Icon && (
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
            style={{ 
              backgroundColor: `${iconColor}15`, 
              borderColor: `${iconColor}30`,
              color: iconColor 
            }}
          >
            <Icon size={18} />
          </div>
        )}
      </div>

      {(subtitle || badgeText || progress !== undefined) && (
        <div className="mt-3 pt-2 border-t border-[#e7dac9] flex items-center justify-between gap-2">
          {subtitle && (
            <span className="text-[10px] font-sans font-medium text-stone-500 truncate">
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
              <div className="flex-1 bg-stone-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: iconColor }}
                />
              </div>
              <span className="text-[9px] font-mono font-bold text-stone-600">{progress}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
