import React from 'react';
import { GlassPanel3D } from './GlassPanel3D';
import { cn } from '../../lib/utils';
import { BarChart3, Activity } from 'lucide-react';

interface ChartPanel3DProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function ChartPanel3D({
  title,
  subtitle,
  action,
  children,
  className,
  id
}: ChartPanel3DProps) {
  return (
    <GlassPanel3D id={id} className={cn("p-5 flex flex-col justify-between relative", className)} variant="metallic">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 z-10 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <BarChart3 size={16} />
          </div>
          <div>
            <h3 className="text-sm font-black font-mono uppercase tracking-wide text-white flex items-center gap-2">
              {title}
              <Activity size={12} className="text-sky-400 animate-pulse" />
            </h3>
            {subtitle && (
              <p className="text-[11px] font-sans font-medium text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Chart Body with High-Tech Grid Accent */}
      <div className="flex-1 w-full relative hud-grid-bg rounded-xl border border-slate-800/50 p-2 min-h-[180px] flex items-center justify-center">
        {children}
      </div>
    </GlassPanel3D>
  );
}
