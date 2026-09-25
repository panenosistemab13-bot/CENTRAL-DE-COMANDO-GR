import React from 'react';
import { GlassPanel3D } from './GlassPanel3D';
import { cn } from '../../lib/utils';
import { Shield, Radio } from 'lucide-react';

interface HUDPanelProps {
  title: string;
  badge?: string;
  status?: 'normal' | 'warning' | 'critical' | 'info';
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  id?: string;
}

export function HUDPanel({
  title,
  badge,
  status = 'info',
  children,
  className,
  headerAction,
  id
}: HUDPanelProps) {
  const statusGlow = {
    normal: 'border-emerald-300 text-emerald-800 bg-emerald-50',
    warning: 'border-amber-300 text-amber-800 bg-amber-50',
    critical: 'border-red-300 text-red-800 bg-red-50',
    info: 'border-[#d6ccbe] text-[#9b1526] bg-red-50/60'
  }[status];

  return (
    <GlassPanel3D id={id} className={cn("p-5 flex flex-col relative", className)} variant="default">
      {/* HUD Header Bar */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#e7dac9]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cn("p-1.5 rounded-lg border shrink-0", statusGlow)}>
            <Radio size={14} className="text-[#9b1526]" />
          </div>
          <h2 className="text-sm font-black font-mono uppercase tracking-wider text-stone-900 truncate">
            {title}
          </h2>
          {badge && (
            <span className={cn("text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border", statusGlow)}>
              {badge}
            </span>
          )}
        </div>

        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </div>

      {/* HUD Content Area */}
      <div className="flex-1 w-full">{children}</div>
    </GlassPanel3D>
  );
}
