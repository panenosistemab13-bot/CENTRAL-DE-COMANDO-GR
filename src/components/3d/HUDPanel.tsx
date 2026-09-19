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
    normal: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    warning: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    critical: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
    info: 'border-sky-500/30 text-sky-400 bg-sky-500/10'
  }[status];

  return (
    <GlassPanel3D id={id} className={cn("p-5 flex flex-col relative", className)} variant="metallic">
      {/* HUD Header Bar */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cn("p-1.5 rounded-lg border shrink-0", statusGlow)}>
            <Radio size={14} className="animate-pulse" />
          </div>
          <h2 className="text-sm font-black font-mono uppercase tracking-wider text-slate-100 truncate">
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
